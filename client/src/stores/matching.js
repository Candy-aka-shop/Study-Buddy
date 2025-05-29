import { create } from 'zustand';
import { authApi } from '../utils/api';

const useMatchingStore = create((set) => ({
  matches: [],
  fetchMatches: async () => {
    try {
      const response = await authApi.get('/matches');
      set({ matches: response.data });
    } catch (error) {
      console.error('Fetch matches error:', error);
    }
  },
  clearMatches: () => set({ matches: [] }),
}));

export default useMatchingStore;