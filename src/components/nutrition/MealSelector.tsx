import React from 'react';

interface MealSelectorProps {
  onSelectMeal: (mealType: string) => void;
  onClose: () => void;
}

const MealSelector: React.FC<MealSelectorProps> = ({ onSelectMeal, onClose }) => {
  const meals = [
    { id: 'breakfast', name: 'Desayuno', icon: '🌅', color: 'yellow' },
    { id: 'lunch', name: 'Almuerzo', icon: '☀️', color: 'green' },
    { id: 'snack', name: 'Merienda', icon: '🍎', color: 'blue' },
    { id: 'dinner', name: 'Cena', icon: '🌙', color: 'purple' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
      <div className="bg-white rounded-t-2xl w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Seleccionar Comida</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-3">
          {meals.map((meal) => (
            <button
              key={meal.id}
              onClick={() => {
                onSelectMeal(meal.id);
                onClose();
              }}
              className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="text-2xl mr-4">{meal.icon}</div>
              <div className="text-left">
                <div className="font-medium text-gray-900">{meal.name}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MealSelector;