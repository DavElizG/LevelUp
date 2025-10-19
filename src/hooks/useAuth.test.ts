import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';
import * as supabaseModule from '../lib/supabase';

// Mock the supabase module
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      signInWithOAuth: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      resend: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
}));

describe('useAuth', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: {},
    app_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default: no session
    (supabaseModule.supabase?.auth.getSession as any).mockResolvedValue({
      data: { session: null },
      error: null,
    });
  });

  describe('initialization', () => {
    it('should initialize with loading state', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.loading).toBe(true);
      expect(result.current.user).toBe(null);
      expect(result.current.error).toBe(null);
    });

    it('should load user session on mount', async () => {
      const mockSession = { user: mockUser };
      (supabaseModule.supabase?.auth.getSession as any).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.error).toBe(null);
    });

    it('should handle session error on mount', async () => {
      const sessionError = new Error('Session error');
      (supabaseModule.supabase?.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: sessionError,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBe(null);
      expect(result.current.error).toBe('Session error');
    });
  });

  describe('signIn', () => {
    it('should sign in successfully', async () => {
      (supabaseModule.supabase?.auth.signInWithPassword as any).mockResolvedValue({
        data: { user: mockUser, session: { user: mockUser } },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const response = await result.current.signIn('test@example.com', 'password123');

      expect(response.success).toBe(true);
      expect(supabaseModule.supabase?.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle sign in error', async () => {
      const signInError = new Error('Invalid credentials');
      (supabaseModule.supabase?.auth.signInWithPassword as any).mockResolvedValue({
        data: { user: null, session: null },
        error: signInError,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const response = await result.current.signIn('test@example.com', 'wrongpassword');

      expect(response.success).toBe(false);
      expect(response.error).toBe('Invalid credentials');
    });
  });

  describe('signUp', () => {
    it('should sign up successfully', async () => {
      (supabaseModule.supabase?.auth.signUp as any).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const response = await result.current.signUp(
        'newuser@example.com',
        'password123',
        'NewUser'
      );

      expect(response.success).toBe(true);
      expect(supabaseModule.supabase?.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123',
        options: {
          data: {
            username: 'NewUser',
            full_name: 'NewUser',
          },
        },
      });
    });

    it('should handle sign up error', async () => {
      const signUpError = new Error('Email already registered');
      (supabaseModule.supabase?.auth.signUp as any).mockResolvedValue({
        data: { user: null },
        error: signUpError,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const response = await result.current.signUp(
        'existing@example.com',
        'password123',
        'User'
      );

      expect(response.success).toBe(false);
      expect(response.error).toBe('Email already registered');
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      (supabaseModule.supabase?.auth.signOut as any).mockResolvedValue({
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const response = await result.current.signOut();

      expect(response.success).toBe(true);
      expect(supabaseModule.supabase?.auth.signOut).toHaveBeenCalled();
    });

    it('should handle sign out error', async () => {
      const signOutError = new Error('Sign out failed');
      (supabaseModule.supabase?.auth.signOut as any).mockResolvedValue({
        error: signOutError,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const response = await result.current.signOut();

      expect(response.success).toBe(false);
      expect(response.error).toBe('Sign out failed');
    });
  });

  describe('resetPassword', () => {
    it('should send reset password email successfully', async () => {
      (supabaseModule.supabase?.auth.resetPasswordForEmail as any).mockResolvedValue({
        data: {},
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const response = await result.current.resetPassword('test@example.com');

      expect(response.success).toBe(true);
      expect(supabaseModule.supabase?.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({
          redirectTo: expect.stringContaining('/auth/reset-password'),
        })
      );
    });

    it('should handle reset password error', async () => {
      const resetError = new Error('Email not found');
      (supabaseModule.supabase?.auth.resetPasswordForEmail as any).mockResolvedValue({
        data: null,
        error: resetError,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const response = await result.current.resetPassword('nonexistent@example.com');

      expect(response.success).toBe(false);
      expect(response.error).toBe('Email not found');
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      (supabaseModule.supabase?.auth.updateUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const response = await result.current.updatePassword('newpassword123');

      expect(response.success).toBe(true);
      expect(supabaseModule.supabase?.auth.updateUser).toHaveBeenCalledWith({
        password: 'newpassword123',
      });
    });

    it('should handle update password error', async () => {
      const updateError = new Error('Password too weak');
      (supabaseModule.supabase?.auth.updateUser as any).mockResolvedValue({
        data: null,
        error: updateError,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const response = await result.current.updatePassword('weak');

      expect(response.success).toBe(false);
      expect(response.error).toBe('Password too weak');
    });
  });
});
