import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Auth Components
import { Auth } from '../components/Auth';

// Setup Components
import Setup from '../components/Setup/Setup';

// Page Components
import { 
  Dashboard, 
  Profile, 
  Progress,
  Settings,
  Subscription,
  Workouts, 
  WorkoutPreviewPage, 
  WorkoutEditPage, 
  WorkoutGeneratorPage,
  WorkoutExecutionPage,
  DietGeneratorPage,
  DietPlanView,
  Nutrition,
  FoodSearchPage,
  FoodPhotoAnalyzerPage
} from '../pages';

// Admin Components
import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { UserManagement } from '../pages/admin/UserManagement';
import { RoleManagement } from '../pages/admin/RoleManagement';
import { RoutineManagement } from '../pages/admin/RoutineManagement';
import ExerciseManagement from '../pages/admin/ExerciseManagement';
import FoodManagement from '../pages/admin/FoodManagement';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage';
import { SystemSettingsPage } from '../pages/admin/SystemSettingsPage';

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
      
      {/* Workout generator route - must come before dynamic routes */}
      <Route path="/workouts/generate" element={
        <ProtectedRoute>
          <WorkoutGeneratorPage />
        </ProtectedRoute>
      } />
      
      {/* Workout preview route - must come before dynamic routes */}
      <Route path="/workouts/:id/preview" element={
        <ProtectedRoute>
          <WorkoutPreviewPage />
        </ProtectedRoute>
      } />

      {/* Workout edit route */}
      <Route path="/workouts/:id/edit" element={
        <ProtectedRoute>
          <WorkoutEditPage />
        </ProtectedRoute>
      } />
      
      {/* Dynamic workout execution routes */}
      <Route path="/workouts/:routineId" element={
        <ProtectedRoute>
          <WorkoutExecutionPage />
        </ProtectedRoute>
      } />
      
      <Route path="/workouts/:routineId/:exerciseIndex" element={
        <ProtectedRoute>
          <WorkoutExecutionPage />
        </ProtectedRoute>
      } />
      
      <Route path="/workouts/:routineId/:exerciseIndex/:setNumber" element={
        <ProtectedRoute>
          <WorkoutExecutionPage />
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
      
      {/* Diet generator route */}
      <Route path="/diet/generate" element={
        <ProtectedRoute>
          <DietGeneratorPage />
        </ProtectedRoute>
      } />
      
      {/* Diet plan view route */}
      <Route path="/diet/plan" element={
        <ProtectedRoute>
          <DietPlanView />
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />

      <Route path="/subscription" element={
        <ProtectedRoute>
          <Subscription />
        </ProtectedRoute>
      } />
      
      {/* Admin Routes - Protected by AdminLayout */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="roles" element={<RoleManagement />} />
        <Route path="routines" element={<RoutineManagement />} />
        <Route path="exercises" element={<ExerciseManagement />} />
        <Route path="foods" element={<FoodManagement />} />
        <Route path="logs" element={<AuditLogsPage />} />
        <Route path="settings" element={<SystemSettingsPage />} />
      </Route>
      
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
  // PKCE flow sends ?code=xxx, Implicit flow sends ?access_token=xxx
  const isRecoveryFlow = (): boolean => {
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = window.location.hash ? new URLSearchParams(window.location.hash.substring(1)) : null;
    
    const type = urlParams.get('type') || hashParams?.get('type');
    const code = urlParams.get('code') || hashParams?.get('code');
    const accessToken = urlParams.get('access_token') || hashParams?.get('access_token');
    
    // Recovery flow is detected if we have a code OR access_token (regardless of type param)
    // type=recovery is optional in PKCE flow
    return !!(code || accessToken) && (type === 'recovery' || !!code);
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
      <Route path="/forgot-password" element={<Auth />} />
      <Route path="/reset-password" element={<Auth />} />
      <Route path="/email-confirmation" element={<Auth />} />
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
};

export default AppRoutes;