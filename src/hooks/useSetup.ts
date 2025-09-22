import { useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';

export type FitnessGoal = 'lose_weight' | 'maintain' | 'gain_weight' | 'gain_muscle' | 'improve_endurance';

export interface SetupData {
  gender?: 'male' | 'female';
  age?: number;
  weight?: number;
  height?: number;
  goal?: FitnessGoal;
  workoutType?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  lastname1: string;
  lastname2?: string;
  gender: 'male' | 'female';
  age: number;
  weight: number;
  height: number;
  fitness_goal: FitnessGoal;
  workout_preference: string;
  created_at: string;
  updated_at: string;
}

export const useSetup = () => {
  const [setupData, setSetupData] = useState<SetupData>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateSetupData = useCallback((data: Partial<SetupData>) => {
    setSetupData(prev => ({ ...prev, ...data }));
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < 6) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 6) {
      setCurrentStep(step);
    }
  }, []);

  const saveProfile = useCallback(async (userId: string): Promise<boolean> => {
    if (!setupData.gender || !setupData.age || !setupData.weight || 
        !setupData.height || !setupData.goal) {
      setError('Todos los campos son requeridos');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Ensure Supabase is configured
      if (!isSupabaseConfigured || !supabase) {
        throw new Error('Supabase not configured. Please check your environment variables.');
      }

      const profileData = {
        user_id: userId,
        name: '', // Will be updated later during profile completion
        lastname1: '', // Will be updated later during profile completion
        gender: setupData.gender,
        birth_date: new Date(new Date().getFullYear() - setupData.age!, 0, 1).toISOString().split('T')[0],
        height_cm: setupData.height,
        current_weight_kg: setupData.weight,
        fitness_goal: setupData.goal,
        workout_days_per_week: 3, // Default value
        preferred_workout_duration: 60, // Default value in minutes
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: upsertError } = await supabase
        .from('user_profiles')
        .upsert(profileData, {
          onConflict: 'user_id'
        });

      if (upsertError) {
        throw upsertError;
      }

      return true;
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err instanceof Error ? err.message : 'Error al guardar el perfil');
      return false;
    } finally {
      setLoading(false);
    }
  }, [setupData]);

  const loadExistingProfile = useCallback(async (userId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // Ensure Supabase is configured
      if (!isSupabaseConfigured || !supabase) {
        throw new Error('Supabase not configured. Please check your environment variables.');
      }

      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows found
        throw fetchError;
      }

      if (data) {
        // Calculate age from birth_date
        const birthDate = new Date(data.birth_date);
        const currentAge = new Date().getFullYear() - birthDate.getFullYear();
        
        setSetupData({
          gender: data.gender,
          age: currentAge,
          weight: data.current_weight_kg,
          height: data.height_cm,
          goal: data.fitness_goal
        });
        return true;
      }

      return false;
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar el perfil');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetSetup = useCallback(() => {
    setSetupData({});
    setCurrentStep(1);
    setError(null);
  }, []);

  const isStepComplete = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        return !!setupData.gender;
      case 2:
        return !!setupData.age;
      case 3:
        return !!setupData.weight;
      case 4:
        return !!setupData.height;
      case 5:
        return !!setupData.goal;
      case 6:
        return true; // Final step is always complete once reached
      default:
        return false;
    }
  }, [setupData]);

  const isSetupComplete = useCallback((): boolean => {
    return !!(setupData.gender && setupData.age && setupData.weight && 
             setupData.height && setupData.goal);
  }, [setupData]);

  return {
    setupData,
    currentStep,
    loading,
    error,
    updateSetupData,
    nextStep,
    prevStep,
    goToStep,
    saveProfile,
    loadExistingProfile,
    resetSetup,
    isStepComplete,
    isSetupComplete
  };
};