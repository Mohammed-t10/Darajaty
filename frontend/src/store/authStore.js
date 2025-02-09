import { create } from "zustand";
import { axiosInstance } from '@/api/axiosInstance';
import axios from "axios";

export const API_URL = import.meta.env.MODE === "development" ? "http://localhost:3000/api" : "/api";

axiosInstance.defaults.withCredentials = true;
axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isProcessing: false,
  isCheckingAuth: true,

  login: async (id, password) => {
    try {
      const response = await axiosInstance.post("/auth/login", { id, password });

      // Handle 200 status responses restricting authenticated users
      if (response.data?.message === "Already authenticated") {
        window.location.reload();
        return;
      }
      set({ user: response.data.user, isAuthenticated: true });
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      localStorage.clear();
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      throw error;
    }
  },

  resetPassword: async (oldPassword, newPassword) => {
    try {
      await axiosInstance.post("/auth/reset-password", { oldPassword, newPassword });
    } catch (error) {
      throw error;
    }
  },

  sendNewPassword: async (id, email) => {
    try {
      await axiosInstance.post("/auth/send-new-password", { id, email });
    } catch (error) {
      throw error;
    }
  },

  updateEmail: async (email) => {
    try {
      await axiosInstance.post("/auth/update-email", { email });
      set((state) => ({
        user: { ...state.user, email: email }
      }));
    } catch (error) {
      throw error;
    }
  },

  checkAuth: async () => {
    set({ isProcessing: true, isCheckingAuth: true });
    try {
      const response = await axios.get(`${API_URL}/auth/check-auth`);
      set({ user: response.data.user, isAuthenticated: true, isProcessing: false, isCheckingAuth: false });
    } catch (error) {
      if (error.response?.status === 401) {
        set({ isAuthenticated: false, isProcessing: false, isCheckingAuth: false });
        localStorage.clear();
      } else {
        const shouldReload = window.confirm(
          "حدث خطأ غير متوقع، هل تريد تحديث الصفحة؟"
        );
        if (shouldReload) {
          window.location.reload();
        } else {
          set({
            isProcessing: false,
            isCheckingAuth: false,
          });
        }
      }
    }
  },
}));
