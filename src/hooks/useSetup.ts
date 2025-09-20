import { useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';

// --- Local storage encryption helpers (Web Crypto API) ---
// NOTE: This is intended to protect sensitive data in local development only.
// For production, manage keys securely (do NOT hardcode passphrases or persist keys in localStorage).
const DEV_ENCRYPTION_PASSPHRASE = 'levelup-dev-local-passphrase-change-me';

async function getCryptoKey(passphrase: string): Promise<CryptoKey | null> {
  if (!window?.crypto?.subtle) return null;
  const enc = new TextEncoder();
  const passBytes = enc.encode(passphrase);
  const hash = await window.crypto.subtle.digest('SHA-256', passBytes);
  return window.crypto.subtle.importKey(
    'raw',
    hash,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

function bufToBase64(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToBuf(base64: string) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function encryptText(plain: string): Promise<string> {
  const key = await getCryptoKey(DEV_ENCRYPTION_PASSPHRASE);
  if (!key) return plain; // fallback: return plaintext if Web Crypto not available
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const ct = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plain));
  // store iv + ciphertext as base64
  const ivB64 = bufToBase64(iv.buffer);
  const ctB64 = bufToBase64(ct);
  return ivB64 + ':' + ctB64;
}

async function decryptText(payload: string): Promise<string | null> {
  const key = await getCryptoKey(DEV_ENCRYPTION_PASSPHRASE);
  if (!key) return payload; // fallback: assume plaintext
  try {
    const [ivB64, ctB64] = payload.split(':');
    if (!ivB64 || !ctB64) return null;
    const ivBuf = base64ToBuf(ivB64);
    const ctBuf = base64ToBuf(ctB64);
    const plainBuf = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(ivBuf) }, key, ctBuf);
    const dec = new TextDecoder();
    return dec.decode(plainBuf);
  } catch (err) {
    console.warn('Failed to decrypt local profile data:', err);
    return null;
  }
}


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
        // Save encrypted profile to localStorage (dev only)
        try {
          const encryptedProfile = await encryptText(JSON.stringify(profileData));
          localStorage.setItem(`user_profile_${userId}`, encryptedProfile);
        } catch (e) {
          // Fallback: save plaintext if encryption fails
          console.warn('Failed to encrypt profile data, saving plaintext for dev only.', e);
          localStorage.setItem(`user_profile_${userId}`, JSON.stringify(profileData));
        }

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
          // Try to decrypt, fall back to plaintext
          let jsonStr: string | null = null;
          try {
            const dec = await decryptText(savedProfile);
            jsonStr = dec ?? savedProfile;
          } catch (e) {
            console.warn('Failed to decrypt saved profile, attempting plaintext parse.', e);
            jsonStr = savedProfile;
          }
          const data = JSON.parse(jsonStr);
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