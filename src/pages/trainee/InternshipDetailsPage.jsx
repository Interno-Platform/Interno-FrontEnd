import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { CalendarDays, Clock3, Layers3, MapPin, Users } from "lucide-react";
import Card from "@/components/common/Card";
import { applyForInternship } from "@/services/applicationService";
import { getInternshipById } from "@/services/internshipDiscoveryService";
import {
  getTraineeProgress,
  getTraineeSkills,
} from "@/services/traineeService";
import { useAuthStore } from "@/store/authStore";
import { useTraineeStore } from "@/store/traineeStore";
import { notify } from "@/utils/notify";

const toBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  }
  return false;
};

const toProgressNumber = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace("%", ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const InternshipDetailsPage = () => {
  const { internshipId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    cvFile,
    hasCvUploaded,
    savedSkills: localSavedSkills,
  } = useTraineeStore();

  const [internship, setInternship] = useState(
    location.state?.internship || null,
  );
  const [coverLetter, setCoverLetter] = useState("");
  const [isLoading, setIsLoading] = useState(!location.state?.internship);
  const [isApplying, setIsApplying] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [profileProgress, setProfileProgress] = useState(0);
  const [isProgressLoading, setIsProgressLoading] = useState(false);
  const [profileReady, setProfileReady] = useState(false);
  const [savedSkills, setSavedSkills] = useState([]);

  useEffect(() => {
    if (location.state?.internship) {
      return;
    }

    const loadInternship = async () => {
      setIsLoading(true);
      setLoadError("");
      try {
        const data = await getInternshipById(internshipId);
        if (!data) {
          throw new Error("Internship not found.");
        }
        setInternship(data);
      } catch (error) {
        setLoadError(error?.message || "Unable to load internship details.");
      } finally {
        setIsLoading(false);
      }
    };

    loadInternship();
  }, [internshipId, location.state?.internship]);

  const traineeId = Number(user?.id);
  const normalizedSavedSkills = useMemo(
    () =>
      (Array.isArray(savedSkills) ? savedSkills : [])
        .map((skill) =>
          String(skill || "")
            .trim()
            .toLowerCase(),
        )
        .filter(Boolean),
    [savedSkills],
  );

  const hasRequiredSkillMatch = useMemo(() => {
    const internshipSkills = Array.isArray(internship?.skills)
      ? internship.skills
          .map((skill) =>
            String(skill || "")
              .trim()
              .toLowerCase(),
          )
          .filter(Boolean)
      : [];

    if (!internshipSkills.length) {
      return false;
    }

    const savedSet = new Set(normalizedSavedSkills);
    return internshipSkills.some((skill) => savedSet.has(skill));
  }, [internship?.skills, normalizedSavedSkills]);

  useEffect(() => {
    if (!traineeId) return;

    const loadProgress = async () => {
      setIsProgressLoading(true);
      try {
        const [progressResult, skillsResult] = await Promise.allSettled([
          getTraineeProgress(traineeId),
          getTraineeSkills(traineeId),
        ]);

        const response =
          progressResult.status === "fulfilled" ? progressResult.value : null;
        const skillsResponse =
          skillsResult.status === "fulfilled" ? skillsResult.value : null;

        const progressValue =
          response?.data?.overall_progress ??
          response?.overall_progress ??
          response?.data?.overallProgress ??
          response?.overallProgress ??
          response?.data?.profile_completion ??
          response?.profile_completion ??
          0;

        const savedSkillsList =
          skillsResponse?.data?.skills ??
          skillsResponse?.skills ??
          skillsResponse?.data ??
          response?.data?.skills ??
          skillsResponse ??
          [];

        const normalizedSkills = Array.isArray(savedSkillsList)
          ? savedSkillsList
              .map((item) =>
                typeof item === "string"
                  ? item.trim()
                  : String(item?.name ?? item?.skill_name ?? "").trim(),
              )
              .filter(Boolean)
          : [];

        const hasSkills = normalizedSkills.length > 0 || [];
        const hasCv =
          toBoolean(response?.data?.has_cv) ||
          toBoolean(response?.data?.cv_uploaded) ||
          toBoolean(response?.data?.hasCv) ||
          toBoolean(response?.data?.cvUploaded) ||
          toBoolean(response?.has_cv) ||
          toBoolean(response?.cv_uploaded) ||
          toBoolean(response?.hasCv) ||
          toBoolean(response?.cvUploaded) ||
          Boolean(cvFile) ||
          Boolean(hasCvUploaded);

        const normalizedProgress = toProgressNumber(progressValue);
        const computedProgress =
          hasCv && hasSkills ? 100 : hasCv || hasSkills ? 50 : 0;

        setProfileProgress(Math.max(normalizedProgress, computedProgress));
        setSavedSkills(
          normalizedSkills.length ? normalizedSkills : localSavedSkills,
        );
        setProfileReady(hasCv && hasSkills);
      } catch (error) {
        const hasLocalSkills = localSavedSkills.length > 0;
        const hasLocalCv = Boolean(cvFile) || Boolean(hasCvUploaded);

        setProfileProgress(
          hasLocalCv && hasLocalSkills
            ? 100
            : hasLocalCv || hasLocalSkills
              ? 50
              : 0,
        );
        setSavedSkills(localSavedSkills);
        setProfileReady(hasLocalCv && hasLocalSkills);

        notify.error(error?.message, "Failed to load profile progress.");
      } finally {
        setIsProgressLoading(false);
      }
    };

    loadProgress();
  }, [traineeId, cvFile, hasCvUploaded, localSavedSkills]);

  const handleApply = async () => {
    if (!internship) {
      return;
    }

    if (!traineeId) {
      notify.error("Trainee account not found. Please sign in again.");
      return;
    }

    if (!profileReady) {
      notify.info(
        `Profile completion is ${profileProgress}%. Please upload CV and save your skills first.`,
      );
      navigate("/trainee/profile", {
        state: { from: location.pathname },
      });
      return;
    }

    if (!hasRequiredSkillMatch) {
      notify.info(
        "You need at least one matching required skill to apply for this internship.",
      );
      return;
    }

    setIsApplying(true);
    try {
      await applyForInternship(
        traineeId,
        internship.id,
        coverLetter.trim() || undefined,
      );
      notify.success("Application submitted successfully.");
      navigate(`/trainee/assessments/${internship.id}/instructions`, {
        state: {
          internship,
          traineeId,
          examId: internship.examId,
        },
      });
    } catch (error) {
      notify.error(error?.message, "Failed to submit application.");
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-slate-600">Loading internship details...</p>
      </Card>
    );
  }

  if (!internship || loadError) {
    return (
      <Card className="border-rose-200 bg-rose-50/70">
        <p className="text-sm text-rose-700">
          {loadError || "Internship not found."}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Internship details
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {internship.title}
            </h1>
            <p className="text-sm text-slate-600">{internship.company}</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {internship.status}
          </span>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1">
            <MapPin className="h-4 w-4" /> {internship.location}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1">
            <Clock3 className="h-4 w-4" /> {internship.workType}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1">
            <CalendarDays className="h-4 w-4" /> Deadline:{" "}
            {internship.deadline || "Open until filled"}
          </span>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <Card className="space-y-4">
          <section>
            <h2 className="text-lg font-bold text-slate-900">Role overview</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {internship.summary ||
                "You will contribute to production-ready features and collaborate with mentors during your internship period."}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">
              Required skills
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {internship.skills.length ? (
                internship.skills.map((skill) => (
                  <span
                    key={`${internship.id}-${skill}`}
                    className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-500">
                  Skills are not available for this internship.
                </span>
              )}
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">Cover letter</h2>
            <textarea
              className="field-input min-h-28"
              onChange={(event) => setCoverLetter(event.target.value)}
              placeholder="Write a short cover letter (optional)"
              rows={5}
              value={coverLetter}
            />
          </section>
        </Card>

        <Card className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900">Internship Stats</h3>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">
                Profile completion
              </span>
              <span className="font-bold text-slate-900">
                {isProgressLoading ? "..." : `${profileProgress}%`}
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-[#164616]"
                style={{
                  width: `${Math.min(Math.max(profileProgress, 0), 100)}%`,
                }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {profileReady
                ? "You are ready to apply."
                : "Upload CV and save extracted skills in your profile to unlock Apply."}
            </p>
          </div>
          <p className="inline-flex items-center gap-2 mr-5 text-sm text-slate-600">
            <Users className="h-4 w-4" /> Applicants: {internship.applicants}
          </p>
          <p className="inline-flex items-center gap-2 text-sm text-slate-600">
            <Layers3 className="h-4 w-4" /> Open Slots: {internship.seats}
          </p>

          <button
            className="inline-flex w-full justify-center rounded-lg bg-[#164616] px-4 py-2 text-sm font-semibold text-white hover:bg-[#123a12] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={
              isApplying ||
              isProgressLoading ||
              !profileReady ||
              !hasRequiredSkillMatch
            }
            onClick={handleApply}
            type="button"
            title={
              profileReady && hasRequiredSkillMatch
                ? "Apply for this internship"
                : !profileReady
                  ? "Complete profile: upload CV and save skills first"
                  : "You need at least one required matching skill"
            }
          >
            {isApplying
              ? "Submitting..."
              : profileReady && hasRequiredSkillMatch
                ? "Apply for this internship"
                : !profileReady
                  ? "Complete profile before apply"
                  : "No matching skill for this internship"}
          </button>
          {!profileReady ? (
            <Link
              className="inline-flex w-full justify-center rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100"
              to="/trainee/profile"
            >
              Go to profile and upload CV
            </Link>
          ) : null}
          {profileReady && !hasRequiredSkillMatch ? (
            <p className="text-xs text-amber-700">
              This internship requires at least one skill that exists in your
              saved profile skills.
            </p>
          ) : null}
          <Link
            className="inline-flex w-full justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            to="/trainee/internships"
          >
            Back to internships
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default InternshipDetailsPage;
