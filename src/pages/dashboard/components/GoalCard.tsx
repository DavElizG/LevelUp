import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn, themeText } from '../../../shared/utils/themeUtils';

interface GoalCardProps {
  weekProgress: boolean[];
  getGoalIcon: () => string;
  formatGoal: () => string;
}

const GoalCard: React.FC<GoalCardProps> = ({ weekProgress, getGoalIcon, formatGoal }) => {
  const { t } = useTranslation();
  const weekProgressPercentage = Math.round((weekProgress.filter(Boolean).length / 7) * 100);

  return (
    <div className={cn(
      "rounded-3xl p-6 shadow-xl relative overflow-hidden",
      "bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-gray-800/50 high-contrast:from-black high-contrast:to-black",
      "border border-orange-100 dark:border-orange-900 high-contrast:border-orange-600 high-contrast:border-2"
    )}>
      <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-orange-200 to-pink-200 dark:from-orange-900/30 dark:to-pink-900/30 high-contrast:from-orange-900/50 high-contrast:to-pink-900/50 rounded-full opacity-20 blur-2xl"></div>
      <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-900/30 dark:to-pink-900/30 high-contrast:from-purple-900/50 high-contrast:to-pink-900/50 rounded-full opacity-20 blur-2xl"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={cn("text-lg font-bold mb-1", themeText.primary)}>{t('dashboard.currentGoal')}</h3>
            <p className={cn("text-sm", themeText.muted)}>{t('dashboard.focusOnWhatMatters')}</p>
          </div>
          <div className="text-4xl animate-pulse">{getGoalIcon()}</div>
        </div>

        <div className={cn(
          "backdrop-blur-sm rounded-2xl p-5 mb-4",
          "bg-white/80 dark:bg-gray-900/50 high-contrast:bg-black/50",
          "border border-orange-100 dark:border-orange-900 high-contrast:border-orange-600"
        )}>
          <h4 className={cn("text-2xl font-bold mb-2", themeText.primary)}>{formatGoal()}</h4>
          <div className="flex items-center justify-between text-sm">
            <span className={themeText.secondary}>{t('dashboard.weeklyProgress')}</span>
            <span className="font-bold text-orange-600 dark:text-orange-400 high-contrast:text-orange-500">{weekProgressPercentage}%</span>
          </div>
          <div className={cn(
            "w-full rounded-full h-3 mt-3 overflow-hidden",
            "bg-gray-100 dark:bg-gray-800 high-contrast:bg-gray-900"
          )}>
            <div 
              className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 h-3 rounded-full transition-all duration-700 relative"
              style={{ width: `${weekProgressPercentage}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekProgress.map((completed, index) => {
            const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
            return (
              <div key={`day-${index}`} className="text-center">
                <div className={cn(
                  "text-xs mb-1 font-medium",
                  themeText.muted
                )}>{days[index]}</div>
                <div className={cn(
                  "w-full h-2 rounded-full transition-all duration-300",
                  completed 
                    ? "bg-gradient-to-r from-orange-400 to-pink-500" 
                    : "bg-gray-200 dark:bg-gray-700 high-contrast:bg-gray-800"
                )}></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GoalCard;
