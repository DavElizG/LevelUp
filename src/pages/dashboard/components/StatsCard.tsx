import React from 'react';
import { cn, themeText } from '../../../shared/utils/themeUtils';

interface StatsCardProps {
  icon: string;
  label: string;
  value: number;
  target?: number;
  color: 'orange' | 'green' | 'cyan';
  unit?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, label, value, target, color, unit = '' }) => {
  const progress = target ? Math.min(100, (value / target) * 100) : 0;

  const colorClasses = {
    orange: {
      bg: 'from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-800/20 high-contrast:from-orange-900/50 high-contrast:to-orange-800/30',
      text: 'text-orange-500 dark:text-orange-400 high-contrast:text-orange-500',
      progressBg: 'bg-orange-100 dark:bg-orange-900/30 high-contrast:bg-orange-900/50',
      progressBar: 'from-orange-400 to-orange-600',
      border: 'border-orange-100 dark:border-orange-900 high-contrast:border-orange-600 high-contrast:border-2'
    },
    green: {
      bg: 'from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 high-contrast:from-green-900/50 high-contrast:to-green-800/30',
      text: 'text-green-500 dark:text-green-400 high-contrast:text-green-500',
      progressBg: 'bg-green-100 dark:bg-green-900/30 high-contrast:bg-green-900/50',
      progressBar: 'from-green-400 to-green-600',
      border: 'border-green-100 dark:border-green-900 high-contrast:border-green-600 high-contrast:border-2'
    },
    cyan: {
      bg: 'from-cyan-100 to-cyan-50 dark:from-cyan-900/30 dark:to-cyan-800/20 high-contrast:from-cyan-900/50 high-contrast:to-cyan-800/30',
      text: 'text-cyan-500 dark:text-cyan-400 high-contrast:text-cyan-500',
      progressBg: 'bg-cyan-100 dark:bg-cyan-900/30 high-contrast:bg-cyan-900/50',
      progressBar: 'from-cyan-400 to-cyan-600',
      border: 'border-cyan-100 dark:border-cyan-900 high-contrast:border-cyan-600 high-contrast:border-2'
    }
  };

  const colors = colorClasses[color];

  return (
    <div className={cn(
      "rounded-2xl p-4 shadow-lg relative overflow-hidden group hover:shadow-xl transition-all duration-300",
      "bg-white dark:bg-gray-800 high-contrast:bg-black",
      colors.border
    )}>
      <div className={cn(
        "absolute top-0 right-0 w-20 h-20 bg-gradient-to-br rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-300",
        colors.bg
      )}></div>
      <div className="relative z-10">
        <div className={cn("text-sm font-semibold mb-1", colors.text)}>
          {icon} {label}
        </div>
        <div className={cn("text-2xl font-bold mb-1", themeText.primary)}>
          {value}{unit}
        </div>
        {target && (
          <>
            <div className={cn("text-xs", themeText.muted)}>de {target}{unit}</div>
            <div className={cn("w-full rounded-full h-1.5 mt-2", colors.progressBg)}>
              <div 
                className={cn("bg-gradient-to-r h-1.5 rounded-full transition-all duration-500", colors.progressBar)}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
