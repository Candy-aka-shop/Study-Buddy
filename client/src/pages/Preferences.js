import React, { useEffect } from 'react';
import { Plus, Trash2, ChevronDown, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores';
import useProfileStore from '../stores/profile';
import { loadProfile, savePreferencesChanges, navigateToMatches } from '../utils/profileUtils';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const PreferencesPage = () => {
  const { user } = useAuthStore();
  const { profile, isLoading, fetchProfile, updateProfile, setProfileField, addAvailabilitySlot, removeAvailabilitySlot, updateAvailabilitySlot } = useProfileStore();
  const navigate = useNavigate();

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const yearOptions = ['First Year', 'Second Year', 'Third Year', 'Final Year'];
  const studyStyleOptions = ['Group', 'Individual', 'Mixed'];

  useEffect(() => {
    loadProfile({ user, fetchProfile, navigate });
  }, [user, fetchProfile, navigate]);

  const handleFieldChange = (field, value) => {
    console.log(`Field: ${field}, Value:`, value);
    setProfileField(field, value);
  };

  const handleAddAvailabilitySlot = () => {
    const existingDays = profile.availableDays.map(slot => slot.day);
    const availableDay = daysOfWeek.find(day => !existingDays.includes(day));
    if (!availableDay) {
      toast.error('All days are already added');
      return;
    }
    addAvailabilitySlot(availableDay);
  };

  const handleUpdateAvailabilitySlot = (id, field, value) => {
    if (field === 'day') {
      const existingDays = profile.availableDays
        .filter(slot => slot.id !== id)
        .map(slot => slot.day);
      if (existingDays.includes(value)) {
        toast.error(`${value} is already selected`);
        return;
      }
    }
    updateAvailabilitySlot(id, field, value);
  };

  const handleSave = () => {
    savePreferencesChanges(profile, yearOptions, studyStyleOptions, updateProfile);
  };

  const navigateToProfile = (hasUnsavedChanges, navigate) => {
    if (hasUnsavedChanges) {
      toast.error('Please save your changes before returning to profile');
      return;
    }
    navigate('/profile');
  };

  if (!profile) return null;

  return (
    <motion.div className="min-h-screen pt-24 pb-4 bg-gray-50">
      <div className="max-w-full mx-auto">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-xl md:text-2xl font-semibold text-pure-black mb-6">
            My Preferences
          </h1>

          {isLoading && (
            <div className="flex justify-center items-center mb-6">
              <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
            </div>
          )}

          <motion.div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
            <h2 className="text-lg sm:text-xl font-semibold text-pure-black mb-4">
              Study Preferences
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-pure-black">
                  Academic Year
                </label>
                <div className="relative">
                  <select
                    value={profile.academicYear || ''}
                    onChange={(e) => handleFieldChange('academicYear', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-pure-black focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    disabled={isLoading}
                  >
                    <option value="">Select Year</option>
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-pure-black">
                  Courses
                </label>
                <input
                  type="text"
                  defaultValue={profile.courses?.join(',') || ''}
                  onChange={(e) => handleFieldChange('courses', e.target.value)}
                  placeholder="e.g., Biology,Chemistry,Physics"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-pure-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-pure-black">
                  Study Style
                </label>
                <div className="relative">
                  <select
                    value={profile.studyStyle || ''}
                    onChange={(e) => handleFieldChange('studyStyle', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-pure-black focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    disabled={isLoading}
                  >
                    <option value="">Select Study Style</option>
                    {studyStyleOptions.map((style) => (
                      <option key={style} value={style.toLowerCase()}>{style}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-pure-black">Availability</h2>
              <button
                onClick={handleAddAvailabilitySlot}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                disabled={isLoading || profile.availableDays.length >= daysOfWeek.length}
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
            <div className="space-y-4">
              {profile.availableDays.map((slot) => (
                <motion.div key={slot.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="block text-sm font-medium text-pure-black mb-1">Day</label>
                      <div className="relative">
                        <select
                          value={slot.day}
                          onChange={(e) => handleUpdateAvailabilitySlot(slot.id, 'day', e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg text-pure-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-sm"
                          disabled={isLoading}
                        >
                          {daysOfWeek.map((day) => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-pure-black mb-1">Start Time</label>
                      <input
                        type="time"
                        value={slot.day}
                        onChange={(e) => handleUpdateAvailabilitySlot(slot.id, 'startTime', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg text-pure-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-pure-black mb-1">End Time</label>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => handleUpdateAvailabilitySlot(slot.id, 'endTime', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg text-pure-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <button
                        onClick={() => removeAvailabilitySlot(slot.id)}
                        className="flex items-center justify-center w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        disabled={profile.availableDays.length === 1 || isLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-gray-200 text-pure-black rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 inline-block animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
            <button
              onClick={() => navigateToMatches(profile.hasUnsavedChanges, navigate)}
              className="px-6 py-2 bg-gray-200 text-pure-black rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
              disabled={isLoading || profile.hasUnsavedChanges}
            >
              Find Matches
            </button>
            <button
              onClick={() => navigateToProfile(profile.hasUnsavedChanges, navigate)}
              className="px-6 py-2 bg-gray-200 text-pure-black rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
              disabled={isLoading || profile.hasUnsavedChanges}
            >
              Back to Profile
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default PreferencesPage;