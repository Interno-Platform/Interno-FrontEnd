/**
 * Clean and prepare skills for submission
 * - Trims whitespace from each skill
 * - Removes empty skills
 * - Removes duplicates (case-insensitive)
 * @param {string[]} skills - Array of skill strings
 * @returns {{cleanedSkills: string[], errors: string[]}}
 */
export const cleanSkills = (skills = []) => {
  const errors = [];

  // Check if skills is a valid array
  if (!Array.isArray(skills)) {
    errors.push("skills must be a non-empty array");
    return { cleanedSkills: [], errors };
  }

  // Check if array is empty
  if (skills.length === 0) {
    errors.push("skills must be a non-empty array");
    return { cleanedSkills: [], errors };
  }

  // Trim each skill and filter out empty ones
  const trimmedSkills = skills
    .map((skill) => String(skill || "").trim())
    .filter((skill) => skill.length > 0);

  // Check if any skills remain after filtering
  if (trimmedSkills.length === 0) {
    errors.push("skills must contain at least one non-empty value");
    return { cleanedSkills: [], errors };
  }

  // Remove duplicates (case-insensitive) by keeping first occurrence
  const uniqueSkills = [];
  const seenLower = new Set();

  for (const skill of trimmedSkills) {
    const lowerSkill = skill.toLowerCase();
    if (!seenLower.has(lowerSkill)) {
      uniqueSkills.push(skill);
      seenLower.add(lowerSkill);
    }
  }

  return { cleanedSkills: uniqueSkills, errors };
};

/**
 * Validate cleaned skills before sending to API
 * @param {string[]} skills - Array of cleaned skill strings
 * @returns {boolean}
 */
export const isValidSkillsArray = (skills) => {
  return (
    Array.isArray(skills) && skills.length > 0 && skills.every((s) => s && String(s).trim().length > 0)
  );
};
