import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loginUser, registerUser } from "@/services/authService";
import {
  clearAuthTokenCookie,
  getAuthTokenCookie,
  setAuthTokenCookie,
} from "@/utils/authCookie";

export const useAuthStore = create(
  persist(
    (set) => ({
      token: getAuthTokenCookie(),
      user: null,
      isLoading: false,
      error: null,
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await loginUser(email, password);
          const normalizedUser =
            response.user?.details || response.user || null;
          if (response.token) {
            setAuthTokenCookie(response.token);
          }
          set({
            token: response.token,
            user: normalizedUser,
            isLoading: false,
          });
          return response;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await registerUser(userData);
          set({ isLoading: false });
          return response;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },
      logout: () => {
        clearAuthTokenCookie();
        set({ token: null, user: null });
      },
      updateUser: (userData) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                ...userData,
                details: {
                  ...(state.user.details || {}),
                  ...userData,
                },
              }
            : state.user,
        })),
    }),
    {
      name: "ims-auth",
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
