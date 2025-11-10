import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSetup, type FitnessGoal } from '../../hooks/useSetup';

// Import new setup components
import GenderSelection from './GenderSelection';
import AgeSelection from './AgeSelection';
import WeightSelection from './WeightSelection';
import HeightSelection from './HeightSelection';
import GoalSelection from './GoalSelection';
import FinalStep from './FinalStep';

const Setup: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    setupData,
    currentStep,
    updateSetupData,
    nextStep,
    saveProfile,
    isSetupComplete,
    loading,
    error
  } = useSetup();

  const handleCompleteSetup = async (generateRoutine: boolean = true) => {
    if (!isSetupComplete()) {
      alert(t('setup.pleaseCompleteAllSteps'));
      return;
    }

    if (!user) {
      alert(t('setup.userNotAuthenticated'));
      return;
    }

    try {
      const success = await saveProfile(user.id);
      if (success) {
        console.log('Setup completed:', setupData);
        // TODO: If generateRoutine is true, generate AI routine here
        if (generateRoutine) {
          console.log('Generating AI routine...');
        }
        navigate('/dashboard');
      } else {
        alert(t('setup.errorSavingProfile'));
      }
    } catch (err) {
      console.error('Error completing setup:', err);
      alert(t('setup.errorSavingProfile'));
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <GenderSelection
            selectedGender={setupData.gender}
            onGenderSelect={(gender: 'male' | 'female') => updateSetupData({ gender })}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <AgeSelection
            selectedAge={setupData.age}
            onAgeSelect={(age: number) => updateSetupData({ age })}
            onNext={nextStep}
          />
        );
      case 3:
        return (
          <WeightSelection
            selectedWeight={setupData.weight}
            onWeightSelect={(weight: number) => updateSetupData({ weight })}
            onNext={nextStep}
          />
        );
      case 4:
        return (
          <HeightSelection
            selectedHeight={setupData.height}
            onHeightSelect={(height: number) => updateSetupData({ height })}
            onNext={nextStep}
          />
        );
      case 5:
        return (
          <GoalSelection
            selectedGoal={setupData.goal}
            onGoalSelect={(goal: FitnessGoal) => updateSetupData({ goal })}
            onNext={nextStep}
          />
        );
      case 6:
        return (
          <FinalStep
            onGenerateRoutine={() => handleCompleteSetup(true)}
            onSkipRoutine={() => handleCompleteSetup(false)}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Guardando perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {renderCurrentStep()}
    </div>
  );
};

export default Setup;