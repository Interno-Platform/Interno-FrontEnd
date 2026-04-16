export const getCompanyDisplayName = (user) =>
  user?.company_name || user?.details?.company_name || user?.name || "Company";

export const getCompanyLogoUrl = (user) =>
  user?.logo_url ||
  user?.details?.logo_url ||
  user?.profile_picture ||
  user?.details?.profile_picture ||
  null;

export const getUserInitials = (value) =>
  String(value || "Company")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
