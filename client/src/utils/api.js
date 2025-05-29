import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (credentials) => api.post('/users/login', credentials),
  register: (userData) => api.post('/users/register', userData),
  getUser: () => api.get('/users/me'),
  updateProfile: (data) => api.patch('/users/me', data),
  getPreferences: () => api.get('/users/me/preferences'),
  updatePreferences: (data) => api.post('/users/me/preferences', data),
  getAvailability: () => api.get('/users/me/availability'),
  updateAvailability: (slots) => api.post('/users/me/availability', slots),
  deleteAvailability: (availabilityId) => api.delete(`/users/me/availability/${availabilityId}`),
  getStudyBuddies: () => api.get('/users/me/study-buddies'),
  getCourses: () => api.get('/courses'),
  enrollCourse: (courseId) => api.post('/users/me/courses', { courseId }),
  sendMessage: (data) => api.post('/messages', data),
  getMessages: () => api.get('/messages'),
  createSession: (data) => api.post('/sessions', data),
  getSessions: () => api.get('/sessions/me/sessions'),
  joinSession: (sessionId, data) => api.post(`/sessions/${sessionId}/participants`, data),
  shareResource: (data) => api.post('/resources', data),
  getResources: (courseId) => api.get(`/resources/course/${courseId}`),
  rateSession: (sessionId, data) => api.post(`/sessions/${sessionId}/ratings`, data),
  getSessionRatings: (sessionId) => api.get(`/sessions/${sessionId}/ratings`),
};

export default api;