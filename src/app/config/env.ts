// Environment configuration for LevelUp Gym App
export const config = {
  // Supabase Configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },

  // AI Microservice Configuration
  ai: {
    baseUrl: import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:3001/api',
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
if (typeof window !== 'undefined') {
  try {
    const suspectKeys: Record<string, string> = {
      VITE_OPENAI_API_KEY: String(import.meta.env.VITE_OPENAI_API_KEY ?? ''),
      VITE_GEMINI_API_KEY: String(import.meta.env.VITE_GEMINI_API_KEY ?? ''),
      VITE_AI_SERVICE_API_KEY: String(import.meta.env.VITE_AI_SERVICE_API_KEY ?? ''),
    };

    const hasSecret = Object.entries(suspectKeys).some(([, v]) => v && v.length > 0);
    if (hasSecret && config.app.isProduction === false) {
      // eslint-disable-next-line no-console
      console.warn('[env] WARNING: Found API keys in VITE_ variables. Ensure secrets are not exposed to the client.');
    }
  } catch (e) {
    // ignore in non-browser or build-time contexts
  }
}