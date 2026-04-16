import { useEffect, useMemo, useState } from "react";
import Card from "@/components/common/Card";
import { getInternships } from "@/services/companyService";
import { getInternshipApplications } from "@/services/applicationService";
import { useAuthStore } from "@/store/authStore";

const statusStyles = {
  New: "bg-blue-100 text-blue-700",
  "In Review": "bg-amber-100 text-amber-700",
  Shortlisted: "bg-primary/10 text-primary",
  Accepted: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-rose-100 text-rose-700",
};

const toDisplayStatus = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "accepted" || normalized === "shortlisted")
    return "Shortlisted";
  if (normalized === "rejected") return "Rejected";
  if (normalized === "in_review" || normalized === "in review")
    return "In Review";
  return "New";
};

const formatAgo = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const monthLabel = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Unknown";
  return d.toLocaleString("en-US", { month: "short" });
};

const CompanyDashboardPage = () => {
  const { user } = useAuthStore();
  const companyId = user?.id || user?.company_id || user?.companyId;
  const [isLoading, setIsLoading] = useState(false);
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!companyId) return;

      setIsLoading(true);
      try {
        const internshipsResponse = await getInternships(companyId);
        const internshipsList = Array.isArray(internshipsResponse?.data)
          ? internshipsResponse.data
          : [];
        setInternships(internshipsList);

        const applicationResponses = await Promise.allSettled(
          internshipsList.map((internship) =>
            getInternshipApplications(internship.id),
          ),
        );

        const merged = applicationResponses.flatMap((result, index) => {
          if (result.status !== "fulfilled") return [];

          const internship = internshipsList[index];
          const payload = result.value?.data || result.value;
          const list = Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload)
              ? payload
              : [];

          return list.map((item) => ({
            ...item,
            internshipTitle:
              internship?.title || item?.internship_title || "Internship",
          }));
        });

        setApplications(merged);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [companyId]);

  const activeInternships = useMemo(
    () =>
      internships.filter((item) =>
        ["active", "approved", "open"].includes(
          String(item?.status || "").toLowerCase(),
        ),
      ).length,
    [internships],
  );

  const shortlistedCandidates = useMemo(
    () =>
      applications.filter((item) =>
        ["accepted", "shortlisted"].includes(
          String(item?.status || "").toLowerCase(),
        ),
      ).length,
    [applications],
  );

  const sortedApplications = useMemo(
    () =>
      [...applications].sort(
        (a, b) =>
          new Date(b.applied_at || b.created_at || 0) -
          new Date(a.applied_at || a.created_at || 0),
      ),
    [applications],
  );

  const newApplicants = useMemo(
    () =>
      sortedApplications.slice(0, 5).map((item, index) => ({
        id: item.application_id || `app-${index}`,
        name: item.trainee_name || `Applicant #${item.trainee_id || index + 1}`,
        role: item.internshipTitle,
        ago: formatAgo(item.applied_at || item.created_at),
      })),
    [sortedApplications],
  );

  const recentActivity = useMemo(
    () =>
      sortedApplications.slice(0, 8).map((item, index) => ({
        id: item.application_id || `activity-${index}`,
        name: item.trainee_name || `Applicant #${item.trainee_id || index + 1}`,
        role: item.internshipTitle,
        date: item.applied_at || item.created_at,
        status: toDisplayStatus(item.status),
      })),
    [sortedApplications],
  );

  const trendBars = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 5 }).map((_, idx) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (4 - idx), 1);
      return {
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: monthLabel(d),
        count: 0,
      };
    });

    sortedApplications.forEach((item) => {
      const d = new Date(item.applied_at || item.created_at);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = months.find((m) => m.key === key);
      if (bucket) bucket.count += 1;
    });

    const max = Math.max(...months.map((m) => m.count), 1);
    return months.map((m) => ({
      ...m,
      height: Math.max(12, Math.round((m.count / max) * 120)),
    }));
  }, [sortedApplications]);

  const stats = [
    {
      label: "Active Internships",
      value: activeInternships,
      hint: `${internships.length} total`,
    },
    {
      label: "Total Applicants",
      value: applications.length,
      hint: "across all internships",
    },
    {
      label: "Shortlisted Candidates",
      value: shortlistedCandidates,
      hint: "accepted/shortlisted",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-3">
        {stats.map((item) => (
          <Card key={item.label} className="space-y-2 p-5 hover:shadow-lg">
            <p className="text-sm font-medium text-muted-foreground">
              {item.label}
            </p>
            <p className="text-4xl font-semibold tracking-tight text-slate-900">
              {isLoading ? "..." : item.value}
            </p>
            <p className="text-xs font-medium text-muted-foreground">
              {item.hint}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.35fr]">
        {/* <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
                Application Trends
              </h3>
              <p className="text-sm text-muted-foreground">
                Real applications grouped by month
              </p>
            </div>
            <span className="rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-semibold text-muted-foreground">
              Last 5 Months
            </span>
          </div>
          <div className="flex h-56 items-end gap-3 rounded-xl bg-muted/40 p-4">
            {trendBars.map((item) => (
              <div
                key={item.key}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <div
                  className="w-full rounded-t-md bg-primary/80"
                  style={{ height: item.height }}
                />
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </Card> */}

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-900">
              New Applicants
            </h3>
            <span className="text-xs text-muted-foreground">latest 5</span>
          </div>
          <div className="space-y-3">
            {newApplicants.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No applicants yet.
              </p>
            ) : (
              newApplicants.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between rounded-xl border border-border/70 p-3 transition-all duration-200 hover:bg-muted/40"
                >
                  <div className="min-w-0 pr-2">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {item.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.role}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {item.ago}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
              Recent Activity
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table w-full min-w-[620px] text-left">
              <thead>
                <tr>
                  <th>Candidate Name</th>
                  <th>Applied For</th>
                  <th>Date Applied</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.length === 0 ? (
                  <tr>
                    <td
                      className="py-6 text-center text-sm text-muted-foreground"
                      colSpan={4}
                    >
                      No recent activity.
                    </td>
                  </tr>
                ) : (
                  recentActivity.map((item) => (
                    <tr key={item.id}>
                      <td className="font-semibold text-slate-900">
                        {item.name}
                      </td>
                      <td className="text-slate-600">{item.role}</td>
                      <td className="text-slate-600">
                        {item.date
                          ? new Date(item.date).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[item.status] || statusStyles.New}`}
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
    </div>
  );
};

export default CompanyDashboardPage;
