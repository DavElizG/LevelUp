import React, { useState, useRef } from 'react';
// @ts-ignore
import { Camera, CameraResultType } from '@capacitor/camera';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface AnalysisJob {
  id: string;
  image_url: string;
  status: string;
}

interface FoodPhotoAnalyzerProps {
  onAnalysisComplete: (result: AnalysisJob) => void;
  onClose: () => void;
}

const FoodPhotoAnalyzer: React.FC<FoodPhotoAnalyzerProps> = ({ onAnalysisComplete, onClose }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Detectar si estamos en Capacitor
  const isNative = !!(window as any).Capacitor;

  const handleNativeCamera = async () => {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
      });
  setSelectedImage(photo.dataUrl || null);
    } catch (err) {
      alert('No se pudo abrir la cámara nativa.');
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setAnalyzing(true);
    try {
      // Upload the image to Supabase Storage and create a pending analysis job in the DB.
      if (!isSupabaseConfigured || !supabase) {
        throw new Error('Supabase no está configurado');
      }

      // Convert dataURL to blob
      const res = await fetch(selectedImage);
      const blob = await res.blob();

      // Get user id if possible
      let userId: string | null = null;
      try {
        // @ts-ignore
        const userRes = await supabase.auth.getUser();
        userId = userRes?.data?.user?.id || null;
      } catch (e) {
        console.warn('Could not get user', e);
      }

      const fileName = `${userId || 'anon'}/${Date.now()}.jpg`;
      const bucket = 'food-photos';

      const uploadRes = await supabase.storage.from(bucket).upload(fileName, blob, {
        contentType: blob.type || 'image/jpeg',
        upsert: false,
      });

      if (uploadRes.error) throw uploadRes.error;

      // Build public URL
      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(fileName);
      const imageUrl = publicData.publicUrl;

      // Insert a job row into photo_food_analyses to be processed by your AI worker later
      const job = {
        user_id: userId,
        image_path: fileName,
        image_url: imageUrl,
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      const insertRes = await supabase.from('photo_food_analyses').insert(job).select();
      if (insertRes.error) throw insertRes.error;

      const inserted = insertRes.data?.[0];
      const result: AnalysisJob = {
        id: inserted?.id || String(Date.now()),
        image_url: imageUrl,
        status: inserted?.status || 'pending',
      };

  // clear any previous local result
      onAnalysisComplete(result);
    } catch (error) {
      console.error('Error analyzing / uploading image:', error);
  // clear any previous local result
      setErrorMsg('No se pudo subir la imagen. Intenta de nuevo.');
    } finally {
      setAnalyzing(false);
    }
  };

  // no local add handler — parent will handle job results when analysis completes async

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
      <div className="bg-white rounded-t-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Analizar Foto</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 p-4">
          {!selectedImage ? (
            // Image Selection
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-gray-600 text-center mb-6">
                Toma una foto de tu comida y la IA analizará los nutrientes automáticamente
              </p>
              <button
                onClick={() => {
                  if (isNative) {
                    handleNativeCamera();
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
                className="bg-pink-500 text-white px-6 py-3 rounded-lg font-medium"
              >
                {isNative ? 'Usar cámara del dispositivo' : 'Tomar o seleccionar foto'}
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
            // Image Analysis
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Food to analyze"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  onClick={() => {
                    setSelectedImage(null);
                // clear any previous local result
                  }}
                  className="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {!analyzing && (
                  <button
                    onClick={analyzeImage}
                    className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium"
                  >
                    Enviar para análisis (IA)
                  </button>
                )}

                {analyzing && (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600 font-semibold mb-2">Analizando foto...</p>
                    <p className="text-gray-500">Esto puede tardar unos segundos. Por favor espera.</p>
                  </div>
                )}

                {errorMsg && (
                  <div className="text-red-500 text-center">{errorMsg}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodPhotoAnalyzer;