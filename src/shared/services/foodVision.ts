/**
 * Food Vision Service
 * Servicio para analizar imágenes de comida usando el microservicio de IA
 */

const AI_MICROSERVICE_URL = import.meta.env.VITE_AI_MICROSERVICE_URL || 'http://localhost:3005';

export interface DetectedFood {
  name: string;
  confidence: number;
  estimatedGrams: number;
}

export interface FoodVisionResult {
  detectedFoods: DetectedFood[];
  totalEstimatedCalories: number;
  totalEstimatedProtein: number;
  totalEstimatedCarbs: number;
  totalEstimatedFat: number;
  suggestions: string[];
  rawAnalysis?: string;
}

/**
 * Analiza una imagen de comida usando IA
 * @param imageBase64 - Imagen en formato base64 (con o sin data URI)
 * @param mimeType - Tipo MIME de la imagen (default: image/jpeg)
 * @returns Resultado del análisis con comidas detectadas y nutrición estimada
 */
export async function analyzeFoodImage(
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<FoodVisionResult> {
  try {
    const response = await fetch(`${AI_MICROSERVICE_URL}/api/food-vision/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64,
        mimeType,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al analizar la imagen');
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Error al analizar la imagen');
    }

    return data.data;
  } catch (error) {
    console.error('Error analyzing food image:', error);
    throw error;
  }
}

/**
 * Analiza una imagen de comida subiendo un archivo
 * @param file - Archivo de imagen
 * @returns Resultado del análisis
 */
export async function analyzeFoodImageFile(file: File): Promise<FoodVisionResult> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${AI_MICROSERVICE_URL}/api/food-vision/analyze-upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al analizar la imagen');
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Error al analizar la imagen');
    }

    return data.data;
  } catch (error) {
    console.error('Error analyzing food image file:', error);
    throw error;
  }
}

/**
 * Convierte un File a base64
 * @param file - Archivo de imagen
 * @returns Promise con el string base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
