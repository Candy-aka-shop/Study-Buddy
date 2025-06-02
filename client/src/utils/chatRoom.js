// client/src/utils/chatRoom.js
import { Image, Video, Music, FileText } from 'lucide-react';
import { uploadToCloudinary } from './upload';

const handleFileSelect = (event, setAttachedFiles, fileInputRef) => {
  const files = Array.from(event.target.files || []);
  const newFiles = files.map((file) => ({
    id: Date.now() + Math.random(),
    file,
    name: file.name,
    size: file.size,
    type: file.type,
    preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
  }));
  setAttachedFiles((prev) => [...prev, ...newFiles]);
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
};

const removeAttachedFile = (fileId, setAttachedFiles) => {
  setAttachedFiles((prev) => {
    const updated = prev.filter((f) => f.id !== fileId);
    const fileToRemove = prev.find((f) => f.id === fileId);
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    return updated;
  });
};

const getFileIcon = (fileType) => {
  if (!fileType) return <FileText size={16} />;
  if (fileType.startsWith('image/')) return <Image size={16} />;
  if (fileType.startsWith('video/')) return <Video size={16} />;
  if (fileType.startsWith('audio/')) return <Music size={16} />;
  return <FileText size={16} />;
};

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const uploadFiles = async (files) => {
  const uploadPromises = files.map((fileObj) =>
    uploadToCloudinary(fileObj.file, 'messages', 'messages', fileObj.type)
  );
  try {
    return await Promise.all(uploadPromises);
  } catch (error) {
    throw new Error('Failed to upload files');
  }
};

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export { handleFileSelect, removeAttachedFile, getFileIcon, formatFileSize, uploadFiles, formatTime };