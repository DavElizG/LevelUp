import React from 'react';
import { X, Calendar, Dumbbell, TrendingUp, Target, Clock, Utensils } from 'lucide-react';
import type { DeletedItem } from '../TrashBin';
import { confirm as confirmDialog } from '../../../hooks/useNotification';

interface DeletedItemDetailModalProps {
  item: DeletedItem | null;
  onClose: () => void;
  onRestore: (id: string, type: 'routine' | 'diet') => void;
  onPermanentDelete: (id: string, type: 'routine' | 'diet') => void;
}

interface Exercise {
  id?: string;
  exercise_id?: string;
  exercise_name?: string;
  exercise_description?: string;
  exercise_category?: string;
  day_of_week?: number;
  order_in_day?: number;
  sets?: number;
  reps_min?: number;
  reps_max?: number;
  rest_seconds?: number;
  weight_kg?: number;
  notes?: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const DeletedItemDetailModal: React.FC<DeletedItemDetailModalProps> = ({
  item,
  onClose,
  onRestore,
  onPermanentDelete,
}) => {
  if (!item) return null;

  const isRoutine = item.type === 'routine';
  const originalData = item.original_data || {};

  // Type-safe getters for original_data
  const description = originalData.description && typeof originalData.description === 'string' 
    ? originalData.description 
    : null;
  const goal = originalData.goal && typeof originalData.goal === 'string' 
    ? originalData.goal 
    : null;
  const difficulty = originalData.difficulty_level && typeof originalData.difficulty_level === 'string' 
    ? originalData.difficulty_level 
    : null;
  const durationWeeks = originalData.duration_weeks && typeof originalData.duration_weeks === 'number' 
    ? originalData.duration_weeks 
    : null;
  const daysPerWeek = originalData.days_per_week && typeof originalData.days_per_week === 'number' 
    ? originalData.days_per_week 
    : null;
  const totalCalories = originalData.total_calories && typeof originalData.total_calories === 'number' 
    ? originalData.total_calories 
    : null;

  // Extract exercises for routines
  const exercises = Array.isArray(originalData.exercises) 
    ? (originalData.exercises as Exercise[]) 
    : [];

  // Group exercises by day for routines
  const exercisesByDay = exercises.reduce((acc, exercise) => {
    const day = exercise.day_of_week || 0;
    if (!acc[day]) acc[day] = [];
    acc[day].push(exercise);
    return acc;
  }, {} as Record<number, Exercise[]>);

  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div 
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4" 
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <div className="p-6 space-y-6">
        {/* Header Info */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {item.title}
          </h3>
          
          {description && (
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {description}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>Eliminado: {formatDate(item.deleted_at)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Expira: {formatDate(item.expires_at)}</span>
            </div>
          </div>
        </div>

        {/* Routine-specific details */}
        {isRoutine && (
          <div className="space-y-4">
            {/* Routine metadata */}
            <div className="grid grid-cols-2 gap-4">
              {goal && (
                <div className="flex items-start gap-2">
                  <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Objetivo</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {goal}
                    </p>
                  </div>
                </div>
              )}
              {difficulty && (
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Dificultad</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {difficulty}
                    </p>
                  </div>
                </div>
              )}
              {durationWeeks && (
                <div className="flex items-start gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Duración</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {durationWeeks} semanas
                    </p>
                  </div>
                </div>
              )}
              {daysPerWeek && (
                <div className="flex items-start gap-2">
                  <Dumbbell className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Días por semana</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {daysPerWeek} días
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Exercises by day */}
            {exercises.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Dumbbell className="w-4 h-4" />
                  Ejercicios ({exercises.length})
                </h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {Object.entries(exercisesByDay)
                    .sort(([dayA], [dayB]) => Number(dayA) - Number(dayB))
                    .map(([day, dayExercises]) => (
                      <div key={day} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                          {dayNames[Number(day) - 1] || `Día ${day}`}
                        </p>
                        <div className="space-y-2">
                          {dayExercises
                            .sort((a, b) => (a.order_in_day || 0) - (b.order_in_day || 0))
                            .map((exercise, idx) => (
                              <div
                                key={exercise.id || idx}
                                className="bg-gray-50 dark:bg-gray-800/50 rounded p-2 text-sm"
                              >
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {exercise.exercise_name || 'Ejercicio sin nombre'}
                                </p>
                                {exercise.exercise_description && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {exercise.exercise_description}
                                  </p>
                                )}
                                <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-600 dark:text-gray-400">
                                  {exercise.sets && <span>Series: {exercise.sets}</span>}
                                  {exercise.reps_min && exercise.reps_max && (
                                    <span>
                                      Reps: {exercise.reps_min}-{exercise.reps_max}
                                    </span>
                                  )}
                                  {exercise.rest_seconds && (
                                    <span>Descanso: {exercise.rest_seconds}s</span>
                                  )}
                                  {exercise.weight_kg && <span>Peso: {exercise.weight_kg}kg</span>}
                                </div>
                                {exercise.notes && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                                    {exercise.notes}
                                  </p>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Diet-specific details */}
        {!isRoutine && (
          <div className="space-y-4">
            {totalCalories && (
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Calorías totales</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {totalCalories} kcal
                  </p>
                </div>
              </div>
            )}
            {/* Add more diet-specific fields as needed */}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              onRestore(item.id, item.type);
              onClose();
            }}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Restaurar
          </button>
          <button
            onClick={async () => {
              const confirmed = await confirmDialog(
                'Eliminar permanentemente',
                '¿Estás seguro de eliminar permanentemente este elemento? Esta acción NO se puede deshacer.',
                {
                  confirmText: 'Sí, eliminar',
                  cancelText: 'Cancelar',
                  type: 'danger'
                }
              );
              
              if (confirmed) {
                onPermanentDelete(item.id, item.type);
                onClose();
              }
            }}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Eliminar permanentemente
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default DeletedItemDetailModal;
