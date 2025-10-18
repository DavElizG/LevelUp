import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSetup } from '../hooks/useSetup';
import { useProfile } from '../hooks/useProfile';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { calculateCaloriesFromProfile } from '../shared/utils/calorieCalculator';
import type { CalorieCalculationResult } from '../shared/utils/calorieCalculator';
import BottomNavbar from '../components/shared/BottomNavbar';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { loadExistingProfile } = useSetup();
  const { profile } = useProfile(user?.id);
  const navigate = useNavigate();
  const [profileExists, setProfileExists] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [calorieData, setCalorieData] = useState<CalorieCalculationResult | null>(null);
  const [todayStats, setTodayStats] = useState({ calories: 0, workouts: 0, water: 0 });
  const [weekProgress, setWeekProgress] = useState<boolean[]>([false, false, false, false, false, false, false]);

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

  // Calculate personalized calories
  useEffect(() => {
    if (profile) {
      try {
        const result = calculateCaloriesFromProfile(profile);
        setCalorieData(result);
      } catch (err) {
        console.error('Error calculating calories:', err);
      }
    }
  }, [profile]);

  // Fetch today's stats
  useEffect(() => {
    const fetchTodayStats = async () => {
      if (!user || !isSupabaseConfigured || !supabase) return;

      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get today's calories
        const { data: meals } = await supabase
          .from('meal_logs')
          .select('calories')
          .eq('user_id', user.id)
          .gte('logged_at', today.toISOString())
          .lt('logged_at', tomorrow.toISOString());

        const totalCalories = meals?.reduce((sum, meal) => sum + (meal.calories || 0), 0) || 0;

        // Get today's water intake
        const { data: water } = await supabase
          .from('water_logs')
          .select('amount_ml')
          .eq('user_id', user.id)
          .gte('logged_at', today.toISOString())
          .lt('logged_at', tomorrow.toISOString());

        const totalWater = water?.reduce((sum, log) => sum + (log.amount_ml || 0), 0) || 0;

        setTodayStats({
          calories: totalCalories,
          workouts: 0, // TODO: Get from workouts table
          water: totalWater
        });

        // Get week progress (mock for now)
        // TODO: Fetch real workout data from database
        const dayOfWeek = new Date().getDay();
        const progress = Array(7).fill(false);
        for (let i = 0; i < Math.min(dayOfWeek, 3); i++) {
          progress[i] = true;
        }
        setWeekProgress(progress);
      } catch (err) {
        console.error('Error fetching today stats:', err);
      }
    };

    fetchTodayStats();
  }, [user]);

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
    const goals: Record<string, string> = {
      'lose_weight': 'Perder Peso',
      'gain_weight': 'Ganar Peso',
      'gain_muscle': 'Ganar Músculo',
      'maintain': 'Mantener Peso',
      'improve_endurance': 'Mejorar Resistencia'
    };
    return goals[profile.fitness_goal] || 'Objetivo personalizado';
  };

  const getGoalIcon = () => {
    if (!profile?.fitness_goal) return '🎯';
    const icons: Record<string, string> = {
      'lose_weight': '📉',
      'gain_weight': '📈',
      'gain_muscle': '💪',
      'maintain': '⚖️',
      'improve_endurance': '🏃'
    };
    return icons[profile.fitness_goal] || '🎯';
  };

  const completedDays = weekProgress.filter(Boolean).length;
  const weekProgressPercentage = Math.round((completedDays / 7) * 100);
  const calorieProgress = calorieData && todayStats.calories > 0 
    ? Math.min(100, Math.round((todayStats.calories / calorieData.targetCalories) * 100))
    : 0;

  // Show loading while checking profile
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-orange-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Verificando perfil...</p>
        </div>
      </div>
    );
  }

  // Redirect to setup if profile doesn't exist
  if (profileExists === false) {
    return <Navigate to="/setup" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 pb-24">
      {/* Animated Header with Gradient */}
      <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 px-6 pt-12 pb-8 relative overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
        
        <div className="max-w-md mx-auto relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
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
                <h1 className="text-white text-xl font-bold drop-shadow-lg">LevelUp</h1>
              </div>
            </div>

            <button 
              onClick={() => navigate('/profile')}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all duration-200"
            >
              <span className="text-white font-semibold text-lg">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </button>
          </div>

          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-2 drop-shadow-lg">
              {getGreeting()}, {profile?.name || 'Usuario'} 👋
            </h2>
            <p className="text-white/90 text-base font-medium drop-shadow">
              {getMotivationalMessage()}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 -mt-6 relative z-20">
        <div className="max-w-md mx-auto space-y-6">

          {/* Today's Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            {/* Calories Card */}
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-orange-100 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="relative z-10">
                <div className="text-orange-500 text-sm font-semibold mb-1">🔥 Calorías</div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{todayStats.calories}</div>
                {calorieData && (
                  <>
                    <div className="text-xs text-gray-500">de {calorieData.targetCalories}</div>
                    <div className="w-full bg-orange-100 rounded-full h-1.5 mt-2">
                      <div 
                        className="bg-gradient-to-r from-orange-400 to-orange-600 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${calorieProgress}%` }}
                      ></div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Workouts Card */}
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-blue-100 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="relative z-10">
                <div className="text-blue-500 text-sm font-semibold mb-1">💪 Entrenos</div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{completedDays}</div>
                <div className="text-xs text-gray-500">de 7 días</div>
                <div className="w-full bg-blue-100 rounded-full h-1.5 mt-2">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${weekProgressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Water Card */}
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-cyan-100 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-cyan-100 to-cyan-50 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="relative z-10">
                <div className="text-cyan-500 text-sm font-semibold mb-1">💧 Agua</div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{(todayStats.water / 1000).toFixed(1)}</div>
                <div className="text-xs text-gray-500">de 2.5 L</div>
                <div className="w-full bg-cyan-100 rounded-full h-1.5 mt-2">
                  <div 
                    className="bg-gradient-to-r from-cyan-400 to-cyan-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (todayStats.water / 2500) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Goal Card with Animation */}
          <div className="bg-gradient-to-br from-white to-orange-50 rounded-3xl p-6 shadow-xl border border-orange-100 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-orange-200 to-pink-200 rounded-full opacity-20 blur-2xl"></div>
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-20 blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-gray-900 text-lg font-bold mb-1">Tu Objetivo Actual</h3>
                  <p className="text-gray-500 text-sm">Enfócate en lo que importa</p>
                </div>
                <div className="text-4xl animate-pulse">{getGoalIcon()}</div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 mb-4 border border-orange-100">
                <h4 className="text-gray-900 text-2xl font-bold mb-2">{formatGoal()}</h4>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progreso semanal</span>
                  <span className="font-bold text-orange-600">{weekProgressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 mt-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 h-3 rounded-full transition-all duration-700 relative"
                    style={{ width: `${weekProgressPercentage}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate('/workouts')}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold py-4 rounded-xl hover:from-orange-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Empezar Entrenamiento 🚀
              </button>
            </div>
          </div>

          {/* Navigation Menu with Enhanced Design */}
          <div className="space-y-3">
            <div
              onClick={() => navigate('/workouts')}
              className="bg-white rounded-2xl p-5 shadow-lg border border-blue-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29l-1.43-1.43z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-gray-900 text-base font-bold mb-1">Entrenamientos</h3>
                    <p className="text-gray-500 text-sm">Rutinas personalizadas</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            <div
              onClick={() => navigate('/nutrition')}
              className="bg-white rounded-2xl p-5 shadow-lg border border-green-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-50 to-green-100 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-gray-900 text-base font-bold mb-1">Nutrición</h3>
                    <p className="text-gray-500 text-sm">Plan alimenticio diario</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            <div
              onClick={() => navigate('/progress')}
              className="bg-white rounded-2xl p-5 shadow-lg border border-purple-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-50 to-purple-100 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-gray-900 text-base font-bold mb-1">Progreso</h3>
                    <p className="text-gray-500 text-sm">Estadísticas y logros</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Progress with Enhanced Design */}
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl p-6 shadow-xl border border-blue-100 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-6">
                <h3 className="text-gray-900 text-lg font-bold mb-1">Esta Semana</h3>
                <p className="text-gray-500 text-sm">Desafío de 7 días</p>
              </div>

              <div className="flex justify-center space-x-3 mb-6">
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => {
                  const isCompleted = weekProgress[index];
                  return (
                    <div key={index} className="text-center">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-2 text-sm font-bold transition-all duration-300 transform
                          ${isCompleted
                            ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg scale-110'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }
                        `}
                      >
                        {isCompleted ? '✓' : day}
                      </div>
                      <div className={`text-xs font-medium ${isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                        {day}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-blue-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-600 text-sm font-medium">Progreso</span>
                  <span className="text-gray-900 font-bold">{completedDays} de 7 días</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-700 relative"
                    style={{ width: `${weekProgressPercentage}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Motivational Quote Card */}
          <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
            
            <div className="relative z-10 text-center text-white">
              <div className="text-4xl mb-3">💪</div>
              <p className="text-lg font-bold mb-2 drop-shadow-lg">
                "El único mal entrenamiento es el que no hiciste"
              </p>
              <p className="text-white/80 text-sm">
                Cada día es una nueva oportunidad
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