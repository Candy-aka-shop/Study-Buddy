import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../utils/api';

const VerifyEmailPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      try {
        await authApi.get('/auth/verify'); 
        setTimeout(() => navigate('/profile'), 3000);
      } catch (error) {
        console.error('Verification Error:', error);
      }
    };
    verify();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-pure-white py-6 sm:py-8 md:py-12">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto bg-pure-white rounded-lg shadow-md p-4 sm:p-6 md:p-8">
        <img src="/logo.png" alt="Study Buddy Logo" className="mx-auto mb-4 w-24 sm:w-32" />
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-pure-black text-center">Email Verification</h2>
        <p className="text-xs sm:text-sm md:text-base text-pure-black text-center">
          A verification email with a link to verify your account has been sent to you.
        </p>
        <button
          onClick={() => navigate('/profile')}
          className="w-full bg-light-blue text-pure-black p-2 sm:p-3 rounded hover:bg-blue-200 text-sm sm:text-base md:text-lg font-semibold transition mt-4"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default VerifyEmailPage;