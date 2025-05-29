import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import MainLayout from './layouts/MainLayout';

const HomePage = lazy(() => import('./pages/Home'));
const RegisterPage = lazy(() => import('./pages/Register'));
const LoginPage = lazy(() => import('./pages/Login'));
const ProfilePage = lazy(() => import('./pages/Profile'));
const SuggestionsPage = lazy(() => import('./pages/Suggestions'));
const CourseListPage = lazy(() => import('./pages/CourseList'));
const AvailabilityPage = lazy(() => import('./pages/Availability'));
const PreferencesPage = lazy(() => import('./pages/Preferences'));
const SessionsPage = lazy(() => import('./pages/Sessions'));
const ResourcesPage = lazy(() => import('./pages/Resources'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPassword'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmail'));
const MessagesPage = lazy(() => import('./pages/Messages'));

const FallbackSpinner = () => (
  <div className="flex justify-center items-center h-screen bg-light-blue">
    <motion.div
      className="w-12 h-12 border-4 border-t-pure-black border-l-pure-black border-b-transparent border-r-transparent rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  </div>
);

function App() {
  return (
    <Suspense fallback={<FallbackSpinner />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/suggestions" element={<SuggestionsPage />} />
          <Route path="/courses" element={<CourseListPage />} />
          <Route path="/availability" element={<AvailabilityPage />} />
          <Route path="/preferences" element={<PreferencesPage />} />
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/messages" element={<MessagesPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;