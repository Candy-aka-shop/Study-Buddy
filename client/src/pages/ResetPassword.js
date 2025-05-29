import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../utils/api';

const ResetPasswordPage = () => {
  const [identifier, setIdentifier] = useState('');

  const resetMutation = useMutation({
    mutationFn: (identifier) => authApi.post('/auth/reset-password', { identifier }),
    onSuccess: () => {
      alert('Reset link sent to your email!');
    },
    onError: (error) => {
      console.error('Reset Password Error:', error);
      alert('Failed to send reset link');
    },
  });

  const handleReset = (e) => {
    e.preventDefault();
    resetMutation.mutate(identifier);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-pure-white py-6 sm:py-8 md:py-12">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto bg-pure-white rounded-lg shadow-md p-4 sm:p-6 md:p-8">
        <img src="/logo.png" alt="Study Buddy Logo" className="mx-auto mb-4 w-24 sm:w-32" />
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-pure-black text-center">Request Password Reset</h2>
        <form onSubmit={handleReset} className="space-y-3 sm:space-y-4 md:space-y-5">
          <div>
            <label htmlFor="identifier" className="block text-xs sm:text-sm md:text-base font-medium text-pure-black">Username or Email</label>
            <input
              type="text"
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded text-pure-black text-sm sm:text-base"
              required
              aria-required="true"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-light-blue text-pure-black p-2 sm:p-3 rounded hover:bg-blue-200 text-sm sm:text-base md:text-lg font-semibold transition"
            disabled={resetMutation.isLoading}
            aria-disabled={resetMutation.isLoading}
          >
            {resetMutation.isLoading ? 'Sending...' : 'Send'}
          </button>
          {resetMutation.isSuccess && <p className="text-green-500 mt-2 text-xs sm:text-sm md:text-base text-center">Reset link sent!</p>}
          {resetMutation.isError && (
            <p className="text-red-500 mt-2 text-xs sm:text-sm md:text-base text-center">
              Error: {resetMutation.error?.response?.data?.error || 'Failed to send reset link'}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;