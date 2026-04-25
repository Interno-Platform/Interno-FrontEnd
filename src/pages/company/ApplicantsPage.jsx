import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  CalendarClock,
  CheckCircle2,
  Code2,
  Eye,
  GraduationCap,
  School,
  UserRound,
  XCircle,
} from "lucide-react";
import Card from "@/components/common/Card";
import Table from "@/components/common/Table";
import Button from "@/components/common/Button";
import { getInternshipApplications } from "@/services/applicationService";
import { useAuthStore } from "@/store/authStore";
import { notify } from "@/utils/notify";

const statusStyles = {
  applied: "border-amber-200 bg-amber-50 text-amber-700",
  accepted: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
  completed: "border-blue-200 bg-blue-50 text-blue-700",
};

const statusLabels = {
  applied: "In Review",
  accepted: "Accepted",
  rejected: "Rejected",
  completed: "Completed",
};

const formatDateTime = (value) => {
  if (!value) return "N/A";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "N/A";

  return parsed.toLocaleString();
};

const normalizeStatus = (value) => {
  const status = String(value || "applied").toLowerCase();
  if (["applied", "accepted", "rejected", "completed"].includes(status)) {
    return status;
  }

  return "applied";
};

const getInitials = (name) =>
  String(name || "Applicant")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "AP";

const ApplicantsPage = () => {
  const { internshipId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [applicants, setApplicants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const companyId =
    Number(user?.id || user?.company_id || user?.companyId) || null;

  const resolvedRequestId = useMemo(() => {
    const queryId = new URLSearchParams(location.search).get("internshipId");
    const stateId = location.state?.internshipId;
    const id = Number(internshipId || queryId || stateId || companyId);
    return Number.isFinite(id) && id > 0 ? id : null;
  }, [companyId, internshipId, location.search, location.state?.internshipId]);

  const loadApplicants = async () => {
    if (!resolvedRequestId) {
      setError(
        "Unable to resolve company or internship id for loading applicants.",
      );
      setApplicants([]);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await getInternshipApplications(resolvedRequestId);
      const list = Array.isArray(response?.data) ? response.data : [];

      const normalized = list.map((item) => ({
        id: Number(item.application_id || item.id),
        internshipId: Number(item.internship_id || resolvedRequestId),
        internshipTitle: item.internship_title || "Untitled Internship",
        companyId: Number(item.company_id || companyId) || null,
        traineeId: Number(item.trainee_id) || null,
        status: normalizeStatus(item.status),
        traineeName: item.trainee_name || "Unknown",
        traineeEmail: item.trainee_email || "N/A",
        traineePhone: item.trainee_phone || "N/A",
        traineeGender: item.trainee_gender || "N/A",
        traineeCity: item.trainee_city || "N/A",
        traineeUniversity: item.trainee_university || "N/A",
        traineeMajor: item.trainee_major || "N/A",
        traineeGraduationYear: item.trainee_graduation_year || "N/A",
        traineeSkills: Array.isArray(item.trainee_skills)
          ? item.trainee_skills
          : [],
        traineeCvFile: item.trainee_cv_file || "",
        traineeProfilePicture: item.trainee_profile_picture || "",
        traineeCreatedAt: item.trainee_created_at || "",
        traineeUpdatedAt: item.trainee_updated_at || "",
        coverLetter: item.cover_letter || "",
        notes: item.notes || "",
        quizScore: item.quiz_score,
        quizCompleted: Boolean(item.quiz_completed),
        quizSubmittedAt: item.quiz_submitted_at || "",
        submittedCode: item.submitted_code || "",
        codeLanguage: item.code_language || "N/A",
        codeSubmittedAt: item.code_submitted_at || "",
        appliedAt: item.applied_at || "",
        reviewedAt: item.reviewed_at || "",
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

  useEffect(() => {
    loadApplicants();
  }, [resolvedRequestId]);

  const openDetailsPage = (applicant) => {
    const targetInternshipId = applicant?.internshipId || resolvedRequestId;
    if (!targetInternshipId || !applicant?.id) return;

    sessionStorage.setItem(
      "company:selected-applicant",
      JSON.stringify(applicant),
    );

    navigate(
      `/company/applicants/${targetInternshipId}/details/${applicant.id}`,
      {
        state: {
          applicant,
          internshipId: targetInternshipId,
        },
      },
    );
  };

  const counts = useMemo(
    () => ({
      total: applicants.length,
      applied: applicants.filter((item) => item.status === "applied").length,
      accepted: applicants.filter((item) => item.status === "accepted").length,
      rejected: applicants.filter((item) => item.status === "rejected").length,
    }),
    [applicants],
  );

  return (
    <div className="space-y-6">
      <Card className="space-y-2 border-slate-200 bg-gradient-to-br from-white via-slate-50 to-emerald-50/50 shadow-sm dark:border-border/70 dark:bg-card dark:bg-none dark:shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700 dark:text-emerald-300">
              Internship pipeline
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-foreground">
              Internship Applicants
            </h2>
            <p className="max-w-2xl text-sm text-slate-600 dark:text-muted-foreground">
              Review candidates as a compact table first, then open a full
              profile view with their training details, CV, skills, and
              submission data.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatPill
            icon={<UserRound className="h-4 w-4" />}
            label="Total"
            value={counts.total}
          />
          <StatPill
            icon={<CalendarClock className="h-4 w-4" />}
            label="In Review"
            value={counts.applied}
          />
          <StatPill
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Accepted"
            value={counts.accepted}
          />
          <StatPill
            icon={<XCircle className="h-4 w-4" />}
            label="Rejected"
            value={counts.rejected}
          />
        </div>
      </Card>

      {error ? (
        <Card className="border-rose-200 bg-rose-50/70">
          <p className="text-sm text-rose-700">{error}</p>
        </Card>
      ) : null}

      {isLoading ? (
        <Card>
          <p className="text-sm text-slate-600">Loading applicants...</p>
        </Card>
      ) : null}

      {!isLoading && applicants.length === 0 && !error ? (
        <Card>
          <p className="text-sm text-slate-600">
            No applications yet for this internship.
          </p>
        </Card>
      ) : null}

      {!isLoading && applicants.length > 0 ? (
        <Card className="overflow-hidden p-0">
          <Table
            columns={[
              "Applicant",
              "Internship",
              "Status",
              "Applied At",
              "Highlights",
              "Actions",
            ]}
            rows={applicants}
            renderRow={(row) => (
              <tr
                key={row.id}
                className="cursor-pointer border-t border-slate-100 transition-colors hover:bg-slate-50/80"
                onClick={() => openDetailsPage(row)}
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    {row.traineeProfilePicture ? (
                      <img
                        src={row.traineeProfilePicture}
                        alt={row.traineeName}
                        className="h-11 w-11 rounded-2xl border border-slate-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-200/70 text-sm font-bold text-slate-700">
                        {getInitials(row.traineeName)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-900">
                        {row.traineeName}
                      </p>
                      <p className="text-xs text-slate-500">
                        Application #{row.id}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <p className="font-medium text-slate-900">
                    {row.internshipTitle}
                  </p>
                  <p className="text-xs text-slate-500">
                    ID #{row.internshipId}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[row.status] || "border-slate-200 bg-slate-50 text-slate-700"}`}
                  >
                    {statusLabels[row.status] || row.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">
                  {formatDateTime(row.appliedAt)}
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                      <School className="h-3.5 w-3.5" />
                      {row.traineeUniversity}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                      <GraduationCap className="h-3.5 w-3.5" />
                      {row.traineeMajor}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                      <Code2 className="h-3.5 w-3.5" />
                      {row.codeLanguage}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className="inline-flex items-center gap-2"
                      onClick={(event) => {
                        event.stopPropagation();
                        openDetailsPage(row);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                      Details
                    </Button>
                  </div>
                </td>
              </tr>
            )}
          />
        </Card>
      ) : null}
    </div>
  );
};

const StatPill = ({ icon, label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        {icon}
      </span>
    </div>
    <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
      {value}
    </p>
  </div>
);

export default ApplicantsPage;
