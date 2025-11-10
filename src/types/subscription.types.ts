// =====================================================
// TIPOS DE SUSCRIPCIONES Y TOKENS
// =====================================================

export type SubscriptionPlan = 'free' | 'pro' | 'premium';

export interface UserSubscription {
  plan: SubscriptionPlan;
  status: 'active' | 'cancelled' | 'expired';
  workout_limit: number; // -1 = ilimitado
  diet_limit: number; // -1 = ilimitado
  workout_used: number;
  diet_used: number;
  started_at: string;
  expires_at: string | null;
}

export interface SubscriptionPlanDetails {
  plan: SubscriptionPlan;
  workout_limit: number;
  diet_limit: number;
  price: number;
  features: string[];
}

export interface TokenUsage {
  workout_tokens_used: number;
  diet_tokens_used: number;
  workout_tokens_remaining: number;
  diet_tokens_remaining: number;
  month: number;
  year: number;
}
