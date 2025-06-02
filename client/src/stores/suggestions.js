import { create } from 'zustand';
import { authApi, asyncApi } from '../utils/api';
import toast from 'react-hot-toast';
import useProfileStore from './profile';

const useSuggestionsStore = create((set) => {
  console.log('useSuggestionsStore: Initialized');
  return {
    suggestions: [],
    isLoading: false,

    fetchSuggestions: async () => {
      set({ isLoading: true });
      try {
        const response = await asyncApi.request(authApi.getSuggestions());
        set({ suggestions: response.data.suggestions || [] });
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to load suggestions');
        set({ suggestions: [] });
      } finally {
        set({ isLoading: false });
      }
    },

    createChatRoomWithSuggestion: async (partnerUsername, title) => {
      const { profile } = useProfileStore.getState();
      if (!profile?.username) {
        throw new Error('Authenticated user username not found');
      }
      if (!partnerUsername || typeof partnerUsername !== 'string' || partnerUsername.trim() === '') {
        throw new Error('Invalid partner username');
      }
      const cleanCurrentUsername = profile.username.replace(/^@/, '').trim();
      const cleanPartnerUsername = partnerUsername.replace(/^@/, '').trim();
      if (cleanCurrentUsername === cleanPartnerUsername) {
        throw new Error('Cannot create a chat room with yourself');
      }
      const participantUsernames = [cleanCurrentUsername, cleanPartnerUsername];
      try {
        const response = await asyncApi.request(authApi.createChatRoom({
          title,
          participantUsernames,
        }));
        return response.data.room;
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to create chat room');
        throw error;
      }
    },
  };
});

export default useSuggestionsStore;