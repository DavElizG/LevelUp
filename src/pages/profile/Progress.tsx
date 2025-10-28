import React from 'react';
import BottomNavbar from '../../components/shared/BottomNavbar';

const Progress: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-medium text-gray-900">Progreso</h1>
          <div className="text-sm text-gray-500">19:02</div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Weekly Overview */}
        <div className="bg-white rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen Semanal</h2>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">12</div>
              <div className="text-sm text-gray-600">Entrenamientos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">2.4k</div>
              <div className="text-sm text-gray-600">Calorías</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">15h</div>
              <div className="text-sm text-gray-600">Tiempo activo</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">7</div>
              <div className="text-sm text-gray-600">Días seguidos</div>
            </div>
          </div>
        </div>

        {/* Weight Progress */}
        <div className="bg-white rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolución de Peso</h3>
          
          {/* Chart Placeholder */}
          <div className="relative h-48 mb-4">
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
              <span>80kg</span>
              <span>75kg</span>
              <span>70kg</span>
              <span>65kg</span>
              <span>60kg</span>
            </div>
            
            <div className="ml-12 h-full relative">
              <div className="absolute inset-0 flex flex-col justify-between">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="border-t border-gray-200"></div>
                ))}
              </div>
              
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 200">
                <defs>
                  <linearGradient id="weightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1"/>
                  </linearGradient>
                </defs>
                <path
                  d="M 20 120 Q 80 110 140 100 Q 200 95 260 90"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  fill="none"
                />
                <path
                  d="M 20 120 Q 80 110 140 100 Q 200 95 260 90 L 260 200 L 20 200 Z"
                  fill="url(#weightGradient)"
                />
              </svg>
            </div>
            
            <div className="ml-12 mt-2 flex justify-between text-xs text-gray-500">
              <span>Ene</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Abr</span>
              <span>May</span>
              <span>Jun</span>
            </div>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Peso inicial: <span className="font-semibold">75kg</span></span>
            <span className="text-gray-600">Peso actual: <span className="font-semibold text-blue-600">72kg</span></span>
          </div>
        </div>

        {/* Workout Frequency */}
        <div className="bg-white rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Frecuencia de Entrenamientos</h3>
          
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-gray-500 mb-2">{day}</div>
                <div className={`h-8 rounded-lg ${
                  index < 5 ? 'bg-orange-500' : 'bg-gray-200'
                }`}></div>
              </div>
            ))}
          </div>
          
          <div className="text-center text-sm text-gray-600">
            5 de 7 días esta semana
          </div>
        </div>

        {/* Personal Records */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Records Personales</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Press de banca</div>
                <div className="text-sm text-gray-600">Hace 3 días</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-orange-500">80kg</div>
                <div className="text-sm text-gray-500">+5kg</div>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Sentadillas</div>
                <div className="text-sm text-gray-600">Hace 1 semana</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-500">100kg</div>
                <div className="text-sm text-gray-500">+10kg</div>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Peso muerto</div>
                <div className="text-sm text-gray-600">Hace 2 semanas</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-blue-500">120kg</div>
                <div className="text-sm text-gray-500">+15kg</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNavbar />
    </div>
  );
};

export default Progress;