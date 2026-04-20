import { api } from "./api";

// Register - POST /api/users/register
export const registerUser = async (userData) => {
  const formData = new FormData();
  formData.append("name", userData.name);
  formData.append("email", userData.email);
  formData.append("password", userData.password);
  formData.append("role", userData.role);

  if (userData.role === "company") {
    formData.append("registration_number", userData.registration_number);
  }

  if (userData.role === "trainee" && userData.gender) {
    formData.append("gender", userData.gender);
  }

  if (userData.profile_picture) {
    formData.append("profile_picture", userData.profile_picture);
  }

  const response = await api.post("/api/users/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Login - POST /api/users/login
export const loginUser = async (email, password) => {
  const response = await api.post("/api/users/login", {
    email,
    password,
  });
  const payload = response.data?.data || response.data;
  const user =
    payload?.user?.details ||
    payload?.user ||
    response.data?.user?.details ||
    response.data?.user ||
    null;

  return {
    ...payload,
    token: payload?.token || response.data?.token,
    user,
    message: response.data?.message || payload?.message,
  };
};

// Verify Email - GET /api/users/verify-code/:user_id/:token
export const verifyEmail = async (userId, token) => {
  const response = await api.get(`/api/users/verify-code/${userId}/${token}`);
  return response.data;
};
