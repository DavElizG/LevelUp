import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { calculateCaloriesFromProfile, getCalorieProgress } from '../shared/utils/calorieCalculator';
import type { CalorieCalculationResult } from '../shared/utils/calorieCalculator';
import BottomNavbar from '../components/shared/BottomNavbar';

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
      (mealsData || []).forEach((row: any) => {
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
    <div className="min-h-screen bg-gray-50 pb-24">
     
      {/* Content */}
      <div className="p-6">
        {/* Daily Summary */}
        <div className="bg-white rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen Diario</h2>
          
          {/* Calories Progress Circle */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#ec4899"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - Math.min(1, macros.calories / calorieGoal))}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.5s' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{macros.calories}</span>
                <span className="text-sm text-gray-500">/ {calorieGoal} kcal</span>
              </div>
            </div>
          </div>

          {/* Macros */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-orange-500">{macros.protein.toFixed(1)}g</div>
              <div className="text-sm text-gray-600">Proteínas</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-orange-500 h-2 rounded-full" style={{width: `${Math.min(100, macros.protein/proteinGoal*100)}%`}}></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-500">{macros.carbs.toFixed(1)}g</div>
              <div className="text-sm text-gray-600">Carbohidratos</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-green-500 h-2 rounded-full" style={{width: `${Math.min(100, macros.carbs/carbGoal*100)}%`}}></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-500">{macros.fat.toFixed(1)}g</div>
              <div className="text-sm text-gray-600">Grasas</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-blue-500 h-2 rounded-full" style={{width: `${Math.min(100, macros.fat/fatGoal*100)}%`}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button 
            onClick={() => navigate('/food-search', { state: { mealType: 'lunch' } })}
            className="bg-pink-500 rounded-2xl p-4 text-white"
          >
            <div className="flex items-center justify-center mb-2">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </div>
            <span className="text-sm font-medium">Agregar Comida</span>
          </button>
          
          <button 
            onClick={() => navigate('/food-photo-analyzer', { state: { mealType: 'lunch' } })}
            className="bg-purple-600 rounded-2xl p-4 text-white"
          >
            <div className="flex items-center justify-center mb-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium">Foto con IA</span>
          </button>
        </div>

        {/* Personalized Calorie Info */}
        {calorieData && calorieProgress && (
          <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl p-6 mb-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Tu Plan Personalizado</h3>
              <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                {calorieProgress.status === 'on_track' && '✅ En Meta'}
                {calorieProgress.status === 'under' && '⚠️ Por Debajo'}
                {calorieProgress.status === 'over' && '⚠️ Excedido'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/10 rounded-xl p-3">
                <div className="text-xs opacity-90 mb-1">Metabolismo Basal</div>
                <div className="text-2xl font-bold">{calorieData.bmr}</div>
                <div className="text-xs opacity-75">kcal/día</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <div className="text-xs opacity-90 mb-1">Factor Actividad</div>
                <div className="text-2xl font-bold">{calorieData.activityFactor}x</div>
                <div className="text-xs opacity-75">multiplicador</div>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-sm opacity-90 mb-2">{calorieProgress.message}</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{macros.calories}</span>
                <span className="text-lg opacity-75">/ {calorieData.targetCalories} kcal</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 mt-3">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-500" 
                  style={{width: `${Math.min(100, calorieProgress.percentage)}%`}}
                ></div>
              </div>
              <div className="text-xs opacity-75 mt-2 text-right">{calorieProgress.percentage}%</div>
            </div>

            {calorieData.adjustment !== 0 && (
              <div className="mt-4 text-xs opacity-90 text-center">
                {calorieData.adjustment > 0 ? '📈' : '📉'} 
                {' '}Ajuste: {calorieData.adjustment > 0 ? '+' : ''}{calorieData.adjustment} kcal
                {' '}(según tu objetivo de fitness)
              </div>
            )}
          </div>
        )}

        {/* Comidas de Hoy - Detailed View */}
        <div className="bg-white rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Comidas de Hoy</h3>
            <div className="text-sm text-gray-500">{new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</div>
          </div>
          
          {/* Add Meal Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => navigate('/food-search', { state: { mealType: 'breakfast' } })}
              className="bg-pink-500 rounded-xl p-3 text-white text-sm font-medium"
            >
              + Agregar Desayuno
            </button>
            <button
              onClick={() => navigate('/food-search', { state: { mealType: 'lunch' } })}
              className="bg-green-500 rounded-xl p-3 text-white text-sm font-medium"
            >
              + Agregar Almuerzo
            </button>
            <button
              onClick={() => navigate('/food-search', { state: { mealType: 'snack' } })}
              className="bg-blue-500 rounded-xl p-3 text-white text-sm font-medium"
            >
              + Agregar Merienda
            </button>
            <button
              onClick={() => navigate('/food-search', { state: { mealType: 'dinner' } })}
              className="bg-gray-500 rounded-xl p-3 text-white text-sm font-medium"
            >
              + Agregar Cena
            </button>
          </div>

          {/* Meal Details by Type */}
          <div className="space-y-4">
            {(Object.keys(groupedMeals) as MealType[]).map((type) => {
              const mealTypeName = type === 'breakfast' ? 'Desayuno' : type === 'lunch' ? 'Almuerzo' : type === 'snack' ? 'Merienda' : 'Cena';
              
              return (
                <div key={type} className="border-l-4 border-orange-400 pl-4">
                  <h4 className="font-semibold text-gray-800 mb-2 capitalize">{mealTypeName}</h4>
                  {groupedMeals[type].length === 0 ? (
                    <div className="text-sm text-gray-400 italic">Sin registros</div>
                  ) : (
                    <div className="space-y-2">
                      {groupedMeals[type].map((meal: MealLog) => (
                        <div key={meal.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{meal.food_name}</div>
                            <div className="text-sm text-gray-500">
                              {meal.quantity_grams}g • {meal.protein}g P • {meal.carbs}g C • {meal.fat}g F
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">{meal.calories} kcal</div>
                            <div className="text-xs text-gray-400">
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

        {/* Water Intake */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hidratación</h3>
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">Objetivo diario: {formatLiters(waterGoal)}L</span>
            <span className="font-semibold text-blue-500">{formatLiters(waterIntake)}L / {formatLiters(waterGoal)}L</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div className="bg-blue-500 h-3 rounded-full" style={{width: `${Math.min(100, (waterIntake / waterGoal) * 100)}%`}}></div>
          </div>
          
          <div className="grid grid-cols-8 gap-2">
            {[...Array(8)].map((_, index) => {
              const glassAmount = 250; // 250ml por vaso
              const glassesConsumed = Math.floor(waterIntake / glassAmount);
              const isFilled = index < glassesConsumed;
              
              return (
                <button
                  key={index}
                  onClick={async () => {
                    if (!isSupabaseConfigured || !supabase) {
                      alert('Supabase no está configurado');
                      return;
                    }
                    
                    try {
                      let userId: string | null = null;
                      try {
                        const userRes = await supabase.auth.getUser();
                        userId = userRes?.data?.user?.id || null;
                      } catch (e) {
                        console.warn('Could not get user', e);
                      }
                      
                      if (isFilled) {
                        // Remove last glass
                        const { data: lastLog } = await supabase
                          .from('water_logs')
                          .select('*')
                          .order('logged_at', { ascending: false })
                          .limit(1)
                          .single();
                        
                        if (lastLog) {
                          await supabase.from('water_logs').delete().eq('id', lastLog.id);
                        }
                      } else {
                        // Add glass
                        await supabase.from('water_logs').insert({
                          user_id: userId,
                          amount_ml: glassAmount,
                          logged_at: new Date().toISOString(),
                        });
                      }
                      
                      // Refresh data
                      fetchData();
                    } catch (err) {
                      console.error('Error updating water intake', err);
                      alert('Error al actualizar el agua');
                    }
                  }}
                  className={`h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isFilled ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  <svg className={`w-4 h-4 ${isFilled ? 'text-white' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                  </svg>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <BottomNavbar />

      {/* Modals eliminados, todo es por página ahora */}
    </div>
  );
};

export default Nutrition;