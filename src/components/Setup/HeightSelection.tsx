import React, { useRef, useEffect, useState } from 'react';
import SetupLayout from './SetupLayout';

interface HeightSelectionProps {
  selectedHeight?: number;
  onHeightSelect: (height: number) => void;
  onNext: () => void;
}

const HeightSelection: React.FC<HeightSelectionProps> = ({
  selectedHeight,
  onHeightSelect,
  onNext
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hasInitialScrolled, setHasInitialScrolled] = useState(false);

  // Generate heights from 140cm to 220cm (comprehensive range)
  const heights = Array.from({ length: 81 }, (_, i) => i + 140);

  // Only auto-scroll on initial load, not when user selects a height
  useEffect(() => {
    if (selectedHeight && scrollContainerRef.current && !hasInitialScrolled) {
      setTimeout(() => {
        const container = scrollContainerRef.current;
        if (container) {
          const selectedElement = container.querySelector(`[data-height="${selectedHeight}"]`) as HTMLElement;
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
  }, [selectedHeight, hasInitialScrolled]);

  const handleHeightSelect = (height: number) => {
    setHasInitialScrolled(true); // Prevent auto-scrolling after user interaction
    onHeightSelect(height);
  };

  return (
    <SetupLayout>
      <div className="flex-1 px-6 py-8 flex flex-col">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            ¿Cuál es tu estatura actualmente?
          </h1>
          <p className="text-gray-600 text-sm">
            Altura en cm. No te preocupes, puedes cambiarlo más tarde.
          </p>
        </div>

        {/* Scrollable Height Picker */}
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
              {heights.map((height) => (
                <button
                  key={height}
                  data-height={height}
                  onClick={() => handleHeightSelect(height)}
                  className={`min-w-[100px] h-16 flex items-center justify-center text-3xl font-bold transition-all duration-200 ${
                    selectedHeight === height
                      ? 'text-orange-500'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  style={{ scrollSnapAlign: 'center' }}
                >
                  {height}
                  {selectedHeight === height && (
                    <span className="ml-2 text-orange-500 text-2xl font-medium">cm</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="mt-8 px-4">
          <button
            onClick={onNext}
            disabled={!selectedHeight}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-3xl transition-colors duration-200"
          >
            Continuar
          </button>
        </div>
      </div>
    </SetupLayout>
  );
};


export default HeightSelection;