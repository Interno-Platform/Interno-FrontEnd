import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Card from "@/components/common/Card";
import Badge from "@/components/common/Badge";
import {
  getApprovedInternships,
  getPendingInternships,
} from "@/services/adminService";

const formatDate = (value) => {
  if (!value) return "N/A";
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return "N/A";
  return parsedDate.toLocaleDateString();
};

const toDisplayStatus = (status) => {
  const normalized = String(status || "pending").toLowerCase();
  if (normalized === "active") return "Approved";
  if (normalized === "approved") return "Approved";
  if (normalized === "pending") return "Pending";
  if (normalized === "rejected") return "Rejected";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const getInternshipKey = (internship) =>
  `${
    internship?.company_id || internship?.companyId || "company"
  }-${internship?.id || internship?.internship_id || internship?.title || "item"}`;

const InternshipsPage = () => {
  const location = useLocation();
  const [pendingInternships, setPendingInternships] = useState([]);
  const [approvedInternships, setApprovedInternships] = useState([]);
  const [activeTab, setActiveTab] = useState(
    location.state?.defaultTab === "approved" ? "approved" : "pending",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const loadInternships = async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const [pendingResult, approvedResult] = await Promise.allSettled([
        getPendingInternships(),
        getApprovedInternships(),
      ]);

      const pendingList =
        pendingResult.status === "fulfilled" &&
        Array.isArray(pendingResult.value?.data)
          ? pendingResult.value.data
          : [];

      const approvedList =
        approvedResult.status === "fulfilled" &&
        Array.isArray(approvedResult.value?.data)
          ? approvedResult.value.data
          : [];

      setPendingInternships(pendingList);
      setApprovedInternships(approvedList);

      if (
        pendingResult.status === "rejected" &&
        approvedResult.status === "rejected"
      ) {
        throw new Error("Unable to load internships.");
      }
    } catch (error) {
      setLoadError(error?.message || "Unable to load internships.");
      setPendingInternships([]);
      setApprovedInternships([]);
    } finally {
      setIsLoading(false);
    }
  };

  const currentList =
    activeTab === "pending" ? pendingInternships : approvedInternships;

  const counts = useMemo(
    () => ({
      pending: pendingInternships.length,
      approved: approvedInternships.length,
      total: pendingInternships.length + approvedInternships.length,
    }),
    [approvedInternships.length, pendingInternships.length],
  );

  useEffect(() => {
    let ignore = false;

    const run = async () => {
      if (ignore) return;
      await loadInternships();
    };

    run();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-[#0f766e] via-[#0f766e] to-[#115e59] text-white shadow-lg">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Internship Reviews
            </h2>
            <p className="text-sm text-teal-100">
              Track what still needs approval and what has already been
              approved.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-white/15 px-4 py-2 text-center backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-teal-100">
                Pending
              </p>
              <p className="text-xl font-bold">{counts.pending}</p>
            </div>
            <div className="rounded-xl bg-white/15 px-4 py-2 text-center backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-teal-100">
                Approved
              </p>
              <p className="text-xl font-bold">{counts.approved}</p>
            </div>
            <div className="rounded-xl bg-white/15 px-4 py-2 text-center backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-teal-100">
                Total
              </p>
              <p className="text-xl font-bold">{counts.total}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Manage Internships
            </h3>
            <p className="text-sm text-slate-600">
              Switch between pending and approved opportunities.
            </p>
          </div>

          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === "pending"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              type="button"
              onClick={() => setActiveTab("pending")}
            >
              Pending ({counts.pending})
            </button>
            <button
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === "approved"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              type="button"
              onClick={() => setActiveTab("approved")}
            >
              Approved ({counts.approved})
            </button>
          </div>
        </div>
      </Card>

      {!isLoading && loadError ? (
        <Card className="border-rose-200 bg-rose-50/70">
          <p className="text-sm text-rose-700">{loadError}</p>
        </Card>
      ) : null}

      <Card className="overflow-hidden p-0">
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
          <p className="text-sm font-semibold text-slate-700">
            {activeTab === "pending"
              ? "Pending internships waiting for approval"
              : "Approved internships already published"}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Internship</th>
                <th className="px-5 py-4 font-semibold">Company</th>
                <th className="px-5 py-4 font-semibold">Seats</th>
                <th className="px-5 py-4 font-semibold">Created</th>
                <th className="px-5 py-4 font-semibold">Deadline</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    className="px-5 py-6 text-center text-slate-500"
                    colSpan={7}
                  >
                    Loading internships...
                  </td>
                </tr>
              ) : currentList.length === 0 ? (
                <tr>
                  <td
                    className="px-5 py-6 text-center text-slate-500"
                    colSpan={7}
                  >
                    {activeTab === "pending"
                      ? "No pending internships."
                      : "No approved internships."}
                  </td>
                </tr>
              ) : (
                currentList.map((internship) => (
                  <tr
                    key={getInternshipKey(internship)}
                    className="border-t border-slate-100 hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {internship.title || "Untitled Internship"}
                      </p>
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                        {internship.description || "No description provided."}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {internship.company_name ||
                        internship.name ||
                        `Company #${internship.company_id}`}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {internship.seats ?? internship.slots ?? "N/A"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {formatDate(internship.created_at)}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {formatDate(internship.deadline)}
                    </td>
                    <td className="px-5 py-4">
                      <Badge>{toDisplayStatus(internship.status)}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        className="inline-flex rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        to={`/superadmin/internships/${internship.company_id}/${internship.id || internship.internship_id}`}
                        state={{ internship, listType: activeTab }}
                      >
                        View details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default InternshipsPage;
