import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs) => twMerge(clsx(inputs));

export const formatDate = (date) => new Date(date).toLocaleDateString();

export const paginate = (items, page = 1, pageSize = 10) => {
  const start = (page - 1) * pageSize;
  return {
    totalPages: Math.ceil(items.length / pageSize),
    data: items.slice(start, start + pageSize),
  };
};

const normalizeSkillValue = (skill) => {
  if (typeof skill === "string") return skill.trim();
  if (skill && typeof skill === "object") {
    return String(skill.name || skill.skill_name || "").trim();
  }
  return "";
};

const toSkillArray = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeSkillValue).filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map(normalizeSkillValue).filter(Boolean);
      }
    } catch {
      // Continue with delimiter fallback.
    }

    return trimmed
      .split(/[,\n]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

export const calcMatchScore = (requiredSkills = [], candidateSkills = []) => {
  const required = toSkillArray(requiredSkills);
  const candidate = toSkillArray(candidateSkills);

  if (!required.length) return 0;

  const candidateSet = new Set(candidate.map((skill) => skill.toLowerCase()));
  const matched = required.filter((skill) =>
    candidateSet.has(skill.toLowerCase()),
  ).length;

  return Math.round((matched / required.length) * 100);
};
