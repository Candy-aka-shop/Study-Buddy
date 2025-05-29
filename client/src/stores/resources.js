import { create } from 'zustand';
import { authApi } from '../utils/api';

const useResourcesStore = create((set) => ({
  resources: [],
  fetchResources: async () => {
    try {
      const response = await authApi.get('/resources');
      set({ resources: response.data });
    } catch (error) {
      console.error('Fetch resources error:', error);
    }
  },
  addResource: async (resource) => {
    try {
      const response = await authApi.post('/resources', resource);
      set((state) => ({
        resources: [...state.resources, response.data],
      }));
    } catch (error) {
      console.error('Add resource error:', error);
    }
  },
  removeResource: async (resourceId) => {
    try {
      await authApi.delete(`/resources/${resourceId}`);
      set((state) => ({
        resources: state.resources.filter((r) => r.id !== resourceId),
      }));
    } catch (error) {
      console.error('Remove resource error:', error);
    }
  },
}));

export default useResourcesStore;