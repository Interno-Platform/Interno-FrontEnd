import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Card from "@/components/common/Card";
import { getInternshipApplications } from "@/services/applicationService";
import { notify } from "@/utils/notify";

const ApplicantsPage = () => {
  const { internshipId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadApplicants = async () => {
      if (!internshipId) {
        setError("No applications yet.");
        return;
      }

      setIsLoading(true);
      setError("");
      try {
        const response = await getInternshipApplications(internshipId);
        const list = Array.isArray(response?.data) ? response.data : [];

        const normalized = list.map((item) => ({
          id: item.application_id || item.id,
          traineeId: item.trainee_id,
          name: item.trainee_name || item.name || "Unknown",
          coverLetter: item.cover_letter || "",
          status: item.status || "pending",
          score: item.assessment_score || item.score || 0,
          appliedAt: item.applied_at || "",
        }));

        setApplicants(normalized);
      } catch (err) {
        notify.error(
          err?.message || "Failed to load applicants",
          "Please try again later.",
        );
        setError(err?.message || "Unable to load applicants");
        setApplicants([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadApplicants();
  }, [internshipId]);

  return (
    <div className="space-y-4">
      <Card className="space-y-1">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Internship Applicants
        </h2>
        <p className="text-sm text-slate-600">
          Review candidates, shortlist top profiles, and manage decisions.
        </p>
      </Card>

      {error && (
        <Card className="border-rose-200 bg-rose-50/70">
          <p className="text-sm text-rose-700">{error}</p>
        </Card>
      )}

      {isLoading && (
        <Card>
          <p className="text-sm text-slate-600">Loading applicants...</p>
        </Card>
      )}

      {!isLoading && applicants.length === 0 && !error && (
        <Card>
          <p className="text-sm text-slate-600">
            No applications yet for this internship.
          </p>
        </Card>
      )}

      {applicants.length > 0 && (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Applicant</th>
                  <th className="px-5 py-4 font-semibold">Assessment Score</th>
                  <th className="px-5 py-4 font-semibold">Applied Date</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100">
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {row.name}
                    </td>
                    <td className="px-5 py-4 text-slate-700">{row.score}%</td>
                    <td className="px-5 py-4 text-slate-600 text-xs">
                      {row.appliedAt
                        ? new Date(row.appliedAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          row.status === "accepted"
                            ? "bg-emerald-100 text-emerald-700"
                            : row.status === "rejected"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {row.status.charAt(0).toUpperCase() +
                          row.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          title={row.coverLetter || "No cover letter"}
                          type="button"
                        >
                          View Letter
                        </button>
                        <button
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                          type="button"
                        >
                          Accept
                        </button>
                        <button
                          className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                          type="button"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ApplicantsPage;
