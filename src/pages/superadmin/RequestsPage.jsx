import { useEffect, useState } from "react";
import Card from "@/components/common/Card";
import Modal from "@/components/common/Modal";
import {
  approveCompany,
  changeCompanyStatus,
  getPendingCompanies,
} from "@/services/adminService";
import { notify } from "@/utils/notify";

const COMPANY_DETAIL_FIELDS = [
  { label: "Company ID", keys: ["id"] },
  { label: "Company Name", keys: ["name", "company_name"] },
  { label: "Registration Number", keys: ["registration_number"] },
  { label: "Email", keys: ["email"] },
  { label: "Phone", keys: ["phone", "phone_number", "mobile"] },
  { label: "Website", keys: ["website", "website_url"] },
  { label: "Industry", keys: ["industry"] },
  { label: "Address", keys: ["address", "location"] },
  { label: "City", keys: ["city"] },
  { label: "Country", keys: ["country"] },
  { label: "Employee Count", keys: ["employee_count", "company_size", "size"] },
  { label: "Annual Revenue", keys: ["annual_revenue"] },
  { label: "Founded Date", keys: ["founded_date"] },
  { label: "Account Status", keys: ["is_active"] },
  { label: "Requested At", keys: ["created_at", "requested_at"] },
];

const isMeaningfulValue = (value) => {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === "string") {
    return value.trim() !== "";
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return true;
};

const getFirstNonEmptyValue = (record, keys) => {
  for (const key of keys) {
    const value = record?.[key];
    if (isMeaningfulValue(value)) {
      return value;
    }
  }
  return null;
};

const formatDetailValue = (label, value) => {
  if (!isMeaningfulValue(value)) {
    return "";
  }

  if (label === "Requested At" || label === "Founded Date") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
  }

  if (label === "Account Status") {
    return Number(value) === 1 ? "Active" : "Inactive";
  }

  return String(value);
};

const getCompanyInitials = (record) => {
  const name =
    record?.name || record?.company_name || record?.email || "Company";

  const parts = String(name).trim().split(/\s+/).filter(Boolean).slice(0, 2);

  return parts.map((part) => part[0]?.toUpperCase() || "").join("") || "CO";
};

const getCompanyImageUrl = (record) => {
  return record?.profile_picture || record?.logo_url || "";
};

const RequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [actionId, setActionId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const loadRequests = async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const response = await getPendingCompanies();
      const list = Array.isArray(response?.data) ? response.data : [];
      setRequests(list);
    } catch (error) {
      setLoadError(error?.message || "Unable to load pending requests.");
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (companyId) => {
    setActionId(companyId);
    try {
      await approveCompany(companyId);
      notify.success("Company approved successfully.");
      await loadRequests();
    } catch (error) {
      notify.error(error?.message, "Failed to approve company.");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (companyId) => {
    setActionId(companyId);
    try {
      await changeCompanyStatus(companyId, false);
      notify.success("Company request rejected.");
      await loadRequests();
    } catch (error) {
      notify.error(error?.message, "Failed to reject company.");
    } finally {
      setActionId(null);
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
  };

  const closeDetails = () => {
    setSelectedRequest(null);
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-1">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Requests
        </h2>
        <p className="text-sm text-slate-600">
          Pending company verification requests.
        </p>
      </Card>

      {!isLoading && loadError ? (
        <Card className="border-rose-200 bg-rose-50/70">
          <p className="text-sm text-rose-700">{loadError}</p>
        </Card>
      ) : null}

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-4 font-semibold">Company</th>
              <th className="px-5 py-4 font-semibold">Email</th>
              <th className="px-5 py-4 font-semibold">Request Type</th>
              <th className="px-5 py-4 font-semibold">Date</th>
              <th className="px-5 py-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  className="px-5 py-6 text-center text-slate-500"
                  colSpan={5}
                >
                  Loading requests...
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td
                  className="px-5 py-6 text-center text-slate-500"
                  colSpan={5}
                >
                  No pending requests.
                </td>
              </tr>
            ) : (
              requests.map((company) => (
                <tr key={company.id} className="border-t border-slate-100">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {getCompanyImageUrl(company) ? (
                        <img
                          src={getCompanyImageUrl(company)}
                          alt={`${company.company_name || company.name || "Company"} logo`}
                          className="h-10 w-10 rounded-xl border border-slate-200 object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-200/70 text-xs font-bold text-slate-700">
                          {getCompanyInitials(company)}
                        </div>
                      )}
                      <p className="font-semibold text-slate-900">
                        {company.name ||
                          company.company_name ||
                          `Company #${company.id}`}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {company.email || "N/A"}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    Company Verification
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {company.created_at
                      ? new Date(company.created_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                        type="button"
                        onClick={() => handleViewDetails(company)}
                      >
                        Details
                      </button>
                      <button
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                        type="button"
                        disabled={actionId === company.id}
                        onClick={() => handleApprove(company.id)}
                      >
                        Approve
                      </button>
                      <button
                        className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                        type="button"
                        disabled={actionId === company.id}
                        onClick={() => handleReject(company.id)}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      <Modal
        open={Boolean(selectedRequest)}
        onClose={closeDetails}
        title="Company Request Details"
      >
        {!selectedRequest ? null : (
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-4 shadow-sm">
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-100/40 blur-xl" />
              <div className="relative flex items-center gap-3">
                {getCompanyImageUrl(selectedRequest) ? (
                  <img
                    src={getCompanyImageUrl(selectedRequest)}
                    alt={`${selectedRequest.company_name || selectedRequest.name || "Company"} logo`}
                    className="h-16 w-16 rounded-2xl border border-white object-cover shadow-sm ring-2 ring-slate-200/70"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white bg-slate-200/80 text-base font-extrabold text-slate-700 shadow-sm ring-2 ring-slate-200/70">
                    {getCompanyInitials(selectedRequest)}
                  </div>
                )}

                <div>
                  <p className="text-lg font-extrabold tracking-tight text-slate-900">
                    {selectedRequest.company_name ||
                      selectedRequest.name ||
                      `Company #${selectedRequest.id}`}
                  </p>
                  <p className="text-xs font-medium text-slate-600">
                    Pending verification request
                  </p>
                  <span className="mt-2 inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                    Awaiting admin decision
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {COMPANY_DETAIL_FIELDS.map(({ label, keys }) => {
                const rawValue = getFirstNonEmptyValue(selectedRequest, keys);
                if (!isMeaningfulValue(rawValue)) {
                  return null;
                }
                const value = formatDetailValue(label, rawValue);

                return (
                  <div
                    key={label}
                    className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(15,23,42,0.08)]"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                      {label}
                    </p>
                    <p className="mt-1.5 break-words text-sm font-medium text-slate-900">
                      {value}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RequestsPage;
