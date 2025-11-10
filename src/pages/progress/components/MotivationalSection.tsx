import React from 'react';
import { Lightbulb, Sparkles, Quote } from 'lucide-react';
import { cn, themeText } from '../../../shared/utils/themeUtils';
import type { MotivationalContent } from '../../../types/recommendation.types';

interface MotivationalSectionProps {
  content: MotivationalContent | undefined;
  isLoading: boolean;
}

const MotivationalSection: React.FC<MotivationalSectionProps> = ({ content, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
      </div>
    );
  }

  if (!content) return null;

  return (
    <div className="space-y-4">
      {/* Quote of the Day */}
      {content.quote && (
        <div className={cn(
          "rounded-2xl p-6 shadow-lg relative overflow-hidden",
          "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
          "border border-purple-100 dark:border-purple-900"
        )}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full -mr-16 -mt-16 opacity-30"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Quote className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className={cn("text-sm font-semibold", themeText.primary)}>
                Frase del Día
              </h3>
            </div>
            <p className={cn("text-base italic", themeText.secondary)}>
              {content.quote}
            </p>
          </div>
        </div>
      )}

      {/* Daily Tip */}
      {content.dailyTip && (
        <div className={cn(
          "rounded-2xl p-5 shadow-lg relative overflow-hidden",
          "bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20",
          "border border-cyan-100 dark:border-cyan-900"
        )}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-200 to-blue-200 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-full -mr-12 -mt-12 opacity-30"></div>
          
          <div className="relative z-10 flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white shadow-md">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={cn("text-sm font-semibold mb-1", themeText.primary)}>
                💡 Tip del Día
              </h4>
              <p className={cn("text-sm", themeText.secondary)}>
                {content.dailyTip}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Motivational Messages */}
      {content.motivationalMessages && content.motivationalMessages.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <h3 className={cn("text-sm font-semibold", themeText.primary)}>
              Motivación
            </h3>
          </div>
          
          {content.motivationalMessages.map((message, index) => {
            const priorityColors = {
              high: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800',
              medium: 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800',
              low: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800',
            };

            const gradient = priorityColors[message.priority] || priorityColors.medium;

            return (
              <div
                key={index}
                className={cn(
                  "rounded-xl p-4 shadow-md border transition-all duration-300 hover:shadow-lg",
                  `bg-gradient-to-br ${gradient}`
                )}
              >
                <h4 className={cn("text-sm font-semibold mb-1", themeText.primary)}>
                  {message.title}
                </h4>
                <p className={cn("text-xs", themeText.muted)}>
                  {message.description}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MotivationalSection;
