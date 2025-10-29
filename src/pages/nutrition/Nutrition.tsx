import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { calculateCaloriesFromProfile, getCalorieProgress } from '../../shared/utils/calorieCalculator';
import type { CalorieCalculationResult } from '../../shared/utils/calorieCalculator';
import BottomNavbar from '../../components/shared/BottomNavbar';
import SwipeableLayout from '../../components/Layout/SwipeableLayout';

const Nutrition: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  
  type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner';
  interface MealLog {
    id: string;
    meal_type: MealType;
    food_name: string;
    quantity_grams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    logged_at: string;
  }
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [, setLoading] = useState(false);
  const [macros, setMacros] = useState({calories: 0, protein: 0, carbs: 0, fat: 0});
  const [waterIntake, setWaterIntake] = useState(0); // in mL
  const [waterGoal] = useState(2500); // 2.5L in mL
  const [calorieData, setCalorieData] = useState<CalorieCalculationResult | null>(null);

  // Calculate personalized calories when profile is loaded
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

  const fetchData = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    setLoading(true);
    try {
      // Get current user
      let userId: string | null = null;
      try {
        const userRes = await supabase.auth.getUser();
        userId = userRes?.data?.user?.id || null;
      } catch (e) {
        console.warn('Could not get user', e);
      }

      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      
      // Fetch meals
      let mealsQuery = supabase
        .from('meal_logs')
        .select('*')
        .gte('logged_at', start.toISOString())
        .lte('logged_at', end.toISOString())
        .order('logged_at', { ascending: true });

      // Filter by user if available
      if (userId) {
        mealsQuery = mealsQuery.eq('user_id', userId);
      }

      const { data: mealsData, error: mealsError } = await mealsQuery;
      
      if (mealsError) throw mealsError;
      
      // Deduplicate meals by ID (in case of any data issues)
      const uniqueMeals = mealsData ? Array.from(new Map(mealsData.map(meal => [meal.id, meal])).values()) : [];
      setMeals(uniqueMeals);
      
      // Calcular macros totales
      let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
      (mealsData || []).forEach((row: { calories?: number; protein?: number; carbs?: number; fat?: number }) => {
        totalCalories += row.calories || 0;
        totalProtein += row.protein || 0;
        totalCarbs += row.carbs || 0;
        totalFat += row.fat || 0;
      });
      setMacros({calories: totalCalories, protein: totalProtein, carbs: totalCarbs, fat: totalFat});
      
      // Fetch water intake
      let waterQuery = supabase
        .from('water_logs')
        .select('amount_ml')
        .gte('logged_at', start.toISOString())
        .lte('logged_at', end.toISOString());

      // Filter by user if available
      if (userId) {
        waterQuery = waterQuery.eq('user_id', userId);
      }

      const { data: waterData, error: waterError } = await waterQuery;
      
      if (!waterError && waterData) {
        const totalWater = waterData.reduce((sum, log) => sum + (log.amount_ml || 0), 0);
        setWaterIntake(totalWater);
      }
    } catch (err) {
      console.error('Error fetching data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Agrupar comidas por tipo
  const groupedMeals: Record<MealType, MealLog[]> = {
    breakfast: [],
    lunch: [],
    snack: [],
    dinner: []
  };
  for (const meal of meals) {
    groupedMeals[meal.meal_type].push(meal);
  }

  // Calcular progreso de calorías
  const calorieProgress = calorieData 
    ? getCalorieProgress(macros.calories, calorieData.targetCalories)
    : null;

  // Usar objetivos personalizados o valores por defecto
  const calorieGoal = calorieData?.targetCalories || 2400;
  const proteinGoal = calorieData?.macros.protein_g || 120;
  const carbGoal = calorieData?.macros.carbs_g || 180;
  const fatGoal = calorieData?.macros.fat_g || 65;

  // Formatear litros con 1 decimal
  const formatLiters = (ml: number) => (ml / 1000).toFixed(1);

  return (
    <SwipeableLayout>
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 pb-24">
      {/* Content */}
      <div className="px-6 pt-6">
        <div className="max-w-md mx-auto space-y-6">
          
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🍎 Nutrición</h1>
            <p className="text-gray-600">Gestiona tu alimentación diaria</p>
          </div>

          {/* Daily Summary with Circle */}
          <div className="bg-gradient-to-br from-white to-pink-50 rounded-3xl p-6 shadow-xl border border-pink-100 relative overflow-hidden">
            {/* Decorative bubbles */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-pink-200 to-orange-200 rounded-full opacity-20 blur-2xl"></div>
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-20 blur-2xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Resumen de Hoy</h2>
              
              {/* Calories Progress Circle */}
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-40 h-40">
                  <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="#fee2e2"
                      strokeWidth="10"
                      fill="none"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="url(#gradient)"
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - Math.min(1, macros.calories / calorieGoal))}`}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 0.5s' }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="50%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">{macros.calories}</span>
                    <span className="text-sm text-gray-500">/ {calorieGoal}</span>
                    <span className="text-xs text-gray-400 mt-1">kcal</span>
                  </div>
                </div>
              </div>

              {/* Macros */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center bg-white/50 backdrop-blur-sm rounded-xl p-3">
                  <div className="text-xl font-bold text-orange-500">{macros.protein.toFixed(0)}g</div>
                  <div className="text-xs text-gray-600 mb-2">Proteínas</div>
                  <div className="w-full bg-orange-100 rounded-full h-2">
                    <div className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all" style={{width: `${Math.min(100, macros.protein/proteinGoal*100)}%`}}></div>
                  </div>
                </div>
                <div className="text-center bg-white/50 backdrop-blur-sm rounded-xl p-3">
                  <div className="text-xl font-bold text-green-500">{macros.carbs.toFixed(0)}g</div>
                  <div className="text-xs text-gray-600 mb-2">Carbos</div>
                  <div className="w-full bg-green-100 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all" style={{width: `${Math.min(100, macros.carbs/carbGoal*100)}%`}}></div>
                  </div>
                </div>
                <div className="text-center bg-white/50 backdrop-blur-sm rounded-xl p-3">
                  <div className="text-xl font-bold text-blue-500">{macros.fat.toFixed(0)}g</div>
                  <div className="text-xs text-gray-600 mb-2">Grasas</div>
                  <div className="w-full bg-blue-100 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all" style={{width: `${Math.min(100, macros.fat/fatGoal*100)}%`}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hydration Card - Now Prominent */}
          <div className="bg-gradient-to-br from-white to-cyan-50 rounded-3xl p-6 shadow-xl border border-cyan-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">💧 Hidratación</h3>
                <span className="text-2xl font-bold text-cyan-600">{formatLiters(waterIntake)}L</span>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">Meta diaria</span>
                <span className="text-sm font-semibold text-gray-700">{formatLiters(waterGoal)}L</span>
              </div>
              
              <div className="w-full bg-cyan-100 rounded-full h-3 mb-4">
                <div 
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (waterIntake / waterGoal) * 100)}%` }}
                ></div>
              </div>

              {/* Water Drops */}
              <div className="flex justify-center gap-2">
                {Array.from({length: 8}).map((_, i) => (
                  <button
                    key={i}
                    onClick={async () => {
                      if (!isSupabaseConfigured || !supabase) return;
                      try {
                        const userRes = await supabase.auth.getUser();
                        const userId = userRes?.data?.user?.id;
                        if (!userId) return;
                        
                        await supabase.from('water_logs').insert({
                          user_id: userId,
                          amount_ml: 250,
                          logged_at: new Date().toISOString()
                        });
                        fetchData();
                      } catch (error) {
                        console.error('Error adding water:', error);
                      }
                    }}
                    className={`text-2xl transition-all duration-300 transform hover:scale-110 ${
                      i < Math.floor((waterIntake / waterGoal) * 8) 
                        ? 'opacity-100 drop-shadow-lg' 
                        : 'opacity-30 grayscale'
                    }`}
                  >
                    💧
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Generator Card */}
          <button
            onClick={() => navigate('/diet/generate')}
            className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12 group-hover:scale-150 transition-transform duration-500"></div>
            
            <div className="relative z-10 flex items-center justify-center space-x-3">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-xl font-bold">Generar Plan con IA</span>
            </div>
            <p className="text-white/90 text-sm mt-2 relative z-10">Crea un plan personalizado con inteligencia artificial</p>
          </button>

          {/* Meal Cards - Large and Colorful */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Agregar Comidas</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Breakfast */}
              <button 
                onClick={() => navigate('/food-search', { state: { mealType: 'breakfast' } })}
                className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-20 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-300"></div>
                <div className="relative z-10 text-center">
                  <div className="text-4xl mb-2">🌅</div>
                  <span className="text-lg font-bold">Desayuno</span>
                </div>
              </button>

              {/* Lunch */}
              <button 
                onClick={() => navigate('/food-search', { state: { mealType: 'lunch' } })}
                className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-20 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-300"></div>
                <div className="relative z-10 text-center">
                  <div className="text-4xl mb-2">☀️</div>
                  <span className="text-lg font-bold">Almuerzo</span>
                </div>
              </button>

              {/* Snack */}
              <button 
                onClick={() => navigate('/food-search', { state: { mealType: 'snack' } })}
                className="bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-20 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-300"></div>
                <div className="relative z-10 text-center">
                  <div className="text-4xl mb-2">🍪</div>
                  <span className="text-lg font-bold">Merienda</span>
                </div>
              </button>

              {/* Dinner */}
              <button 
                onClick={() => navigate('/food-search', { state: { mealType: 'dinner' } })}
                className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-20 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-300"></div>
                <div className="relative z-10 text-center">
                  <div className="text-4xl mb-2">🌙</div>
                  <span className="text-lg font-bold">Cena</span>
                </div>
              </button>
            </div>
          </div>

          {/* Foto con IA Card */}
          <button 
            onClick={() => navigate('/food-photo-analyzer', { state: { mealType: 'lunch' } })}
            className="w-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-5 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-300"></div>
            <div className="relative z-10 flex items-center justify-center space-x-3">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-lg font-bold">Analizar Foto con IA</span>
            </div>
          </button>

          {/* Personalized Calorie Info */}
          {calorieData && calorieProgress && (
            <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white opacity-10 rounded-full"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Tu Plan Personalizado</h3>
                  <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-semibold">
                    {calorieProgress.status === 'on_track' && '✅ En Meta'}
                    {calorieProgress.status === 'under' && '⚠️ Por Debajo'}
                    {calorieProgress.status === 'over' && '⚠️ Excedido'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-xs opacity-90 mb-1">Metabolismo Basal</div>
                    <div className="text-3xl font-bold">{calorieData.bmr}</div>
                    <div className="text-xs opacity-75">kcal/día</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-xs opacity-90 mb-1">Factor Actividad</div>
                    <div className="text-3xl font-bold">{calorieData.activityFactor}x</div>
                    <div className="text-xs opacity-75">multiplicador</div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-sm opacity-90 mb-2">{calorieProgress.message}</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{macros.calories}</span>
                    <span className="text-lg opacity-75">/ {calorieData.targetCalories} kcal</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2.5 mt-3">
                    <div 
                      className="bg-white h-2.5 rounded-full transition-all duration-500" 
                      style={{width: `${Math.min(100, calorieProgress.percentage)}%`}}
                    ></div>
                  </div>
                  <div className="text-xs opacity-75 mt-2 text-right">{calorieProgress.percentage}%</div>
                </div>

                {calorieData.adjustment !== 0 && (
                  <div className="mt-4 text-xs opacity-90 text-center bg-white/10 rounded-lg p-2">
                    {calorieData.adjustment > 0 ? '📈' : '📉'} 
                    {' '}Ajuste: {calorieData.adjustment > 0 ? '+' : ''}{calorieData.adjustment} kcal
                    {' '}(según tu objetivo de fitness)
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Comidas Registradas Hoy */}
          <div className="bg-gradient-to-br from-white to-orange-50 rounded-3xl p-6 shadow-xl border border-orange-100 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full opacity-30 blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">📋 Comidas Registradas</h3>
                <div className="text-sm text-gray-500 font-medium">
                  {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                </div>
              </div>

              {/* Meal Details by Type */}
              <div className="space-y-5">
                {(Object.keys(groupedMeals) as MealType[]).map((type) => {
                  const mealConfig = {
                    breakfast: { name: '🌅 Desayuno', color: 'orange' },
                    lunch: { name: '☀️ Almuerzo', color: 'green' },
                    snack: { name: '🍪 Merienda', color: 'pink' },
                    dinner: { name: '🌙 Cena', color: 'purple' }
                  };
                  
                  const config = mealConfig[type];
                  const borderColor = `border-${config.color}-400`;
                  
                  return (
                    <div key={type} className={`border-l-4 ${borderColor} pl-4`}>
                      <h4 className="font-bold text-gray-800 mb-3 text-base">{config.name}</h4>
                      {groupedMeals[type].length === 0 ? (
                        <div className="text-sm text-gray-400 italic bg-gray-50 rounded-lg p-3">
                          Sin registros
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {groupedMeals[type].map((meal: MealLog) => (
                            <div key={meal.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900">{meal.food_name}</div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {meal.quantity_grams}g • {meal.protein}g P • {meal.carbs}g C • {meal.fat}g F
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <div className="font-bold text-gray-900 text-lg">{meal.calories}</div>
                                <div className="text-xs text-gray-500">kcal</div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {new Date(meal.logged_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>

      <BottomNavbar />
    </div>
    </SwipeableLayout>
  );
};

export default Nutrition;