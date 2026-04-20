import { useAuthStore } from '@/store/authStore';

export const useAuth = () => {
  const { user, token, login, logout, register, isLoading, error } = useAuthStore();
  return {
    user,
    token,
    login,
    logout,
    register,
    isLoading,
    error,
    isAuthenticated: Boolean(token && user),
  };
};
