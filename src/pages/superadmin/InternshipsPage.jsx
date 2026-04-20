import { useEffect, useState } from "react";
import Card from "@/components/common/Card";
import {
  changeInternshipStatus,
  getPendingInternships,
} from "@/services/adminService";
import { notify } from "@/utils/notify";

const InternshipsPage = () => {
  const [internships, setInternships] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [actionKey, setActionKey] = useState("");

  const loadPendingInternships = async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const response = await getPendingInternships();
      setInternships(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      setLoadError(error?.message || "Unable to load pending internships.");
      setInternships([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPendingInternships();
  }, []);

  const updateStatus = async (companyId, status) => {
    const key = `${companyId}-${status}`;
    setActionKey(key);
    try {
      await changeInternshipStatus(companyId, status);
      notify.success(
        status === "active" ? "Internship approved." : "Internship rejected.",
      );
      await loadPendingInternships();
    } catch (error) {
      notify.error(error?.message, "Failed to update internship status.");
    } finally {
      setActionKey("");
    }
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-1">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Pending Internships
        </h2>
        <p className="text-sm text-slate-600">
          Review and approve internships before publishing.
        </p>
      </Card>

      {!isLoading && loadError ? (
        <Card className="border-rose-200 bg-rose-50/70">
          <p className="text-sm text-rose-700">{loadError}</p>
        </Card>
      ) : null}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Internship</th>
                <th className="px-5 py-4 font-semibold">Company</th>
                <th className="px-5 py-4 font-semibold">Seats</th>
                <th className="px-5 py-4 font-semibold">Created Date</th>
                <th className="px-5 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    className="px-5 py-6 text-center text-slate-500"
                    colSpan={5}
                  >
                    Loading internships...
                  </td>
                </tr>
              ) : internships.length === 0 ? (
                <tr>
                  <td
                    className="px-5 py-6 text-center text-slate-500"
                    colSpan={5}
                  >
                    No pending internships.
                  </td>
                </tr>
              ) : (
                internships.map((internship) => (
                  <tr
                    key={internship.id || internship.company_id}
                    className="border-t border-slate-100"
                  >
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {internship.title || "Untitled Internship"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {internship.company_name ||
                        internship.name ||
                        `Company #${internship.company_id}`}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {internship.seats ?? "N/A"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {internship.created_at
                        ? new Date(internship.created_at).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                          type="button"
                          disabled={
                            actionKey === `${internship.company_id}-active`
                          }
                          onClick={() =>
                            updateStatus(internship.company_id, "active")
                          }
                        >
                          Approve
                        </button>
                        <button
                          className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                          type="button"
                          disabled={
                            actionKey === `${internship.company_id}-rejected`
                          }
                          onClick={() =>
                            updateStatus(internship.company_id, "rejected")
                          }
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
        </div>
      </Card>
    </div>
  );
};

export default InternshipsPage;
