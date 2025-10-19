import { vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

// Mock Auth implementation
const mockAuth = {
  getSession: vi.fn(),
  getUser: vi.fn(),
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signInWithOAuth: vi.fn(),
  signOut: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
  onAuthStateChange: vi.fn(() => ({
    data: { subscription: { unsubscribe: vi.fn() } },
  })),
};

// Mock From implementation
const createMockFrom = () => ({
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  neq: vi.fn().mockReturnThis(),
  gt: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lt: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  like: vi.fn().mockReturnThis(),
  ilike: vi.fn().mockReturnThis(),
  is: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  contains: vi.fn().mockReturnThis(),
  containedBy: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  match: vi.fn().mockReturnThis(),
  not: vi.fn().mockReturnThis(),
  or: vi.fn().mockReturnThis(),
  filter: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  single: vi.fn(),
  maybeSingle: vi.fn(),
});

// Mock Supabase client
export const mockSupabaseClient: Partial<SupabaseClient> = {
  auth: mockAuth as any,
  from: vi.fn(() => createMockFrom()) as any,
};

// Helper functions to control mock behavior
export const mockAuthHelpers = {
  setSession: (session: any) => {
    mockAuth.getSession.mockResolvedValue({ data: { session }, error: null });
  },
  setUser: (user: any) => {
    mockAuth.getUser.mockResolvedValue({ data: { user }, error: null });
  },
  setSignUpSuccess: () => {
    mockAuth.signUp.mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null });
  },
  setSignUpError: (error: string) => {
    mockAuth.signUp.mockResolvedValue({ data: { user: null }, error: { message: error } });
  },
  setSignInSuccess: (user: any) => {
    mockAuth.signInWithPassword.mockResolvedValue({ data: { user, session: { user } }, error: null });
  },
  setSignInError: (error: string) => {
    mockAuth.signInWithPassword.mockResolvedValue({ data: { user: null, session: null }, error: { message: error } });
  },
  setSignOutSuccess: () => {
    mockAuth.signOut.mockResolvedValue({ error: null });
  },
  setResetPasswordSuccess: () => {
    mockAuth.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });
  },
  reset: () => {
    Object.values(mockAuth).forEach((fn) => {
      if (typeof fn === 'function' && 'mockReset' in fn) {
        fn.mockReset();
      }
    });
  },
};

export default mockSupabaseClient;
