import { supabase } from '../../../lib/supabase';
import { sqliteService } from './sqlite.service';

export type SubscriptionPlan = 'free' | 'pro' | 'premium';

interface SyncStatus {
  isOnline: boolean;
  canSyncToCloud: boolean;
  localStorageEnabled: boolean;
  unsynced: number;
}

class DataSyncService {
  private currentPlan: SubscriptionPlan = 'free';
  private userId: string | null = null;

  async initialize(userId: string): Promise<void> {
    this.userId = userId;
    await this.loadUserSubscription();
    
    // Inicializar SQLite para usuarios free
    if (this.currentPlan === 'free') {
      await sqliteService.initialize();
    }
  }

  private async loadUserSubscription(): Promise<void> {
    if (!this.userId || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('plan')
        .eq('user_id', this.userId)
        .single();

      if (error) throw error;
      this.currentPlan = (data?.plan as SubscriptionPlan) || 'free';
    } catch (error) {
      console.error('Failed to load subscription:', error);
      this.currentPlan = 'free';
    }
  }

  /**
   * Determina si los datos deben guardarse en la nube o localmente
   */
  shouldUseCloudStorage(): boolean {
    return this.currentPlan === 'pro' || this.currentPlan === 'premium';
  }

  /**
   * Guarda una sesión de entrenamiento (local o nube según plan)
   */
  async saveWorkoutSession(
    routineId: string,
    sessionDate: string,
    startTime: string,
    endTime?: string,
    notes?: string,
    rating?: number
  ): Promise<string> {
    const sessionId = crypto.randomUUID();

    if (this.shouldUseCloudStorage()) {
      // Guardar en Supabase
      if (!supabase) throw new Error('Supabase client not initialized');
      
      const { error } = await supabase.from('workout_sessions').insert({
        id: sessionId,
        user_id: this.userId,
        routine_id: routineId,
        session_date: sessionDate,
        start_time: startTime,
        end_time: endTime,
        notes,
        rating,
      });

      if (error) throw error;
    } else {
      // Guardar localmente en SQLite
      await sqliteService.saveWorkoutSession({
        id: sessionId,
        routine_id: routineId,
        session_date: sessionDate,
        start_time: startTime,
        end_time: endTime,
        notes,
        rating,
        synced: false,
      });
    }

    return sessionId;
  }

  /**
   * Guarda un log de ejercicio (local o nube según plan)
   */
  async saveExerciseLog(params: {
    sessionId: string;
    exerciseId: string;
    orderPerformed: number;
    setsCompleted: number;
    repsPerformed: number[];
    weightUsedKg: number[];
    restTimeSeconds?: number[];
    notes?: string;
    skipped?: boolean;
  }): Promise<string> {
    const logId = crypto.randomUUID();
    const { sessionId, exerciseId, orderPerformed, setsCompleted, repsPerformed, weightUsedKg, restTimeSeconds, notes, skipped = false } = params;

    if (this.shouldUseCloudStorage()) {
      // Guardar en Supabase
      if (!supabase) throw new Error('Supabase client not initialized');
      
      const { error } = await supabase.from('workout_exercise_logs').insert({
        id: logId,
        session_id: sessionId,
        exercise_id: exerciseId,
        order_performed: orderPerformed,
        sets_completed: setsCompleted,
        reps_performed: repsPerformed,
        weight_used_kg: weightUsedKg,
        rest_time_seconds: restTimeSeconds,
        notes,
        skipped,
      });

      if (error) throw error;
    } else {
      // Guardar localmente en SQLite
      await sqliteService.saveExerciseLog({
        id: logId,
        session_id: sessionId,
        exercise_id: exerciseId,
        order_performed: orderPerformed,
        sets_completed: setsCompleted,
        reps_performed: JSON.stringify(repsPerformed),
        weight_used_kg: JSON.stringify(weightUsedKg),
        rest_time_seconds: restTimeSeconds ? JSON.stringify(restTimeSeconds) : undefined,
        notes,
        skipped,
        synced: false,
      });
    }

    return logId;
  }

  /**
   * Guarda progreso de seguimiento (local o nube según plan)
   */
  async saveProgressTracking(
    recordDate: string,
    metricType: string,
    value: number,
    unit: string,
    notes?: string
  ): Promise<string> {
    const trackingId = crypto.randomUUID();

    if (this.shouldUseCloudStorage()) {
      // Guardar en Supabase
      if (!supabase) throw new Error('Supabase client not initialized');
      
      const { error } = await supabase.from('progress_tracking').insert({
        id: trackingId,
        user_id: this.userId,
        record_date: recordDate,
        metric_type: metricType,
        value,
        unit,
        notes,
      });

      if (error) throw error;
    } else {
      // Guardar localmente en SQLite
      await sqliteService.saveProgressTracking({
        id: trackingId,
        record_date: recordDate,
        metric_type: metricType,
        value,
        unit,
        notes,
        synced: false,
      });
    }

    return trackingId;
  }

  /**
   * Obtiene sesiones de entrenamiento (desde nube o local según plan)
   */
  async getWorkoutSessions(limit = 50): Promise<unknown[]> {
    if (this.shouldUseCloudStorage()) {
      if (!supabase) throw new Error('Supabase client not initialized');
      
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', this.userId)
        .order('session_date', { ascending: false })
        .order('start_time', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } else {
      return await sqliteService.getWorkoutSessions(limit);
    }
  }

  /**
   * Obtiene logs de ejercicios de una sesión específica
   */
  async getExerciseLogsBySession(sessionId: string): Promise<unknown[]> {
    if (this.shouldUseCloudStorage()) {
      if (!supabase) throw new Error('Supabase client not initialized');
      
      const { data, error } = await supabase
        .from('workout_exercise_logs')
        .select('*')
        .eq('session_id', sessionId)
        .order('order_performed');

      if (error) throw error;
      return data || [];
    } else {
      const logs = await sqliteService.getExerciseLogsBySession(sessionId);
      // Parsear JSON arrays
      return logs.map((log) => ({
        ...log,
        reps_performed: JSON.parse(log.reps_performed),
        weight_used_kg: JSON.parse(log.weight_used_kg),
        rest_time_seconds: log.rest_time_seconds ? JSON.parse(log.rest_time_seconds) : undefined,
      }));
    }
  }

  /**
   * Obtiene progreso de métricas
   */
  async getProgressTracking(metricType?: string, limit = 100): Promise<unknown[]> {
    if (this.shouldUseCloudStorage()) {
      if (!supabase) throw new Error('Supabase client not initialized');
      
      let query = supabase
        .from('progress_tracking')
        .select('*')
        .eq('user_id', this.userId)
        .order('record_date', { ascending: false })
        .limit(limit);

      if (metricType) {
        query = query.eq('metric_type', metricType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } else {
      return await sqliteService.getProgressTracking(metricType, limit);
    }
  }

  /**
   * Sincroniza datos locales con Supabase cuando usuario mejora su plan
   */
  async syncLocalDataToCloud(): Promise<{
    synced: number;
    failed: number;
    errors: Error[];
  }> {
    if (!this.shouldUseCloudStorage()) {
      throw new Error('Cloud storage not available for current subscription plan');
    }

    let synced = 0;
    let failed = 0;
    const errors: Error[] = [];

    try {
      if (!supabase) throw new Error('Supabase client not initialized');
      
      // Sincronizar sesiones de entrenamiento
      const unsyncedSessions = await sqliteService.getUnsyncedWorkoutSessions();
      for (const session of unsyncedSessions) {
        try {
          const { error } = await supabase.from('workout_sessions').insert({
            id: session.id,
            user_id: this.userId,
            routine_id: session.routine_id,
            session_date: session.session_date,
            start_time: session.start_time,
            end_time: session.end_time,
            notes: session.notes,
            rating: session.rating,
          });

          if (error) throw error;
          await sqliteService.markWorkoutSessionAsSynced(session.id);
          synced++;
        } catch (error) {
          failed++;
          errors.push(error as Error);
        }
      }

      // Sincronizar logs de ejercicios
      const unsyncedLogs = await sqliteService.getUnsyncedExerciseLogs();
      for (const log of unsyncedLogs) {
        try {
          const { error } = await supabase.from('workout_exercise_logs').insert({
            id: log.id,
            session_id: log.session_id,
            exercise_id: log.exercise_id,
            order_performed: log.order_performed,
            sets_completed: log.sets_completed,
            reps_performed: JSON.parse(log.reps_performed),
            weight_used_kg: JSON.parse(log.weight_used_kg),
            rest_time_seconds: log.rest_time_seconds ? JSON.parse(log.rest_time_seconds) : null,
            notes: log.notes,
            skipped: log.skipped,
          });

          if (error) throw error;
          await sqliteService.markExerciseLogAsSynced(log.id);
          synced++;
        } catch (error) {
          failed++;
          errors.push(error as Error);
        }
      }

      // Sincronizar progreso
      const unsyncedProgress = await sqliteService.getUnsyncedProgressTracking();
      for (const progress of unsyncedProgress) {
        try {
          const { error } = await supabase.from('progress_tracking').insert({
            id: progress.id,
            user_id: this.userId,
            record_date: progress.record_date,
            metric_type: progress.metric_type,
            value: progress.value,
            unit: progress.unit,
            notes: progress.notes,
          });

          if (error) throw error;
          await sqliteService.markProgressTrackingAsSynced(progress.id);
          synced++;
        } catch (error) {
          failed++;
          errors.push(error as Error);
        }
      }

      return { synced, failed, errors };
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }

  /**
   * Obtiene el estado de sincronización
   */
  async getSyncStatus(): Promise<SyncStatus> {
    const stats = await sqliteService.getStorageStats();

    return {
      isOnline: navigator.onLine,
      canSyncToCloud: this.shouldUseCloudStorage(),
      localStorageEnabled: this.currentPlan === 'free',
      unsynced: stats.unsynced,
    };
  }

  /**
   * Limpia datos locales (solo para usuarios free)
   */
  async clearLocalData(): Promise<void> {
    if (this.currentPlan === 'free') {
      await sqliteService.clearAllData();
    }
  }

  getCurrentPlan(): SubscriptionPlan {
    return this.currentPlan;
  }

  async refreshSubscription(): Promise<void> {
    await this.loadUserSubscription();
  }
}

export const dataSyncService = new DataSyncService();
