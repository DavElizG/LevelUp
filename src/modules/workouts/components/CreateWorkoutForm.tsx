import React, { useEffect, useState } from 'react';
import workoutService from '../services/workoutService';
import type { Exercise, CreateWorkoutData } from '../../../shared/types/workout.types';

interface Props {
  onClose: () => void;
  onCreated?: () => void;
}

interface SelectedExercise {
  exerciseId: string;
  sets: number;
  repsMin: number;
  repsMax: number;
  restSeconds: number;
  dayOfWeek: number;
  orderInDay: number;
}

const CreateWorkoutForm: React.FC<Props> = ({ onClose, onCreated }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selected, setSelected] = useState<SelectedExercise[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadExercises = async () => {
      const res = await workoutService.getExercises();
      if (res?.data) setExercises(res.data);
    };
    loadExercises();
  }, []);

  function toggleExercise(exId: string) {
    setSelected(prev => {
      const exists = prev.find(p => p.exerciseId === exId);
      if (exists) return prev.filter(p => p.exerciseId !== exId);
      return [...prev, { 
        exerciseId: exId, 
        sets: 3, 
        repsMin: 8, 
        repsMax: 12, 
        restSeconds: 60, 
        dayOfWeek: 1,
        orderInDay: prev.length + 1
      }];
    });
  }

  function updateSelected(exId: string, patch: Partial<SelectedExercise>) {
    setSelected(prev => prev.map(p => p.exerciseId === exId ? { ...p, ...patch } : p));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Por favor ingresa un nombre para la rutina');
      return;
    }

    if (selected.length === 0) {
      alert('Por favor selecciona al menos un ejercicio');
      return;
    }

    setLoading(true);

    const payload: CreateWorkoutData = {
      name: name.trim(),
      description: description.trim() || undefined,
      goal: 'general',
      difficultyLevel: 'intermediate',
      durationWeeks: 4,
      daysPerWeek: 3,
      generatedByAi: false,
      isActive: true,
      exercises: selected.map(s => ({
        exerciseId: s.exerciseId,
        dayOfWeek: s.dayOfWeek,
        orderInDay: s.orderInDay,
        sets: s.sets,
        repsMin: s.repsMin,
        repsMax: s.repsMax,
        restSeconds: s.restSeconds,
      }))
    };

    const res = await workoutService.createWorkout(payload);
    setLoading(false);
    
    if (res?.data) {
      onCreated?.();
      onClose();
    } else {
      alert('Error al crear la rutina. Por favor intenta nuevamente.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 bg-white rounded-lg">
      <h2 className="text-2xl font-bold text-gray-900">Crear Nueva Rutina</h2>
      
      <div>
        <label className="block text-base font-semibold text-gray-800 mb-2">
          Nombre de la rutina *
        </label>
        <input 
          type="text"
          value={name} 
          onChange={e => setName(e.target.value)} 
          placeholder="Ej: Rutina Full Body"
          className="block w-full rounded-lg border-2 border-gray-300 p-3 text-base focus:border-orange-500 focus:outline-none transition-colors"
          required
        />
      </div>

      <div>
        <label className="block text-base font-semibold text-gray-800 mb-2">
          Descripción (opcional)
        </label>
        <textarea 
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          placeholder="Describe los objetivos de esta rutina..."
          rows={3}
          className="block w-full rounded-lg border-2 border-gray-300 p-3 text-base focus:border-orange-500 focus:outline-none transition-colors resize-none"
        />
      </div>

      <div>
        <label className="block text-base font-semibold text-gray-800 mb-3">
          Ejercicios * ({selected.length} seleccionados)
        </label>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-2">
          {exercises.map(ex => {
            const sel = selected.find(s => s.exerciseId === ex.id);
            const isSelected = !!sel;
            
            return (
              <div 
                key={ex.id} 
                className={`p-4 rounded-lg border-2 transition-all ${
                  isSelected 
                    ? 'border-orange-500 bg-orange-50 shadow-md' 
                    : 'border-gray-200 bg-white hover:border-orange-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-semibold text-base text-gray-900">{ex.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {ex.category} • {ex.muscleGroups?.join(', ')}
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => toggleExercise(ex.id)} 
                    className={`ml-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-orange-500'
                    }`}
                  >
                    {isSelected ? '✓ Agregado' : '+ Agregar'}
                  </button>
                </div>

                {sel && (
                  <div className="mt-4 pt-3 border-t-2 border-orange-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Día</label>
                        <select 
                          value={sel.dayOfWeek} 
                          onChange={e => updateSelected(sel.exerciseId, { dayOfWeek: Number(e.target.value) })} 
                          className="w-full border-2 border-gray-300 p-2 rounded-md text-sm focus:border-orange-500 focus:outline-none"
                        >
                          <option value={1}>Día 1</option>
                          <option value={2}>Día 2</option>
                          <option value={3}>Día 3</option>
                          <option value={4}>Día 4</option>
                          <option value={5}>Día 5</option>
                          <option value={6}>Día 6</option>
                          <option value={7}>Día 7</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Series</label>
                        <input 
                          type="number"
                          min={1}
                          max={10}
                          value={sel.sets} 
                          onChange={e => updateSelected(sel.exerciseId, { sets: Number(e.target.value) })} 
                          className="w-full border-2 border-gray-300 p-2 rounded-md text-sm focus:border-orange-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Reps (min-max)</label>
                        <div className="flex gap-1 items-center">
                          <input 
                            type="number"
                            min={1}
                            max={50}
                            value={sel.repsMin} 
                            onChange={e => updateSelected(sel.exerciseId, { repsMin: Number(e.target.value) })} 
                            className="w-full border-2 border-gray-300 p-2 rounded-md text-sm focus:border-orange-500 focus:outline-none"
                          />
                          <span className="text-gray-500">-</span>
                          <input 
                            type="number"
                            min={1}
                            max={50}
                            value={sel.repsMax} 
                            onChange={e => updateSelected(sel.exerciseId, { repsMax: Number(e.target.value) })} 
                            className="w-full border-2 border-gray-300 p-2 rounded-md text-sm focus:border-orange-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Descanso (seg)</label>
                        <input 
                          type="number"
                          min={15}
                          max={300}
                          step={15}
                          value={sel.restSeconds} 
                          onChange={e => updateSelected(sel.exerciseId, { restSeconds: Number(e.target.value) })} 
                          className="w-full border-2 border-gray-300 p-2 rounded-md text-sm focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t-2 border-gray-200">
        <button 
          type="button" 
          onClick={onClose} 
          className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          disabled={loading || !name.trim() || selected.length === 0} 
          className="w-full sm:w-auto px-8 py-3 bg-orange-500 text-white rounded-lg text-base font-semibold hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md"
        >
          {loading ? 'Creando...' : 'Crear Rutina'}
        </button>
      </div>
    </form>
  );
};

export default CreateWorkoutForm;
