import { create } from 'zustand';
import { authApi } from '../utils/api';

const usePreferencesStore = create((set) => ({
  preferences: { groupSize: 2, studyStyle: 'collaborative' },
  setPreferences: (preferences) => set({ preferences }),
  fetchPreferences: async () => {
    try {
      const response = await authApi.get('/preferences');
      set({ preferences: response.data });
    } catch (error) {
      console.error('Fetch preferences error:', error);
    }
  },
  updatePreferences: async (updates) => {
    try {
      const response = await authApi.put('/preferences', updates);
      set({ preferences: response.data });
    } catch (error) {
      console.error('Update preferences error:', error);
    }
  },
}));

export default usePreferencesStore;