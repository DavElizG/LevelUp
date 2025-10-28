/**
 * Food Search Service
 * Búsqueda híbrida de alimentos: primero en base de datos local (Supabase),
 * luego en OpenFoodFacts API si no hay resultados locales.
 */

import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export interface FoodItem {
  id?: string;
  name: string;
  source: 'local' | 'openfoodfacts';
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g?: number;
  barcode?: string;
  image_url?: string;
  brand?: string;
}

/**
 * Busca alimentos primero en OpenFoodFacts,
 * luego en base de datos local si no hay resultados.
 */
export async function searchFood(query: string): Promise<FoodItem[]> {
  const results: FoodItem[] = [];

  // 1. Buscar primero en OpenFoodFacts (base de datos más amplia)
  try {
    const openFoodResults = await searchOpenFoodFacts(query);
    if (openFoodResults.length > 0) {
      return openFoodResults;
    }
  } catch (err) {
    console.error('Error searching OpenFoodFacts:', err);
  }

  // 2. Si no hay resultados en OpenFoodFacts, buscar en base de datos local (Supabase)
  try {
    if (isSupabaseConfigured && supabase) {
      const { data: localFoods, error } = await supabase
        .from('foods')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(10);

      if (!error && localFoods) {
        // Mapear resultados locales
        for (const food of localFoods) {
          results.push({
            id: food.id,
            name: food.name,
            source: 'local',
            calories_per_100g: Number.parseFloat(food.calories_per_100g) || 0,
            protein_per_100g: Number.parseFloat(food.protein_per_100g) || 0,
            carbs_per_100g: Number.parseFloat(food.carbs_per_100g) || 0,
            fat_per_100g: Number.parseFloat(food.fat_per_100g) || 0,
            fiber_per_100g: Number.parseFloat(food.fiber_per_100g) || 0,
          });
        }
      }
    }
  } catch (err) {
    console.error('Error searching local foods:', err);
  }

  // 3. Si hay resultados locales, retornarlos
  if (results.length > 0) {
    return results;
  }

  // 4. Si no hay resultados en ninguna fuente, generar estimación genérica
  const genericFood = generateGenericNutrition(query);
  return [genericFood];
}

/**
 * Busca alimentos en OpenFoodFacts API
 */
async function searchOpenFoodFacts(query: string): Promise<FoodItem[]> {
  const results: FoodItem[] = [];

  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
      query
    )}&search_simple=1&action=process&json=1&page_size=10`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OpenFoodFacts API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.products && Array.isArray(data.products)) {
      for (const product of data.products) {
        // Extraer datos nutricionales (por 100g)
        const nutriments = product.nutriments || {};
        
        // OpenFoodFacts puede tener datos inconsistentes, validar
        const calories = nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0;
        const protein = nutriments['proteins_100g'] || nutriments['proteins'] || 0;
        const carbs = nutriments['carbohydrates_100g'] || nutriments['carbohydrates'] || 0;
        const fat = nutriments['fat_100g'] || nutriments['fat'] || 0;
        const fiber = nutriments['fiber_100g'] || nutriments['fiber'] || 0;

        // Solo agregar si tiene nombre y al menos calorías
        if (product.product_name && calories > 0) {
          results.push({
            name: product.product_name,
            source: 'openfoodfacts',
            calories_per_100g: Number.parseFloat(calories) || 0,
            protein_per_100g: Number.parseFloat(protein) || 0,
            carbs_per_100g: Number.parseFloat(carbs) || 0,
            fat_per_100g: Number.parseFloat(fat) || 0,
            fiber_per_100g: Number.parseFloat(fiber) || 0,
            barcode: product.code || product._id,
            image_url: product.image_url || product.image_front_url,
            brand: product.brands,
          });
        }
      }
    }
  } catch (err) {
    console.error('Error fetching from OpenFoodFacts:', err);
    throw err;
  }

  return results;
}

/**
 * Obtiene información detallada de un producto por código de barras
 */
export async function getFoodByBarcode(barcode: string): Promise<FoodItem | null> {
  try {
    const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.status === 1 && data.product) {
      const product = data.product;
      const nutriments = product.nutriments || {};

      const calories = nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0;
      const protein = nutriments['proteins_100g'] || nutriments['proteins'] || 0;
      const carbs = nutriments['carbohydrates_100g'] || nutriments['carbohydrates'] || 0;
      const fat = nutriments['fat_100g'] || nutriments['fat'] || 0;
      const fiber = nutriments['fiber_100g'] || nutriments['fiber'] || 0;

      return {
        name: product.product_name || 'Unknown Product',
        source: 'openfoodfacts',
        calories_per_100g: Number.parseFloat(calories) || 0,
        protein_per_100g: Number.parseFloat(protein) || 0,
        carbs_per_100g: Number.parseFloat(carbs) || 0,
        fat_per_100g: Number.parseFloat(fat) || 0,
        fiber_per_100g: Number.parseFloat(fiber) || 0,
        barcode: product.code || barcode,
        image_url: product.image_url || product.image_front_url,
        brand: product.brands,
      };
    }
  } catch (err) {
    console.error('Error fetching product by barcode:', err);
  }

  return null;
}

/**
 * Guarda un alimento en meal_logs
 */
export async function saveMealLog(
  food: FoodItem,
  quantity: number,
  mealType: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase no está configurado' };
  }

  try {
    // Obtener usuario actual
    const userRes = await supabase.auth.getUser();
    const userId = userRes?.data?.user?.id || null;

    // Calcular valores nutricionales basados en cantidad
    const multiplier = quantity / 100;
    const now = new Date();

    const mealLog = {
      user_id: userId,
      meal_type: mealType || 'lunch',
      meal_date: now.toISOString().split('T')[0],
      food_name: food.name,
      quantity_grams: quantity,
      calories: Math.round(food.calories_per_100g * multiplier),
      protein: Math.round(food.protein_per_100g * multiplier * 10) / 10,
      carbs: Math.round(food.carbs_per_100g * multiplier * 10) / 10,
      fat: Math.round(food.fat_per_100g * multiplier * 10) / 10,
      logged_at: now.toISOString(),
    };

    const { error } = await supabase.from('meal_logs').insert(mealLog);

    if (error) {
      console.error('Error saving meal log:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Error in saveMealLog:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' };
  }
}

/**
 * Genera datos nutricionales genéricos para alimentos sin información
 */
export function generateGenericNutrition(foodName: string): FoodItem {
  // Estimaciones genéricas basadas en tipo de alimento común
  let calories = 150;
  let protein = 8;
  let carbs = 15;
  let fat = 5;

  const lowerName = foodName.toLowerCase();

  // Ajustar estimaciones según palabras clave
  if (lowerName.includes('pizza') || lowerName.includes('burger') || lowerName.includes('fries')) {
    calories = 250;
    protein = 12;
    carbs = 30;
    fat = 10;
  } else if (lowerName.includes('salad') || lowerName.includes('vegetable')) {
    calories = 50;
    protein = 2;
    carbs = 10;
    fat = 1;
  } else if (lowerName.includes('chicken') || lowerName.includes('meat') || lowerName.includes('fish')) {
    calories = 180;
    protein = 25;
    carbs = 0;
    fat = 8;
  } else if (lowerName.includes('rice') || lowerName.includes('pasta') || lowerName.includes('bread')) {
    calories = 130;
    protein = 3;
    carbs = 28;
    fat = 1;
  } else if (lowerName.includes('fruit') || lowerName.includes('apple') || lowerName.includes('banana')) {
    calories = 60;
    protein = 1;
    carbs = 14; // Frutas tienen ligeramente menos carbohidratos
    fat = 0.5;
  }

  return {
    name: foodName,
    source: 'local',
    calories_per_100g: calories,
    protein_per_100g: protein,
    carbs_per_100g: carbs,
    fat_per_100g: fat,
    fiber_per_100g: 2,
  };
}
