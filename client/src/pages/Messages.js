import React, { useState, useEffect } from 'react';
import { useMessagingStore, useAuthStore } from '../stores';

const MessagesPage = () => {
  const { isAuthenticated } = useAuthStore();
  const { conversations, fetchConversations, createConversation, addMessage } = useMessagingStore();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageContent, setMessageContent] = useState('');
  const [newParticipant, setNewParticipant] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated, fetchConversations]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (selectedConversation && messageContent) {
      try {
        await addMessage(selectedConversation.id, {
          senderId: 'current_user',
          content: messageContent,
          timestamp: new Date().toISOString(),
        });
        setMessageContent('');
      } catch (error) {
        console.error('Send message error:', error);
        alert('Failed to send message');
      }
    }
  };

  const handleStartConversation = async (e) => {
    e.preventDefault();
    if (newParticipant) {
      try {
        await createConversation([newParticipant]);
        setNewParticipant('');
      } catch (error) {
        console.error('Start conversation error:', error);
        alert('Failed to start conversation');
      }
    }
  };

  if (!isAuthenticated) {
    return <div className="text-center text-pure-black">Please log in to view messages.</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-pure-white py-6 sm:py-8 md:py-12">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto bg-pure-white rounded-lg shadow-md p-4 sm:p-6 md:p-8">
        <img src="/logo.png" alt="Study Buddy Logo" className="mx-auto mb-4 w-24 sm:w-32" />
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-pure-black text-center">Messages</h2>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-pure-black">Start New Conversation</h3>
          <form onSubmit={handleStartConversation} className="space-y-3">
            <input
              type="text"
              value={newParticipant}
              onChange={(e) => setNewParticipant(e.target.value)}
              placeholder="Enter username"
              className="w-full p-2 sm:p-3 border border-gray-300 rounded text-pure-black text-sm sm:text-base"
              required
            />
            <button
              type="submit"
              className="w-full bg-light-blue text-pure-black p-2 sm:p-3 rounded hover:bg-blue-200 text-sm sm:text-base md:text-lg font-semibold transition"
            >
              Start Conversation
            </button>
          </form>
        </div>
        <div className="flex">
          <div className="w-1/3 border-r border-gray-200 pr-4">
            <h3 className="text-lg font-semibold text-pure-black">Conversations</h3>
            {conversations.length === 0 ? (
              <p className="text-pure-black">No conversations yet.</p>
            ) : (
              <ul className="space-y-2">
                {conversations.map((conv) => (
                  <li
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`cursor-pointer p-2 rounded ${selectedConversation?.id === conv.id ? 'bg-light-blue' : ''}`}
                  >
                    @{conv.participants.join(', @')}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="w-2/3 pl-4">
            {selectedConversation ? (
              <>
                <h3 className="text-lg font-semibold text-pure-black">Chat with @{selectedConversation.participants.join(', @')}</h3>
                <div className="h-64 overflow-y-auto border border-gray-300 p-2 mb-4">
                  {selectedConversation.messages.map((msg) => (
                    <p key={msg.id} className="text-pure-black">
                      <strong>@{msg.senderId} {new Date(msg.timestamp).toLocaleTimeString()}:</strong> {msg.content}
                    </p>
                  ))}
                </div>
                <form onSubmit={handleSendMessage} className="space-y-3">
                  <input
                    type="text"
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded text-pure-black text-sm sm:text-base"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-light-blue text-pure-black p-2 sm:p-3 rounded hover:bg-blue-200 text-sm sm:text-base md:text-lg font-semibold transition"
                  >
                    Send
                  </button>
                </form>
              </>
            ) : (
              <p className="text-pure-black">Select a conversation to start chatting.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;