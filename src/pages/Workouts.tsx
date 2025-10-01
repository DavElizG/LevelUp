import React, { useEffect, useState } from 'react';
import BottomNavbar from '../components/shared/BottomNavbar';
import WorkoutCard from '../modules/workouts/components/WorkoutCard';
import SeriesCard from '../modules/workouts/components/SeriesCard';
import TimerScreen from '../modules/workouts/components/TimerScreen';
import CreateWorkoutForm from '../modules/workouts/components/CreateWorkoutForm';
import workoutService from '../modules/workouts/services/workoutService';
import type { WorkoutRoutine } from '../shared/types/workout.types';

const Workouts: React.FC = () => {
  const [workouts, setWorkouts] = useState<WorkoutRoutine[]>([]);
  const [activeRoutine, setActiveRoutine] = useState<WorkoutRoutine | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showRoutine, setShowRoutine] = useState(false);
  const [timerOpen, setTimerOpen] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState<number | undefined>(60);

  async function load() {
    const res = await workoutService.getWorkouts();
    if (res?.data) setWorkouts(res.data as WorkoutRoutine[]);
  }

  useEffect(() => { load(); }, []);

  const handleStart = async (id: string) => {
    const res = await workoutService.getWorkout(id);
    if (res?.data) {
      setActiveRoutine(res.data as WorkoutRoutine);
      setShowRoutine(true);
    }
  };

  // When creating a routine, show a full-screen plain view (no dark overlay) to match the app style
  if (showCreate) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Crear entrenamiento</h1>
            <button onClick={() => setShowCreate(false)} className="text-gray-600">Cerrar</button>
          </div>

          <div className="bg-transparent">
            <CreateWorkoutForm onCreated={() => { setShowCreate(false); load(); }} onClose={() => setShowCreate(false)} />
          </div>
        </div>

        <BottomNavbar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Dashboard card + Quick Start vertical */}
          <div className="col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Entrenamientos</h1>
                  <p className="text-gray-600">Descubre y realiza entrenamientos personalizados</p>
                </div>
                <button onClick={() => setShowCreate(true)} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition-colors text-sm">
                  Crear entrenamiento
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Inicio rápido</h3>
              <div className="flex flex-col space-y-4">
                <button className="text-left p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-orange-400 transition-colors flex items-center justify-between">
                  <div>
                    <div className="text-orange-500 mb-1">💪</div>
                    <div className="font-medium">Entrenamiento rápido</div>
                    <div className="text-sm text-gray-500">15-20 minutos</div>
                  </div>
                  <div className="text-orange-500">›</div>
                </button>

                <button className="text-left p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-orange-400 transition-colors flex items-center justify-between">
                  <div>
                    <div className="text-orange-500 mb-1">🏃‍♂️</div>
                    <div className="font-medium">Cardio express</div>
                    <div className="text-sm text-gray-500">10-15 minutos</div>
                  </div>
                  <div className="text-orange-500">›</div>
                </button>

                <button className="text-left p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-orange-400 transition-colors flex items-center justify-between">
                  <div>
                    <div className="text-orange-500 mb-1">🧘‍♀️</div>
                    <div className="font-medium">Estiramiento</div>
                    <div className="text-sm text-gray-500">5-10 minutos</div>
                  </div>
                  <div className="text-orange-500">›</div>
                </button>
              </div>
            </div>

            {showCreate && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-start justify-center p-8">
                <div className="bg-white rounded shadow max-w-2xl w-full p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Crear entrenamiento</h3>
                    <button onClick={() => setShowCreate(false)} className="text-gray-600">Cerrar</button>
                  </div>
                  <CreateWorkoutForm onCreated={() => { setShowCreate(false); load(); }} onClose={() => setShowCreate(false)} />
                </div>
              </div>
            )}
          </div>

          {/* Right column: Grid of workouts */}
          <div className="col-span-1 lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold">Tus rutinas</h2>
              <p className="text-sm text-gray-500">Selecciona una rutina para iniciar</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {workouts.map((workout) => (
                <WorkoutCard key={String(workout.id)} routine={workout} onStart={handleStart} />
              ))}
            </div>
          </div>
        </div>

        {/* Routine full-screen view (mobile) */}
        {showRoutine && activeRoutine && (
          <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col">
            <header className="p-4 border-b bg-white flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{activeRoutine.name}</h2>
                <p className="text-sm text-gray-500">{activeRoutine.description}</p>
              </div>
              <button onClick={() => setShowRoutine(false)} className="text-gray-600">Cerrar</button>
            </header>

            <main className="flex-1 overflow-auto p-4">
              {timerOpen ? (
                <div className="w-full max-w-lg mx-auto">
                  <TimerScreen initialSeconds={timerSeconds} onClose={() => setTimerOpen(false)} />
                </div>
              ) : (
                <section className="space-y-4">
                  {activeRoutine.exercises && activeRoutine.exercises.length > 0 ? (
                    activeRoutine.exercises.map((s, i) => (
                      <div key={String(s.id ?? i)} className="mb-4">
                        <SeriesCard series={s} index={i} onStartSet={(secs) => { setTimerSeconds(secs ?? 60); setTimerOpen(true); }} />
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">No hay ejercicios asociados a esta rutina.</div>
                  )}
                </section>
              )}
            </main>

            <footer className="p-4 bg-white border-t">
              <div className="max-w-2xl mx-auto space-y-3">
                {timerOpen ? (
                  <>
                    <button onClick={() => setTimerOpen(false)} className="w-full bg-orange-500 text-white py-3 rounded text-lg">Continuar entrenamiento</button>
                    <button onClick={() => { setTimerOpen(false); setShowRoutine(false); }} className="w-full border py-3 rounded text-lg">Salir del entrenamiento</button>
                  </>
                ) : (
                  <button className="w-full bg-orange-500 text-white py-3 rounded text-lg">Serie completa</button>
                )}
              </div>
            </footer>
          </div>
        )}
        {timerOpen && (
          <TimerScreen initialSeconds={timerSeconds} onClose={() => setTimerOpen(false)} />
        )}
      </div>

      <BottomNavbar />
    </div>
  );
};

export default Workouts;