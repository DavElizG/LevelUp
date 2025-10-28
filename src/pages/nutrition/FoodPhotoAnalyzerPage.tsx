/**
 * FoodPhotoAnalyzerPage
 * Análisis de comida con IA local usando TensorFlow.js + MobileNet
 * Búsqueda híbrida: base de datos local + OpenFoodFacts
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, CameraResultType } from '@capacitor/camera';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import {
  loadModel,
  analyzeFoodImage,
  createImageElement,
  getTensorFlowInfo,
} from '../../shared/utils/aiFoodAnalyzer';
import { saveMealLog, type FoodItem } from '../../shared/services/foodSearch';

const FoodPhotoAnalyzerPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mealType = (location.state as { mealType?: string })?.mealType || 'lunch';

  // Estados
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loadingModel, setLoadingModel] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<{
    detectedFood: string;
    confidence: number;
    nutritionData: FoodItem | null;
  } | null>(null);
  const [quantity, setQuantity] = useState(200); // Default 200g
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isNative = !!(window as { Capacitor?: unknown }).Capacitor;

  /**
   * Pre-cargar el modelo al montar el componente
   */
  useEffect(() => {
    const initModel = async () => {
      setLoadingModel(true);
      try {
        await loadModel();
        console.log('TensorFlow info:', getTensorFlowInfo());
      } catch (err) {
        console.error('Error loading model:', err);
        setErrorMsg('No se pudo cargar el modelo de IA. La app funcionará con estimaciones.');
      } finally {
        setLoadingModel(false);
      }
    };

    initModel();
  }, []);

  /**
   * Maneja la selección de imagen desde input file
   */
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setAnalysisResult(null);
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
      setAnalysisResult(null);
      setErrorMsg('');
    } catch (err) {
      console.error('Camera error:', err);
      setErrorMsg('No se pudo abrir la cámara nativa.');
    }
  };

  /**
   * Analiza la imagen con TensorFlow.js
   */
  const analyzeImage = async () => {
    if (!selectedImage) return;

    setAnalyzing(true);
    setErrorMsg('');

    try {
      // Crear elemento de imagen para TensorFlow
      const img = await createImageElement(selectedImage);

      // Analizar con MobileNet
      const result = await analyzeFoodImage(img);

      console.log('Analysis result:', result);

      setAnalysisResult({
        detectedFood: result.detectedFood,
        confidence: result.confidence,
        nutritionData: result.nutritionData,
      });

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
              estimated_calories: result.nutritionData?.calories_per_100g || 0,
              estimated_protein: result.nutritionData?.protein_per_100g || 0,
              estimated_carbs: result.nutritionData?.carbs_per_100g || 0,
              estimated_fat: result.nutritionData?.fat_per_100g || 0,
              food_items: JSON.stringify({
                detected: result.detectedFood,
                confidence: result.confidence,
                predictions: result.predictions,
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
      setErrorMsg(err instanceof Error ? err.message : 'Error al analizar la imagen. Intenta de nuevo.');
    } finally {
      setAnalyzing(false);
    }
  };

  /**
   * Guarda el alimento detectado en meal_logs
   */
  const handleSave = async () => {
    if (!analysisResult || !analysisResult.nutritionData) return;

    if (quantity <= 0) {
      setErrorMsg('La cantidad debe ser mayor a 0');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      const result = await saveMealLog(analysisResult.nutritionData, quantity, mealType);

      if (result.success) {
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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold">Analizar Foto con IA</h2>
        <div className="w-10 h-10"></div>
      </div>

      {/* Loading Model State */}
      {loadingModel && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Cargando modelo de IA...</p>
            <p className="text-sm text-gray-500 mt-2">Esto puede tardar unos segundos</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!loadingModel && (
        <div className="flex-1 p-4 overflow-y-auto">
          {!selectedImage ? (
            // Image Selection
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-gray-600 text-center mb-2 font-medium">
                Toma una foto de tu comida
              </p>
              <p className="text-sm text-gray-500 text-center mb-6 max-w-sm">
                La IA analizará automáticamente los nutrientes y buscará información detallada
              </p>
              <button
                onClick={() => {
                  if (isNative) {
                    handleNativeCamera();
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
                className="bg-orange-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-orange-600"
              >
                {isNative ? '📷 Abrir Cámara' : '📷 Tomar o Seleccionar Foto'}
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
            <div className="space-y-4">
              {/* Image Preview */}
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Food to analyze"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setAnalysisResult(null);
                    setErrorMsg('');
                  }}
                  className="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {errorMsg}
                </div>
              )}

              {/* Analyzing State */}
              {analyzing && (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600 font-semibold mb-2">Analizando con IA...</p>
                  <p className="text-gray-500 text-sm">Reconociendo alimento y buscando nutrientes</p>
                </div>
              )}

              {/* Analysis Result */}
              {!analyzing && analysisResult && analysisResult.nutritionData && (
                <div className="space-y-4">
                  {/* Detection Info */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      <span className="font-semibold text-green-800">Alimento Detectado</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900 mb-1">
                      {analysisResult.detectedFood}
                    </p>
                    <p className="text-sm text-green-700">
                      Confianza: {(analysisResult.confidence * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-green-600 mt-2">
                      Fuente: {analysisResult.nutritionData.source === 'local' ? 'Base de datos local' : 'OpenFoodFacts'}
                    </p>
                  </div>

                  {/* Quantity Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cantidad Estimada (gramos)
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
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">Información Nutricional</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Calorías</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {calculateNutrition(analysisResult.nutritionData, quantity).calories}
                          <span className="text-sm text-gray-500 ml-1">kcal</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Proteína</p>
                        <p className="text-xl font-semibold text-gray-900">
                          {calculateNutrition(analysisResult.nutritionData, quantity).protein}g
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Carbohidratos</p>
                        <p className="text-xl font-semibold text-gray-900">
                          {calculateNutrition(analysisResult.nutritionData, quantity).carbs}g
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Grasa</p>
                        <p className="text-xl font-semibold text-gray-900">
                          {calculateNutrition(analysisResult.nutritionData, quantity).fat}g
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
                      `Agregar a ${
                        mealType === 'breakfast'
                          ? 'Desayuno'
                          : mealType === 'lunch'
                            ? 'Almuerzo'
                            : mealType === 'snack'
                              ? 'Merienda'
                              : 'Cena'
                      }`
                    )}
                  </button>
                </div>
              )}

              {/* Analyze Button */}
              {!analyzing && !analysisResult && (
                <button
                  onClick={analyzeImage}
                  className="w-full bg-orange-500 text-white py-4 rounded-lg font-semibold hover:bg-orange-600"
                >
                  🤖 Analizar con IA
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FoodPhotoAnalyzerPage;

