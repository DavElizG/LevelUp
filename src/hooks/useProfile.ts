import { useState, useCallback, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';

export interface UserProfile {
  id?: string;
  user_id: string;
  name: string;
  lastname1: string;
  lastname2?: string;
  gender: 'male' | 'female';
  birth_date: string;
  height_cm: number;
  current_weight_kg: number;
  fitness_goal: 'lose_weight' | 'maintain' | 'gain_weight' | 'gain_muscle' | 'improve_endurance';
  workout_days_per_week?: number;
  preferred_workout_duration?: number;
  target_weight_kg?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProfileFormData {
  name: string;
  lastname1: string;
  lastname2: string;
  gender: 'male' | 'female' | '';
  age: number | '';
  height_cm: number | '';
  current_weight_kg: number | '';
  fitness_goal: 'lose_weight' | 'maintain' | 'gain_weight' | 'gain_muscle' | 'improve_endurance' | '';
}

export const useProfile = (userId?: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    lastname1: '',
    lastname2: '',
    gender: '',
    age: '',
    height_cm: '',
    current_weight_kg: '',
    fitness_goal: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadProfile = useCallback(async (userIdParam?: string) => {
    const targetUserId = userIdParam || userId;
    if (!targetUserId) return;

    setLoading(true);
    setError(null);

    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error('Supabase not configured');
      }

      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (data) {
        setProfile(data);
        
        // Calculate age from birth_date
        const birthDate = new Date(data.birth_date);
        const currentAge = new Date().getFullYear() - birthDate.getFullYear();
        
        setFormData({
          name: data.name || '',
          lastname1: data.lastname1 || '',
          lastname2: data.lastname2 || '',
          gender: data.gender || '',
          age: currentAge || '',
          height_cm: data.height_cm || '',
          current_weight_kg: data.current_weight_kg || '',
          fitness_goal: data.fitness_goal || ''
        });
      } else {
        setProfile(null);
        setFormData({
          name: '',
          lastname1: '',
          lastname2: '',
          gender: '',
          age: '',
          height_cm: '',
          current_weight_kg: '',
          fitness_goal: ''
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateFormData = useCallback((field: keyof ProfileFormData, value: ProfileFormData[keyof ProfileFormData]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const saveProfile = useCallback(async () => {
    if (!userId) {
      setError('Usuario no autenticado');
      return false;
    }

    // Validate required fields
    if (!formData.name || !formData.lastname1 || !formData.gender || 
        !formData.age || !formData.height_cm || !formData.current_weight_kg || 
        !formData.fitness_goal) {
      setError('Todos los campos obligatorios deben estar completos');
      return false;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error('Supabase not configured');
      }

      // Calculate birth_date from age
      const currentYear = new Date().getFullYear();
      const birthYear = currentYear - Number(formData.age);
      const birthDate = `${birthYear}-01-01`;

      const profileData = {
        user_id: userId,
        name: formData.name,
        lastname1: formData.lastname1,
        lastname2: formData.lastname2 || null,
        gender: formData.gender as 'male' | 'female',
        birth_date: birthDate,
        height_cm: Number(formData.height_cm),
        current_weight_kg: Number(formData.current_weight_kg),
        fitness_goal: formData.fitness_goal as UserProfile['fitness_goal'],
        updated_at: new Date().toISOString()
      };

      const { data, error: upsertError } = await supabase
        .from('user_profiles')
        .upsert(profileData, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (upsertError) {
        throw upsertError;
      }

      if (data) {
        setProfile(data);
      }

      return true;
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err instanceof Error ? err.message : 'Error al guardar el perfil');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [userId, formData]);

  const resetForm = useCallback(() => {
    if (profile) {
      const birthDate = new Date(profile.birth_date);
      const currentAge = new Date().getFullYear() - birthDate.getFullYear();
      
      setFormData({
        name: profile.name || '',
        lastname1: profile.lastname1 || '',
        lastname2: profile.lastname2 || '',
        gender: profile.gender || '',
        age: currentAge || '',
        height_cm: profile.height_cm || '',
        current_weight_kg: profile.current_weight_kg || '',
        fitness_goal: profile.fitness_goal || ''
      });
    } else {
      setFormData({
        name: '',
        lastname1: '',
        lastname2: '',
        gender: '',
        age: '',
        height_cm: '',
        current_weight_kg: '',
        fitness_goal: ''
      });
    }
    setError(null);
  }, [profile]);

  // Load profile on mount when userId is available
  useEffect(() => {
    if (userId) {
      loadProfile(userId);
    }
  }, [userId, loadProfile]);

  return {
    profile,
    formData,
    loading,
    error,
    isSaving,
    updateFormData,
    saveProfile,
    loadProfile,
    resetForm
  };
};