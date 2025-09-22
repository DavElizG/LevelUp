import React from 'react';
import BottomNavbar from '../components/shared/BottomNavbar';

const Nutrition: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-medium text-gray-900">Mi Plan Nutricional</h1>
          <div className="text-sm text-gray-500">19:02</div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Daily Summary */}
        <div className="bg-white rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen Diario</h2>
          
          {/* Calories Progress Circle */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#ec4899"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 50 * 0.75} ${2 * Math.PI * 50}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">1,850</span>
                <span className="text-sm text-gray-500">/ 2,400 kcal</span>
              </div>
            </div>
          </div>

          {/* Macros */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-orange-500">120g</div>
              <div className="text-sm text-gray-600">Proteínas</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-orange-500 h-2 rounded-full" style={{width: '80%'}}></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-500">180g</div>
              <div className="text-sm text-gray-600">Carbohidratos</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-green-500 h-2 rounded-full" style={{width: '70%'}}></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-500">65g</div>
              <div className="text-sm text-gray-600">Grasas</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-blue-500 h-2 rounded-full" style={{width: '85%'}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button className="bg-pink-500 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </div>
            <span className="text-sm font-medium">Agregar Comida</span>
          </button>
          
          <button className="bg-orange-500 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <span className="text-sm font-medium">Plan de Comidas</span>
          </button>
        </div>

        {/* Today's Meals */}
        <div className="bg-white rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Comidas de Hoy</h3>
          
          <div className="space-y-4">
            {/* Breakfast */}
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-200 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Desayuno</div>
                  <div className="text-sm text-gray-600">Avena con frutas</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">450 kcal</div>
                <div className="text-sm text-gray-500">8:30 AM</div>
              </div>
            </div>

            {/* Lunch */}
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Almuerzo</div>
                  <div className="text-sm text-gray-600">Pollo con arroz</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">680 kcal</div>
                <div className="text-sm text-gray-500">1:00 PM</div>
              </div>
            </div>

            {/* Snack */}
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Merienda</div>
                  <div className="text-sm text-gray-600">Batido de proteína</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">320 kcal</div>
                <div className="text-sm text-gray-500">4:30 PM</div>
              </div>
            </div>

            {/* Dinner - Pending */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-500">Cena</div>
                  <div className="text-sm text-gray-400">Agregar comida</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-400">-- kcal</div>
                <div className="text-sm text-gray-400">8:00 PM</div>
              </div>
            </div>
          </div>
        </div>

        {/* Water Intake */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hidratación</h3>
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">Objetivo diario: 2.5L</span>
            <span className="font-semibold text-blue-500">1.8L / 2.5L</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div className="bg-blue-500 h-3 rounded-full" style={{width: '72%'}}></div>
          </div>
          
          <div className="grid grid-cols-8 gap-2">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className={`h-8 rounded-lg flex items-center justify-center ${
                  index < 6 ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              >
                <svg className={`w-4 h-4 ${index < 6 ? 'text-white' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l-2 2v16l2 2 2-2V4l-2-2z"/>
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNavbar />
    </div>
  );
};

export default Nutrition;