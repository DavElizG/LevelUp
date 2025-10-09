import React, { useState, useEffect } from 'react';
import type { WorkoutRoutine, ExerciseExecutionState, ActiveWorkoutSession } from '../../../shared/types/workout.types';
import workoutService from '../services/workoutService';

interface Props {
  routine: WorkoutRoutine;
  onComplete: () => void;
  onCancel: () => void;
}

const WorkoutExecutionScreen: React.FC<Props> = ({ routine, onComplete, onCancel }) => {
  const [session, setSession] = useState<ActiveWorkoutSession | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [repsInput, setRepsInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const res = await workoutService.startWorkoutSession(routine.id);
      
      if (res?.data && routine.exercises) {
        const exercises: ExerciseExecutionState[] = routine.exercises.map(re => ({
          routineExerciseId: re.id,
          exercise: re.exercise!,
          totalSets: re.sets,
          currentSet: 1,
          repsMin: re.repsMin,
          repsMax: re.repsMax,
          restSeconds: re.restSeconds,
          weightKg: re.weightKg,
          skipped: false,
          completed: false,
          repsPerformed: [],
          weightUsedKg: [],
          restTimeSeconds: [],
        }));

        setSession({
          sessionId: res.data.id,
          routineId: routine.id,
          routineName: routine.name,
          startTime: new Date().toISOString(),
          exercises,
          currentExerciseIndex: 0,
        });
      }
      setLoading(false);
    };
    
    init();
  }, [routine]);

  const currentExercise = session?.exercises[currentExerciseIndex];

  const handleCompleteSet = () => {
    if (!currentExercise || !repsInput) return;

    const updatedExercises = [...(session?.exercises || [])];
    const exercise = updatedExercises[currentExerciseIndex];
    
    exercise.repsPerformed.push(Number(repsInput));
    exercise.weightUsedKg.push(Number(weightInput) || 0);
    exercise.currentSet += 1;

    setSession(prev => prev ? { ...prev, exercises: updatedExercises } : null);
    setRepsInput('');
    setWeightInput('');

    // Si quedan series, iniciar descanso
    if (exercise.currentSet <= exercise.totalSets) {
      setCurrentSet(exercise.currentSet);
      if (exercise.restSeconds) {
        setRestTimer(exercise.restSeconds);
        setIsResting(true);
      }
    } else {
      // Ejercicio completado
      exercise.completed = true;
      moveToNextExercise();
    }
  };

  const handleSkipExercise = () => {
    if (!session) return;

    const updatedExercises = [...session.exercises];
    updatedExercises[currentExerciseIndex].skipped = true;
    setSession({ ...session, exercises: updatedExercises });
    moveToNextExercise();
  };

  const moveToNextExercise = () => {
    if (!session) return;

    if (currentExerciseIndex < session.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSet(1);
      setRepsInput('');
      setWeightInput('');
    } else {
      finishWorkout();
    }
  };

  const finishWorkout = async () => {
    if (!session) return;

    setLoading(true);

    // Guardar logs de ejercicios
    for (const exercise of session.exercises) {
      if (!exercise.skipped) {
        await workoutService.logExercise(session.sessionId, {
          sessionId: session.sessionId,
          exerciseId: exercise.exercise.id,
          orderPerformed: session.exercises.indexOf(exercise) + 1,
          setsCompleted: exercise.repsPerformed.length,
          repsPerformed: exercise.repsPerformed,
          weightUsedKg: exercise.weightUsedKg,
          restTimeSeconds: exercise.restTimeSeconds,
          skipped: false,
        });
      } else {
        await workoutService.logExercise(session.sessionId, {
          sessionId: session.sessionId,
          exerciseId: exercise.exercise.id,
          orderPerformed: session.exercises.indexOf(exercise) + 1,
          setsCompleted: 0,
          repsPerformed: [],
          weightUsedKg: [],
          skipped: true,
        });
      }
    }

    // Finalizar sesión
    await workoutService.endWorkoutSession(session.sessionId, 5, 'Rutina completada');
    setLoading(false);
    onComplete();
  };

  const handleCancel = async () => {
    if (session && window.confirm('¿Estás seguro de cancelar el entrenamiento?')) {
      await workoutService.endWorkoutSession(session.sessionId, undefined, 'Cancelado por usuario');
      onCancel();
    } else if (!session) {
      onCancel();
    }
  };

  if (loading || !session || !currentExercise) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando entrenamiento...</p>
        </div>
      </div>
    );
  }

  const progress = ((currentExerciseIndex / session.exercises.length) * 100).toFixed(0);
  const setsRemaining = currentExercise.totalSets - currentExercise.currentSet + 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{routine.name}</h1>
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
          >
            Cancelar
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-2">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Ejercicio {currentExerciseIndex + 1} de {session.exercises.length}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-orange-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Exercise Card */}
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {currentExercise.exercise.name}
          </h2>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full font-medium">
              {currentExercise.exercise.category}
            </span>
            {currentExercise.exercise.muscleGroups?.map(mg => (
              <span key={mg} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                {mg}
              </span>
            ))}
          </div>
        </div>

        {/* Set Info */}
        <div className="bg-orange-50 rounded-xl p-6 mb-6">
          <div className="text-center mb-4">
            <div className="text-6xl font-bold text-orange-600">
              Serie {currentSet}
            </div>
            <div className="text-lg text-gray-600 mt-2">
              de {currentExercise.totalSets} series
            </div>
          </div>

          {currentExercise.repsMin && (
            <div className="text-center text-gray-700 mb-2">
              <span className="text-2xl font-semibold">
                {currentExercise.repsMin}
                {currentExercise.repsMax && currentExercise.repsMax !== currentExercise.repsMin 
                  ? ` - ${currentExercise.repsMax}` 
                  : ''
                } reps
              </span>
            </div>
          )}
        </div>

        {/* Rest Timer */}
        {isResting && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6 text-center">
            <div className="text-sm text-blue-700 mb-2 font-medium">DESCANSANDO</div>
            <div className="text-6xl font-bold text-blue-600 mb-2">
              {Math.floor(restTimer / 60)}:{String(restTimer % 60).padStart(2, '0')}
            </div>
            <button
              onClick={() => {
                setIsResting(false);
                setRestTimer(0);
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Saltar descanso
            </button>
          </div>
        )}

        {/* Input Form */}
        {!isResting && (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Repeticiones realizadas *
              </label>
              <input
                type="number"
                value={repsInput}
                onChange={e => setRepsInput(e.target.value)}
                placeholder="Ej: 10"
                min={1}
                className="w-full border-2 border-gray-300 rounded-lg p-4 text-2xl text-center focus:border-orange-500 focus:outline-none"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Peso usado (kg) - Opcional
              </label>
              <input
                type="number"
                value={weightInput}
                onChange={e => setWeightInput(e.target.value)}
                placeholder="Ej: 20"
                min={0}
                step={0.5}
                className="w-full border-2 border-gray-300 rounded-lg p-4 text-2xl text-center focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!isResting && (
          <div className="flex flex-col gap-3">
            <button
              onClick={handleCompleteSet}
              disabled={!repsInput}
              className="w-full py-4 bg-orange-500 text-white rounded-xl text-xl font-bold hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md"
            >
              {setsRemaining > 1 ? `Completar Serie (${setsRemaining - 1} restantes)` : 'Completar Ejercicio'}
            </button>

            <button
              onClick={handleSkipExercise}
              className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Saltar Ejercicio
            </button>
          </div>
        )}

        {/* Previous Sets */}
        {currentExercise.repsPerformed.length > 0 && (
          <div className="mt-6 pt-6 border-t-2 border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Series completadas:</h3>
            <div className="space-y-2">
              {currentExercise.repsPerformed.map((reps, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <span className="text-gray-600">Serie {idx + 1}</span>
                  <div className="text-gray-900 font-medium">
                    {reps} reps
                    {currentExercise.weightUsedKg[idx] > 0 && (
                      <span className="text-gray-500"> @ {currentExercise.weightUsedKg[idx]} kg</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      {currentExercise.exercise.instructions && (
        <div className="max-w-2xl mx-auto bg-blue-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Instrucciones:</h3>
          <p className="text-blue-800 text-sm leading-relaxed">
            {currentExercise.exercise.instructions}
          </p>
        </div>
      )}
    </div>
  );
};

export default WorkoutExecutionScreen;
