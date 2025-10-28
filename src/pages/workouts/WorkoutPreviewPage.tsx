import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Dumbbell, Play, Edit, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import BottomNavbar from '../../components/shared/BottomNavbar';
import workoutService from '../../modules/workouts/services/workoutService';
import type { WorkoutRoutine } from '../../shared/types/workout.types';
import { toast } from '../../hooks/useNotification';

interface ExerciseDetail {
  id: string;
  name: string;
  muscleGroups: string[];
  sets: number;
  repsMin: number;
  repsMax: number;
  restSeconds: number;
  orderInDay: number;
}

interface ExercisesByDay {
  [day: number]: ExerciseDetail[];
}

const WorkoutPreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [routine, setRoutine] = useState<WorkoutRoutine | null>(null);
  const [exercisesByDay, setExercisesByDay] = useState<ExercisesByDay>({});
  const [selectedDay, setSelectedDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRoutinePreview = async () => {
      if (!id) {
        setError('No se proporcionó ID de rutina');
        setLoading(false);
        return;
      }
    
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Loading routine with ID:', id);
        const res = await workoutService.getWorkout(id);
        
        console.log('📦 Routine response:', res);
        
        if (!res.success || !res.data) {
          console.error('❌ Failed to load routine:', res.error);
          setError(res.message || 'No se pudo cargar la rutina');
          setLoading(false);
          return;
        }
        
        const routineData = res.data;
        console.log('✅ Routine data loaded:', routineData);
        console.log('📋 Exercises count:', routineData.exercises?.length || 0);
        
        setRoutine(routineData);
        
        // Agrupar ejercicios por día
        const grouped: ExercisesByDay = {};
        
        if (routineData.exercises && Array.isArray(routineData.exercises)) {
          for (const re of routineData.exercises) {
            const day = re.dayOfWeek || 1;
            if (!grouped[day]) {
              grouped[day] = [];
            }
            
            if (re.exercise) {
              grouped[day].push({
                id: re.exercise.id,
                name: re.exercise.name,
                muscleGroups: re.exercise.muscleGroups || [],
                sets: re.sets || 0,
                repsMin: re.repsMin || 0,
                repsMax: re.repsMax || 0,
                restSeconds: re.restSeconds || 60,
                orderInDay: re.orderInDay || 0
              });
            }
          }
          
          // Ordenar ejercicios por orden en el día
          for (const day of Object.keys(grouped)) {
            grouped[Number(day)].sort((a, b) => a.orderInDay - b.orderInDay);
          }
          
          console.log('📊 Grouped exercises by day:', grouped);
        }
        
        setExercisesByDay(grouped);
        setSelectedDay(1);
        
      } catch (err) {
        console.error('❌ Error loading routine:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      loadRoutinePreview();
    }
  }, [id]);

  const handleCloneRoutine = async () => {
    if (!id) return;
    
    const res = await workoutService.clonePublicWorkout(id);
    if (res.error) {
      const errorMsg = typeof res.error === 'string' ? res.error : res.error.message;
      toast.error('Error al clonar la rutina: ' + (errorMsg || 'Error desconocido'));
    } else if (res.data) {
      toast.success('✅ Rutina clonada exitosamente');
      // Navegar a edición después de clonar
      navigate(`/workouts/${res.data.id}/edit`);
    }
  };

  const getDifficultyLabel = (level?: string) => {
    switch (level) {
      case 'beginner': return 'Principiante';
      case 'intermediate': return 'Intermedio';
      case 'advanced': return 'Avanzado';
      default: return 'Sin nivel';
    }
  };

  const getMuscleGroupLabel = (groups: string[]) => {
    if (!groups || groups.length === 0) return '';
    return groups.slice(0, 2).join(', ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-gray-50 pb-24">
        {/* Header Skeleton */}
        <div className="sticky top-0 bg-white shadow-md z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="flex-1">
                <div className="h-8 bg-gray-200 rounded-lg w-3/4 animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="h-10 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>

          {/* Level Skeleton */}
          <div className="bg-white rounded-xl p-4 mb-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>

          {/* Day Selector Skeleton */}
          <div className="bg-white rounded-xl p-4 mb-4">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 w-16 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Exercises Skeleton */}
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <BottomNavbar />
      </div>
    );
  }

  if (!routine || error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="text-center px-4">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-gray-800 font-semibold mb-2">
            {error || 'Rutina no encontrada'}
          </p>
          <p className="text-gray-600 text-sm mb-6">
            La rutina que buscas no está disponible o fue eliminada
          </p>
          <button
            onClick={() => navigate('/workouts')}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Volver a Rutinas
          </button>
        </div>
        <BottomNavbar />
      </div>
    );
  }

  const totalExercises = Object.values(exercisesByDay).reduce((sum, exercises) => sum + exercises.length, 0);
  const totalSets = Object.values(exercisesByDay).reduce(
    (sum, exercises) => sum + exercises.reduce((s: number, e: ExerciseDetail) => s + e.sets, 0), 
    0
  );
  const availableDays = Object.keys(exercisesByDay).map(Number).sort((a, b) => a - b);
  const currentDayExercises = exercisesByDay[selectedDay] || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-gray-50 pb-24">
      {/* Header Sticky */}
      <div className="sticky top-0 bg-white shadow-md z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate('/workouts')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 mt-1"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 truncate">
                {routine.name}
              </h1>
              {routine.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {routine.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border-2 border-orange-100">
            <div className="text-3xl font-bold text-orange-600">
              {routine.daysPerWeek || availableDays.length}
            </div>
            <div className="text-xs text-gray-600 mt-1">Días/semana</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border-2 border-orange-100">
            <div className="text-3xl font-bold text-orange-600">
              {totalExercises}
            </div>
            <div className="text-xs text-gray-600 mt-1">Ejercicios</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border-2 border-orange-100">
            <div className="text-3xl font-bold text-orange-600">
              {totalSets}
            </div>
            <div className="text-xs text-gray-600 mt-1">Series totales</div>
          </div>
        </div>

        {/* Nivel */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <span className="text-sm font-semibold text-gray-700">Nivel: </span>
          <span className="text-sm font-bold text-orange-600">
            {getDifficultyLabel(routine.difficultyLevel)}
          </span>
        </div>

        {/* Day Navigation */}
        {availableDays.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setSelectedDay(Math.max(1, selectedDay - 1))}
                disabled={selectedDay === availableDays[0]}
                className="p-3 rounded-lg bg-white shadow-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>

              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  Día {selectedDay}
                </div>
                <div className="text-sm text-gray-600">
                  de {routine.daysPerWeek || availableDays.length}
                </div>
              </div>

              <button
                onClick={() => setSelectedDay(Math.min(routine.daysPerWeek || availableDays.length, selectedDay + 1))}
                disabled={selectedDay === (routine.daysPerWeek || availableDays.at(-1))}
                className="p-3 rounded-lg bg-white shadow-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            {/* Day Selector Horizontal */}
            <div className="flex overflow-x-auto gap-2 pb-2 -mx-2 px-2">
              {availableDays.map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`
                    px-5 py-2.5 rounded-lg font-semibold whitespace-nowrap transition-all flex-shrink-0
                    ${selectedDay === day 
                      ? 'bg-orange-500 text-white shadow-md scale-105' 
                      : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
                    }
                  `}
                >
                  Día {day}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Exercise List */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Ejercicios - Día {selectedDay}
          </h2>
          
          {currentDayExercises.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                No hay ejercicios para este día
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentDayExercises.map((exercise, idx) => (
                <div 
                  key={exercise.id}
                  className="bg-white border-2 border-gray-100 rounded-xl p-4 hover:border-orange-200 transition-colors shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {idx + 1}
                        </span>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {exercise.name}
                        </h3>
                      </div>
                      {exercise.muscleGroups.length > 0 && (
                        <p className="text-sm text-gray-600 ml-9">
                          🎯 {getMuscleGroupLabel(exercise.muscleGroups)}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-orange-600">
                        {exercise.sets} series
                      </div>
                      <div className="text-sm text-gray-600">
                        {exercise.repsMin}-{exercise.repsMax} reps
                      </div>
                      {exercise.restSeconds > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          ⏱️ {exercise.restSeconds}s
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Sticky */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 pb-20 sm:pb-3 z-10">
        <div className="max-w-4xl mx-auto flex gap-3">
          {routine.isPublic ? (
            <button
              onClick={handleCloneRoutine}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-semibold transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Copy className="w-5 h-5" />
              Clonar y Usar
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate(`/workouts/${routine.id}`)}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-semibold transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Iniciar Rutina
              </button>
              <button
                onClick={() => navigate(`/workouts/${routine.id}/edit`)}
                className="flex-1 bg-gray-700 hover:bg-gray-800 text-white py-4 rounded-xl font-semibold transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Edit className="w-5 h-5" />
                Editar
              </button>
            </>
          )}
        </div>
      </div>

      <BottomNavbar />
    </div>
  );
};

export default WorkoutPreviewPage;
