import React, { useState } from 'react';
import { CreateWorkoutFormImproved } from '../components/forms/CreateWorkoutFormImproved';
import { WorkoutTimerDisplay } from '../components/execution/WorkoutTimerDisplay';
import { useWorkouts } from '../hooks/useWorkouts';
import type { CreateWorkoutData, WorkoutRoutine } from '../../../shared/types/workout.types';
import { toast } from '../../../hooks/useNotification';

export const WorkoutManagementPage: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeRoutine, setActiveRoutine] = useState<WorkoutRoutine | null>(null);
  const { routines, loading, error, createRoutine } = useWorkouts();

  const handleCreateRoutine = async (data: CreateWorkoutData) => {
    const result = await createRoutine(data);
    if (result) {
      console.log('Rutina creada exitosamente:', result);
    }
  };

  const handleStartWorkout = (routine: WorkoutRoutine) => {
    if (!routine.exercises || routine.exercises.length === 0) {
      toast.warning('Esta rutina no tiene ejercicios configurados');
      return;
    }
    setActiveRoutine(routine);
  };

  const handleWorkoutComplete = () => {
    console.log('Entrenamiento completado!');
    setActiveRoutine(null);
  };

  // Si hay cronómetro activo, mostrar solo eso
  if (activeRoutine?.exercises) {
    return (
      <WorkoutTimerDisplay
        exercises={activeRoutine.exercises}
        onComplete={handleWorkoutComplete}
        onExit={() => setActiveRoutine(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando rutinas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold mb-2">Error al cargar rutinas</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showCreateForm ? (
        <div className="h-screen">
          <CreateWorkoutFormImproved
            onClose={() => setShowCreateForm(false)}
            onCreated={handleCreateRoutine}
          />
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mis Rutinas</h1>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors shadow-md"
            >
              + Nueva Rutina
            </button>
          </div>

          {routines.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                No tienes rutinas creadas
              </h2>
              <p className="text-gray-500 mb-6">
                Crea tu primera rutina personalizada para empezar a entrenar
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-8 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors shadow-md"
              >
                Crear Mi Primera Rutina
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {routines.map(routine => (
                <div
                  key={routine.id}
                  className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6 hover:border-orange-300 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {routine.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {routine.description || 'Sin descripción'}
                      </p>
                    </div>
                    {routine.isPublic && (
                      <span className="flex-shrink-0 ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Pública
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{routine.daysPerWeek} días por semana</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span>{routine.exercises?.length || 0} ejercicios</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleStartWorkout(routine)}
                      className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Iniciar
                    </button>
                    <button className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-orange-500 transition-colors flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
