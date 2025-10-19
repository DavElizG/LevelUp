import { describe, it, expect } from 'vitest';
import {
  workoutRoutineToWorkout,
  workoutToCreateData,
  workoutToUpdateData,
  calculateTotalCalories,
  workoutRoutinesToWorkouts,
} from './type-converters';
import type { WorkoutRoutine, Workout, DietPlan, Exercise } from '../types/index';

describe('type-converters', () => {
  describe('workoutRoutineToWorkout', () => {
    it('should convert WorkoutRoutine to Workout correctly', () => {
      const mockExercise: Exercise = {
        id: 'exercise-1',
        name: 'Push-ups',
        category: 'strength',
        description: 'Standard push-ups',
        muscleGroups: ['chest', 'triceps'],
        equipment: 'none',
        difficultyLevel: 'beginner',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const mockRoutine: WorkoutRoutine = {
        id: 'routine-1',
        userId: 'user-1',
        name: 'Morning Workout',
        description: 'A great morning routine',
        goal: 'general',
        difficultyLevel: 'intermediate',
        durationWeeks: 4,
        daysPerWeek: 3,
        generatedByAi: true,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        exercises: [
          {
            id: 'routine-exercise-1',
            routineId: 'routine-1',
            exerciseId: 'exercise-1',
            dayOfWeek: 1,
            orderInDay: 1,
            sets: 3,
            repsMin: 8,
            repsMax: 12,
            restSeconds: 60,
            createdAt: '2024-01-01T00:00:00Z',
            exercise: mockExercise,
          },
        ],
      };

      const result = workoutRoutineToWorkout(mockRoutine);

      expect(result).toEqual({
        id: 'routine-1',
        userId: 'user-1',
        name: 'Morning Workout',
        description: 'A great morning routine',
        exercises: [mockExercise],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });
    });

    it('should handle routine with no exercises', () => {
      const mockRoutine: WorkoutRoutine = {
        id: 'routine-1',
        userId: 'user-1',
        name: 'Empty Workout',
        description: 'No exercises yet',
        goal: 'general',
        difficultyLevel: 'beginner',
        durationWeeks: 4,
        daysPerWeek: 3,
        generatedByAi: false,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        exercises: [],
      };

      const result = workoutRoutineToWorkout(mockRoutine);

      expect(result.exercises).toEqual([]);
    });
  });

  describe('workoutToCreateData', () => {
    it('should convert Workout to CreateWorkoutData with default values', () => {
      const mockWorkout: Workout = {
        id: 'workout-1',
        userId: 'user-1',
        name: 'Test Workout',
        description: 'A test workout',
        exercises: [
          {
            id: 'exercise-1',
            name: 'Squats',
            category: 'strength',
            description: 'Standard squats',
            muscleGroups: ['legs', 'glutes'],
            equipment: 'none',
            difficultyLevel: 'beginner',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          {
            id: 'exercise-2',
            name: 'Lunges',
            category: 'strength',
            description: 'Forward lunges',
            muscleGroups: ['legs', 'glutes'],
            equipment: 'none',
            difficultyLevel: 'beginner',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const result = workoutToCreateData(mockWorkout);

      expect(result).toEqual({
        userId: 'user-1',
        name: 'Test Workout',
        description: 'A test workout',
        goal: 'general',
        difficultyLevel: 'intermediate',
        durationWeeks: 4,
        daysPerWeek: 3,
        generatedByAi: true,
        isActive: true,
        exercises: [
          {
            exerciseId: 'exercise-1',
            dayOfWeek: 1,
            orderInDay: 1,
            sets: 3,
            repsMin: 8,
            repsMax: 12,
            restSeconds: 60,
          },
          {
            exerciseId: 'exercise-2',
            dayOfWeek: 1,
            orderInDay: 2,
            sets: 3,
            repsMin: 8,
            repsMax: 12,
            restSeconds: 60,
          },
        ],
      });
    });
  });

  describe('workoutToUpdateData', () => {
    it('should convert Workout to UpdateWorkoutData', () => {
      const mockWorkout: Workout = {
        id: 'workout-1',
        userId: 'user-1',
        name: 'Updated Workout',
        description: 'An updated description',
        exercises: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      const result = workoutToUpdateData(mockWorkout);

      expect(result).toEqual({
        name: 'Updated Workout',
        description: 'An updated description',
        isActive: true,
      });
    });
  });

  describe('calculateTotalCalories', () => {
    it('should calculate total calories from diet plan meals', () => {
      const mockDietPlan: DietPlan = {
        id: 'diet-1',
        userId: 'user-1',
        name: 'My Diet',
        description: 'Healthy diet',
        targetCalories: 2000,
        targetProteinG: 150,
        targetCarbsG: 200,
        targetFatG: 65,
        generatedByAi: true,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        meals: [
          {
            id: 'meal-1',
            dietPlanId: 'diet-1',
            name: 'Breakfast',
            orderInDay: 1,
            createdAt: '2024-01-01T00:00:00Z',
            foods: [
              {
                id: 'meal-food-1',
                mealId: 'meal-1',
                foodId: 'food-1',
                quantityGrams: 100,
                createdAt: '2024-01-01T00:00:00Z',
                food: {
                  id: 'food-1',
                  name: 'Oatmeal',
                  category: 'grains',
                  caloriesPer100g: 389,
                  proteinPer100g: 17,
                  carbsPer100g: 66,
                  fatPer100g: 7,
                  createdAt: '2024-01-01T00:00:00Z',
                  updatedAt: '2024-01-01T00:00:00Z',
                },
              },
            ],
          },
          {
            id: 'meal-2',
            dietPlanId: 'diet-1',
            name: 'Lunch',
            orderInDay: 2,
            createdAt: '2024-01-01T00:00:00Z',
            foods: [
              {
                id: 'meal-food-2',
                mealId: 'meal-2',
                foodId: 'food-2',
                quantityGrams: 200,
                createdAt: '2024-01-01T00:00:00Z',
                food: {
                  id: 'food-2',
                  name: 'Chicken Breast',
                  category: 'protein',
                  caloriesPer100g: 165,
                  proteinPer100g: 31,
                  carbsPer100g: 0,
                  fatPer100g: 3.6,
                  createdAt: '2024-01-01T00:00:00Z',
                  updatedAt: '2024-01-01T00:00:00Z',
                },
              },
            ],
          },
        ],
      };

      const result = calculateTotalCalories(mockDietPlan);

      // Expected: (389 * 100 / 100) + (165 * 200 / 100) = 389 + 330 = 719
      expect(result).toBe(719);
    });

    it('should return target calories when no meals are present', () => {
      const mockDietPlan: DietPlan = {
        id: 'diet-1',
        userId: 'user-1',
        name: 'Empty Diet',
        description: 'No meals yet',
        targetCalories: 2000,
        targetProteinG: 150,
        targetCarbsG: 200,
        targetFatG: 65,
        generatedByAi: false,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const result = calculateTotalCalories(mockDietPlan);

      expect(result).toBe(2000);
    });
  });

  describe('workoutRoutinesToWorkouts', () => {
    it('should convert array of WorkoutRoutines to array of Workouts', () => {
      const mockRoutines: WorkoutRoutine[] = [
        {
          id: 'routine-1',
          userId: 'user-1',
          name: 'Routine 1',
          description: 'First routine',
          goal: 'general',
          difficultyLevel: 'beginner',
          durationWeeks: 4,
          daysPerWeek: 3,
          generatedByAi: false,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          exercises: [],
        },
        {
          id: 'routine-2',
          userId: 'user-1',
          name: 'Routine 2',
          description: 'Second routine',
          goal: 'strength',
          difficultyLevel: 'intermediate',
          durationWeeks: 6,
          daysPerWeek: 4,
          generatedByAi: true,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          exercises: [],
        },
      ];

      const result = workoutRoutinesToWorkouts(mockRoutines);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('routine-1');
      expect(result[1].id).toBe('routine-2');
    });

    it('should handle empty array', () => {
      const result = workoutRoutinesToWorkouts([]);

      expect(result).toEqual([]);
    });
  });
});
