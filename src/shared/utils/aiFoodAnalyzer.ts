/**
 * AI Food Analyzer
 * Análisis de alimentos usando TensorFlow.js + MobileNet
 * para reconocimiento de imágenes local (sin backend)
 */

import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { searchFood, generateGenericNutrition, type FoodItem } from '../services/foodSearch';

let model: mobilenet.MobileNet | null = null;
let isLoading = false;

/**
 * Carga el modelo MobileNet (solo la primera vez)
 */
export async function loadModel(): Promise<void> {
  if (model || isLoading) return;

  isLoading = true;
  try {
    console.log('Loading MobileNet model...');
    
    // Configurar backend de TensorFlow (usar WebGL para mejor performance)
    await tf.ready();
    await tf.setBackend('webgl');
    
    // Cargar MobileNet
    model = await mobilenet.load({
      version: 2,
      alpha: 1, // Precisión máxima
    });
    
    console.log('MobileNet model loaded successfully');
  } catch (err) {
    console.error('Error loading MobileNet:', err);
    throw new Error('No se pudo cargar el modelo de IA');
  } finally {
    isLoading = false;
  }
}

/**
 * Analiza una imagen y retorna los alimentos detectados
 * con sus datos nutricionales
 */
export async function analyzeFoodImage(
  imageElement: HTMLImageElement
): Promise<{
  detectedFood: string;
  confidence: number;
  nutritionData: FoodItem | null;
  predictions: Array<{ className: string; probability: number }>;
}> {
  // Asegurar que el modelo está cargado
  if (!model) {
    await loadModel();
  }

  if (!model) {
    throw new Error('Modelo no disponible');
  }

  try {
    console.log('Analyzing image...');

    // Clasificar la imagen
    const predictions = await model.classify(imageElement, 5); // Top 5 predicciones
    
    console.log('Predictions:', predictions);

    if (!predictions || predictions.length === 0) {
      throw new Error('No se pudo analizar la imagen');
    }

    // Obtener la mejor predicción
    const topPrediction = predictions[0];
    const detectedFood = cleanFoodName(topPrediction.className);
    const confidence = topPrediction.probability;

    console.log(`Detected: ${detectedFood} (${(confidence * 100).toFixed(1)}%)`);

    // Buscar información nutricional del alimento detectado
    let nutritionData: FoodItem | null = null;

    try {
      // Buscar en base de datos local y OpenFoodFacts
      const searchResults = await searchFood(detectedFood);
      
      if (searchResults.length > 0) {
        // Usar el primer resultado
        nutritionData = searchResults[0];
        console.log('Nutrition data found:', nutritionData);
      } else {
        // Si no se encuentra, generar estimación genérica
        console.log('No nutrition data found, generating generic...');
        nutritionData = generateGenericNutrition(detectedFood);
      }
    } catch (err) {
      console.error('Error searching nutrition data:', err);
      // Generar estimación genérica en caso de error
      nutritionData = generateGenericNutrition(detectedFood);
    }

    return {
      detectedFood,
      confidence,
      nutritionData,
      predictions: predictions.map((p) => ({
        className: cleanFoodName(p.className),
        probability: p.probability,
      })),
    };
  } catch (err) {
    console.error('Error analyzing image:', err);
    throw err;
  }
}

/**
 * Limpia el nombre del alimento detectado por MobileNet
 * (elimina palabras innecesarias y ajusta formato)
 */
function cleanFoodName(rawName: string): string {
  // MobileNet puede retornar nombres como "banana, Musa acuminata"
  // Queremos solo "banana"
  
  let cleaned = rawName
    .split(',')[0] // Tomar solo la primera parte antes de la coma
    .trim()
    .toLowerCase();

  // Eliminar palabras técnicas comunes
  const removeWords = ['food', 'dish', 'plate', 'bowl'];
  for (const word of removeWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    cleaned = cleaned.replaceAll(regex, '').trim();
  }

  // Capitalizar primera letra
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

  return cleaned;
}

/**
 * Convierte un blob o data URL a HTMLImageElement
 * para poder ser procesado por TensorFlow
 */
export function createImageElement(imageSource: string | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Para evitar problemas CORS

    img.onload = () => {
      console.log(`Image loaded: ${img.width}x${img.height}`);
      resolve(img);
    };

    img.onerror = (err) => {
      console.error('Error loading image:', err);
      reject(new Error('No se pudo cargar la imagen'));
    };

    if (typeof imageSource === 'string') {
      // Data URL o URL normal
      img.src = imageSource;
    } else {
      // Blob
      const url = URL.createObjectURL(imageSource);
      img.src = url;
      
      // Liberar objeto URL después de cargar
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
    }
  });
}

/**
 * Verifica si TensorFlow.js está disponible y configurado
 */
export function isTensorFlowAvailable(): boolean {
  try {
    return tf !== undefined;
  } catch {
    return false;
  }
}

/**
 * Obtiene información del backend de TensorFlow actual
 */
export function getTensorFlowInfo(): {
  available: boolean;
  backend?: string;
  modelLoaded: boolean;
} {
  return {
    available: isTensorFlowAvailable(),
    backend: isTensorFlowAvailable() ? tf.getBackend() : undefined,
    modelLoaded: model !== null,
  };
}

/**
 * Libera recursos del modelo (opcional, para limpiar memoria)
 */
export function disposeModel(): void {
  if (model) {
    // MobileNet no expone un método dispose() directamente
    // La memoria se libera automáticamente por TensorFlow.js
    model = null;
    console.log('Model reference cleared');
  }
}
