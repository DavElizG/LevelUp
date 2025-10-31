import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Calendar, Utensils, Target, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import BottomNavbar from '../../components/shared/BottomNavbar';

interface DietPlan {
  id: string;
  user_id: string;
  name: string;
  description: string;
  goal: string;
  target_calories: number;
  target_protein_g?: number;
  target_carbs_g?: number;
  target_fat_g?: number;
  created_at: string;
  updated_at: string;
}

interface DietMeal {
  id: string;
  diet_plan_id: string;
  meal_type: string;
  day_of_week: number;
  name: string;
  description: string | null;
  preparation_time_minutes: number | null;
  recipe_instructions: string | null;
  order_in_day: number;
  created_at: string;
}

const DietPlanView: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [meals, setMeals] = useState<DietMeal[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Iniciar en Lunes para poder navegar todos los días
  const [selectedDay, setSelectedDay] = useState(1);
  const [expandedMeals, setExpandedMeals] = useState<Record<string, boolean>>({});

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  useEffect(() => {
    loadDietPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadDietPlan = async () => {
    if (!user || !supabase) return;

    try {
      setLoading(true);
      
      // Cargar el plan de dieta
      const { data: planData, error: planError } = await supabase
        .from('diet_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (planError) throw planError;
      
      if (!planData) {
        setDietPlan(null);
        setMeals([]);
        return;
      }

      setDietPlan(planData);

      // Cargar las comidas del plan
      const { data: mealsData, error: mealsError } = await supabase
        .from('diet_meals')
        .select('*')
        .eq('diet_plan_id', planData.id)
        .order('day_of_week', { ascending: true })
        .order('order_in_day', { ascending: true });

      if (mealsError) throw mealsError;
      setMeals(mealsData || []);
    } catch (error) {
      console.error('Error loading diet plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMeal = (mealKey: string) => {
    setExpandedMeals(prev => ({
      ...prev,
      [mealKey]: !prev[mealKey]
    }));
  };

  const getDayMeals = (day: number): DietMeal[] => {
    return meals.filter(meal => meal.day_of_week === day);
  };

  const getMealTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      breakfast: 'Desayuno',
      lunch: 'Almuerzo',
      dinner: 'Cena',
      snack: 'Merienda'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 dark:from-gray-900 dark:via-green-900/10 dark:to-emerald-900/10 pb-24">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!dietPlan) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 dark:from-gray-900 dark:via-green-900/10 dark:to-emerald-900/10 pb-24">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center py-12">
            <Utensils className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">No tienes un plan de dieta</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Genera uno con IA para comenzar</p>
            <button
              onClick={() => navigate('/diet/generate')}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-bold hover:shadow-lg transition-all"
            >
              Generar Plan de Dieta
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 dark:from-gray-900 dark:via-green-900/10 dark:to-emerald-900/10 pb-20 overflow-hidden">
      {/* Burbujas decorativas */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-gradient-to-br from-green-300/30 to-emerald-400/30 dark:from-green-600/20 dark:to-emerald-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="fixed top-1/3 right-0 w-80 h-80 bg-gradient-to-br from-teal-300/30 to-cyan-400/30 dark:from-teal-600/20 dark:to-cyan-600/20 rounded-full blur-3xl translate-x-1/2 pointer-events-none"></div>
      <div className="fixed bottom-0 left-1/4 w-72 h-72 bg-gradient-to-br from-lime-300/30 to-green-400/30 dark:from-lime-600/20 dark:to-green-600/20 rounded-full blur-3xl translate-y-1/2 pointer-events-none"></div>

      {/* Header Sticky */}
      <div className="sticky top-0 z-10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md shadow-xl border-b border-white/50 dark:border-gray-800/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate('/diet')}
              className="p-2 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 hover:scale-105 flex-shrink-0 mt-1"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 dark:from-green-400 dark:via-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                {dietPlan.name}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {dietPlan.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-4 border border-gray-100 dark:border-gray-700/50 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Objetivo</p>
                <p className="font-bold text-gray-900 dark:text-gray-100 capitalize text-base">{dietPlan.goal.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-4 border border-gray-100 dark:border-gray-700/50 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Calorías Diarias</p>
                <p className="font-bold text-gray-900 dark:text-gray-100 text-base">{dietPlan.target_calories} kcal</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-4 border border-gray-100 dark:border-gray-700/50 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 shadow-lg shadow-orange-500/30">
                <Utensils className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Comidas</p>
                <p className="font-bold text-gray-900 dark:text-gray-100 text-base">{getDayMeals(selectedDay).length} al día</p>
              </div>
            </div>
          </div>
        </div>

        {/* Macros */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-5 border border-gray-100 dark:border-gray-700/50 shadow-md">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Macronutrientes Objetivo
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{dietPlan.target_protein_g || 0}g</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">Proteína</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{dietPlan.target_carbs_g || 0}g</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">Carbohidratos</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{dietPlan.target_fat_g || 0}g</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">Grasas</p>
            </div>
          </div>
        </div>

        {/* Day Selector */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl p-5 border border-white/50 dark:border-gray-700/50 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Selecciona el día</h3>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {daysOfWeek.map((day, index) => {
              const dayNumber = index + 1;
              const hasMeals = getDayMeals(dayNumber).length > 0;
              
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDay(dayNumber)}
                  className={cn(
                    "px-2 py-3 rounded-xl text-xs font-semibold transition-all duration-300 relative overflow-hidden",
                    selectedDay === dayNumber
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 scale-105'
                      : 'bg-white dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30 hover:scale-105 border border-gray-200 dark:border-gray-600'
                  )}
                >
                  <div className="relative z-10">
                    <div className="text-[10px] opacity-80 mb-0.5">{day.slice(0, 3)}</div>
                    {hasMeals && (
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full mx-auto mt-1",
                        selectedDay === dayNumber ? "bg-white" : "bg-green-500"
                      )} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Meals for Selected Day */}
        <div className="space-y-3">
          {getDayMeals(selectedDay).map((meal) => (
            <div
              key={meal.id}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-md hover:shadow-xl transition-all duration-300"
            >
              <button
                onClick={() => toggleMeal(meal.id)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gradient-to-r hover:from-green-50/50 hover:to-emerald-50/50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30">
                    <Utensils className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{getMealTypeLabel(meal.meal_type)}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{meal.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {expandedMeals[meal.id] ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {expandedMeals[meal.id] && (
                <div className="p-6 space-y-4 bg-gradient-to-br from-white/50 to-green-50/30 dark:from-gray-900/50 dark:to-green-900/10">
                  
                  {/* Ingredientes/Descripción */}
                  {meal.description && (
                    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-4 border border-green-200/50 dark:border-green-700/50">
                      <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-green-500" />
                        Ingredientes
                      </h5>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {meal.description}
                      </p>
                    </div>
                  )}

                  {/* Preparación */}
                  {meal.recipe_instructions && (
                    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-4 border border-orange-200/50 dark:border-orange-700/50">
                      <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Preparación
                      </h5>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                        {meal.recipe_instructions}
                      </p>
                    </div>
                  )}

                  {/* Tiempo de preparación */}
                  {meal.preparation_time_minutes && (
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-4 border border-blue-200/50 dark:border-blue-700/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-500/10 dark:bg-blue-500/20">
                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Tiempo de preparación</p>
                          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{meal.preparation_time_minutes} min</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {getDayMeals(selectedDay).length === 0 && (
            <div className="text-center py-12 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-3xl border border-white/50 dark:border-gray-700/50">
              <Utensils className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No hay comidas programadas para este día</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavbar />
    </div>
  );
};

export default DietPlanView;
