import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Clock, 
  Plus, 
  Minus, 
  Check, 
  ChevronRight,
  SkipForward,
  X
} from 'lucide-react';
import { useWorkoutSession } from '../modules/workouts/hooks';
import workoutService from '../modules/workouts/services/workoutService';
import type { Exercise, RoutineExercise } from '../shared/types/workout.types';

interface WorkoutExecutionPageProps {
  routineId?: string;
}

const WorkoutExecutionPage: React.FC<WorkoutExecutionPageProps> = ({
  routineId: propRoutineId
}) => {
  const { routineId: urlRoutineId } = useParams();
  const navigate = useNavigate();

  const routineId = propRoutineId || urlRoutineId;
  
  // Estados para la rutina
  const [routineData, setRoutineData] = React.useState<{
    id: string;
    name: string;
    exercises: (Exercise & { sets?: number; repsMin?: number; repsMax?: number; restSeconds?: number; dayOfWeek?: number })[];
    totalDays: number;
  } | null>(null);
  const [loadingRoutine, setLoadingRoutine] = React.useState(true);
  const [routineError, setRoutineError] = React.useState<string | null>(null);
  const [currentDay, setCurrentDay] = React.useState<number>(1);

  // Estados para inputs y temporizador
  const [reps, setReps] = React.useState<number>(0);
  const [weight, setWeight] = React.useState<number>(0);
  const [isSaving, setIsSaving] = React.useState(false);
  const [restTimer, setRestTimer] = React.useState<number>(180); // Default: 3 minutos
  const [restInterval, setRestInterval] = React.useState<NodeJS.Timeout | null>(null);
  const [isTimerRunning, setIsTimerRunning] = React.useState<boolean>(false);
  const [customRestTime, setCustomRestTime] = React.useState<string>('');

  // Cargar rutina
  React.useEffect(() => {
    const loadRoutineData = async () => {
      if (!routineId) {
        setRoutineError('ID de rutina no proporcionado');
        setLoadingRoutine(false);
        return;
      }

      try {
        setLoadingRoutine(true);
        const result = await workoutService.getWorkout(routineId);
        
        if (result.error || !result.data) {
          const errorMessage = typeof result.error === 'string' ? result.error : 'No se pudo cargar la rutina';
          throw new Error(errorMessage);
        }

        const routine = result.data;
        
        // Mapear ejercicios con todos los campos incluyendo dayOfWeek
        const allExercises = (routine.exercises || []).map((routineExercise: RoutineExercise) => ({
          id: routineExercise.exerciseId || routineExercise.id,
          name: routineExercise.exercise?.name || 'Ejercicio sin nombre',
          category: routineExercise.exercise?.category || 'general',
          muscleGroups: routineExercise.exercise?.muscleGroups || [],
          description: routineExercise.exercise?.description || routineExercise.notes || '',
          equipment: routineExercise.exercise?.equipment,
          createdAt: routineExercise.exercise?.createdAt || new Date().toISOString(),
          updatedAt: routineExercise.exercise?.updatedAt || new Date().toISOString(),
          sets: routineExercise.sets || 3,
          repsMin: routineExercise.repsMin || 8,
          repsMax: routineExercise.repsMax || 12,
          restSeconds: routineExercise.restSeconds || 60,
          orderInDay: routineExercise.orderInDay || 0,
          dayOfWeek: routineExercise.dayOfWeek || 1
        }));

        // Calcular total de días únicos
        const uniqueDays = [...new Set(allExercises.map(ex => ex.dayOfWeek))];
        const totalDays = uniqueDays.length;

        // Filtrar ejercicios solo del día actual
        const dayExercises = allExercises
          .filter(ex => ex.dayOfWeek === currentDay)
          .sort((a, b) => a.orderInDay - b.orderInDay);

        if (dayExercises.length === 0 && allExercises.length > 0) {
          throw new Error(`No hay ejercicios configurados para el día ${currentDay}`);
        }

        setRoutineData({
          id: routine.id,
          name: routine.name,
          exercises: dayExercises,
          totalDays
        });

        setRoutineError(null);
      } catch (error) {
        console.error('Error cargando rutina:', error);
        setRoutineError(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setLoadingRoutine(false);
      }
    };

    loadRoutineData();
  }, [routineId, currentDay]);

  // Hook de sesión
  const {
    session,
    isLoading,
    error,
    currentExercise,
    progress,
    completeSet,
    nextExercise,
    startRest,
    pauseSession,
    completeSession,
    getProgressUrl,
    isWorkoutComplete
  } = useWorkoutSession({
    routineId: routineId || '',
    routineName: routineData?.name || '',
    exercises: routineData?.exercises || []
  });

  // Actualizar URL con progreso
  React.useEffect(() => {
    const progressUrl = getProgressUrl();
    if (progressUrl && globalThis.location.pathname !== progressUrl) {
      navigate(progressUrl, { replace: true });
    }
  }, [getProgressUrl, navigate]);

  // Limpiar timer al desmontar
  React.useEffect(() => {
    return () => {
      if (restInterval) clearInterval(restInterval);
    };
  }, [restInterval]);

  // Datos del ejercicio actual
  const currentExerciseData = routineData?.exercises[progress.exerciseIndex];
  const totalSets = currentExerciseData?.sets || 3;
  const recommendedReps = `${currentExerciseData?.repsMin || 8}-${currentExerciseData?.repsMax || 12}`;
  const recommendedRestTime = currentExerciseData?.restSeconds || 60;

  // Funciones de temporizador mejoradas
  const startRestCountdown = (seconds: number) => {
    setRestTimer(seconds);
    setIsTimerRunning(true);
    
    if (restInterval) clearInterval(restInterval);
    
    const interval = setInterval(() => {
      setRestTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setRestInterval(null);
          setIsTimerRunning(false);
          
          // Vibración en móvil cuando termina el timer
          if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
          }
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setRestInterval(interval);
  };

  const pauseRestCountdown = () => {
    if (restInterval) {
      clearInterval(restInterval);
      setRestInterval(null);
      setIsTimerRunning(false);
    }
  };

  const resumeRestCountdown = () => {
    if (restTimer > 0 && !isTimerRunning) {
      startRestCountdown(restTimer);
    }
  };

  const stopRestCountdown = () => {
    if (restInterval) {
      clearInterval(restInterval);
      setRestInterval(null);
    }
    setRestTimer(0);
    setIsTimerRunning(false);
  };

  const adjustRestTime = (delta: number) => {
    const newTime = Math.max(0, restTimer + delta);
    setRestTimer(newTime);
  };

  const setCustomRest = () => {
    const seconds = Number.parseInt(customRestTime, 10);
    if (!Number.isNaN(seconds) && seconds > 0) {
      startRestCountdown(seconds);
      setCustomRestTime('');
    }
  };

  // Handlers
  const handleCompleteSet = async () => {
    if (reps === 0) {
      alert('⚠️ Por favor ingresa las repeticiones realizadas');
      return;
    }

    // Validar que no se exceda el máximo de series
    if (progress.setNumber > totalSets) {
      alert('⚠️ Ya completaste todas las series de este ejercicio');
      return;
    }
    
    setIsSaving(true);
    const success = await completeSet(reps, weight || undefined);
    
    if (success) {
      setReps(0);
      setWeight(0);
      
      // Si aún quedan series, iniciar temporizador
      if (progress.setNumber < totalSets) {
        startRestCountdown(recommendedRestTime);
        await startRest(recommendedRestTime);
      } else {
        alert('✅ ¡Ejercicio completado! Pasa al siguiente cuando estés listo.');
      }
    }
    setIsSaving(false);
  };

  const handlePreviousExercise = () => {
    if (progress.exerciseIndex > 0) {
      const newIndex = progress.exerciseIndex - 1;
      navigate(`/workouts/${routineId}/${newIndex}/1`, { replace: true });
    }
  };

  const handleNextExercise = async () => {
    const isLast = progress.exerciseIndex >= progress.totalExercises - 1;
    
    if (isLast) {
      // Es el último ejercicio del día
      const shouldComplete = globalThis.confirm('¡Has completado todos los ejercicios del día! ¿Terminar rutina por hoy?');
      if (shouldComplete) {
        await completeSession();
        
        // Verificar si hay más días
        if (routineData && currentDay < routineData.totalDays) {
          const goToNextDay = globalThis.confirm(`¡Excelente trabajo! ¿Quieres empezar el Día ${currentDay + 1}?`);
          if (goToNextDay) {
            setCurrentDay(currentDay + 1);
            navigate(`/workouts/${routineId}/0/1`, { replace: true });
          } else {
            navigate('/workouts');
          }
        } else {
          alert('🎉 ¡Rutina completada! Has terminado todos los días.');
          navigate('/workouts');
        }
      }
    } else {
      // No es el último, continuar normalmente
      const success = await nextExercise(true);
      if (!success) {
        alert('⚠️ Error al pasar al siguiente ejercicio');
      }
    }
  };

  const handleSkipExercise = async () => {
    const shouldSkip = globalThis.confirm('¿Saltar este ejercicio sin guardarlo como completado?');
    if (shouldSkip) {
      const success = await nextExercise(false);
      if (success && isWorkoutComplete()) {
        navigate('/workouts');
      }
      return success;
    }
    return false;
  };

  const handleStartRest = async (seconds: number) => {
    return await startRest(seconds);
  };

  const handlePauseWorkout = async () => {
    const success = await pauseSession();
    if (success) {
      navigate('/workouts');
    }
    return success;
  };

  const handleExit = () => {
    if (globalThis.confirm('¿Seguro que quieres salir? Tu progreso se guardará.')) {
      navigate('/workouts');
    }
  };

  // Determinar mensaje del temporizador
  const getRestMessage = () => {
    if (restTimer > 45) return '💪 Relájate';
    if (restTimer > 15) return '⚡ Prepárate';
    return '🔥 ¡Casi listo!';
  };

  // Renderizado de estados de carga y error
  if (loadingRoutine) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando rutina...</p>
        </div>
      </div>
    );
  }

  if (routineError || !routineData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-red-50 p-6 rounded-lg">
          <div className="text-red-600 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error cargando rutina</h3>
          <p className="text-red-600 mb-4">{routineError || 'Rutina no encontrada'}</p>
          <button
            onClick={() => navigate('/workouts')}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Volver a Entrenamientos
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando entrenamiento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-red-50 p-6 rounded-lg">
          <div className="text-red-600 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error en el entrenamiento</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/workouts')}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Volver a Entrenamientos
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No se pudo cargar la sesión de entrenamiento</p>
          <button
            onClick={() => navigate('/workouts')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Volver a Entrenamientos
          </button>
        </div>
      </div>
    );
  }

  // Renderizado principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header con progreso */}
      <div className="bg-white shadow-lg border-b-2 border-orange-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Fila superior: Botón Volver + Indicador de Día */}
          <div className="flex items-center justify-between mb-3">
            {/* Botón Volver */}
            <button
              onClick={handleExit}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px]"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Volver</span>
            </button>

            {/* Indicador de Día */}
            {routineData && routineData.totalDays > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-600">Día {currentDay} de {routineData.totalDays}</span>
                <select
                  value={currentDay}
                  onChange={(e) => {
                    const newDay = Number(e.target.value);
                    setCurrentDay(newDay);
                    navigate(`/workouts/${routineId}/0/1`, { replace: true });
                  }}
                  className="text-sm border-2 border-blue-300 rounded-lg px-2 py-1 bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {Array.from({ length: routineData.totalDays }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>Día {day}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{routineData.name}</h1>
              <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm">
                <span className="text-gray-600">
                  <span className="font-medium text-orange-600">{progress.exerciseIndex + 1}</span>
                  /{progress.totalExercises} ejercicios
                </span>
                <span className="text-gray-400 hidden md:inline">•</span>
                <span className="text-gray-600">
                  <span className="font-medium text-blue-600">{progress.setNumber}</span>
                  /{totalSets} series
                </span>
                <span className="text-gray-400 hidden md:inline">•</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  {progress.completedExercises} completados
                </span>
              </div>
            </div>
            <button
              onClick={handlePauseWorkout}
              className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm md:text-base font-medium hover:bg-yellow-600 transition-all shadow-md hover:shadow-lg min-h-[44px]"
            >
              <Pause className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden md:inline">Pausar</span>
            </button>
          </div>

          {/* Barra de progreso mejorada con cálculo correcto */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Progreso del entrenamiento</span>
              <span>{Math.min(100, Math.round(((progress.exerciseIndex + (Math.min(progress.setNumber, totalSets) / totalSets)) / progress.totalExercises) * 100))}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${Math.min(100, ((progress.exerciseIndex + (Math.min(progress.setNumber, totalSets) / totalSets)) / progress.totalExercises) * 100)}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interfaz de ejecución mejorada */}
      <div className="max-w-4xl mx-auto p-4">
        {currentExercise ? (
          <div className="space-y-4">
            {/* Card principal del ejercicio */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden">
              {/* Header del ejercicio */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                <h2 className="text-2xl font-bold text-white mb-2">{currentExercise.name}</h2>
                <div className="flex flex-wrap gap-2">
                  {currentExercise.muscleGroups.map(muscle => (
                    <span key={muscle} className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                      {muscle}
                    </span>
                  ))}
                </div>
              </div>

              {/* Cuerpo del ejercicio */}
              <div className="p-6">
                {currentExercise.description && (
                  <p className="text-gray-600 mb-6 leading-relaxed">{currentExercise.description}</p>
                )}

                {/* Indicador de serie actual */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border-2 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 mb-1">Serie Actual</p>
                      <p className="text-4xl font-bold text-blue-700">{progress.setNumber} <span className="text-2xl text-blue-400">de {totalSets}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-600 mb-1">Repeticiones recomendadas</p>
                      <p className="text-2xl font-bold text-blue-700">{recommendedReps}</p>
                    </div>
                  </div>
                </div>

                {/* Inputs para registrar serie - Optimizados para móvil */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label htmlFor="reps-input" className="block text-base font-semibold text-gray-700 mb-2">
                      Repeticiones realizadas *
                    </label>
                    <input 
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      min="1"
                      value={reps || ''}
                      onChange={(e) => setReps(Number(e.target.value))}
                      placeholder="Ej: 10"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-4 text-lg font-medium focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all min-h-[48px]"
                      id="reps-input"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="weight-input" className="block text-base font-semibold text-gray-700 mb-2">
                      Peso usado (kg)
                    </label>
                    <input 
                      type="number"
                      inputMode="decimal"
                      step="0.5"
                      min="0"
                      value={weight || ''}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      placeholder="Ej: 50"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-4 text-lg font-medium focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all min-h-[48px]"
                      id="weight-input"
                    />
                  </div>
                </div>

                {/* Botón Completar Serie - Con validación de máximo */}
                <button
                  onClick={handleCompleteSet}
                  disabled={isSaving || reps === 0 || progress.setNumber > totalSets}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl font-bold text-base md:text-lg hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 md:gap-3 min-h-[52px]"
                >
                  {(() => {
                    if (isSaving) {
                      return (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Guardando...
                        </>
                      );
                    }
                    
                    if (progress.setNumber > totalSets) {
                      return (
                        <>
                          <X className="w-5 h-5 md:w-6 md:h-6" />
                          Todas las series completadas
                        </>
                      );
                    }
                    
                    return (
                      <>
                        <Check className="w-5 h-5 md:w-6 md:h-6" />
                        Completar Serie {Math.min(progress.setNumber, totalSets)}/{totalSets}
                      </>
                    );
                  })()}
                </button>
              </div>
            </div>

            {/* Temporizador de descanso mejorado */}
            {restTimer > 0 && (
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-4 md:p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-xs md:text-sm font-medium text-blue-100 mb-1">Tiempo de descanso</p>
                    <div className="flex items-baseline gap-2 md:gap-3">
                      <span className="text-4xl md:text-6xl font-bold font-mono">
                        {Math.floor(restTimer / 60)}:{(restTimer % 60).toString().padStart(2, '0')}
                      </span>
                      <span className="text-base md:text-xl text-blue-200">
                        {getRestMessage()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Controles del temporizador */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                  <button
                    onClick={() => adjustRestTime(-30)}
                    className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium text-sm transition-all min-h-[44px] flex items-center justify-center gap-1"
                  >
                    <Minus className="w-4 h-4" />
                    30s
                  </button>
                  <button
                    onClick={() => adjustRestTime(30)}
                    className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium text-sm transition-all min-h-[44px] flex items-center justify-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    30s
                  </button>
                  <button
                    onClick={isTimerRunning ? pauseRestCountdown : resumeRestCountdown}
                    className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium text-sm transition-all min-h-[44px] flex items-center justify-center gap-1"
                  >
                    {isTimerRunning ? (
                      <>
                        <Pause className="w-4 h-4" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Continuar
                      </>
                    )}
                  </button>
                  <button
                    onClick={stopRestCountdown}
                    className="px-3 py-2 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-all shadow-lg text-sm min-h-[44px] flex items-center justify-center gap-1"
                  >
                    <SkipForward className="w-4 h-4" />
                    Saltar
                  </button>
                </div>

                {/* Barra de progreso */}
                <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-white h-2 rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${((recommendedRestTime - restTimer) / recommendedRestTime) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Botones de descanso manual mejorados */}
            {restTimer === 0 && progress.setNumber < totalSets && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      startRestCountdown(60);
                      handleStartRest(60);
                    }}
                    className="bg-white border-2 border-blue-300 text-blue-600 px-4 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 min-h-[48px] text-sm md:text-base"
                  >
                    <Clock className="w-4 h-4 md:w-5 md:h-5" />
                    60s
                  </button>
                  
                  <button
                    onClick={() => {
                      startRestCountdown(90);
                      handleStartRest(90);
                    }}
                    className="bg-white border-2 border-blue-300 text-blue-600 px-4 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 min-h-[48px] text-sm md:text-base"
                  >
                    <Clock className="w-4 h-4 md:w-5 md:h-5" />
                    90s
                  </button>

                  <button
                    onClick={() => {
                      startRestCountdown(180);
                      handleStartRest(180);
                    }}
                    className="bg-white border-2 border-blue-300 text-blue-600 px-4 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 min-h-[48px] text-sm md:text-base col-span-2 md:col-span-1"
                  >
                    <Clock className="w-4 h-4 md:w-5 md:h-5" />
                    3 min
                  </button>
                </div>

                {/* Input personalizado */}
                <div className="flex gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={customRestTime}
                    onChange={(e) => setCustomRestTime(e.target.value)}
                    placeholder="Segundos personalizados"
                    className="flex-1 border-2 border-blue-300 rounded-lg px-4 py-3 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none min-h-[48px]"
                  />
                  <button
                    onClick={setCustomRest}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition-all shadow-md min-h-[48px]"
                  >
                    Iniciar
                  </button>
                </div>
              </div>
            )}

            {/* Botones de navegación mejorados */}
            {progress.setNumber >= totalSets && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Botón Ejercicio Anterior */}
                  <button
                    onClick={handlePreviousExercise}
                    disabled={progress.exerciseIndex === 0}
                    className="bg-white border-2 border-gray-300 text-gray-700 px-4 py-4 rounded-xl font-bold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 min-h-[52px]"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Ejercicio Anterior
                  </button>

                  {/* Botón Siguiente Ejercicio / Terminar Rutina */}
                  <button
                    onClick={handleNextExercise}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-4 rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 min-h-[52px]"
                  >
                    {progress.exerciseIndex >= progress.totalExercises - 1 ? (
                      <>
                        <Check className="w-5 h-5" />
                        Terminar Rutina por Hoy
                      </>
                    ) : (
                      <>
                        Siguiente Ejercicio
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
                
                <button
                  onClick={handleSkipExercise}
                  className="w-full bg-white border-2 border-gray-300 text-gray-600 px-4 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all shadow-md hover:shadow-lg text-sm min-h-[48px]"
                >
                  Saltar este Ejercicio
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl shadow-md">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-600 text-lg">No hay ejercicio actual disponible</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutExecutionPage;
