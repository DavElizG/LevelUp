import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Auth Components
import { Auth } from '../components/Auth';

// Setup Components
import Setup from '../components/Setup/Setup';

// Page Components
import { Dashboard, Profile, Workouts, Diet, Settings } from '../pages';
import Progress from '../pages/Progress';
import Nutrition from '../pages/Nutrition';

// Route Protection Component
import ProtectedRoute from './ProtectedRoute.tsx';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicRoute />} />
      <Route path="/auth/*" element={<AuthRoutes />} />
      
      {/* Protected Routes - require authentication */}
      <Route path="/setup" element={
        <ProtectedRoute>
          <Setup />
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      
      <Route path="/workouts" element={
        <ProtectedRoute>
          <Workouts />
        </ProtectedRoute>
      } />
      
      <Route path="/progress" element={
        <ProtectedRoute>
          <Progress />
        </ProtectedRoute>
      } />
      
      <Route path="/nutrition" element={
        <ProtectedRoute>
          <Nutrition />
        </ProtectedRoute>
      } />
      
      <Route path="/diet" element={
        <ProtectedRoute>
          <Diet />
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Public route handler - redirects based on auth status
const PublicRoute: React.FC = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }
  
  if (user) {
    // User is authenticated, redirect to dashboard
    // Setup will be handled by the setup component itself if needed
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Navigate to="/auth" replace />;
};

// Auth routes handler
const AuthRoutes: React.FC = () => {
  const { user } = useAuth();
  
  // If user is already authenticated, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/register" element={<Auth />} />
      <Route path="/reset-password" element={<Auth />} />
      <Route path="/email-confirmation" element={<Auth />} />
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
};

export default AppRoutes;