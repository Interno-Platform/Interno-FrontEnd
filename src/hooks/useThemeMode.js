import { useEffect, useState } from "react";

export const THEME_STORAGE_KEY = "interno-theme-mode";

export const getPreferredTheme = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
    ? "dark"
    : "light";

export const getInitialTheme = () => {
  if (typeof window === "undefined") return "light";

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }

  return getPreferredTheme();
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

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === THEME_STORAGE_KEY && event.newValue) {
        setTheme(event.newValue === "dark" ? "dark" : "light");
      }
    };

    const onThemeChange = (event) => {
      if (event.detail === "dark" || event.detail === "light") {
        setTheme(event.detail);
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("interno-theme-change", onThemeChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("interno-theme-change", onThemeChange);
    };
  }, []);

  const toggleTheme = () =>
    setTheme((current) => (current === "dark" ? "light" : "dark"));

  return {
    theme,
    isDark: theme === "dark",
    toggleTheme,
    setTheme,
  };
};

export default useThemeMode;
