import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSetup } from '../hooks/useSetup';
import BottomNavbar from '../components/shared/BottomNavbar';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { loadExistingProfile } = useSetup();
  const [profileExists, setProfileExists] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      if (user) {
        try {
          const hasProfile = await loadExistingProfile(user.id);
          setProfileExists(hasProfile);
        } catch (error) {
          console.error('Error checking profile:', error);
          setProfileExists(false);
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkProfile();
  }, [user, loadExistingProfile]);

  // Show loading while checking profile
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando perfil...</p>
        </div>
      </div>
    );
  }

  // Redirect to setup if profile doesn't exist
  if (profileExists === false) {
    return <Navigate to="/setup" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Progress Section */}
        <div className="bg-white rounded-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Progreso</h2>
          
          {/* Chart Container */}
          <div className="relative h-48 mb-6">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
              <span>25</span>
              <span>20</span>
              <span>15</span>
              <span>10</span>
              <span>5</span>
              <span>0</span>
            </div>
            
            {/* Chart area */}
            <div className="ml-8 h-full relative">
              {/* Background grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="border-t border-gray-200"></div>
                ))}
              </div>
              
              {/* Chart curve */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 200">
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="0.1"/>
                  </linearGradient>
                </defs>
                <path
                  d="M 20 160 Q 60 140 100 130 T 180 120 Q 220 110 260 100"
                  stroke="#ec4899"
                  strokeWidth="3"
                  fill="none"
                />
                <path
                  d="M 20 160 Q 60 140 100 130 T 180 120 Q 220 110 260 100 L 260 200 L 20 200 Z"
                  fill="url(#progressGradient)"
                />
              </svg>
            </div>
            
            {/* X-axis labels */}
            <div className="ml-8 mt-2 flex justify-between text-xs text-gray-500">
              <span>S</span>
              <span>M</span>
              <span>T</span>
              <span className="text-orange-500 font-bold">W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
            </div>
          </div>
          
          {/* Progress Message */}
          <p className="text-center text-gray-700 text-sm">
            Esta semana alzaste 5 kilos más que la semana pasada ¡Bien hecho!
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Rutinas Card */}
          <div className="bg-orange-400 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12h6v2H9zm0-4h6v2H9zm0 8h6v2H9zM7 8h2v2H7zm0 4h2v2H7zm0 4h2v2H7z"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Rutinas</h3>
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Mi Plan Nutricional Card */}
          <div className="bg-pink-400 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Mi Plan Nutricional</h3>
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNavbar />
    </div>
  );
};

export default Dashboard;