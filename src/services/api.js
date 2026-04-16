import axios from "axios";
import { getAuthTokenCookie } from "@/utils/authCookie";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: baseURL,
});

api.interceptors.request.use((config) => {
  const token = getAuthTokenCookie();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle error responses from API
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message;
    const customError = new Error(message);
    throw customError;
  },
);
