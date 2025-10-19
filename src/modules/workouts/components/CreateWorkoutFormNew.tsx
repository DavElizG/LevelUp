import React, { useState } from 'react';
import { useExerciseSearch } from '../hooks/useWorkouts';
import type { Exercise, CreateWorkoutData, RoutineExercise } from '../../../shared/types/workout.types';
import { WorkoutDaySection } from './WorkoutDaySection';
import { calculateAutoRestTime } from '../utils/restCalculator';

interface Props {
  onClose: () => void;
  onCreated?: (routine: CreateWorkoutData) => Promise<void>;
}

export const CreateWorkoutFormNew: React.FC<Props> = ({ onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDay, setSelectedDay] = useState(1);
  const [loading, setLoading] = useState(false);
  const [exercisesByDay, setExercisesByDay] = useState<Map<number, RoutineExercise[]>>(new Map());
  
  const { exercises, loading: loadingExercises, filters, updateFilters } = useExerciseSearch({ limit: 50 });

  const getDayExercises = (day: number): RoutineExercise[] => {
    return exercisesByDay.get(day) || [];
  };

  const addExerciseToDay = (exercise: Exercise, day: number) => {
    setExercisesByDay(prev => {
      const newMap = new Map(prev);
      const dayExercises = newMap.get(day) || [];
      const orderInDay = dayExercises.length + 1;

      // Calcular descanso automático basado en el ejercicio
      const autoRest = calculateAutoRestTime(exercise, 3, 10);

      const newExercise: RoutineExercise = {
        id: `temp-${Date.now()}-${exercise.id}`,
        routineId: '',
        exerciseId: exercise.id,
        exercise: exercise,
        dayOfWeek: day,
        orderInDay,
        sets: 3,
        repsMin: 8,
        repsMax: 12,
        restSeconds: autoRest, // Auto calculado por defecto
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      newMap.set(day, [...dayExercises, newExercise]);
      return newMap;
    });
  };

  const removeExerciseFromDay = (exerciseId: string, day: number) => {
    setExercisesByDay(prev => {
      const newMap = new Map(prev);
      const dayExercises = (newMap.get(day) || []).filter(ex => ex.id !== exerciseId);
      
      const reordered = dayExercises.map((ex, index) => ({
        ...ex,
        orderInDay: index + 1,
      }));
      
      newMap.set(day, reordered);
      return newMap;
    });
  };

  const updateExercise = (exerciseId: string, day: number, updates: Partial<RoutineExercise>) => {
    setExercisesByDay(prev => {
      const newMap = new Map(prev);
      const dayExercises = newMap.get(day) || [];
      
      const updated = dayExercises.map(ex => 
        ex.id === exerciseId ? { ...ex, ...updates } : ex
      );
      
      newMap.set(day, updated);
      return newMap;
    });
  };

  const isExerciseInDay = (exerciseId: string, day: number): boolean => {
    const dayExercises = getDayExercises(day);
    return dayExercises.some(ex => ex.exerciseId === exerciseId);
  };

  const getTotalExercises = (): number => {
    let total = 0;
    for (const exercises of exercisesByDay.values()) {
      total += exercises.length;
    }
    return total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Por favor ingresa un nombre para la rutina');
      return;
    }

    const totalExercises = getTotalExercises();
    if (totalExercises === 0) {
      alert('Por favor agrega al menos un ejercicio a la rutina');
      return;
    }

    setLoading(true);

    const allExercises: Array<{
      exerciseId: string;
      dayOfWeek: number;
      orderInDay: number;
      sets: number;
      repsMin?: number;
      repsMax?: number;
      restSeconds?: number;
    }> = [];

    for (const [dayNumber, dayExercises] of exercisesByDay.entries()) {
      for (const ex of dayExercises) {
        allExercises.push({
          exerciseId: ex.exerciseId,
          dayOfWeek: dayNumber,
          orderInDay: ex.orderInDay,
          sets: ex.sets,
          repsMin: ex.repsMin,
          repsMax: ex.repsMax,
          restSeconds: ex.restSeconds,
        });
      }
    }

    const payload: CreateWorkoutData = {
      name: name.trim(),
      description: description.trim() || undefined,
      goal: 'general',
      difficultyLevel: 'intermediate',
      durationWeeks: 4,
      daysPerWeek: exercisesByDay.size,
      generatedByAi: false,
      isActive: true,
      isPublic: false,
      exercises: allExercises,
    };

    try {
      if (onCreated) {
        await onCreated(payload);
      }
      onClose();
    } catch (error) {
      console.error('Error al crear rutina:', error);
      alert('Error al crear la rutina. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b-2 border-gray-200 p-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Crear Nueva Rutina</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="routineName" className="block text-sm font-semibold text-gray-800 mb-2">
                Nombre de la rutina *
              </label>
              <input 
                id="routineName"
                type="text"
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Ej: Rutina Full Body"
                className="block w-full rounded-lg border-2 border-gray-300 p-3 text-base focus:border-orange-500 focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label htmlFor="routineDescription" className="block text-sm font-semibold text-gray-800 mb-2">
                Descripción (opcional)
              </label>
              <textarea 
                id="routineDescription"
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="Describe los objetivos de esta rutina..."
                rows={2}
                className="block w-full rounded-lg border-2 border-gray-300 p-3 text-base focus:border-orange-500 focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* Content - Two Column Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Exercise Library */}
          <div className="w-1/2 border-r-2 border-gray-200 flex flex-col bg-white">
            <div className="p-4 border-b-2 border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Biblioteca de Ejercicios</h3>
              
              {/* Search and Filters */}
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Buscar ejercicios..."
                  value={filters.query || ''}
                  onChange={e => updateFilters({ query: e.target.value || undefined })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                />
                
                <div className="flex gap-2">
                  <select
                    value={filters.muscleGroup || ''}
                    onChange={e => updateFilters({ muscleGroup: e.target.value || undefined })}
                    className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-sm"
                  >
                    <option value="">Todos los músculos</option>
                    <option value="arms">Brazos</option>
                    <option value="legs">Piernas</option>
                    <option value="core">Core</option>
                    <option value="chest">Pecho</option>
                    <option value="back">Espalda</option>
                    <option value="shoulders">Hombros</option>
                  </select>
                  
                  <select
                    value={filters.difficulty || ''}
                    onChange={e => updateFilters({ difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced' || undefined })}
                    className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-sm"
                  >
                    <option value="">Todas las dificultades</option>
                    <option value="beginner">Principiante</option>
                    <option value="intermediate">Intermedio</option>
                    <option value="advanced">Avanzado</option>
                  </select>
                </div>
              </div>

              {/* Day Selector */}
              <div className="mt-4">
                <span className="block text-sm font-medium text-gray-700 mb-2">
                  Agregar a:
                </span>
                <div className="flex gap-2 flex-wrap">{[1, 2, 3, 4, 5, 6, 7].map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedDay === day
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Día {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto p-4">
              {loadingExercises ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Cargando ejercicios...</p>
                </div>
              ) : (
                <>
                  {exercises.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No se encontraron ejercicios</p>
                    </div>
                  ) : (
                    <div className="space-y-3">{exercises.map(exercise => {
                    const alreadyAdded = isExerciseInDay(exercise.id, selectedDay);
                    
                    return (
                      <div
                        key={exercise.id}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          alreadyAdded
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-orange-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                            {exercise.thumbnailUrl ? (
                              <img 
                                src={exercise.thumbnailUrl} 
                                alt={exercise.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-gray-900 truncate">
                              {exercise.name}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                              {exercise.muscleGroups?.join(', ')}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (alreadyAdded) {
                                const dayExercises = getDayExercises(selectedDay);
                                const ex = dayExercises.find(e => e.exerciseId === exercise.id);
                                if (ex) {
                                  removeExerciseFromDay(ex.id, selectedDay);
                                }
                              } else {
                                addExerciseToDay(exercise, selectedDay);
                              }
                            }}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              alreadyAdded
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-orange-500 text-white hover:bg-orange-600'
                            }`}
                          >
                            {alreadyAdded ? 'Quitar' : 'Agregar'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Panel - Workout Preview by Days */}
          <div className="w-1/2 flex flex-col bg-gray-50">
            <div className="p-4 border-b-2 border-gray-200 bg-white">
              <h3 className="text-lg font-bold text-gray-900">
                Vista previa de la rutina
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {getTotalExercises()} ejercicios en {exercisesByDay.size} días
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {Array.from({ length: 7 }, (_, i) => i + 1)
                .filter(day => getDayExercises(day).length > 0)
                .map(day => (
                  <WorkoutDaySection
                    key={day}
                    dayNumber={day}
                    exercises={getDayExercises(day)}
                    onRemoveExercise={(exerciseId) => removeExerciseFromDay(exerciseId, day)}
                    onUpdateExercise={(exerciseId, updates) => updateExercise(exerciseId, day, updates)}
                    editMode={true}
                  />
                ))}

              {getTotalExercises() === 0 && (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="text-gray-500 text-lg font-medium">
                    Tu rutina está vacía
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Agrega ejercicios desde la biblioteca
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer - Actions */}
        <div className="bg-white border-t-2 border-gray-200 p-4 flex justify-between items-center">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-6 py-3 border-2 border-gray-300 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={loading || !name.trim() || getTotalExercises() === 0} 
            className="px-8 py-3 bg-orange-500 text-white rounded-lg text-base font-semibold hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            {loading ? 'Creando...' : 'Crear Rutina'}
          </button>
        </div>
      </form>
    </div>
  );
};
