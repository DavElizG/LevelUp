import React from 'react';
import { Eye } from 'lucide-react';
import type { WorkoutRoutine } from '../../../../shared/types/workout.types';
import { confirm } from '../../../../hooks/useNotification';
import { cn, themeText } from '../../../../shared/utils/themeUtils';

interface Props {
  routine: WorkoutRoutine;
  onStart?: (routine: WorkoutRoutine) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClone?: (id: string) => void; // Nuevo prop para clonar rutinas públicas
  onPreview?: (id: string) => void; // Nuevo prop para ver preview
  isPublic?: boolean; // Flag para saber si es rutina pública
}

const WorkoutCard: React.FC<Props> = ({ routine, onStart, onEdit, onDelete, onClone, onPreview, isPublic }) => {
  // Calcular stats robustamente
  const exercisesCount = routine.exercises?.length ?? 0;
  const totalSets = routine.exercises?.reduce((sum, ex) => {
    const sets = ex.sets ?? 0;
    return sum + sets;
  }, 0) ?? 0;

  const getDifficultyStyle = (level?: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (level?: string) => {
    switch (level) {
      case 'beginner':
        return 'Principiante';
      case 'intermediate':
        return 'Intermedio';
      case 'advanced':
        return 'Avanzado';
      default:
        return 'Sin nivel';
    }
  };

  return (
    <div className={cn(
      "relative backdrop-blur-md rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden",
      "bg-gradient-to-br from-white to-orange-50",
      "dark:from-gray-800 dark:to-gray-800/50",
      "high-contrast:from-black high-contrast:to-black",
      "border border-orange-100 dark:border-orange-900 high-contrast:border-orange-600 high-contrast:border-2"
    )}>
      {/* Decorative gradient bubbles - Same style as Dashboard */}
      <div className={cn(
        "absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-20 blur-2xl",
        "bg-gradient-to-br from-orange-200 to-pink-200",
        "dark:from-orange-900/30 dark:to-pink-900/30",
        "high-contrast:from-orange-900/50 high-contrast:to-pink-900/50"
      )}></div>
      <div className={cn(
        "absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-20 blur-2xl",
        "bg-gradient-to-br from-purple-200 to-pink-200",
        "dark:from-purple-900/30 dark:to-pink-900/30",
        "high-contrast:from-purple-900/50 high-contrast:to-pink-900/50"
      )}></div>
      
      {/* Header con gradiente glass-morphism */}
      <div className="relative bg-gradient-to-r from-orange-500 to-pink-600 backdrop-blur-sm p-4">
        <h3 className="text-xl font-bold text-white mb-1 drop-shadow-sm">{routine.name}</h3>
        {routine.description && (
          <p className="text-white/90 text-sm line-clamp-2">{routine.description}</p>
        )}
      </div>

      {/* Body */}
      <div className="relative p-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className={cn(
            "text-center backdrop-blur-sm rounded-2xl p-3 shadow-sm",
            "bg-white/80 dark:bg-gray-900/50 high-contrast:bg-black/50",
            "border border-orange-100/30 dark:border-orange-900/30 high-contrast:border-orange-600"
          )}>
            <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">{exercisesCount}</div>
            <div className={cn("text-xs mt-1", themeText.secondary)}>Ejercicios</div>
          </div>
          <div className={cn(
            "text-center backdrop-blur-sm rounded-2xl p-3 shadow-sm",
            "bg-white/80 dark:bg-gray-900/50 high-contrast:bg-black/50",
            "border border-purple-100/30 dark:border-purple-900/30 high-contrast:border-purple-600"
          )}>
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{totalSets}</div>
            <div className={cn("text-xs mt-1", themeText.secondary)}>Series</div>
          </div>
          <div className={cn(
            "text-center backdrop-blur-sm rounded-2xl p-3 shadow-sm",
            "bg-white/80 dark:bg-gray-900/50 high-contrast:bg-black/50",
            "border border-green-100/30 dark:border-green-900/30 high-contrast:border-green-600"
          )}>
            <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              {routine.daysPerWeek ?? '-'}
            </div>
            <div className={cn("text-xs mt-1", themeText.secondary)}>Días/sem</div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getDifficultyStyle(routine.difficultyLevel)}`}>
            {getDifficultyLabel(routine.difficultyLevel)}
          </span>
          {routine.goal && (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
              {routine.goal}
            </span>
          )}
          {routine.generatedByAi && (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
              🤖 IA
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {/* Botón Preview - Siempre visible */}
          {onPreview && (
            <button
              onClick={() => onPreview(routine.id)}
              className={cn(
                "px-4 py-3 rounded-lg transition-colors flex items-center gap-2",
                "border-2 border-gray-300 dark:border-gray-600 high-contrast:border-gray-500",
                "text-gray-700 dark:text-gray-300 high-contrast:text-gray-200",
                "hover:bg-gray-50 dark:hover:bg-gray-700 high-contrast:hover:bg-gray-900"
              )}
              title="Ver detalles"
            >
              <Eye className="w-5 h-5" />
              <span className="hidden sm:inline">Ver</span>
            </button>
          )}
          
          <button
            onClick={() => onStart?.(routine)}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            {isPublic ? 'Usar' : 'Iniciar'}
          </button>
          
          {isPublic && onClone && (
            <button
              onClick={() => onClone(routine.id)}
              className="px-4 py-3 border-2 border-orange-300 dark:border-orange-700 high-contrast:border-orange-600 text-orange-600 dark:text-orange-400 high-contrast:text-orange-500 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 high-contrast:hover:bg-orange-900/30 transition-colors flex items-center gap-2"
              title="Clonar rutina a tu colección"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">Clonar</span>
            </button>
          )}
          
          {!isPublic && onEdit && (
            <button
              onClick={() => onEdit(routine.id)}
              className={cn(
                "px-4 py-3 rounded-lg transition-colors",
                "border-2 border-gray-300 dark:border-gray-600 high-contrast:border-gray-500",
                "text-gray-700 dark:text-gray-300 high-contrast:text-gray-200",
                "hover:bg-gray-50 dark:hover:bg-gray-700 high-contrast:hover:bg-gray-900"
              )}
              title="Editar"
            >
              ✏️
            </button>
          )}
          
          {!isPublic && onDelete && (
            <button
              onClick={async () => {
                const confirmed = await confirm(
                  'Eliminar rutina',
                  `¿Estás seguro de eliminar la rutina "${routine.name}"? Esta acción no se puede deshacer.`,
                  {
                    confirmText: 'Eliminar',
                    cancelText: 'Cancelar',
                    type: 'danger'
                  }
                );
                if (confirmed) {
                  onDelete(routine.id);
                }
              }}
              className="px-4 py-3 border-2 border-red-200 dark:border-red-800 high-contrast:border-red-600 text-red-600 dark:text-red-400 high-contrast:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 high-contrast:hover:bg-red-900/30 transition-colors"
              title="Eliminar"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutCard;
