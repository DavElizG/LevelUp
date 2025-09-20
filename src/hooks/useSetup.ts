import { useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';

export type FitnessGoal = 'lose_weight' | 'maintain' | 'gain_muscle' | 'improve_endurance';

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
        !setupData.height || !setupData.goal || !setupData.workoutType) {
      setError('Todos los campos son requeridos');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // If Supabase is not configured, just simulate saving locally
      if (!isSupabaseConfigured || !supabase) {
        const profileData = {
          user_id: userId,
          gender: setupData.gender,
          age: setupData.age,
          weight: setupData.weight,
          height: setupData.height,
          fitness_goal: setupData.goal,
          workout_preference: setupData.workoutType,
          updated_at: new Date().toISOString()
        };
        
  // Supabase not configured. Saving profile locally for development only.
        // Save to localStorage
        localStorage.setItem(`user_profile_${userId}`, JSON.stringify(profileData));
        
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true;
      }

      const profileData = {
        user_id: userId,
        gender: setupData.gender,
        age: setupData.age,
        weight: setupData.weight,
        height: setupData.height,
        fitness_goal: setupData.goal,
        workout_preference: setupData.workoutType,
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
      // If Supabase is not configured, simulate loading from local storage
      if (!isSupabaseConfigured || !supabase) {
  // Supabase not configured. Loading profile from local storage for development only.
        // Try to load from localStorage
        const savedProfile = localStorage.getItem(`user_profile_${userId}`);
        if (savedProfile) {
          const data = JSON.parse(savedProfile);
          setSetupData({
            gender: data.gender,
            age: data.age,
            weight: data.weight,
            height: data.height,
            goal: data.fitness_goal,
            workoutType: data.workout_preference
          });
          return true;
        }
        return false;
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
        setSetupData({
          gender: data.gender,
          age: data.age,
          weight: data.weight,
          height: data.height,
          goal: data.fitness_goal,
          workoutType: data.workout_preference
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
        return !!setupData.workoutType;
      default:
        return false;
    }
  }, [setupData]);

  const isSetupComplete = useCallback((): boolean => {
    return !!(setupData.gender && setupData.age && setupData.weight && 
             setupData.height && setupData.goal && setupData.workoutType);
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