import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authApi } from '../utils/api';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setUser: (user, token) => {
        authApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        delete authApi.defaults.headers.common['Authorization'];
        set({ user: null, token: null, isAuthenticated: false });
      },
      fetchCurrentUser: async () => {
        try {
          const response = await authApi.get('/profile');
          set({ user: response.data, isAuthenticated: true });
        } catch (error) {
          console.error('Fetch user error:', error);
          set({ user: null, token: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAuthStore;