import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../stores/auth';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = () => {
  const { token, user, isAuthenticated, initializeAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isInitializing, setIsInitializing] = useState(true);

  const publicRoutes = useMemo(() => 
    process.env.REACT_APP_PUBLIC_ROUTES?.split(',') || [],
    []
  );

  const initAuth = useCallback(async () => {
    if (publicRoutes.includes(location.pathname)) {
      setIsInitializing(false);
      return;
    }

    if (!token) {
      setIsInitializing(false);
      return;
    }

    try {
      await Promise.race([
        initializeAuth(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Auth initialization timed out')), 5000))
      ]);
    } catch (error) {
      toast.error('Session expired. Please log in.');
      navigate('/login', { replace: true });
    } finally {
      setIsInitializing(false);
    }
  }, [token, initializeAuth, navigate, location.pathname, publicRoutes]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (isAuthenticated && user && !isInitializing) {
      if (user.is_verified === false || user.is_verified === '') {
        toast.error('Please verify your email.');
        navigate(`/verify-email?email=${encodeURIComponent(user.email)}`, { replace: true });
      }
    }
  }, [isAuthenticated, user, isInitializing, navigate]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!token || !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;