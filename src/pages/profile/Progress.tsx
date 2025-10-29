import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useProgress } from '../../hooks/useProgress';
import BottomNavbar from '../../components/shared/BottomNavbar';
import { 
  Activity, 
  Flame, 
  Clock, 
  TrendingUp, 
  Award,
  Calendar
} from 'lucide-react';

// Skeleton component for loading states
const StatCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-4 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
    <div className="h-8 bg-gray-200 rounded w-16"></div>
  </div>
);

const ChartSkeleton = () => (
  <div className="bg-white rounded-2xl p-6 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
    <div className="h-48 bg-gray-200 rounded"></div>
  </div>
);

const Progress: React.FC = () => {
  const { user } = useAuth();
  const { progressData, loading } = useProgress(user?.id);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  };

  const getWeightProgress = () => {
    if (!progressData) return 0;
    const { initialWeight, currentWeight, targetWeight } = progressData;
    if (initialWeight === targetWeight) return 100;
    const totalChange = Math.abs(initialWeight - targetWeight);
    const currentChange = Math.abs(initialWeight - currentWeight);
    return Math.min(Math.round((currentChange / totalChange) * 100), 100);
  };

  // Generate chart points from weight data
  const generateChartPath = () => {
    if (!progressData?.weightProgress || progressData.weightProgress.length === 0) return '';
    
    const data = progressData.weightProgress;
    const width = 300;
    const height = 160;
    const padding = 20;

    const minWeight = Math.min(...data.map(d => d.weight));
    const maxWeight = Math.max(...data.map(d => d.weight));
    const range = maxWeight - minWeight || 1;

    const points = data.map((point, index) => {
      const x = padding + (index / (data.length - 1 || 1)) * (width - 2 * padding);
      const y = height - padding - ((point.weight - minWeight) / range) * (height - 2 * padding);
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 pb-24">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm px-6 py-4 border-b border-gray-100 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="h-7 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 gap-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>

          {/* Chart Skeleton */}
          <ChartSkeleton />
          <ChartSkeleton />
        </div>

        <BottomNavbar />
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 pb-24 flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-gray-600">No hay datos de progreso disponibles</p>
        </div>
        <BottomNavbar />
      </div>
    );
  }

  const weekProgress = getWeightProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 pb-24">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm px-6 py-4 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
            Mi Progreso
          </h1>
          <span className="text-sm text-purple-600 font-medium">
            {weekProgress}% completado
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          {/* Workouts */}
          <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4" />
              <p className="text-sm opacity-90">Entrenamientos</p>
            </div>
            <p className="text-3xl font-bold">{progressData.weeklyStats.workouts}</p>
            <p className="text-xs opacity-75 mt-1">esta semana</p>
          </div>

          {/* Calories */}
          <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4" />
              <p className="text-sm opacity-90">Calorías</p>
            </div>
            <p className="text-3xl font-bold">
              {(progressData.weeklyStats.calories / 1000).toFixed(1)}k
            </p>
            <p className="text-xs opacity-75 mt-1">quemadas</p>
          </div>

          {/* Active Time */}
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4" />
              <p className="text-sm opacity-90">Tiempo Activo</p>
            </div>
            <p className="text-3xl font-bold">
              {Math.round(progressData.weeklyStats.activeMinutes / 60)}h
            </p>
            <p className="text-xs opacity-75 mt-1">esta semana</p>
          </div>

          {/* Streak */}
          <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4" />
              <p className="text-sm opacity-90">Racha</p>
            </div>
            <p className="text-3xl font-bold">{progressData.weeklyStats.streak}</p>
            <p className="text-xs opacity-75 mt-1">días seguidos</p>
          </div>
        </div>

        {/* Weight Progress Chart */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            Evolución de Peso
          </h3>
          <div className="h-48 flex items-center justify-center bg-gradient-to-br from-orange-50 to-purple-50 rounded-xl">
            {progressData.weightProgress.length > 0 ? (
              <svg viewBox="0 0 300 160" className="w-full h-full">
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
                <path
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  d={generateChartPath()}
                />
                {/* Data points */}
                {progressData.weightProgress.map((point, index) => {
                  const data = progressData.weightProgress;
                  const width = 300;
                  const height = 160;
                  const padding = 20;
                  const minWeight = Math.min(...data.map(d => d.weight));
                  const maxWeight = Math.max(...data.map(d => d.weight));
                  const range = maxWeight - minWeight || 1;
                  const x = padding + (index / (data.length - 1 || 1)) * (width - 2 * padding);
                  const y = height - padding - ((point.weight - minWeight) / range) * (height - 2 * padding);
                  
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="4"
                      fill="white"
                      stroke="#f97316"
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>
            ) : (
              <p className="text-gray-400">No hay datos suficientes</p>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <div>
              <p className="text-gray-500">Inicial</p>
              <p className="font-semibold text-gray-800">{progressData.initialWeight} kg</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500">Actual</p>
              <p className="font-semibold text-orange-600">{progressData.currentWeight} kg</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">Meta</p>
              <p className="font-semibold text-purple-600">{progressData.targetWeight} kg</p>
            </div>
          </div>
        </div>

        {/* Weekly Frequency */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Frecuencia Semanal
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {[
              { day: 'L', key: 'monday' },
              { day: 'M', key: 'tuesday' },
              { day: 'X', key: 'wednesday' },
              { day: 'J', key: 'thursday' },
              { day: 'V', key: 'friday' },
              { day: 'S', key: 'saturday' },
              { day: 'D', key: 'sunday' }
            ].map(({ day, key }) => {
              const hasWorkout = progressData.weeklyWorkouts[key as keyof typeof progressData.weeklyWorkouts];
              return (
                <div key={key} className="text-center">
                  <div
                    className={`w-full aspect-square rounded-lg flex items-center justify-center font-medium transition-all ${
                      hasWorkout 
                        ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md' 
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {day}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Personal Records */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Récords Personales
          </h3>
          <div className="space-y-3">
            {progressData.personalRecords.map((record, index) => {
              const colors = [
                'from-orange-50 to-orange-100 text-orange-600',
                'from-purple-50 to-purple-100 text-purple-600',
                'from-blue-50 to-blue-100 text-blue-600',
                'from-green-50 to-green-100 text-green-600'
              ];
              const colorClass = colors[index % colors.length];
              
              return (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-4 bg-gradient-to-r ${colorClass.split(' text-')[0]} rounded-xl`}
                >
                  <div>
                    <p className="font-medium text-gray-800">{record.exercise}</p>
                    <p className="text-sm text-gray-600">
                      {record.weight} kg · {formatDate(record.date)}
                    </p>
                  </div>
                  <span className={`font-semibold ${colorClass.split(' ')[1]}`}>
                    +{record.improvement} kg
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <BottomNavbar />
    </div>
  );
};

export default Progress;