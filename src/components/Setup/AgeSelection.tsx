import React, { useRef, useEffect, useState } from 'react';
import SetupLayout from './SetupLayout';

interface AgeSelectionProps {
  selectedAge?: number;
  onAgeSelect: (age: number) => void;
  onNext: () => void;
}

const AgeSelection: React.FC<AgeSelectionProps> = ({
  selectedAge,
  onAgeSelect,
  onNext
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hasInitialScrolled, setHasInitialScrolled] = useState(false);

  // Generate ages from 13 to 80
  const ages = Array.from({ length: 68 }, (_, i) => i + 13);

  // Only auto-scroll on initial load, not when user selects an age
  useEffect(() => {
    if (selectedAge && scrollContainerRef.current && !hasInitialScrolled) {
      setTimeout(() => {
        const container = scrollContainerRef.current;
        if (container) {
          const selectedElement = container.querySelector(`[data-age="${selectedAge}"]`) as HTMLElement;
          if (selectedElement) {
            const containerHeight = container.clientHeight;
            const elementTop = selectedElement.offsetTop;
            const elementHeight = selectedElement.clientHeight;
            const scrollTop = elementTop - (containerHeight / 2) + (elementHeight / 2);
            container.scrollTop = scrollTop;
            setHasInitialScrolled(true);
          }
        }
      }, 100);
    }
  }, [selectedAge, hasInitialScrolled]);

  const handleAgeSelect = (age: number) => {
    setHasInitialScrolled(true); // Prevent auto-scrolling after user interaction
    onAgeSelect(age);
  };

  return (
    <SetupLayout>
      <div className="flex-1 px-6 py-8 flex flex-col">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold text-gray-900">
            ¿Cuál es tu edad?
          </h1>
        </div>

        {/* Scrollable Age Picker */}
        <div className="flex-1 flex flex-col justify-center">
          <div 
            ref={scrollContainerRef}
            className="h-80 overflow-y-auto px-4 scrollbar-hide"
            style={{
              scrollSnapType: 'y mandatory',
              scrollBehavior: 'smooth',
              msOverflowStyle: 'none',
              scrollbarWidth: 'none'
            }}
          >
            <div className="flex flex-col items-center space-y-4 py-32">
              {ages.map((age) => (
                <button
                  key={age}
                  data-age={age}
                  onClick={() => handleAgeSelect(age)}
                  className={`min-w-[80px] h-16 rounded-2xl flex items-center justify-center text-3xl font-bold transition-all duration-200 ${
                    selectedAge === age
                      ? 'bg-orange-500 text-white shadow-lg px-6'
                      : 'text-gray-400 hover:text-gray-600 px-4'
                  }`}
                  style={{ scrollSnapAlign: 'center' }}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="mt-8 px-4">
          <button
            onClick={onNext}
            disabled={!selectedAge}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-3xl transition-colors duration-200"
          >
            Continuar
          </button>
        </div>
      </div>
    </SetupLayout>
  );
};

export default AgeSelection;