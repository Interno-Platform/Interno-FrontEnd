import { useState } from "react";
import { X, Plus } from "lucide-react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { notify } from "@/utils/notify";
import { cleanSkills, isValidSkillsArray } from "@/utils/cleanSkills";

const SkillsManagement = ({ onSkillsChange, initialSkills = [] }) => {
  const [customSkills, setCustomSkills] = useState(initialSkills);
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSkill = (e) => {
    e.preventDefault();

    if (!inputValue.trim()) {
      notify.info("Please enter a skill to add.");
      return;
    }

    // Check for duplicates (case-insensitive)
    if (
      customSkills.some(
        (s) => s.toLowerCase() === inputValue.trim().toLowerCase(),
      )
    ) {
      notify.info("This skill is already added.");
      setInputValue("");
      return;
    }

    const newSkills = [...customSkills, inputValue.trim()];
    setCustomSkills(newSkills);
    setInputValue("");
    notify.success("Skill added successfully.", { duration: 1500 });
  };

  const handleRemoveSkill = (index) => {
    const updatedSkills = customSkills.filter((_, i) => i !== index);
    setCustomSkills(updatedSkills);
  };

  const handleSaveSkills = async () => {
    const { cleanedSkills, errors } = cleanSkills(customSkills);

    if (errors.length > 0) {
      notify.error(errors[0], "Validation failed");
      return;
    }

    if (!isValidSkillsArray(cleanedSkills)) {
      notify.error("skills must be a non-empty array");
      return;
    }

    setIsSubmitting(true);
    try {
      // Call parent handler with cleaned skills
      await onSkillsChange(cleanedSkills);
      // Only clear if parent didn't throw
      setCustomSkills([]);
      setInputValue("");
    } catch (error) {
      const errorMessage =
        error?.response?.status === 400 || error?.response?.status === 404
          ? error?.response?.data?.message || error?.message
          : error?.message || "Failed to save skills";

      notify.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-slate-50/70 p-4 dark:bg-surface">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-foreground">
          Custom Skills
        </h4>
        <p className="text-xs text-slate-500 dark:text-muted-foreground">
          Add skills not found in the dropdown list below.
        </p>
      </div>

      <form onSubmit={handleAddSkill} className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              label="Add a skill"
              placeholder="e.g., Docker, Kubernetes, Go"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSkill(e);
                }
              }}
            />
          </div>
          <Button
            type="button"
            onClick={handleAddSkill}
            className="inline-flex items-center justify-center gap-1 whitespace-nowrap"
            disabled={!inputValue.trim() || isSubmitting}
          >
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </form>

      {/* Display skills as chips/tags */}
      <div className="mt-4 flex flex-wrap gap-2">
        {customSkills.length === 0 ? (
          <span className="text-xs text-slate-500 dark:text-muted-foreground">
            No custom skills added yet.
          </span>
        ) : (
          customSkills.map((skill, index) => (
            <div
              key={`${skill}-${index}`}
              className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/70 px-3 py-1.5 text-xs font-medium text-emerald-700 shadow-sm dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
            >
              {skill}
              <button
                type="button"
                onClick={() => handleRemoveSkill(index)}
                className="inline-flex items-center justify-center rounded-full p-0.5 hover:bg-emerald-200/50 dark:hover:bg-emerald-500/20"
                aria-label={`Remove ${skill}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Save button */}
      <div className="mt-4 flex gap-2">
        <Button
          type="button"
          onClick={handleSaveSkills}
          disabled={customSkills.length === 0 || isSubmitting}
          className="inline-flex items-center justify-center"
        >
          {isSubmitting ? "Saving..." : "Save Skills"}
        </Button>
        {customSkills.length > 0 && (
          <span className="text-xs text-slate-500 dark:text-muted-foreground">
            {customSkills.length} skill{customSkills.length !== 1 ? "s" : ""} to
            save
          </span>
        )}
      </div>
    </div>
  );
};

export default SkillsManagement;
