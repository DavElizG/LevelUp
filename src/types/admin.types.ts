// Admin Types for Dashboard System

export interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  role_id: string;
  role_name: string;
  assigned_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  name: string | null;
  lastname1: string | null;
  lastname2: string | null;
  created_at: string;
  registered_at: string;
  last_sign_in_at: string | null;
  email_confirmed: boolean;
  is_banned: boolean;
  banned_until: string | null;
  deleted_at: string | null;
  roles: Array<{ id: string; name: string }>;
  stats: {
    routines: number;
    diet_plans: number;
    sessions: number;
  };
}

export interface RoutineStats {
  id: string;
  name: string;
  user_id: string;
  creator_email: string;
  creator_name: string | null;
  is_public: boolean;
  goal: string | null;
  difficulty_level: string | null;
  days_per_week: number | null;
  generated_by_ai: boolean;
  created_at: string;
  updated_at: string;
  stats: {
    total_exercises: number;
    unique_users: number;
    total_sessions: number;
  };
}

export interface SystemStats {
  total_users: number;
  active_users_last_7_days: number;
  active_users_last_30_days: number;
  total_routines: number;
  public_routines: number;
  private_routines: number;
  total_diet_plans: number;
  total_workout_sessions: number;
  total_exercises: number;
  total_foods: number;
  ai_generations_last_30_days: number;
  new_users_last_7_days: number;
  new_users_last_30_days: number;
}

export interface AuditLog {
  id: string;
  admin_user_id: string;
  action_type: string;
  target_table: string | null;
  target_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AdminFilters {
  search?: string;
  role?: string;
  limit?: number;
  offset?: number;
}

export interface RoutineFilters {
  search?: string;
  is_public?: boolean;
  user_id?: string;
  limit?: number;
  offset?: number;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscle_groups: string[];
  equipment: string;
  difficulty_level: string;
  description: string;
  video_url: string | null;
  thumbnail_url: string | null;
  created_at: string;
  usage_count: number;
}

export interface Food {
  id: string;
  name: string;
  category: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g: number;
  is_common: boolean;
  created_at: string;
  usage_count: number;
}

export interface ExerciseFilters {
  search?: string;
  category?: string;
  difficulty?: string;
  limit?: number;
  offset?: number;
}

export interface FoodFilters {
  search?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface ExerciseUpdateData {
  name?: string;
  category?: string;
  description?: string;
  difficulty_level?: string;
  equipment?: string;
  muscle_groups?: string[];
  video_url?: string;
  thumbnail_url?: string;
}

export interface FoodUpdateData {
  name?: string;
  category?: string;
  calories_per_100g?: number;
  protein_per_100g?: number;
  carbs_per_100g?: number;
  fat_per_100g?: number;
  fiber_per_100g?: number;
  is_common?: boolean;
}

export type AdminPermission = 
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'roles:read'
  | 'roles:write'
  | 'roles:delete'
  | 'routines:read'
  | 'routines:write'
  | 'routines:delete'
  | 'routines:publish'
  | 'plans:read'
  | 'plans:write'
  | 'plans:delete'
  | 'system:read'
  | 'system:write';
