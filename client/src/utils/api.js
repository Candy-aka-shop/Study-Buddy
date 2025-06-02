import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const AUTH_EXCLUDED_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/verify-email',
  '/auth/resend-verification',
  '/auth/request-password-reset',
  '/auth/reset-password',
  '/auth/check-email',
];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

const isAuthExcludedEndpoint = (url) => {
  return AUTH_EXCLUDED_ENDPOINTS.some((endpoint) => {
    if (endpoint.endsWith('*')) {
      return url.includes(endpoint.slice(0, -1));
    }
    return url.includes(endpoint);
  });
};

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('authToken');
  const isExcluded = isAuthExcludedEndpoint(config.url);
  
  if (!isExcluded && token) {
    config.headers.Authorization = `Bearer ${token}`;
  } 
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const publicRoutes = process.env.REACT_APP_PUBLIC_ROUTES
      ? process.env.REACT_APP_PUBLIC_ROUTES.split(',')
      : [];
    const isPublicRoute = publicRoutes.some((route) => window.location.pathname.includes(route));

    if (isAuthExcludedEndpoint(originalRequest.url)) {
      const message = error.response?.data?.error || error.response?.data?.message || 'An error occurred';
      return Promise.reject({ ...error, message });
    }

    if (error.response?.status === 403 && !originalRequest._retry) {
      if (originalRequest.url.includes('/users/me') && isPublicRoute) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(async (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return await api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          if (!isPublicRoute) {
            window.location.href = '/login';
          }
          return Promise.reject(new Error('No refresh token'));
        }

        const response = await api.post('/auth/refresh-token', { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem('authToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        processQueue(null, accessToken);

        return await api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        processQueue(refreshError, null);
        
        if (!isPublicRoute) {
          console.log('Redirecting to /login: refresh failed');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response) {
      const message = error.response.data?.error || error.response.data?.message || 'An error occurred';
      return Promise.reject({ ...error, message });
    } else if (error.request) {
      return Promise.reject({ message: 'No response received from server' });
    } else {
      return Promise.reject({ message: error.message });
    }
  }
);

const asyncApi = {
  async request(config) {
    try {
      if (config.beforeRequest) {
        await config.beforeRequest();
      }
      const response = await api.request(config);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export const authApi = {
  login: (credentials) => ({ method: 'post', url: '/auth/login', data: credentials }),
  register: (userData) => ({
    method: 'post',
    url: '/auth/register',
    data: userData,
    beforeRequest: async () => {
      localStorage.setItem('pendingVerificationEmail', userData.email);
    },
  }),
  verifyEmail: (email, token) => ({
    method: 'get',
    url: `/auth/verify-email?email=${encodeURIComponent(email)}&token=${token}`,
  }),
  resendVerification: (data) => ({ method: 'post', url: '/auth/resend-verification', data }),
  refreshToken: (refreshToken) => ({ method: 'post', url: '/auth/refresh-token', data: { refreshToken } }),
  corgotPassword: (data) => ({ method: 'post', url: '/auth/request-password-reset', data }),
  resetPassword: (data) => ({ method: 'post', url: '/auth/reset-password', data }),
  verifyPasswordLink: () => ({ method: 'get', url: '/auth/reset-password' }),
  checkEmail: (email) => ({ method: 'post', url: '/auth/check-email', data: { email } }),
  
  getUser: () => ({ method: 'get', url: '/users/me' }),
  updateProfile: (data) => ({ method: 'patch', url: '/users/me', data }),
  
  getPreferences: () => ({ method: 'get', url: '/preferences/me' }),
  updatePreferences: (data) => ({ method: 'post', url: '/preferences/me', data }),
  
  createChatRoom: (data) => ({ method: 'post', url: '/chatrooms/room', data }),
  getMyChatRooms: () => ({ method: 'get', url: '/chatrooms/my-rooms' }),
  joinChatRoom: (chatRoomId) => ({ method: 'post', url: `/chatrooms/${chatRoomId}/join` }),
  getChatRoom: (chatRoomId) => ({ method: 'get', url: `/chatrooms/room/${chatRoomId}` }),
  sendMessage: (chatRoomId, data) => ({ method: 'post', url: `/chatrooms/${chatRoomId}/messages`, data }),
  getMessages: (chatRoomId) => ({ method: 'get', url: `/chatrooms/room/${chatRoomId}/messages` }),
  
  getSuggestions: () => ({ method: 'get', url: '/suggestions/me' }),
};

export { asyncApi };
export default api;