import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import FoodPhotoAnalyzer from './FoodPhotoAnalyzer';

interface Food {
  id: string;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  brand?: string;
  category?: string;
}

interface FoodSearchProps {
  onSelectFood: (food: Food, quantity: number) => void;
  onClose: () => void;
  mealType?: string;
  asPage?: boolean;
}

const FoodSearch: React.FC<FoodSearchProps> = ({ onSelectFood, onClose, mealType, asPage }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState(100);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [activeTab, setActiveTab] = useState<'frecuentes'|'recientes'|'favoritos'>('frecuentes');
  const [showPhotoAnalyzer, setShowPhotoAnalyzer] = useState(false);

  const mealLabel = mealType === 'breakfast' ? 'Desayuno' : mealType === 'lunch' ? 'Almuerzo' : mealType === 'snack' ? 'Merienda' : mealType === 'dinner' ? 'Cena' : '';

  // When opened for a specific meal, fetch some initial suggestions
  const fetchInitialFoods = async (type: string) => {
    setLoading(true);
    try {
      setErrorMsg('');
      if (!supabase) {
        setErrorMsg('No se pudo conectar a la base de datos.');
        setFoods([]);
        return;
      }

      // Try to fetch foods by category matching the meal type, fallback to a small list
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .ilike('category', `%${type}%`)
        .limit(10);

      if (error) {
        // fallback: fetch any 10 foods
        const res = await supabase.from('foods').select('*').limit(10);
        setFoods(res.data || []);
      } else {
        setFoods(data || []);
      }
    } catch (err) {
      console.error('Error fetching initial foods:', err);
      setErrorMsg('Error al cargar sugerencias.');
    } finally {
      setLoading(false);
    }
  };

  const searchFoods = async (term: string) => {
    if (term.length < 2) {
      setFoods([]);
      return;
    }

    setLoading(true);
    try {
      setErrorMsg('');
      if (!supabase) {
        setErrorMsg('No se pudo conectar a la base de datos.');
        setFoods([]);
        return;
      }
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .ilike('name', `%${term}%`)
        .limit(20);

      if (error) throw error;
      setFoods(data || []);
    } catch (error) {
      setErrorMsg('Error al buscar alimentos. Intenta de nuevo.');
      console.error('Error searching foods:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchFoods(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // focus input when modal opens
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // when opened with a mealType, fetch initial suggestions
  useEffect(() => {
    if (mealType) {
      // set a placeholder search term to avoid immediate 'no results' message
      setSearchTerm('');
      fetchInitialFoods(mealType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mealType]);

  const quickAdd = (food: Food, qty = 100) => {
    // call parent handler and close
    onSelectFood(food, qty);
    onClose();
  };

  const calculateNutrition = (food: Food, grams: number) => {
    const multiplier = grams / 100;
    return {
      calories: Math.round(food.calories_per_100g * multiplier),
      protein: Math.round(food.protein_per_100g * multiplier * 10) / 10,
      carbs: Math.round(food.carbs_per_100g * multiplier * 10) / 10,
      fat: Math.round(food.fat_per_100g * multiplier * 10) / 10,
    };
  };

  const handleAddFood = () => {
    if (selectedFood) {
      onSelectFood(selectedFood, quantity);
      onClose();
    }
  };

  const outerClass = asPage
    ? 'min-h-screen flex flex-col'
    : 'fixed inset-0 flex items-end z-50';

  const panelClass = asPage
    ? 'bg-white w-full flex-1 flex flex-col'
    : 'bg-white rounded-t-2xl w-full max-h-[90vh] flex flex-col';

  return (
    <div className={outerClass}>
      <div className={panelClass}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Buscar Alimento {mealLabel ? `- ${mealLabel}` : ''}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Top action cards */}
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/food-photo-analyzer', { state: { mealType: mealType || 'lunch' } })}
              className="flex flex-col items-start p-4 rounded-lg border bg-gradient-to-br from-purple-600 to-purple-500 text-white"
            >
              <div className="text-xs font-semibold uppercase bg-white/20 px-2 py-1 rounded-full mb-2">IA • BETA</div>
              <div className="font-semibold text-lg">Hacer foto</div>
              <div className="text-sm opacity-90 mt-1">Haz una foto o sube una imagen de tu comida</div>
            </button>

            <button
              onClick={() => { /* TODO: barcode scan integration */ }}
              className="flex flex-col items-start p-4 rounded-lg border bg-gray-50"
            >
              <div className="font-semibold text-lg">Buscar o escanear</div>
              <div className="text-sm text-gray-600 mt-1">Explora la base de datos o escanea un código de barras</div>
            </button>
          </div>

          {/* Search input */}
          <div className="relative">
            <input
              type="text"
              placeholder="¿Qué has almorzado?"
              ref={inputRef}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <button className="absolute right-3 top-2.5 p-2 rounded-md border border-gray-200 text-gray-600">📷</button>
          </div>

          {/* Category chips */}
          <div className="flex gap-2 overflow-x-auto py-2">
            {['Alimentos','Comidas','Recetas','Bebidas','Snacks'].map(c => (
              <button key={c} className="px-3 py-1 rounded-lg border border-gray-200 text-sm whitespace-nowrap">{c}</button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-4">
          {errorMsg && (
            <div className="text-red-500 text-center py-2">{errorMsg}</div>
          )}
          {loading && (
            <div className="text-center py-8">
              <div className="text-gray-500">Buscando...</div>
            </div>
          )}

          {!loading && foods.length === 0 && searchTerm.length >= 2 && !errorMsg && (
            <div className="text-center py-8">
              <div className="text-gray-500">No se encontraron alimentos</div>
            </div>
          )}

          <div className="space-y-2 pb-20">
            {/* Tabs */}
            <div className="flex gap-4 mb-3">
              <button onClick={() => setActiveTab('frecuentes')} className={`px-3 py-1 rounded-full ${activeTab==='frecuentes' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Frecuentes</button>
              <button onClick={() => setActiveTab('recientes')} className={`px-3 py-1 rounded-full ${activeTab==='recientes' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Recientes</button>
              <button onClick={() => setActiveTab('favoritos')} className={`px-3 py-1 rounded-full ${activeTab==='favoritos' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Favoritos</button>
            </div>

            {(foods.length === 0 && !loading) ? (
              <div className="text-center py-8 text-gray-500">Sin resultados. Escribe para buscar o usa la cámara.</div>
            ) : (
              foods.map((food) => (
                <div key={food.id} className="w-full flex items-center justify-between p-3 rounded-lg border bg-white">
                  <button onClick={() => setSelectedFood(food)} className="flex-1 text-left">
                    <div className="font-medium text-gray-900">{food.name}</div>
                    <div className="text-sm text-gray-600">{food.calories_per_100g} kcal por 100g{food.brand ? ` • ${food.brand}` : ''}</div>
                  </button>
                  <div className="text-right flex flex-col items-end">
                    <div className="font-semibold text-gray-900">{food.calories_per_100g} kcal</div>
                    <button onClick={() => quickAdd(food, 100)} className="mt-2 inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 text-blue-600">+</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Food Details */}
        {selectedFood && (
          <div className="border-t bg-gray-50 p-4">
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">{selectedFood.name}</h3>
              
              {/* Quantity Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad (gramos)
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  min="1"
                />
              </div>

              {/* Nutrition Info */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-pink-500">
                    {calculateNutrition(selectedFood, quantity).calories}
                  </div>
                  <div className="text-xs text-gray-600">kcal</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-500">
                    {calculateNutrition(selectedFood, quantity).protein}g
                  </div>
                  <div className="text-xs text-gray-600">Proteína</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-500">
                    {calculateNutrition(selectedFood, quantity).carbs}g
                  </div>
                  <div className="text-xs text-gray-600">Carbos</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-500">
                    {calculateNutrition(selectedFood, quantity).fat}g
                  </div>
                  <div className="text-xs text-gray-600">Grasas</div>
                </div>
              </div>

              <button
                onClick={handleAddFood}
                disabled={quantity < 1}
                className={`w-full bg-pink-500 text-white py-3 rounded-lg font-medium ${quantity < 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Agregar Alimento"
              >
                Agregar Alimento
              </button>
            </div>
          </div>
        )}

        {/* Bottom action bar */}
        <div className="fixed left-0 right-0 bottom-0 p-4 bg-white border-t hidden md:block">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">0</div>
              <div className="text-sm text-gray-600">Seleccionados</div>
            </div>
            <button onClick={() => { onClose(); }} className="bg-blue-600 text-white px-6 py-3 rounded-full">Listo</button>
          </div>
        </div>
      </div>

      {showPhotoAnalyzer && (
        <FoodPhotoAnalyzer
          onAnalysisComplete={(job) => {
            // For now, create a placeholder food since analysis is async
            // In the future, this should poll for results or use real-time updates
            const placeholderFood: Food = {
              id: `analyzed-${job.id}`,
              name: 'Análisis en progreso...',
              calories_per_100g: 0,
              protein_per_100g: 0,
              carbs_per_100g: 0,
              fat_per_100g: 0,
            };
            
            // Show a message that analysis is in progress
            alert('Imagen subida. El análisis tomará unos momentos. Por ahora se agregó un placeholder.');
            
            onSelectFood(placeholderFood, 100);
            setShowPhotoAnalyzer(false);
            onClose();
          }}
          onClose={() => setShowPhotoAnalyzer(false)}
        />
      )}
    </div>
  );
};

export default FoodSearch;