import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSchedulingStore, useAuthStore } from '../stores';

const SessionsPage = () => {
  const { isAuthenticated } = useAuthStore();
  const { sessions, fetchSessions, proposeSession } = useSchedulingStore();
  const navigate = useNavigate();
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchSessions();
    }
  }, [isAuthenticated, fetchSessions]);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      await proposeSession({ courseId: parseInt(courseId), title, description, startTime: scheduledTime, location });
      setCourseId('');
      setTitle('');
      setDescription('');
      setScheduledTime('');
      setLocation('');
      alert('Session created!');
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Failed to create session');
    }
  };

  if (!isAuthenticated) {
    return <div className="text-center text-pure-black">Please log in to view sessions.</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-pure-white py-6 sm:py-8 md:py-12">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto bg-pure-white rounded-lg shadow-md p-4 sm:p-6 md:p-8">
        <img src="/logo.png" alt="Study Buddy Logo" className="mx-auto mb-4 w-24 sm:w-32" />
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-pure-black text-center">Study Sessions</h2>
        <form onSubmit={handleCreateSession} className="space-y-3 sm:space-y-4 md:space-y-5 mb-8">
          <div>
            <label htmlFor="courseId" className="block text-xs sm:text-sm md:text-base font-medium text-pure-black">Course ID</label>
            <input
              type="number"
              id="courseId"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded text-pure-black text-sm sm:text-base"
              required
            />
          </div>
          <div>
            <label htmlFor="title" className="block text-xs sm:text-sm md:text-base font-medium text-pure-black">Title</label>
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
            <label htmlFor="description" className="block text-xs sm:text-sm md:text-base font-medium text-pure-black">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded text-pure-black text-sm sm:text-base"
            />
          </div>
          <div>
            <label htmlFor="scheduledTime" className="block text-xs sm:text-sm md:text-base font-medium text-pure-black">Scheduled Time</label>
            <input
              type="datetime-local"
              id="scheduledTime"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded text-pure-black text-sm sm:text-base"
              required
            />
          </div>
          <div>
            <label htmlFor="location" className="block text-xs sm:text-sm md:text-base font-medium text-pure-black">Location</label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded text-pure-black text-sm sm:text-base"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-light-blue text-pure-black p-2 sm:p-3 rounded hover:bg-blue-200 text-sm sm:text-base md:text-lg font-semibold transition"
          >
            Create Session
          </button>
        </form>
        <h3 className="text-lg font-semibold mb-2 text-pure-black">Your Sessions</h3>
        {sessions.length === 0 ? (
          <p className="text-pure-black">No sessions found.</p>
        ) : (
          <ul className="space-y-4">
            {sessions.map((session) => (
              <li key={session.id} className="border-b border-gray-200 pb-4">
                <h4 className="text-lg font-semibold text-pure-black">{session.title}</h4>
                <p><strong>Course ID:</strong> {session.courseId}</p>
                <p><strong>Scheduled:</strong> {new Date(session.startTime).toLocaleString()}</p>
                <p><strong>Location:</strong> {session.location || 'Not specified'}</p>
                <p><strong>Status:</strong> {session.confirmed ? 'Confirmed' : 'Pending'}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SessionsPage;