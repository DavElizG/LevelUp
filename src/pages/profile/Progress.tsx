import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useProgress } from '../../hooks/useProgress';
import { useProgressDashboard } from '../../hooks/useRecommendations';
import BottomNavbar from '../../components/shared/BottomNavbar';
import SwipeableLayout from '../../components/Layout/SwipeableLayout';
import InsightsCard from '../progress/components/InsightsCard';
import MotivationalSection from '../progress/components/MotivationalSection';
import { 
  Activity, 
  Flame, 
  Clock, 
  TrendingUp, 
  Award,
  Calendar
} from 'lucide-react';
import { cn, themeText } from '../../shared/utils/themeUtils';

// Skeleton component for loading states
const StatCardSkeleton = () => (
  <div className={cn(
    "rounded-2xl p-4 animate-pulse",
    "bg-white dark:bg-gray-800 high-contrast:bg-black"
  )}>
    <div className={cn(
      "h-4 rounded w-20 mb-2",
      "bg-gray-200 dark:bg-gray-700 high-contrast:bg-gray-800"
    )}></div>
    <div className={cn(
      "h-8 rounded w-16",
      "bg-gray-200 dark:bg-gray-700 high-contrast:bg-gray-800"
    )}></div>
  </div>
);

const ChartSkeleton = () => (
  <div className={cn(
    "rounded-2xl p-6 animate-pulse",
    "bg-white dark:bg-gray-800 high-contrast:bg-black"
  )}>
    <div className={cn(
      "h-6 rounded w-32 mb-4",
      "bg-gray-200 dark:bg-gray-700 high-contrast:bg-gray-800"
    )}></div>
    <div className={cn(
      "h-48 rounded",
      "bg-gray-200 dark:bg-gray-700 high-contrast:bg-gray-800"
    )}></div>
  </div>
);

const Progress: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { progressData, loading } = useProgress(user?.id);
  
  // Obtener insights y motivación de IA
  const { insights, motivation } = useProgressDashboard(
    user?.id || ''
  );

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
      <div className={cn(
        "min-h-screen pb-24",
        "bg-gradient-to-br from-orange-50 via-white to-purple-50",
        "dark:from-gray-900 dark:via-gray-800 dark:to-gray-900",
        "high-contrast:from-black high-contrast:via-black high-contrast:to-black"
      )}>
        {/* Header */}
        <div className={cn(
          "backdrop-blur-sm px-6 py-4 sticky top-0 z-10",
          "bg-white/80 dark:bg-gray-800/80 high-contrast:bg-black/90",
          "border-b border-gray-100 dark:border-gray-700 high-contrast:border-white/30 high-contrast:border-b-2"
        )}>
          <div className="flex items-center justify-between">
            <div className={cn(
              "h-7 rounded w-24 animate-pulse",
              "bg-gray-200 dark:bg-gray-700 high-contrast:bg-gray-800"
            )}></div>
            <div className={cn(
              "h-5 rounded w-16 animate-pulse",
              "bg-gray-200 dark:bg-gray-700 high-contrast:bg-gray-800"
            )}></div>
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
      <div className={cn(
        "min-h-screen pb-24 flex items-center justify-center",
        "bg-gradient-to-br from-orange-50 via-white to-purple-50",
        "dark:from-gray-900 dark:via-gray-800 dark:to-gray-900",
        "high-contrast:from-black high-contrast:via-black high-contrast:to-black"
      )}>
        <div className="text-center p-6">
          <p className={cn(themeText.secondary)}>No hay datos de progreso disponibles</p>
        </div>
        <BottomNavbar />
      </div>
    );
  }

  const weekProgress = getWeightProgress();

  return (
    <SwipeableLayout>
    <div className={cn(
      "relative min-h-screen pb-24 overflow-hidden",
      "bg-gradient-to-br from-orange-50 via-white to-purple-50",
      "dark:from-gray-900 dark:via-gray-800 dark:to-gray-900",
      "high-contrast:from-black high-contrast:via-black high-contrast:to-black"
    )}>
      {/* Burbujas decorativas de fondo - estilo Dashboard */}
      <div className={cn(
        "absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl pointer-events-none",
        "bg-gradient-to-br from-orange-200 to-pink-300 opacity-30",
        "dark:from-orange-900/40 dark:to-pink-900/40",
        "high-contrast:from-orange-800 high-contrast:to-pink-800 high-contrast:opacity-20"
      )}></div>
      <div className={cn(
        "absolute top-1/3 -left-20 w-72 h-72 rounded-full blur-3xl pointer-events-none",
        "bg-gradient-to-br from-purple-200 to-blue-300 opacity-30",
        "dark:from-purple-900/40 dark:to-blue-900/40",
        "high-contrast:from-purple-800 high-contrast:to-blue-800 high-contrast:opacity-20"
      )}></div>
      <div className={cn(
        "absolute bottom-20 right-10 w-64 h-64 rounded-full blur-3xl pointer-events-none",
        "bg-gradient-to-br from-pink-200 to-orange-300 opacity-30",
        "dark:from-pink-900/40 dark:to-orange-900/40",
        "high-contrast:from-pink-800 high-contrast:to-orange-800 high-contrast:opacity-20"
      )}></div>
      {/* Header */}
      <div className={cn(
        "backdrop-blur-sm px-6 py-4 sticky top-0 z-10",
        "bg-white/80 dark:bg-gray-800/80 high-contrast:bg-black/90",
        "border-b border-gray-100 dark:border-gray-700 high-contrast:border-white/30 high-contrast:border-b-2"
      )}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
            {t('progress.myProgress')}
          </h1>
          <span className="text-sm font-medium text-purple-600 dark:text-purple-400 high-contrast:text-purple-500">
            {weekProgress}% {t('progress.completed')}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          {/* Workouts */}
          <div className={cn(
            "relative backdrop-blur-md rounded-3xl p-4 text-white shadow-xl overflow-hidden",
            "bg-gradient-to-br from-orange-400/90 to-orange-600/90",
            "dark:from-orange-600/90 dark:to-orange-800/90",
            "high-contrast:from-orange-700 high-contrast:to-orange-900",
            "border border-white/30 dark:border-white/20 high-contrast:border-white/40 high-contrast:border-2"
          )}>
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4" />
                <p className="text-sm opacity-90">{t('dashboard.workouts')}</p>
              </div>
              <p className="text-3xl font-bold">{progressData.weeklyStats.workouts}</p>
              <p className="text-xs opacity-75 mt-1">{t('progress.thisWeek')}</p>
            </div>
          </div>

          {/* Calories */}
          <div className={cn(
            "relative backdrop-blur-md rounded-3xl p-4 text-white shadow-xl overflow-hidden",
            "bg-gradient-to-br from-green-400/90 to-green-600/90",
            "dark:from-green-600/90 dark:to-green-800/90",
            "high-contrast:from-green-700 high-contrast:to-green-900",
            "border border-white/30 dark:border-white/20 high-contrast:border-white/40 high-contrast:border-2"
          )}>
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4" />
                <p className="text-sm opacity-90">{t('dashboard.calories')}</p>
              </div>
              <p className="text-3xl font-bold">
                {(progressData.weeklyStats.calories / 1000).toFixed(1)}k
              </p>
              <p className="text-xs opacity-75 mt-1">{t('progress.burned')}</p>
            </div>
          </div>

          {/* Active Time */}
          <div className={cn(
            "relative backdrop-blur-md rounded-3xl p-4 text-white shadow-xl overflow-hidden",
            "bg-gradient-to-br from-blue-400/90 to-blue-600/90",
            "dark:from-blue-600/90 dark:to-blue-800/90",
            "high-contrast:from-blue-700 high-contrast:to-blue-900",
            "border border-white/30 dark:border-white/20 high-contrast:border-white/40 high-contrast:border-2"
          )}>
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4" />
                <p className="text-sm opacity-90">{t('progress.activeTime')}</p>
              </div>
              <p className="text-3xl font-bold">
                {Math.round(progressData.weeklyStats.activeMinutes / 60)}h
              </p>
              <p className="text-xs opacity-75 mt-1">{t('progress.thisWeek')}</p>
            </div>
          </div>

          {/* Streak */}
          <div className={cn(
            "relative backdrop-blur-md rounded-3xl p-4 text-white shadow-xl overflow-hidden",
            "bg-gradient-to-br from-purple-400/90 to-purple-600/90",
            "dark:from-purple-600/90 dark:to-purple-800/90",
            "high-contrast:from-purple-700 high-contrast:to-purple-900",
            "border border-white/30 dark:border-white/20 high-contrast:border-white/40 high-contrast:border-2"
          )}>
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4" />
                <p className="text-sm opacity-90">{t('progress.streak')}</p>
              </div>
              <p className="text-3xl font-bold">{progressData.weeklyStats.streak}</p>
              <p className="text-xs opacity-75 mt-1">{t('progress.daysInRow')}</p>
            </div>
          </div>
        </div>

        {/* Weight Progress Chart */}
        <div className={cn(
          "relative backdrop-blur-md rounded-3xl p-6 shadow-xl overflow-hidden",
          "bg-white/70 dark:bg-gray-800/70 high-contrast:bg-black/90",
          "border border-white/50 dark:border-gray-700/50 high-contrast:border-white/30 high-contrast:border-2"
        )}>
          {/* Decorative bubbles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-300/20 to-pink-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-300/20 to-blue-400/20 rounded-full blur-2xl"></div>
          
          <div className="relative">
            <h3 className={cn("text-lg font-semibold mb-4 flex items-center gap-2", themeText.primary)}>
              <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400 high-contrast:text-orange-500" />
              {t('progress.weightEvolution')}
            </h3>
            <div className={cn(
              "h-48 flex items-center justify-center rounded-2xl",
              "bg-gradient-to-br from-orange-50/50 to-purple-50/50",
              "dark:from-gray-900/30 dark:to-gray-800/30",
              "high-contrast:from-black/50 high-contrast:to-black/50"
            )}>
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
              <p className={cn(themeText.muted)}>{t('progress.noDataAvailable')}</p>
            )}
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <div>
                <p className={cn(themeText.muted)}>{t('progress.initial')}</p>
                <p className={cn("font-semibold", themeText.primary)}>{progressData.initialWeight} kg</p>
              </div>
              <div className="text-center">
                <p className={cn(themeText.muted)}>{t('progress.current')}</p>
                <p className="font-semibold text-orange-600 dark:text-orange-400 high-contrast:text-orange-500">{progressData.currentWeight} kg</p>
              </div>
              <div className="text-right">
                <p className={cn(themeText.muted)}>{t('progress.goal')}</p>
                <p className="font-semibold text-purple-600 dark:text-purple-400 high-contrast:text-purple-500">{progressData.targetWeight} kg</p>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Frequency */}
        <div className={cn(
          "relative backdrop-blur-md rounded-3xl p-6 shadow-xl overflow-hidden",
          "bg-white/70 dark:bg-gray-800/70 high-contrast:bg-black/90",
          "border border-white/50 dark:border-gray-700/50 high-contrast:border-white/30 high-contrast:border-2"
        )}>
          {/* Decorative bubbles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-300/20 to-blue-400/20 rounded-full blur-3xl"></div>
          
          <div className="relative">
            <h3 className={cn("text-lg font-semibold mb-4 flex items-center gap-2", themeText.primary)}>
              <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400 high-contrast:text-purple-500" />
              {t('progress.weeklyFrequency')}
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
                      className={cn(
                        "w-full aspect-square rounded-lg flex items-center justify-center font-medium transition-all",
                        hasWorkout 
                          ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md" 
                          : cn(
                            "bg-gray-100 dark:bg-gray-700 high-contrast:bg-gray-900",
                            "text-gray-400 dark:text-gray-500 high-contrast:text-gray-600"
                          )
                      )}
                    >
                      {day}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Personal Records */}
        <div className={cn(
          "relative backdrop-blur-md rounded-3xl p-6 shadow-xl overflow-hidden",
          "bg-white/70 dark:bg-gray-800/70 high-contrast:bg-black/90",
          "border border-white/50 dark:border-gray-700/50 high-contrast:border-white/30 high-contrast:border-2"
        )}>
          {/* Decorative bubbles */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-yellow-300/20 to-orange-400/20 rounded-full blur-3xl"></div>
          
          <div className="relative">
            <h3 className={cn("text-lg font-semibold mb-4 flex items-center gap-2", themeText.primary)}>
              <Award className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
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
                const darkColors = [
                  'dark:from-orange-900/30 dark:to-orange-800/20 dark:text-orange-400',
                  'dark:from-purple-900/30 dark:to-purple-800/20 dark:text-purple-400',
                  'dark:from-blue-900/30 dark:to-blue-800/20 dark:text-blue-400',
                  'dark:from-green-900/30 dark:to-green-800/20 dark:text-green-400'
                ];
                const highContrastColors = [
                  'high-contrast:from-orange-900/50 high-contrast:to-orange-800/30 high-contrast:text-orange-500',
                  'high-contrast:from-purple-900/50 high-contrast:to-purple-800/30 high-contrast:text-purple-500',
                  'high-contrast:from-blue-900/50 high-contrast:to-blue-800/30 high-contrast:text-blue-500',
                  'high-contrast:from-green-900/50 high-contrast:to-green-800/30 high-contrast:text-green-500'
                ];
                const colorClass = colors[index % colors.length];
                const darkColorClass = darkColors[index % darkColors.length];
                const highContrastColorClass = highContrastColors[index % highContrastColors.length];
                
                return (
                  <div 
                    key={index}
                    className={cn(
                      "flex items-center justify-between p-4 backdrop-blur-sm rounded-xl",
                      `bg-gradient-to-r ${colorClass.split(' text-')[0]}`,
                      darkColorClass.split(' dark:text-')[0],
                      highContrastColorClass.split(' high-contrast:text-')[0]
                    )}
                  >
                    <div>
                      <p className={cn("font-medium", themeText.primary)}>{record.exercise}</p>
                      <p className={cn("text-sm", themeText.secondary)}>
                        {record.weight} kg · {formatDate(record.date)}
                      </p>
                    </div>
                    <span className={cn(
                      "font-semibold",
                      colorClass.split(' ')[1],
                      darkColorClass.split(' ')[1],
                      highContrastColorClass.split(' ')[1]
                    )}>
                      +{record.improvement} kg
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* AI Insights & Tips Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <h2 className={cn("text-xl font-bold", themeText.primary)}>
              {t('progress.insights')}
            </h2>
          </div>

          {/* Insights Card */}
          <InsightsCard insights={insights.data} isLoading={insights.isLoading} />

          {/* Motivational Content */}
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 className={cn("text-xl font-bold", themeText.primary)}>
              {t('progress.motivation')}
            </h2>
          </div>

          <MotivationalSection content={motivation.data} isLoading={motivation.isLoading} />
        </div>
      </div>

      <BottomNavbar />
    </div>
    </SwipeableLayout>
  );
};

export default Progress;