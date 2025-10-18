import React from 'react';
import BottomNavbar from '../components/shared/BottomNavbar';

const Workouts: React.FC = () => {
  const workouts = [
    {
      id: 1,
      name: 'Entrenamiento de fuerza - Tren superior',
      duration: '45 min',
      exercises: 8,
      difficulty: 'Intermedio',
      type: 'Fuerza'
    },
    {
      id: 2,
      name: 'Cardio HIIT',
      duration: '30 min',
      exercises: 6,
      difficulty: 'Avanzado',
      type: 'Cardio'
    },
    {
      id: 3,
      name: 'Entrenamiento de piernas',
      duration: '50 min',
      exercises: 10,
      difficulty: 'Intermedio',
      type: 'Fuerza'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Entrenamientos</h1>
              <p className="text-gray-600">Descubre y realiza entrenamientos personalizados</p>
            </div>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors">
              Crear entrenamiento
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button className="border-orange-500 text-orange-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                Todos
              </button>
              <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                Fuerza
              </button>
              <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                Cardio
              </button>
              <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                Flexibilidad
              </button>
            </nav>
          </div>
        </div>

        {/* Workout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workouts.map((workout) => (
            <div key={workout.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {workout.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{workout.duration}</span>
                      <span>{workout.exercises} ejercicios</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    workout.type === 'Fuerza' 
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {workout.type}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    workout.difficulty === 'Principiante'
                      ? 'bg-green-100 text-green-800'
                      : workout.difficulty === 'Intermedio'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {workout.difficulty}
                  </span>
                  
                  <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                    Iniciar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Start */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Inicio rápido</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 transition-colors">
              <div className="text-center">
                <div className="text-orange-500 mb-2">💪</div>
                <div className="font-medium">Entrenamiento rápido</div>
                <div className="text-sm text-gray-500">15-20 minutos</div>
              </div>
            </button>
            
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 transition-colors">
              <div className="text-center">
                <div className="text-orange-500 mb-2">🏃‍♂️</div>
                <div className="font-medium">Cardio express</div>
                <div className="text-sm text-gray-500">10-15 minutos</div>
              </div>
            </button>
            
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 transition-colors">
              <div className="text-center">
                <div className="text-orange-500 mb-2">🧘‍♀️</div>
                <div className="font-medium">Estiramiento</div>
                <div className="text-sm text-gray-500">5-10 minutos</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <BottomNavbar />
    </div>
  );
};

export default Workouts;