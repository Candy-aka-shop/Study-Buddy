import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authApi, asyncApi } from '../utils/api';
import { socketService } from '../utils/socket';
import toast from 'react-hot-toast';

const useMessagingStore = create(
  persist(
    (set, get) => ({
      chatRooms: [],
      selectedChatRoom: null,
      isLoading: false,

      fetchChatRooms: async () => {
        set({ isLoading: true });
        try {
          const response = await asyncApi.request(authApi.getMyChatRooms());
          const rooms = response.data.rooms || [];
          const validRooms = rooms.filter(room => {
            if (!room.participants || room.participants.length < 2) {
              return false;
            }
            if (room.is_direct && room.participants.length !== 2) {
              return false;
            }
            return true;
          });
          set({ chatRooms: validRooms });
        } catch (error) {
          toast.error(error.response?.data?.error || 'Failed to load chat rooms');
          set({ chatRooms: [] });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchMessages: async (chatRoomId) => {
        set({ isLoading: true });
        try {
          const [messagesResponse, roomResponse] = await Promise.all([
            asyncApi.request(authApi.getMessages(chatRoomId)),
            asyncApi.request(authApi.getChatRoom(chatRoomId)),
          ]);
          const room = roomResponse.data.room || {};
          if (!room.participants || room.participants.length < 2) {
            toast.error('Error: Room must have at least two participants');
            return;
          }
          if (room.is_direct && room.participants.length !== 2) {
            toast.error('Error: Direct room must have exactly two participants');
            return;
          }
          set((state) => ({
            chatRooms: state.chatRooms
              .map((r) => (r.chat_room_id === chatRoomId ? { ...r, ...room } : r))
              .filter((r) => r.participants && r.participants.length >= 2 && (!r.is_direct || r.participants.length === 2)),
            selectedChatRoom: {
              ...room,
              chat_room_id: chatRoomId,
              messages: messagesResponse.data.messages || [],
            },
          }));
        } catch (error) {
          toast.error(error.response?.data?.error || 'Failed to load messages');
        } finally {
          set({ isLoading: false });
        }
      },

      sendMessage: async (chatRoomId, messageContent, attachments, username) => {
        try {
          socketService.sendMessage(chatRoomId, messageContent, attachments, username);
          const tempMessage = {
            message_id: `temp-${Date.now()}`,
            chat_room_id: chatRoomId,
            sender_id: get().profile?.user_id || 'temp-user',
            sender_username: username || 'You',
            message_content: messageContent,
            attachments: attachments || [],
            timestamp: new Date().toISOString(),
            is_read: false,
          };
          set((state) => ({
            selectedChatRoom: {
              ...state.selectedChatRoom,
              messages: [...(state.selectedChatRoom?.messages || []), tempMessage],
            },
          }));
          return tempMessage;
        } catch (error) {
          toast.error('Failed to send message');
          throw error;
        }
      },
      addMessage: (message) => {
        set((state) => {
          if (state.selectedChatRoom && state.selectedChatRoom.chat_room_id === message.chat_room_id) {
            const updatedMessages = [...(state.selectedChatRoom.messages || []), message];
            return {
              selectedChatRoom: {
                ...state.selectedChatRoom,
                messages: updatedMessages,
              },
            };
          }
          return state;
        });
      },

      selectChatRoom: async (chatRoomId, username) => {
        try {
          const roomResponse = await asyncApi.request(authApi.getChatRoom(chatRoomId));
          const room = roomResponse.data.room;
          if (!room || !room.participants || room.participants.length < 2) {
            toast.error('Error: Room must have at least two participants');
            return;
          }
          if (room.is_direct && room.participants.length !== 2) {
            toast.error('Error: Direct room must have exactly two participants');
            return;
          }
          if (!socketService.socket?.connected) {
            socketService.connect();
          }
          socketService.joinRoom(chatRoomId, username);
          set((state) => {
            if (state.selectedChatRoom?.chat_room_id && state.selectedChatRoom.chat_room_id !== chatRoomId) {
              socketService.leaveRoom(state.selectedChatRoom.chat_room_id);
            }
            return {
              chatRooms: state.chatRooms
                .map((r) => (r.chat_room_id === chatRoomId ? { ...r, ...room } : r))
                .filter((r) => r.participants && r.participants.length >= 2 && (!r.is_direct || r.participants.length === 2)),
              selectedChatRoom: { ...room, messages: room.messages || [] },
            };
          });
        } catch (error) {
          toast.error('Invalid chat room or missing username');
        }
      },

      createChatRoom: async ({ title, participantUsernames }) => {
        try {
          const response = await asyncApi.request(authApi.createChatRoom({ title, participantUsernames }));
          if (!response.data.room?.participants || response.data.room.participants.length < 2) {
            throw new Error('Room must have at least two participants');
          }
          if (response.data.room.is_direct && response.data.room.participants.length !== 2) {
            throw new Error('Direct room must have exactly two participants');
          }
          set((state) => {
            const existingRoom = state.chatRooms.find((r) => r.chat_room_id === response.data.room.chat_room_id);
            if (!existingRoom) {
              return { chatRooms: [...state.chatRooms, response.data.room] };
            }
            return state;
          });
          return response.data.room;
        } catch (error) {
          toast.error(error.response?.data?.error || 'Failed to create chat room');
          throw error;
        }
      },

      initializeSocket: () => {
        socketService.connect();
        socketService.onMessageReceived((message) => {
          set((state) => {
            if (state.selectedChatRoom?.chat_room_id === message.chat_room_id) {
              const messages = (state.selectedChatRoom?.messages || []).filter(
                (msg) => !msg.message_id.startsWith('temp-') || msg.message_id !== `temp-${message.timestamp}`
              );
              return {
                selectedChatRoom: {
                  ...state.selectedChatRoom,
                  messages: [...messages, message],
                },
              };
            }
            return state;
          });
        });
        socketService.onRoomCreated((updatedRoom) => {
          if (!updatedRoom?.participants || updatedRoom.participants.length < 2) {
            toast.error('Error: Room must have at least two participants');
            return;
          }
          if (updatedRoom.is_direct && updatedRoom.participants.length !== 2) {
            toast.error('Error: Direct room must have exactly two participants');
            return;
          }
          set((state) => {
            const existingRoom = state.chatRooms.find((r) => r.chat_room_id === updatedRoom.chat_room_id);
            const updatedRooms = existingRoom
              ? state.chatRooms.map((room) =>
                  room.chat_room_id === updatedRoom.chat_room_id ? updatedRoom : room
                )
              : [...state.chatRooms, updatedRoom];
            return {
              chatRooms: updatedRooms.filter(
                (r) => r.participants && r.participants.length >= 2 && (!r.is_direct || r.participants.length === 2)
              ),
            };
          });
        });
      },

      cleanupSocket: () => {
        socketService.offMessageReceived();
        socketService.offRoomCreated();
        socketService.disconnect();
      },

      clearStore: () => {
        set({ chatRooms: [], selectedChatRoom: null });
        localStorage.removeItem('messaging-store');
      },
    }),
    {
      name: 'messaging-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        chatRooms: state.chatRooms.filter(
          (r) => r.participants && r.participants.length >= 2 && (!r.is_direct || r.participants.length === 2)
        ),
        selectedChatRoom:
          state.selectedChatRoom &&
          state.selectedChatRoom.participants?.length >= 2 &&
          (!state.selectedChatRoom.is_direct || state.selectedChatRoom.participants.length === 2)
            ? state.selectedChatRoom
            : null,
      }),
    }
  )
);

export default useMessagingStore;