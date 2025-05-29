import { create } from 'zustand';
import { authApi } from '../utils/api';

const useAvailabilityStore = create((set) => ({
  availability: [],
  setAvailability: (availability) => set({ availability }),
  fetchAvailability: async () => {
    try {
      const response = await authApi.get('/availability');
      set({ availability: response.data });
    } catch (error) {
      console.error('Fetch availability error:', error);
    }
  },
  updateAvailability: async (availability) => {
    try {
      const response = await authApi.put('/availability', { availability });
      set({ availability: response.data });
    } catch (error) {
      console.error('Update availability error:', error);
    }
  },
  addSlot: (slot) =>
    set((state) => ({ availability: [...state.availability, slot] })),
  removeSlot: (index) =>
    set((state) => ({
      availability: state.availability.filter((_, i) => i !== index),
    })),
}));

export default useAvailabilityStore;