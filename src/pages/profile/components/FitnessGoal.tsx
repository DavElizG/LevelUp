import React from 'react';

interface FitnessGoalProps {
  goal: string;
}

const FitnessGoal: React.FC<FitnessGoalProps> = ({ goal }) => {
  const formatGoal = () => {
    if (!goal) return 'No especificado';
    const goals: Record<string, string> = {
      'lose_weight': 'Perder Peso',
      'gain_weight': 'Ganar Peso', 
      'gain_muscle': 'Ganar Músculo',
      'maintain': 'Mantener Peso',
      'improve_endurance': 'Mejorar Resistencia'
    };
    return goals[goal] || 'Objetivo personalizado';
  };

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl p-4 sm:p-6 mb-6 border border-white/50">
      <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mr-3 shadow-lg">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        Objetivo de Fitness
      </h3>
      
      <div className="relative overflow-hidden group bg-gradient-to-br from-orange-50/80 via-pink-50/80 to-purple-100/80 backdrop-blur-sm rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100/50">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/30 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-200/30 rounded-full blur-2xl"></div>
        
        <div className="relative flex items-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 sm:mr-5 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-xs sm:text-sm text-purple-700 font-medium mb-1">Mi Meta</div>
            <div className="text-lg sm:text-xl font-bold text-purple-900 mb-2">{formatGoal()}</div>
            <div className="flex items-center text-xs text-purple-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              Objetivo activo
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FitnessGoal;
