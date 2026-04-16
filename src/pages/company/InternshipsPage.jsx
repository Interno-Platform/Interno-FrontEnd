import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import {
  CalendarDays,
  ClipboardList,
  Layers3,
  PlusCircle,
  Sparkles,
  Tag,
  Target,
} from "lucide-react";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import { notify } from "@/utils/notify";
import {
  addTechnicalExam,
  createInternship,
  getInternships,
} from "@/services/companyService";
import { getAllSkills } from "@/services/skillsService";
import { useAuthStore } from "@/store/authStore";

const initialFormState = {
  title: "",
  description: "",
  location_type: "REMOTE",
  duration_weeks: "",
  seats: "",
  deadline: "",
  has_exam: false,
  selectedSkillId: "",
  required_skills: [],
  exam_passing_score: "",
  task_file: null,
};

const taskFileTemplate = {
  title: "task title or null",
  level: "Junior/Mid/Senior or null",
  duration: "duration or null",
  description: "task description or null",
  requirements: ["requirement 1", "requirement 2"],
  inputExample: "input example or null",
  expectedOutput: "expected output or null",
  submissionInstructions: "submission instructions or null",
  programmingLanguage: "programming language or null",
};

const formatTimestamp = (value) => {
  if (!value) {
    return "N/A";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return String(value);
  }

  return parsedDate.toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const internshipFormSchema = z
  .object({
    title: z.string().trim().min(3, "Title must be at least 3 characters."),
    description: z
      .string()
      .trim()
      .min(20, "Description must be at least 20 characters."),
    location_type: z.enum(["REMOTE", "ONSITE", "HYBRID"]),
    duration_weeks: z.coerce
      .number()
      .int()
      .min(1, "Duration must be at least 1 week."),
    seats: z.coerce.number().int().min(1, "Seats must be at least 1."),
    deadline: z
      .string()
      .min(1, "Application deadline is required.")
      .refine((value) => !Number.isNaN(new Date(value).getTime()), {
        message: "Application deadline must be a valid date.",
      }),
    has_exam: z.boolean(),
    required_skills: z
      .array(z.coerce.number().int().positive())
      .min(1, "Please select at least one required skill."),
    exam_passing_score: z
      .union([z.literal(""), z.coerce.number().min(0).max(100)])
      .optional(),
    task_file: z.any().nullable(),
  })
  .superRefine((data, ctx) => {
    if (!data.has_exam) {
      return;
    }
  });

const CompanyInternshipsPage = () => {
  const [open, setOpen] = useState(false);
  const [internships, setInternships] = useState([]);
  const [skills, setSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(initialFormState);
  const { user } = useAuthStore();
  const companyId = user?.id;

  const selectedSkills = useMemo(
    () =>
      form.required_skills
        .map((id) => skills.find((skill) => Number(skill.id) === Number(id)))
        .filter(Boolean),
    [form.required_skills, skills],
  );

  const getSkillNamesForInternship = (internshipSkills = []) => {
    const requiredSkillIds = Array.isArray(internshipSkills)
      ? internshipSkills
          .map((skill) => Number(skill?.id ?? skill?.skill_id ?? skill))
          .filter((skillId) => Number.isFinite(skillId))
      : [];

    return requiredSkillIds
      .map(
        (skillId) => skills.find((skill) => Number(skill.id) === skillId)?.name,
      )
      .filter(Boolean);
  };

  const loadInternships = async () => {
    if (!companyId) {
      return;
    }

    setIsLoading(true);
    setLoadError("");
    try {
      const response = await getInternships(companyId);
      const list = Array.isArray(response?.data) ? response.data : [];

      const normalized = list.map((item) => ({
        id: item.id,
        title: item.title,
        status: item.status || "N/A",
        duration: item.duration_weeks ? `${item.duration_weeks} weeks` : "N/A",
        description: item.description || "No description available.",
        locationType: item.location_type || "N/A",
        deadline: formatTimestamp(item.deadline),
        hasExam: Boolean(item.has_exam),
        applicants: item.applicants_count ?? 0,
        slots: item.seats ?? 0,
        skills: Array.isArray(item.required_skills)
          ? item.required_skills
          : Array.isArray(item.skills)
            ? item.skills
            : [],
      }));

      setInternships(normalized);
    } catch (error) {
      const message = error?.message || "";
      const isNoInternshipsError =
        /no\s+internships?|internships?\s+not\s+found/i.test(message);

      setInternships([]);

      if (!isNoInternshipsError) {
        setLoadError(message || "Unable to load internships right now.");
      }
    } finally {
      setIsLoading(false);
    }
  };

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
          id: item.id ?? item.skill_id,
          name: item.name ?? item.skill_name ?? item.label,
        }))
        .filter((item) => item.id && item.name);

      setSkills(normalized);
    } catch {
      setSkills([]);
    }
  };

  useEffect(() => {
    loadInternships();
  }, [companyId]);

  useEffect(() => {
    loadSkills();
  }, []);

  const closeModal = () => {
    setOpen(false);
    setForm(initialFormState);
  };

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (name === "has_exam" && !checked) {
      setForm((prev) => ({
        ...prev,
        has_exam: false,
        exam_passing_score: "",
        task_file: null,
      }));
      return;
    }

    if (name === "selectedSkillId") {
      const selectedId = Number(value);

      setForm((prev) => {
        if (!Number.isFinite(selectedId)) {
          return { ...prev, selectedSkillId: "" };
        }

        if (prev.required_skills.includes(selectedId)) {
          return { ...prev, selectedSkillId: "" };
        }

        return {
          ...prev,
          selectedSkillId: "",
          required_skills: [...prev.required_skills, selectedId],
        };
      });
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRemoveSkill = (skillId) => {
    setForm((prev) => ({
      ...prev,
      required_skills: prev.required_skills.filter(
        (selectedId) => selectedId !== Number(skillId),
      ),
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, task_file: file }));
  };

  const handleCreateInternship = async (event) => {
    event.preventDefault();

    if (!companyId) {
      notify.error(
        "Company account not found",
        "Your company profile is unavailable.",
      );
      return;
    }

    const validation = internshipFormSchema.safeParse({
      ...form,
      required_skills: form.required_skills.map((value) => Number(value)),
    });

    if (!validation.success) {
      notify.info(
        validation.error.issues[0]?.message || "Please review form data.",
      );
      return;
    }

    const validForm = validation.data;

    const internshipData = {
      title: validForm.title,
      description: validForm.description,
      location_type: validForm.location_type,
      duration_weeks: validForm.duration_weeks,
      seats: validForm.seats,
      deadline: validForm.deadline,
      required_skills: validForm.required_skills,
      has_exam: validForm.has_exam,
    };

    setIsSubmitting(true);
    try {
      const created = await createInternship(companyId, internshipData);
      const internshipId =
        created?.internship_id ||
        created?.data?.internship_id ||
        created?.data?.id ||
        created?.id;

      await addTechnicalExam(companyId, {
        ...(validForm.has_exam && { task_file: validForm.task_file }),
      });

      notify.success(created?.message || "Internship posted successfully.");
      closeModal();
      await loadInternships();
    } catch (error) {
      notify.error(error?.message, "Failed to create internship.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-r from-[#f6fbf6] via-white to-[#f8faf8] p-4 sm:p-6 lg:p-8 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
            <div className="max-w-3xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-muted-foreground">
                <Sparkles className="h-4 w-4 text-emerald-600" /> Internship
                management
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl lg:text-4xl dark:text-foreground">
                  Post and manage internships
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-muted-foreground">
                  Create polished internship listings, attach skills, and keep
                  the application pipeline organized from one place.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600 dark:text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-200 dark:bg-card dark:ring-border">
                  <ClipboardList className="h-3.5 w-3.5" /> Structured form
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-200 dark:bg-card dark:ring-border">
                  <Tag className="h-3.5 w-3.5" /> Skill tagging
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-200 dark:bg-card dark:ring-border">
                  <CalendarDays className="h-3.5 w-3.5" /> Deadline control
                </span>
              </div>
            </div>
            <Button
              className="inline-flex w-full items-center justify-center gap-2 !bg-[#164616] !text-white hover:!bg-[#123a12] sm:w-auto"
              onClick={() => setOpen(true)}
            >
              <PlusCircle className="h-4 w-4" /> Create Internship
            </Button>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <p className="text-sm text-slate-600 dark:text-muted-foreground">
          Loading internships...
        </p>
      ) : null}

      {!isLoading && loadError ? (
        <Card className="border-rose-200 bg-rose-50/70 dark:border-rose-500/20 dark:bg-rose-500/10">
          <p className="text-sm text-rose-700">{loadError}</p>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {!isLoading && internships.length === 0 ? (
          <Card className="md:col-span-2 xl:col-span-3">
            <p className="text-sm text-slate-600 dark:text-muted-foreground">
              No internships found.
            </p>
          </Card>
        ) : null}

        {internships.map((internship) => (
          <Card
            key={internship.id}
            className="group min-w-0 space-y-4 border-slate-200 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl dark:border-border"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">
                  <Target className="h-3.5 w-3.5" /> {internship.status}
                </span>
                <h3 className="break-words text-xl font-bold tracking-tight text-slate-950 dark:text-foreground">
                  {internship.title}
                </h3>
              </div>
              <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200 dark:bg-card dark:text-muted-foreground dark:ring-border">
                {internship.duration}
              </span>
            </div>

            <p className="line-clamp-3 break-words text-sm leading-6 text-slate-600 dark:text-muted-foreground">
              {internship.description}
            </p>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 dark:border-border dark:bg-surface">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-muted-foreground">
                  Applicants
                </p>
                <p className="mt-1 text-lg font-bold text-slate-950 dark:text-foreground">
                  {internship.applicants}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 dark:border-border dark:bg-surface">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-muted-foreground">
                  Seats
                </p>
                <p className="mt-1 text-lg font-bold text-slate-950 dark:text-foreground">
                  {internship.slots}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {getSkillNamesForInternship(internship.skills)
                .slice(0, 3)
                .map((skillName, index) => (
                  <span
                    key={`${internship.id}-skill-${index}`}
                    className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm dark:border-border dark:bg-card dark:text-muted-foreground"
                  >
                    {skillName}
                  </span>
                ))}
            </div>

            <div className="min-w-0 space-y-2 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-xs text-slate-500 dark:border-border dark:bg-surface dark:text-muted-foreground">
              <p className="line-clamp-2 break-words font-medium text-slate-700 dark:text-foreground">
                {internship.description}
              </p>
              <p className="break-words">
                Location: {internship.locationType} | Deadline:{" "}
                {internship.deadline}
              </p>
              <p>
                {internship.hasExam
                  ? "Includes technical exam"
                  : "No technical exam"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 sm:flex">
              <Link
                className="rounded-xl border border-slate-200 px-4 py-2 text-center text-xs font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-50 sm:flex-1 dark:border-border dark:text-foreground dark:hover:bg-muted"
                to={`/company/internships/${internship.id}`}
              >
                View details
              </Link>
              <Link
                className="rounded-xl border border-border bg-white px-4 py-2 text-center text-xs font-semibold text-slate-700 transition-all duration-200 hover:bg-muted/60 sm:flex-1 dark:bg-card dark:text-foreground"
                state={{ openEdit: true }}
                to={`/company/internships/${internship.id}`}
              >
                Edit
              </Link>
              <Button className="col-span-2 text-xs sm:flex-1" variant="danger">
                Close
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal onClose={closeModal} open={open} title="Create Internship">
        <form className="space-y-5" onSubmit={handleCreateInternship}>
          <div className="rounded-2xl border border-border bg-slate-50/70 p-4 dark:bg-surface">
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-foreground">
                Basic information
              </h4>
              <p className="text-xs text-slate-500 dark:text-muted-foreground">
                Start with the core details candidates will see first.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                label="Internship Title"
                name="title"
                onChange={handleFormChange}
                required
                value={form.title}
              />
              <Select
                label="Location Type"
                name="location_type"
                onChange={handleFormChange}
                value={form.location_type}
              >
                <option value="REMOTE">Remote</option>
                <option value="ONSITE">Onsite</option>
                <option value="HYBRID">Hybrid</option>
              </Select>
              <Input
                label="Duration (weeks)"
                min="1"
                name="duration_weeks"
                onChange={handleFormChange}
                required
                type="number"
                value={form.duration_weeks}
              />
              <Input
                label="Open Seats"
                min="1"
                name="seats"
                onChange={handleFormChange}
                required
                type="number"
                value={form.seats}
              />
              <Input
                label="Application Deadline"
                name="deadline"
                onChange={handleFormChange}
                required
                type="date"
                value={form.deadline}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm dark:bg-card">
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-foreground">
                Description
              </h4>
              <p className="text-xs text-slate-500 dark:text-muted-foreground">
                Describe the role clearly and keep expectations realistic.
              </p>
            </div>
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-slate-700 dark:text-foreground">
                Role description
              </span>
              <textarea
                className="field-input min-h-32"
                name="description"
                onChange={handleFormChange}
                required
                rows="4"
                value={form.description}
              />
            </label>
          </div>

          <div className="rounded-2xl border border-border bg-slate-50/70 p-4 dark:bg-surface">
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-foreground">
                Required skills
              </h4>
              <p className="text-xs text-slate-500 dark:text-muted-foreground">
                Add the skills you want to match against applicants.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
              <div className="space-y-1">
                <span className="text-sm font-semibold text-slate-700 dark:text-foreground">
                  Select skill
                </span>
                <select
                  className="field-input"
                  name="selectedSkillId"
                  onChange={handleFormChange}
                  value={form.selectedSkillId}
                >
                  <option value="">Choose a skill</option>
                  {skills.map((skill) => (
                    <option key={skill.id} value={String(skill.id)}>
                      {skill.name}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-slate-500 dark:text-muted-foreground md:pb-3">
                Selected skills become visible as tags.
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {selectedSkills.length === 0 ? (
                <span className="text-xs text-slate-500 dark:text-muted-foreground">
                  No skills selected yet.
                </span>
              ) : (
                selectedSkills.map((skill) => (
                  <button
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm dark:border-border dark:bg-card dark:text-foreground"
                    key={skill.id}
                    onClick={() => handleRemoveSkill(String(skill.id))}
                    type="button"
                  >
                    {skill.name} ×
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm dark:bg-card">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-foreground">
                  Technical exam
                </h4>
                <p className="text-xs text-slate-500 dark:text-muted-foreground">
                  Optional assessment that can be attached to the internship.
                </p>
              </div>
              <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-foreground">
                <input
                  checked={form.has_exam}
                  name="has_exam"
                  onChange={handleFormChange}
                  type="checkbox"
                />
                Include exam
              </label>
            </div>

            {form.has_exam ? (
              <div className="grid gap-3 md:grid-cols-2">
                <label className="md:col-span-2 block space-y-1">
                  <span className="text-sm font-semibold text-slate-700 dark:text-foreground">
                    Task file
                  </span>
                  <input
                    accept=".json,.pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                    className="field-input"
                    onChange={handleFileChange}
                    required
                    type="file"
                  />
                  <p className="text-xs leading-5 text-slate-500 dark:text-muted-foreground">
                    The task file should follow this structure:
                  </p>
                  <pre className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-950 px-3 py-3 text-xs leading-5 text-slate-100 dark:border-border dark:bg-slate-950">
                    {JSON.stringify(taskFileTemplate, null, 2)}
                  </pre>
                  {form.task_file ? (
                    <p className="text-xs text-slate-500 dark:text-muted-foreground">
                      Selected: {form.task_file.name}
                    </p>
                  ) : null}
                </label>
              </div>
            ) : null}
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              className="flex-1 !bg-[#164616] hover:!bg-[#123a12]"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Creating..." : "Create Internship"}
            </Button>
            <Button
              className="flex-1"
              onClick={closeModal}
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

export default CompanyInternshipsPage;
