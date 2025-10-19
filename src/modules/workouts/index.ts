// Hooks
export { useWorkouts, useExerciseSearch } from './hooks/useWorkouts';
export { useWorkoutTimer } from './hooks/useWorkoutTimer';
export { useWorkoutSession } from './hooks/useWorkoutSession';

// Components
export { CreateWorkoutFormNew } from './components/CreateWorkoutFormNew';
export { WorkoutDaySection } from './components/WorkoutDaySection';
export { WorkoutExerciseCard } from './components/WorkoutExerciseCard';
export { WorkoutTimerDisplay } from './components/WorkoutTimerDisplay';

// Legacy components (mantener para compatibilidad)
export { default as CreateWorkoutForm } from './components/CreateWorkoutForm';
export { default as WorkoutCard } from './components/WorkoutCard';

// Pages
export { WorkoutManagementPage } from './pages/WorkoutManagementPage';

// Services
export { default as workoutService } from './services/workoutService';
export { WorkoutSessionService } from './services/workoutSessionService';

// Utils
export { calculateAutoRestTime, formatRestTime, getRestRecommendation } from './utils/restCalculator';
