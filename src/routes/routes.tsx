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
import FoodSearchPage from '../pages/FoodSearchPage';
import FoodPhotoAnalyzerPage from '../pages/FoodPhotoAnalyzerPage';

// Route Protection Component
import ProtectedRoute from './ProtectedRoute.tsx';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicRoute />} />
      <Route path="/auth/*" element={<AuthRoutes />} />
      
      {/* Reset Password Route - Public, accessible even with temporary session during recovery */}
      <Route 
        path="/reset-password" 
        element={<Auth />} 
      />
      
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
      
      {/* Redirect meal-log to nutrition */}
      <Route path="/meal-log" element={<Navigate to="/nutrition" replace />} />

      <Route path="/food-search" element={
        <ProtectedRoute>
          <FoodSearchPage />
        </ProtectedRoute>
      } />

      <Route path="/food-photo-analyzer" element={
        <ProtectedRoute>
          <FoodPhotoAnalyzerPage />
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
  
  // Check if this is a password recovery flow
  const isRecoveryFlow = (): boolean => {
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = window.location.hash ? new URLSearchParams(window.location.hash.substring(1)) : null;
    
    const type = urlParams.get('type') || hashParams?.get('type');
    const accessToken = urlParams.get('access_token') || hashParams?.get('access_token');
    
    return type === 'recovery' && !!accessToken;
  };
  
  // If user is already authenticated BUT it's NOT a recovery flow, redirect to dashboard
  if (user && !isRecoveryFlow()) {
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