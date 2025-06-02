import React, { useEffect, useState } from 'react';
import { User, ChevronDown, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores';
import useProfileStore from '../stores/profile';
import PasswordChange from '../components/Password';
import { loadProfile, handleImageUpload, triggerFileInput, saveProfileChanges, navigateToMatches, navigateToPreferences } from '../utils/profileUtils';
import { motion } from 'framer-motion';

const ProfilePage = () => {
  const { user } = useAuthStore();
  const { profile, isLoading, fetchProfile, updateProfile, setProfileField } = useProfileStore();
  const navigate = useNavigate();
  const [coursesInput, setCoursesInput] = useState('');

  const yearOptions = ['First Year', 'Second Year', 'Third Year', 'Final Year'];
  const studyStyleOptions = ['Group', 'Individual', 'Mixed'];

  useEffect(() => {
    loadProfile({ user, fetchProfile, navigate });
  }, [user, fetchProfile, navigate]);

  useEffect(() => {
    setCoursesInput(profile?.courses?.join(',') || '');
  }, [profile?.courses]);

  const handleFieldChange = (field, value) => {
    console.log(`Field: ${field}, Value:`, value);
    if (field === 'courses') {
      setCoursesInput(value);
      setProfileField(field, value);
    } else {
      setProfileField(field, value);
    }
  };

  const onImageChange = async (e) => {
    await handleImageUpload(e.target.files[0], updateProfile);
  };

  const handleSave = () => {
    saveProfileChanges(profile, yearOptions, updateProfile);
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen pt-24 pb-4 bg-gray-50">
      <div className="max-w-full mx-auto">
        <div className="max-w-5xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-2xl font-semibold text-pure-black mb-6"
          >
            My Profile
          </motion.h1>

          {isLoading && (
            <div className="flex justify-center items-center mb-6">
              <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
          >
            <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg sm:text-xl font-semibold text-pure-black mb-4">
                Public Information
              </h2>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-pure-black">
                  Username (Cannot be changed)
                </label>
                <p className="text-xs text-gray-600 mb-2">
                  This username is visible to all Study Buddy members
                </p>
                <input
                  type="text"
                  value={profile.username || ''}
                  disabled
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-pure-black font-medium cursor-not-allowed focus:outline-none"
                  aria-label="Username"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg sm:text-xl font-semibold text-pure-black mb-4">
                Avatar
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 border-2 border-gray-300 flex items-center justify-center rounded-full">
                  {profile.isUploading ? (
                    <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
                  ) : profile.profilePicture ? (
                    <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <User className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500" />
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => triggerFileInput(onImageChange)}
                  className="px-4 py-2 bg-gray-200 text-pure-black rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                  disabled={isLoading || profile.isUploading}
                >
                  {profile.isUploading ? 'Uploading...' : 'Change'}
                </motion.button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl p-6 mb-8 shadow-sm"
          >
            <h2 className="text-lg sm:text-xl font-semibold text-pure-black mb-4">
              Private Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-pure-black">
                  First Name
                </label>
                <input
                  type="text"
                  value={profile.firstName || ''}
                  onChange={(e) => handleFieldChange('firstName', e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-pure-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-pure-black">
                  Last Name
                </label>
                <input
                  type="text"
                  value={profile.lastName || ''}
                  onChange={(e) => handleFieldChange('lastName', e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-pure-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-pure-black">
                  Academic Year
                </label>
                <div className="relative">
                  <select
                    value={profile.academicYear || ''}
                    onChange={(e) => handleFieldChange('academicYear', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-pure-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
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
                  defaultValue={coursesInput || ''}
                  onChange={(e) => handleFieldChange('courses', e.target.value)}
                  placeholder="e.g., Biology,Chemistry,Physics"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-pure-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-pure-black">
                  Preferences
                </label>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigateToPreferences(profile.hasUnsavedChanges, navigate)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading || profile.hasUnsavedChanges}
                >
                  Manage Preferences & Availability
                </motion.button>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-pure-black">
                  Study Style
                </label>
                <div className="relative">
                  <select
                    value={profile.studyStyle || ''}
                    onChange={(e) => handleFieldChange('studyStyle', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-pure-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pb-5"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
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
                'Save Profile'
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigateToMatches(profile.hasUnsavedChanges, navigate)}
              className="px-6 py-2 bg-gray-200 text-pure-black rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
              disabled={isLoading || profile.hasUnsavedChanges}
            >
              Find Matches
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl p-6 mb-8 shadow-sm"
          >
            <h2 className="text-lg sm:text-xl font-semibold text-pure-black mb-4">
              Password
            </h2>
            <PasswordChange />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;