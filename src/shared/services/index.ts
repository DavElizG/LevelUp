// Main service adapter (recommended for most use cases)
export { serviceAdapter } from './adapters/service-adapter';

// Individual services for direct access if needed
export { supabaseAuth, supabase } from './supabase/auth';
export { supabaseWorkoutService, supabaseDietService } from './supabase/index.ts';
export { aiService } from './ai/microservice';
export { HttpClient } from './api/http-client';

// Service adapter exports
export {
  authService,
  workoutService,
  dietService,
  ServiceAdapter
} from './adapters/service-adapter';

// Re-export all types for convenience
export type * from '../types/index.ts';