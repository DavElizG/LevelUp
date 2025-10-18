import type { Exercise } from '../../../shared/types/workout.types';

export function calculateAutoRestTime(exercise: Exercise, sets: number, reps: number): number {
  // Cálculo inteligente basado en intensidad
  const category = exercise.category?.toLowerCase() || '';
  const muscleGroups = exercise.muscleGroups?.map(m => m.toLowerCase()) || [];
  const difficulty = exercise.difficultyLevel?.toLowerCase() || 'intermediate';

  // Ejercicios compuestos pesados necesitan más descanso
  const isCompound = 
    category.includes('strength') ||
    muscleGroups.includes('legs') ||
    muscleGroups.includes('back') ||
    muscleGroups.includes('chest');

  // Ejercicios de aislamiento necesitan menos descanso
  const isIsolation = 
    category.includes('isolation') ||
    muscleGroups.includes('arms') ||
    muscleGroups.includes('shoulders');

  // Cardio o core necesitan descanso mínimo
  const isCardioOrCore = 
    category.includes('cardio') ||
    muscleGroups.includes('core');

  // Base según tipo de ejercicio
  let baseRest = 60; // Default para intermedios
  
  if (isCompound) {
    baseRest = 90; // Compuestos: 90s base
  } else if (isIsolation) {
    baseRest = 45; // Aislamiento: 45s base
  } else if (isCardioOrCore) {
    baseRest = 30; // Cardio/Core: 30s base
  }

  // Ajuste por dificultad
  if (difficulty === 'advanced') {
    baseRest += 30; // Avanzados descansan más (mayor peso)
  } else if (difficulty === 'beginner') {
    baseRest -= 15; // Principiantes menos peso, menos descanso
  }

  // Ajuste por volumen (series altas = más fatiga)
  if (sets >= 5) {
    baseRest += 15;
  } else if (sets <= 2) {
    baseRest -= 10;
  }

  // Ajuste por reps (reps bajas = fuerza = más descanso)
  if (reps <= 5) {
    baseRest += 30; // Trabajo de fuerza
  } else if (reps >= 15) {
    baseRest -= 15; // Trabajo de resistencia
  }

  // Clamp entre 15 y 180 segundos
  return Math.max(15, Math.min(180, baseRest));
}

export function formatRestTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
}

export function getRestRecommendation(restSeconds: number): string {
  if (restSeconds <= 30) return 'Descanso corto - Alta intensidad';
  if (restSeconds <= 60) return 'Descanso moderado - Hipertrofia';
  if (restSeconds <= 90) return 'Descanso estándar - Fuerza';
  return 'Descanso largo - Fuerza máxima';
}
