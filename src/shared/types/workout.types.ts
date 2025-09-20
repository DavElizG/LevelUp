import type { ApiResponse, BaseEntity, FitnessLevel } from './common.types.ts';

// Exercise (matches Supabase exercises table)
export interface Exercise extends BaseEntity {
  name: string;
  category: string;
  muscleGroups: string[];
  equipment?: string;
  difficultyLevel?: FitnessLevel;
  description?: string;
  instructions?: string;
}

// Workout Routine (matches Supabase workout_routines table)
export interface WorkoutRoutine extends BaseEntity {
  userId: string;
  name: string;
  description?: string;
  goal?: string;
  difficultyLevel?: string;
  durationWeeks?: number;
  daysPerWeek?: number;
  generatedByAi?: boolean;
  aiPrompt?: string;
  aiModel?: string;
  isActive?: boolean;
  exercises?: RoutineExercise[];
}

// Routine Exercise (matches Supabase routine_exercises table)
export interface RoutineExercise extends BaseEntity {
  routineId: string;
  exerciseId: string;
  exercise?: Exercise;
  dayOfWeek?: number;
  orderInDay: number;
  sets: number;
  repsMin?: number;
  repsMax?: number;
  restSeconds?: number;
  weightKg?: number;
  notes?: string;
}

// Legacy workout interface for backward compatibility
export interface Workout extends BaseEntity {
  userId: string;
  name: string;
  description?: string;
  exercises: Exercise[];
}

// Create/Update DTOs
export type CreateWorkoutData = Omit<WorkoutRoutine, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateWorkoutData = Partial<CreateWorkoutData>;

// Workout Service Contract
export interface WorkoutService {
  getWorkouts(): Promise<ApiResponse<WorkoutRoutine[]>>;
  getWorkout(id: string): Promise<ApiResponse<WorkoutRoutine>>;
  createWorkout(workout: CreateWorkoutData): Promise<ApiResponse<WorkoutRoutine>>;
  updateWorkout(id: string, workout: UpdateWorkoutData): Promise<ApiResponse<WorkoutRoutine>>;
  deleteWorkout(id: string): Promise<ApiResponse<void>>;
  generateAIWorkout(preferences: Record<string, unknown>): Promise<ApiResponse<WorkoutRoutine>>;
  getExercises(): Promise<ApiResponse<Exercise[]>>;
}