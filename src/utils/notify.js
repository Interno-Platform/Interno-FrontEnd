import toast from "react-hot-toast";

const normalizeMessage = (
  value,
  fallback = "Something went wrong. Please try again.",
) => {
  const text = String(value || "").trim();
  if (!text) return fallback;

  const lower = text.toLowerCase();

  if (lower.includes("network error")) {
    return "Network issue. Check your connection and try again.";
  }

  if (lower.includes("timeout")) {
    return "The request timed out. Please try again.";
  }

  if (lower.includes("unauthorized") || lower.includes("forbidden")) {
    return "You are not authorized to perform this action.";
  }

  return text;
};

const baseOptions = {
  className: "toast-base",
  style: {
    borderRadius: "14px",
    padding: "12px 14px",
    maxWidth: "420px",
    lineHeight: "1.35",
  },
};

export const notify = {
  success: (message, options = {}) =>
    toast.success(normalizeMessage(message, "Completed successfully."), {
      ...baseOptions,
      className: "toast-base toast-success",
      duration: 2600,
      ...options,
    }),

  error: (
    message,
    fallback = "Something went wrong. Please try again.",
    options = {},
  ) =>
    toast.error(normalizeMessage(message, fallback), {
      ...baseOptions,
      className: "toast-base toast-error",
      duration: 3600,
      ...options,
    }),

  info: (message, options = {}) =>
    toast(message, {
      ...baseOptions,
      className: "toast-base toast-info",
      duration: 2800,
      ...options,
    }),

  promise: (promise, messages) =>
    toast.promise(promise, {
      loading: normalizeMessage(messages?.loading, "Processing..."),
      success: normalizeMessage(messages?.success, "Done."),
      error: normalizeMessage(
        messages?.error,
        "Something went wrong. Please try again.",
      ),
    }),
};

export { normalizeMessage };
