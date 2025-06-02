import { create } from 'zustand';
import api, { authApi } from '../utils/api';
import toast from 'react-hot-toast';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  token: localStorage.getItem('authToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,

  initializeAuth: async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      set({ isAuthenticated: false, user: null, token: null, refreshToken: null });
      return null;
    }

    try {
      const response = await api.request(authApi.getUser());
      const userData = response.data.user || {};
      set({ user: userData, isAuthenticated: true, token });
      return userData;
    } catch (error) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false, token: null, refreshToken: null });
      return null;
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

  setToken: (token, refreshToken) => {
    if (token && refreshToken) {
      localStorage.setItem('authToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      set({ token, refreshToken });
    } else {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      set({ token: null, refreshToken: null });
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false, token: null, refreshToken: null });
    toast.success('Logged out successfully');
  },

  fetchCurrentUser: async () => {
    try {
      const response = await api.request(authApi.getUser());
      const userData = response.data.user || {};
      set({ user: userData, isAuthenticated: true });
      return userData;
    } catch (error) {
      set({ user: null, isAuthenticated: false });
      toast.error(error.response?.data?.error || error.message || 'Failed to fetch user');
      return null;
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.request(authApi.login(credentials));
      const { accessToken, refreshToken, user } = response.data || {};
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      set({ token: accessToken, refreshToken, user, isAuthenticated: true });
      return { user };
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || 'Login failed');
      throw error;
    }
  },

  verifyEmail: async (email, token) => {
    try {
      const response = await api.request(authApi.verifyEmail(email, token));
      const { accessToken, refreshToken, user } = response.data || {};
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      set({ token: accessToken, refreshToken, user, isAuthenticated: true });
      return { user };
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || 'Email verification failed');
      throw error;
    }
  },
  resetPassword: async (data) => {
    try {
      const response = await api.request(authApi.resetPassword(data));
      toast.success('Password reset successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || 'Password reset failed');
      throw error;
    }
  },
  forgotPassword: async (data) => {
    try {
      const response = await api.request(authApi.forgotPassword(data));
      return response.data;
    } catch (error) {
      throw error;
    }
  },
}));

export default useAuthStore;