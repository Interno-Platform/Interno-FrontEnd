import { getApprovedCompanies } from "@/services/adminService";
import { getInternships } from "@/services/companyService";
import { getAllSkills } from "@/services/skillsService";

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
  skillIds
    .map((skillId) => skillMap[Number(skillId)])
    .filter(Boolean);

const normalizeInternship = (item, companyName, skillMap) => {
  const skillIds = parseSkillIds(item?.required_skills ?? item?.skills);
  const skillNames = resolveSkillNames(skillIds, skillMap);
  const id = Number(item?.id ?? item?.internship_id);

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
  };
};

export const getBrowseInternships = async () => {
  const [companiesResponse, skillsResponse] = await Promise.all([
    getApprovedCompanies(),
    getAllSkills(),
  ]);

  const companies = Array.isArray(companiesResponse?.data)
    ? companiesResponse.data
    : [];

  const skillsPayload = skillsResponse?.data || skillsResponse;
  const skillsList = Array.isArray(skillsPayload?.data)
    ? skillsPayload.data
    : Array.isArray(skillsPayload)
      ? skillsPayload
      : [];
  const skillMap = toSkillMap(skillsList);

  const companyInternships = await Promise.allSettled(
    companies.map(async (company) => {
      const companyId = Number(company?.id);
      if (!companyId) {
        return [];
      }
      const response = await getInternships(companyId);
      const list = Array.isArray(response?.data) ? response.data : [];
      return list.map((item) =>
        normalizeInternship(item, company?.company_name || company?.name, skillMap),
      );
    }),
  );

  const internships = companyInternships.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );

  return internships.filter((item) => item.id);
};

export const getInternshipById = async (internshipId) => {
  const internships = await getBrowseInternships();
  return internships.find((item) => Number(item.id) === Number(internshipId)) || null;
};

