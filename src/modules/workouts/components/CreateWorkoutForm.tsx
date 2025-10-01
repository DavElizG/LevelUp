import React, { useEffect, useState } from 'react';
import workoutService from '../services/workoutService';
import type { Exercise } from '../../../shared/types/workout.types';

interface Props {
  onClose: () => void;
  onCreated?: () => void;
}

interface SelectedExercise {
  exerciseId: string;
  sets?: number;
  repsMin?: number;
  repsMax?: number;
  restSeconds?: number;
  dayOfWeek?: number; // now represents "Día N" (1..7)
}

const CreateWorkoutForm: React.FC<Props> = ({ onClose, onCreated }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selected, setSelected] = useState<SelectedExercise[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await workoutService.getExercises();
      if (res?.data) setExercises(res.data as Exercise[]);
    })();
  }, []);

  function toggleExercise(exId: string) {
    setSelected(prev => {
      const exists = prev.find(p => p.exerciseId === exId);
      if (exists) return prev.filter(p => p.exerciseId !== exId);
      return [...prev, { exerciseId: exId, sets: 3, repsMin: 8, repsMax: 12, restSeconds: 60, dayOfWeek: 1 }];
    });
  }

  function updateSelected(exId: string, patch: Partial<SelectedExercise>) {
    setSelected(prev => prev.map(p => p.exerciseId === exId ? { ...p, ...patch } : p));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      userId: null,
      name,
      description,
      goal: 'general',
      difficultyLevel: 'intermediate',
      durationWeeks: 4,
      daysPerWeek: 3,
      generatedByAi: false,
      isActive: true,
      exercises: selected.map(s => ({
        exerciseId: s.exerciseId,
        dayOfWeek: s.dayOfWeek ?? 1,
        orderInDay: 1,
        sets: s.sets ?? 3,
        repsMin: s.repsMin ?? null,
        repsMax: s.repsMax ?? null,
        restSeconds: s.restSeconds ?? null,
      }))
    };

    const res = await workoutService.createWorkout(payload as any);
    setLoading(false);
    if (res?.data) {
      onCreated?.();
      onClose();
    } else {
      alert('Error creando rutina');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-base font-semibold text-gray-800">Nombre</label>
        <input value={name} onChange={e => setName(e.target.value)} className="mt-2 block w-full rounded-md border border-gray-200 p-3 text-base" />
      </div>

      <div>
        <label className="block text-base font-semibold text-gray-800">Descripción</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-2 block w-full rounded-md border border-gray-200 p-3 text-base" />
      </div>

      <div>
        <label className="block text-base font-semibold text-gray-800">Ejercicios (selección)</label>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-auto">
          {exercises.map(ex => {
            const sel = selected.find(s => s.exerciseId === ex.id);
            return (
              <div key={ex.id} className={`p-3 rounded border ${sel ? 'border-orange-400 bg-orange-50' : 'border-gray-200'} min-h-[88px]`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-base">{ex.name}</div>
                    <div className="text-sm text-gray-500">{ex.category}</div>
                  </div>
                  <button type="button" onClick={() => toggleExercise(String(ex.id))} className="px-4 py-2 bg-white border rounded text-sm">{sel ? 'Quitar' : 'Agregar'}</button>
                </div>

                {sel && (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <label className="block text-xs text-gray-600">Día</label>
                      <select value={String(sel.dayOfWeek ?? 1)} onChange={e => updateSelected(sel.exerciseId, { dayOfWeek: Number(e.target.value) })} className="mt-1 border p-2 rounded text-base w-full">
                        <option value="1">Día 1</option>
                        <option value="2">Día 2</option>
                        <option value="3">Día 3</option>
                        <option value="4">Día 4</option>
                        <option value="5">Día 5</option>
                        <option value="6">Día 6</option>
                        <option value="7">Día 7</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600">Series</label>
                      <input value={String(sel.sets ?? '')} onChange={e => updateSelected(sel.exerciseId, { sets: Number(e.target.value) })} className="mt-1 border p-2 rounded text-base w-full" />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600">Reps</label>
                      <input value={String(sel.repsMin ?? '')} onChange={e => updateSelected(sel.exerciseId, { repsMin: Number(e.target.value) })} className="mt-1 border p-2 rounded text-base w-full" />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600">Descanso (s)</label>
                      <input value={String(sel.restSeconds ?? '')} onChange={e => updateSelected(sel.exerciseId, { restSeconds: Number(e.target.value) })} className="mt-1 border p-2 rounded text-base w-full" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-center mt-6">
        <button type="button" onClick={onClose} className="px-4 py-3 border rounded text-base">Cancelar</button>
        <button type="submit" disabled={loading || !name} className="px-5 py-3 bg-orange-500 text-white rounded text-base">{loading ? 'Creando...' : 'Crear rutina'}</button>
      </div>
    </form>
  );
};

export default CreateWorkoutForm;
