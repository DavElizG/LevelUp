import React from 'react';
import { Target, Dumbbell, Apple, TrendingUp, AlertCircle } from 'lucide-react';
import { cn, themeText } from '../../../shared/utils/themeUtils';
import type { PersonalizedInsights } from '../../../types/recommendation.types';

interface InsightsCardProps {
  insights: PersonalizedInsights | undefined;
  isLoading: boolean;
}

const InsightsCard: React.FC<InsightsCardProps> = ({ insights, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="space-y-4">
      {/* Status Overview */}
      <div className={cn(
        "rounded-2xl p-6 shadow-lg",
        "bg-white dark:bg-gray-800 high-contrast:bg-black",
        "border border-gray-200 dark:border-gray-700 high-contrast:border-gray-600"
      )}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className={cn("text-lg font-bold", themeText.primary)}>
            Tu Progreso
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className={cn(
            "rounded-xl p-4 text-center",
            "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
            "border border-blue-100 dark:border-blue-900"
          )}>
            <div className={cn("text-xs font-semibold mb-1", themeText.muted)}>
              Perfil
            </div>
            <div className={cn("text-2xl font-bold", insights.profileComplete ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400")}>
              {insights.profileComplete ? '✓' : '!'}
            </div>
            <div className={cn("text-xs mt-1", themeText.muted)}>
              {insights.profileComplete ? 'Completo' : 'Incompleto'}
            </div>
          </div>

          <div className={cn(
            "rounded-xl p-4 text-center",
            "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
            "border border-purple-100 dark:border-purple-900"
          )}>
            <div className={cn("text-xs font-semibold mb-1", themeText.muted)}>
              Rutina
            </div>
            <div className={cn("text-2xl font-bold", insights.hasWorkoutPlan ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-600")}>
              {insights.hasWorkoutPlan ? '💪' : '—'}
            </div>
            <div className={cn("text-xs mt-1", themeText.muted)}>
              {insights.hasWorkoutPlan ? 'Activa' : 'Sin rutina'}
            </div>
          </div>

          <div className={cn(
            "rounded-xl p-4 text-center",
            "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
            "border border-green-100 dark:border-green-900"
          )}>
            <div className={cn("text-xs font-semibold mb-1", themeText.muted)}>
              Dieta
            </div>
            <div className={cn("text-2xl font-bold", insights.hasDietPlan ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-600")}>
              {insights.hasDietPlan ? '🥗' : '—'}
            </div>
            <div className={cn("text-xs mt-1", themeText.muted)}>
              {insights.hasDietPlan ? 'Activa' : 'Sin dieta'}
            </div>
          </div>
        </div>
      </div>

      {/* Workout Insights */}
      {insights.workoutInsights && (
        <div className={cn(
          "rounded-2xl p-5 shadow-lg",
          "bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20",
          "border border-purple-100 dark:border-purple-900"
        )}>
          <div className="flex items-center gap-2 mb-3">
            <Dumbbell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h4 className={cn("text-sm font-bold", themeText.primary)}>
              Análisis de Entrenamiento
            </h4>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <div className={cn("text-xs", themeText.muted)}>Ejercicios</div>
              <div className={cn("text-lg font-bold", themeText.primary)}>
                {insights.workoutInsights.totalExercises}
              </div>
            </div>
            <div>
              <div className={cn("text-xs", themeText.muted)}>Calorías Est.</div>
              <div className={cn("text-lg font-bold", themeText.primary)}>
                {insights.workoutInsights.estimatedBurn}
              </div>
            </div>
          </div>

          <div className="mb-3">
            <div className={cn("text-xs mb-2", themeText.muted)}>Grupos Musculares</div>
            <div className="flex flex-wrap gap-2">
              {insights.workoutInsights.muscleGroups.map((group, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full text-xs font-medium"
                >
                  {group}
                </span>
              ))}
            </div>
          </div>

          <div className={cn(
            "p-3 rounded-xl bg-white/50 dark:bg-gray-800/50",
            "border border-purple-200 dark:border-purple-800"
          )}>
            <p className={cn("text-xs", themeText.secondary)}>
              💡 {insights.workoutInsights.recommendation}
            </p>
          </div>
        </div>
      )}

      {/* Diet Insights */}
      {insights.dietInsights && (
        <div className={cn(
          "rounded-2xl p-5 shadow-lg",
          "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
          "border border-green-100 dark:border-green-900"
        )}>
          <div className="flex items-center gap-2 mb-3">
            <Apple className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h4 className={cn("text-sm font-bold", themeText.primary)}>
              Análisis Nutricional
            </h4>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <div className={cn("text-xs", themeText.muted)}>Comidas/Día</div>
              <div className={cn("text-lg font-bold", themeText.primary)}>
                {insights.dietInsights.totalMeals}
              </div>
            </div>
            <div>
              <div className={cn("text-xs", themeText.muted)}>Calorías/Día</div>
              <div className={cn("text-lg font-bold", themeText.primary)}>
                {insights.dietInsights.dailyCalories}
              </div>
            </div>
          </div>

          <div className="mb-3">
            <div className={cn("text-xs mb-2", themeText.muted)}>Balance de Macros</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                  {insights.dietInsights.macroBalance.protein}g
                </div>
                <div className={cn("text-xs", themeText.muted)}>Proteína</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold">
                  {insights.dietInsights.macroBalance.carbs}g
                </div>
                <div className={cn("text-xs", themeText.muted)}>Carbos</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-orange-600 dark:text-orange-400 font-semibold">
                  {insights.dietInsights.macroBalance.fat}g
                </div>
                <div className={cn("text-xs", themeText.muted)}>Grasas</div>
              </div>
            </div>
          </div>

          <div className={cn(
            "p-3 rounded-xl bg-white/50 dark:bg-gray-800/50",
            "border border-green-200 dark:border-green-800"
          )}>
            <p className={cn("text-xs", themeText.secondary)}>
              💡 {insights.dietInsights.recommendation}
            </p>
          </div>
        </div>
      )}

      {/* General Tips */}
      {insights.generalTips && insights.generalTips.length > 0 && (
        <div className={cn(
          "rounded-2xl p-5 shadow-lg",
          "bg-white dark:bg-gray-800 high-contrast:bg-black",
          "border border-gray-200 dark:border-gray-700 high-contrast:border-gray-600"
        )}>
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <h4 className={cn("text-sm font-bold", themeText.primary)}>
              Consejos Generales
            </h4>
          </div>
          
          <ul className="space-y-2">
            {insights.generalTips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-orange-500 dark:text-orange-400 mt-0.5">•</span>
                <span className={cn("text-sm", themeText.secondary)}>
                  {tip}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Next Steps */}
      {insights.nextSteps && insights.nextSteps.length > 0 && (
        <div className={cn(
          "rounded-2xl p-5 shadow-lg",
          "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20",
          "border border-orange-100 dark:border-orange-900"
        )}>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <h4 className={cn("text-sm font-bold", themeText.primary)}>
              Próximos Pasos
            </h4>
          </div>
          
          <ul className="space-y-2">
            {insights.nextSteps.map((step, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-orange-500 dark:text-orange-400 font-bold mt-0.5">
                  {index + 1}.
                </span>
                <span className={cn("text-sm", themeText.secondary)}>
                  {step}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InsightsCard;
