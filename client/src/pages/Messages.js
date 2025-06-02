import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, Send, Paperclip, X, Plus, Loader2, GripVertical } from 'lucide-react';
import { getFileIcon, formatFileSize, formatTime } from '../utils/chatRoom';
import useMessagingStore from '../stores/messaging';
import useProfileStore from '../stores/profile';
import useSuggestionsStore from '../stores/suggestions';
import useAuthStore from '../stores/auth';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { socketService } from '../utils/socket';
import { handleSend, handleFileSelectLocal, removeFile } from '../utils/message';

const MessagesPage = () => {
  const { chatRooms, isLoading: isChatLoading, fetchChatRooms, fetchMessages, selectChatRoom, selectedChatRoom, createChatRoom, initializeSocket, cleanupSocket, clearStore } = useMessagingStore();
  const { profile, isLoading: isProfileLoading, fetchProfile } = useProfileStore();
  const { suggestions, fetchSuggestions } = useSuggestionsStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { chatRoomId } = useParams();
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const resizeRef = useRef(null);
  const containerRef = useRef(null);

  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSubmitting] = useState(false);
  const [chatParticipantsSelected, setChatParticipants] = useState([]);
  const [participantSearchTerm, setParticipantSearchTerm] = useState('');
  const [sidebarWidth, setSidebarWidth] = useState(33);
  const [isResizing, setIsResizing] = useState(false);

  const isValidUUID = (id) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return id && uuidRegex.test(id);
  };

  const startResize = useCallback((e) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const stopResize = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e) => {
    if (!isResizing || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    const constrainedWidth = Math.min(Math.max(newWidth, 20), 60);
    setSidebarWidth(constrainedWidth);
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', resize);
      document.addEventListener('mouseup', stopResize);
    }

    return () => {
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResize);
    };
  }, [isResizing, resize, stopResize]);

  // Authentication and profile fetching
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please log in to access messages');
      navigate('/login');
    } else if (!profile) {
      fetchProfile().catch((error) => {
        toast.error('Failed to load user profile');
        navigate('/login');
      });
    }
  }, [isAuthenticated, profile, fetchProfile, navigate]);

  // Store and socket initialization
  useEffect(() => {
    if (profile) {
      clearStore();
      initializeSocket();
      fetchChatRooms();
      fetchSuggestions();
    }
  }, [profile, clearStore, initializeSocket, fetchChatRooms, fetchSuggestions]);

  // Chat room selection based on chatRoomId
  useEffect(() => {
    if (chatRoomId && isValidUUID(chatRoomId) && profile?.username) {
      selectChatRoom(chatRoomId, profile.username.replace(/^@/, ''));
      fetchMessages(chatRoomId);
    } else if (chatRoomId) {
      toast.error('Invalid chat room ID or missing user profile');
      navigate('/messages');
    }
  }, [chatRoomId, profile, selectChatRoom, fetchMessages, navigate]);

  // Socket listener setup
  useEffect(() => {
    const onRoomCreated = (room) => {
      if (!room?.participants || room.participants.length < 2) {
        toast.error('Error: Room must have at least two participants');
        return;
      }
      useMessagingStore.set((state) => ({
        chatRooms: [
          room,
          ...state.chatRooms.filter(
            (r) => r.chat_room_id !== room.chat_room_id && r.participants?.length >= 2
          ),
        ],
      }));
    };
    socketService.onRoomCreated(onRoomCreated);

    return () => {
      socketService.offRoomCreated(onRoomCreated);
    };
  }, []);

  // Joining and leaving chat rooms
  useEffect(() => {
    if (selectedChatRoom?.chat_room_id && profile?.username) {
      socketService.joinRoom(
        selectedChatRoom.chat_room_id,
        profile.username.replace(/^@/, '')
      );
    }

    return () => {
      if (selectedChatRoom?.chat_room_id) {
        socketService.leaveRoom(selectedChatRoom.chat_room_id);
      }
    };
  }, [selectedChatRoom, profile]);

  // Socket cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupSocket();
    };
  }, []);

  useEffect(() => {
    if (selectedChatRoom?.messages?.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedChatRoom?.messages]);

  const handleCreateChatRoom = async (e) => {
    e.preventDefault();
    const title = e.target.title.value.trim();
    if (!title) {
      toast.error('Chat title is required');
      return;
    }
    if (chatParticipantsSelected.length < 1) {
      toast.error('At least one participant is required');
      return;
    }
    if (!profile?.username) {
      toast.error('User profile not loaded');
      navigate('/login');
      return;
    }
    try {
      const participantUsernames = [profile.username.replace(/^@/, ''), ...chatParticipantsSelected.map(p => p.username.replace(/^@/, ''))];
      const newChatRoom = await createChatRoom({ title, participantUsernames });
      selectChatRoom(newChatRoom.chat_room_id, profile.username.replace(/^@/, ''));
      navigate(`/messages/${newChatRoom.chat_room_id}`);
      e.target.reset();
      setChatParticipants([]);
      setParticipantSearchTerm('');
      document.getElementById('create-modal').close();
      toast.success('Chat room created');
    } catch (error) {
      toast.error(error.message || 'Failed to create chat room');
    }
  };

  const handleParticipantSelect = (suggestion) => {
    if (!chatParticipantsSelected.find(p => p.username.replace(/^@/, '') === suggestion.username.replace(/^@/, '')) && suggestion.username.replace(/^@/, '') !== profile?.username.replace(/^@/, '')) {
      setChatParticipants(prev => [...prev, suggestion]);
      setParticipantSearchTerm('');
    }
  };

  const removeParticipant = (username) => {
    setChatParticipants(prev => prev.filter(p => p.username.replace(/^@/, '') !== username.replace(/^@/, '')));
  };

  const filteredSuggestions = suggestions.filter(s =>
    s.username.toLowerCase().includes(participantSearchTerm.toLowerCase()) &&
    !chatParticipantsSelected.find(p => p.username.replace(/^@/, '') === s.username.replace(/^@/, '')) &&
    s.username.replace(/^@/, '') !== profile?.username.replace(/^@/, '')
  );

  const handleSelectChatRoom = useCallback(async (roomId) => {
    try {
      if (!isValidUUID(roomId)) {
        return;
      }
      if (!profile?.username) {
        return;
      }
      
      const room = chatRooms.find(r => r.chat_room_id === roomId);
      if (!room) {
        return;
      }

      if (selectedChatRoom?.chat_room_id === roomId) {
        return;
      }

      selectChatRoom(roomId, profile.username.replace(/^@/, ''));
      navigate(`/messages/${roomId}`, { replace: true });
      
      fetchMessages(roomId).catch(error => {
        toast.error('Failed to load messages');
      });
    } catch (error) {
      toast.error('Failed to open chat room');
    }
  }, [profile, chatRooms, selectChatRoom, fetchMessages, navigate, selectedChatRoom]);

  const getChatRoomTitle = (room) => {
    return room?.title || 'Untitled Chat';
  };

  const getChatRoomInitial = (room) => {
    const title = getChatRoomTitle(room);
    return title.charAt(0).toUpperCase();
  };

  const isMyMessage = (message) => {
    return message.sender_username.replace(/^@/, '') === profile?.username.replace(/^@/, '');
  };

  const uniqueMessages = selectedChatRoom?.messages
    ? Array.from(new Map(selectedChatRoom.messages.map(msg => [msg.message_id, msg])).values())
    : [];

  if (isProfileLoading || !profile) {
    return (
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      <div ref={containerRef} className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <div 
          className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-200 ease-in-out
            ${selectedChatRoom ? 'w-0 min-w-0 opacity-0 sm:opacity-100 sm:w-80 md:opacity-100' : 'w-full sm:w-80 md:w-80 lg:w-96'} 
            ${selectedChatRoom ? 'sm:flex' : 'flex'}
            md:static md:translate-x-0`}
          style={{ 
            width: selectedChatRoom 
              ? window.innerWidth >= 768 ? `${sidebarWidth}%` : '0px'
              : window.innerWidth >= 640 ? '320px' : '100%'
          }}
        >
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-gray-200 bg-white flex justify-between items-center flex-shrink-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Chats</h1>
            <button
              onClick={() => document.getElementById('create-modal').showModal()}
              className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
              aria-label="Create new chat room"
            >
              <Plus size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Chat Rooms List */}
          <div className="flex-1 overflow-y-auto">
            {isChatLoading ? (
              <div className="p-4 text-gray-500 text-center text-sm sm:text-base">Loading...</div>
            ) : chatRooms.length === 0 ? (
              <div className="p-4 text-gray-600 text-center text-sm sm:text-base">No chat rooms yet.</div>
            ) : (
              chatRooms.map((room) => (
                <div
                  key={room.chat_room_id}
                  onClick={() => handleSelectChatRoom(room.chat_room_id)}
                  className={`p-3 sm:p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 transition-colors 
                    ${selectedChatRoom?.chat_room_id === room.chat_room_id ? 'bg-blue-50 border-blue-200' : ''}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleSelectChatRoom(room.chat_room_id)}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-xs sm:text-sm">{getChatRoomInitial(room)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate text-sm sm:text-base">{getChatRoomTitle(room)}</div>
                      <div className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 truncate">
                        {room.participants?.length >= 2
                          ? room.participants.map(p => p.replace(/^@/, '')).join(', ')
                          : 'Invalid participants'}
                      </div>
                      {room.messages?.length > 0 && (
                        <div className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 truncate">
                          <span className="font-medium">{room.messages[room.messages.length - 1].sender_username.replace(/^@/, '')}:</span>{' '}
                          {room.messages[room.messages.length - 1].message_content}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-0.5 sm:mt-1">
                        {formatTime(room.messages?.[room.messages.length - 1]?.timestamp || room.updated_at)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Resize Handle - Hidden on mobile */}
        <div 
          ref={resizeRef}
          className="hidden lg:flex w-1 bg-gray-200 hover:bg-blue-300 cursor-col-resize relative group transition-colors"
          onMouseDown={startResize}
        >
          <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical size={16} className="text-gray-400" />
          </div>
        </div>

        {/* Main Chat Area */}
        <div 
          className={`bg-white flex flex-col transition-all duration-200 ease-in-out
            ${selectedChatRoom ? 'flex w-full' : 'hidden sm:flex sm:flex-1'}`}
          style={{ 
            width: selectedChatRoom && window.innerWidth >= 1024
              ? `${100 - sidebarWidth}%` 
              : selectedChatRoom ? '100%' : 'auto'
          }}
        >
          {selectedChatRoom ? (
            <>
              {/* Chat Header */}
              <div className="h-14 sm:h-16 p-3 sm:p-4 border-b border-gray-200 bg-white flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <button
                  onClick={() => {
                    selectChatRoom(null);
                    navigate('/messages');
                  }}
                  className="sm:hidden text-gray-600 hover:text-gray-900 p-1 -ml-1"
                  aria-label="Back to chat rooms"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-xs sm:text-sm">{getChatRoomInitial(selectedChatRoom)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate text-sm sm:text-base">{getChatRoomTitle(selectedChatRoom)}</div>
                  <div className="text-xs sm:text-sm text-gray-600 truncate">
                    {selectedChatRoom.participants?.length >= 2
                      ? selectedChatRoom.participants.map(p => p.replace(/^@/, '')).join(', ')
                      : 'Invalid participants'}
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 min-h-0">
                {isChatLoading ? (
                  <div className="text-center text-gray-500 text-sm sm:text-base">Loading messages...</div>
                ) : uniqueMessages.length > 0 ? (
                  uniqueMessages.map((msg) => (
                    <div
                      key={msg.message_id}
                      className={`flex w-full ${isMyMessage(msg) ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg ${
                          isMyMessage(msg)
                            ? 'bg-blue-500 text-white ml-auto mr-1 sm:mr-2'
                            : 'bg-gray-200 text-gray-900 ml-1 sm:ml-2'
                        }`}
                      >
                        {!isMyMessage(msg) && (
                          <div className="text-xs font-semibold mb-1 text-gray-600">{msg.sender_username.replace(/^@/, '')}</div>
                        )}
                        {msg.message_content && <div className="mb-1 sm:mb-2 text-sm sm:text-base break-words">{msg.message_content}</div>}
                        {msg.attachments?.length > 0 && (
                          <div className="space-y-2">
                            {msg.attachments.map((attachment, index) => (
                              <div
                                key={`${attachment.url}-${index}`}
                                className={`rounded-lg overflow-hidden ${
                                  isMyMessage(msg) ? 'bg-blue-400' : 'bg-gray-300'
                                }`}
                              >
                                {attachment.type?.includes('image/') ? (
                                  <img
                                    src={attachment.url}
                                    alt={attachment.name}
                                    className="max-w-full h-auto cursor-pointer hover:opacity-90 rounded"
                                    onClick={() => window.open(attachment.url, '_blank')}
                                  />
                                ) : (
                                  <a
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-2 p-2 sm:p-3 hover:bg-opacity-80 ${
                                      isMyMessage(msg) ? 'text-white' : 'text-gray-900'
                                    }`}
                                  >
                                    {getFileIcon(attachment.type)}
                                    <div className="flex-1 min-w-0">
                                      <div className="truncate font-medium text-xs sm:text-sm">{attachment.name}</div>
                                      <div
                                        className={`text-xs ${
                                          isMyMessage(msg) ? 'text-blue-100' : 'text-gray-600'
                                        }`}
                                      >
                                        {formatFileSize(attachment.size)}
                                      </div>
                                    </div>
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        <div
                          className={`text-xs mt-1 text-right ${
                            isMyMessage(msg) ? 'text-blue-100' : 'text-gray-600'
                          }`}
                        >
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 text-sm sm:text-base">No messages found.</div>
                )}
                <div ref={messagesEndRef}></div>
              </div>

              {/* File Preview Area */}
              {attachedFiles.length > 0 && (
                <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex flex-wrap gap-2">
                    {attachedFiles.map((file) => (
                      <div key={file.id} className="relative bg-white rounded-lg p-2 border flex items-center gap-2 max-w-full sm:max-w-xs">
                        {file.preview ? (
                          <img src={file.preview} alt={file.name} className="w-6 h-6 sm:w-8 sm:h-8 object-cover rounded flex-shrink-0" />
                        ) : (
                          <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0">
                            {getFileIcon(file.type)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-medium truncate">{file.name}</div>
                          <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
                        </div>
                        <button
                          onClick={() => removeFile(file.id, setAttachedFiles)}
                          className="text-gray-400 hover:text-red-500 p-1 flex-shrink-0"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="p-3 sm:p-4 border-t border-gray-200 bg-white flex-shrink-0">
                <form onSubmit={(e) => handleSend(e, {
                  selectedChatRoom,
                  messageContent: e.target.message.value.trim(),
                  attachedFiles,
                  profile,
                  setAttachedFiles,
                  setIsSubmitting,
                  setIsUploading,
                })} className="flex gap-2 items-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleFileSelectLocal(e, setAttachedFiles, fileInputRef, setIsUploading)}
                    multiple
                    className="hidden"
                    accept="image/*"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500 hover:text-blue-500 rounded-full hover:bg-gray-50 flex items-center justify-center flex-shrink-0 transition-colors"
                    aria-label="Attach files"
                    disabled={isUploading || isSending}
                  >
                    <Paperclip size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                  <input
                    name="message"
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 p-2.5 sm:p-3 border rounded-full focus:ring-2 focus:ring-blue-500 bg-gray-100 text-sm sm:text-base min-w-0"
                    aria-label="Message input"
                    disabled={isUploading || isSending}
                  />
                  <button
                    type="submit"
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 transition-colors"
                    aria-label="Send message"
                    disabled={isUploading || isSending}
                  >
                    {isUploading || isSending ? (
                      <Loader2 size={12} className="sm:w-[14px] sm:h-[14px] animate-spin" />
                    ) : (
                      <Send size={12} className="sm:w-[14px] sm:h-[14px]" />
                    )}
                  </button>
                </form>
                {isUploading && (
                  <div className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                    <Loader2 size={10} className="sm:w-3 sm:h-3 animate-spin" />
                    Uploading files...
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hidden sm:flex flex-1 flex-col items-center bg-gray-50 justify-center text-gray-600 p-8">
              <div className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send size={24} className="sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <p className="text-base sm:text-lg font-medium mb-2">Select a chat to start messaging</p>
                <p className="text-sm text-gray-500">Choose from your existing conversations or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Chat Modal */}
      <dialog id="create-modal" className="rounded-lg p-4 sm:p-6 w-[95vw] max-w-md bg-white backdrop:bg-black backdrop:bg-opacity-50">
        <form onSubmit={handleCreateChatRoom}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Create New Chat</h2>
            <button 
              type="button" 
              onClick={() => document.getElementById('create-modal').close()} 
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <X size={20} />
            </button>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="chat-title">Chat Title</label>
            <input
              id="chat-title"
              name="title"
              type="text"
              className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              placeholder="Enter chat room title"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="participants">Add Participant</label>
            <input
              id="participants"
              type="text"
              value={participantSearchTerm}
              onChange={(e) => setParticipantSearchTerm(e.target.value)}
              className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              placeholder="Search for a user..."
            />
            {participantSearchTerm && filteredSuggestions.length > 0 && (
              <ul className="mt-2 border border-gray-200 rounded-lg bg-white max-h-32 sm:max-h-40 overflow-y-auto">
                {filteredSuggestions.map((suggestion) => (
                  <li
                    key={suggestion.username}
                    onClick={() => handleParticipantSelect(suggestion)}
                    className="p-2.5 sm:p-3 hover:bg-gray-100 cursor-pointer text-sm sm:text-base"
                  >
                    {suggestion.username.replace(/^@/, '')}
                  </li>
                ))}
              </ul>
            )}
            {chatParticipantsSelected.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {chatParticipantsSelected.map((p) => (
                  <div key={p.username} className="flex items-center bg-blue-100 text-blue-800 text-sm px-2.5 py-1.5 rounded-lg">
                    <span className="truncate max-w-24 sm:max-w-none">{p.username.replace(/^@/, '')}</span>
                    <button
                      type="button"
                      onClick={() => removeParticipant(p.username)}
                      className="ml-1.5 text-blue-600 hover:text-red-600 flex-shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            <button 
              type="button" 
              onClick={() => document.getElementById('create-modal').close()} 
              className="w-full sm:w-auto px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="w-full sm:w-auto px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
            >
              Create Chat
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
};

export default MessagesPage;