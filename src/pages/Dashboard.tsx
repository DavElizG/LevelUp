import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSetup } from '../hooks/useSetup';
import { useProfile } from '../hooks/useProfile';
import BottomNavbar from '../components/shared/BottomNavbar';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { loadExistingProfile } = useSetup();
  const { profile } = useProfile(user?.id);
  const navigate = useNavigate();
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días';
    if (hour < 18) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  const getMotivationalMessage = () => {
    const messages = [
      "¡Hoy es el día perfecto para superarte!",
      "Cada repetición te acerca a tu meta",
      "Tu único límite eres tú mismo",
      "El progreso, no la perfección",
      "¡Vamos por esos objetivos!",
      "La disciplina vence a la motivación",
      "El dolor de hoy es la fuerza de mañana",
      "No pares cuando estés cansado, para cuando hayas terminado",
      "Un paso más es un paso menos hacia tu meta",
      "La constancia construye resultados",
      "Los cambios pequeños crean grandes transformaciones",
      "Entrena fuerte, mantente humilde",
      "Suda, sonríe y repite",
      "Nunca es tarde para empezar, pero siempre es tarde para rendirse",
      "Eres más fuerte de lo que piensas"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const formatGoal = () => {
    if (!profile?.fitness_goal) return 'Definir objetivo';
    const goals = {
      'lose_weight': 'Perder Peso',
      'gain_weight': 'Ganar Peso',
      'gain_muscle': 'Ganar Músculo',
      'maintain': 'Mantener Peso',
      'improve_endurance': 'Mejorar Resistencia'
    };
    return goals[profile.fitness_goal] || 'Objetivo personalizado';
  };

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
      {/* Clean Header */}
      <div className="bg-white px-6 pt-16 pb-8 border-b border-gray-100">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center shadow-md">
                <img
                  src="/src/assets/image.png"
                  alt="LevelUp"
                  className="w-8 h-8"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                <span className="text-white font-bold text-xl hidden">L</span>
              </div>
              <div>
                <h1 className="text-gray-900 text-xl font-semibold">LevelUp</h1>
              </div>
            </div>

            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="text-gray-700 font-medium text-lg">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-gray-900 text-2xl font-light mb-2">
              {getGreeting()}, {profile?.name || 'Usuario'}
            </h2>
            <p className="text-gray-500 text-base font-light">
              {getMotivationalMessage()}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8">
        <div className="max-w-md mx-auto space-y-8">

          {/* Today's Focus */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="text-center mb-6">
              <h3 className="text-gray-900 text-lg font-medium mb-2">Enfoque de Hoy</h3>
              <p className="text-gray-500 text-sm font-light">Tu objetivo principal</p>
            </div>

            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-50 rounded-full mb-4">
                <svg className="w-7 h-7 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h4 className="text-gray-900 text-xl font-light mb-2">{formatGoal()}</h4>
              <p className="text-gray-500 text-sm">3 de 4 entrenamientos completados</p>
            </div>

            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-500 mb-3">
                <span>Progreso semanal</span>
                <span>75%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full transition-all duration-300" style={{ width: '75%' }}></div>
              </div>
            </div>

            <button className="w-full bg-gray-900 text-white font-medium py-4 rounded-xl hover:bg-gray-800 transition-colors duration-200">
              Continuar
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
              <div className="text-gray-900 text-2xl font-light mb-1">
                {profile?.current_weight_kg || 0}
              </div>
              <div className="text-gray-500 text-xs font-medium uppercase tracking-wide">Peso Actual</div>
            </div>

            <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
              <div className="text-gray-900 text-2xl font-light mb-1">
                {profile?.height_cm || 0}
              </div>
              <div className="text-gray-500 text-xs font-medium uppercase tracking-wide">Altura</div>
            </div>

            <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
              <div className="text-gray-900 text-2xl font-light mb-1">7</div>
              <div className="text-gray-500 text-xs font-medium uppercase tracking-wide">Días Activo</div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="space-y-3">
            <div
              onClick={() => navigate('/workouts')}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29l-1.43-1.43z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-gray-900 text-base font-medium">Entrenamientos</h3>
                    <p className="text-gray-500 text-sm">Rutinas personalizadas</p>
                  </div>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>

            <div
              onClick={() => navigate('/nutrition')}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-gray-900 text-base font-medium">Nutrición</h3>
                    <p className="text-gray-500 text-sm">Plan alimenticio diario</p>
                  </div>
                </div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              </div>
            </div>

            <div
              onClick={() => navigate('/progress')}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-gray-900 text-base font-medium">Progreso</h3>
                    <p className="text-gray-500 text-sm">Estadísticas y logros</p>
                  </div>
                </div>
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
            </div>

            <div
              onClick={() => navigate('/profile')}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-gray-900 text-base font-medium">Mi Perfil</h3>
                    <p className="text-gray-500 text-sm">Configuración personal</p>
                  </div>
                </div>
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Weekly Progress */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="text-center mb-6">
              <h3 className="text-gray-900 text-lg font-medium mb-2">Esta Semana</h3>
              <p className="text-gray-500 text-sm font-light">Desafío de 4 entrenamientos</p>
            </div>

            <div className="flex justify-center space-x-4 mb-6">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <div key={day} className="text-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 text-sm font-medium
                      ${day <= 3
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-400'
                      }
                    `}
                  >
                    {day <= 3 ? '✓' : day}
                  </div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'][day - 1]}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <p className="text-gray-500 text-sm">
                <span className="font-medium text-gray-900">3 de 7 días</span> completados
              </p>
            </div>
          </div>

        </div>
      </div>

      <BottomNavbar />
    </div>
  );
};

export default Dashboard;