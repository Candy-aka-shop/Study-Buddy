import React, { useState, useEffect } from 'react';
import { useResourcesStore, useAuthStore } from '../stores';

const ResourcesPage = () => {
  const { isAuthenticated } = useAuthStore();
  const { resources, fetchResources, addResource } = useResourcesStore();
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isAuthenticated && courseId) {
      fetchResources();
    }
  }, [isAuthenticated, courseId, fetchResources]);

  const handleShareResource = async (e) => {
    e.preventDefault();
    try {
      await addResource({ courseId: parseInt(courseId), title, fileUrl, description });
      setTitle('');
      setFileUrl('');
      setDescription('');
      alert('Resource shared!');
    } catch (error) {
      console.error('Error sharing resource:', error);
      alert('Failed to share resource');
    }
  };

  if (!isAuthenticated) {
    return <div className="text-center text-pure-black">Please log in to view resources.</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-pure-white py-6 sm:py-8 md:py-12">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto bg-pure-white rounded-lg shadow-md p-4 sm:p-6 md:p-8">
        <img src="/logo.png" alt="Study Buddy Logo" className="mx-auto mb-4 w-24 sm:w-32" />
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-pure-black text-center">Study Resources</h2>
        <div className="mb-8">
          <label htmlFor="courseId" className="block text-xs sm:text-sm md:text-base font-medium text-pure-black">Course ID</label>
          <input
            type="number"
            id="courseId"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="w-full p-2 sm:p-3 border border-gray-300 rounded text-pure-black text-sm sm:text-base"
            placeholder="Enter course ID to view resources"
          />
        </div>
        <form onSubmit={handleShareResource} className="space-y-3 sm:space-y-4 md:space-y-5 mb-8">
          <div>
            <label htmlFor="title" className="block text-xs sm:text-sm md:text-base font-medium text-pure-black">Resource Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded text-pure-black text-sm sm:text-base"
              required
            />
          </div>
          <div>
            <label htmlFor="fileUrl" className="block text-xs sm:text-sm md:text-base font-medium text-pure-black">File URL</label>
            <input
              type="url"
              id="fileUrl"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded text-pure-black text-sm sm:text-base"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-xs sm:text-sm md:text-base font-medium text-pure-black">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded text-pure-black text-sm sm:text-base"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-light-blue text-pure-black p-2 sm:p-3 rounded hover:bg-blue-200 text-sm sm:text-base md:text-lg font-semibold transition"
            disabled={!courseId}
          >
            Share Resource
          </button>
        </form>
        {courseId && resources.length === 0 ? (
          <p className="text-pure-black">No resources found for this course.</p>
        ) : (
          <ul className="space-y-4">
            {resources.map((resource) => (
              <li key={resource.id} className="border-b border-gray-200 pb-4">
                <h4 className="text-lg font-semibold text-pure-black">{resource.title}</h4>
                <p><strong>Uploaded by:</strong> User {resource.sharedBy}</p>
                <p><strong>File:</strong> <a href={resource.url} target="_blank" className="text-blue-500 hover:underline">{resource.url}</a></p>
                <p><strong>Description:</strong> {resource.content || 'None'}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ResourcesPage;