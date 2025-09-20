// Re-export all types from their specific domain files
export * from './common.types.ts';
export * from './auth.types.ts';
export * from './workout.types.ts';
export * from './diet.types.ts';

// For backward compatibility, we keep the old api.ts imports working
// by re-exporting everything here as well