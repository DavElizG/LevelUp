import React from 'react';
import SetupLayout from './SetupLayout';

interface GenderSelectionProps {
  selectedGender?: 'male' | 'female';
  onGenderSelect: (gender: 'male' | 'female') => void;
  onNext: () => void;
}

const GenderSelection: React.FC<GenderSelectionProps> = ({
  selectedGender,
  onGenderSelect,
  onNext
}) => {
  return (
    <SetupLayout>
      <div className="flex-1 px-6 py-8 flex flex-col">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Cuéntanos sobre ti
          </h1>
          <p className="text-gray-600 text-base leading-relaxed px-4">
            Para ofrecerte mejores resultados y una experiencia personalizada, necesitamos conocer la composición biológica de tu cuerpo.
          </p>
        </div>

        {/* Gender Options */}
        <div className="flex-1 flex flex-col justify-center space-y-6 px-4">
          {/* Male Option */}
          <button
            onClick={() => onGenderSelect('male')}
            className={`w-full p-6 rounded-3xl border-2 transition-all duration-200 ${
              selectedGender === 'male'
                ? 'border-orange-500 bg-orange-50'
                : 'border-orange-500 bg-white'
            }`}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-2xl border-2 border-gray-300 bg-white flex items-center justify-center">
                {/* Male Icon - Mars symbol */}
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9l6-6m0 0h-6m6 0v6" />
                  <circle cx="10" cy="14" r="7" fill="none" stroke="currentColor" strokeWidth={2} />
                </svg>
              </div>
              <span className="text-lg font-medium text-orange-600">
                Masculino
              </span>
            </div>
          </button>

          {/* Female Option */}
          <button
            onClick={() => onGenderSelect('female')}
            className={`w-full p-6 rounded-3xl border-2 transition-all duration-200 ${
              selectedGender === 'female'
                ? 'border-orange-500 bg-orange-50'
                : 'border-orange-500 bg-white'
            }`}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-2xl border-2 border-gray-300 bg-white flex items-center justify-center">
                {/* Female Icon - Venus symbol */}
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth={2} />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v6m-3-3h6" />
                </svg>
              </div>
              <span className="text-lg font-medium text-orange-600">
                Femenino
              </span>
            </div>
          </button>
        </div>

        {/* Continue Button */}
        <div className="mt-8 px-4">
          <button
            onClick={onNext}
            disabled={!selectedGender}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-3xl transition-colors duration-200"
          >
            Continuar
          </button>
        </div>
      </div>
    </SetupLayout>
  );
};

export default GenderSelection;