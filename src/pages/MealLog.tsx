import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import BottomNavbar from '../components/shared/BottomNavbar';
import FoodPhotoAnalyzer from '../components/nutrition/FoodPhotoAnalyzer';

type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner';

interface MealItem {
  id: string;
  user_id?: string | null;
  meal_type: MealType;
  food_name: string;
  quantity_grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  logged_at: string;
}

const emptyMeals: Record<MealType, MealItem[]> = {
  breakfast: [],
  lunch: [],
  snack: [],
  dinner: [],
};

const MealLog: React.FC = () => {
  const navigate = useNavigate();
  const [meals, setMeals] = useState<Record<MealType, MealItem[]>>(emptyMeals);
  const [, setLoading] = useState(false);
  const [showPhotoAnalyzer, setShowPhotoAnalyzer] = useState(false);

  const fetchTodaysMeals = async () => {
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

      let query = supabase
        .from('meal_logs')
        .select('*')
        .gte('logged_at', start.toISOString())
        .lte('logged_at', end.toISOString())
        .order('logged_at', { ascending: true });

      // Filter by user if available
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const grouped = { ...emptyMeals } as Record<MealType, MealItem[]>;
      (data || []).forEach((row: any) => {
        const mt = row.meal_type as MealType;
        if (grouped[mt]) grouped[mt].push(row as MealItem);
      });
      setMeals(grouped);
    } catch (err) {
      console.error('Error fetching today meals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodaysMeals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePhotoAnalysis = async (analyzedFood: any) => {
    if (!isSupabaseConfigured || !supabase) {
      alert('Supabase no está configurado. No se puede guardar.');
      return;
    }

    try {
      // Try to get current user
      let userId: string | null = null;
      try {
        // supabase v2
        // @ts-ignore
        const userRes = await supabase.auth.getUser();
        userId = userRes?.data?.user?.id || null;
      } catch (e) {
        console.warn('Could not get user', e);
      }

      const cal100 = analyzedFood.estimated_calories ?? 0;
      const prot100 = analyzedFood.estimated_protein ?? 0;
      const carb100 = analyzedFood.estimated_carbs ?? 0;
      const fat100 = analyzedFood.estimated_fat ?? 0;

      const multiplier = 250 / 100; // default 250g
      const newRow = {
        user_id: userId,
        meal_type: 'lunch', // default meal type for photo analysis
        food_name: analyzedFood.name || 'Comida analizada',
        quantity_grams: 250,
        calories: Math.round(cal100 * multiplier),
        protein: Math.round(prot100 * multiplier * 10) / 10,
        carbs: Math.round(carb100 * multiplier * 10) / 10,
        fat: Math.round(fat100 * multiplier * 10) / 10,
        logged_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('meal_logs').insert(newRow).select();
      if (error) throw error;

      // Refresh meals
      fetchTodaysMeals();
      setShowPhotoAnalyzer(false);

    } catch (err) {
      console.error('Error saving analyzed meal', err);
      alert('Error al guardar la comida analizada. Revisa la consola.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-medium text-gray-900">Registro de Comidas (Hoy)</h1>
          <div className="text-sm text-gray-500">{new Date().toLocaleDateString()}</div>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        {/* Camera button */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/food-photo-analyzer')}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-2xl p-4 flex items-center justify-center space-x-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Tomar foto de comida (IA)</span>
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => navigate('/food-search', { state: { mealType: 'breakfast' } })}
            className="bg-pink-500 rounded-2xl p-4 text-white"
          >
            + Agregar Desayuno
          </button>
          <button
            onClick={() => navigate('/food-search', { state: { mealType: 'lunch' } })}
            className="bg-green-500 rounded-2xl p-4 text-white"
          >
            + Agregar Almuerzo
          </button>
          <button
            onClick={() => navigate('/food-search', { state: { mealType: 'snack' } })}
            className="bg-blue-500 rounded-2xl p-4 text-white"
          >
            + Agregar Merienda
          </button>
          <button
            onClick={() => navigate('/food-search', { state: { mealType: 'dinner' } })}
            className="bg-gray-500 rounded-2xl p-4 text-white"
          >
            + Agregar Cena
          </button>
        </div>

        <div className="space-y-4">
          {(Object.keys(meals) as MealType[]).map((mt) => (
            <div key={mt} className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-semibold mb-2 text-gray-800">{mt.charAt(0).toUpperCase() + mt.slice(1)}</h3>
              {meals[mt].length === 0 && <div className="text-sm text-gray-500">Sin registros</div>}
              {meals[mt].map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border mb-2">
                  <div>
                    <div className="font-medium">{item.food_name}</div>
                    <div className="text-sm text-gray-500">{item.quantity_grams} g • {item.protein}g P • {item.carbs}g C • {item.fat}g F</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{item.calories} kcal</div>
                    <div className="text-xs text-gray-400">{new Date(item.logged_at).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <BottomNavbar />

      {showPhotoAnalyzer && (
        <FoodPhotoAnalyzer
          onAnalysisComplete={(data) => handlePhotoAnalysis(data)}
          onClose={() => setShowPhotoAnalyzer(false)}
        />
      )}
    </div>
  );
};

export default MealLog;
