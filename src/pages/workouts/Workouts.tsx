import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BottomNavbar from '../../components/shared/BottomNavbar';
import { WorkoutSkeletonGrid } from '../../components/shared/WorkoutSkeleton';
import WorkoutCard from '../../modules/workouts/components/cards/WorkoutCard';
import { CreateWorkoutFormImproved } from '../../modules/workouts/components/forms/CreateWorkoutFormImproved';
import WorkoutExecutionScreen from '../../modules/workouts/components/execution/WorkoutExecutionScreen';
import workoutService from '../../modules/workouts/services/workoutService';
import type { WorkoutRoutine, CreateWorkoutData } from '../../shared/types/workout.types';
import { toast } from '../../hooks/useNotification';
import { cn, themeText } from '../../shared/utils/themeUtils';

const Workouts: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<WorkoutRoutine[]>([]);
  const [publicWorkouts, setPublicWorkouts] = useState<WorkoutRoutine[]>([]);
  const [activeRoutine, setActiveRoutine] = useState<WorkoutRoutine | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadWorkouts = async () => {
    setLoading(true);
    
    // Cargar rutinas del usuario
    const userRes = await workoutService.getUserWorkouts();
    if (userRes?.data) setWorkouts(userRes.data);
    
    // Cargar rutinas públicas
    const publicRes = await workoutService.getPublicWorkouts();
    if (publicRes?.data) setPublicWorkouts(publicRes.data);
    
    setLoading(false);
  };

  useEffect(() => { 
    loadWorkouts(); 
  }, []);

  const handleStartRoutine = async (routine: WorkoutRoutine) => {
    // Navegar al nuevo sistema de ejecución persistente
    navigate(`/workouts/${routine.id}`);
  };

  const handleCompleteWorkout = () => {
    setIsExecuting(false);
    setActiveRoutine(null);
    toast.success(t('workouts.completed') + ' 🎉');
  };

  const handleCancelWorkout = () => {
    setIsExecuting(false);
    setActiveRoutine(null);
  };

  const handleDeleteRoutine = async (id: string) => {
    const res = await workoutService.deleteWorkout(id);
    if (res.error) {
      toast.error(t('common.error'));
    } else {
      loadWorkouts();
    }
  };

  const handleCloneRoutine = async (id: string) => {
    const res = await workoutService.clonePublicWorkout(id);
    if (res.error) {
      const errorMsg = typeof res.error === 'string' ? res.error : res.error.message;
      toast.error(t('common.error') + ': ' + (errorMsg || t('common.error')));
    } else {
      toast.success('✅ ' + t('workouts.clone'));
      loadWorkouts();
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
      <div className={cn(
        "min-h-screen pb-20",
        "bg-gray-50 dark:bg-gray-900 high-contrast:bg-black"
      )}>
        <CreateWorkoutFormImproved 
          onCreated={async (data: CreateWorkoutData) => {
            // Crear la rutina usando el servicio
            const result = await workoutService.createWorkout(data);
            if (result?.data) {
              toast.success('✅ ' + t('workouts.createRoutine'));
              setShowCreate(false); 
              await loadWorkouts();
            } else {
              toast.error('❌ ' + t('common.error'));
            }
          }} 
          onClose={() => setShowCreate(false)} 
        />

        <BottomNavbar />
      </div>
    );
  }

  // Pantalla principal
  return (
    <div className={cn(
      "relative min-h-screen pb-20 overflow-hidden",
      "bg-gradient-to-br from-white via-orange-50/30 to-purple-50/30",
      "dark:from-gray-900 dark:via-gray-800 dark:to-gray-900",
      "high-contrast:from-black high-contrast:via-black high-contrast:to-black"
    )}>
      {/* Burbujas decorativas de fondo - como Dashboard */}
      <div className={cn(
        "absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none",
        "bg-gradient-to-br from-orange-200 to-pink-300 opacity-30",
        "dark:from-orange-900/40 dark:to-pink-900/40",
        "high-contrast:from-orange-800 high-contrast:to-pink-800 high-contrast:opacity-20"
      )}></div>
      <div className={cn(
        "absolute top-1/4 right-0 w-80 h-80 rounded-full blur-3xl translate-x-1/2 pointer-events-none",
        "bg-gradient-to-br from-purple-200 to-blue-300 opacity-30",
        "dark:from-purple-900/40 dark:to-blue-900/40",
        "high-contrast:from-purple-800 high-contrast:to-blue-800 high-contrast:opacity-20"
      )}></div>
      <div className={cn(
        "absolute bottom-0 left-1/4 w-72 h-72 rounded-full blur-3xl translate-y-1/2 pointer-events-none",
        "bg-gradient-to-br from-pink-200 to-orange-300 opacity-30",
        "dark:from-pink-900/40 dark:to-orange-900/40",
        "high-contrast:from-pink-800 high-contrast:to-orange-800 high-contrast:opacity-20"
      )}></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className={cn(
          "backdrop-blur-md rounded-3xl shadow-xl p-6 mb-8",
          "bg-white/70 dark:bg-gray-800/70 high-contrast:bg-black/90",
          "border border-white/50 dark:border-gray-700/50 high-contrast:border-white/30 high-contrast:border-2"
        )}>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent mb-2">
                💪 {t('workouts.myTrainings')}
              </h1>
              <p className={cn(themeText.secondary)}>
                {t('workouts.manageRoutines')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => navigate('/workouts/generate')} 
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>{t('workouts.generateWithAI')}</span>
              </button>
              <button 
                onClick={() => setShowCreate(true)} 
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                + {t('workouts.createRoutine')}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Workouts Grid */}
        {loading ? (
          <div className="mb-12">
            <div className="mb-6">
              <div className="h-8 bg-white/50 backdrop-blur-sm rounded-lg w-48 mb-2 animate-pulse"></div>
              <div className="h-4 bg-white/50 backdrop-blur-sm rounded w-64 animate-pulse"></div>
            </div>
            <WorkoutSkeletonGrid count={6} />
          </div>
        ) : null}

        {!loading && workouts.length === 0 && publicWorkouts.length === 0 ? (
          <div className={cn(
            "backdrop-blur-md rounded-3xl shadow-xl p-12 text-center",
            "bg-white/70 dark:bg-gray-800/70 high-contrast:bg-black/90",
            "border border-white/50 dark:border-gray-700/50 high-contrast:border-white/30 high-contrast:border-2"
          )}>
            <div className="text-6xl mb-4">🏋️</div>
            <h3 className={cn("text-xl font-semibold mb-2", themeText.primary)}>
              {t('workouts.noWorkouts')}
            </h3>
            <p className={cn("mb-6", themeText.secondary)}>
              {t('workouts.createFirst')}
            </p>
            <button 
              onClick={() => setShowCreate(true)}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all shadow-lg"
            >
              {t('workouts.createFirst')}
            </button>
          </div>
        ) : null}

        {!loading && workouts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent mb-2">{t('workouts.myWorkouts')}</h2>
            <p className={cn("mb-6", themeText.secondary)}>{t('workouts.manageRoutines')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workouts.map((workout) => (
                <WorkoutCard 
                  key={workout.id} 
                  routine={workout} 
                  onStart={handleStartRoutine}
                  onDelete={handleDeleteRoutine}
                  onPreview={(id) => navigate(`/workouts/${id}/preview`)}
                  isPublic={false}
                />
              ))}
            </div>
          </div>
        )}

        {!loading && publicWorkouts.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">{t('workouts.popularRoutines')}</h2>
                <p className={cn(themeText.secondary)}>
                  {t('workouts.professionalRoutines')}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicWorkouts.map((workout) => (
                <WorkoutCard 
                  key={workout.id} 
                  routine={workout} 
                  onStart={handleStartRoutine}
                  onClone={handleCloneRoutine}
                  onPreview={(id) => navigate(`/workouts/${id}/preview`)}
                  isPublic={true}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNavbar />
    </div>
  );
};

export default Workouts;
