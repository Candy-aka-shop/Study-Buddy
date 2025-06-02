import { create } from 'zustand';
import api, { authApi } from '../utils/api';
import toast from 'react-hot-toast';

const useProfileStore = create((set, get) => ({
  profile: null,
  isLoading: false,
  isUploading: false,
  error: null,
  hasUnsavedChanges: false,

  setProfile: (profile) => set({ profile }),

  setProfileField: (field, value) => {
    set((state) => {
      let newProfile = { ...state.profile };
      let hasUnsavedChanges = state.hasUnsavedChanges;

      if (field === 'courses') {
        let coursesArray;
        if (typeof value === 'string') {
          coursesArray = value
            .split(',')
            .map((course) => course.trim())
            .filter((course) => course.length > 0);
        } else if (Array.isArray(value)) {
          coursesArray = value.filter((course) => typeof course === 'string' && course.trim().length > 0);
        } else {
          coursesArray = [];
        }
        newProfile[field] = coursesArray;
        hasUnsavedChanges = JSON.stringify(coursesArray) !== JSON.stringify(state.profile.courses || []);
      } else if (field === 'academicYear') {
        newProfile[field] = value;
        const yearMap = {
          'first year': 'First Year',
          '1st year': 'First Year',
          'second year': 'Second Year',
          '2nd year': 'Second Year',
          'third year': 'Third Year',
          '3rd year': 'Third Year',
          'final year': 'Final Year',
          '4th year': 'Final Year',
          'fourth year': 'Final Year',
        };
        const backendYear = state.profile.academic_year?.toLowerCase();
        hasUnsavedChanges = value !== (yearMap[backendYear] || '');
      } else if (field === 'availableDays') {
        newProfile[field] = value;
        hasUnsavedChanges = JSON.stringify(value) !== JSON.stringify(state.profile.availableDays || []);
      } else {
        newProfile[field] = value;
        hasUnsavedChanges = value !== (state.profile[field] || '');
      }

      return { profile: newProfile, hasUnsavedChanges };
    });
  },

  addAvailabilitySlot: (day) => {
    set((state) => {
      const newSlot = { id: Date.now(), day, startTime: '09:00', endTime: '11:00' };
      const updatedDays = [...(state.profile.availableDays || []), newSlot];
      return {
        profile: { ...state.profile, availableDays: updatedDays },
        hasUnsavedChanges: true,
      };
    });
  },

  removeAvailabilitySlot: (id) => {
    set((state) => {
      if (state.profile.availableDays.length <= 1) {
        toast.error('You must have at least one availability slot');
        return state;
      }
      const updatedDays = state.profile.availableDays.filter((slot) => slot.id !== id);
      return {
        profile: { ...state.profile, availableDays: updatedDays },
        hasUnsavedChanges: true,
      };
    });
  },

  updateAvailabilitySlot: (id, field, value) => {
    set((state) => {
      const updatedDays = state.profile.availableDays.map((slot) =>
        slot.id === id ? { ...slot, [field]: value } : slot
      );
      return {
        profile: { ...state.profile, availableDays: updatedDays },
        hasUnsavedChanges: true,
      };
    });
  },

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.request(authApi.getUser());
      const profileData = response.data.user || {};

      profileData.availableDays = profileData.available_days?.length > 0
        ? profileData.available_days.map((slot, index) => ({
            ...slot,
            id: slot.id || index + 1,
          }))
        : [{ id: 1, day: 'Monday', startTime: '09:00', endTime: '11:00' }];

      const yearMap = {
        'first year': 'First Year',
        '1st year': 'First Year',
        'second year': 'Second Year',
        '2nd year': 'Second Year',
        'third year': 'Third Year',
        '3rd year': 'Third Year',
        'final year': 'Final Year',
        '4th year': 'Final Year',
        'fourth year': 'Final Year',
      };
      profileData.academicYear = yearMap[profileData.academic_year?.toLowerCase()] || '';
      profileData.firstName = profileData.first_name || '';
      profileData.lastName = profileData.last_name || '';
      profileData.studyStyle = profileData.study_style || '';
      profileData.profilePicture = profileData.profile_picture || null;
      profileData.courses = Array.isArray(profileData.courses) ? profileData.courses : [];

      set({ profile: profileData, isLoading: false });
      return profileData;
    } catch (error) {
      const defaultProfile = {
        username: '',
        firstName: '',
        lastName: '',
        academicYear: '',
        courses: [],
        studyStyle: '',
        profilePicture: null,
        availableDays: [{ id: 1, day: 'Monday', startTime: '09:00', endTime: '11:00' }],
      };
      set({
        profile: defaultProfile,
        error: error.response?.data?.error || error.message || 'Failed to fetch profile',
        isLoading: false,
      });
      toast.error(error.response?.data?.error || 'Failed to fetch profile');
      return defaultProfile;
    }
  },

  updateProfile: async (updates) => {
    set({ isLoading: true, error: null });
    try {
      const { firstName, lastName, academicYear, courses, studyStyle, profilePicture, availableDays } = updates;
      const payload = {
        firstName: firstName?.trim() || undefined,
        lastName: lastName?.trim() || undefined,
        academicYear: academicYear ? academicYear.toLowerCase() : undefined,
        courses: Array.isArray(courses) && courses.length > 0 ? courses : undefined,
        studyStyle: studyStyle || undefined,
        profilePicture: profilePicture || undefined,
        availableDays: Array.isArray(availableDays) && availableDays.length > 0 ? availableDays : undefined,
      };

      const response = await api.request(authApi.updateProfile(payload));
      const profileData = response.data.user || {};

      profileData.availableDays = profileData.available_days?.length > 0
        ? profileData.available_days.map((slot, index) => ({
            ...slot,
            id: slot.id || index + 1,
          }))
        : [{ id: 1, day: 'Monday', startTime: '09:00', endTime: '11:00' }];

      const yearMap = {
        'first year': 'First Year',
        '1st year': 'First Year',
        'second year': 'Second Year',
        '2nd year': 'Second Year',
        'third year': 'Third Year',
        '3rd year': 'Third Year',
        'final year': 'Final Year',
        '4th year': 'Final Year',
        'fourth year': 'Final Year',
      };
      profileData.academicYear = yearMap[profileData.academic_year?.toLowerCase()] || '';
      profileData.firstName = profileData.first_name || '';
      profileData.lastName = profileData.last_name || '';
      profileData.studyStyle = profileData.study_style || '';
      profileData.profilePicture = profileData.profile_picture || null;
      profileData.courses = Array.isArray(profileData.courses) ? profileData.courses : [];

      set({ profile: profileData, isLoading: false, hasUnsavedChanges: false });
      return profileData;
    } catch (error) {
      set({ error: error.response?.data?.error || error.message || 'Failed to update profile', isLoading: false });
      toast.error(error.response?.data?.error || 'Failed to update profile');
      throw error;
    }
  },

  changePassword: async ({ oldPassword, newPassword }) => {
    set({ isLoading: true, error: null });
    try {
      const payload = {
        oldPassword,
        password: newPassword,
      };
      const response = await api.request(authApi.updateProfile(payload));
      toast.success('Password changed successfully');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to change password';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  clearProfile: () => set({ profile: null, isLoading: false, isUploading: false, error: null, hasUnsavedChanges: false }),
}));

export default useProfileStore;