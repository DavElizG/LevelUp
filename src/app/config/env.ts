// Validate required environment variables
const getRequiredEnv = (key: string): string => {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

// Environment configuration for LevelUp Gym App
export const config = {
  // Supabase Configuration
  supabase: {
    url: getRequiredEnv('VITE_SUPABASE_URL'),
    anonKey: getRequiredEnv('VITE_SUPABASE_ANON_KEY'),
  },

  // AI Microservice Configuration
  ai: {
    baseUrl: getRequiredEnv('VITE_AI_SERVICE_URL'),
    apiKey: import.meta.env.VITE_AI_SERVICE_API_KEY || '',
    openaiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    geminiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  },

  // App Configuration
  app: {
    env: import.meta.env.VITE_APP_ENV || 'development',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    isDevelopment: import.meta.env.VITE_APP_ENV === 'development',
    isProduction: import.meta.env.VITE_APP_ENV === 'production',
  },
} as const;

export type Config = typeof config;

// Runtime safety check (development): warn if potentially sensitive keys are present in Vite env
if (globalThis.window !== undefined) {
  try {
    const suspectKeys: Record<string, string> = {
      VITE_OPENAI_API_KEY: String(import.meta.env.VITE_OPENAI_API_KEY ?? ''),
      VITE_GEMINI_API_KEY: String(import.meta.env.VITE_GEMINI_API_KEY ?? ''),
      VITE_AI_SERVICE_API_KEY: String(import.meta.env.VITE_AI_SERVICE_API_KEY ?? ''),
    };

    const hasSecret = Object.entries(suspectKeys).some(([, v]) => v && v.length > 0);
    if (hasSecret && config.app.isProduction === false) {
      console.warn('[env] WARNING: Found API keys in VITE_ variables. Ensure secrets are not exposed to the client.');
    }
  } catch {
    // ignore in non-browser or build-time contexts
  }
}