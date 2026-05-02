import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Code2,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  School,
} from "lucide-react";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import {
  getInternshipApplications,
  reviewApplication,
} from "@/services/applicationService";
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

const normalizeApplicant = (item, fallbackInternshipId) => ({
  id: Number(item.application_id || item.id),
  internshipId: Number(item.internship_id || fallbackInternshipId),
  internshipTitle: item.internship_title || "Untitled Internship",
  traineeId: Number(item.trainee_id) || null,
  status: normalizeStatus(item.status),
  traineeName: item.trainee_name || item.name || "Unknown",
  traineeEmail: item.trainee_email || item.email || "N/A",
  traineePhone: item.trainee_phone || item.phone || "N/A",
  traineeGender: item.trainee_gender || "N/A",
  traineeCity: item.trainee_city || "N/A",
  traineeUniversity: item.trainee_university || item.university || "N/A",
  traineeMajor: item.trainee_major || item.major || "N/A",
  traineeGraduationYear: item.trainee_graduation_year || "N/A",
  traineeSkills: Array.isArray(item.trainee_skills) ? item.trainee_skills : [],
  traineeCvFile: item.trainee_cv_file || item.cv_file || "",
  traineeProfilePicture:
    item.trainee_profile_picture ||
    item.profile_picture ||
    item.profilePicture ||
    item.avatar_url ||
    item.avatar ||
    "",
  traineeCreatedAt: item.trainee_created_at || "",
  traineeUpdatedAt: item.trainee_updated_at || "",
  coverLetter: item.cover_letter || "",
  notes: item.notes || "",
  quizScore: item.quiz_score,
  quizCompleted: Boolean(item.quiz_completed),
  quizSubmittedAt: item.quiz_submitted_at || "",
  submittedCode: item.submitted_code || item.code_solution || "",
  codeLanguage: item.code_language || "N/A",
  codeSubmittedAt: item.code_submitted_at || "",
  appliedAt: item.applied_at || "",
  reviewedAt: item.reviewed_at || "",
});

const getInitials = (name) =>
  String(name || "Applicant")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "AP";

const isLikelyImageUrl = (value) => {
  if (!value) return false;
  const clean = String(value).split("?")[0].toLowerCase();
  return [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"].some((ext) =>
    clean.endsWith(ext),
  );
};

const isLikelyPdfUrl = (value) => {
  if (!value) return false;
  const clean = String(value).split("?")[0].toLowerCase();
  return clean.endsWith(".pdf");
};

const formatSubmittedCode = (value, language) => {
  const raw = String(value || "").trim();
  if (!raw) return "N/A";

  if (String(language || "").toLowerCase() === "json") {
    try {
      return JSON.stringify(JSON.parse(raw), null, 2);
    } catch {
      return raw;
    }
  }

  return raw;
};

const ApplicantDetailsPage = () => {
  const { internshipId, applicationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [applicant, setApplicant] = useState(() => {
    const stateApplicant = location.state?.applicant;
    if (stateApplicant) return stateApplicant;

    try {
      const cached = sessionStorage.getItem("company:selected-applicant");
      if (!cached) return null;
      const parsed = JSON.parse(cached);
      return Number(parsed?.id) === Number(applicationId) ? parsed : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [profileImageFailed, setProfileImageFailed] = useState(false);

  useEffect(() => {
    setProfileImageFailed(false);
  }, [applicant?.id, applicant?.traineeProfilePicture]);

  useEffect(() => {
    const loadIfMissing = async () => {
      if (applicant || !internshipId || !applicationId) return;

      setIsLoading(true);
      try {
        const response = await getInternshipApplications(Number(internshipId));
        const list = Array.isArray(response?.data) ? response.data : [];
        const matched = list.find(
          (item) =>
            Number(item.application_id || item.id) === Number(applicationId),
        );

        if (!matched) {
          setIsNotFound(true);
          return;
        }

        const normalized = normalizeApplicant(matched, internshipId);
        setApplicant(normalized);
        sessionStorage.setItem(
          "company:selected-applicant",
          JSON.stringify(normalized),
        );
      } catch {
        setIsNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadIfMissing();
  }, [applicant, applicationId, internshipId]);

  const backTarget = useMemo(
    () => `/company/applicants/${internshipId || ""}`,
    [internshipId],
  );

  const formattedSubmittedCode = useMemo(
    () =>
      formatSubmittedCode(applicant?.submittedCode, applicant?.codeLanguage),
    [applicant?.codeLanguage, applicant?.submittedCode],
  );

  const handleReview = async (status) => {
    if (!applicant?.id) return;

    const noteValue =
      window.prompt("Add optional notes for this decision:", "") || "";

    setActionLoading(true);
    try {
      await reviewApplication(applicationId || applicant.id, status, noteValue);

      const updated = {
        ...applicant,
        status,
        notes: noteValue || applicant.notes,
        reviewedAt: new Date().toISOString(),
      };

      setApplicant(updated);
      sessionStorage.setItem(
        "company:selected-applicant",
        JSON.stringify(updated),
      );

      notify.success(
        status === "accepted"
          ? "Applicant accepted successfully."
          : "Applicant rejected successfully.",
      );
    } catch (err) {
      notify.error(err?.message || "Failed to review application.");
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-slate-600 dark:text-muted-foreground">
          Loading applicant details...
        </p>
      </Card>
    );
  }

  if (isNotFound || !applicant) {
    return (
      <Card className="space-y-3">
        <p className="text-base font-semibold text-slate-900 dark:text-foreground">
          Applicant details not found
        </p>
        <p className="text-sm text-slate-600 dark:text-muted-foreground">
          We could not find this applicant record. Go back to the applicants
          list and open it again.
        </p>
        <div>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(backTarget)}
          >
            Back to applicants
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-2 border-slate-200 bg-gradient-to-br from-white via-slate-50 to-emerald-50/50 shadow-sm dark:border-border/70 dark:bg-card dark:bg-none dark:shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
              Applicant profile
            </p>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-foreground">
              {applicant.traineeName}
            </h2>
            <p className="text-sm text-slate-600 dark:text-muted-foreground">
              {applicant.internshipTitle}
            </p>
          </div>

          <Link
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted/60"
            to={backTarget}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to applicants
          </Link>
        </div>
      </Card>

      <Card className="space-y-5 border-slate-200 bg-card/95 shadow-lg dark:border-border/70">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {applicant.traineeProfilePicture && !profileImageFailed ? (
              <img
                src={applicant.traineeProfilePicture}
                alt={applicant.traineeName}
                className="h-16 w-16 rounded-2xl border border-slate-200 object-cover"
                onError={() => setProfileImageFailed(true)}
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-200/80 text-lg font-bold text-slate-700 dark:border-border dark:bg-muted dark:text-foreground">
                {getInitials(applicant.traineeName)}
              </div>
            )}

            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-foreground">
                {applicant.traineeName}
              </h3>
              <p className="text-sm text-slate-600 dark:text-muted-foreground">
                Application #{applicant.id} · Trainee #
                {applicant.traineeId || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[applicant.status] || "border-slate-200 bg-slate-50 text-slate-700"}`}
            >
              {statusLabels[applicant.status] || applicant.status}
            </span>
            {applicant.status === "applied" ? (
              <>
                <Button
                  type="button"
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                  disabled={actionLoading}
                  onClick={() => handleReview("accepted")}
                >
                  {applicant.status === "accepted" ? "Accepted" : "Accept"}
                </Button>
                <Button
                  type="button"
                  className="bg-rose-600 text-white hover:bg-rose-700"
                  disabled={actionLoading}
                  onClick={() => handleReview("rejected")}
                >
                  {applicant.status === "rejected" ? "Rejected" : "Reject"}
                </Button>
              </>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <DetailCard
            icon={<Mail className="h-4 w-4" />}
            label="Email"
            value={applicant.traineeEmail}
          />
          <DetailCard
            icon={<Phone className="h-4 w-4" />}
            label="Phone"
            value={applicant.traineePhone}
          />
          <DetailCard
            icon={<MapPin className="h-4 w-4" />}
            label="City"
            value={applicant.traineeCity}
          />
          <DetailCard
            icon={<School className="h-4 w-4" />}
            label="University"
            value={applicant.traineeUniversity}
          />
          <DetailCard
            icon={<GraduationCap className="h-4 w-4" />}
            label="Major"
            value={applicant.traineeMajor}
          />
          <DetailCard
            icon={<BriefcaseBusiness className="h-4 w-4" />}
            label="Graduation Year"
            value={applicant.traineeGraduationYear}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard
            title="Training Overview"
            icon={<BriefcaseBusiness className="h-4 w-4" />}
          >
            <InfoRow
              label="Applied At"
              value={formatDateTime(applicant.appliedAt)}
            />
            <InfoRow
              label="Reviewed At"
              value={formatDateTime(applicant.reviewedAt)}
            />
            <InfoRow label="Quiz Score" value={applicant.quizScore ?? "N/A"} />
            <InfoRow
              label="Quiz Completed"
              value={applicant.quizCompleted ? "Yes" : "No"}
            />
            <InfoRow
              label="Quiz Submitted At"
              value={formatDateTime(applicant.quizSubmittedAt)}
            />
            <InfoRow label="Code Language" value={applicant.codeLanguage} />
            <InfoRow
              label="Code Submitted At"
              value={formatDateTime(applicant.codeSubmittedAt)}
            />
            <InfoRow
              label="Created At"
              value={formatDateTime(applicant.traineeCreatedAt)}
            />
            <InfoRow
              label="Updated At"
              value={formatDateTime(applicant.traineeUpdatedAt)}
            />
          </SectionCard>

          <SectionCard
            title="Skills & Documents"
            icon={<FileText className="h-4 w-4" />}
          >
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-muted-foreground">
                  Skills
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {applicant.traineeSkills.length > 0 ? (
                    applicant.traineeSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-slate-600 dark:text-muted-foreground">
                      No skills listed.
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <DocumentCard
                  label="CV File"
                  href={applicant.traineeCvFile}
                  isImage={isLikelyImageUrl(applicant.traineeCvFile)}
                  isPdf={isLikelyPdfUrl(applicant.traineeCvFile)}
                  className="sm:col-span-2"
                />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-muted-foreground">
                  Cover Letter
                </p>
                <p className="mt-2 whitespace-pre-wrap rounded-2xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-muted dark:text-foreground">
                  {applicant.coverLetter || "N/A"}
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        <SectionCard
          title="Submitted Code"
          icon={<Code2 className="h-4 w-4" />}
        >
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-muted-foreground">
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700 dark:bg-muted dark:text-foreground">
                {applicant.codeLanguage}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700 dark:bg-muted dark:text-foreground">
                {applicant.quizCompleted
                  ? "Quiz completed"
                  : "Quiz not completed"}
              </span>
            </div>

            <pre className="max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
              <code className="block whitespace-pre-wrap [overflow-wrap:anywhere]">
                {formattedSubmittedCode}
              </code>
            </pre>
          </div>
        </SectionCard>

        <SectionCard
          title="Reviewer Notes"
          icon={<FileText className="h-4 w-4" />}
        >
          <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-muted-foreground">
            {applicant.notes || "No review notes yet."}
          </p>
        </SectionCard>
      </Card>
    </div>
  );
};

const SectionCard = ({ title, icon, children }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-border/70 dark:bg-card">
    <div className="mb-4 flex items-center gap-2">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-muted dark:text-foreground">
        {icon}
      </span>
      <h4 className="text-sm font-semibold text-slate-900 dark:text-foreground">
        {title}
      </h4>
    </div>
    {children}
  </div>
);

const DetailCard = ({ icon, label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-border/70 dark:bg-muted/40">
    <div className="flex items-center gap-2 text-slate-500 dark:text-muted-foreground">
      {icon}
      <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
    </div>
    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-foreground">
      {value || "N/A"}
    </p>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2 last:border-b-0 dark:border-border/70">
    <span className="text-sm text-slate-500 dark:text-muted-foreground">
      {label}
    </span>
    <span className="text-right text-sm font-medium text-slate-900 dark:text-foreground">
      {value}
    </span>
  </div>
);

const DocumentCard = ({
  label,
  href,
  isImage = false,
  isPdf = false,
  className = "",
}) => (
  <div
    className={`rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-border/70 dark:bg-muted/40 ${className}`}
  >
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-muted-foreground">
      {label}
    </p>
    {href ? (
      <div className="mt-2 space-y-2">
        {isImage ? (
          <img
            src={href}
            alt={label}
            className="h-28 w-full rounded-xl border border-slate-200 object-cover dark:border-border/70"
          />
        ) : null}
        {isPdf ? (
          <iframe
            src={href}
            title={`${label} preview`}
            className="h-64 w-full rounded-xl border border-slate-200 bg-white dark:border-border/70"
          />
        ) : null}
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-300"
        >
          Open file
        </a>
      </div>
    ) : (
      <p className="mt-2 text-sm text-slate-600 dark:text-muted-foreground">
        N/A
      </p>
    )}
  </div>
);

export default ApplicantDetailsPage;
