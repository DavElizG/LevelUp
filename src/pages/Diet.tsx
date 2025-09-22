import React from 'react';

const Diet: React.FC = () => {
  const meals = [
    {
      id: 1,
      name: 'Desayuno',
      time: '08:00',
      calories: 420,
      items: ['Avena con frutas', 'Yogur griego', 'Almendras']
    },
    {
      id: 2,
      name: 'Almuerzo',
      time: '13:00',
      calories: 680,
      items: ['Pollo a la plancha', 'Arroz integral', 'Ensalada mixta']
    },
    {
      id: 3,
      name: 'Merienda',
      time: '16:30',
      calories: 180,
      items: ['Manzana', 'Mantequilla de maní']
    },
    {
      id: 4,
      name: 'Cena',
      time: '20:00',
      calories: 520,
      items: ['Salmón al horno', 'Vegetales asados', 'Quinoa']
    }
  ];

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const targetCalories = 2000;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Plan alimenticio</h1>
              <p className="text-gray-600">Mantén un registro de tu nutrición diaria</p>
            </div>
            <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors">
              Agregar comida
            </button>
          </div>
        </div>

        {/* Calorie Summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Resumen calórico</h3>
            <span className="text-2xl font-bold text-green-500">
              {totalCalories} / {targetCalories} kcal
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((totalCalories / targetCalories) * 100, 100)}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>Consumidas: {totalCalories} kcal</span>
            <span>Restantes: {Math.max(targetCalories - totalCalories, 0)} kcal</span>
          </div>
        </div>

        {/* Macronutrients */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Proteínas</h4>
              <span className="text-blue-500 font-semibold">125g</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <div className="text-sm text-gray-500 mt-1">Meta: 150g</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Carbohidratos</h4>
              <span className="text-orange-500 font-semibold">180g</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
            <div className="text-sm text-gray-500 mt-1">Meta: 220g</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Grasas</h4>
              <span className="text-purple-500 font-semibold">65g</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '90%' }}></div>
            </div>
            <div className="text-sm text-gray-500 mt-1">Meta: 70g</div>
          </div>
        </div>

        {/* Meals */}
        <div className="space-y-6">
          {meals.map((meal) => (
            <div key={meal.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-medium text-gray-900">{meal.name}</h3>
                  <span className="text-sm text-gray-500">{meal.time}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-semibold text-green-500">
                    {meal.calories} kcal
                  </span>
                  <button className="text-orange-500 hover:text-orange-600 transition-colors">
                    Editar
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {meal.items.map((item, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Add */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Agregar rápido</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition-colors">
              <div className="text-center">
                <div className="text-2xl mb-2">🥗</div>
                <div className="font-medium">Ensalada</div>
              </div>
            </button>
            
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition-colors">
              <div className="text-center">
                <div className="text-2xl mb-2">🍎</div>
                <div className="font-medium">Fruta</div>
              </div>
            </button>
            
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition-colors">
              <div className="text-center">
                <div className="text-2xl mb-2">🥤</div>
                <div className="font-medium">Bebida</div>
              </div>
            </button>
            
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition-colors">
              <div className="text-center">
                <div className="text-2xl mb-2">🍽️</div>
                <div className="font-medium">Otro</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diet;