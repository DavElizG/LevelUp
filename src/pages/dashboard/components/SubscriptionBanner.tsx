import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../shared/utils/themeUtils';

const SubscriptionBanner: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate('/subscription')}
      className={cn(
        "rounded-2xl p-5 shadow-lg relative overflow-hidden cursor-pointer group",
        "bg-gradient-to-r from-orange-500 to-amber-500 dark:from-orange-600 dark:to-amber-600",
        "transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
      )}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12"></div>
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">👑</span>
            <h3 className="text-lg font-bold text-white">Mejora tu Plan</h3>
          </div>
          <p className="text-sm text-white/90 mb-3">
            Genera rutinas y planes ilimitados con IA
          </p>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold text-white">
            <span>Ver Planes</span>
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
        <div className="flex-shrink-0 w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
          ⚡
        </div>
      </div>
    </div>
  );
};

export default SubscriptionBanner;
