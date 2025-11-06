import React from 'react';
import { useTranslation } from 'react-i18next';
import SetupLayout from './SetupLayout';
import type { FitnessGoal } from '../../hooks/useSetup';

interface GoalSelectionProps {
  selectedGoal?: FitnessGoal;
  onGoalSelect: (goal: FitnessGoal) => void;
  onNext: () => void;
}

const GoalSelection: React.FC<GoalSelectionProps> = ({
  selectedGoal,
  onGoalSelect,
  onNext
}) => {
  const { t } = useTranslation();
  
  const goals = [
    { 
      id: 'lose_weight' as FitnessGoal, 
      label: t('setup.loseWeight'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    { 
      id: 'maintain' as FitnessGoal, 
      label: t('setup.stayFit'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      id: 'gain_weight' as FitnessGoal, 
      label: t('setup.loseWeight'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
        </svg>
      )
    },
    { 
      id: 'improve_endurance' as FitnessGoal, 
      label: t('workouts.intensity'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    { 
      id: 'gain_muscle' as FitnessGoal, 
      label: t('setup.gainMuscle'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      )
    }
  ];

  return (
    <SetupLayout>
      <div className="flex-1 px-6 py-8 flex flex-col">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('setup.selectGoal')}
          </h1>
        </div>

        {/* Goal Options */}
        <div className="flex-1">
          <div className="space-y-4">
            {goals.map((goal, index) => (
              <button
                key={`${goal.id}-${index}`}
                onClick={() => onGoalSelect(goal.id)}
                className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between ${
                  selectedGoal === goal.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedGoal === goal.id ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {goal.icon}
                  </div>
                  <span className={`text-lg font-medium ${
                    selectedGoal === goal.id ? 'text-orange-600' : 'text-gray-700'
                  }`}>
                    {goal.label}
                  </span>
                </div>
                
                {/* Radio button */}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedGoal === goal.id 
                    ? 'border-orange-500 bg-orange-500' 
                    : 'border-gray-300'
                }`}>
                  {selectedGoal === goal.id && (
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <div className="mt-8">
          <button
            onClick={onNext}
            disabled={!selectedGoal}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-2xl transition-colors duration-200"
          >
            {t('common.continue')}
          </button>
        </div>
      </div>
    </SetupLayout>
  );
};

export default GoalSelection;