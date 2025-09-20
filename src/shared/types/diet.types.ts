import type { ApiResponse, BaseEntity, MealType } from './common.types.ts';

// Food (matches Supabase foods table)
export interface Food extends BaseEntity {
  name: string;
  category: string;
  caloriesPer100g: number;
  proteinPer100g?: number;
  carbsPer100g?: number;
  fatPer100g?: number;
  fiberPer100g?: number;
  isCommon?: boolean;
}

// Diet Plan (matches Supabase diet_plans table)
export interface DietPlan extends BaseEntity {
  userId: string;
  name: string;
  description?: string;
  goal?: string;
  durationWeeks?: number;
  targetCalories: number;
  targetProteinG?: number;
  targetCarbsG?: number;
  targetFatG?: number;
  generatedByAi?: boolean;
  aiPrompt?: string;
  aiModel?: string;
  isActive?: boolean;
  meals?: DietMeal[];
}

// Diet Meal (matches Supabase diet_meals table)
export interface DietMeal extends BaseEntity {
  dietPlanId: string;
  mealType?: MealType;
  dayOfWeek?: number;
  orderInDay?: number;
  name: string;
  description?: string;
  preparationTimeMinutes?: number;
  recipeInstructions?: string;
  foods?: DietMealFood[];
}

// Diet Meal Food (matches Supabase diet_meal_foods table)
export interface DietMealFood extends BaseEntity {
  mealId: string;
  foodId: string;
  food?: Food;
  quantityGrams: number;
  notes?: string;
}

// Legacy meal interface for backward compatibility
export interface Meal extends BaseEntity {
  name: string;
  calories: number;
  foods: Food[];
  mealType?: MealType;
}

// Create/Update DTOs
export type CreateDietPlanData = Omit<DietPlan, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateDietPlanData = Partial<CreateDietPlanData>;

// Diet Service Contract
export interface DietService {
  getDietPlans(): Promise<ApiResponse<DietPlan[]>>;
  getDietPlan(id: string): Promise<ApiResponse<DietPlan>>;
  createDietPlan(dietPlan: CreateDietPlanData): Promise<ApiResponse<DietPlan>>;
  updateDietPlan(id: string, dietPlan: UpdateDietPlanData): Promise<ApiResponse<DietPlan>>;
  deleteDietPlan(id: string): Promise<ApiResponse<void>>;
  generateAIDietPlan(preferences: Record<string, unknown>): Promise<ApiResponse<DietPlan>>;
  getFoods(): Promise<ApiResponse<Food[]>>;
}