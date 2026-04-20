import { api } from "./api";

// Get All Skills - GET /api/skills/get-skills
export const getAllSkills = async () => {
  const response = await api.get("/api/skills/get-skills");
  return response.data;
};
