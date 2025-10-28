import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  GripVertical,
  Save,
  X,
  Edit2,
  Check
} from 'lucide-react';
import { workoutService } from '../../modules/workouts/services/workoutService';
import type { WorkoutRoutine, RoutineExercise } from '../../shared/types';
import { toast, confirm } from '../../hooks/useNotification';

interface DraggingState {
  exerciseId: string;
  fromDay: number;
}

export const WorkoutEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [routine, setRoutine] = useState<WorkoutRoutine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Estado para edición inline
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  // Estado para drag & drop
  const [dragging, setDragging] = useState<DraggingState | null>(null);
  const [dragOverDay, setDragOverDay] = useState<number | null>(null);

  // Estado para edición de ejercicios
  const [editingExercise, setEditingExercise] = useState<string | null>(null);
  const [exerciseEditValues, setExerciseEditValues] = useState<Partial<RoutineExercise>>({});

  useEffect(() => {
    const loadRoutine = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const res = await workoutService.getWorkout(id);

        if (res.success && res.data) {
          setRoutine(res.data);
        } else {
          setError('No se pudo cargar la rutina');
        }
      } catch (err) {
        setError('Error cargando la rutina');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadRoutine();
  }, [id]);

  // ========== EDICIÓN INLINE DE INFO BÁSICA ==========

  const startEdit = (field: string, currentValue: string | number | undefined) => {
    setEditingField(field);
    setEditValues({ ...editValues, [field]: String(currentValue || '') });
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValues({});
  };

  const saveField = async (field: string) => {
    if (!routine) return;

    const value = editValues[field];
    setSaving(true);

    try {
      const updates: Record<string, string | number> = {};

      if (field === 'name') updates.name = value;
      if (field === 'description') updates.description = value;
      if (field === 'daysPerWeek') updates.daysPerWeek = parseInt(value);

      const res = await workoutService.updateWorkoutBasicInfo(routine.id, updates);

      if (res.success && res.data) {
        setRoutine(res.data);
        setEditingField(null);
        setEditValues({});
      }
    } catch (err) {
      console.error('Error updating:', err);
    } finally {
      setSaving(false);
    }
  };

  // ========== DRAG & DROP DE EJERCICIOS ==========

  const handleDragStart = (exerciseId: string, fromDay: number) => {
    setDragging({ exerciseId, fromDay });
  };

  const handleDragEnd = () => {
    setDragging(null);
    setDragOverDay(null);
  };

  const handleDragOver = (e: React.DragEvent, day: number) => {
    e.preventDefault();
    setDragOverDay(day);
  };

  const handleDrop = async (e: React.DragEvent, toDay: number) => {
    e.preventDefault();

    if (!dragging || !routine) return;

    const { exerciseId, fromDay } = dragging;

    // Si es el mismo día, no hacer nada
    if (fromDay === toDay) {
      setDragging(null);
      setDragOverDay(null);
      return;
    }

    setSaving(true);

    try {
      const res = await workoutService.moveExerciseToDay(exerciseId, toDay);

      if (res.success && res.data) {
        setRoutine(res.data);
      } else {
        console.error('Error moving exercise:', res.error);
        toast.error('Error al mover ejercicio');
      }
    } catch (err) {
      console.error('Error moving exercise:', err);
      toast.error('Error al mover ejercicio');
    } finally {
      setSaving(false);
      setDragging(null);
      setDragOverDay(null);
    }
  };

  // Alternativa para móvil: mover con botones
  const moveExerciseWithButtons = async (exerciseId: string, fromDay: number, direction: 'prev' | 'next') => {
    if (!routine) return;

    const targetDay = direction === 'next' ? fromDay + 1 : fromDay - 1;
    
    if (targetDay < 1 || targetDay > (routine.daysPerWeek || 6)) {
      return; // Día fuera de rango
    }

    setSaving(true);

    try {
      const res = await workoutService.moveExerciseToDay(exerciseId, targetDay);

      if (res.success && res.data) {
        setRoutine(res.data);
      } else {
        console.error('Error moving exercise:', res.error);
        toast.error('Error al mover ejercicio');
      }
    } catch (err) {
      console.error('Error moving exercise:', err);
      toast.error('Error al mover ejercicio');
    } finally {
      setSaving(false);
    }
  };

  // ========== EDICIÓN DE EJERCICIOS ==========

  const startEditExercise = (exercise: RoutineExercise) => {
    setEditingExercise(exercise.id);
    setExerciseEditValues({
      sets: exercise.sets,
      repsMin: exercise.repsMin,
      repsMax: exercise.repsMax,
      restSeconds: exercise.restSeconds,
      weightKg: exercise.weightKg,
      notes: exercise.notes
    });
  };

  const cancelEditExercise = () => {
    setEditingExercise(null);
    setExerciseEditValues({});
  };

  const saveExercise = async (exerciseId: string) => {
    setSaving(true);

    try {
      const res = await workoutService.updateRoutineExercise(exerciseId, exerciseEditValues);

      if (res.success && res.data) {
        setRoutine(res.data);
        setEditingExercise(null);
        setExerciseEditValues({});
      }
    } catch (err) {
      console.error('Error updating exercise:', err);
    } finally {
      setSaving(false);
    }
  };

  const removeExercise = async (exerciseId: string) => {
    const confirmed = await confirm(
      'Eliminar ejercicio',
      '¿Estás seguro de eliminar este ejercicio de la rutina?',
      {
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        type: 'danger'
      }
    );
    
    if (!confirmed) return;

    setSaving(true);

    try {
      const res = await workoutService.removeExerciseFromRoutine(exerciseId);

      if (res.success && res.data) {
        setRoutine(res.data);
      }
    } catch (err) {
      console.error('Error removing exercise:', err);
    } finally {
      setSaving(false);
    }
  };

  // ========== AGRUPACIÓN POR DÍA ==========

  const groupExercisesByDay = () => {
    if (!routine?.exercises) return {};

    const grouped: Record<number, RoutineExercise[]> = {};

    routine.exercises.forEach((ex) => {
      const day = ex.dayOfWeek || 1;
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(ex);
    });

    // Ordenar por orderInDay
    Object.keys(grouped).forEach((day) => {
      grouped[parseInt(day)].sort((a, b) => a.orderInDay - b.orderInDay);
    });

    return grouped;
  };

  const groupedExercises = groupExercisesByDay();
  const availableDays = Array.from({ length: routine?.daysPerWeek || 6 }, (_, i) => i + 1);

  // ========== LOADING & ERROR STATES ==========

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando rutina...</p>
        </div>
      </div>
    );
  }

  if (error || !routine) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-gray-800 font-semibold mb-2">{error || 'Rutina no encontrada'}</p>
          <button
            onClick={() => navigate('/workouts')}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Volver a Rutinas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-gray-50 pb-24">
      {/* Header fijo */}
      <div className="sticky top-0 bg-white shadow-md z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/workouts')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>

            <div className="flex-1">
              {editingField === 'name' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editValues.name || ''}
                    onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                    className="flex-1 px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    autoFocus
                  />
                  <button
                    onClick={() => saveField('name')}
                    disabled={saving}
                    className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">{routine.name}</h1>
                  <button
                    onClick={() => startEdit('name', routine.name)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Edit2 className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              )}

              {editingField === 'description' ? (
                <div className="flex items-center gap-2 mt-2">
                  <textarea
                    value={editValues.description || ''}
                    onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                    className="flex-1 px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={2}
                    autoFocus
                  />
                  <button
                    onClick={() => saveField('description')}
                    disabled={saving}
                    className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-gray-600">{routine.description || 'Sin descripción'}</p>
                  <button
                    onClick={() => startEdit('description', routine.description)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Edit2 className="w-3 h-3 text-gray-500" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Información de días */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Días por semana</p>
              <p className="text-2xl font-bold text-orange-600">{routine.daysPerWeek || 6}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total ejercicios</p>
              <p className="text-2xl font-bold text-gray-900">{routine.exercises?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* Canvas de días con drag & drop */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Ejercicios por día</h2>
            <p className="text-sm text-gray-500">Arrastra los ejercicios entre días</p>
          </div>

          {availableDays.map((day) => (
            <div
              key={day}
              className={`bg-white rounded-xl p-4 shadow-sm transition-all ${
                dragOverDay === day ? 'ring-2 ring-orange-500 bg-orange-50' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, day)}
              onDrop={(e) => handleDrop(e, day)}
            >
              {/* Header del día */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Día {day}</h3>
                <span className="text-sm text-gray-500">
                  {groupedExercises[day]?.length || 0} ejercicios
                </span>
              </div>

              {/* Lista de ejercicios */}
              <div className="space-y-2">
                {groupedExercises[day]?.map((ex) => (
                  <div
                    key={ex.id}
                    draggable
                    onDragStart={() => handleDragStart(ex.id, day)}
                    onDragEnd={handleDragEnd}
                    className={`bg-gray-50 rounded-lg p-3 cursor-move hover:bg-gray-100 transition-colors ${
                      dragging?.exerciseId === ex.id ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <GripVertical className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {ex.exercise?.name || 'Ejercicio sin nombre'}
                        </h4>

                        {editingExercise === ex.id ? (
                          /* Modo edición */
                          <div className="mt-3 space-y-2">
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Sets</label>
                                <input
                                  type="number"
                                  value={exerciseEditValues.sets || ''}
                                  onChange={(e) =>
                                    setExerciseEditValues({
                                      ...exerciseEditValues,
                                      sets: parseInt(e.target.value)
                                    })
                                  }
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Reps Min</label>
                                <input
                                  type="number"
                                  value={exerciseEditValues.repsMin || ''}
                                  onChange={(e) =>
                                    setExerciseEditValues({
                                      ...exerciseEditValues,
                                      repsMin: parseInt(e.target.value)
                                    })
                                  }
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Reps Max</label>
                                <input
                                  type="number"
                                  value={exerciseEditValues.repsMax || ''}
                                  onChange={(e) =>
                                    setExerciseEditValues({
                                      ...exerciseEditValues,
                                      repsMax: parseInt(e.target.value)
                                    })
                                  }
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Descanso (seg)</label>
                                <input
                                  type="number"
                                  value={exerciseEditValues.restSeconds || ''}
                                  onChange={(e) =>
                                    setExerciseEditValues({
                                      ...exerciseEditValues,
                                      restSeconds: parseInt(e.target.value)
                                    })
                                  }
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Peso (kg)</label>
                                <input
                                  type="number"
                                  value={exerciseEditValues.weightKg || ''}
                                  onChange={(e) =>
                                    setExerciseEditValues({
                                      ...exerciseEditValues,
                                      weightKg: parseFloat(e.target.value)
                                    })
                                  }
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  step="0.5"
                                />
                              </div>
                            </div>

                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => saveExercise(ex.id)}
                                disabled={saving}
                                className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm flex items-center justify-center gap-2"
                              >
                                <Save className="w-4 h-4" />
                                Guardar
                              </button>
                              <button
                                onClick={cancelEditExercise}
                                className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Modo visualización */
                          <>
                            <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                              <div className="bg-white rounded px-2 py-1 text-center">
                                <div className="text-orange-600 font-semibold">{ex.sets}</div>
                                <div className="text-xs text-gray-500">sets</div>
                              </div>
                              <div className="bg-white rounded px-2 py-1 text-center">
                                <div className="text-orange-600 font-semibold">
                                  {ex.repsMin}-{ex.repsMax}
                                </div>
                                <div className="text-xs text-gray-500">reps</div>
                              </div>
                              <div className="bg-white rounded px-2 py-1 text-center">
                                <div className="text-orange-600 font-semibold">{ex.restSeconds}s</div>
                                <div className="text-xs text-gray-500">descanso</div>
                              </div>
                            </div>

                            {/* Botones de mover entre días (móvil friendly) */}
                            <div className="flex gap-2 mt-3">
                              {day > 1 && (
                                <button
                                  onClick={() => moveExerciseWithButtons(ex.id, day, 'prev')}
                                  disabled={saving}
                                  className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs disabled:opacity-50"
                                  title="Mover al día anterior"
                                >
                                  ← Día {day - 1}
                                </button>
                              )}
                              {day < (routine.daysPerWeek || 6) && (
                                <button
                                  onClick={() => moveExerciseWithButtons(ex.id, day, 'next')}
                                  disabled={saving}
                                  className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs disabled:opacity-50"
                                  title="Mover al día siguiente"
                                >
                                  Día {day + 1} →
                                </button>
                              )}
                            </div>

                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => startEditExercise(ex)}
                                className="flex-1 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm flex items-center justify-center gap-2"
                              >
                                <Edit2 className="w-3 h-3" />
                                Editar
                              </button>
                              <button
                                onClick={() => removeExercise(ex.id)}
                                className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Botón agregar ejercicio */}
                <button
                  onClick={() => {
                    toast.info('Para agregar ejercicios, usa la aplicación web completa o contacta al administrador');
                  }}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-orange-400 hover:text-orange-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Agregar ejercicio al día {day}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Indicador de guardado */}
      {saving && (
        <div className="fixed top-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          Guardando...
        </div>
      )}
    </div>
  );
};
