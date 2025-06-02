import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api, { authApi } from '../utils/api';
import useAuthStore from '../stores/auth';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('Checking...');
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { setUser, setToken } = useAuthStore();
  const hasVerified = useRef(false);

  useEffect(() => {
    const verify = async () => {
      const email = searchParams.get('email') || '';
      const token = searchParams.get('token');

      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      setToken(null, null);
      setUser(null);

      if (hasVerified.current) {
        return;
      }
      hasVerified.current = true;

      if (!email && !token) {
        setStatus('No verification details provided');
        toast.error('No verification details provided');
        navigate('/login', { replace: true });
        return;
      }

      if (!email) {
        setStatus('Email missing');
        toast.error('Email missing');
        navigate('/login', { replace: true });
        return;
      }

      if (!token) {
        setStatus('Verification email sent. Please check your inbox.');
        setCanResend(true);
        return;
      }

      setStatus('Verifying...');
      try {
        const response = await api.request(authApi.verifyEmail(email, token));
        const { accessToken, refreshToken, user, is_verified } = response.data;
        localStorage.setItem('authToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setToken(accessToken, refreshToken);
        setUser(user);
        localStorage.removeItem('pendingVerificationEmail');
        if (is_verified) {
          toast.success('Email verified successfully!');
          navigate('/profile', { replace: true });
        } else {
          toast.error('Verification failed');
          setStatus('Verification failed');
          setCanResend(true);
        }
      } catch (error) {
        const errorMessage = error.response?.data?.error || error.message || 'Verification failed';
        setStatus(errorMessage);
        toast.error(errorMessage);
        setCanResend(true);
      }
    };

    verify();
  }, [navigate, searchParams, setUser, setToken]);

  const handleResend = async () => {
    setIsResending(true);
    try {
      const email = searchParams.get('email') || '';
      if (!email) {
        setStatus('No email found for resending verification');
        toast.error('No email found for resending verification');
        return;
      }
      await api.request(authApi.resendVerification({ email }));
      setStatus('Verification email resent successfully');
      toast.success('Verification email resent successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to resend verification email';
      setStatus(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-pure-white py-6 sm:py-8 md:py-12">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto bg-pure-white rounded-lg shadow-md p-4 sm:p-6 md:p-8">
        <div className="flex justify-center items-center gap-2 mb-4">
          <div className="logo text-2xl font-bold bg-pure-black p-2 rounded-lg flex items-center">
            <p className="text-2xl text-white">S</p>
            <p className="text-white">B</p>
          </div>
          <p className="text-xl md:text-2xl text-pure-black font-bold">STUDY BUDDY</p>
        </div>
        <h2 className="text-xl md:text-2xl font-bold mb-4 sm:mb-6 text-pure-black text-center">
          Email Verification
        </h2>
        <p className="text-sm md:text-base text-pure-black text-center">{status}</p>
        {(canResend || !searchParams.get('token')) && (
          <button
            onClick={handleResend}
            className="w-full bg-light-blue text-pure-black p-2 sm:p-3 rounded hover:bg-blue-200 text-base md:text-lg font-semibold transition mt-4 flex items-center justify-center disabled:opacity-50"
            disabled={isResending}
            aria-disabled={isResending}
          >
            {isResending ? (
              <>
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                Resending...
              </>
            ) : (
              'Resend Verification Email'
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;