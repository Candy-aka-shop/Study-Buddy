import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores';
import api, { authApi } from '../utils/api';
import toast from 'react-hot-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: (credentials) => api.request(authApi.login(credentials)),
    onSuccess: (response) => {
      try {
        const { accessToken, refreshToken, user, is_verified } = response.data || response;
        setToken(accessToken, refreshToken);
        setUser(user);
        toast.success('Login successful!', { duration: 4000 });
        if (!is_verified) {
          toast.error('Please verify your email to continue.', { duration: 4000 });
          setTimeout(() => navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`, { replace: true }), 100);
        } else {
          setTimeout(() => navigate('/profile', { replace: true }), 100);
        }
      } catch (error) {
        toast.error('Unexpected error during login', { duration: 4000 });
      }
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Invalid email or password';
      toast.error(errorMessage, { duration: 4000 });
    },
  });

  const handleLogin = (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('A valid email is required', { duration: 4000 });
      return;
    }
    if (!formData.password.trim()) {
      toast.error('Password is required', { duration: 4000 });
      return;
    }
    loginMutation.mutate(formData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white pt-24 pb-4">
      <div className="md:w-5/6 w-full flex flex-col md:flex-row gap-12 items-start">
        <form onSubmit={handleLogin} className="w-full md:w-1/2 space-y-4">
          <div>
            <label htmlFor="loginEmail" className="block text-sm sm:text-base md:text-lg font-medium text-black">Email*</label>
            <div className="relative">
              <input
                type="email"
                id="loginEmail"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 sm:px-5 sm:py-3 border border-gray-300 rounded-lg text-base sm:text-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                aria-required="true"
                autoComplete="email"
                disabled={loginMutation.isLoading}
              />
            </div>
          </div>
          <div>
            <label htmlFor="loginPassword" className="block text-sm sm:text-base md:text-lg font-medium text-black">Password*</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="loginPassword"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 sm:px-5 sm:py-3 border border-gray-300 rounded-lg text-base sm:text-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                required
                aria-required="true"
                autoComplete="current-password"
                disabled={loginMutation.isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                disabled={loginMutation.isLoading}
              >
                {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
              </button>
            </div>
          </div>
          <p className="text-sm sm:text-base md:text-lg text-right">
            <Link to="/reset-password" className="text-blue-500 hover:underline">Forgot your password?</Link>
          </p>
          <button
            type="submit"
            className="mt-2 sm:mt-3 bg-gray-400 text-white p-2 sm:p-3 rounded-lg hover:bg-gray-500 text-base sm:text-lg md:text-xl shadow-md w-full flex items-center justify-center disabled:opacity-50"
            disabled={loginMutation.isLoading}
            aria-disabled={loginMutation.isLoading}
          >
            {loginMutation.isLoading ? (
              <>
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                Logging in...
              </>
            ) : (
              'LOG IN'
            )}
          </button>
        </form>
        <div className="mt-6 md:mt-0 md:ml-6 text-center md:text-left p-5">
          <p className="text-2xl sm:text-2xl md:text-3xl font-bold text-black">Don't have an <br /> account yet?</p>
          <Link to="/register" className="mt-2 sm:mt-3 inline-block w-full max-w-[150px] text-center bg-gray-400 text-white p-2 sm:p-3 rounded-lg hover:bg-gray-500 text-base sm:text-lg md:text-xl shadow-md">
            SIGN UP
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;