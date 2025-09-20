import { createClient } from '@supabase/supabase-js';
import { config } from '../../../app/config/env';
import type { 
  AuthService, 
  LoginCredentials, 
  RegisterData, 
  ApiResponse, 
  User, 
  AuthTokens 
} from '../../types/index.ts';

// Initialize Supabase client
export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

// Supabase Auth Service Implementation
export class SupabaseAuthService implements AuthService {
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return {
          success: false,
          data: null,
          error: error.message,
        };
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.name || data.user.email!,
        avatar: data.user.user_metadata?.avatar_url,
        role: data.user.user_metadata?.role || 'user',
        createdAt: data.user.created_at,
        updatedAt: data.user.updated_at || data.user.created_at,
      };

      const tokens: AuthTokens = {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at!,
      };

      return {
        success: true,
        data: { user, tokens },
        message: 'Login successful',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }

  async register(data: RegisterData): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
          },
        },
      });

      if (error) {
        return {
          success: false,
          data: null,
          error: error.message,
        };
      }

      if (!authData.session || !authData.user) {
        return {
          success: true,
          data: null,
          message: 'Please check your email to confirm your account',
        };
      }

      const user: User = {
        id: authData.user.id,
        email: authData.user.email!,
        name: data.name,
        role: 'user',
        createdAt: authData.user.created_at,
        updatedAt: authData.user.updated_at || authData.user.created_at,
      };

      const tokens: AuthTokens = {
        accessToken: authData.session.access_token,
        refreshToken: authData.session.refresh_token,
        expiresAt: authData.session.expires_at!,
      };

      return {
        success: true,
        data: { user, tokens },
        message: 'Registration successful',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  }

  async logout(): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return {
          success: false,
          data: null,
          error: error.message,
        };
      }

      return {
        success: true,
        data: null,
        message: 'Logout successful',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Logout failed',
      };
    }
  }

  async refreshToken(): Promise<ApiResponse<AuthTokens>> {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        return {
          success: false,
          data: null,
          error: error.message,
        };
      }

      const tokens: AuthTokens = {
        accessToken: data.session!.access_token,
        refreshToken: data.session!.refresh_token,
        expiresAt: data.session!.expires_at!,
      };

      return {
        success: true,
        data: tokens,
        message: 'Token refreshed',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Token refresh failed',
      };
    }
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        return {
          success: false,
          data: null,
          error: error.message,
        };
      }

      if (!data.user) {
        return {
          success: false,
          data: null,
          error: 'No user found',
        };
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.name || data.user.email!,
        avatar: data.user.user_metadata?.avatar_url,
        role: data.user.user_metadata?.role || 'user',
        createdAt: data.user.created_at,
        updatedAt: data.user.updated_at || data.user.created_at,
      };

      return {
        success: true,
        data: user,
        message: 'User retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to get user',
      };
    }
  }
}

// Export configured Supabase auth service
export const supabaseAuth = new SupabaseAuthService();