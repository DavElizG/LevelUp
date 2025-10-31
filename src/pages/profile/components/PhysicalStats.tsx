import React from 'react';

interface PhysicalStatsProps {
  weight: number | string;
  height: number | string;
}

const PhysicalStats: React.FC<PhysicalStatsProps> = ({ weight, height }) => {
  const formatWeight = () => {
    if (!weight) return 'No especificado';
    return `${weight} kg`;
  };

  const formatHeight = () => {
    if (!height) return 'No especificado';
    return `${height} cm`;
  };

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl p-4 sm:p-6 mb-6 border border-white/50">
      <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mr-3 shadow-lg">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
          </svg>
        </div>
        Estadísticas Físicas
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative overflow-hidden group bg-gradient-to-br from-blue-50/80 via-cyan-50/80 to-blue-100/80 backdrop-blur-sm rounded-2xl p-4 sm:p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-blue-100/50">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200/30 rounded-full blur-2xl"></div>
          <div className="relative flex items-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z"/>
              </svg>
            </div>
            <div>
              <div className="text-xs sm:text-sm text-blue-700 font-medium mb-1">Peso Actual</div>
              <div className="text-xl sm:text-2xl font-bold text-blue-900">{formatWeight()}</div>
            </div>
          </div>
        </div>
        
        <div className="relative overflow-hidden group bg-gradient-to-br from-green-50/80 via-emerald-50/80 to-green-100/80 backdrop-blur-sm rounded-2xl p-4 sm:p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-green-100/50">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-200/30 rounded-full blur-2xl"></div>
          <div className="relative flex items-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V9H1v11h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/>
              </svg>
            </div>
            <div>
              <div className="text-xs sm:text-sm text-green-700 font-medium mb-1">Altura</div>
              <div className="text-xl sm:text-2xl font-bold text-green-900">{formatHeight()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhysicalStats;
