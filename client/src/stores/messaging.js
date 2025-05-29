import { create } from 'zustand';
import { authApi } from '../utils/api';

const useMessagingStore = create((set) => ({
  conversations: [],
  fetchConversations: async () => {
    try {
      const response = await authApi.get('/conversations');
      set({ conversations: response.data });
    } catch (error) {
      console.error('Fetch conversations error:', error);
    }
  },
  createConversation: async (participants) => {
    try {
      const response = await authApi.post('/conversations', { participants });
      set((state) => ({
        conversations: [...state.conversations, response.data],
      }));
    } catch (error) {
      console.error('Create conversation error:', error);
    }
  },
  addMessage: async (conversationId, message) => {
    try {
      const response = await authApi.post(`/conversations/${conversationId}/messages`, message);
      set((state) => ({
        conversations: state.conversations.map((conv) =>
          conv.id === conversationId
            ? { ...conv, messages: [...conv.messages, response.data] }
            : conv
        ),
      }));
    } catch (error) {
      console.error('Add message error:', error);
    }
  },
}));

export default useMessagingStore;