import { api } from "./api";

const normalizeListResponse = (responseData) => {
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

const approvedInternshipStatuses = new Set(["active", "approved"]);

const withCompanyMeta = (internship, company) => ({
  ...internship,
  company_id:
    internship?.company_id ?? company?.id ?? internship?.companyId ?? null,
  company_name:
    internship?.company_name ?? company?.name ?? company?.company_name ?? null,
});

const isApprovedInternship = (internship) =>
  approvedInternshipStatuses.has(
    String(internship?.status || "").toLowerCase(),
  );

// Approve Company
export const approveCompany = async (companyId) => {
  const response = await api.post(
    `/api/admin/approve-company/${companyId}`,
    {},
  );
  return response.data;
};

// Get Approved Companies
export const getApprovedCompanies = async () => {
  const response = await api.get("/api/admin/approved-companies");
  return normalizeListResponse(response.data);
};

// Get Pending Companies
export const getPendingCompanies = async () => {
  const response = await api.get("/api/admin/pending-companies");
  return normalizeListResponse(response.data);
};

// Change Company Status
export const changeCompanyStatus = async (companyId, status) => {
  const normalizedStatus =
    typeof status === "boolean"
      ? status
      : String(status).toLowerCase() === "active";

  const response = await api.post(`/api/admin/account-status/${companyId}`, {
    status: normalizedStatus,
  });
  return response.data;
};

// Get All Trainees
export const getAllTrainees = async () => {
  const response = await api.get("/api/admin/trainees");
  return normalizeListResponse(response.data);
};

// Change Internship Status
export const changeInternshipStatus = async (
  companyId,
  internshipId,
  status,
) => {
  const response = await api.post(
    `/api/admin/internship-status?company_id=${companyId}&internship_id=${internshipId}`,
    { status },
  );
  return response.data;
};

// Get Pending Internships (FIXED DUPLICATES)
export const getPendingInternships = async (companyId = null) => {
  if (companyId) {
    const response = await api.get("/api/admin/pending-internships");

    return normalizeListResponse(response.data);
  }

  const companyListResults = await Promise.allSettled([
    api.get("/api/admin/approved-companies"),
    api.get("/api/admin/pending-companies"),
  ]);

  const companies = companyListResults.flatMap((result) => {
    if (result.status !== "fulfilled") return [];
    return normalizeListResponse(result.value.data).data;
  });

  const uniqueCompanyIds = [
    ...new Set(companies.map((c) => String(c?.id)).filter(Boolean)),
  ];

  if (!uniqueCompanyIds.length) {
    return {
      data: [],
      count: 0,
      message: "No companies found for pending internship lookup.",
    };
  }

  const internshipResults = await Promise.allSettled(
    uniqueCompanyIds.map(() =>
      api.get("/api/admin/pending-internships")
    ),
  );

  const allInternships = internshipResults.flatMap((result) => {
    if (result.status !== "fulfilled") return [];
    const normalized = normalizeListResponse(result.value.data);
    return normalized.data;
  });

  // 🔥 HARD DEDUP (important fix)
  const uniqueInternships = Array.from(
    new Map(allInternships.map((i) => [i?.id, i])).values()
  );

  return {
    data: uniqueInternships,
    count: uniqueInternships.length,
    message: "Pending internships retrieved.",
  };
};
// Get Approved Internships
export const getApprovedInternships = async (companyId = null) => {
  const mapApproved = (items, company = null) =>
    (Array.isArray(items) ? items : [])
      .map((item) => withCompanyMeta(item, company))
      .filter(isApprovedInternship);

  if (companyId) {
    const response = await api.get("/api/company/internships", {
      params: { company_id: companyId },
    });

    const normalized = normalizeListResponse(response.data);
    const approved = mapApproved(normalized.data);

    return {
      ...normalized,
      data: approved,
      count: approved.length,
      message: "Approved internships retrieved.",
    };
  }

  const companiesResponse = await getApprovedCompanies();
  const companies = Array.isArray(companiesResponse?.data)
    ? companiesResponse.data
    : [];

  const companyIds = [
    ...new Set(companies.map((company) => company?.id).filter(Boolean)),
  ];

  if (!companyIds.length) {
    return {
      data: [],
      count: 0,
      message: "No approved companies found for internship lookup.",
    };
  }

  const internshipsByCompany = await Promise.allSettled(
    companyIds.map(async () => {
      const response = await api.get("/api/company/internships");

      const normalized = normalizeListResponse(response.data);
      return normalized.data;
    }),
  );

  const allInternships = internshipsByCompany.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );

  const uniqueInternships = Array.from(
    new Map(allInternships.map((i) => [i?.id, i])).values(),
  );

  const approvedInternships = uniqueInternships;

  return {
    data: approvedInternships,
    count: approvedInternships.length,
    message: "Approved internships retrieved.",
  };
};
