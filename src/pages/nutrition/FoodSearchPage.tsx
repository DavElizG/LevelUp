/**
 * FoodSearchPage
 * Búsqueda híbrida de alimentos: base de datos local + OpenFoodFacts
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { searchFood, saveMealLog, type FoodItem } from '../../shared/services/foodSearch';

const FoodSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener meal type del estado de navegación
  const mealType = (location.state as { mealType?: string })?.mealType || 'lunch';

  // Estados
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(100);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  /**
   * Realiza la búsqueda híbrida
   */
  const handleSearch = async () => {
    if (!query.trim()) {
      setErrorMsg('Por favor ingresa un alimento');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setResults([]);

    try {
      const searchResults = await searchFood(query);
      setResults(searchResults);

      if (searchResults.length === 0) {
        setErrorMsg('No se encontraron resultados. Intenta con otro nombre.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setErrorMsg('Error al buscar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Selecciona un alimento de los resultados
   */
  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setQuantity(100); // Default 100g
  };

  /**
   * Guarda el alimento seleccionado en meal_logs
   */
  const handleSave = async () => {
    if (!selectedFood) return;

    if (quantity <= 0) {
      setErrorMsg('La cantidad debe ser mayor a 0');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      const result = await saveMealLog(selectedFood, quantity, mealType);

      if (result.success) {
        // Regresar a la página de nutrición
        navigate('/nutrition');
      } else {
        setErrorMsg(result.error || 'Error al guardar');
      }
    } catch (err) {
      console.error('Save error:', err);
      setErrorMsg('Error al guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Calcula valores nutricionales basados en cantidad
   */
  const calculateNutrition = (food: FoodItem, qty: number) => {
    const multiplier = qty / 100;
    return {
      calories: Math.round(food.calories_per_100g * multiplier),
      protein: Math.round(food.protein_per_100g * multiplier * 10) / 10,
      carbs: Math.round(food.carbs_per_100g * multiplier * 10) / 10,
      fat: Math.round(food.fat_per_100g * multiplier * 10) / 10,
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold">Buscar Alimento</h2>
          <div className="w-10 h-10"></div>
        </div>
      </div>

      <div className="p-4">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Ej: pollo, arroz, pizza..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                'Buscar'
              )}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Busca en 97+ alimentos locales (rápido) y OpenFoodFacts
          </p>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {errorMsg}
          </div>
        )}

        {/* Results List */}
        {!selectedFood && results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">Resultados ({results.length})</h3>
            {results.map((food, index) => (
              <button
                key={`${food.source}-${food.id || index}`}
                onClick={() => handleSelectFood(food)}
                className="w-full bg-white p-4 rounded-lg border border-gray-200 hover:border-orange-400 hover:shadow-md transition-all text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{food.name}</h4>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          food.source === 'local'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {food.source === 'local' ? 'Local' : 'OpenFoodFacts'}
                      </span>
                    </div>
                    {food.brand && (
                      <p className="text-sm text-gray-500 mb-2">{food.brand}</p>
                    )}
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold">{food.calories_per_100g} kcal</span> por 100g
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Proteína: {food.protein_per_100g}g | Carbos: {food.carbs_per_100g}g | Grasa: {food.fat_per_100g}g
                    </div>
                  </div>
                  {food.image_url && (
                    <img
                      src={food.image_url}
                      alt={food.name}
                      className="w-16 h-16 object-cover rounded ml-3"
                    />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Selected Food - Quantity Input */}
        {selectedFood && (
          <div className="space-y-4">
            <button
              onClick={() => setSelectedFood(null)}
              className="text-orange-500 font-medium flex items-center gap-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver a resultados
            </button>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{selectedFood.name}</h3>
                  {selectedFood.brand && (
                    <p className="text-sm text-gray-500">{selectedFood.brand}</p>
                  )}
                  <span
                    className={`inline-block text-xs px-2 py-1 rounded-full mt-2 ${
                      selectedFood.source === 'local'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {selectedFood.source === 'local' ? 'Base de datos local' : 'OpenFoodFacts'}
                  </span>
                </div>
                {selectedFood.image_url && (
                  <img
                    src={selectedFood.image_url}
                    alt={selectedFood.name}
                    className="w-24 h-24 object-cover rounded ml-4"
                  />
                )}
              </div>

              {/* Quantity Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad (gramos)
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 0)}
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
                />
              </div>

              {/* Nutrition Info */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Información Nutricional</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Calorías</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {calculateNutrition(selectedFood, quantity).calories}
                      <span className="text-sm text-gray-500 ml-1">kcal</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Proteína</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {calculateNutrition(selectedFood, quantity).protein}g
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Carbohidratos</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {calculateNutrition(selectedFood, quantity).carbs}g
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Grasa</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {calculateNutrition(selectedFood, quantity).fat}g
                    </p>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saving || quantity <= 0}
                className="w-full bg-orange-500 text-white py-4 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Guardando...</span>
                  </div>
                ) : (
                  `Agregar a ${mealType === 'breakfast' ? 'Desayuno' : mealType === 'lunch' ? 'Almuerzo' : mealType === 'snack' ? 'Merienda' : 'Cena'}`
                )}
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && results.length === 0 && !selectedFood && !errorMsg && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-gray-500">Busca alimentos por nombre</p>
            <p className="text-sm text-gray-400 mt-2">
              Ejemplo: pollo, arroz, pizza, ensalada
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodSearchPage;
