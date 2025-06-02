// utils/message.js
import { uploadToCloudinary } from './upload';
import toast from 'react-hot-toast';
import { socketService } from './socket';

export const handleFileSelectLocal = async (event, setAttachedFiles, fileInputRef, setIsUploading) => {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;

  setIsUploading(true);
  toast.loading('Uploading files...', { id: 'upload-toast' });

  try {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No auth token found');

    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        if (!file.type.startsWith('image/')) throw new Error('Only image files are allowed');
        if (file.size > 5 * 1024 * 1024) throw new Error('Image must be less than 5MB');
        const result = await uploadToCloudinary(file, 'studybuddy_images', 'messages', file.type, token);
        return {
          id: Math.random().toString(36).substring(2),
          name: file.name,
          size: file.size,
          type: file.type,
          preview: URL.createObjectURL(file),
          url: result.fileUrl,
        };
      })
    );

    setAttachedFiles((prev) => [...prev, ...uploadedFiles]);
    toast.success('Files uploaded successfully', { id: 'upload-toast', duration: 3000 });
  } catch (error) {
    toast.error(error.message || 'Failed to upload files', { id: 'upload-toast', duration: 4000 });
  } finally {
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }
};

export const removeFile = (fileId, setAttachedFiles) => {
  setAttachedFiles((prev) => {
    const updated = prev.filter((f) => f.id !== fileId);
    const removed = prev.find((f) => f.id === fileId);
    if (removed?.preview) {
      URL.revokeObjectURL(removed.preview);
    }
    return updated;
  });
};

export const handleSend = async (event, params) => {
  event.preventDefault();
  const { selectedChatRoom, messageContent, attachedFiles, profile, setAttachedFiles, setIsSubmitting } = params;

  if (!selectedChatRoom || (!messageContent.trim() && attachedFiles.length === 0) || !profile?.username) {
    toast.error('Cannot send message: Missing room, content, or user profile', { duration: 4000 });
    return;
  }

  setIsSubmitting(true);

  try {
    const attachments = attachedFiles.map((file) => ({
      name: file.name,
      url: file.url,
      type: file.type,
      size: file.size,
    }));

    await socketService.sendMessage(selectedChatRoom.chat_room_id, messageContent, attachments, profile.username);

    event.target.reset();
    setAttachedFiles([]);
    toast.success('Message sent', { duration: 3000 });
  } catch (error) {
    toast.error(error.message || 'Failed to send message', { duration: 4000 });
  } finally {
    setIsSubmitting(false);
  }
};