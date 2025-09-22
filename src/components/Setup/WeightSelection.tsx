import React, { useState } from 'react';
import SetupLayout from './SetupLayout';

interface WeightSelectionProps {
  selectedWeight?: number;
  onWeightSelect: (weight: number) => void;
  onNext: () => void;
}

const WeightSelection: React.FC<WeightSelectionProps> = ({
  selectedWeight,
  onWeightSelect,
  onNext
}) => {
  const [currentWeight, setCurrentWeight] = useState(selectedWeight || 70);
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');

  const handleWeightChange = (weight: number) => {
    setCurrentWeight(weight);
    onWeightSelect(weight);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const weight = parseInt(e.target.value);
    handleWeightChange(weight);
  };

  // Generate slider markers - aligned with slider range
  const minWeight = 25;
  const maxWeight = 250;
  const markers = [];
  
  // Create markers that align perfectly with slider positions
  for (let i = 0; i <= 8; i++) {
    const weight = minWeight + (i * (maxWeight - minWeight) / 8);
    markers.push(Math.round(weight));
  }

  return (
    <SetupLayout>
      <div className="flex-1 px-6 py-8 flex flex-col">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            ¿Cuál es tu peso actualmente?
          </h1>
          <p className="text-gray-600 text-sm">
            No te preocupes, puedes cambiarlo más tarde.
          </p>
        </div>

        {/* Unit Toggle */}
        <div className="flex justify-center mb-16">
          <div className="flex bg-gray-200 rounded-2xl p-1">
            <button
              onClick={() => setUnit('kg')}
              className={`px-8 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                unit === 'kg'
                  ? 'bg-gray-400 text-white'
                  : 'text-gray-700'
              }`}
            >
              Kg
            </button>
            <button
              onClick={() => setUnit('lbs')}
              className={`px-8 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                unit === 'lbs'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-700'
              }`}
            >
              Lbs
            </button>
          </div>
        </div>

        {/* Weight Display */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-center mb-16">
            <div className="text-6xl font-bold text-orange-500">
              {currentWeight} Kg
            </div>
          </div>

          {/* Custom Slider */}
          <div className="px-8 mb-16">
            <div className="relative h-20">
              {/* Slider track background */}
              <div className="absolute top-8 left-0 right-0 h-2 bg-gray-200 rounded-full"></div>
              
              {/* Slider markers */}
              <div className="absolute top-0 left-0 right-0 flex justify-between">
                {markers.map((mark) => {
                  // Calculate if this marker should be highlighted based on current weight
                  const isNearCurrent = Math.abs(currentWeight - mark) <= 10;
                  const distance = Math.abs(currentWeight - mark);
                  
                  return (
                    <div key={mark} className="flex flex-col items-center">
                      {/* Marker line */}
                      <div 
                        className={`w-0.5 rounded-full transition-all duration-200 ${
                          isNearCurrent && distance <= 5
                            ? 'h-8 bg-orange-500'
                            : isNearCurrent
                              ? 'h-6 bg-orange-400'
                              : 'h-4 bg-orange-300'
                        }`}
                      ></div>
                      {/* Marker number */}
                      <span className="text-xs text-gray-600 mt-2 font-medium">
                        {mark}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Hidden slider input */}
              <input
                type="range"
                min={minWeight}
                max={maxWeight}
                step="1"
                value={currentWeight}
                onChange={handleSliderChange}
                className="absolute top-6 left-0 right-0 w-full h-6 opacity-0 cursor-pointer"
              />

              {/* Active position indicator - properly aligned */}
              <div 
                className="absolute top-7 w-4 h-4 bg-orange-500 rounded-full shadow-lg transform -translate-x-1/2 transition-all duration-200"
                style={{ 
                  left: `${((currentWeight - minWeight) / (maxWeight - minWeight)) * 100}%`
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="mt-8 px-4">
          <button
            onClick={onNext}
            disabled={!currentWeight}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-3xl transition-colors duration-200"
          >
            Continuar
          </button>
        </div>
      </div>
    </SetupLayout>
  );
};

export default WeightSelection;