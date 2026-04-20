import { api } from "./api";

const normalizeArrayResponse = (responseData) => {
  const payload = responseData?.data || responseData;
  const list = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
      ? payload
      : [];

  return {
    ...payload,
    data: list,
    count: payload?.count ?? list.length,
    message: responseData?.message || payload?.message,
  };
};

// Apply for Internship - POST /api/applications/apply
export const applyForInternship = async (
  traineeId,
  internshipId,
  coverLetter,
) => {
  const response = await api.post("/api/internships/apply", {
    traineeId,
    internshipId,
    coverLetter,
  });
  return response.data;
};

// Get Questions by Skills - POST /api/applications/questions
export const getQuestionsBySkills = async (requiredSkills, internshipId) => {
  const normalizedSkills = Array.isArray(requiredSkills)
    ? requiredSkills.map((skillId) => Number(skillId)).filter(Boolean)
    : [];

  const response = await api.post("/api/internships/questions", {
    requiredSkills: normalizedSkills,
    // compatibility key used by some backend implementations
    skills: normalizedSkills,
    internshipId,
    internship_id: internshipId,
  });
  return response.data;
};

// Get Trainee Applications - GET /api/applications/trainee/:traineeId
export const getTraineeApplications = async (traineeId) => {
  const response = await api.get(`/api/applications/trainee/${traineeId}`);
  return normalizeArrayResponse(response.data);
};

// Get Internship Applications - GET /api/applications/company/:internshipId
export const getInternshipApplications = async (internshipId) => {
  const response = await api.get(`/api/applications/company/${internshipId}`);
  return normalizeArrayResponse(response.data);
};

// Review Application - PUT /api/applications/:applicationId/review
export const reviewApplication = async (applicationId, status, notes) => {
  const response = await api.put(`/api/applications/${applicationId}/review`, {
    status,
    notes,
  });
  return response.data;
};
