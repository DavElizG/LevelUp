/**
 * Calculadora de Calorías Basada en Mifflin-St Jeor
 * 
 * Calcula el BMR (Tasa Metabólica Basal) y TDEE (Total Daily Energy Expenditure)
 * basándose en los datos del perfil del usuario.
 */

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type FitnessGoal = 'lose_weight' | 'maintain' | 'gain_weight' | 'gain_muscle' | 'improve_endurance';

/**
 * Factores de actividad física para cálculo de TDEE
 */
export const ACTIVITY_FACTORS = {
  sedentary: { factor: 1.2, label: 'Sedentario', description: 'Poco o ningún ejercicio' },
  light: { factor: 1.375, label: 'Ligero', description: 'Ejercicio ligero 1-3 días/semana' },
  moderate: { factor: 1.55, label: 'Moderado', description: 'Ejercicio moderado 3-5 días/semana' },
  active: { factor: 1.725, label: 'Activo', description: 'Ejercicio intenso 6-7 días/semana' },
  very_active: { factor: 1.9, label: 'Muy Activo', description: 'Ejercicio muy intenso o trabajo físico exigente' }
} as const;

/**
 * Ajustes de calorías según objetivo de fitness
 */
export const GOAL_ADJUSTMENTS = {
  lose_weight: { adjustment: -400, label: 'Bajar de Peso', description: 'Déficit calórico moderado' },
  maintain: { adjustment: 0, label: 'Mantener Peso', description: 'Calorías de mantenimiento' },
  gain_weight: { adjustment: 300, label: 'Subir de Peso', description: 'Superávit calórico moderado' },
  gain_muscle: { adjustment: 400, label: 'Ganar Músculo', description: 'Superávit calórico con enfoque en proteína' },
  improve_endurance: { adjustment: 200, label: 'Mejorar Resistencia', description: 'Ligero superávit para rendimiento' }
} as const;

export interface CalorieCalculationInput {
  gender: 'male' | 'female';
  age: number;
  weight_kg: number;
  height_cm: number;
  activityLevel: ActivityLevel;
  fitnessGoal: FitnessGoal;
}

export interface CalorieCalculationResult {
  bmr: number;                    // Tasa metabólica basal
  tdee: number;                   // Calorías totales diarias (mantenimiento)
  targetCalories: number;         // Calorías objetivo según meta
  adjustment: number;             // Ajuste aplicado (+/-)
  activityFactor: number;         // Factor de actividad usado
  macros: {
    protein_g: number;           // Proteína en gramos
    carbs_g: number;             // Carbohidratos en gramos
    fat_g: number;               // Grasas en gramos
  };
  breakdown: {
    protein_kcal: number;
    carbs_kcal: number;
    fat_kcal: number;
  };
}

/**
 * Calcula el BMR usando la ecuación de Mifflin-St Jeor
 * 
 * Hombres: BMR = (10 × peso en kg) + (6.25 × altura en cm) - (5 × edad) + 5
 * Mujeres: BMR = (10 × peso en kg) + (6.25 × altura en cm) - (5 × edad) - 161
 */
export function calculateBMR(
  gender: 'male' | 'female',
  age: number,
  weight_kg: number,
  height_cm: number
): number {
  const baseCalc = (10 * weight_kg) + (6.25 * height_cm) - (5 * age);
  
  if (gender === 'male') {
    return baseCalc + 5;
  } else {
    return baseCalc - 161;
  }
}

/**
 * Determina el nivel de actividad basándose en días de entrenamiento por semana
 */
export function getActivityLevelFromWorkoutDays(workoutDaysPerWeek: number): ActivityLevel {
  if (workoutDaysPerWeek === 0) return 'sedentary';
  if (workoutDaysPerWeek <= 3) return 'light';
  if (workoutDaysPerWeek <= 5) return 'moderate';
  if (workoutDaysPerWeek <= 6) return 'active';
  return 'very_active';
}

/**
 * Calcula las calorías totales diarias (TDEE) multiplicando BMR por factor de actividad
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const activityFactor = ACTIVITY_FACTORS[activityLevel].factor;
  return Math.round(bmr * activityFactor);
}

/**
 * Ajusta las calorías según el objetivo de fitness
 */
export function adjustCaloriesForGoal(tdee: number, fitnessGoal: FitnessGoal): number {
  const adjustment = GOAL_ADJUSTMENTS[fitnessGoal].adjustment;
  return Math.round(tdee + adjustment);
}

/**
 * Calcula la distribución de macronutrientes según el objetivo
 * 
 * Recomendaciones generales:
 * - Bajar peso: Alto proteína (30%), moderado carbs (40%), bajo grasa (30%)
 * - Mantener: Balanceado (25% proteína, 45% carbs, 30% grasa)
 * - Ganar músculo: Alto proteína (30%), moderado carbs (45%), moderado grasa (25%)
 * - Ganar peso: Balanceado (25% proteína, 50% carbs, 25% grasa)
 * - Resistencia: Bajo proteína (20%), alto carbs (55%), bajo grasa (25%)
 */
export function calculateMacros(
  targetCalories: number,
  fitnessGoal: FitnessGoal
): CalorieCalculationResult['macros'] & CalorieCalculationResult['breakdown'] {
  let proteinPercent: number;
  let carbsPercent: number;
  let fatPercent: number;

  switch (fitnessGoal) {
    case 'lose_weight':
      proteinPercent = 0.3;
      carbsPercent = 0.4;
      fatPercent = 0.3;
      break;
    case 'gain_muscle':
      proteinPercent = 0.3;
      carbsPercent = 0.45;
      fatPercent = 0.25;
      break;
    case 'gain_weight':
      proteinPercent = 0.25;
      carbsPercent = 0.5;
      fatPercent = 0.25;
      break;
    case 'improve_endurance':
      proteinPercent = 0.2;
      carbsPercent = 0.55;
      fatPercent = 0.25;
      break;
    case 'maintain':
    default:
      proteinPercent = 0.25;
      carbsPercent = 0.45;
      fatPercent = 0.3;
      break;
  }

  // Calcular calorías por macronutriente
  const protein_kcal = Math.round(targetCalories * proteinPercent);
  const carbs_kcal = Math.round(targetCalories * carbsPercent);
  const fat_kcal = Math.round(targetCalories * fatPercent);

  // Convertir a gramos (proteína: 4 kcal/g, carbs: 4 kcal/g, grasa: 9 kcal/g)
  const protein_g = Math.round(protein_kcal / 4);
  const carbs_g = Math.round(carbs_kcal / 4);
  const fat_g = Math.round(fat_kcal / 9);

  return {
    protein_g,
    carbs_g,
    fat_g,
    protein_kcal,
    carbs_kcal,
    fat_kcal
  };
}

/**
 * Función principal: Calcula todas las métricas calóricas y macros
 */
export function calculateDailyCalories(input: CalorieCalculationInput): CalorieCalculationResult {
  // 1. Calcular BMR (Tasa Metabólica Basal)
  const bmr = calculateBMR(input.gender, input.age, input.weight_kg, input.height_cm);

  // 2. Calcular TDEE (Calorías de mantenimiento)
  const tdee = calculateTDEE(bmr, input.activityLevel);

  // 3. Ajustar según objetivo
  const targetCalories = adjustCaloriesForGoal(tdee, input.fitnessGoal);

  // 4. Calcular macronutrientes
  const macrosData = calculateMacros(targetCalories, input.fitnessGoal);

  // 5. Retornar resultado completo
  return {
    bmr: Math.round(bmr),
    tdee,
    targetCalories,
    adjustment: GOAL_ADJUSTMENTS[input.fitnessGoal].adjustment,
    activityFactor: ACTIVITY_FACTORS[input.activityLevel].factor,
    macros: {
      protein_g: macrosData.protein_g,
      carbs_g: macrosData.carbs_g,
      fat_g: macrosData.fat_g
    },
    breakdown: {
      protein_kcal: macrosData.protein_kcal,
      carbs_kcal: macrosData.carbs_kcal,
      fat_kcal: macrosData.fat_kcal
    }
  };
}

/**
 * Función helper: Calcula las calorías usando datos del perfil del usuario
 */
export function calculateCaloriesFromProfile(profile: {
  gender: 'male' | 'female';
  birth_date: string;
  current_weight_kg: number;
  height_cm: number;
  fitness_goal: FitnessGoal;
  workout_days_per_week?: number;
}): CalorieCalculationResult {
  // Calcular edad desde birth_date
  const birthDate = new Date(profile.birth_date);
  const age = new Date().getFullYear() - birthDate.getFullYear();

  // Determinar nivel de actividad
  const activityLevel = getActivityLevelFromWorkoutDays(profile.workout_days_per_week || 0);

  return calculateDailyCalories({
    gender: profile.gender,
    age,
    weight_kg: profile.current_weight_kg,
    height_cm: profile.height_cm,
    activityLevel,
    fitnessGoal: profile.fitness_goal
  });
}

/**
 * Formatea los resultados en un texto legible
 */
export function formatCalorieResults(result: CalorieCalculationResult): string {
  let adjustmentIcon: string;
  if (result.adjustment > 0) {
    adjustmentIcon = '📈';
  } else if (result.adjustment < 0) {
    adjustmentIcon = '📉';
  } else {
    adjustmentIcon = '➡️';
  }
  
  const adjustmentSign = result.adjustment > 0 ? '+' : '';
  
  return `
🔥 Tu Plan Calórico Personalizado

📊 Metabolismo Basal (BMR): ${result.bmr} kcal/día
⚡ Calorías de Mantenimiento (TDEE): ${result.tdee} kcal/día
🎯 Calorías Objetivo: ${result.targetCalories} kcal/día
${adjustmentIcon} Ajuste: ${adjustmentSign}${result.adjustment} kcal

🍖 Macronutrientes Recomendados:
• Proteínas: ${result.macros.protein_g}g (${result.breakdown.protein_kcal} kcal)
• Carbohidratos: ${result.macros.carbs_g}g (${result.breakdown.carbs_kcal} kcal)
• Grasas: ${result.macros.fat_g}g (${result.breakdown.fat_kcal} kcal)
  `.trim();
}

/**
 * Verifica si el usuario ha consumido suficientes calorías para el día
 */
export function getCalorieProgress(consumedCalories: number, targetCalories: number): {
  percentage: number;
  remaining: number;
  status: 'under' | 'on_track' | 'over';
  message: string;
} {
  const percentage = Math.round((consumedCalories / targetCalories) * 100);
  const remaining = targetCalories - consumedCalories;

  let status: 'under' | 'on_track' | 'over';
  let message: string;

  if (percentage < 85) {
    status = 'under';
    message = `Te faltan ${remaining} kcal para alcanzar tu objetivo diario`;
  } else if (percentage <= 115) {
    status = 'on_track';
    message = 'Vas por buen camino con tu objetivo calórico';
  } else {
    status = 'over';
    message = `Has excedido tu objetivo por ${Math.abs(remaining)} kcal`;
  }

  return { percentage, remaining, status, message };
}
