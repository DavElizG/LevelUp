import type { ApiResponse, BaseEntity, FitnessLevel } from './common.types.ts';

// Exercise (matches Supabase exercises table)
export interface Exercise extends BaseEntity {
  name: string;
  category: string;
  muscleGroups: string[];
  equipment?: string;
  difficultyLevel?: FitnessLevel;
  description?: string;
  instructions?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
}

// Workout Routine (matches Supabase workout_routines table)
export interface WorkoutRoutine extends BaseEntity {
  userId?: string;
  name: string;
  description?: string;
  goal?: string;
  difficultyLevel?: string;
  durationWeeks?: number;
  daysPerWeek?: number;
  generatedByAi?: boolean;
  aiPrompt?: string;
  aiModel?: string;
  isActive?: boolean;
  isPublic?: boolean;
  exercises?: RoutineExercise[];
}

// Routine Exercise (matches Supabase routine_exercises table)
export interface RoutineExercise extends BaseEntity {
  routineId: string;
  exerciseId: string;
  exercise?: Exercise;
  dayOfWeek?: number;
  orderInDay: number;
  sets: number;
  repsMin?: number;
  repsMax?: number;
  restSeconds?: number;
  weightKg?: number;
  notes?: string;
}

// Workout Session (matches Supabase workout_sessions table)
export interface WorkoutSession extends BaseEntity {
  userId: string;
  routineId: string;
  sessionDate: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  rating?: number;
  exerciseLogs?: WorkoutExerciseLog[];
}

// Workout Exercise Log (matches Supabase workout_exercise_logs table)
export interface WorkoutExerciseLog extends BaseEntity {
  sessionId: string;
  exerciseId: string;
  exercise?: Exercise;
  orderPerformed: number;
  setsCompleted: number;
  repsPerformed: number[];
  weightUsedKg: number[];
  restTimeSeconds?: number[];
  skipped: boolean;
  notes?: string;
}

// Estado de ejercicio durante ejecución de rutina
export interface ExerciseExecutionState {
  routineExerciseId: string;
  exercise: Exercise;
  totalSets: number;
  currentSet: number;
  repsMin?: number;
  repsMax?: number;
  restSeconds?: number;
  weightKg?: number;
  skipped: boolean;
  completed: boolean;
  repsPerformed: number[];
  weightUsedKg: number[];
  restTimeSeconds: number[];
}

// Estado de sesión de entrenamiento activa
export interface ActiveWorkoutSession {
  sessionId: string;
  routineId: string;
  routineName: string;
  startTime: string;
  exercises: ExerciseExecutionState[];
  currentExerciseIndex: number;
}

// Legacy workout interface for backward compatibility
export interface Workout extends BaseEntity {
  userId: string;
  name: string;
  description?: string;
  exercises: Exercise[];
}

// Create/Update DTOs
export type CreateWorkoutData = Omit<WorkoutRoutine, 'id' | 'createdAt' | 'updatedAt' | 'exercises'> & {
  exercises: Array<{
    exerciseId: string;
    dayOfWeek?: number;
    orderInDay: number;
    sets: number;
    repsMin?: number;
    repsMax?: number;
    restSeconds?: number;
    weightKg?: number;
    notes?: string;
  }>;
};
export type UpdateWorkoutData = Partial<CreateWorkoutData>;

export type CreateWorkoutSessionData = Omit<WorkoutSession, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateWorkoutSessionData = Partial<CreateWorkoutSessionData>;

export type CreateExerciseLogData = Omit<WorkoutExerciseLog, 'id' | 'createdAt' | 'updatedAt'>;

// Filtros de búsqueda de ejercicios
export interface ExerciseSearchFilters {
  query?: string;
  muscleGroup?: string;
  category?: string;
  difficulty?: FitnessLevel;
  limit?: number;
}

// Agrupación de ejercicios por día para UI
export interface WorkoutDay {
  dayNumber: number;
  exercises: RoutineExercise[];
}

// Estado del cronómetro de entrenamiento
export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished';

export interface WorkoutTimerState {
  status: TimerStatus;
  currentExerciseIndex: number;
  currentSet: number;
  elapsedSeconds: number;
  restTimeRemaining: number;
  isResting: boolean;
}

// Workout Service Contract
export interface WorkoutService {
  getWorkouts(): Promise<ApiResponse<WorkoutRoutine[]>>;
  getWorkout(id: string): Promise<ApiResponse<WorkoutRoutine>>;
  createWorkout(workout: CreateWorkoutData): Promise<ApiResponse<WorkoutRoutine>>;
  updateWorkout(id: string, workout: UpdateWorkoutData): Promise<ApiResponse<WorkoutRoutine>>;
  deleteWorkout(id: string): Promise<ApiResponse<void>>;
  generateAIWorkout(preferences: Record<string, unknown>): Promise<ApiResponse<WorkoutRoutine>>;
  getExercises(): Promise<ApiResponse<Exercise[]>>;
  searchExercises(filters: ExerciseSearchFilters): Promise<ApiResponse<Exercise[]>>;
  
  // Session management
  startWorkoutSession(routineId: string): Promise<ApiResponse<WorkoutSession>>;
  endWorkoutSession(sessionId: string, rating?: number, notes?: string): Promise<ApiResponse<WorkoutSession>>;
  logExercise(sessionId: string, exerciseLog: CreateExerciseLogData): Promise<ApiResponse<WorkoutExerciseLog>>;
  getWorkoutSessions(routineId?: string): Promise<ApiResponse<WorkoutSession[]>>;
  getSessionDetails(sessionId: string): Promise<ApiResponse<WorkoutSession>>;
  
  // Public and user routines
  getPublicWorkouts(): Promise<ApiResponse<WorkoutRoutine[]>>;
  getUserWorkouts(): Promise<ApiResponse<WorkoutRoutine[]>>;
  clonePublicWorkout(routineId: string): Promise<ApiResponse<WorkoutRoutine>>;
}