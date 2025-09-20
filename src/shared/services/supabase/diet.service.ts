import { supabase } from './auth';
import type { 
  DietService,
  ApiResponse, 
  DietPlan,
  Food,
  CreateDietPlanData,
  UpdateDietPlanData
} from '../../types/index.ts';

/**
 * Supabase Diet Service - Handles CRUD operations for diet plans
 */
export class SupabaseDietService implements DietService {
  async getDietPlans(): Promise<ApiResponse<DietPlan[]>> {
    try {
      const { data, error } = await supabase
        .from('diet_plans')
        .select(`
          *,
          meals:diet_meals(
            *,
            foods:diet_meal_foods(
              *,
              food:foods(*)
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        return {
          success: false,
          data: null,
          error: error.message,
        };
      }

      return {
        success: true,
        data: data || [],
        message: 'Diet plans retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch diet plans',
      };
    }
  }

  async getDietPlan(id: string): Promise<ApiResponse<DietPlan>> {
    try {
      const { data, error } = await supabase
        .from('diet_plans')
        .select(`
          *,
          meals:diet_meals(
            *,
            foods:diet_meal_foods(
              *,
              food:foods(*)
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        return {
          success: false,
          data: null,
          error: error.message,
        };
      }

      return {
        success: true,
        data: data,
        message: 'Diet plan retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch diet plan',
      };
    }
  }

  async createDietPlan(dietPlan: CreateDietPlanData): Promise<ApiResponse<DietPlan>> {
    try {
      // Insert diet plan first
      const { data: planData, error: planError } = await supabase
        .from('diet_plans')
        .insert({
          user_id: dietPlan.userId,
          name: dietPlan.name,
          description: dietPlan.description,
          goal: dietPlan.goal,
          duration_weeks: dietPlan.durationWeeks,
          target_calories: dietPlan.targetCalories,
          target_protein_g: dietPlan.targetProteinG,
          target_carbs_g: dietPlan.targetCarbsG,
          target_fat_g: dietPlan.targetFatG,
          generated_by_ai: dietPlan.generatedByAi,
          ai_prompt: dietPlan.aiPrompt,
          ai_model: dietPlan.aiModel,
          is_active: dietPlan.isActive,
        })
        .select()
        .single();

      if (planError) {
        return {
          success: false,
          data: null,
          error: planError.message,
        };
      }

      // Insert meals if provided
      if (dietPlan.meals && dietPlan.meals.length > 0) {
        const mealsToInsert = dietPlan.meals.map(meal => ({
          diet_plan_id: planData.id,
          meal_type: meal.mealType,
          day_of_week: meal.dayOfWeek,
          order_in_day: meal.orderInDay,
          name: meal.name,
          description: meal.description,
          preparation_time_minutes: meal.preparationTimeMinutes,
          recipe_instructions: meal.recipeInstructions,
        }));

        const { data: mealsData, error: mealsError } = await supabase
          .from('diet_meals')
          .insert(mealsToInsert)
          .select();

        if (mealsError) {
          // Rollback diet plan if meals failed
          await supabase.from('diet_plans').delete().eq('id', planData.id);
          return {
            success: false,
            data: null,
            error: mealsError.message,
          };
        }

        // Insert meal foods if provided
        for (let i = 0; i < dietPlan.meals.length; i++) {
          const meal = dietPlan.meals[i];
          const mealData = mealsData[i];
          
          if (meal.foods && meal.foods.length > 0) {
            const foodsToInsert = meal.foods.map(food => ({
              meal_id: mealData.id,
              food_id: food.foodId,
              quantity_grams: food.quantityGrams,
              notes: food.notes,
            }));

            const { error: foodsError } = await supabase
              .from('diet_meal_foods')
              .insert(foodsToInsert);

            if (foodsError) {
              // Rollback everything if foods failed
              await supabase.from('diet_plans').delete().eq('id', planData.id);
              return {
                success: false,
                data: null,
                error: foodsError.message,
              };
            }
          }
        }
      }

      // Fetch complete diet plan with meals and foods
      const completeDietPlan = await this.getDietPlan(planData.id);
      return completeDietPlan;
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to create diet plan',
      };
    }
  }

  async updateDietPlan(id: string, dietPlan: UpdateDietPlanData): Promise<ApiResponse<DietPlan>> {
    try {
      const { error } = await supabase
        .from('diet_plans')
        .update({
          name: dietPlan.name,
          description: dietPlan.description,
          goal: dietPlan.goal,
          duration_weeks: dietPlan.durationWeeks,
          target_calories: dietPlan.targetCalories,
          target_protein_g: dietPlan.targetProteinG,
          target_carbs_g: dietPlan.targetCarbsG,
          target_fat_g: dietPlan.targetFatG,
          is_active: dietPlan.isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        return {
          success: false,
          data: null,
          error: error.message,
        };
      }

      // Fetch updated diet plan
      const updatedDietPlan = await this.getDietPlan(id);
      return updatedDietPlan;
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to update diet plan',
      };
    }
  }

  async deleteDietPlan(id: string): Promise<ApiResponse<void>> {
    try {
      // Delete meal foods first, then meals, then plan (cascade should handle this)
      await supabase.from('diet_meal_foods').delete().match({ 
        meal_id: supabase.from('diet_meals').select('id').eq('diet_plan_id', id) 
      });
      await supabase.from('diet_meals').delete().eq('diet_plan_id', id);
      
      // Delete diet plan
      const { error } = await supabase
        .from('diet_plans')
        .delete()
        .eq('id', id);

      if (error) {
        return {
          success: false,
          data: null,
          error: error.message,
        };
      }

      return {
        success: true,
        data: null,
        message: 'Diet plan deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to delete diet plan',
      };
    }
  }

  async generateAIDietPlan(_preferences: any): Promise<ApiResponse<DietPlan>> {
    // This method will call the AI microservice
    // For now, return a placeholder response
    return {
      success: false,
      data: null,
      error: 'AI diet plan generation not implemented yet - requires AI microservice integration',
    };
  }

  async getFoods(): Promise<ApiResponse<Food[]>> {
    try {
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .order('name');

      if (error) {
        return {
          success: false,
          data: null,
          error: error.message,
        };
      }

      return {
        success: true,
        data: data || [],
        message: 'Foods retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch foods',
      };
    }
  }
}

// Export instance
export const supabaseDietService = new SupabaseDietService();