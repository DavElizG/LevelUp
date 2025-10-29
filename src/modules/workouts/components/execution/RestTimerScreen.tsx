import React, { useState, useEffect } from 'react';
import type { Exercise } from '../../../../shared/types/workout.types';

interface Props {
  restSeconds: number;
  currentExercise: Exercise;
  currentSet: number;
  totalSets: number;
  onRestComplete: () => void;
  onSkipRest: () => void;
  onBack: () => void;
}

export const RestTimerScreen: React.FC<Props> = ({
  restSeconds,
  currentExercise,
  currentSet,
  totalSets,
  onRestComplete,
  onSkipRest,
  onBack
}) => {
  const [timeLeft, setTimeLeft] = useState(restSeconds);

  useEffect(() => {
    setTimeLeft(restSeconds);
  }, [restSeconds]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onRestComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onRestComplete]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((restSeconds - timeLeft) / restSeconds) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 text-white">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
        
        <div className="text-center">
          <h2 className="text-lg font-semibold">{currentExercise.name}</h2>
          <p className="text-blue-100">Serie {currentSet} de {totalSets}</p>
        </div>
        
        <button
          onClick={onSkipRest}
          className="px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-all"
        >
          Saltar
        </button>
      </div>

      {/* Progress Bar */}
      <div className="px-6 mb-8">
        <div className="w-full bg-white/20 rounded-full h-2 backdrop-blur-sm">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main Timer */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-center mb-8">
          <div className="text-white/80 text-xl font-medium mb-4">
            Tiempo de descanso
          </div>
          
          {/* Big Timer */}
          <div className="relative">
            <div className="text-8xl md:text-9xl font-bold text-white mb-4 font-mono">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
            
            {/* Pulse animation */}
            <div className="absolute inset-0 -z-10">
              <div className="w-full h-full bg-white/10 rounded-3xl animate-pulse"></div>
            </div>
          </div>

          <div className="text-white/70 text-lg">
            {timeLeft > 30 ? 'Relájate y respira profundo' : 
             timeLeft > 10 ? 'Prepárate para la siguiente serie' : 
             '¡Casi listo!'}
          </div>
        </div>

        {/* Exercise Thumbnail */}
        {currentExercise.thumbnailUrl && (
          <div className="w-32 h-32 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20">
            <img 
              src={currentExercise.thumbnailUrl} 
              alt={currentExercise.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onBack}
            className="px-6 py-4 bg-white/20 text-white rounded-xl font-semibold backdrop-blur-sm hover:bg-white/30 transition-all"
          >
            Pausar Entrenamiento
          </button>
          
          <button
            onClick={onSkipRest}
            className="px-6 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all"
          >
            Continuar Ahora
          </button>
        </div>
      </div>
    </div>
  );
};