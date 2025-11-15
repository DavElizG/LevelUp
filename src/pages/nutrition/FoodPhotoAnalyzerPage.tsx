/**
 * FoodPhotoAnalyzerPage
 * Análisis de comida con IA usando el microservicio
 * Detecta múltiples alimentos en una imagen (ej: 2 huevos + 1 tortilla)
 */

import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Camera, CameraResultType } from '@capacitor/camera';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { analyzeFoodImage, type DetectedFood } from '../../shared/services/foodVision';
import { saveMealLog, type FoodItem } from '../../shared/services/foodSearch';

const FoodPhotoAnalyzerPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estados
  const [mealType, setMealType] = useState<string>(
    (location.state as { mealType?: string })?.mealType || 'lunch'
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [detectedFoods, setDetectedFoods] = useState<DetectedFood[]>([]);
  const [totalNutrition, setTotalNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isNative = !!(window as { Capacitor?: unknown }).Capacitor;

  /**
   * Maneja la selección de imagen desde input file
   */
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setDetectedFoods([]);
        setTotalNutrition({ calories: 0, protein: 0, carbs: 0, fat: 0 });
        setSuggestions([]);
        setErrorMsg('');
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Abre la cámara nativa (Capacitor)
   */
  const handleNativeCamera = async () => {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
      });
      setSelectedImage(photo.dataUrl || null);
      setDetectedFoods([]);
      setTotalNutrition({ calories: 0, protein: 0, carbs: 0, fat: 0 });
      setSuggestions([]);
      setErrorMsg('');
    } catch (err) {
      console.error('Camera error:', err);
      setErrorMsg(t('foodPhotoAnalyzer.cameraError'));
    }
  };

  /**
   * Analiza la imagen con IA (microservicio)
   * Detecta múltiples alimentos en una sola imagen
   */
  const analyzeImage = async () => {
    if (!selectedImage) return;

    setAnalyzing(true);
    setErrorMsg('');

    try {
      // Analizar con el microservicio de IA
      const result = await analyzeFoodImage(selectedImage);

      console.log('Analysis result:', result);

      // Actualizar estados con los resultados
      setDetectedFoods(result.detectedFoods);
      setTotalNutrition({
        calories: result.totalEstimatedCalories,
        protein: result.totalEstimatedProtein,
        carbs: result.totalEstimatedCarbs,
        fat: result.totalEstimatedFat,
      });
      setSuggestions(result.suggestions || []);

      // Guardar en photo_food_analyses si Supabase está configurado
      if (isSupabaseConfigured && supabase) {
        try {
          // Obtener usuario
          const userRes = await supabase.auth.getUser();
          const userId = userRes?.data?.user?.id || null;

          // Subir imagen a Storage
          const res = await fetch(selectedImage);
          const blob = await res.blob();
          const fileName = `${userId || 'anon'}/${Date.now()}.jpg`;
          const bucket = 'food-photos';

          const uploadRes = await supabase.storage.from(bucket).upload(fileName, blob, {
            contentType: blob.type || 'image/jpeg',
            upsert: false,
          });

          if (uploadRes.error) {
            console.warn('Storage upload error:', uploadRes.error);
          } else {
            // Obtener URL pública
            const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(fileName);

            // Insertar en photo_food_analyses
            await supabase.from('photo_food_analyses').insert({
              user_id: userId,
              meal_type: mealType,
              image_path: fileName,
              image_url: publicData.publicUrl,
              status: 'completed',
              estimated_calories: result.totalEstimatedCalories,
              estimated_protein: result.totalEstimatedProtein,
              estimated_carbs: result.totalEstimatedCarbs,
              estimated_fat: result.totalEstimatedFat,
              food_items: JSON.stringify({
                detected: result.detectedFoods,
                suggestions: result.suggestions,
              }),
              completed_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            });
          }
        } catch (err) {
          console.error('Error saving to database:', err);
        }
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setErrorMsg(err instanceof Error ? err.message : t('foodPhotoAnalyzer.analysisError'));
    } finally {
      setAnalyzing(false);
    }
  };

  /**
   * Guarda cada alimento detectado en meal_logs
   */
  const handleSaveAll = async () => {
    if (detectedFoods.length === 0) {
      setErrorMsg(t('foodPhotoAnalyzer.noFoodsDetected'));
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      // Guardar cada alimento detectado
      for (const food of detectedFoods) {
        const foodItem: FoodItem = {
          name: food.name,
          source: 'local',
          calories_per_100g: Math.round((totalNutrition.calories / detectedFoods.reduce((sum, f) => sum + f.estimatedGrams, 0)) * 100),
          protein_per_100g: Math.round((totalNutrition.protein / detectedFoods.reduce((sum, f) => sum + f.estimatedGrams, 0)) * 100),
          carbs_per_100g: Math.round((totalNutrition.carbs / detectedFoods.reduce((sum, f) => sum + f.estimatedGrams, 0)) * 100),
          fat_per_100g: Math.round((totalNutrition.fat / detectedFoods.reduce((sum, f) => sum + f.estimatedGrams, 0)) * 100),
        };

        await saveMealLog(foodItem, food.estimatedGrams, mealType);
      }

      // Regresar a nutrición
      navigate('/nutrition');
    } catch (err) {
      console.error('Save error:', err);
      setErrorMsg(t('foodSearch.saveError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl font-bold text-gray-900">📸 {t('foodPhotoAnalyzer.title')}</h2>
        <div className="w-10 h-10"></div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-md mx-auto space-y-6">
        {!selectedImage ? (
          // Image Selection
          <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-16 h-16 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('foodPhotoAnalyzer.analyzeYourFood')}</h3>
            <p className="text-gray-600 mb-2">
              {t('foodPhotoAnalyzer.aiWillDetect')}
            </p>
            <p className="text-sm text-gray-500 mb-8">
              {t('foodPhotoAnalyzer.example')}
            </p>
            <button
              onClick={() => {
                if (isNative) {
                  handleNativeCamera();
                } else {
                  fileInputRef.current?.click();
                }
              }}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
            >
              📷 {t('foodPhotoAnalyzer.takePhoto')}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>
        ) : (
          // Image Preview & Analysis
          <div className="space-y-6">
            {/* Image Preview */}
            <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl">
              <img
                src={selectedImage}
                alt="Food to analyze"
                className="w-full h-64 object-cover"
              />
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setDetectedFoods([]);
                  setTotalNutrition({ calories: 0, protein: 0, carbs: 0, fat: 0 });
                  setSuggestions([]);
                  setErrorMsg('');
                }}
                className="absolute top-4 right-4 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">
                <p className="font-semibold mb-1">⚠️ {t('common.error')}</p>
                <p className="text-sm">{errorMsg}</p>
              </div>
            )}

            {/* Analyzing State */}
            {analyzing && (
              <div className="bg-white rounded-3xl p-8 text-center shadow-xl">
                <div className="animate-spin w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-xl font-bold text-gray-900 mb-2">{t('foodPhotoAnalyzer.analyzing')}</p>
                <p className="text-gray-600">{t('foodPhotoAnalyzer.detectingFoods')}</p>
              </div>
            )}

            {/* Analyze Button */}
            {!analyzing && detectedFoods.length === 0 && (
              <button
                onClick={analyzeImage}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
              >
                ⚡ {t('foodPhotoAnalyzer.analyze')}
              </button>
            )}

            {/* Analysis Results */}
            {!analyzing && detectedFoods.length > 0 && (
              <div className="space-y-6">
                {/* Total Nutrition Card */}
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 text-white shadow-xl">
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    {t('foodPhotoAnalyzer.totalEstimated')}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                      <p className="text-sm opacity-90 mb-1">{t('nutrition.calories')}</p>
                      <p className="text-3xl font-bold">{totalNutrition.calories}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                      <p className="text-sm opacity-90 mb-1">{t('nutrition.protein')}</p>
                      <p className="text-3xl font-bold">{totalNutrition.protein}g</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                      <p className="text-sm opacity-90 mb-1">{t('nutrition.carbs')}</p>
                      <p className="text-3xl font-bold">{totalNutrition.carbs}g</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                      <p className="text-sm opacity-90 mb-1">{t('nutrition.fat')}</p>
                      <p className="text-3xl font-bold">{totalNutrition.fat}g</p>
                    </div>
                  </div>
                </div>

                {/* Detected Foods List */}
                <div className="bg-white rounded-3xl p-6 shadow-xl">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">🍽️ {t('foodPhotoAnalyzer.detectedFoods')} ({detectedFoods.length})</h3>
                  <div className="space-y-3">
                    {detectedFoods.map((food, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{food.name}</p>
                          <p className="text-sm text-gray-600">{food.estimatedGrams}g {t('foodPhotoAnalyzer.estimatedGrams')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-purple-600">{Math.round(food.confidence)}%</p>
                          <p className="text-xs text-gray-500">{t('foodPhotoAnalyzer.confidence')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6">
                    <h3 className="text-lg font-bold text-blue-900 mb-3">💡 {t('foodPhotoAnalyzer.suggestions')}</h3>
                    <ul className="space-y-2">
                      {suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2 text-blue-800">
                          <span className="text-blue-500 font-bold">•</span>
                          <span className="text-sm">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Meal Type Selector */}
                <div className="bg-white rounded-3xl p-6 shadow-xl">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">🍽️ Selecciona el tipo de comida</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setMealType('breakfast')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        mealType === 'breakfast'
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-orange-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">🌅</div>
                      <div className="font-semibold">Desayuno</div>
                    </button>
                    <button
                      onClick={() => setMealType('lunch')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        mealType === 'lunch'
                          ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-yellow-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">☀️</div>
                      <div className="font-semibold">Almuerzo</div>
                    </button>
                    <button
                      onClick={() => setMealType('snack')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        mealType === 'snack'
                          ? 'border-pink-500 bg-pink-50 text-pink-700'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-pink-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">🍎</div>
                      <div className="font-semibold">Merienda</div>
                    </button>
                    <button
                      onClick={() => setMealType('dinner')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        mealType === 'dinner'
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-purple-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">🌙</div>
                      <div className="font-semibold">Cena</div>
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? `💾 ${t('foodPhotoAnalyzer.saving')}` : `💾 ${t('foodPhotoAnalyzer.saveAll')}`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodPhotoAnalyzerPage;

