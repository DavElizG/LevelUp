import type { 
  Workout, 
  WorkoutRoutine, 
  Exercise, 
  RoutineExercise, 
  DietPlan, 
  CreateWorkoutData,
  UpdateWorkoutData
} from '../types/index.ts';

/**
 * Utility functions to convert between different type representations
 */

// Convert WorkoutRoutine (Supabase format) to Workout (legacy format)
export function workoutRoutineToWorkout(routine: WorkoutRoutine): Workout {
  return {
    id: routine.id,
    userId: routine.userId,
    name: routine.name,
    description: routine.description,
    exercises: routine.exercises?.map(routineExercise => routineExercise.exercise).filter(Boolean) as Exercise[] || [],
    createdAt: routine.createdAt,
    updatedAt: routine.updatedAt,
  };
}

// Convert Workout (legacy format) to CreateWorkoutData (Supabase create format)
export function workoutToCreateData(workout: Workout): CreateWorkoutData {
  return {
    userId: workout.userId,
    name: workout.name,
    description: workout.description,
    goal: 'general', // Default value
    difficultyLevel: 'intermediate', // Default value
    durationWeeks: 4, // Default value
    daysPerWeek: 3, // Default value
    generatedByAi: true,
    isActive: true,
    exercises: workout.exercises.map((exercise, index) => ({
      exerciseId: exercise.id,
      dayOfWeek: Math.floor(index / 3) + 1, // Distribute across days
      orderInDay: (index % 3) + 1,
      sets: 3, // Default value
      repsMin: 8, // Default value
      repsMax: 12, // Default value
      restSeconds: 60, // Default value
    })) as RoutineExercise[]
  };
}

// Convert Workout (legacy format) to UpdateWorkoutData (Supabase update format)
export function workoutToUpdateData(workout: Workout): UpdateWorkoutData {
  return {
    name: workout.name,
    description: workout.description,
    isActive: true,
    // Note: exercises updates would need to be handled separately
    // as they require delete/insert operations
  };
}

// Calculate total calories from diet plan
export function calculateTotalCalories(dietPlan: DietPlan): number {
  if (!dietPlan.meals) return dietPlan.targetCalories;
  
  return dietPlan.meals.reduce((total, meal) => {
    if (!meal.foods) return total;
    
    return total + meal.foods.reduce((mealTotal, mealFood) => {
      if (!mealFood.food) return mealTotal;
      
      const calories = (mealFood.food.caloriesPer100g * mealFood.quantityGrams) / 100;
      return mealTotal + calories;
    }, 0);
  }, 0);
}

// Convert array of WorkoutRoutines to array of Workouts
export function workoutRoutinesToWorkouts(routines: WorkoutRoutine[]): Workout[] {
  return routines.map(workoutRoutineToWorkout);
}