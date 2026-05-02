import { useEffect, useMemo, useState } from "react";
import {
  Clock3,
  Layers3,
  Pencil,
  Users,
  BadgeCheck,
  Building2,
  CalendarRange,
  Gauge,
  Target,
  Sparkles,
} from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import { getInternships } from "@/services/companyService";
import { getAllSkills } from "@/services/skillsService";
import { useAuthStore } from "@/store/authStore";
import { notify } from "@/utils/notify";

const buildEditForm = (internship) => ({
  title: internship?.title || "",
  description: internship?.description || "",
  location_type:
    internship?.location_type || internship?.locationType || "REMOTE",
  duration_weeks: internship?.duration_weeks || "",
  seats: internship?.seats ?? internship?.slots ?? "",
  deadline: internship?.deadline || "",
  status: internship?.status || "Pending",
  has_exam: Boolean(internship?.has_exam),
});

const CompanyInternshipDetailsPage = () => {
  const { internshipId } = useParams();
  const location = useLocation();
  const { user } = useAuthStore();
  const companyId = user?.id;
  const [internships, setInternships] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState(buildEditForm());

  useEffect(() => {
    const loadInternships = async () => {
      if (!companyId) return;

      setIsLoading(true);
      try {
        const response = await getInternships(companyId);
        const list = Array.isArray(response?.data) ? response.data : [];
        setInternships(list);
      } finally {
        setIsLoading(false);
      }
    };

    loadInternships();
  }, [companyId]);

  useEffect(() => {
    const loadSkills = async () => {
      try {
        const response = await getAllSkills();
        const payload = response?.data || response;
        const list = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
            ? payload
            : [];

        const normalized = list
          .map((item) => ({
            id: Number(item.id ?? item.skill_id),
            name: item.name ?? item.skill_name ?? item.label,
          }))
          .filter((item) => Number.isFinite(item.id) && item.name);

        setAllSkills(normalized);
      } catch {
        setAllSkills([]);
      }
    };

    loadSkills();
  }, []);

  const internship = useMemo(
    () => internships.find((item) => String(item.id) === String(internshipId)),
    [internships, internshipId],
  );

  useEffect(() => {
    if (internship) {
      setEditForm(buildEditForm(internship));
    }
  }, [internship]);

  useEffect(() => {
    if (internship && location.state?.openEdit) {
      setEditForm(buildEditForm(internship));
      setIsEditOpen(true);
    }
  }, [internship, location.state?.openEdit]);

  const openEditModal = () => {
    if (!internship) return;
    setEditForm(buildEditForm(internship));
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
  };

  const handleEditChange = (event) => {
    const { name, value, type, checked } = event.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveEdit = (event) => {
    event.preventDefault();

    if (!internship) return;

    setIsSaving(true);
    try {
      const updatedInternship = {
        ...internship,
        title: editForm.title,
        description: editForm.description,
        location_type: editForm.location_type,
        duration_weeks: editForm.duration_weeks
          ? Number(editForm.duration_weeks)
          : undefined,
        seats: editForm.seats ? Number(editForm.seats) : undefined,
        deadline: editForm.deadline,
        status: editForm.status,
        has_exam: editForm.has_exam,
      };

      setInternships((prev) =>
        prev.map((item) =>
          String(item.id) === String(updatedInternship.id)
            ? updatedInternship
            : item,
        ),
      );

      notify.success(
        "Internship updated locally. API integration can be added later.",
      );
      setIsEditOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <p className="text-sm text-slate-600">Loading internship details...</p>
    );
  }

  if (!internship) {
    return (
      <Card className="space-y-3">
        <p className="text-sm font-semibold text-slate-900">
          Internship not found
        </p>
        <p className="text-sm text-slate-600">
          The internship may have been removed or you may not have access to it.
        </p>
        <Link
          className="inline-flex rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          to="/company/internships"
        >
          Back to internships
        </Link>
      </Card>
    );
  }

  const requiredSkillIds = Array.isArray(internship.required_skills ||internship.skills)
    ? internship.required_skills
        .map((value) => Number(value?.id ?? value?.skill_id ?? value))
        .filter((value) => Number.isFinite(value))
    : [];

  const requiredSkillNames = requiredSkillIds
    .map(
      (skillId) =>
        allSkills.find((skill) => Number(skill.id) === skillId)?.name,
    )
    .filter(Boolean);

  const stats = [
    {
      label: "Applicants",
      value: internship.applicants_count ?? internship.applicants ?? 0,
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: "Open seats",
      value: internship.seats ?? internship.slots ?? 0,
      icon: <Layers3 className="h-4 w-4" />,
    },
    {
      label: "Status",
      value: internship.status || "N/A",
      icon: <BadgeCheck className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden p-0">
        <div className="border-b border-border/70 bg-gradient-to-r from-[#f6fbf6] via-white to-[#f8faf8] p-4 sm:p-6 lg:p-8 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
            <div className="max-w-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-muted-foreground">
                <span>Company internship</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] text-slate-500 shadow-sm dark:bg-card dark:text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-emerald-600" /> Editable
                  now, API-ready later
                </span>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl lg:text-4xl dark:text-foreground">
                  {internship.title}
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-[15px] dark:text-muted-foreground">
                  {internship.description || "No description available."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">
                  <BadgeCheck className="h-4 w-4" />{" "}
                  {internship.status || "N/A"}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
                  <Building2 className="h-4 w-4" />{" "}
                  {internship.location_type || internship.locationType || "N/A"}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
                  <Clock3 className="h-4 w-4" />{" "}
                  {internship.duration_weeks
                    ? `${internship.duration_weeks} weeks`
                    : internship.duration || "N/A"}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
                  <CalendarRange className="h-4 w-4" /> Deadline:{" "}
                  {internship.deadline || "N/A"}
                </span>
              </div>
            </div>
            <Button
              className="inline-flex w-full items-center justify-center gap-2 !bg-[#164616] !text-white hover:!bg-[#123a12] sm:w-auto"
              onClick={openEditModal}
              type="button"
            >
              <Pencil className="h-4 w-4" /> Edit internship
            </Button>
          </div>
        </div>

        <div className="grid gap-3 border-b border-border/70 bg-white p-4 sm:p-6 md:grid-cols-3 dark:bg-card">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-border dark:bg-surface"
            >
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-sm font-medium">{item.label}</span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 dark:bg-card dark:text-muted-foreground">
                  {item.icon}
                </span>
              </div>
              <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_0.9fr]">
        <Card className="space-y-6">
          <section>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Target className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-950">Overview</h2>
                <p className="text-xs text-slate-500">What the role is about</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {internship.description ||
                "This internship is currently managed from the company dashboard."}
            </p>
          </section>

          <section>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <Layers3 className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Required skills
                </h2>
                <p className="text-xs text-slate-500">
                  Skills shown to applicants
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 p-4">
              {requiredSkillNames.length > 0 ? (
                requiredSkillNames.map((skillName, index) => (
                  <span
                    key={`${internship.id}-skill-${index}`}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm"
                  >
                    {skillName}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-500">
                  No skills added yet.
                </span>
              )}
            </div>
          </section>
        </Card>

        <Card className="space-y-4 bg-gradient-to-b from-white to-slate-50/70 xl:sticky xl:top-6 xl:self-start dark:from-card dark:to-surface">
          <div>
            <h3 className="text-lg font-bold text-slate-950">Quick summary</h3>
            <p className="text-xs text-slate-500">Useful at-a-glance details</p>
          </div>
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 text-sm text-slate-600">
              <Users className="h-4 w-4" /> Applicants:{" "}
              {internship.applicants_count ?? internship.applicants ?? 0}
            </p>
            <p className="inline-flex items-center gap-2 text-sm text-slate-600">
              <Layers3 className="h-4 w-4" /> Seats:{" "}
              {internship.seats ?? internship.slots ?? 0}
            </p>
            <p className="inline-flex items-center gap-2 text-sm text-slate-600">
              <Gauge className="h-4 w-4" /> Technical exam:{" "}
              {internship.has_exam ? "Yes" : "No"}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-emerald-900">
            <p className="font-semibold">Ready for update</p>
            <p className="mt-1 leading-6 text-emerald-800">
              Use the edit action to revise this internship now. The API can be
              wired in later without changing the UI structure.
            </p>
          </div>
          <Link
            className="inline-flex w-full justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-border dark:text-foreground dark:hover:bg-muted"
            to="/company/internships"
          >
            Back to internships
          </Link>
        </Card>
      </div>

      <Modal onClose={closeEditModal} open={isEditOpen} title="Edit Internship">
        <form className="space-y-4 sm:space-y-5" onSubmit={handleSaveEdit}>
          <div className="rounded-2xl border border-border bg-slate-50/70 p-3.5 sm:p-4 dark:bg-surface">
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-900">
                Basic information
              </h4>
              <p className="text-xs text-slate-500">
                Update the core internship details and keep the listing current.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Title"
                name="title"
                onChange={handleEditChange}
                required
                value={editForm.title}
              />
              <Select
                label="Status"
                name="status"
                onChange={handleEditChange}
                value={editForm.status}
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Closed">Closed</option>
              </Select>
              <Select
                label="Location Type"
                name="location_type"
                onChange={handleEditChange}
                value={editForm.location_type}
              >
                <option value="REMOTE">Remote</option>
                <option value="ONSITE">Onsite</option>
                <option value="HYBRID">Hybrid</option>
              </Select>
              <Input
                label="Duration (weeks)"
                min="1"
                name="duration_weeks"
                onChange={handleEditChange}
                type="number"
                value={editForm.duration_weeks}
              />
              <Input
                label="Open Seats"
                min="1"
                name="seats"
                onChange={handleEditChange}
                type="number"
                value={editForm.seats}
              />
              <Input
                label="Deadline"
                name="deadline"
                onChange={handleEditChange}
                type="date"
                value={editForm.deadline}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-3.5 shadow-sm sm:p-4 dark:bg-card">
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-900">
                Description
              </h4>
              <p className="text-xs text-slate-500">
                Refine the role summary to match the current vacancy.
              </p>
            </div>
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-slate-700">
                Role description
              </span>
              <textarea
                className="field-input min-h-28 sm:min-h-32"
                name="description"
                onChange={handleEditChange}
                rows="4"
                value={editForm.description}
              />
            </label>
          </div>

          <div className="rounded-2xl border border-border bg-slate-50/70 p-3.5 sm:p-4 dark:bg-surface">
            <div className="mb-2 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">
                  Technical exam
                </h4>
                <p className="text-xs text-slate-500">
                  Toggle whether applicants must complete a technical
                  assessment.
                </p>
              </div>
              <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  checked={editForm.has_exam}
                  name="has_exam"
                  onChange={handleEditChange}
                  type="checkbox"
                />
                Includes exam
              </label>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row">
            <Button
              className="flex-1 !bg-[#164616] hover:!bg-[#123a12]"
              disabled={isSaving}
              type="submit"
            >
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
            <Button
              className="flex-1"
              onClick={closeEditModal}
              type="button"
              variant="ghost"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CompanyInternshipDetailsPage;
