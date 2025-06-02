import toast from 'react-hot-toast';
import { uploadToCloudinary } from './upload';

export const loadProfile = async ({ user, fetchProfile, navigate }) => {
  if (!user) {
    toast.error('Please log in to access your profile', { duration: 4000 });
    setTimeout(() => navigate('/login'), 200);
    return;
  }
  await fetchProfile();
};

export const handleImageUpload = async (file, updateProfile) => {
  if (!file) return false;
  if (!file.type.startsWith('image/')) {
    toast.error('Please select an image file', { duration: 4000 });
    return false;
  }
  if (file.size > 5 * 1024 * 1024) {
    toast.error('Image must be less than 5MB', { duration: 4000 });
    return false;
  }

  toast.loading('Uploading image...', { id: 'upload-toast' });

  try {
    const token = localStorage.getItem('authToken');
    const uploaded = await uploadToCloudinary(file, 'studybuddy_images', 'profiles', file.type, token);
    const profilePicture = uploaded.fileUrl;
    if (!profilePicture || typeof profilePicture !== 'string') {
      throw new Error('Invalid image URL returned from Cloudinary');
    }
    await updateProfile({ profilePicture });
    toast.success('Image uploaded successfully!', { id: 'upload-toast', duration: 3000 });
    return profilePicture;
  } catch (uploadError) {
    toast.error('Failed to upload image', { id: 'upload-toast', duration: 4000 });
    return false;
  }
};

export const triggerFileInput = (onChange) => {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.onchange = onChange;
  fileInput.click();
};

export const saveProfileChanges = async (profile, yearOptions, updateProfile) => {
  if (profile.academicYear && !yearOptions.includes(profile.academicYear)) {
    toast.error('Please select a valid year of study', { duration: 4000 });
    return;
  }

  try {
    const updatedProfile = {
      firstName: profile.firstName?.trim() || undefined,
      lastName: profile.lastName?.trim() || undefined,
      academicYear: profile.academicYear ? profile.academicYear.toLowerCase() : undefined,
      courses: profile.courses?.length > 0 ? profile.courses : undefined,
      studyStyle: profile.studyStyle || undefined,
      profilePicture: profile.profilePicture || undefined,
    };

    const hasValidField = Object.values(updatedProfile).some(
      value => value !== undefined && value !== null && (Array.isArray(value) ? value.length > 0 : true)
    );
    if (!hasValidField) {
      toast.error('No changes to save', { duration: 4000 });
      return;
    }

    await updateProfile(updatedProfile);
    toast.success('Profile updated successfully', { duration: 4000 });
  } catch (error) {
    toast.error(error.response?.data?.error || 'Failed to update profile', { duration: 4000 });
  }
};

export const savePreferencesChanges = async (profile, yearOptions, studyStyleOptions, updateProfile) => {
  if (profile.academicYear && !yearOptions.includes(profile.academicYear)) {
    toast.error('Please select a valid year of study', { duration: 4000 });
    return;
  }

  if (!profile.availableDays?.length) {
    toast.error('Please add at least one availability slot', { duration: 4000 });
    return;
  }

  for (const slot of profile.availableDays) {
    const start = new Date(`2000-01-01 ${slot.startTime}`);
    const end = new Date(`2000-01-01 ${slot.endTime}`);
    if (start >= end) {
      toast.error(`Invalid time range for ${slot.day}: Start time must be before end time`, { duration: 4000 });
      return;
    }
  }

  try {
    const updatedProfile = {
      courses: profile.courses?.length > 0 ? profile.courses : undefined,
      studyStyle: profile.studyStyle || undefined,
      availableDays: profile.availableDays?.length > 0 ? profile.availableDays : undefined,
      academicYear: profile.academicYear ? profile.academicYear.toLowerCase() : undefined,
    };

    const hasValidField = Object.values(updatedProfile).some(
      value => value !== undefined && value !== null && (Array.isArray(value) ? value.length > 0 : true)
    );
    if (!hasValidField) {
      toast.error('No changes to save', { duration: 4000 });
      return;
    }

    await updateProfile(updatedProfile);
    toast.success('Preferences updated successfully', { duration: 4000 });
  } catch (error) {
    toast.error(error.response?.data?.error || 'Failed to update preferences', { duration: 4000 });
  }
};

export const navigateToMatches = (hasUnsavedChanges, navigate) => {
  if (hasUnsavedChanges) {
    toast.error('Please save your changes before finding matches', { duration: 4000 });
    return;
  }
  navigate('/suggestions');
};

export const navigateToPreferences = (hasUnsavedChanges, navigate) => {
  if (hasUnsavedChanges) {
    toast.error('Please save your changes before managing preferences', { duration: 4000 });
    return;
  }
  navigate('/preferences');
};