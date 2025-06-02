import React, { useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import FilterDropdown from '../components/FilterDropdown';
import ActiveFilters from '../components/ActiveFilters';
import StudyBuddyCard from '../components/StudyBuddyCard';
import useSearchAndFilter from '../hooks/useSearchAndFilter';
import { useSuggestionsStore, useMessagingStore, useProfileStore } from '../stores';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const SuggestionsPage = () => {
  const { suggestions, isLoading, error, fetchSuggestions } = useSuggestionsStore();
  const { chatRooms, fetchChatRooms, createChatRoom } = useMessagingStore();
  const { profile, fetchProfile } = useProfileStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSuggestions().catch((err) => {
      toast.error('Failed to load suggestions');
    });
    if (!profile) {
      fetchProfile().catch(() => toast.error('Failed to load profile'));
    }
  }, [fetchSuggestions, fetchProfile, profile]);

  const startChatWith = async (partnerUsername) => {
    if (!profile?.username) {
      toast.error('Profile not loaded');
      return;
    }
    try {
      await fetchChatRooms(); 
      const currentUsername = profile.username.replace(/^@/, '');
      const partner = partnerUsername.replace(/^@/, '');
      const existingRoom = chatRooms.find(
        (room) =>
          room.is_direct &&
          room.participants.includes(currentUsername) &&
          room.participants.includes(partner)
      );
      if (existingRoom) {
        navigate(`/messages/${existingRoom.chat_room_id}`);
      } else {
        const newRoom = await createChatRoom({
          title: `Chat with ${partner}`,
          participantUsernames: [currentUsername, partner],
          is_direct: true,
        });
        navigate(`/messages/${newRoom.chat_room_id}`);
      }
    } catch (error) {
      toast.error('Failed to start chat');
    }
  };

  const {
    searchTerm,
    setSearchTerm,
    filters,
    handleFilterChange,
    removeFilter,
    filteredData,
    availableStudyStyles,
    availableAcademicYears,
    availableDays,
  } = useSearchAndFilter(suggestions);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-100 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-xl md:text-2xl font-semibold text-pure-black mb-8 text-center">
          Find Your Study Buddy
        </h1>
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
            <FilterDropdown
              filters={filters}
              onFilterChange={handleFilterChange}
              availableStudyStyles={availableStudyStyles}
              availableAcademicYears={availableAcademicYears}
              availableDays={availableDays}
            />
          </div>
        </div>

        <ActiveFilters filters={filters} onRemoveFilter={removeFilter} />

        {isLoading ? (
          <div className="text-center text-pure-black text-sm sm:text-base md:text-lg">Loading...</div>
        ) : filteredData.length === 0 ? (
          <div className="text-center text-pure-black text-sm sm:text-base md:text-lg">
            No study buddies found. Try adjusting your filters or updating your profile preferences.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredData.map((partner) => (
              <StudyBuddyCard
                key={partner.userId}
                partner={partner}
                onStartChat={startChatWith}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestionsPage;