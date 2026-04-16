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

  if (examData.task_file) {
    formData.append("task-file", examData.task_file);
  }

  const response = await api.post("/api/company/tech-exam", formData, {
    params: { company_id: companyId },
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
