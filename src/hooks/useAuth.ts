import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { 
  storeAuthSession, 
  clearAuthSession
} from '../shared/utils/secureStorage';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    // Check if supabase is configured
    if (!supabase) {
      setAuthState({
        user: null,
        loading: false,
        error: 'Supabase not configured'
      });
      return;
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase!.auth.getSession();
        if (error) throw error;
        
        // Store session in secure storage if available
        if (session?.access_token && session?.refresh_token) {
          await storeAuthSession(
            session.access_token,
            session.refresh_token,
            session.expires_at ? session.expires_at * 1000 : Date.now() + 3600000,
            session.user.id
          );
        }
        
        setAuthState({
          user: session?.user || null,
          loading: false,
          error: null
        });
      } catch (error) {
        setAuthState({
          user: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Error getting session'
        });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase!.auth.onAuthStateChange(
      async (event, session) => {
        // Handle session storage based on event
        if (session?.access_token && session?.refresh_token) {
          await storeAuthSession(
            session.access_token,
            session.refresh_token,
            session.expires_at ? session.expires_at * 1000 : Date.now() + 3600000,
            session.user.id
          );
        } else if (event === 'SIGNED_OUT') {
          await clearAuthSession();
        }
        
        setAuthState({
          user: session?.user || null,
          loading: false,
          error: null
        });
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error signing in';
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      return { success: false, error: errorMessage };
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: username
          }
        }
      });

      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error signing up';
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      return { success: false, error: errorMessage };
    }
  };

  const signOut = async () => {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      // Clear secure storage first
      await clearAuthSession();
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error signing out';
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      return { success: false, error: errorMessage };
    }
  };

  const signInWithProvider = async (provider: 'google' | 'facebook' | 'twitter') => {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Error signing in with ${provider}`;
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      return { success: false, error: errorMessage };
    }
  };

  const resendConfirmation = async (email: string) => {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      
      setAuthState(prev => ({ ...prev, loading: false }));
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error resending confirmation email';
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (email: string) => {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
      
      setAuthState(prev => ({ ...prev, loading: false }));
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error sending reset password email';
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      return { success: false, error: errorMessage };
    }
  };

  const updatePassword = async (newPassword: string) => {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      // Verify user is authenticated first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No hay sesión activa. El token puede haber expirado.');
      }
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      
      setAuthState(prev => ({ ...prev, loading: false }));
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error updating password';
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      return { success: false, error: errorMessage };
    }
  };

  const verifyRecoveryToken = async (accessToken: string): Promise<{ success: boolean; error?: string }> => {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      // Set the session with the recovery token
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: '' // Recovery tokens don't need refresh token
      });

      if (error) throw error;
      
      if (!data.session) {
        throw new Error('Token inválido o expirado');
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error verifying token';
      return { success: false, error: errorMessage };
    }
  };

  const signOutAfterPasswordReset = async () => {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      // Clear secure storage
      await clearAuthSession();
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Force page reload to ensure clean state
      window.location.href = '/';
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error signing out';
      return { success: false, error: errorMessage };
    }
  };

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    signIn,
    signUp,
    signOut,
    signInWithProvider,
    resendConfirmation,
    resetPassword,
    updatePassword,
    verifyRecoveryToken,
    signOutAfterPasswordReset
  };
};