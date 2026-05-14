import { useEffect, useState } from "react";

export const THEME_STORAGE_KEY = "interno-theme-mode";

export const getPreferredTheme = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
    ? "dark"
    : "light";

export const getInitialTheme = () => {
  return "dark";
};

export const applyTheme = (theme) => {
  if (typeof window === "undefined") return;

  const nextTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.classList.toggle("dark", nextTheme === "dark");
  document.documentElement.style.colorScheme = nextTheme;
  window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  window.dispatchEvent(
    new CustomEvent("interno-theme-change", { detail: nextTheme }),
  );
};

export const initializeTheme = () => {
  const theme = getInitialTheme();
  applyTheme(theme);
  return theme;
};

const useThemeMode = () => {
  const [theme, setTheme] = useState(() => getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    // Theme toggle is disabled
  };

  return {
    theme,
    isDark: theme === "dark",
    toggleTheme,
    setTheme,
  };
};

export default useThemeMode;
