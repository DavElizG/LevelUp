import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { calculateCaloriesFromProfile, getCalorieProgress } from '../../shared/utils/calorieCalculator';
import type { CalorieCalculationResult } from '../../shared/utils/calorieCalculator';
import BottomNavbar from '../../components/shared/BottomNavbar';
import SwipeableLayout from '../../components/Layout/SwipeableLayout';
import { cn, themeText } from '../../shared/utils/themeUtils';

const Nutrition: React.FC = () => {
  const { t } = useTranslation();
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
  
  // Estado para el plan de dieta del usuario
  interface MealPlanConfig {
    mealType: MealType;
    orderInDay: number;
  }
  const [userMealPlan, setUserMealPlan] = useState<MealPlanConfig[]>([]);

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

  // Cargar configuración de comidas del plan activo del usuario
  const loadUserMealPlan = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    
    try {
      const userRes = await supabase.auth.getUser();
      const userId = userRes?.data?.user?.id;
      if (!userId) return;

      // Obtener el plan activo del usuario
      const { data: activePlan, error: planError } = await supabase
        .from('diet_plans')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (planError || !activePlan) {
        // Si no hay plan, usar orden por defecto
        setUserMealPlan([
          { mealType: 'breakfast', orderInDay: 1 },
          { mealType: 'lunch', orderInDay: 2 },
          { mealType: 'snack', orderInDay: 3 },
          { mealType: 'dinner', orderInDay: 4 }
        ]);
        return;
      }

      // Obtener las comidas únicas del plan con su orden
      const { data: planMeals, error: mealsError } = await supabase
        .from('diet_meals')
        .select('meal_type, order_in_day')
        .eq('diet_plan_id', activePlan.id)
        .eq('day_of_week', 1); // Solo tomamos un día de referencia para obtener el orden

      if (mealsError || !planMeals || planMeals.length === 0) {
        // Si no hay comidas, usar orden por defecto
        setUserMealPlan([
          { mealType: 'breakfast', orderInDay: 1 },
          { mealType: 'lunch', orderInDay: 2 },
          { mealType: 'snack', orderInDay: 3 },
          { mealType: 'dinner', orderInDay: 4 }
        ]);
        return;
      }

      // Crear un mapa único de meal_type -> order_in_day
      const uniqueMeals = new Map<string, number>();
      planMeals.forEach((meal) => {
        if (!uniqueMeals.has(meal.meal_type)) {
          uniqueMeals.set(meal.meal_type, meal.order_in_day);
        }
      });

      // Convertir a array y ordenar por order_in_day
      const mealConfig: MealPlanConfig[] = Array.from(uniqueMeals.entries())
        .map(([mealType, orderInDay]) => ({
          mealType: mealType as MealType,
          orderInDay
        }))
        .sort((a, b) => a.orderInDay - b.orderInDay);

      setUserMealPlan(mealConfig);
    } catch (err) {
      console.error('Error loading user meal plan:', err);
      // En caso de error, usar orden por defecto
      setUserMealPlan([
        { mealType: 'breakfast', orderInDay: 1 },
        { mealType: 'lunch', orderInDay: 2 },
        { mealType: 'snack', orderInDay: 3 },
        { mealType: 'dinner', orderInDay: 4 }
      ]);
    }
  };

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
    loadUserMealPlan();
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className={cn(
      "min-h-screen pb-24",
      "bg-gradient-to-br from-green-50 via-white to-blue-50",
      "dark:from-gray-900 dark:via-gray-900 dark:to-gray-800",
      "high-contrast:from-black high-contrast:via-black high-contrast:to-black"
    )}>
      {/* Content */}
      <div className="px-6 pt-6">
        <div className="max-w-md mx-auto space-y-6">
          
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className={cn("text-3xl font-bold mb-2", themeText.primary)}>🍎 {t('nutrition.title')}</h1>
            <p className={cn("text-gray-600", themeText.muted)}>{t('nutrition.manageDaily')}</p>
          </div>

          {/* Daily Summary with Circle */}
          <div className={cn(
            "rounded-3xl p-6 shadow-xl border relative overflow-hidden",
            "bg-gradient-to-br from-white to-pink-50 border-pink-100",
            "dark:from-gray-800 dark:to-gray-800/50 dark:border-pink-900/30",
            "high-contrast:from-black high-contrast:to-black high-contrast:border-pink-600 high-contrast:border-2"
          )}>
            {/* Decorative bubbles */}
            <div className={cn(
              "absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-20 blur-2xl",
              "bg-gradient-to-br from-pink-200 to-orange-200",
              "dark:from-pink-800 dark:to-orange-800",
              "high-contrast:from-pink-500 high-contrast:to-orange-500"
            )}></div>
            <div className={cn(
              "absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-20 blur-2xl",
              "bg-gradient-to-br from-purple-200 to-pink-200",
              "dark:from-purple-800 dark:to-pink-800",
              "high-contrast:from-purple-500 high-contrast:to-pink-500"
            )}></div>
            
            <div className="relative z-10">
              <h2 className={cn("text-xl font-bold mb-6 text-center", themeText.primary)}>{t('nutrition.todaySummary')}</h2>
              
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
                      className="dark:stroke-gray-700 high-contrast:stroke-gray-800"
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
                    <span className={cn("text-3xl font-bold", themeText.primary)}>{macros.calories}</span>
                    <span className={cn("text-sm", themeText.muted)}>/ {calorieGoal}</span>
                    <span className={cn("text-xs mt-1", themeText.muted)}>{t('nutrition.kcal')}</span>
                  </div>
                </div>
              </div>

              {/* Macros */}
              <div className="grid grid-cols-3 gap-4">
                <div className={cn(
                  "text-center rounded-xl p-3",
                  "bg-white/50 backdrop-blur-sm",
                  "dark:bg-gray-900/50 dark:backdrop-blur-sm",
                  "high-contrast:bg-black/50 high-contrast:border high-contrast:border-orange-600"
                )}>
                  <div className="text-xl font-bold text-orange-500">{macros.protein.toFixed(0)}g</div>
                  <div className={cn("text-xs mb-2", themeText.muted)}>{t('nutrition.proteins')}</div>
                  <div className={cn(
                    "w-full rounded-full h-2",
                    "bg-orange-100 dark:bg-gray-800 high-contrast:bg-gray-900"
                  )}>
                    <div className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all" style={{width: `${Math.min(100, macros.protein/proteinGoal*100)}%`}}></div>
                  </div>
                </div>
                <div className={cn(
                  "text-center rounded-xl p-3",
                  "bg-white/50 backdrop-blur-sm",
                  "dark:bg-gray-900/50 dark:backdrop-blur-sm",
                  "high-contrast:bg-black/50 high-contrast:border high-contrast:border-green-600"
                )}>
                  <div className="text-xl font-bold text-green-500">{macros.carbs.toFixed(0)}g</div>
                  <div className={cn("text-xs mb-2", themeText.muted)}>{t('nutrition.carbos')}</div>
                  <div className={cn(
                    "w-full rounded-full h-2",
                    "bg-green-100 dark:bg-gray-800 high-contrast:bg-gray-900"
                  )}>
                    <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all" style={{width: `${Math.min(100, macros.carbs/carbGoal*100)}%`}}></div>
                  </div>
                </div>
                <div className={cn(
                  "text-center rounded-xl p-3",
                  "bg-white/50 backdrop-blur-sm",
                  "dark:bg-gray-900/50 dark:backdrop-blur-sm",
                  "high-contrast:bg-black/50 high-contrast:border high-contrast:border-blue-600"
                )}>
                  <div className="text-xl font-bold text-blue-500">{macros.fat.toFixed(0)}g</div>
                  <div className={cn("text-xs mb-2", themeText.muted)}>{t('nutrition.fats')}</div>
                  <div className={cn(
                    "w-full rounded-full h-2",
                    "bg-blue-100 dark:bg-gray-800 high-contrast:bg-gray-900"
                  )}>
                    <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all" style={{width: `${Math.min(100, macros.fat/fatGoal*100)}%`}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hydration Card - Now Prominent */}
          <div className={cn(
            "rounded-3xl p-6 shadow-xl border relative overflow-hidden",
            "bg-gradient-to-br from-white to-cyan-50 border-cyan-100",
            "dark:from-gray-800 dark:to-gray-800/50 dark:border-cyan-900/30",
            "high-contrast:from-black high-contrast:to-black high-contrast:border-cyan-600 high-contrast:border-2"
          )}>
            <div className={cn(
              "absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 opacity-50",
              "bg-gradient-to-br from-cyan-100 to-blue-100",
              "dark:from-cyan-900 dark:to-blue-900",
              "high-contrast:from-cyan-700 high-contrast:to-blue-700"
            )}></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className={cn("text-xl font-bold", themeText.primary)}>💧 {t('nutrition.hydration')}</h3>
                <span className="text-2xl font-bold text-cyan-600">{formatLiters(waterIntake)}L</span>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <span className={cn("text-sm", themeText.muted)}>{t('nutrition.dailyGoal')}</span>
                <span className={cn("text-sm font-semibold", themeText.secondary)}>{ formatLiters(waterGoal)}L</span>
              </div>
              
              <div className={cn(
                "w-full rounded-full h-3 mb-4",
                "bg-cyan-100 dark:bg-gray-800 high-contrast:bg-gray-900"
              )}>
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

          {/* AI Diet Plan Buttons */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* View Diet Plan Button */}
              <button
                onClick={() => navigate('/diet/plan')}
                className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12 group-hover:scale-150 transition-transform duration-500"></div>
                
                <div className="relative z-10 flex items-center justify-center space-x-3">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="text-xl font-bold">{t('nutrition.viewMyPlan')}</span>
                </div>
                <p className="text-white/90 text-sm mt-2 relative z-10">{t('nutrition.reviewWeeklyPlan')}</p>
              </button>

              {/* AI Generator Button */}
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
                  <span className="text-xl font-bold">{t('nutrition.generatePlan')}</span>
                </div>
                <p className="text-white/90 text-sm mt-2 relative z-10">{t('nutrition.createPersonalizedPlan')}</p>
              </button>
            </div>

            {/* Diet History Button */}
            <button
              onClick={() => navigate('/diet/history')}
              className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-3xl p-5 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
              
              <div className="relative z-10 flex items-center justify-center space-x-3">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-lg font-bold">Ver Historial de Planes</span>
              </div>
            </button>
          </div>

          {/* Meal Cards - Large and Colorful - Orden Dinámico según Plan */}
          <div className="space-y-4">
            <h3 className={cn("text-xl font-bold", themeText.primary)}>{t('nutrition.addMeals')}</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {userMealPlan.map((mealConfig) => {
                const mealStyles = {
                  breakfast: {
                    gradient: 'from-orange-400 to-orange-600',
                    icon: '🌅',
                    label: t('nutrition.breakfast')
                  },
                  lunch: {
                    gradient: 'from-green-400 to-green-600',
                    icon: '☀️',
                    label: t('nutrition.lunch')
                  },
                  snack: {
                    gradient: 'from-pink-400 to-pink-600',
                    icon: '🍪',
                    label: t('nutrition.snack')
                  },
                  dinner: {
                    gradient: 'from-purple-400 to-purple-600',
                    icon: '🌙',
                    label: t('nutrition.dinner')
                  }
                };

                const style = mealStyles[mealConfig.mealType];

                return (
                  <button
                    key={mealConfig.mealType}
                    onClick={() => navigate('/food-search', { state: { mealType: mealConfig.mealType } })}
                    className={`bg-gradient-to-br ${style.gradient} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden group`}
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-20 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-300"></div>
                    <div className="relative z-10 text-center">
                      <div className="text-4xl mb-2">{style.icon}</div>
                      <span className="text-lg font-bold">{style.label}</span>
                      {userMealPlan.length < 4 && (
                        <div className="text-xs opacity-80 mt-1">#{mealConfig.orderInDay}</div>
                      )}
                    </div>
                  </button>
                );
              })}
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
              <span className="text-lg font-bold">{t('nutrition.analyzeWithAI')}</span>
            </div>
          </button>

          {/* Personalized Calorie Info */}
          {calorieData && calorieProgress && (
            <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white opacity-10 rounded-full"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">{t('nutrition.personalizedPlan')}</h3>
                  <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-semibold">
                    {calorieProgress.status === 'on_track' && '✅ ' + t('common.success')}
                    {calorieProgress.status === 'under' && '⚠️ ' + t('nutrition.underDevelopment')}
                    {calorieProgress.status === 'over' && '⚠️ ' + t('common.error')}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-xs opacity-90 mb-1">{t('nutrition.basalMetabolism')}</div>
                    <div className="text-3xl font-bold">{calorieData.bmr}</div>
                    <div className="text-xs opacity-75">{t('nutrition.kcal')}/día</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-xs opacity-90 mb-1">{t('nutrition.activityFactor')}</div>
                    <div className="text-3xl font-bold">{calorieData.activityFactor}x</div>
                    <div className="text-xs opacity-75">{t('nutrition.multiplier')}</div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-sm opacity-90 mb-2">{calorieProgress.message}</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{macros.calories}</span>
                    <span className="text-lg opacity-75">/ {calorieData.targetCalories} {t('nutrition.kcal')}</span>
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
          <div className={cn(
            "rounded-3xl p-6 shadow-xl border relative overflow-hidden",
            "bg-gradient-to-br from-white to-orange-50 border-orange-100",
            "dark:from-gray-800 dark:to-gray-800/50 dark:border-orange-900/30",
            "high-contrast:from-black high-contrast:to-black high-contrast:border-orange-600 high-contrast:border-2"
          )}>
            <div className={cn(
              "absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-30 blur-2xl",
              "bg-gradient-to-br from-orange-100 to-yellow-100",
              "dark:from-orange-900 dark:to-yellow-900",
              "high-contrast:from-orange-700 high-contrast:to-yellow-700"
            )}></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className={cn("text-xl font-bold", themeText.primary)}>📋 Comidas Registradas</h3>
                <div className={cn("text-sm font-medium", themeText.muted)}>
                  {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                </div>
              </div>

              {/* Meal Details by Type - Orden Dinámico */}
              <div className="space-y-5">
                {userMealPlan.map(({ mealType: type }) => {
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
                      <h4 className={cn("font-bold text-base mb-3", themeText.secondary)}>{config.name}</h4>
                      {groupedMeals[type].length === 0 ? (
                        <div className={cn(
                          "text-sm italic rounded-lg p-3",
                          "text-gray-400 bg-gray-50",
                          "dark:text-gray-500 dark:bg-gray-900/50",
                          "high-contrast:text-gray-400 high-contrast:bg-black high-contrast:border high-contrast:border-gray-700"
                        )}>
                          Sin registros
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {groupedMeals[type].map((meal: MealLog) => (
                            <div key={meal.id} className={cn(
                              "flex items-center justify-between p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow",
                              "border-gray-200 bg-white/80 backdrop-blur-sm",
                              "dark:border-gray-700 dark:bg-gray-900/50",
                              "high-contrast:border-white/30 high-contrast:bg-black/50 high-contrast:border-2"
                            )}>
                              <div className="flex-1">
                                <div className={cn("font-semibold", themeText.primary)}>{meal.food_name}</div>
                                <div className={cn("text-sm mt-1", themeText.muted)}>
                                  {meal.quantity_grams}g • {meal.protein}g P • {meal.carbs}g C • {meal.fat}g F
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <div className={cn("font-bold text-lg", themeText.primary)}>{meal.calories}</div>
                                <div className={cn("text-xs", themeText.muted)}>kcal</div>
                                <div className={cn("text-xs mt-1", themeText.muted)}>
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