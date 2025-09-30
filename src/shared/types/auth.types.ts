import type { ApiResponse, BaseEntity } from './common.types.ts';

// Auth related types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// User (simplified for auth)
export interface User extends BaseEntity {
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin';
}

// User Profile (matches Supabase user_profiles table)
export interface UserProfile extends BaseEntity {
  userId: string;
  name: string;
  lastname1: string;
  lastname2?: string;
  gender?: 'male' | 'female' | 'other';
  birthDate?: string;
  heightCm?: number;
  currentWeightKg?: number;
  fitnessGoal?: 'lose_weight' | 'gain_muscle' | 'maintain' | 'improve_endurance';
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  targetWeightKg?: number;
  workoutDaysPerWeek?: number;
  preferredWorkoutDuration?: number;
  dietaryRestrictions?: string[];
  allergies?: string[];
}

// Auth Service Contract
export interface AuthService {
  login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>>;
  register(data: RegisterData): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>>;
  logout(): Promise<ApiResponse<void>>;
  refreshToken(): Promise<ApiResponse<AuthTokens>>;
  getCurrentUser(): Promise<ApiResponse<User>>;
}