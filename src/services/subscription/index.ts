import { supabase } from '../../lib/supabase';
import type { UserSubscription, SubscriptionPlanDetails, SubscriptionPlan } from '../../types/subscription.types';

function ensureSupabase() {
  if (!supabase) throw new Error('Supabase client not initialized');
  return supabase;
}

export class SubscriptionService {
  /**
   * Obtiene la suscripción actual del usuario con uso de tokens
   */
  static async getUserSubscription(): Promise<UserSubscription | null> {
    const client = ensureSupabase();
    const { data, error } = await client.rpc('get_user_subscription').single();
    
    if (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
    
    return data as UserSubscription;
  }

  /**
   * Obtiene todos los planes disponibles
   */
  static async getAvailablePlans(): Promise<SubscriptionPlanDetails[]> {
    const client = ensureSupabase();
    const { data, error } = await client.rpc('get_available_plans');
    
    if (error) {
      console.error('Error fetching plans:', error);
      throw error;
    }
    
    return data as SubscriptionPlanDetails[];
  }

  /**
   * Verifica si el usuario puede generar (tiene tokens disponibles)
   */
  static async canGenerate(generationType: 'workout' | 'diet'): Promise<boolean> {
    const client = ensureSupabase();
    const { data, error } = await client.rpc('can_generate', {
      generation_type: generationType,
    });
    
    if (error) {
      console.error('Error checking generation limit:', error);
      return false;
    }
    
    return data as boolean;
  }

  /**
   * Incrementa el uso de tokens (llamar después de generar)
   */
  static async incrementTokenUsage(generationType: 'workout' | 'diet'): Promise<void> {
    const client = ensureSupabase();
    const { error } = await client.rpc('increment_token_usage', {
      generation_type: generationType,
    });
    
    if (error) {
      console.error('Error incrementing token usage:', error);
      throw error;
    }
  }

  /**
   * Actualiza el plan de suscripción del usuario (simulación de compra)
   */
  static async updateSubscription(newPlan: SubscriptionPlan): Promise<void> {
    const client = ensureSupabase();
    const { error } = await client.rpc('update_user_subscription', {
      new_plan: newPlan,
    });
    
    if (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  /**
   * Calcula porcentaje de uso de tokens
   */
  static calculateUsagePercentage(used: number, limit: number): number {
    if (limit === -1) return 0; // Ilimitado
    if (limit === 0) return 100;
    return Math.min(Math.round((used / limit) * 100), 100);
  }

  /**
   * Verifica si un plan es mejor que el actual
   */
  static isUpgrade(currentPlan: SubscriptionPlan, newPlan: SubscriptionPlan): boolean {
    const planOrder: Record<SubscriptionPlan, number> = {
      free: 0,
      pro: 1,
      premium: 2,
    };
    return planOrder[newPlan] > planOrder[currentPlan];
  }
}
