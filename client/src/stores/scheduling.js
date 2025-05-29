import { create } from 'zustand';
import { authApi } from '../utils/api';

const useSchedulingStore = create((set) => ({
  sessions: [],
  fetchSessions: async () => {
    try {
      const response = await authApi.get('/sessions');
      set({ sessions: response.data });
    } catch (error) {
      console.error('Fetch sessions error:', error);
    }
  },
  proposeSession: async (session) => {
    try {
      const response = await authApi.post('/sessions', session);
      set((state) => ({
        sessions: [...state.sessions, response.data],
      }));
    } catch (error) {
      console.error('Propose session error:', error);
    }
  },
  confirmSession: async (sessionId) => {
    try {
      const response = await authApi.put(`/sessions/${sessionId}/confirm`);
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === sessionId ? response.data : s
        ),
      }));
    } catch (error) {
      console.error('Confirm session error:', error);
    }
  },
  cancelSession: async (sessionId) => {
    try {
      await authApi.delete(`/sessions/${sessionId}`);
      set((state) => ({
        sessions: state.sessions.filter((s) => s.id !== sessionId),
      }));
    } catch (error) {
      console.error('Cancel session error:', error);
    }
  },
}));

export default useSchedulingStore;