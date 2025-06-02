import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/auth';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { asyncApi, authApi } from '../utils/api';

const ResetPasswordPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [tokenStatus, setTokenStatus] = useState(null);
  const { forgotPassword } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const query = new URLSearchParams(location.search);
  const token = query.get('token');

  const resetMutation = useMutation({
    mutationFn: (identifier) => forgotPassword({ identifier }),
    onSuccess: () => {
      setIdentifier('');
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred while processing your request');
    },
  });

  useEffect(() => {
    if (token) {
      const verifyLink = async () => {
        try {
          await asyncApi.request({
            ...authApi.verifyPasswordLink(),
            url: `/auth/reset-password?token=${token}`,
          });
          setTokenStatus('valid');
        } catch (err) {
          setTokenStatus('invalid');
          toast.error(err.response?.data?.message || 'Invalid or expired reset token');
        }
      };
      verifyLink();
    }
  }, [token]);

  useEffect(() => {
    if (tokenStatus === 'valid') {
      navigate(`/new-password?token=${token}`);
    } else if (tokenStatus === 'invalid') {
      navigate('/reset-password');
    }
  }, [tokenStatus, navigate, token]);

  useEffect(() => {
    if (resetMutation.isSuccess) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/login');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resetMutation.isSuccess, navigate]);

  const handleReset = (e) => {
    e.preventDefault();
    resetMutation.mutate(identifier);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-pure-white pt-24 pb-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto bg-pure-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8"
      >
        <div className="flex justify-center items-center gap-2 mb-4">
          <div className="logo text-2xl font-bold bg-pure-black p-2 rounded-lg flex items-center">
            <p className="text-2xl text-white">S</p>
            <p className="text-white">B</p>
          </div>
          <p className="text-xl md:text-2xl text-pure-black font-bold">STUDY BUDDY</p>
        </div>
        <h2 className="text-xl md:text-2xl font-bold mb-4 sm:mb-6 text-pure-black text-center">
          Request Password Reset
        </h2>
        {resetMutation.isSuccess ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4"
          >
            <motion.svg
              className="w-16 h-16 text-green-500 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </motion.svg>
            <p className="text-green-600 text-sm md:text-base font-semibold">
              Reset link sent to your email!
            </p>
            <p className="text-gray-600 text-sm md:text-base">
              Check your inbox and spam folder. Redirecting to login in {countdown} seconds...
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleReset} className="space-y-3 sm:space-y-4 md:space-y-5">
            <div>
              <label htmlFor="identifier" className="block text-sm md:text-base font-medium text-pure-black">
                Username or Email
              </label>
              <input
                type="text"
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-3 sm:px-5 sm:py-3 border border-gray-300 rounded text-pure-black text-base focus:ring-2 focus:ring-light-blue"
                required
                aria-required="true"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-light-blue text-pure-black p-2 sm:p-3 rounded hover:bg-blue-200 text-base md:text-lg font-semibold transition disabled:opacity-50"
              disabled={resetMutation.isLoading}
              aria-disabled={resetMutation.isLoading}
            >
              {resetMutation.isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-6 w-6 mr-2 text-pure-black" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send Request'
              )}
            </button>
            {resetMutation.isError && (
              <p className="text-red-500 mt-2 text-sm md:text-base text-center">
                Error: {resetMutation.error?.message || 'An error occurred while processing your request'}
              </p>
            )}
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;