const uploadToCloudinary = async (file, uploadPreset, folder, fileType, authToken) => {
  try {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 5MB limit');
    }
    const signatureResponse = await fetch(`${process.env.REACT_APP_API_URL}/upload/upload-signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ upload_preset: uploadPreset, folder }),
    });
    if (!signatureResponse.ok) {
      const errorData = await signatureResponse.json();
      throw new Error(errorData.error || 'Failed to get upload signature');
    }
    const { signature, timestamp, cloud_name, api_key, upload_preset, folder: cloudinaryFolder } = await signatureResponse.json();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('signature', signature);
    formData.append('timestamp', timestamp);
    formData.append('api_key', api_key);
    formData.append('upload_preset', upload_preset);
    formData.append('folder', cloudinaryFolder);
    const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      throw new Error(errorData.error?.message || 'Failed to upload file to Cloudinary');
    }
    const uploadResult = await uploadResponse.json();
    const fileUrl = uploadResult.secure_url;
    const storeResponse = await fetch(`${process.env.REACT_APP_API_URL}/upload/store-file-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ file_url: fileUrl, file_type: fileType }),
    });
    if (!storeResponse.ok) {
      const errorData = await storeResponse.json();
      throw new Error(errorData.error || 'Failed to store file URL');
    }
    const storeResult = await storeResponse.json();
    return { fileUrl, fileId: storeResult.file.file_id, fileType: storeResult.file.file_type };
  } catch (error) {
    throw error;
  }
};
export { uploadToCloudinary };