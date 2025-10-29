import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

/**
 * Secure Storage utility for managing authentication tokens
 * Uses Capacitor Preferences on mobile and sessionStorage on web
 */

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'supabase_access_token',
  REFRESH_TOKEN: 'supabase_refresh_token',
  SESSION_EXPIRY: 'supabase_session_expiry',
  USER_ID: 'supabase_user_id'
} as const;

const isNativePlatform = Capacitor.isNativePlatform();

/**
 * Store a value securely
 */
export const setSecureItem = async (key: string, value: string): Promise<void> => {
  try {
    if (isNativePlatform) {
      await Preferences.set({ key, value });
    } else {
      sessionStorage.setItem(key, value);
    }
  } catch (error) {
    console.error(`Error storing ${key}:`, error);
    throw new Error(`Failed to store ${key}`);
  }
};

/**
 * Retrieve a value securely
 */
export const getSecureItem = async (key: string): Promise<string | null> => {
  try {
    if (isNativePlatform) {
      const { value } = await Preferences.get({ key });
      return value;
    } else {
      return sessionStorage.getItem(key);
    }
  } catch (error) {
    console.error(`Error retrieving ${key}:`, error);
    return null;
  }
};

/**
 * Remove a value securely
 */
export const removeSecureItem = async (key: string): Promise<void> => {
  try {
    if (isNativePlatform) {
      await Preferences.remove({ key });
    } else {
      sessionStorage.removeItem(key);
    }
  } catch (error) {
    console.error(`Error removing ${key}:`, error);
    throw new Error(`Failed to remove ${key}`);
  }
};

/**
 * Clear all secure storage
 */
export const clearSecureStorage = async (): Promise<void> => {
  try {
    if (isNativePlatform) {
      await Preferences.clear();
    } else {
      sessionStorage.clear();
    }
  } catch (error) {
    console.error('Error clearing storage:', error);
    throw new Error('Failed to clear storage');
  }
};

/**
 * Store authentication session data
 */
export const storeAuthSession = async (
  accessToken: string,
  refreshToken: string,
  expiresAt: number,
  userId: string
): Promise<void> => {
  await Promise.all([
    setSecureItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
    setSecureItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
    setSecureItem(STORAGE_KEYS.SESSION_EXPIRY, expiresAt.toString()),
    setSecureItem(STORAGE_KEYS.USER_ID, userId)
  ]);
};

/**
 * Retrieve authentication session data
 */
export const getAuthSession = async (): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  userId: string | null;
}> => {
  const [accessToken, refreshToken, expiryStr, userId] = await Promise.all([
    getSecureItem(STORAGE_KEYS.ACCESS_TOKEN),
    getSecureItem(STORAGE_KEYS.REFRESH_TOKEN),
    getSecureItem(STORAGE_KEYS.SESSION_EXPIRY),
    getSecureItem(STORAGE_KEYS.USER_ID)
  ]);

  return {
    accessToken,
    refreshToken,
    expiresAt: expiryStr ? parseInt(expiryStr, 10) : null,
    userId
  };
};

/**
 * Clear authentication session data
 */
export const clearAuthSession = async (): Promise<void> => {
  await Promise.all([
    removeSecureItem(STORAGE_KEYS.ACCESS_TOKEN),
    removeSecureItem(STORAGE_KEYS.REFRESH_TOKEN),
    removeSecureItem(STORAGE_KEYS.SESSION_EXPIRY),
    removeSecureItem(STORAGE_KEYS.USER_ID)
  ]);
};

/**
 * Check if session is expired
 */
export const isSessionExpired = async (): Promise<boolean> => {
  const expiryStr = await getSecureItem(STORAGE_KEYS.SESSION_EXPIRY);
  if (!expiryStr) return true;
  
  const expiresAt = parseInt(expiryStr, 10);
  const now = Date.now();
  
  // Add 60 second buffer for clock skew
  return now >= (expiresAt - 60000);
};

/**
 * Validate if all required session data exists
 */
export const hasCompleteSession = async (): Promise<boolean> => {
  const session = await getAuthSession();
  return !!(
    session.accessToken &&
    session.refreshToken &&
    session.expiresAt &&
    session.userId
  );
};
