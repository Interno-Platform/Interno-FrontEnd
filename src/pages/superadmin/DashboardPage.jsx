import { useEffect, useMemo, useState } from "react";
import Card from "@/components/common/Card";
import {
  getAllTrainees,
  getPendingCompanies,
  getPendingInternships,
} from "@/services/adminService";
import { getContactUsMessages } from "@/services/websiteService";

const bars = [40, 58, 44, 72, 85];

const toTimestamp = (value) => {
  if (!value) return 0;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

const SuperAdminDashboardPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [pendingInternships, setPendingInternships] = useState([]);
  const [traineesCount, setTraineesCount] = useState(0);
  const [contactMessages, setContactMessages] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setLoadError("");
      try {
        const [traineesResponse, companiesResponse, internshipsResponse] =
          await Promise.all([
            getAllTrainees(),
            getPendingCompanies(),
            getPendingInternships(),
          ]);

        const contactMessagesResponse = await getContactUsMessages().catch(
          () => ({ data: [] }),
        );

        const trainees = traineesResponse?.data || [];
        const companies = companiesResponse?.data || [];
        const internships = internshipsResponse?.data || [];
        const messages = contactMessagesResponse?.data || [];

        setTraineesCount(trainees.length);
        setPendingCompanies(companies);
        setPendingInternships(internships);
        setContactMessages(messages);
      } catch (error) {
        setLoadError(error?.message || "Unable to load dashboard data.");
        setTraineesCount(0);
        setPendingCompanies([]);
        setPendingInternships([]);
        setContactMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const metrics = [
    {
      label: "Total Trainees",
      value: traineesCount,
      chip: "Live",
      tone: "text-primary bg-primary/10",
    },
    {
      label: "Pending Internships",
      value: pendingInternships.length,
      chip: "Review",
      tone: "text-slate-700 bg-slate-100",
    },
    {
      label: "Pending Companies",
      value: pendingCompanies.length,
      chip: "Action Needed",
      tone: "text-rose-700 bg-rose-100",
    },
  ];

  const activity = useMemo(
    () =>
      pendingCompanies.slice(0, 4).map((company) => ({
        title: `${company.name || company.company_name || `Company #${company.id}`} registered as a new company`,
        detail:
          "New registration requiring verification of business documents.",
        time: company.created_at
          ? new Date(company.created_at).toLocaleDateString()
          : "N/A",
      })),
    [pendingCompanies],
  );

  const sortedContactMessages = useMemo(
    () =>
      [...contactMessages].sort(
        (a, b) =>
          toTimestamp(b?.created_at || b?.createdAt || b?.updated_at) -
          toTimestamp(a?.created_at || a?.createdAt || a?.updated_at),
      ),
    [contactMessages],
  );

  return (
    <div className="space-y-5">
      {!isLoading && loadError ? (
        <Card className="border-rose-200 bg-rose-50/70">
          <p className="text-sm text-rose-700">{loadError}</p>
        </Card>
      ) : null}

      <section className="rounded-2xl bg-gradient-to-r from-[#2f6534] to-[#3f7d45] px-6 py-6 text-white shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-4xl font-semibold tracking-tight">
              Welcome back, Super Admin!
            </h2>
            <p className="mt-2 text-sm text-emerald-100">
              You have {pendingCompanies.length} pending company requests and{" "}
              {pendingInternships.length} pending internships to review.
            </p>
          </div>
          <button
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-primary transition-all duration-200 hover:bg-emerald-50"
            type="button"
          >
            Review Requests
          </button>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        {metrics.map((item) => (
          <Card key={item.label} className="space-y-3 p-5 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                {item.label}
              </p>
              <span
                className={`rounded-full px-2 py-1 text-xs font-semibold ${item.tone}`}
              >
                {item.chip}
              </span>
            </div>
            <p className="text-4xl font-semibold tracking-tight text-slate-900">
              {isLoading ? "..." : item.value}
            </p>
            <div className="h-1.5 rounded-full bg-muted">
              <div className="h-full w-2/3 rounded-full bg-primary" />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[2.2fr_1fr]">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-semibold tracking-tight text-slate-900">
              Recent Activity Feed
            </h3>
            <button
              className="text-sm font-semibold text-primary transition-all duration-200 hover:text-primary/80"
              type="button"
            >
              View All Logs
            </button>
          </div>
          <div className="space-y-2">
            {(activity.length
              ? activity
              : [
                  {
                    title: "No recent company requests",
                    detail: "All caught up for now.",
                    time: "Now",
                  },
                ]
            ).map((item) => (
              <article
                key={item.title}
                className="rounded-xl border border-border/70 bg-white p-3 transition-all duration-200 hover:bg-muted/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.detail}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {item.time}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="space-y-3">
            <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
              Registration Trend
            </h3>
            <div className="flex h-44 items-end gap-2 rounded-xl bg-muted/40 p-3">
              {bars.map((height, index) => (
                <div
                  key={index}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <div
                    className={`w-full rounded-t ${index === bars.length - 1 ? "bg-primary" : "bg-primary/25"}`}
                    style={{ height }}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    {["Mon", "Tue", "Wed", "Thu", "Fri"][index]}
                  </p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="space-y-2">
            <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
              Quick Actions
            </h3>
            <button
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-muted/50"
              type="button"
            >
              Verify Company
            </button>
            <button
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-muted/50"
              type="button"
            >
              Review Internship
            </button>
            <button
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-muted/50"
              type="button"
            >
              Export Logs
            </button>
          </Card>
        </div>
      </div>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
            Contact Us Messages
          </h3>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {isLoading
              ? "Loading..."
              : `${sortedContactMessages.length} message(s)`}
          </span>
        </div>

        <div className="space-y-2">
          {(sortedContactMessages.length
            ? sortedContactMessages.slice(0, 8)
            : [
                {
                  id: "empty",
                  name: "No messages yet",
                  subject: "Inbox is empty",
                  message: "New Contact Us messages will appear here.",
                  created_at: null,
                  email: "",
                },
              ]
          ).map((item) => (
            <article
              key={item.id || `${item.email}-${item.created_at}`}
              className="rounded-xl border border-border/70 bg-white p-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    {item.name || "Unknown sender"}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {item.email || "No email provided"}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {item.created_at
                    ? new Date(item.created_at).toLocaleString()
                    : "-"}
                </span>
              </div>
              <p className="mt-2 text-sm font-medium text-slate-800">
                {item.subject || "No subject"}
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {item.message || "No message content."}
              </p>
            </article>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default SuperAdminDashboardPage;
