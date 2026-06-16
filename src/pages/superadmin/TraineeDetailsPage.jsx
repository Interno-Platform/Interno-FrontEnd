import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import { changeTraineeStatus, getAllTrainees } from "@/services/adminService";
import { formatDate } from "@/utils/helpers";
import { notify } from "@/utils/notify";

const toSkills = (skillsValue) => {
  if (Array.isArray(skillsValue)) {
    return skillsValue.filter(Boolean);
  }

  if (typeof skillsValue === "string") {
    const trimmed = skillsValue.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return trimmed
        .split(/[\n,]+/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
};

const TraineeDetailsPage = () => {
  const navigate = useNavigate();
  const { traineeId } = useParams();
  const location = useLocation();

  const [trainee, setTrainee] = useState(location.state?.trainee || null);
  const [isLoading, setIsLoading] = useState(!location.state?.trainee);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (location.state?.trainee) return;

    const loadTrainee = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await getAllTrainees();
        const list = Array.isArray(response?.data) ? response.data : [];
        const match = list.find(
          (item) => String(item?.id) === String(traineeId),
        );

        if (!match) {
          setLoadError("Trainee not found.");
          setTrainee(null);
          return;
        }

        setTrainee(match);
      } catch (error) {
        setLoadError(error?.message || "Unable to load trainee profile.");
      } finally {
        setIsLoading(false);
      }
    };

    loadTrainee();
  }, [location.state?.trainee, traineeId]);

  const skills = useMemo(() => toSkills(trainee?.skills), [trainee?.skills]);
  const isActive = Number(trainee?.is_active ?? 1) === 1;

  const handleDeactivate = async () => {
    const targetUserId = trainee?.user_id || trainee?.id;
    if (!targetUserId) {
      notify.error("Unable to determine trainee account id.");
      return;
    }

    setIsUpdating(true);
    try {
      await changeTraineeStatus(targetUserId, false);
      setTrainee((prev) => (prev ? { ...prev, is_active: 0 } : prev));
      notify.success("Trainee deactivated successfully.");
    } catch (error) {
      notify.error(error?.message, "Failed to deactivate trainee.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-slate-600">Loading trainee profile...</p>;
  }

  if (loadError) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-rose-200 bg-rose-50/70 px-4 py-3 text-sm text-rose-700">
          {loadError}
        </div>
        <Button
          variant="ghost"
          onClick={() => navigate("/superadmin/trainees")}
        >
          Back to Trainees
        </Button>
      </div>
    );
  }

  if (!trainee) {
    return null;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-800">{isActive ? "Active" : "Inactive"}</Badge>
          <Button
            variant="danger"
            onClick={handleDeactivate}
            disabled={!isActive || isUpdating}
          >
            {isUpdating ? "Updating..." : "Deactivate"}
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          {trainee.profile_picture ? (
            <img
              src={trainee.profile_picture}
              alt={trainee.name || "Trainee"}
              className="h-20 w-20 rounded-2xl border border-slate-200 object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-xl font-bold text-slate-600">
              {String(trainee.name || "T")
                .split(" ")
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase() || "")
                .join("") || "T"}
            </div>
          )}
          <div>
            <p className="text-lg font-bold text-slate-900">
              {trainee.name || "N/A"}
            </p>
            <p className="text-sm text-slate-600">{trainee.email || "N/A"}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <Info label="Phone" value={trainee.phone} />
          <Info label="Gender" value={trainee.gender} />
          <Info label="City" value={trainee.city} />
          <Info label="University" value={trainee.university} />
          <Info label="Major" value={trainee.major} />
          <Info
            label="Graduation Year"
            value={
              trainee.graduation_year ? String(trainee.graduation_year) : null
            }
          />
          <Info
            label="Created At"
            value={trainee.created_at ? formatDate(trainee.created_at) : null}
          />
          <Info
            label="Updated At"
            value={trainee.updated_at ? formatDate(trainee.updated_at) : null}
          />
        </div>

        <div className="mt-5 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Skills
          </p>
          {skills.length ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600">No skills added.</p>
          )}
        </div>

        <div className="mt-5 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            CV
          </p>
          {trainee.cv_file ? (
            <a
              href={trainee.cv_file}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-blue-600 underline"
            >
              Open CV
            </a>
          ) : (
            <p className="text-sm text-slate-600">No CV uploaded.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
      {label}
    </p>
    <p className="mt-1 text-sm text-slate-900">{value || "N/A"}</p>
  </div>
);

export default TraineeDetailsPage;
