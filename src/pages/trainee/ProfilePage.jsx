import { useCallback, useEffect, useMemo, useState } from "react";
import { UploadCloud, WandSparkles } from "lucide-react";
import Card from "@/components/common/Card";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import LoadingOverlay from "@/components/common/LoadingOverlay";
import SkillBadge from "@/components/common/SkillBadge";
import { useTraineeStore } from "@/store/traineeStore";
import {
  extractSkillsFromCV,
  insertExtractedSkillsForTrainee,
} from "@/services/cvService";
import {
  getTraineeProgress,
  getTraineeSkills,
} from "@/services/traineeService";
import { useAuthStore } from "@/store/authStore";
import { notify } from "@/utils/notify";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const normalizeSkillsPayload = (payload) => {
  const skills = payload?.data?.skills || payload?.skills || [];
  return Array.isArray(skills)
    ? skills.map((item, index) => ({
        id: Number(item?.skill_id ?? item?.id) || index + 1,
        name: item?.skill_name || item?.name || `Skill ${index + 1}`,
        progress:
          Number(item?.progress ?? item?.score ?? item?.skill_progress ?? 0) ||
          0,
      }))
    : [];
};

const normalizeSkillNames = (payload) => {
  const rawSkills =
    payload?.data?.skills ?? payload?.skills ?? payload?.data ?? payload ?? [];

  if (!Array.isArray(rawSkills)) {
    return [];
  }

  return rawSkills
    .map((item) =>
      typeof item === "string"
        ? item.trim()
        : String(item?.name ?? item?.skill_name ?? "").trim(),
    )
    .filter(Boolean);
};

const buildProfileForm = (user) => {
  const details = user?.details || {};

  return {
    fullName: user?.name || details?.name || "",
    email: user?.email || details?.email || "",
    phone: details?.phone || user?.phone || "",
    university: details?.university || user?.university || "",
    // TODO: Re-enable bio field when backend/database support is added.
  };
};

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

const hasAnyText = (value) => String(value ?? "").trim().length > 0;

const hasCompleteProfileInfo = (form) =>
  hasAnyText(form?.fullName) &&
  hasAnyText(form?.email) &&
  hasAnyText(form?.phone) &&
  hasAnyText(form?.university);

const hasCvFromPayload = (payload) =>
  toBoolean(payload?.data?.has_cv) ||
  toBoolean(payload?.data?.cv_uploaded) ||
  toBoolean(payload?.data?.hasCv) ||
  toBoolean(payload?.data?.cvUploaded) ||
  toBoolean(payload?.has_cv) ||
  toBoolean(payload?.cv_uploaded) ||
  toBoolean(payload?.hasCv) ||
  toBoolean(payload?.cvUploaded) ||
  hasAnyText(payload?.data?.cv_file) ||
  hasAnyText(payload?.data?.cv_url) ||
  hasAnyText(payload?.data?.resume_url) ||
  hasAnyText(payload?.cv_file) ||
  hasAnyText(payload?.cv_url) ||
  hasAnyText(payload?.resume_url);

const TraineeProfilePage = () => {
  const [manualSkill, setManualSkill] = useState("");
  const [isSavingSkills, setIsSavingSkills] = useState(false);
  const [profileForm, setProfileForm] = useState(() => buildProfileForm(null));
  const [profileProgress, setProfileProgress] = useState(0);
  const [skillProgress, setSkillProgress] = useState([]);
  const [isProgressLoading, setIsProgressLoading] = useState(false);
  const [isSavedSkillsLoading, setIsSavedSkillsLoading] = useState(false);
  const { user } = useAuthStore();
  const traineeId = Number(user?.id);

  useEffect(() => {
    setProfileForm(buildProfileForm(user));
  }, [user]);

  const {
    cvFile,
    hasCvUploaded,
    extractedSkills,
    savedSkills,
    isExtracting,
    extractionError,
    setCvFile,
    setHasCvUploaded,
    startExtraction,
    finishExtraction,
    setExtractedSkills,
    setExtractionError,
    removeSkill,
    addSkill,
    setSavedSkills,
  } = useTraineeStore();

  const hasProfileInfo = useMemo(
    () => hasCompleteProfileInfo(profileForm),
    [profileForm],
  );

  const hasUploadedCv = Boolean(cvFile) || Boolean(hasCvUploaded);
  const hasReadinessData = hasUploadedCv || hasProfileInfo;
  const hasAnySkills = useMemo(
    () => extractedSkills.length > 0 || savedSkills.length > 0,
    [extractedSkills, savedSkills],
  );
  const canApply = hasReadinessData && hasAnySkills;
  const profileCompletion = useMemo(
    () => Math.max(profileProgress, canApply ? 100 : 0),
    [profileProgress, canApply],
  );

  const loadTraineeProgress = useCallback(async () => {
    if (!traineeId) return;
    setIsProgressLoading(true);
    try {
      const response = await getTraineeProgress(traineeId);
      const rawProgress =
        response?.data?.overall_progress ??
        response?.overall_progress ??
        response?.data?.overallProgress ??
        response?.overallProgress ??
        response?.data?.profile_completion ??
        response?.profile_completion ??
        0;

      const hasCvFromApi = hasCvFromPayload(response);

      const hasCvLocal =
        Boolean(cvFile) || Boolean(hasCvUploaded) || hasCvFromApi;
      const hasReadinessLocal = hasCvLocal || hasProfileInfo;
      const hasSkillsLocal = hasAnySkills;

      const normalizedProgress = toProgressNumber(rawProgress);
      const computedProgress =
        hasReadinessLocal && hasSkillsLocal
          ? 100
          : hasReadinessLocal || hasSkillsLocal
            ? 50
            : 0;

      setProfileProgress(Math.max(normalizedProgress, computedProgress));
      setSkillProgress(normalizeSkillsPayload(response));
    } catch (error) {
      const hasCvLocal = Boolean(cvFile) || Boolean(hasCvUploaded);
      const hasReadinessLocal = hasCvLocal || hasProfileInfo;
      const hasSkillsLocal = hasAnySkills;

      setProfileProgress(
        hasReadinessLocal && hasSkillsLocal
          ? 100
          : hasReadinessLocal || hasSkillsLocal
            ? 50
            : 0,
      );
      notify.error(error?.message, "Failed to load profile progress.");
    } finally {
      setIsProgressLoading(false);
    }
  }, [traineeId, cvFile, hasCvUploaded, hasAnySkills, hasProfileInfo]);

  const loadTraineeSkills = useCallback(async () => {
    if (!traineeId) return;
    setIsSavedSkillsLoading(true);
    try {
      const response = await getTraineeSkills(traineeId);
      const normalized = normalizeSkillNames(response);
      setSavedSkills(normalized);
    } catch (error) {
      setSavedSkills([]);
    } finally {
      setIsSavedSkillsLoading(false);
    }
  }, [setSavedSkills, traineeId]);

  useEffect(() => {
    if (!traineeId) return;
    loadTraineeProgress();
    loadTraineeSkills();
    // This effect should run on identity change only, not on local form/skills edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [traineeId]);

  const handleFile = (file) => {
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      notify.error(
        "Invalid file type. Use PDF, DOC, or DOCX.",
        "Invalid file type.",
      );
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      notify.error("File exceeds 5MB limit.", "File size is too large.");
      return;
    }
    setHasCvUploaded(true);
    setCvFile(file);
  };

  const handleExtract = async () => {
    if (!cvFile) return;
    startExtraction();
    try {
      const extractionResult = await extractSkillsFromCV(cvFile);

      const extracted =
        extractionResult?.extractedSkills ||
        extractionResult?.skills ||
        extractionResult?.data?.skills ||
        [];

      if (!extracted.length) {
        throw new Error("Extraction failed");
      }

      setExtractedSkills(extracted);
      notify.success("Skills extracted. Press Save Skills to store them.");
    } catch (error) {
      setExtractionError(error.message || "Failed to extract skills");
      notify.error(error?.message, "AI extraction failed. Please try again.");
    } finally {
      finishExtraction();
    }
  };

  const handleAddSkill = () => {
    const value = manualSkill.trim();
    if (!value) return;
    addSkill(value);
    setManualSkill("");
  };

  const handleSaveSkills = async () => {
    if (!traineeId) {
      notify.error("Trainee account not found. Please sign in again.");
      return;
    }

    if (!extractedSkills.length) {
      notify.error("No extracted skills found. Please extract skills first.");
      return;
    }

    setIsSavingSkills(true);
    try {
      await insertExtractedSkillsForTrainee(traineeId, cvFile, extractedSkills);
      await loadTraineeProgress();
      await loadTraineeSkills();
      notify.success("Skills saved successfully.");
    } catch (error) {
      notify.error(error?.message, "Unable to save skills.");
    } finally {
      setIsSavingSkills(false);
    }
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = () => {
    notify.success("Profile updated locally from login data.");
  };

  return (
    <div className="space-y-6">
      <Card className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Profile Management
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
            Trainee Profile
          </h1>
        </div>
        <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-700">
              Profile completion
            </span>
            <span className="font-bold text-slate-900">
              {profileCompletion}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[#164616]"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">
            {canApply
              ? "Profile is ready for internship applications."
              : !hasAnySkills
                ? "Save at least one skill to complete your profile readiness."
                : "Complete your profile information (or upload CV) to finish readiness."}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Full Name"
            name="fullName"
            onChange={handleProfileChange}
            value={profileForm.fullName}
          />
          <Input
            label="Email"
            name="email"
            onChange={handleProfileChange}
            value={profileForm.email}
          />
          <Input
            label="Phone"
            name="phone"
            onChange={handleProfileChange}
            value={profileForm.phone}
          />
          <Input
            label="University"
            name="university"
            onChange={handleProfileChange}
            value={profileForm.university}
          />
        </div>
        <Button
          className="!bg-[#164616] hover:!bg-[#123a12]"
          onClick={handleSaveProfile}
          type="button"
        >
          Save Profile
        </Button>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Skills and Resume</h2>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <input
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0])}
            type="file"
          />
          <UploadCloud className="mb-2 h-8 w-8 text-slate-500" />
          <p className="font-semibold text-slate-800">
            Drag and drop your CV or click to upload
          </p>
          <p className="text-xs text-slate-500">PDF, DOC, DOCX up to 5MB</p>
        </label>

        {cvFile ? (
          <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-600">
            <p>
              <strong>File:</strong> {cvFile.name}
            </p>
            <p>
              <strong>Size:</strong> {(cvFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : null}

        {cvFile ? (
          <Button
            className="inline-flex items-center gap-2 !bg-[#164616] hover:!bg-[#123a12]"
            onClick={handleExtract}
          >
            <WandSparkles className="h-4 w-4" /> Extract skills with AI
          </Button>
        ) : null}

        {extractionError ? (
          <div className="rounded-lg bg-rose-100 p-3 text-sm text-rose-700">
            {extractionError}
          </div>
        ) : null}

        {extractedSkills.length ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700">
              {extractedSkills.length} extracted skills
            </p>
            <div className="flex flex-wrap gap-2">
              {extractedSkills.map((skill) => (
                <SkillBadge key={skill} onRemove={removeSkill} skill={skill} />
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                onChange={(event) => setManualSkill(event.target.value)}
                placeholder="Add skill manually"
                value={manualSkill}
              />
              <Button onClick={handleAddSkill} type="button" variant="ghost">
                Add
              </Button>
            </div>
            <Button
              className="!bg-[#164616] hover:!bg-[#123a12]"
              disabled={isSavingSkills}
              onClick={handleSaveSkills}
            >
              {isSavingSkills ? "Saving..." : "Save Skills"}
            </Button>
          </div>
        ) : null}

        {isSavedSkillsLoading ? (
          <div className="rounded-xl bg-emerald-50 p-3">
            <p className="text-sm text-emerald-900">Loading saved skills...</p>
          </div>
        ) : savedSkills.length ? (
          <div className="rounded-xl bg-emerald-50 p-3">
            <p className="text-sm font-semibold text-emerald-900">
              Saved Skills
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {savedSkills.map((skill) => (
                <SkillBadge key={skill} skill={skill} />
              ))}
            </div>
          </div>
        ) : null}

        <div className="space-y-3 rounded-xl border border-slate-200 p-3">
          <p className="text-sm font-semibold text-slate-900">
            Skills progress
          </p>
          {isProgressLoading ? (
            <p className="text-sm text-slate-600">Loading progress...</p>
          ) : skillProgress.length ? (
            <div className="space-y-2">
              {skillProgress.map((skill) => (
                <div
                  key={skill.id}
                  className="rounded-lg border border-slate-200 p-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">
                      {skill.name}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {skill.progress}%
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-emerald-600"
                      style={{
                        width: `${Math.min(Math.max(skill.progress, 0), 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              No skill progress found yet.
            </p>
          )}
        </div>
      </Card>

      <LoadingOverlay
        message="Reading CV and extracting skills..."
        show={isExtracting}
      />
    </div>
  );
};

export default TraineeProfilePage;
