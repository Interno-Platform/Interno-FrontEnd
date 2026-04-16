import { MoonStar, SunMedium } from "lucide-react";
import useThemeMode from "@/hooks/useThemeMode";

const ThemeToggle = ({ className = "" }) => {
  const { isDark, toggleTheme } = useThemeMode();

  return (
    <button
      className={`inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-muted/70 ${className}`}
      onClick={toggleTheme}
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <SunMedium className="h-4 w-4" />
      ) : (
        <MoonStar className="h-4 w-4" />
      )}
      <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
    </button>
  );
};

export default ThemeToggle;
