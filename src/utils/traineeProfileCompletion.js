const hasAnyText = (value) => String(value ?? "").trim().length > 0;

export const hasCompleteProfileInfo = (profile) =>
  hasAnyText(profile?.name) &&
  hasAnyText(profile?.email) &&
  hasAnyText(profile?.phone) &&
  hasAnyText(profile?.university);

export const calculateTraineeProfileCompletion = ({
  hasCv,
  hasProfileInfo,
  hasSkills,
}) => {
  const completedChecks = [hasCv, hasProfileInfo, hasSkills].filter(Boolean).length;
  return Math.round((completedChecks / 3) * 100);
};
