import React, { useEffect, useState } from 'react';
import BottomNavbar from '../components/shared/BottomNavbar';
import WorkoutCard from '../modules/workouts/components/WorkoutCard';
import CreateWorkoutForm from '../modules/workouts/components/CreateWorkoutForm';
import WorkoutExecutionScreen from '../modules/workouts/components/WorkoutExecutionScreen';
import workoutService from '../modules/workouts/services/workoutService';
import type { WorkoutRoutine } from '../shared/types/workout.types';

const Workouts: React.FC = () => {
  const [workouts, setWorkouts] = useState<WorkoutRoutine[]>([]);
  const [activeRoutine, setActiveRoutine] = useState<WorkoutRoutine | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadWorkouts = async () => {
    setLoading(true);
    const res = await workoutService.getWorkouts();
    if (res?.data) setWorkouts(res.data);
    setLoading(false);
  };

  useEffect(() => { 
    loadWorkouts(); 
  }, []);

  const handleStartRoutine = async (routine: WorkoutRoutine) => {
    // Cargar la rutina completa con ejercicios
    const res = await workoutService.getWorkout(routine.id);
    if (res?.data && res.data.exercises && res.data.exercises.length > 0) {
      setActiveRoutine(res.data);
      setIsExecuting(true);
    } else {
      alert('Esta rutina no tiene ejercicios configurados');
    }
  };

  const handleCompleteWorkout = () => {
    setIsExecuting(false);
    setActiveRoutine(null);
    alert('¡Entrenamiento completado! 🎉');
  };

  const handleCancelWorkout = () => {
    setIsExecuting(false);
    setActiveRoutine(null);
  };

  const handleDeleteRoutine = async (id: string) => {
    const res = await workoutService.deleteWorkout(id);
    if (!res.error) {
      loadWorkouts();
    } else {
      alert('Error al eliminar la rutina');
    }
  };

  // Pantalla de ejecución de rutina
  if (isExecuting && activeRoutine) {
    return (
      <WorkoutExecutionScreen
        routine={activeRoutine}
        onComplete={handleCompleteWorkout}
        onCancel={handleCancelWorkout}
      />
    );
  }

  // Pantalla de creación de rutina
  if (showCreate) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Crear Rutina</h1>
            <button 
              onClick={() => setShowCreate(false)} 
              className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
            >
              ✕ Cerrar
            </button>
          </div>

          <CreateWorkoutForm 
            onCreated={() => { 
              setShowCreate(false); 
              loadWorkouts(); 
            }} 
            onClose={() => setShowCreate(false)} 
          />
        </div>

        <BottomNavbar />
      </div>
    );
  }

  // Pantalla principal
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                💪 Mis Entrenamientos
              </h1>
              <p className="text-gray-600">
                Gestiona y ejecuta tus rutinas personalizadas
              </p>
            </div>
            <button 
              onClick={() => setShowCreate(true)} 
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-colors shadow-md hover:shadow-lg"
            >
              + Crear Rutina
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar - Quick Actions */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">⚡</span>
                Inicio Rápido
              </h3>
              
              <div className="space-y-3">
                <button className="w-full text-left p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl mb-1">💪</div>
                      <div className="font-semibold text-gray-900">Entrenamiento rápido</div>
                      <div className="text-sm text-gray-500">15-20 minutos</div>
                    </div>
                    <div className="text-orange-500 text-2xl">›</div>
                  </div>
                </button>

                <button className="w-full text-left p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl mb-1">🏃‍♂️</div>
                      <div className="font-semibold text-gray-900">Cardio Express</div>
                      <div className="text-sm text-gray-500">10-15 minutos</div>
                    </div>
                    <div className="text-orange-500 text-2xl">›</div>
                  </div>
                </button>

                <button className="w-full text-left p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl mb-1">🧘‍♀️</div>
                      <div className="font-semibold text-gray-900">Estiramiento</div>
                      <div className="text-sm text-gray-500">5-10 minutos</div>
                    </div>
                    <div className="text-orange-500 text-2xl">›</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-md p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Estadísticas</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-orange-100">Rutinas activas</span>
                  <span className="text-2xl font-bold">{workouts.filter(w => w.isActive).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-orange-100">Total rutinas</span>
                  <span className="text-2xl font-bold">{workouts.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Workouts Grid */}
          <div className="lg:col-span-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tus Rutinas</h2>
              <p className="text-gray-600">Selecciona una rutina para comenzar a entrenar</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Cargando rutinas...</p>
                </div>
              </div>
            ) : workouts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                <div className="text-6xl mb-4">🏋️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No tienes rutinas todavía
                </h3>
                <p className="text-gray-600 mb-6">
                  Crea tu primera rutina para comenzar a entrenar
                </p>
                <button 
                  onClick={() => setShowCreate(true)}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-colors"
                >
                  Crear mi primera rutina
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {workouts.map((workout) => (
                  <WorkoutCard 
                    key={workout.id} 
                    routine={workout} 
                    onStart={handleStartRoutine}
                    onDelete={handleDeleteRoutine}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNavbar />
    </div>
  );
};

export default Workouts;
