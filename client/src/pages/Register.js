import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores';
import api, { authApi } from '../utils/api';
import toast from 'react-hot-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const RegisterPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();

  const registerMutation = useMutation({
    mutationFn: async (userData) => {
      const response = await api.request(authApi.register(userData));
      return response.data || response;
    },
    onSuccess: (response) => {
      try {
        const { user } = response.data || response;
        if (!user) {
          throw new Error('User data not found in response');
        }
        setUser(user);
        toast.success('Registration successful! Please check your email to verify.', { duration: 4000 });
        setTimeout(() => {
          navigate(`/verify-email?email=${encodeURIComponent(email)}`, { replace: true });
        }, 2000);
      } catch (error) {
        toast.error('Unexpected error during registration: ' + error.message, { duration: 4000 });
      }
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'An unexpected error occurred during registration';
      toast.error(errorMessage, { duration: 4000 });
    },
  });

  const validateForm = () => {
    if (!firstName.trim()) {
      toast.error('First name is required', { duration: 4000 });
      return false;
    }
    if (!lastName.trim()) {
      toast.error('Last name is required', { duration: 4000 });
      return false;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('A valid email is required', { duration: 4000 });
      return false;
    }
    if (!username.trim() || username.length < 3) {
      toast.error('Username must be at least 3 characters long', { duration: 4000 });
      return false;
    }
    if (!password.trim() || password.length < 6) {
      toast.error('Password must be at least 6 characters long', { duration: 4000 });
      return false;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match', { duration: 4000 });
      return false;
    }
    return true;
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    registerMutation.mutate({ firstName, lastName, email, username, password });
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    switch (id) {
      case 'firstName':
        setFirstName(value);
        break;
      case 'lastName':
        setLastName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'username':
        setUsername(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white pt-24 pb-4">
      <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
        <form onSubmit={handleRegister} className="w-full lg:w-1/2 space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="firstName" className="block text-sm sm:text-base md:text-lg font-medium text-black mb-1">First Name*</label>
              <div className="relative">
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 sm:px-5 sm:py-3 border border-gray-300 rounded-lg text-base sm:text-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  aria-required="true"
                  autoComplete="off"
                  disabled={registerMutation.isLoading}
                />
              </div>
            </div>
            <div className="flex-1">
              <label htmlFor="lastName" className="block text-sm sm:text-base md:text-lg font-medium text-black mb-1">Last Name*</label>
              <div className="relative">
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 sm:px-5 sm:py-3 border border-gray-300 rounded-lg text-base sm:text-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  aria-required="true"
                  autoComplete="off"
                  disabled={registerMutation.isLoading}
                />
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm sm:text-base md:text-lg font-medium text-black mb-1">Email*</label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 sm:px-5 sm:py-3 border border-gray-300 rounded-lg text-base sm:text-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                aria-required="true"
                autoComplete="off"
                disabled={registerMutation.isLoading}
              />
            </div>
          </div>
          <div>
            <label htmlFor="username" className="block text-sm sm:text-base md:text-lg font-medium text-black mb-1">Username*</label>
            <div className="relative">
              <input
                type="text"
                id="username"
                value={username}
                onChange={handleInputChange}
                className="w-full px-4 py-3 sm:px-5 sm:py-3 border border-gray-300 rounded-lg text-base sm:text-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                aria-required="true"
                autoComplete="off"
                disabled={registerMutation.isLoading}
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm sm:text-base md:text-lg font-medium text-black mb-1">Password*</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 sm:px-5 sm:py-3 border border-gray-300 rounded-lg text-base sm:text-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                required
                aria-required="true"
                autoComplete="off"
                disabled={registerMutation.isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                disabled={registerMutation.isLoading}
              >
                {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm sm:text-base md:text-lg font-medium text-black mb-1">Confirm Password*</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-3 sm:px-5 sm:py-3 border border-gray-300 rounded-lg text-base sm:text-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                required
                aria-required="true"
                autoComplete="off"
                disabled={registerMutation.isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                disabled={registerMutation.isLoading}
              >
                {showConfirmPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="mt-2 sm:mt-3 w-full bg-gray-400 text-white p-2 sm:p-3 rounded-lg hover:bg-gray-500 text-base sm:text-lg md:text-xl shadow-md disabled:opacity-50 flex items-center justify-center"
            disabled={registerMutation.isLoading}
            aria-disabled={registerMutation.isLoading}
          >
            {registerMutation.isLoading ? (
              <>
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                Registering...
              </>
            ) : (
              'SIGN UP'
            )}
          </button>
          <div className="text-sm sm:text-base md:text-lg text-gray-600">
            By registering, you are indicating that you have read and agree to{' '}
            <a href="/" className="underline text-blue-600 hover:text-blue-800">Terms of Use</a>,{' '}
            <a href="/" className="underline text-blue-600 hover:text-blue-800">Purchase Policy</a> and{' '}
            <a href="/" className="underline text-blue-600 hover:text-blue-800">Privacy Policy</a>.
          </div>
        </form>
        <div className="w-full lg:w-1/2 mt-6 lg:mt-0 text-center lg:text-left p-5">
          <p className="text-2xl sm:text-2xl md:text-3xl font-bold text-black mb-4">Already have an account?</p>
          <Link
            to="/login"
            className="inline-block text-center w-full sm:w-32 bg-gray-400 text-white p-2 sm:p-3 rounded-lg hover:bg-gray-500 text-base sm:text-lg md:text-xl shadow-md"
          >
            LOG IN
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;