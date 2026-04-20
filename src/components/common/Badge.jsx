import { statusColors } from "@/utils/constants";

const Badge = ({ children, className = "" }) => {
  const colorClass =
    statusColors[children] ||
    "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200";
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 ${colorClass} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
