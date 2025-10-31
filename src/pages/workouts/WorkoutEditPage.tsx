import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Trash2, 
  Save,
  X,
  Edit2,
  Check,
  Dumbbell
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
      <div className="relative min-h-screen bg-gradient-to-br from-white via-orange-50/30 to-purple-50/30 pb-24 overflow-hidden">
        {/* Burbujas decorativas */}
        <div className="fixed top-0 left-0 w-96 h-96 bg-gradient-to-br from-orange-300/30 to-pink-400/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="fixed bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-purple-300/30 to-blue-400/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
        
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Cargando rutina...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !routine) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-white via-orange-50/30 to-purple-50/30 flex items-center justify-center pb-20 overflow-hidden">
        {/* Burbujas decorativas */}
        <div className="fixed top-0 left-0 w-96 h-96 bg-gradient-to-br from-orange-300/30 to-pink-400/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="fixed bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-purple-300/30 to-blue-400/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
        
        <div className="relative z-10 text-center px-4">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-gray-800 font-semibold mb-2">
            {error || 'Rutina no encontrada'}
          </p>
          <p className="text-gray-600 text-sm mb-6">
            La rutina que buscas no está disponible
          </p>
          <button
            onClick={() => navigate('/workouts')}
            className="px-6 py-3 bg-gradient-to-br from-orange-500 to-pink-500 text-white rounded-2xl hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 hover:scale-105"
          >
            Volver a Rutinas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-orange-50/30 to-purple-50/30 pb-24 overflow-hidden">
      {/* Burbujas decorativas */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-gradient-to-br from-orange-300/30 to-pink-400/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="fixed top-1/3 right-0 w-80 h-80 bg-gradient-to-br from-purple-300/30 to-blue-400/30 rounded-full blur-3xl translate-x-1/2 pointer-events-none"></div>
      <div className="fixed bottom-0 left-1/4 w-72 h-72 bg-gradient-to-br from-pink-300/30 to-orange-400/30 rounded-full blur-3xl translate-y-1/2 pointer-events-none"></div>
      
      {/* Header Sticky */}
      <div className="sticky top-0 bg-white/70 backdrop-blur-md shadow-xl z-10 border-b border-white/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate('/workouts')}
              className="p-2 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 text-white hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 hover:scale-105 flex-shrink-0 mt-1"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1 min-w-0">
              {editingField === 'name' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editValues.name || ''}
                    onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                    className="flex-1 px-4 py-2 border border-orange-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white/90 backdrop-blur-sm shadow-sm"
                    autoFocus
                  />
                  <button
                    onClick={() => saveField('name')}
                    disabled={saving}
                    className="p-2 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl hover:shadow-lg transition-all"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-2 bg-gray-300 text-gray-700 rounded-2xl hover:bg-gray-400 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent truncate">
                    {routine.name}
                  </h1>
                  <button
                    onClick={() => startEdit('name', routine.name)}
                    className="p-1.5 hover:bg-white/50 rounded-xl transition-all"
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
                    className="flex-1 px-4 py-2 border border-orange-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white/90 backdrop-blur-sm shadow-sm"
                    rows={2}
                    autoFocus
                  />
                  <button
                    onClick={() => saveField('description')}
                    disabled={saving}
                    className="p-2 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl hover:shadow-lg transition-all"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-2 bg-gray-300 text-gray-700 rounded-2xl hover:bg-gray-400 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-gray-600 line-clamp-2">{routine.description || 'Sin descripción'}</p>
                  <button
                    onClick={() => startEdit('description', routine.description)}
                    className="p-1 hover:bg-white/50 rounded-xl transition-all flex-shrink-0"
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
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/70 backdrop-blur-md rounded-3xl p-4 text-center shadow-xl border border-white/50">
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              {routine.daysPerWeek || 6}
            </div>
            <div className="text-xs text-gray-600 mt-1">Días/semana</div>
          </div>
          <div className="bg-white/70 backdrop-blur-md rounded-3xl p-4 text-center shadow-xl border border-white/50">
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              {routine.exercises?.length || 0}
            </div>
            <div className="text-xs text-gray-600 mt-1">Total ejercicios</div>
          </div>
        </div>

        {/* Canvas de días con drag & drop */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
              Ejercicios por día
            </h2>
            <p className="text-sm text-gray-500">Arrastra entre días</p>
          </div>

          {availableDays.map((day) => (
            <div
              key={day}
              className={`bg-white/70 backdrop-blur-md rounded-3xl p-4 shadow-xl border transition-all ${
                dragOverDay === day ? 'ring-2 ring-orange-500 bg-orange-50/50 border-orange-300' : 'border-white/50'
              }`}
              onDragOver={(e) => handleDragOver(e, day)}
              onDrop={(e) => handleDrop(e, day)}
            >
              {/* Header del día */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  Día {day}
                </h3>
                <span className="text-sm text-gray-600 bg-gradient-to-br from-orange-50 to-pink-50 px-3 py-1 rounded-full border border-orange-200">
                  {groupedExercises[day]?.length || 0} ejercicios
                </span>
              </div>

              {/* Lista de ejercicios */}
              <div className="space-y-3">
                {groupedExercises[day]?.length === 0 || !groupedExercises[day] ? (
                  <div className="text-center py-8 text-gray-400 bg-white/50 rounded-2xl border-2 border-dashed border-gray-200">
                    <Dumbbell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Sin ejercicios</p>
                  </div>
                ) : (
                  groupedExercises[day]?.map((ex, idx) => (
                    <div
                      key={ex.id}
                      draggable
                      onDragStart={() => handleDragStart(ex.id, day)}
                      onDragEnd={handleDragEnd}
                      className={`bg-white/80 backdrop-blur-sm rounded-2xl p-4 border hover:shadow-lg transition-all cursor-move ${
                        dragging?.exerciseId === ex.id ? 'opacity-50 scale-95' : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-md">
                          {idx + 1}
                        </span>

                        <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-lg truncate">
                          {ex.exercise?.name || 'Ejercicio sin nombre'}
                        </h4>
                        {ex.exercise?.muscleGroups && ex.exercise.muscleGroups.length > 0 && (
                          <p className="text-sm text-gray-600 mt-1">
                            🎯 {ex.exercise.muscleGroups.join(', ')}
                          </p>
                        )}

                        {editingExercise === ex.id ? (
                          /* Modo edición */
                          <div className="mt-4 space-y-3">
                            <div className="grid grid-cols-3 gap-3">
                              <div className="bg-gradient-to-br from-gray-50 to-white p-3 rounded-2xl border border-gray-200">
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Series</label>
                                <input
                                  type="number"
                                  value={exerciseEditValues.sets || ''}
                                  onChange={(e) =>
                                    setExerciseEditValues({
                                      ...exerciseEditValues,
                                      sets: parseInt(e.target.value)
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-center font-bold text-lg focus:ring-2 focus:ring-orange-500"
                                />
                              </div>
                              <div className="bg-gradient-to-br from-gray-50 to-white p-3 rounded-2xl border border-gray-200">
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Reps Min</label>
                                <input
                                  type="number"
                                  value={exerciseEditValues.repsMin || ''}
                                  onChange={(e) =>
                                    setExerciseEditValues({
                                      ...exerciseEditValues,
                                      repsMin: parseInt(e.target.value)
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-center font-bold focus:ring-2 focus:ring-orange-500"
                                />
                              </div>
                              <div className="bg-gradient-to-br from-gray-50 to-white p-3 rounded-2xl border border-gray-200">
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Reps Max</label>
                                <input
                                  type="number"
                                  value={exerciseEditValues.repsMax || ''}
                                  onChange={(e) =>
                                    setExerciseEditValues({
                                      ...exerciseEditValues,
                                      repsMax: parseInt(e.target.value)
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-center font-bold focus:ring-2 focus:ring-orange-500"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-gradient-to-br from-gray-50 to-white p-3 rounded-2xl border border-gray-200">
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Descanso (s)</label>
                                <input
                                  type="number"
                                  value={exerciseEditValues.restSeconds || ''}
                                  onChange={(e) =>
                                    setExerciseEditValues({
                                      ...exerciseEditValues,
                                      restSeconds: parseInt(e.target.value)
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-center font-bold focus:ring-2 focus:ring-orange-500"
                                />
                              </div>
                              <div className="bg-gradient-to-br from-gray-50 to-white p-3 rounded-2xl border border-gray-200">
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Peso (kg)</label>
                                <input
                                  type="number"
                                  value={exerciseEditValues.weightKg || ''}
                                  onChange={(e) =>
                                    setExerciseEditValues({
                                      ...exerciseEditValues,
                                      weightKg: parseFloat(e.target.value)
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-center font-bold focus:ring-2 focus:ring-orange-500"
                                  step="0.5"
                                />
                              </div>
                            </div>

                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => saveExercise(ex.id)}
                                disabled={saving}
                                className="flex-1 px-4 py-2.5 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2"
                              >
                                <Save className="w-4 h-4" />
                                Guardar
                              </button>
                              <button
                                onClick={cancelEditExercise}
                                className="px-4 py-2.5 bg-gray-300 text-gray-700 rounded-2xl hover:bg-gray-400 transition-all font-semibold"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Modo visualización */
                          <>
                            <div className="grid grid-cols-3 gap-3 mt-3">
                              <div className="bg-gradient-to-br from-gray-50 to-white p-3 rounded-2xl border border-gray-200 text-center">
                                <div className="text-lg font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">{ex.sets}</div>
                                <div className="text-xs text-gray-600 mt-0.5">series</div>
                              </div>
                              <div className="bg-gradient-to-br from-gray-50 to-white p-3 rounded-2xl border border-gray-200 text-center">
                                <div className="text-lg font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                                  {ex.repsMin}-{ex.repsMax}
                                </div>
                                <div className="text-xs text-gray-600 mt-0.5">reps</div>
                              </div>
                              <div className="bg-gradient-to-br from-gray-50 to-white p-3 rounded-2xl border border-gray-200 text-center">
                                <div className="text-lg font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">{ex.restSeconds}s</div>
                                <div className="text-xs text-gray-600 mt-0.5">descanso</div>
                              </div>
                            </div>

                            {/* Botones de mover entre días (móvil friendly) */}
                            {(day > 1 || day < (routine.daysPerWeek || 6)) && (
                              <div className="flex gap-2 mt-3">
                                {day > 1 && (
                                  <button
                                    onClick={() => moveExerciseWithButtons(ex.id, day, 'prev')}
                                    disabled={saving}
                                    className="px-3 py-1.5 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:shadow-md transition-all text-xs font-semibold disabled:opacity-50"
                                    title="Mover al día anterior"
                                  >
                                    ← Día {day - 1}
                                  </button>
                                )}
                                {day < (routine.daysPerWeek || 6) && (
                                  <button
                                    onClick={() => moveExerciseWithButtons(ex.id, day, 'next')}
                                    disabled={saving}
                                    className="px-3 py-1.5 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:shadow-md transition-all text-xs font-semibold disabled:opacity-50"
                                    title="Mover al día siguiente"
                                  >
                                    Día {day + 1} →
                                  </button>
                                )}
                              </div>
                            )}

                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => startEditExercise(ex)}
                                className="flex-1 px-4 py-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2"
                              >
                                <Edit2 className="w-4 h-4" />
                                Editar
                              </button>
                              <button
                                onClick={() => removeExercise(ex.id)}
                                className="px-4 py-2 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl hover:shadow-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
                )}
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
