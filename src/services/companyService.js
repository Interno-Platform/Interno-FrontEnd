import { api } from "./api";

// Create Internship - POST /api/company/create-internship
export const createInternship = async (companyId, internshipData) => {
  const response = await api.post(
    "/api/company/create-internship",
    internshipData,
    {
      params: { company_id: companyId },
    },
  );
  return response.data;
};

// Get Internships - GET /api/company/internships
export const getInternships = async (companyId) => {
  const response = await api.get("/api/company/internships");

  const payload = response.data?.data || response.data;
  const internships = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
      ? payload
      : [];

  return {
    ...payload,
    data: internships,
    message: response.data?.message || payload?.message,
  };
};

// Add Technical Exam - POST /api/company/tech-exam
export const addTechnicalExam = async (companyId, examData) => {
  const formData = new FormData();

  if (examData.internship_id !== undefined && examData.internship_id !== null) {
    formData.append("internship_id", String(examData.internship_id));
  }

  if (examData.task_description) {
    formData.append("task_description", examData.task_description);
  }

  formData.append("exam_title", String(examData.exam_title ?? ""));
  formData.append("exam_description", String(examData.exam_description ?? ""));
  formData.append(
    "requirements",
    JSON.stringify(
      Array.isArray(examData.requirements) ? examData.requirements : [],
    ),
  );
  formData.append("expected_input", String(examData.expected_input ?? ""));
  formData.append("expected_output", String(examData.expected_output ?? ""));
  formData.append(
    "programmingLanguage",
    String(examData.programmingLanguage ?? ""),
  );

  if (
    examData.exam_time_limit_minutes !== undefined &&
    examData.exam_time_limit_minutes !== null &&
    examData.exam_time_limit_minutes !== ""
  ) {
    formData.append(
      "exam_time_limit_minutes",
      String(examData.exam_time_limit_minutes),
    );
  }

  if (
    examData.exam_passing_score !== undefined &&
    examData.exam_passing_score !== null &&
    examData.exam_passing_score !== ""
  ) {
    formData.append("exam_passing_score", String(examData.exam_passing_score));
  }

  if (examData.exam_instructions) {
    formData.append("exam_instructions", examData.exam_instructions);
  }

  const response = await api.post("/api/company/tech-exam", formData, {
    params: { company_id: companyId },
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Insert Skills - POST /api/company/insert-skills/:company_id
export const insertSkills = async (companyId, skills) => {
  const response = await api.post(`/api/company/insert-skills/${companyId}`, {
    skills,
  });
  return response.data;
};
