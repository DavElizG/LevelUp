import { supabase } from '../../lib/supabase';
import type { AdminUser, RoutineStats, SystemStats, Role, AdminFilters, RoutineFilters, AuditLog, Exercise, Food, ExerciseFilters, FoodFilters, ExerciseUpdateData, FoodUpdateData } from '../../types/admin.types';

function ensureSupabase() {
  if (!supabase) throw new Error('Supabase client not initialized');
  return supabase;
}

export class AdminService {
  static async isAdmin(): Promise<boolean> {
    try {
      const client = ensureSupabase();
      const { data, error } = await client.rpc('is_admin');
      if (error) throw error;
      return data === true;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  static async isEditor(): Promise<boolean> {
    try {
      const client = ensureSupabase();
      const { data, error } = await client.rpc('is_editor');
      if (error) throw error;
      return data === true;
    } catch (error) {
      console.error('Error checking editor status:', error);
      return false;
    }
  }

  static async getUserRoles(): Promise<Role[]> {
    try {
      const client = ensureSupabase();
      const { data, error } = await client.rpc('get_user_roles');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
  }

  static async getSystemStats(): Promise<SystemStats | null> {
    try {
      const client = ensureSupabase();
      const { data, error } = await client.rpc('get_system_stats');
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching system stats:', error);
      return null;
    }
  }

  static async getUsersList(filters: AdminFilters = {}): Promise<AdminUser[]> {
    try {
      const client = ensureSupabase();
      const { data, error } = await client.rpc('admin_get_users_list', {
        search_term: filters.search || null,
        role_filter: filters.role || null,
        limit_count: filters.limit || 50,
        offset_count: filters.offset || 0,
      });
      if (error) throw error;
      
      // Map and compute full_name from individual name fields
      const users = (data || []).map((user: Record<string, unknown>) => {
        const nameParts = [user.name, user.lastname1, user.lastname2].filter(Boolean);
        const full_name = nameParts.length > 0 ? nameParts.join(' ') : null;
        
        return {
          ...user,
          full_name,
        } as AdminUser;
      });
      
      return users;
    } catch (error) {
      console.error('Error fetching users list:', error);
      throw error;
    }
  }

  static async getRoutinesStats(filters: RoutineFilters = {}): Promise<RoutineStats[]> {
    try {
      const client = ensureSupabase();
      const { data, error } = await client.rpc('admin_get_routines_stats', {
        filter_public: filters.is_public ?? null,
        search_term: filters.search || null,
        user_filter: filters.user_id || null,
        limit_count: filters.limit || 50,
        offset_count: filters.offset || 0,
      });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching routines stats:', error);
      throw error;
    }
  }

  static async updateUserRoles(userId: string, roleNames: string[]): Promise<Role[]> {
    try {
      const client = ensureSupabase();
      const { data, error } = await client.rpc('admin_update_user_roles', {
        target_user_id: userId,
        new_roles: roleNames,
      });
      if (error) throw error;
      await this.logAction('update_user_roles', 'user_roles', userId, undefined, { roles: roleNames });
      return data || [];
    } catch (error) {
      console.error('Error updating user roles:', error);
      throw error;
    }
  }

  static async assignAdminRole(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const client = ensureSupabase();
      const { data, error } = await client.rpc('assign_admin_to_user', { user_email: email });
      if (error) throw error;
      await this.logAction('assign_admin_role', 'user_roles', undefined, undefined, { email });
      return data;
    } catch (error) {
      console.error('Error assigning admin role:', error);
      throw error;
    }
  }

  static async deleteUser(userId: string): Promise<void> {
    try {
      const client = ensureSupabase();
      const { error } = await client.rpc('admin_delete_user', { target_user_id: userId });
      if (error) throw error;
      await this.logAction('delete_user', 'profiles', userId);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  static async restoreUser(userId: string): Promise<void> {
    try {
      const client = ensureSupabase();
      const { error } = await client.rpc('admin_restore_user', { target_user_id: userId });
      if (error) throw error;
      await this.logAction('restore_user', 'profiles', userId);
    } catch (error) {
      console.error('Error restoring user:', error);
      throw error;
    }
  }

  static async updateRoutine(routineId: string, updates: Record<string, unknown>): Promise<void> {
    try {
      const client = ensureSupabase();
      const { error } = await client.rpc('admin_update_routine', {
        routine_id: routineId,
        updates: updates,
      });
      if (error) throw error;
      await this.logAction('update_routine', 'routines', routineId, undefined, updates);
    } catch (error) {
      console.error('Error updating routine:', error);
      throw error;
    }
  }

  static async getAllRoles(): Promise<Role[]> {
    try {
      const client = ensureSupabase();
      const { data, error } = await client.from('roles').select('*').order('name');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching roles:', error);
      return [];
    }
  }

  static async banUser(userId: string, durationHours: number | null, reason?: string): Promise<void> {
    try {
      const client = ensureSupabase();
      const { error } = await client.rpc('admin_ban_user', {
        target_user_id: userId,
        ban_duration_hours: durationHours,
        reason: reason || null,
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error banning user:', error);
      throw error;
    }
  }

  static async unbanUser(userId: string): Promise<void> {
    try {
      const client = ensureSupabase();
      const { error } = await client.rpc('admin_unban_user', {
        target_user_id: userId,
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error unbanning user:', error);
      throw error;
    }
  }

  static async logAction(actionType: string, targetTable?: string, targetId?: string, oldValues?: Record<string, unknown>, newValues?: Record<string, unknown>): Promise<string | null> {
    try {
      const client = ensureSupabase();
      const { data, error } = await client.rpc('log_admin_action', {
        action_type: actionType,
        target_table: targetTable || null,
        target_id: targetId || null,
        old_values: oldValues || null,
        new_values: newValues || null,
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging admin action:', error);
      return null;
    }
  }

  static async getAuditLogs(limit = 100, offset = 0): Promise<AuditLog[]> {
    try {
      const client = ensureSupabase();
      const { data, error } = await client
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  }

  async getExercises(filters: ExerciseFilters = {}) {
    const client = ensureSupabase();
    const { data, error } = await client.rpc('admin_get_exercises', {
      search_term: filters.search || null,
      category_filter: filters.category || null,
      difficulty_filter: filters.difficulty || null,
      limit_count: filters.limit || 50,
      offset_count: filters.offset || 0,
    });
    if (error) throw error;
    return data as Exercise[];
  }

  async getExercisesStats() {
    const client = ensureSupabase();
    const { data, error } = await client.rpc('admin_get_exercises_stats');
    if (error) throw error;
    return data;
  }

  async getFoods(filters: FoodFilters = {}) {
    const client = ensureSupabase();
    const { data, error } = await client.rpc('admin_get_foods', {
      search_term: filters.search || null,
      category_filter: filters.category || null,
      limit_count: filters.limit || 50,
      offset_count: filters.offset || 0,
    });
    if (error) throw error;
    return data as Food[];
  }

  async getFoodsStats() {
    const client = ensureSupabase();
    const { data, error } = await client.rpc('admin_get_foods_stats');
    if (error) throw error;
    return data;
  }

  async updateExercise(exerciseId: string, updates: ExerciseUpdateData) {
    const client = ensureSupabase();
    const { data, error } = await client.rpc('admin_update_exercise', {
      exercise_id: exerciseId,
      exercise_name: updates.name ?? null,
      exercise_category: updates.category ?? null,
      exercise_description: updates.description ?? null,
      exercise_difficulty: updates.difficulty_level ?? null,
      exercise_equipment: updates.equipment ?? null,
      exercise_muscle_groups: updates.muscle_groups ?? null,
      exercise_video_url: updates.video_url ?? null,
      exercise_thumbnail_url: updates.thumbnail_url ?? null,
    });
    if (error) throw error;
    return data;
  }

  async updateFood(foodId: string, updates: FoodUpdateData) {
    const client = ensureSupabase();
    const { data, error } = await client.rpc('admin_update_food', {
      food_id: foodId,
      food_name: updates.name ?? null,
      food_category: updates.category ?? null,
      calories: updates.calories_per_100g ?? null,
      protein: updates.protein_per_100g ?? null,
      carbs: updates.carbs_per_100g ?? null,
      fat: updates.fat_per_100g ?? null,
      fiber: updates.fiber_per_100g ?? null,
      is_common_food: updates.is_common ?? null,
    });
    if (error) throw error;
    return data;
  }

  async deleteExercise(exerciseId: string) {
    const client = ensureSupabase();
    const { data, error } = await client.rpc('admin_delete_exercise', {
      exercise_id: exerciseId,
    });
    if (error) throw error;
    return data;
  }

  async deleteFood(foodId: string) {
    const client = ensureSupabase();
    const { data, error } = await client.rpc('admin_delete_food', {
      food_id: foodId,
    });
    if (error) throw error;
    return data;
  }
}
