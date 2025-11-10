import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn, themeText } from '../../../shared/utils/themeUtils';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  gradient: string;
  emoji?: string;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ 
  title, 
  description, 
  icon, 
  route, 
  gradient,
  emoji 
}) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(route)}
      className={cn(
        "rounded-2xl p-5 shadow-lg cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group",
        "bg-white dark:bg-gray-800 high-contrast:bg-black",
        "border border-gray-100 dark:border-gray-700 high-contrast:border-orange-600 high-contrast:border-2"
      )}
    >
      <div className={cn(
        "absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 opacity-10 group-hover:scale-110 transition-transform duration-300",
        gradient
      )}></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br",
            gradient
          )}>
            {emoji ? <span className="text-2xl">{emoji}</span> : icon}
          </div>
          <svg 
            className="w-5 h-5 text-gray-400 dark:text-gray-600 group-hover:text-orange-500 group-hover:translate-x-1 transition-all duration-300" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
        
        <h3 className={cn("text-lg font-bold mb-1", themeText.primary)}>{title}</h3>
        <p className={cn("text-sm", themeText.muted)}>{description}</p>
      </div>
    </div>
  );
};

export default QuickActionCard;
