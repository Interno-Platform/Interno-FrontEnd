import { useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import { submitQuizAnswers } from "@/services/traineeService";
import { notify } from "@/utils/notify";

const getDraftStorageKey = (assessmentId, traineeId) =>
  `exam-draft:${assessmentId}:${traineeId || "guest"}`;

const readDraftState = (assessmentId, traineeId) => {
  try {
    const raw = sessionStorage.getItem(
      getDraftStorageKey(assessmentId, traineeId),
    );
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

const saveDraftState = (assessmentId, traineeId, draft) => {
  try {
    sessionStorage.setItem(
      getDraftStorageKey(assessmentId, traineeId),
      JSON.stringify(draft),
    );
  } catch {
    // Ignore storage failures and keep in-memory state only.
  }
};

const clearDraftState = (assessmentId, traineeId) => {
  try {
    sessionStorage.removeItem(getDraftStorageKey(assessmentId, traineeId));
  } catch {
    // Ignore storage failures.
  }
};

const isDuplicateQuizSubmissionError = (error) => {
  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("already submitted") ||
    message.includes("one submission is allowed")
  );
};

const extractQuizScore = (payload) => {
  const candidates = [
    payload?.data?.score,
    payload?.score,
    payload?.data?.quizScore,
    payload?.quizScore,
    payload?.data?.result?.score,
    payload?.result?.score,
  ];

  for (const candidate of candidates) {
    const numericValue = Number(candidate);
    if (Number.isFinite(numericValue)) {
      return numericValue;
    }
  }

  return null;
};

const TraineeExamPage = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const questions = useMemo(
    () => location.state?.questions || [],
    [location.state?.questions],
  );
  const internship = location.state?.internship || null;
  const traineeId = Number(location.state?.traineeId);
  const examId = Number(location.state?.examId || assessmentId);
  const internshipId = Number(internship?.id ?? internship?.internship_id);
  const draftState = readDraftState(assessmentId, traineeId);

  const [index, setIndex] = useState(() =>
    Number.isInteger(draftState?.index) && draftState.index >= 0
      ? draftState.index
      : 0,
  );
  const [answers, setAnswers] = useState(() =>
    draftState?.answers && typeof draftState.answers === "object"
      ? draftState.answers
      : {},
  );
  const [flagged, setFlagged] = useState(() =>
    draftState?.flagged && typeof draftState.flagged === "object"
      ? draftState.flagged
      : {},
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasSubmittedRef = useRef(false);

  if (!questions.length) {
    return (
      <Card className="mx-auto max-w-3xl">
        Assessment not found. Please start from internship details page.
      </Card>
    );
  }

  const question = questions[index];
  const progress = Math.round(
    (Object.keys(answers).length / questions.length) * 100,
  );

  const setAnswer = (value) => {
    setAnswers((prev) => {
      const next = { ...prev, [question.id]: value };
      saveDraftState(assessmentId, traineeId, {
        index,
        answers: next,
        flagged,
      });
      return next;
    });
  };

  const setCurrentIndex = (nextIndex) => {
    setIndex(nextIndex);
    saveDraftState(assessmentId, traineeId, {
      index: nextIndex,
      answers,
      flagged,
    });
  };

  const toggleFlag = () => {
    setFlagged((prev) => {
      const next = { ...prev, [question.id]: !prev[question.id] };
      saveDraftState(assessmentId, traineeId, {
        index,
        answers,
        flagged: next,
      });
      return next;
    });
  };

  const buildQuizAnswersPayload = (
    answersMap = answers,
    questionsList = questions,
  ) =>
    questionsList
      .filter(
        (item) =>
          answersMap[item.id] !== undefined && answersMap[item.id] !== "",
      )
      .map((item) => {
        const selectedValue = answersMap[item.id];
        const selectedOption = item.options.find(
          (option) =>
            option.value === selectedValue || option.label === selectedValue,
        );
        const resolvedQuestionId = Number(
          item.questionId ?? item.id ?? item.skillId,
        );
        const fallbackOptionId = Number(selectedValue);
        const resolvedSelectedOptionId = Number(
          selectedOption?.id ??
            selectedOption?.option_id ??
            (Number.isFinite(fallbackOptionId) ? fallbackOptionId : NaN),
        );

        return {
          questionId: Number.isFinite(resolvedQuestionId)
            ? resolvedQuestionId
            : item.id,
          selectedOptionId: Number.isFinite(resolvedSelectedOptionId)
            ? resolvedSelectedOptionId
            : null,
        };
      });

  const persistQuizCompletion = async ({
    silent = false,
    answersMap = answers,
    questionsList = questions,
    requireAllAnswered = false,
  } = {}) => {
    if (!traineeId || !examId || hasSubmittedRef.current) {
      return null;
    }

    const payload = buildQuizAnswersPayload(answersMap, questionsList);
    if (!payload.length) {
      return null;
    }

    if (requireAllAnswered && payload.length !== questionsList.length) {
      throw new Error("Please answer all questions before submitting.");
    }

    const answeredCount = payload.length;

    let submitResponse = null;

    try {
      submitResponse = await submitQuizAnswers(
        traineeId,
        examId,
        payload,
        Number.isFinite(internshipId) ? internshipId : undefined,
      );
    } catch (error) {
      if (!isDuplicateQuizSubmissionError(error)) {
        throw error;
      }
    }

    const scoreFromSubmit =
      extractQuizScore(submitResponse) ??
      Math.round((answeredCount / questionsList.length) * 100);

    const completionResponse = submitResponse?.data ?? submitResponse ?? null;

    hasSubmittedRef.current = true;
    clearDraftState(assessmentId, traineeId);

    if (!silent) {
      notify.success("Assessment submitted. Continue to coding exam.");
    }

    return {
      answeredCount,
      quizScore: scoreFromSubmit,
      quizCompletion: completionResponse?.data ?? completionResponse ?? null,
      payload,
    };
  };

  const submitExam = async () => {
    if (!traineeId || !examId) {
      notify.error("Missing trainee or exam context.");
      return;
    }

    setIsSubmitting(true);
    try {
      const localPayload = buildQuizAnswersPayload();
      if (!localPayload.length || localPayload.length !== questions.length) {
        throw new Error("Please answer all questions before submitting.");
      }

      const persisted = await persistQuizCompletion({
        requireAllAnswered: true,
      });
      const finalAnsweredCount =
        persisted?.answeredCount ?? localPayload.length;
      const finalQuizScore =
        persisted?.quizScore ??
        Math.round((finalAnsweredCount / questions.length) * 100);

      navigate(`/trainee/exam/${assessmentId}/result`, {
        state: {
          stage: "quiz",
          assessmentId,
          internship,
          traineeId,
          examId,
          quizScore: finalQuizScore,
          quizCompletion: persisted?.quizCompletion ?? null,
          answeredCount: finalAnsweredCount,
          totalQuestions: questions.length,
        },
      });
    } catch (error) {
      notify.error(error?.message, "Failed to submit assessment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-white md:p-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <header className="rounded-xl bg-slate-900 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="font-semibold">
              {internship?.title
                ? `${internship.title} Assessment`
                : "Assessment"}
            </h1>
            <p>
              Question {index + 1} of {questions.length}
            </p>
          </div>
          <div className="mt-3 h-2 rounded bg-slate-700">
            <div
              className="h-full rounded bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>

        <Card className="text-slate-900">
          <p className="font-semibold">{question.text}</p>
          <div className="mt-4 space-y-2">
            {question.options.map((option) => (
              <label
                key={`${question.id}-${option.id}`}
                className="flex items-center gap-2 rounded border p-2"
              >
                <input
                  checked={answers[question.id] === option.value}
                  name={String(question.id)}
                  onChange={() => setAnswer(option.value)}
                  type="radio"
                />
                {option.label}
              </label>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button
              disabled={index === 0}
              onClick={() => setCurrentIndex(index - 1)}
              variant="ghost"
            >
              Previous
            </Button>
            <Button
              disabled={index === questions.length - 1}
              onClick={() => setCurrentIndex(index + 1)}
              variant="ghost"
            >
              Next
            </Button>
            <Button onClick={toggleFlag} variant="ghost">
              {flagged[question.id] ? "Unflag" : "Flag"}
            </Button>
            <Button
              className="ml-auto"
              disabled={isSubmitting}
              onClick={submitExam}
            >
              {isSubmitting ? "Submitting..." : "Submit Assessment"}
            </Button>
          </div>
        </Card>

        <div className="flex flex-wrap gap-2">
          {questions.map((item, itemIndex) => {
            const answeredItem = Boolean(answers[item.id]);
            const isFlagged = Boolean(flagged[item.id]);
            return (
              <button
                key={item.id}
                className={`h-9 w-9 rounded text-xs ${answeredItem ? "bg-emerald-600" : "bg-slate-700"} ${
                  isFlagged ? "ring-2 ring-amber-400" : ""
                }`}
                onClick={() => setCurrentIndex(itemIndex)}
                type="button"
              >
                {itemIndex + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TraineeExamPage;
