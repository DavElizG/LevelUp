import React, { useState } from 'react';
import { useSetup, type FitnessGoal } from '../../hooks/useSetup.ts';

interface SetupData {
  gender?: 'male' | 'female';
  age?: number;
  weight?: number;
  height?: number;
  goal?: FitnessGoal;
  workoutType?: string;
}

const Setup: React.FC = () => {
  const {
    setupData,
    currentStep,
    updateSetupData,
    nextStep,
    prevStep,
    isSetupComplete
  } = useSetup();

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <GenderSelection data={setupData} onUpdate={updateSetupData} onNext={nextStep} />;
      case 2:
        return <AgeSelection data={setupData} onUpdate={updateSetupData} onNext={nextStep} onBack={prevStep} />;
      case 3:
        return <WeightSelection data={setupData} onUpdate={updateSetupData} onNext={nextStep} onBack={prevStep} />;
      case 4:
        return <HeightSelection data={setupData} onUpdate={updateSetupData} onNext={nextStep} onBack={prevStep} />;
      case 5:
        return <GoalSelection data={setupData} onUpdate={updateSetupData} onNext={nextStep} onBack={prevStep} />;
      case 6:
        return <WorkoutTypeSelection data={setupData} onUpdate={updateSetupData} onBack={prevStep} onComplete={handleCompleteSetup} />;
      default:
        return null;
    }
  };

  const handleCompleteSetup = async () => {
    if (!isSetupComplete()) {
      alert('Por favor completa todos los pasos');
      return;
    }
    console.log('Setup completed:', setupData);
    alert('¡Setup completado! Datos guardados en consola.');
  };

  return (
    <div className="min-h-screen bg-white">
      {renderCurrentStep()}
    </div>
  );
};

// Basic Gender Selection
const GenderSelection: React.FC<{
  data: SetupData;
  onUpdate: (data: Partial<SetupData>) => void;
  onNext: () => void;
}> = ({ data, onUpdate, onNext }) => {
  const handleGenderSelect = (gender: 'male' | 'female') => {
    onUpdate({ gender });
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Selecciona tu género</h1>
      
      <div className="space-y-4 mb-8">
        <button
          onClick={() => handleGenderSelect('male')}
          className={`w-full p-4 border rounded ${
            data.gender === 'male' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
        >
          Masculino
        </button>
        
        <button
          onClick={() => handleGenderSelect('female')}
          className={`w-full p-4 border rounded ${
            data.gender === 'female' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
        >
          Femenino
        </button>
      </div>

      <button
        onClick={onNext}
        disabled={!data.gender}
        className="w-full p-4 bg-blue-500 text-white rounded disabled:bg-gray-300"
      >
        Continuar
      </button>
    </div>
  );
};

// Basic Age Selection
const AgeSelection: React.FC<{
  data: SetupData;
  onUpdate: (data: Partial<SetupData>) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ data, onUpdate, onNext, onBack }) => {
  const [age, setAge] = useState(data.age || 25);

  const handleAgeChange = (newAge: number) => {
    setAge(newAge);
    onUpdate({ age: newAge });
  };

  return (
    <div className="p-8">
      <button onClick={onBack} className="mb-4 text-blue-500">← Atrás</button>
      <h1 className="text-2xl font-bold mb-6">¿Cuántos años tienes?</h1>
      
      <div className="mb-8">
        <input
          type="number"
          value={age}
          onChange={(e) => handleAgeChange(Number(e.target.value))}
          className="w-full p-4 border rounded"
          min="13"
          max="100"
        />
      </div>

      <button
        onClick={onNext}
        disabled={!age || age < 13 || age > 100}
        className="w-full p-4 bg-blue-500 text-white rounded disabled:bg-gray-300"
      >
        Continuar
      </button>
    </div>
  );
};

// Basic Weight Selection
const WeightSelection: React.FC<{
  data: SetupData;
  onUpdate: (data: Partial<SetupData>) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ data, onUpdate, onNext, onBack }) => {
  const [weight, setWeight] = useState(data.weight || 70);

  const handleWeightChange = (newWeight: number) => {
    setWeight(newWeight);
    onUpdate({ weight: newWeight });
  };

  return (
    <div className="p-8">
      <button onClick={onBack} className="mb-4 text-blue-500">← Atrás</button>
      <h1 className="text-2xl font-bold mb-6">¿Cuánto pesas?</h1>
      
      <div className="mb-8">
        <input
          type="number"
          value={weight}
          onChange={(e) => handleWeightChange(Number(e.target.value))}
          className="w-full p-4 border rounded"
          min="30"
          max="300"
        />
        <span className="text-gray-500">kg</span>
      </div>

      <button
        onClick={onNext}
        disabled={!weight || weight < 30 || weight > 300}
        className="w-full p-4 bg-blue-500 text-white rounded disabled:bg-gray-300"
      >
        Continuar
      </button>
    </div>
  );
};

// Basic Height Selection
const HeightSelection: React.FC<{
  data: SetupData;
  onUpdate: (data: Partial<SetupData>) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ data, onUpdate, onNext, onBack }) => {
  const [height, setHeight] = useState(data.height || 170);

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    onUpdate({ height: newHeight });
  };

  return (
    <div className="p-8">
      <button onClick={onBack} className="mb-4 text-blue-500">← Atrás</button>
      <h1 className="text-2xl font-bold mb-6">¿Cuánto mides?</h1>
      
      <div className="mb-8">
        <input
          type="number"
          value={height}
          onChange={(e) => handleHeightChange(Number(e.target.value))}
          className="w-full p-4 border rounded"
          min="120"
          max="250"
        />
        <span className="text-gray-500">cm</span>
      </div>

      <button
        onClick={onNext}
        disabled={!height || height < 120 || height > 250}
        className="w-full p-4 bg-blue-500 text-white rounded disabled:bg-gray-300"
      >
        Continuar
      </button>
    </div>
  );
};

// Basic Goal Selection
const GoalSelection: React.FC<{
  data: SetupData;
  onUpdate: (data: Partial<SetupData>) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ data, onUpdate, onNext, onBack }) => {
  const goals = [
    { id: 'lose_weight' as FitnessGoal, label: 'Perder peso' },
    { id: 'maintain' as FitnessGoal, label: 'Mantener peso' },
    { id: 'gain_muscle' as FitnessGoal, label: 'Ganar músculo' },
    { id: 'improve_endurance' as FitnessGoal, label: 'Mejorar resistencia' }
  ];

  const handleGoalSelect = (goal: FitnessGoal) => {
    onUpdate({ goal });
  };

  return (
    <div className="p-8">
      <button onClick={onBack} className="mb-4 text-blue-500">← Atrás</button>
      <h1 className="text-2xl font-bold mb-6">¿Cuál es tu objetivo?</h1>
      
      <div className="space-y-4 mb-8">
        {goals.map((goal) => (
          <button
            key={goal.id}
            onClick={() => handleGoalSelect(goal.id)}
            className={`w-full p-4 border rounded ${
              data.goal === goal.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
          >
            {goal.label}
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!data.goal}
        className="w-full p-4 bg-blue-500 text-white rounded disabled:bg-gray-300"
      >
        Continuar
      </button>
    </div>
  );
};

// Basic Workout Type Selection
const WorkoutTypeSelection: React.FC<{
  data: SetupData;
  onUpdate: (data: Partial<SetupData>) => void;
  onBack: () => void;
  onComplete: () => void;
}> = ({ data, onUpdate, onBack, onComplete }) => {
  const workoutTypes = [
    { id: 'weights_machines', label: 'Pesas y máquinas' },
    { id: 'weights_only', label: 'Solo pesas libres' },
    { id: 'running', label: 'Ejercicio cardiovascular' },
    { id: 'calisthenics', label: 'Ejercicios corporales' }
  ];

  const handleWorkoutTypeSelect = (type: string) => {
    onUpdate({ workoutType: type });
  };

  return (
    <div className="p-8">
      <button onClick={onBack} className="mb-4 text-blue-500">← Atrás</button>
      <h1 className="text-2xl font-bold mb-6">¿Qué tipo de ejercicio prefieres?</h1>
      
      <div className="space-y-4 mb-8">
        {workoutTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleWorkoutTypeSelect(type.id)}
            className={`w-full p-4 border rounded ${
              data.workoutType === type.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      <button
        onClick={onComplete}
        disabled={!data.workoutType}
        className="w-full p-4 bg-blue-500 text-white rounded disabled:bg-gray-300"
      >
        ¡Comenzar!
      </button>
    </div>
  );
};

export default Setup;