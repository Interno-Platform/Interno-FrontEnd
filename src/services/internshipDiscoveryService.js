import { getInternships } from "@/services/companyService";
import { getAllSkills } from "@/services/skillsService";

const toBoolean = (value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  }

  return false;
};

const parseSkillIds = (value) => {
  if (Array.isArray(value)) {
    return value.map((skillId) => Number(skillId)).filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(",")
      .map((skillId) => Number(skillId.trim()))
      .filter(Boolean);
  }

  return [];
};

const toSkillMap = (skillsList) =>
  skillsList.reduce((acc, item) => {
    const id = Number(item?.id ?? item?.skill_id);
    const name = item?.name ?? item?.skill_name;
    if (id && name) {
      acc[id] = name;
    }
    return acc;
  }, {});

const resolveSkillNames = (skillIds, skillMap) =>
  skillIds.map((skillId) => skillMap[Number(skillId)]).filter(Boolean);

const getExamId = (item, fallbackId) => {
  const examId = Number(item?.exam_id ?? item?.examId ?? fallbackId);
  return Number.isFinite(examId) && examId > 0 ? examId : Number(fallbackId);
};

export const resolveInternshipProgress = (item = {}) => {
  const hasApplied = toBoolean(
    item?.has_apply ??
      item?.hasApply ??
      item?.application_submitted ??
      item?.applied,
  );
  const quizCompleted = toBoolean(item?.quiz_completed ?? item?.quizCompleted);
  const techCompleted = toBoolean(item?.tech_completed ?? item?.techCompleted);

  if (!hasApplied) {
    return {
      key: "application",
      label: "Not applied",
      actionLabel: "Start application",
      routeType: "details",
    };
  }

  if (!quizCompleted) {
    return {
      key: "quiz",
      label: "Quiz pending",
      actionLabel: "Continue quiz",
      routeType: "quiz",
    };
  }

  if (!techCompleted) {
    return {
      key: "tech",
      label: "Tech exam pending",
      actionLabel: "Continue coding exam",
      routeType: "tech",
    };
  }

  return {
    key: "completed",
    label: "Completed",
    actionLabel: "View applications",
    routeType: "applications",
  };
};

export const getInternshipJourneyTarget = (internship, traineeId) => {
  const progress = resolveInternshipProgress(internship);
  const internshipId = Number(internship?.id ?? internship?.internship_id);
  const examId = getExamId(internship, internshipId);

  if (progress.routeType === "quiz") {
    return {
      to: `/trainee/assessments/${examId}/instructions`,
      state: { internship, traineeId, examId },
      progress,
    };
  }

  if (progress.routeType === "tech") {
    return {
      to: `/trainee/exam/${examId}/code`,
      state: { internship, traineeId, examId },
      progress,
    };
  }

  if (progress.routeType === "applications") {
    return {
      to: "/trainee/applications",
      state: { internship },
      progress,
    };
  }

  return {
    to: `/trainee/internships/${internshipId}`,
    state: { internship },
    progress,
  };
};

const normalizeInternship = (item, companyName, skillMap) => {
  const skillIds = parseSkillIds(item?.required_skills ?? item?.skills);
  const skillNames = resolveSkillNames(skillIds, skillMap);
  const id = Number(item?.id ?? item?.internship_id);
  const progress = resolveInternshipProgress(item);

  return {
    id,
    title: item?.title || "Untitled Internship",
    description: item?.description || "",
    summary: item?.description || "",
    company: companyName || item?.company_name || "Unknown Company",
    status: item?.status || "pending",
    duration_weeks: Number(item?.duration_weeks) || 0,
    duration: item?.duration_weeks ? `${item.duration_weeks} weeks` : "N/A",
    seats: Number(item?.seats) || 0,
    applicants: Number(item?.applicants_count) || 0,
    location_type: item?.location_type || "REMOTE",
    location: item?.location_type || "REMOTE",
    workType: item?.location_type || "REMOTE",
    deadline: item?.deadline || null,
    publishedAt: item?.created_at || null,
    requiredSkillIds: skillIds,
    skills: skillNames,
    hasExam: Boolean(item?.has_exam),
    examId: Number(item?.exam_id) || id,
    hasApply: toBoolean(item?.has_apply ?? item?.hasApply),
    quizCompleted: toBoolean(item?.quiz_completed ?? item?.quizCompleted),
    techCompleted: toBoolean(item?.tech_completed ?? item?.techCompleted),
    progress,
  };
};

export const getBrowseInternships = async () => {
  const [internshipsResponse, skillsResponse] = await Promise.all([
    getInternships(),
    getAllSkills(),
  ]);

  const internships = Array.isArray(internshipsResponse?.data)
    ? internshipsResponse.data
    : [];

  const skillsPayload = skillsResponse?.data || skillsResponse;
  const skillsList = Array.isArray(skillsPayload?.data)
    ? skillsPayload.data
    : Array.isArray(skillsPayload)
      ? skillsPayload
      : [];
  const skillMap = toSkillMap(skillsList);

  return internships
    .map((item) =>
      normalizeInternship(
        item,
        item?.company_name || item?.name || "Unknown Company",
        skillMap,
      ),
    )
    .filter((item) => item.id);
};

export const getInternshipById = async (internshipId) => {
  const internships = await getBrowseInternships();
  return (
    internships.find((item) => Number(item.id) === Number(internshipId)) || null
  );
};
