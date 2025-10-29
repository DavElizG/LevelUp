import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface WeeklyStats {
  workouts: number;
  calories: number;
  activeMinutes: number;
  streak: number;
}

export interface WeightProgress {
  date: string;
  weight: number;
}

export interface WeeklyWorkouts {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export interface PersonalRecord {
  exercise: string;
  weight: number;
  date: string;
  improvement: number;
}

export interface ProgressData {
  weeklyStats: WeeklyStats;
  weightProgress: WeightProgress[];
  weeklyWorkouts: WeeklyWorkouts;
  personalRecords: PersonalRecord[];
  initialWeight: number;
  currentWeight: number;
  targetWeight: number;
}

export const useProgress = (userId?: string) => {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgressData = async () => {
      if (!userId || !isSupabaseConfigured || !supabase) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get current date and date ranges
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
        endOfWeek.setHours(23, 59, 59, 999);

        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(today.getMonth() - 6);

        // Fetch weekly workout sessions
        const { data: sessions, error: sessionsError } = await supabase
          .from('workout_sessions')
          .select('session_date, start_time, end_time')
          .eq('user_id', userId)
          .gte('session_date', startOfWeek.toISOString().split('T')[0])
          .lte('session_date', endOfWeek.toISOString().split('T')[0]);

        if (sessionsError) throw sessionsError;

        // Calculate weekly stats
        const workoutCount = sessions?.length || 0;
        const totalMinutes = sessions?.reduce((sum, session) => {
          if (session.start_time && session.end_time) {
            const start = new Date(session.start_time);
            const end = new Date(session.end_time);
            return sum + Math.round((end.getTime() - start.getTime()) / 60000);
          }
          return sum;
        }, 0) || 0;

        // Calculate workout frequency by day
        const workoutsByDay: WeeklyWorkouts = {
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
          saturday: false,
          sunday: false,
        };

        sessions?.forEach(session => {
          const date = new Date(session.session_date);
          const dayOfWeek = date.getDay();
          const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          const dayName = days[dayOfWeek] as keyof WeeklyWorkouts;
          workoutsByDay[dayName] = true;
        });

        // Fetch weekly calories
        const { data: meals, error: mealsError } = await supabase
          .from('meal_logs')
          .select('calories')
          .eq('user_id', userId)
          .gte('logged_at', startOfWeek.toISOString())
          .lte('logged_at', endOfWeek.toISOString());

        if (mealsError) throw mealsError;

        const weeklyCalories = meals?.reduce((sum, meal) => sum + (meal.calories || 0), 0) || 0;

        // Calculate streak (consecutive days with workouts)
        const { data: recentSessions, error: recentError} = await supabase
          .from('workout_sessions')
          .select('session_date')
          .eq('user_id', userId)
          .order('session_date', { ascending: false })
          .limit(30);

        if (recentError) throw recentError;

        let streak = 0;
        const checkDate = new Date(today);
        checkDate.setHours(0, 0, 0, 0);

        const sessionDates = new Set(
          recentSessions?.map(s => new Date(s.session_date).toISOString().split('T')[0]) || []
        );

        while (sessionDates.has(checkDate.toISOString().split('T')[0])) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        }

        // Fetch weight progress (last 6 months)
        const { data: weightData, error: weightError } = await supabase
          .from('progress_tracking')
          .select('record_date, value')
          .eq('user_id', userId)
          .eq('metric_type', 'weight')
          .gte('record_date', sixMonthsAgo.toISOString().split('T')[0])
          .order('record_date', { ascending: true });

        if (weightError) throw weightError;

        const weightProgress: WeightProgress[] = weightData?.map(w => ({
          date: w.record_date,
          weight: Number(w.value),
        })) || [];

        // Get user profile for initial and target weight
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('current_weight_kg, target_weight_kg')
          .eq('user_id', userId)
          .single();

        if (profileError) throw profileError;

        const initialWeight = weightProgress[0]?.weight || profile?.current_weight_kg || 0;
        const currentWeight = profile?.current_weight_kg || 0;
        const targetWeight = profile?.target_weight_kg || 0;

        // Mock personal records for now (would calculate from actual exercise logs in future)
        const mockRecords: PersonalRecord[] = [
          { exercise: 'Press de banca', weight: 80, date: '2025-10-25', improvement: 5 },
          { exercise: 'Sentadillas', weight: 100, date: '2025-10-21', improvement: 10 },
          { exercise: 'Peso muerto', weight: 120, date: '2025-10-14', improvement: 15 },
        ];

        setProgressData({
          weeklyStats: {
            workouts: workoutCount,
            calories: Math.round(weeklyCalories),
            activeMinutes: totalMinutes,
            streak,
          },
          weightProgress,
          weeklyWorkouts: workoutsByDay,
          personalRecords: mockRecords,
          initialWeight,
          currentWeight,
          targetWeight,
        });
      } catch (err) {
        console.error('Error fetching progress data:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar datos de progreso');
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [userId]);

  return { progressData, loading, error };
};
