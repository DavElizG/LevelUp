import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import FoodSearch from '../components/nutrition/FoodSearch';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const FoodSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // allow passing mealType via state or query
  const mealType = (location.state as any)?.mealType || undefined;

  const handleSelect = async (food: any, qty: number) => {
    // If supabase configured, insert into meal_logs
    if (isSupabaseConfigured && supabase) {
      try {
        // try to get current user id
        let userId: string | null = null;
        try {
          // supabase v2
          // @ts-ignore
          const userRes = await supabase.auth.getUser();
          userId = userRes?.data?.user?.id || null;
        } catch (e) {
          console.warn('Could not get user', e);
        }

        const cal100 = food.calories_per_100g ?? food.estimated_calories ?? 0;
        const prot100 = food.protein_per_100g ?? food.estimated_protein ?? 0;
        const carb100 = food.carbs_per_100g ?? food.estimated_carbs ?? 0;
        const fat100 = food.fat_per_100g ?? food.estimated_fat ?? 0;

        const multiplier = qty / 100;
        const now = new Date();
        const newRow = {
          user_id: userId,
          meal_type: mealType || 'lunch',
          meal_date: now.toISOString().split('T')[0], // YYYY-MM-DD format
          food_name: food.name,
          quantity_grams: qty,
          calories: Math.round(cal100 * multiplier),
          protein: Math.round(prot100 * multiplier * 10) / 10,
          carbs: Math.round(carb100 * multiplier * 10) / 10,
          fat: Math.round(fat100 * multiplier * 10) / 10,
          logged_at: now.toISOString(),
        };

  const insertRes = await supabase.from('meal_logs').insert(newRow).select();
  if (insertRes.error) throw insertRes.error;

        // Navigate back to nutrition page
        navigate('/nutrition');
        return;
      } catch (err) {
        console.error('Error saving from FoodSearchPage', err);
        alert('Error al guardar la comida. Revisa la consola.');
        return;
      }
    }

    // fallback: just go back
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <FoodSearch onSelectFood={handleSelect} onClose={() => navigate(-1)} asPage mealType={mealType} />
    </div>
  );
};

export default FoodSearchPage;
