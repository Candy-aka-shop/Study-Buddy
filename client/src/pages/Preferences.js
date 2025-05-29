import React, { useState, useEffect } from 'react';
import { usePreferencesStore, useAuthStore } from '../stores';

const PreferencesPage = () => {
  const { isAuthenticated } = useAuthStore();
  const { preferences, fetchPreferences, updatePreferences } = usePreferencesStore();
  const [groupSize, setGroupSize] = useState('');
  const [studyStyle, setStudyStyle] = useState('');
  const [environment, setEnvironment] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchPreferences();
    }
  }, [isAuthenticated, fetchPreferences]);

  useEffect(() => {
    if (preferences) {
      setGroupSize(preferences.groupSize || '');
      setStudyStyle(preferences.studyStyle || '');
      setEnvironment(preferences.environment || '');
    }
  }, [preferences]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updatePreferences({ groupSize, studyStyle, environment });
      alert('Preferences saved!');
    } catch (error) {
      console.error('Update preferences error:', error);
      alert('Failed to save preferences');
    }
  };

  if (!isAuthenticated) {
    return <div className="text-center text-pure-black">Please log in to manage preferences.</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-pure-white py-6 sm:py-8 md:py-12">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto bg-pure-white rounded-lg shadow-md p-4 sm:p-6 md:p-8">
        <img src="/logo.png" alt="Study Buddy Logo" className="mx-auto mb-4 w-24 sm:w-32" />
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-pure-black text-center">Study Preferences</h2>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-5">
          <div>
            <label htmlFor="groupSize" className="block text-xs sm:text-sm md:text-base font-medium text-pure-black">Preferred Group Size</label>
            <select
              id="groupSize"
              value={groupSize}
              onChange={(e) => setGroupSize(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded text-pure-black text-sm sm:text-base"
            >
              <option value="">Select...</option>
              <option value="Individual">Individual</option>
              <option value="Small Group">Small Group (2-4)</option>
              <option value="Large Group">Large Group (5+)</option>
            </select>
          </div>
          <div>
            <label htmlFor="studyStyle" className="block text-xs sm:text-sm md:text-base font-medium text-pure-black">Preferred Study Style</label>
            <select
              id="studyStyle"
              value={studyStyle}
              onChange={(e) => setStudyStyle(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded text-pure-black text-sm sm:text-base"
            >
              <option value="">Select...</option>
              <option value="Quiet Study">Quiet Study</option>
              <option value="Discussion-Based">Discussion-Based</option>
              <option value="Practice Problems">Practice Problems</option>
            </select>
          </div>
          <div>
            <label htmlFor="environment" className="block text-xs sm:text-sm md:text-base font-medium text-pure-black">Study Environment</label>
            <select
              id="environment"
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded text-pure-black text-sm sm:text-base"
            >
              <option value="">Select...</option>
              <option value="Online">Online</option>
              <option value="On-Campus">On-Campus</option>
              <option value="Library">Library</option>
              <option value="Coffee Shop">Coffee Shop</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-light-blue text-pure-black p-2 sm:p-3 rounded hover:bg-blue-200 text-sm sm:text-base md:text-lg font-semibold transition"
          >
            Save Preferences
          </button>
        </form>
      </div>
    </div>
  );
};

export default PreferencesPage;