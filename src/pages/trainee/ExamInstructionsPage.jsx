import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import { getQuestionsBySkills } from "@/services/applicationService";
import { getTraineeSkills } from "@/services/traineeService";
import { notify } from "@/utils/notify";
import { useAuthStore } from "@/store/authStore";

const toNumberOrNull = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeSkillName = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const flattenQuestions = (
  responseData,
  requiredSkillIds = [],
  requiredSkillNames = [],
) => {
  const payload = responseData?.data || responseData || {};
  const requiredSkillSet = new Set(
    Array.isArray(requiredSkillIds)
      ? requiredSkillIds.map((skillId) => Number(skillId)).filter(Boolean)
      : [],
  );
  const requiredSkillNameSet = new Set(
    Array.isArray(requiredSkillNames)
      ? requiredSkillNames.map(normalizeSkillName).filter(Boolean)
      : [],
  );

  const normalizeQuestion = (
    question,
    index,
    fallbackSkillId = null,
    fallbackSkillName = "",
  ) => {
    const skillId =
      toNumberOrNull(question?.skill_id) ??
      toNumberOrNull(question?.skillId) ??
      toNumberOrNull(fallbackSkillId);
    const skillName =
      question?.skill_name ||
      question?.skillName ||
      (Number.isNaN(Number(fallbackSkillName)) ? fallbackSkillName : "");
    const questionId =
      toNumberOrNull(question?.id) ??
      toNumberOrNull(question?.question_id) ??
      toNumberOrNull(question?.questionId) ??
      skillId;
    const uiId =
      question?.id ||
      question?.question_id ||
      question?.questionId ||
      `${skillId || "q"}-${index + 1}`;

    return {
      id: uiId,
      questionId,
      skillId,
      skillName,
      text:
        question.question_text || question.question || `Question ${index + 1}`,
      options: Array.isArray(question.options)
        ? question.options.map((option, optionIndex) =>
            typeof option === "string"
              ? {
                  id: optionIndex + 1,
                  label: option,
                  value: option,
                }
              : {
                  id: option.id || option.option_id || optionIndex + 1,
                  label: option.option_text || option.text || String(option),
                  value: option.option_text || option.text || String(option),
                },
          )
        : [],
      type: "mcq",
    };
  };

  const filterByRequiredSkills = (questionsList) => {
    if (!requiredSkillSet.size) {
      return questionsList;
    }

    return questionsList.filter((question) => {
      const skillId = Number(question?.skillId);
      const questionId = Number(question?.questionId);
      const normalizedQuestionSkillName = normalizeSkillName(
        question?.skillName,
      );

      const matchesById =
        requiredSkillSet.has(skillId) || requiredSkillSet.has(questionId);
      const matchesByName =
        requiredSkillNameSet.size > 0 &&
        normalizedQuestionSkillName &&
        requiredSkillNameSet.has(normalizedQuestionSkillName);

      return matchesById || matchesByName;
    });
  };

  if (Array.isArray(payload?.questions)) {
    const normalizedQuestions = payload.questions.map((question, index) =>
      normalizeQuestion(question, index),
    );
    return filterByRequiredSkills(normalizedQuestions);
  }

  if (payload && typeof payload === "object") {
    const groupedQuestions = Object.entries(payload).flatMap(
      ([groupSkillId, skillQuestions]) =>
        Array.isArray(skillQuestions)
          ? skillQuestions.map((question, index) =>
              normalizeQuestion(question, index, groupSkillId, groupSkillId),
            )
          : [],
    );
    return filterByRequiredSkills(groupedQuestions);
  }

  return [];
};

const ExamInstructionsPage = () => {
  const { assessmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isStarting, setIsStarting] = useState(false);

  const internship = location.state?.internship;
  const traineeId = Number(location.state?.traineeId || user?.id);
  const examId = Number(location.state?.examId || assessmentId);
  const requiredSkills = useMemo(
    () => internship?.requiredSkillIds || [],
    [internship?.requiredSkillIds],
  );

  const handleStartAssessment = async () => {
    if (!traineeId) {
      notify.error("Trainee account not found. Please sign in again.");
      return;
    }

    if (!requiredSkills.length) {
      notify.error("No required skills found for this internship.");
      return;
    }

    setIsStarting(true);
    try {
      const savedSkillsResponse = await getTraineeSkills(traineeId);
      const savedSkills =
        savedSkillsResponse?.data?.skills ??
        savedSkillsResponse?.skills ??
        savedSkillsResponse?.data ??
        savedSkillsResponse ??
        [];

      const normalizedSavedSkills = [];

      if (Array.isArray(savedSkills)) {
        for (const item of savedSkills) {
          const normalizedSkill =
            typeof item === "string"
              ? item.trim().toLowerCase()
              : String(item?.name ?? item?.skill_name ?? "")
                  .trim()
                  .toLowerCase();

          if (normalizedSkill) {
            normalizedSavedSkills.push(normalizedSkill);
          }
        }
      }

      if (!normalizedSavedSkills.length) {
        notify.info(
          "Please save your skills in profile first to start the assessment.",
        );
        navigate("/trainee/profile", { state: { from: location.pathname } });
        return;
      }

      const internshipSkillNames = Array.isArray(internship?.skills)
        ? internship.skills
            .map((skill) =>
              String(skill || "")
                .trim()
                .toLowerCase(),
            )
            .filter(Boolean)
        : [];
      const savedSet = new Set(normalizedSavedSkills);
      const hasMatch = internshipSkillNames.some((skill) =>
        savedSet.has(skill),
      );

      if (!hasMatch) {
        notify.info(
          "Assessment is locked until you have at least one matching required skill.",
        );
        return;
      }

      const internshipId = Number(internship?.id ?? internship?.internship_id);
      if (!Number.isFinite(internshipId)) {
        throw new Error("Internship context is missing. Please start again.");
      }

      const questionsResponse = await getQuestionsBySkills(
        requiredSkills,
        internshipId,
      );
      const questions = flattenQuestions(
        questionsResponse,
        requiredSkills,
        internship?.skills,
      );
      const questionsExamId = Number(
        questionsResponse?.data?.exam_id ??
          questionsResponse?.exam_id ??
          examId,
      );

      if (!questions.length) {
        throw new Error(
          "No assessment questions were returned for this internship.",
        );
      }

      navigate(`/trainee/exam/${assessmentId}`, {
        state: {
          internship,
          traineeId,
          examId: Number.isFinite(questionsExamId) ? questionsExamId : examId,
          requiredSkillIds: requiredSkills,
          questions,
        },
      });
    } catch (error) {
      notify.error(error?.message, "Failed to load assessment questions.");
    } finally {
      setIsStarting(false);
    }
  };

  if (!internship) {
    return (
      <Card>
        Assessment context not found. Start from internship details page.
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">{internship.title} Assessment</h1>
      <p className="text-slate-600">
        Complete the assessment first, then proceed to the coding exam.
      </p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
        <li>This stage is MCQ-based and tied to internship required skills.</li>
        <li>Each question has one best answer.</li>
        <li>After submitting, you will continue to the coding exam editor.</li>
      </ul>
      <div className="flex flex-wrap gap-2">
        <Button disabled={isStarting} onClick={handleStartAssessment}>
          {isStarting ? "Preparing..." : "Start Assessment"}
        </Button>
        <Link to="/trainee/internships">
          <Button variant="ghost">Back</Button>
        </Link>
      </div>
    </Card>
  );
};

export default ExamInstructionsPage;
