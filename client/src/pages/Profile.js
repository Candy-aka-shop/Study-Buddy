import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileStore, useAvailabilityStore, usePreferencesStore, useAuthStore, useMatchingStore } from '../stores';
import { authApi } from '../utils/api';

const ProfilePage = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { profile, fetchProfile, updateProfile } = useProfileStore();
  const { availability, fetchAvailability } = useAvailabilityStore();
  const { preferences, fetchPreferences, updatePreferences } = usePreferencesStore();
  const { fetchMatches } = useMatchingStore();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [subjects, setSubjects] = useState('');
  const [studyStyle, setStudyStyle] = useState('');
  const [availabilityTime, setAvailabilityTime] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
      fetchAvailability();
      fetchPreferences();
    }
  }, [isAuthenticated, fetchProfile, fetchAvailability, fetchPreferences]);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      setAcademicYear(profile.academicYear || '');
      setSubjects(profile.subjects?.join(', ') || '');
      setStudyStyle(preferences?.studyStyle || '');
      setAvailabilityTime(availability?.[0]?.startTime || '12:00pm');
    }
  }, [profile, preferences, availability]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        firstName,
        lastName,
        academicYear,
        subjects: subjects.split(',').map((s) => s.trim()),
      });
      await updatePreferences({ studyStyle });
      await authApi.put('/availability', [{ dayOfWeek: 'Monday', startTime: availabilityTime, endTime: availabilityTime }]);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update profile');
    }
  };

  const handleFindMatches = async () => {
    await fetchMatches();
    navigate('/suggestions');
  };

  if (!isAuthenticated) {
    return <div className="text-center text-pure-black">Please log in to view your profile.</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-pure-white py-6 sm:py-8 md:py-12">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto bg-pure-white rounded-lg shadow-md p-4 sm:p-6 md:p-8">
        <img src="/logo.png" alt="Study Buddy Logo" className="mx-auto mb-4 w-24 sm:w-32" />
        <div className="flex justify-between mb-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-pure-black">My Profile</h2>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="text-blue-500 hover:underline text-xs sm:text-sm"
          >
            Log Out
          </button>
        </div>
        <form onSubmit={handleSave} className="space-y-3 sm:space-y-4 md:space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-pure-black">Public Information</h3>
            <label className="block text-xs sm:text-sm md:text-base font-medium text-pure-black">Username * (Cannot change)</label>
            <input
              type="text"
              value={user?.username || ''}
              disabled
              className="w-full p-2 sm:p-3 border border-gray-300 rounded text-pure-black text-sm sm:text-base bg-gray-100"
            />
            <p className="text-xs text-gray-500">This username will be visible to all Study Buddy members</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-pure-black">Private Information</h3>
            <label htmlFor="firstName" className="block text-xs sm:text-sm md:text-base font-medium text-pure-black">First Name *</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded text-pure-black text-sm sm:text-base"
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-xs sm:text-sm md:text-base font-medium text-pure-black">Last Name *</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded text-pure-black text-sm sm:text-base"
              required
            />
          </div>
          <div>
            <label htmlFor="academicYear" className="block text-xs sm:text-sm md:text-base font-medium text-pure-black">Academic Year *</label>
            <input
              type="text"
              id="academicYear"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded text-pure-black text-sm sm:text-base"
              required
            />
          </div>
          <div>
            <label htmlFor="subjects" className="block text-xs sm:text-sm md:text-base font-medium text-pure-black">Subjects/Courses</label>
            <input
              type="text"
              id="subjects"
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded text-pure-black text-sm sm:text-base"
              placeholder="e.g., Biology, Math"
            />
          </div>
          <div>
            <label htmlFor="studyStyle" className="block text-xs sm:text-sm md:text-base font-medium text-pure-black">Study Style</label>
            <select
              id="studyStyle"
              value={studyStyle}
              onChange={(e) => setStudyStyle(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded text-pure-black text-sm sm:text-base"
            >
              <option value="">Select...</option>
              <option value="Group">Group</option>
              <option value="Individual">Individual</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>
          <div>
            <label htmlFor="availability" className="block text-xs sm:text-sm md:text-base font-medium text-pure-black">Availability</label>
            <input
              type="time"
              id="availability"
              value={availabilityTime}
              onChange={(e) => setAvailabilityTime(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded text-pure-black text-sm sm:text-base"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-light-blue text-pure-black p-2 sm:p-3 rounded hover:bg-blue-200 text-sm sm:text-base md:text-lg font-semibold transition"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={handleFindMatches}
            className="w-full bg-blue-500 text-pure-white p-2 sm:p-3 rounded hover:bg-blue-600 text-sm sm:text-base md:text-lg font-semibold transition mt-2"
          >
            Find Matches
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;