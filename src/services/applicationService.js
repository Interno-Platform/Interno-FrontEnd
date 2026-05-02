import { api } from "./api";

const normalizeArrayResponse = (responseData) => {
  const payload = responseData?.data || responseData;
  const list = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.applications)
      ? payload.applications
      : Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload?.results)
          ? payload.results
          : Array.isArray(payload)
            ? payload
            : [];

  return {
    ...payload,
    data: list,
    count:
      payload?.count ??
      payload?.total ??
      payload?.totalCount ??
      payload?.applications_count ??
      list.length,
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

// Get Trainee Applications - GET /api/internships/trainee/:traineeId
export const getTraineeApplications = async (traineeId) => {
  const response = await api.get(`/api/internships/trainee/${traineeId}`);
  return normalizeArrayResponse(response.data);
};

// Get Internship Applications - GET /api/internships/company/:internshipId
export const getInternshipApplications = async (internshipId) => {
  const response = await api.get(`/api/internships/company/${internshipId}`);
  return normalizeArrayResponse(response.data);
};

// Review Application - PUT /api/internships/:applicationId/review
export const reviewApplication = async (applicationId, status, notes) => {
  const response = await api.put(`/api/internships/${applicationId}/review`, {
    status,
    notes,
  });
  return response.data;
};

// Get Internship Details - GET /api/internships/:internshipId
export const getInternshipDetails = async (internshipId) => {
  const response = await api.get(`/api/internships/${internshipId}`);
  return response.data?.data || response.data;
};
