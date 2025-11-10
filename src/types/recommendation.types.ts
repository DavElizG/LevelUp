// =====================================================
// TIPOS DE RECOMENDACIONES Y MOTIVACIÓN
// =====================================================

export type RecommendationType = 
  | 'workout_adjustment' 
  | 'diet_adjustment' 
  | 'rest_day' 
  | 'hydration' 
  | 'sleep' 
  | 'general';

export type RecommendationPriority = 'low' | 'medium' | 'high';

export interface Recommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  priority: RecommendationPriority;
  category: 'fitness' | 'nutrition' | 'recovery' | 'lifestyle';
  actionable: boolean;
  metadata?: Record<string, unknown>;
}

export interface WorkoutInsights {
  totalExercises: number;
  difficulty: string;
  estimatedBurn: number;
  muscleGroups: string[];
  recommendation: string;
}

export interface DietInsights {
  totalMeals: number;
  dailyCalories: number;
  macroBalance: {
    protein: number;
    carbs: number;
    fat: number;
  };
  mealVariety: number;
  recommendation: string;
}

export interface PersonalizedInsights {
  userId: string;
  profileComplete: boolean;
  hasWorkoutPlan: boolean;
  hasDietPlan: boolean;
  workoutInsights?: WorkoutInsights;
  dietInsights?: DietInsights;
  generalTips: string[];
  nextSteps: string[];
}

export interface MotivationalMessage {
  title: string;
  description: string;
  type: 'motivational' | 'tip' | 'achievement';
  priority: RecommendationPriority;
}

export interface MotivationalContent {
  userId: string;
  motivationalMessages: MotivationalMessage[];
  dailyTip: string;
  quote: string;
}

export interface RecommendationRequest {
  userId: string;
  currentWorkoutPlan?: {
    id: string;
    exercises: unknown[];
    goal: string;
  };
  currentDietPlan?: {
    id: string;
    meals: unknown[];
    targetCalories: number;
  };
  userProgress?: {
    workoutsCompleted: number;
    currentWeight: number;
    targetWeight: number;
  };
}
