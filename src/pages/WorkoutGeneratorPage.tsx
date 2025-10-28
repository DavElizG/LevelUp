import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { aiService } from '../shared/services/ai/microservice';
import { Dumbbell, Target, Clock, TrendingUp, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import WorkoutGenerationSkeleton from '../components/shared/WorkoutGenerationSkeleton';

interface WorkoutFormData {
  goal: string;
  difficulty: string;
  daysPerWeek: number;
  duration: number;
  equipment: string[];
  targetMuscles: string[];
  preferences: string;
}

const WorkoutGeneratorPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile(user?.id);
  
  const [formData, setFormData] = useState<WorkoutFormData>({
    goal: '',
    difficulty: '',
    daysPerWeek: 3,
    duration: 60,
    equipment: [],
    targetMuscles: [],
    preferences: ''
  });

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Cargar datos del perfil del usuario
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        goal: profile.fitness_goal || '',
        difficulty: 'beginner' // Default value since fitness_level doesn't exist in profile
      }));
    }
  }, [profile]);

  const handleInputChange = (field: keyof WorkoutFormData, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleArrayToggle = (field: 'equipment' | 'targetMuscles', value: string) => {
    setFormData(prev => {
      const currentArray = prev[field];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  const handleGenerateWorkout = async () => {
    if (!user) {
      setError('Debes iniciar sesión para generar rutinas');
      return;
    }

    if (!formData.goal || !formData.difficulty) {
      setError('Por favor completa los campos obligatorios');
      return;
    }

    setGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await aiService.generateWorkout({
        userId: user.id,
        goal: formData.goal,
        difficulty: formData.difficulty,
        daysPerWeek: formData.daysPerWeek,
        duration: formData.duration,
        equipment: formData.equipment,
        targetMuscles: formData.targetMuscles,
        preferences: formData.preferences
      });

      if (response.success && response.data) {
        setSuccess(true);
        // Redirigir a la página de rutinas después de 2 segundos
        setTimeout(() => {
          navigate('/workouts');
        }, 2000);
      } else {
        const errorMessage = typeof response.error === 'string' ? response.error : response.error?.message || 'Error al generar la rutina';
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Error generating workout:', err);
      setError('Error al conectar con el servicio de IA. Verifica que el microservicio esté funcionando.');
    } finally {
      setGenerating(false);
    }
  };

  const equipmentOptions = [
    'Barra',
    'Mancuernas',
    'Máquinas',
    'Bandas elásticas',
    'Peso corporal',
    'TRX',
    'Kettlebells',
    'Banco',
    'Pull-up bar'
  ];

  const muscleGroups = [
    'Pecho',
    'Espalda',
    'Hombros',
    'Brazos',
    'Piernas',
    'Abdominales',
    'Glúteos',
    'Pantorrillas'
  ];

  if (profileLoading) {
    return <WorkoutGenerationSkeleton />;
  }

  return (
    <>
      {/* Show skeleton during AI generation */}
      {generating && <WorkoutGenerationSkeleton />}
      
      <div className="min-h-screen bg-gray-50 pb-24">
      <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate('/workouts')}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Generar Rutina con IA</h1>
              <p className="text-gray-600 mt-1">Crea una rutina personalizada basada en tus objetivos</p>
            </div>
          </div>
        </div>

        {/* Profile Info Banner */}
        {profile && (
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 mb-6 text-white">
            <div className="flex items-center mb-3">
              <Zap className="w-6 h-6 mr-2" />
              <h3 className="font-semibold text-lg">Tu Perfil</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="opacity-80">Objetivo</p>
                <p className="font-semibold">{profile.fitness_goal === 'gain_muscle' ? 'Ganar músculo' : profile.fitness_goal === 'lose_weight' ? 'Perder peso' : 'Mantener'}</p>
              </div>
              <div>
                <p className="opacity-80">Nivel</p>
                <p className="font-semibold">Personalizado</p>
              </div>
              <div>
                <p className="opacity-80">Peso</p>
                <p className="font-semibold">{profile.current_weight_kg} kg</p>
              </div>
              <div>
                <p className="opacity-80">Días/semana</p>
                <p className="font-semibold">{profile.workout_days_per_week || 3} días</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
            <p className="text-green-800">¡Rutina generada exitosamente! Redirigiendo...</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Target className="w-5 h-5 mr-2 text-orange-500" />
            Configuración de la Rutina
          </h2>

          {/* Goal */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Objetivo Principal *
            </label>
            <select
              value={formData.goal}
              onChange={(e) => handleInputChange('goal', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            >
              <option value="">Selecciona un objetivo</option>
              <option value="lose_weight">Perder peso</option>
              <option value="gain_muscle">Ganar músculo</option>
              <option value="improve_endurance">Mejorar resistencia</option>
              <option value="strength_training">Entrenamiento de fuerza</option>
              <option value="maintain_fitness">Mantener condición física</option>
              <option value="flexibility">Mejorar flexibilidad</option>
            </select>
          </div>

          {/* Difficulty */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nivel de Dificultad *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['beginner', 'intermediate', 'advanced', 'expert'].map((level) => (
                <button
                  key={level}
                  onClick={() => handleInputChange('difficulty', level)}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    formData.difficulty === level
                      ? 'border-orange-500 bg-orange-50 text-orange-700 font-semibold'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {level === 'beginner' ? 'Principiante' : 
                   level === 'intermediate' ? 'Intermedio' : 
                   level === 'advanced' ? 'Avanzado' : 'Experto'}
                </button>
              ))}
            </div>
          </div>

          {/* Days per Week */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Días por Semana: {formData.daysPerWeek}
            </label>
            <input
              type="range"
              min="1"
              max="7"
              value={formData.daysPerWeek}
              onChange={(e) => handleInputChange('daysPerWeek', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 día</span>
              <span>7 días</span>
            </div>
          </div>

          {/* Duration */}
          <div className="mb-6">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 mr-2" />
              Duración por Sesión: {formData.duration} min
            </label>
            <input
              type="range"
              min="30"
              max="120"
              step="15"
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>30 min</span>
              <span>120 min</span>
            </div>
          </div>

          {/* Equipment */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Equipamiento Disponible
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {equipmentOptions.map((equipment) => (
                <button
                  key={equipment}
                  onClick={() => handleArrayToggle('equipment', equipment)}
                  className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                    formData.equipment.includes(equipment)
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {equipment}
                </button>
              ))}
            </div>
          </div>

          {/* Target Muscles */}
          <div className="mb-6">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
              <Dumbbell className="w-4 h-4 mr-2" />
              Grupos Musculares a Enfocar
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {muscleGroups.map((muscle) => (
                <button
                  key={muscle}
                  onClick={() => handleArrayToggle('targetMuscles', muscle)}
                  className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                    formData.targetMuscles.includes(muscle)
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {muscle}
                </button>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferencias Adicionales (Opcional)
            </label>
            <textarea
              value={formData.preferences}
              onChange={(e) => handleInputChange('preferences', e.target.value)}
              placeholder="Ej: Enfoque en ejercicios compuestos, evitar ejercicios de impacto, incluir estiramientos..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateWorkout}
          disabled={generating || success}
          className={`w-full py-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center ${
            generating || success
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg'
          }`}
        >
          {generating ? (
            <>
              <TrendingUp className="w-5 h-5 mr-2 animate-pulse" />
              Generando con IA... (10-20 segundos)
            </>
          ) : success ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Rutina Generada
            </>
          ) : (
            <>
              <TrendingUp className="w-5 h-5 mr-2" />
              Generar Rutina con IA
            </>
          )}
        </button>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Powered by Gemini AI</p>
              <p>La IA generará una rutina personalizada basada en tus datos y preferencias. El proceso puede tomar 10-20 segundos.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default WorkoutGeneratorPage;
