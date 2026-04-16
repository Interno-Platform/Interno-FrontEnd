export const ROLES = {
  SUPERADMIN: "admin",
  COMPANY: "company",
  TRAINEE: "trainee",
};

export const roleLandingMap = {
  [ROLES.SUPERADMIN]: "/superadmin",
  [ROLES.COMPANY]: "/company",
  [ROLES.TRAINEE]: "/trainee",
};

export const statusColors = {
  Pending: "bg-amber-100 text-amber-700",
  Accepted: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-rose-100 text-rose-700",
  Active: "bg-emerald-100 text-emerald-700",
  Inactive: "bg-slate-200 text-slate-700",
  Approved: "bg-emerald-100 text-emerald-700",
  Submitted: "bg-blue-100 text-blue-700",
  Completed: "bg-emerald-100 text-emerald-700",
};
