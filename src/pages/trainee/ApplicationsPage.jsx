import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, XCircle } from "lucide-react";
import Card from "@/components/common/Card";
import { getTraineeApplications } from "@/services/applicationService";
import { useAuthStore } from "@/store/authStore";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
};

const ApplicationsPage = () => {
  const { user } = useAuthStore();
  const traineeId = Number(user?.id);

  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!traineeId) {
      return;
    }

    const loadApplications = async () => {
      setIsLoading(true);
      setLoadError("");
      try {
        const response = await getTraineeApplications(traineeId);
        const list = Array.isArray(response?.data) ? response.data : [];

        const normalized = list.map((item, index) => ({
          id: item.application_id || item.id || index + 1,
          internship: item.internship_title || item.title || "Untitled Internship",
          company: item.company_name || "Unknown Company",
          date: item.applied_at
            ? new Date(item.applied_at).toLocaleDateString()
            : "N/A",
          status: String(item.status || "pending").toLowerCase(),
        }));

        setApplications(normalized);
      } catch (error) {
        setApplications([]);
        setLoadError(error?.message || "Unable to load applications.");
      } finally {
        setIsLoading(false);
      }
    };

    loadApplications();
  }, [traineeId]);

  const counts = useMemo(
    () => ({
      total: applications.length,
      accepted: applications.filter((item) => item.status === "accepted").length,
      review: applications.filter((item) => item.status === "pending").length,
      rejected: applications.filter((item) => item.status === "rejected").length,
    }),
    [applications],
  );

  return (
    <div className="space-y-6">
      <Card className="space-y-2">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
          My Applications
        </h2>
        <p className="text-sm text-slate-600">
          Track status updates and next steps for every internship you applied to.
        </p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={<CalendarDays className="h-4 w-4" />}
          label="Total Applications"
          value={counts.total}
        />
        <SummaryCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Accepted"
          value={counts.accepted}
        />
        <SummaryCard
          icon={<Clock3 className="h-4 w-4" />}
          label="In Review"
          value={counts.review}
        />
        <SummaryCard
          icon={<XCircle className="h-4 w-4" />}
          label="Rejected"
          value={counts.rejected}
        />
      </div>

      {isLoading ? (
        <Card>
          <p className="text-sm text-slate-600">Loading applications...</p>
        </Card>
      ) : null}

      {!isLoading && loadError ? (
        <Card className="border-rose-200 bg-rose-50/70">
          <p className="text-sm text-rose-700">{loadError}</p>
        </Card>
      ) : null}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Internship</th>
                <th className="px-5 py-4 font-semibold">Company</th>
                <th className="px-5 py-4 font-semibold">Applied Date</th>
                <th className="px-5 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr className="border-t border-slate-100">
                  <td className="px-5 py-4 text-slate-600" colSpan={4}>
                    No applications found.
                  </td>
                </tr>
              ) : (
                applications.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {item.internship}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{item.company}</td>
                    <td className="px-5 py-4 text-slate-600">{item.date}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                          statusStyles[item.status] ||
                          "bg-slate-50 text-slate-700 border-slate-200"
                        }`}
                      >
                        {item.status}
                      </span>
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

const SummaryCard = ({ icon, label, value }) => (
  <Card className="border-slate-200 p-4">
    <div className="flex items-center justify-between">
      <p className="text-sm text-slate-500">{label}</p>
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        {icon}
      </span>
    </div>
    <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
      {value}
    </p>
  </Card>
);

export default ApplicationsPage;

