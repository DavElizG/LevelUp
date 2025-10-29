import React from 'react';

/**
 * Professional skeleton component for AI diet generation
 * Shows a contextual loading state with animated pulses
 */
const DietGenerationSkeleton: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header with gradient animation */}
        <div className="relative h-24 bg-gradient-to-r from-green-400 to-green-600 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-4 border-white/30 border-t-white animate-spin"></div>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="p-6">
          {/* Title */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Generando tu plan de dieta con IA</h3>
            <p className="text-sm text-gray-600">Esto puede tomar 10-20 segundos...</p>
          </div>

          {/* Processing steps */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 animate-pulse">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center flex-shrink-0">
                <div className="w-3 h-3 rounded-full bg-white animate-ping"></div>
              </div>
              <div className="ml-3 flex-1">
                <div className="h-4 bg-gray-200 rounded w-56 animate-pulse"></div>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex-shrink-0 animate-pulse"></div>
              <div className="ml-3 flex-1">
                <div className="h-4 bg-gray-100 rounded w-40 animate-pulse"></div>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex-shrink-0 animate-pulse"></div>
              <div className="ml-3 flex-1">
                <div className="h-4 bg-gray-100 rounded w-52 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 animate-progress"></div>
          </div>

          {/* Info text */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">Powered by Gemini AI</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default DietGenerationSkeleton;
