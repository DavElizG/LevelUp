import React from 'react';
import SetupLayout from './SetupLayout';
import logoImage from '../../assets/image.png';

interface FinalStepProps {
  onGenerateRoutine: () => void;
  onSkipRoutine: () => void;
}

const FinalStep: React.FC<FinalStepProps> = ({
  onGenerateRoutine,
  onSkipRoutine
}) => {
  return (
    <SetupLayout>
      <div className="flex-1 px-6 py-8 flex flex-col">
        {/* Logo */}
        <div className="flex justify-center mb-16">
          <div className="flex flex-col items-center">
            <img 
              src={logoImage} 
              alt="LevelUp" 
              className="w-24 h-24 object-contain"
            />
          </div>
        </div>

        {/* Title */}
        <div className="flex-1 flex flex-col justify-center text-center px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-16 leading-relaxed">
            ¿Quieres que generemos una rutina que se adapte a ti y te ayude a cumplir tus metas?
          </h1>

          {/* Generate Routine Button */}
          <div className="mb-12">
            <button
              onClick={onGenerateRoutine}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-12 rounded-2xl transition-colors duration-200 text-lg"
            >
              Sí
            </button>
          </div>

          {/* Skip Option */}
          <button
            onClick={onSkipRoutine}
            className="text-gray-600 hover:text-gray-800 text-base underline transition-colors duration-200"
          >
            Ya tengo una rutina que me gustaría seguir
          </button>
        </div>
      </div>
    </SetupLayout>
  );
};

export default FinalStep;