import React, { useState } from 'react';
import { ArrowLeft, Plus, Search, Dumbbell, Trash2, GripVertical, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useExerciseSearch } from '../../hooks/useWorkouts';
import type { Exercise, CreateWorkoutData, RoutineExercise } from '../../../../shared/types/workout.types';
import type { FitnessLevel } from '../../../../shared/types/common.types';
import { calculateAutoRestTime } from '../../utils/restCalculator';
import { toast } from '../../../../hooks/useNotification';

interface Props {
  onClose: () => void;
  onCreated?: (routine: CreateWorkoutData) => Promise<void>;
}

export const CreateWorkoutFormImproved: React.FC<Props> = ({ onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDay, setSelectedDay] = useState(1);
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [loading, setLoading] = useState(false);
  const [exercisesByDay, setExercisesByDay] = useState<Map<number, RoutineExercise[]>>(new Map());
  const [showExercisePanel, setShowExercisePanel] = useState(false);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  
  const { exercises, loading: loadingExercises, filters, updateFilters } = useExerciseSearch({ limit: 100 });

  const getDayExercises = (day: number): RoutineExercise[] => {
    return exercisesByDay.get(day) || [];
  };

  const addExerciseToDay = (exercise: Exercise, day: number) => {
    setExercisesByDay(prev => {
      const newMap = new Map(prev);
      const dayExercises = newMap.get(day) || [];
      const orderInDay = dayExercises.length + 1;

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
        restSeconds: autoRest,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      newMap.set(day, [...dayExercises, newExercise]);
      return newMap;
    });
    toast.success(`${exercise.name} agregado al Día ${day}`);
    setShowExercisePanel(false);
  };

  const removeExercise = (exerciseId: string, day: number) => {
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
      toast.warning('Por favor ingresa un nombre para la rutina');
      return;
    }

    const totalExercises = getTotalExercises();
    if (totalExercises === 0) {
      toast.warning('Por favor agrega al menos un ejercicio a la rutina');
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
      daysPerWeek: daysPerWeek,
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
      toast.error('Error al crear la rutina. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex flex-col">
      {/* Header - Sticky */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Crear Nueva Rutina</h1>
                <p className="text-sm text-gray-600">Personaliza tu entrenamiento</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creando...
                  </>
                ) : (
                  'Crear Rutina'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Form Inputs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre de la rutina *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Rutina Full Body"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descripción (opcional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe los objetivos de esta rutina..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Días por semana
              </label>
              <select
                value={daysPerWeek}
                onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
              >
                {[1, 2, 3, 4, 5, 6, 7].map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'día' : 'días'}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-gray-600 bg-orange-50 px-4 py-3 rounded-lg border border-orange-200 w-full">
                <span className="font-semibold text-orange-700">Total: </span>
                <span className="text-gray-900 font-bold">{getTotalExercises()}</span> ejercicio(s)
              </div>
            </div>
          </div>
        </div>

        {/* Day Tabs - Scrollable */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {Array.from({ length: daysPerWeek }, (_, i) => i + 1).map(day => {
                const exerciseCount = getDayExercises(day).length;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`flex-shrink-0 px-6 py-3 rounded-lg font-semibold transition-all ${
                      selectedDay === day
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>Día {day}</span>
                      {exerciseCount > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          selectedDay === day ? 'bg-white/30' : 'bg-orange-500 text-white'
                        }`}>
                          {exerciseCount}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Day Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Día {selectedDay}
              <span className="ml-3 text-sm font-normal text-gray-600">
                {getDayExercises(selectedDay).length} ejercicio(s)
              </span>
            </h3>
            <button
              onClick={() => setShowExercisePanel(true)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Agregar Ejercicio
            </button>
          </div>

          {/* Exercise List */}
          <div className="space-y-4">
            {getDayExercises(selectedDay).length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-b from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
                <Dumbbell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium text-lg mb-2">No hay ejercicios en este día</p>
                <p className="text-sm text-gray-500">Haz clic en "Agregar Ejercicio" para comenzar</p>
              </div>
            ) : (
              getDayExercises(selectedDay).map((routineEx) => (
                <div
                  key={routineEx.id}
                  className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Drag Handle */}
                    <div className="text-gray-400 cursor-move mt-2">
                      <GripVertical className="w-5 h-5" />
                    </div>

                    {/* Exercise Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">{routineEx.exercise?.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {routineEx.exercise?.muscleGroups?.join(', ')}
                          </p>
                        </div>
                        <button
                          onClick={() => removeExercise(routineEx.id, selectedDay)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Quick Config */}
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-2">Series</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={routineEx.sets}
                            onChange={(e) => updateExercise(routineEx.id, selectedDay, { sets: parseInt(e.target.value) || 3 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center font-semibold focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-2">Reps Min</label>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={routineEx.repsMin}
                            onChange={(e) => updateExercise(routineEx.id, selectedDay, { repsMin: parseInt(e.target.value) || 8 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center font-semibold focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-2">Reps Max</label>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={routineEx.repsMax}
                            onChange={(e) => updateExercise(routineEx.id, selectedDay, { repsMax: parseInt(e.target.value) || 12 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center font-semibold focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-2">Descanso (s)</label>
                          <input
                            type="number"
                            min="30"
                            max="300"
                            step="30"
                            value={routineEx.restSeconds}
                            onChange={(e) => updateExercise(routineEx.id, selectedDay, { restSeconds: parseInt(e.target.value) || 60 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center font-semibold focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* Expand for details */}
                      <button
                        onClick={() => setExpandedExercise(expandedExercise === routineEx.id ? null : routineEx.id)}
                        className="mt-3 text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1"
                      >
                        {expandedExercise === routineEx.id ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Ocultar detalles
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            Ver detalles
                          </>
                        )}
                      </button>

                      {/* Expanded Details */}
                      {expandedExercise === routineEx.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-700">
                              <span className="font-semibold">Dificultad:</span>
                              <span className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
                                {routineEx.exercise?.difficultyLevel}
                              </span>
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-700">
                              <span className="font-semibold">Equipo:</span>
                              <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                                {routineEx.exercise?.equipment || 'Peso corporal'}
                              </span>
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Exercise Selection Drawer - Slide from Right */}
      {showExercisePanel && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slideInRight">
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <h3 className="text-xl font-bold">Seleccionar Ejercicio</h3>
              <button
                onClick={() => setShowExercisePanel(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search and Filters */}
            <div className="px-6 py-4 border-b border-gray-200 space-y-3 bg-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={filters.query || ''}
                  onChange={(e) => updateFilters({ query: e.target.value })}
                  placeholder="Buscar ejercicio..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={filters.muscleGroup || ''}
                  onChange={(e) => updateFilters({ muscleGroup: e.target.value || undefined })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Todos los músculos</option>
                  <option value="chest">Pecho</option>
                  <option value="back">Espalda</option>
                  <option value="shoulders">Hombros</option>
                  <option value="arms">Brazos</option>
                  <option value="legs">Piernas</option>
                  <option value="core">Core</option>
                </select>

                <select
                  value={filters.difficulty || ''}
                  onChange={(e) => updateFilters({ difficulty: (e.target.value || undefined) as FitnessLevel | undefined })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Todas las dificultades</option>
                  <option value="beginner">Principiante</option>
                  <option value="intermediate">Intermedio</option>
                  <option value="advanced">Avanzado</option>
                </select>
              </div>
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {loadingExercises ? (
                <div className="text-center py-12">
                  <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando ejercicios...</p>
                </div>
              ) : exercises.length === 0 ? (
                <div className="text-center py-12">
                  <Dumbbell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No se encontraron ejercicios</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {exercises.map(exercise => (
                    <button
                      key={exercise.id}
                      onClick={() => addExerciseToDay(exercise, selectedDay)}
                      className="w-full text-left p-4 bg-white border border-gray-200 rounded-xl hover:border-orange-500 hover:shadow-lg transition-all group"
                    >
                      <h4 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                        {exercise.name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {exercise.muscleGroups?.join(', ')}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded font-medium">
                          {exercise.difficultyLevel}
                        </span>
                        {exercise.equipment && (
                          <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded font-medium">
                            {exercise.equipment}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <style>{`
            @keyframes slideInRight {
              from {
                transform: translateX(100%);
              }
              to {
                transform: translateX(0);
              }
            }

            .animate-slideInRight {
              animation: slideInRight 0.3s ease-out;
            }
          `}</style>
        </div>
      )}
    </div>
  );
};
