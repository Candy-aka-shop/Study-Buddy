import React, { useState } from 'react';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useSuggestionsStore from '../stores/suggestions';
import toast from 'react-hot-toast';

const StudyBuddyCard = ({ partner }) => {
  const navigate = useNavigate();
  const { createChatRoomWithSuggestion } = useSuggestionsStore();
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const handleMessageClick = async () => {
    if (!createChatRoomWithSuggestion) {
      toast.error('Chat creation functionality is unavailable');
      return;
    }

    // Clean the partner's username
    const cleanUsername = partner.username.replace(/^@/, '').trim();
    if (!cleanUsername || cleanUsername.includes('@')) {
      toast.error('Invalid partner username');
      return;
    }

    setIsCreatingChat(true);
    try {
      const room = await createChatRoomWithSuggestion(
        cleanUsername,
        `Study Session with ${cleanUsername}`
      );
      if (!room?.chat_room_id) {
        throw new Error('Invalid chat room ID returned');
      }
      navigate(`/messages/${room.chat_room_id}`);
    } catch (error) {
      toast.error(error.message || 'Failed to create chat room');
    } finally {
      setIsCreatingChat(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          {partner.avatar ? (
            <img src={partner.avatar} alt={partner.name} className="w-full h-full object-cover rounded-full" />
          ) : (
            <User className="w-6 h-6 text-gray-500" />
          )}
        </div>
        <div>
          <h3 className="text-lg md:text-xl font-semibold text-pure-black">{partner.name}</h3>
          <p className="text-sm md:text-base text-gray-600">{partner.username}</p>
        </div>
      </div>
      <div className="space-y-2 text-sm md:text-base text-pure-black">
        <p>
          <span className="font-medium">Study Style:</span> {partner.studyStyle || partner.study_style || 'Not specified'}
          {partner.studyStyleMatch && ` (${partner.studyStyleMatch})`}
        </p>
        <p>
          <span className="font-medium">Academic Year:</span> {partner.academicYear || partner.academic_year || 'Not specified'}
        </p>
        <p>
          <span className="font-medium">Availability:</span>{' '}
          {Array.isArray(partner.availableDays) && partner.availableDays.length > 0
            ? partner.availableDays.map((slot) => slot.day).join(', ')
            : 'None'}
        </p>
      </div>
      <button
        onClick={handleMessageClick}
        disabled={isCreatingChat}
        className={`mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-base md:text-lg font-medium ${
          isCreatingChat ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isCreatingChat ? 'Creating Chat...' : 'Message'}
      </button>
    </div>
  );
};

export default StudyBuddyCard;