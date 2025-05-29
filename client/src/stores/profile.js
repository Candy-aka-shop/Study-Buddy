import { create } from 'zustand';
import { authApi } from '../utils/api';

const useProfileStore = create((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  fetchProfile: async () => {
    try {
      const response = await authApi.get('/profile');
      set({ profile: response.data });
    } catch (error) {
      console.error('Fetch profile error:', error);
    }
  },
  updateProfile: async (updates) => {
    try {
      const response = await authApi.put('/profile', updates);
      set({ profile: response.data });
    } catch (error) {
      console.error('Update profile error:', error);
    }
  },
  clearProfile: () => set({ profile: null }),
}));

export default useProfileStore;