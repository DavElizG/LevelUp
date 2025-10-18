// Common types used across the application
export interface ApiResponse<T = unknown> {
  data: T | null;
  error?: Error | string | null;
  success: boolean;
  message?: string;
}

export interface ApiResponseList<T = unknown> {
  data: T[];
  error?: Error | string | null;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Base entity interface
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

// Common enums
export type FitnessGoal = 'lose_weight' | 'gain_muscle' | 'maintain' | 'improve_endurance';
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type Gender = 'male' | 'female' | 'other';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';