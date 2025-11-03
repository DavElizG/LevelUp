import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { aiService } from '../../shared/services/ai/microservice';
import { Dumbbell, Clock, User, Ruler, Weight, AlertCircle, CheckCircle, ArrowLeft, TrendingUp } from 'lucide-react';
import WorkoutGenerationSkeleton from '../../components/shared/WorkoutGenerationSkeleton';
import { cn } from '../../lib/utils';

interface WorkoutFormData {
  goal: string;
  difficulty: string;
  daysPerWeek: number;
  duration: number;
  equipment: string[];
  targetMuscles: string[];
  preferences: string;
}

interface ValidationErrors {
  goal?: string;
  difficulty?: string;
  preferences?: string;
}

const MAX_PREFERENCES_LENGTH = 500;

const WorkoutGeneratorPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

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
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validar en tiempo real
    validateField(field, value);
  };

  const validateField = (field: keyof WorkoutFormData, value: string | number | string[]) => {
    const errors: ValidationErrors = { ...validationErrors };

    switch (field) {
      case 'goal':
        if (!value || value === '') {
          errors.goal = t('workoutGenerator.selectGoal');
        } else {
          delete errors.goal;
        }
        break;
      
      case 'difficulty':
        if (!value || value === '') {
          errors.difficulty = t('workoutGenerator.selectDifficulty');
        } else {
          delete errors.difficulty;
        }
        break;
      
      case 'preferences': {
        const text = value as string;
        if (text.length > MAX_PREFERENCES_LENGTH) {
          errors.preferences = t('workoutGenerator.maxCharacters', { max: MAX_PREFERENCES_LENGTH });
        } else {
          delete errors.preferences;
        }
        break;
      }
    }

    setValidationErrors(errors);
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.goal) {
      errors.goal = 'Debes seleccionar un objetivo';
    }

    if (!formData.difficulty) {
      errors.difficulty = 'Debes seleccionar un nivel de dificultad';
    }

    if (formData.preferences.length > MAX_PREFERENCES_LENGTH) {
      errors.preferences = `Máximo ${MAX_PREFERENCES_LENGTH} caracteres`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
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

    // Validar formulario
    if (!validateForm()) {
      setError('Por favor completa los campos obligatorios correctamente');
      // Marcar todos los campos como touched para mostrar errores
      setTouched({
        goal: true,
        difficulty: true,
        preferences: true
      });
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
      
      <div className="relative min-h-screen bg-gradient-to-br from-white via-orange-50/30 to-purple-50/30 pb-24 overflow-hidden">
        {/* Burbujas decorativas */}
        <div className="fixed top-0 left-0 w-96 h-96 bg-gradient-to-br from-orange-300/30 to-pink-400/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="fixed top-1/3 right-0 w-80 h-80 bg-gradient-to-br from-purple-300/30 to-blue-400/30 rounded-full blur-3xl translate-x-1/2 pointer-events-none"></div>
        <div className="fixed bottom-0 left-1/4 w-72 h-72 bg-gradient-to-br from-pink-300/30 to-orange-400/30 rounded-full blur-3xl translate-y-1/2 pointer-events-none"></div>

        {/* Header Sticky */}
        <div className="sticky top-0 z-10 bg-white/70 backdrop-blur-md shadow-xl border-b border-white/50">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-start gap-4">
              <button
                onClick={() => navigate('/workouts')}
                className="p-2 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 text-white hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 hover:scale-105 flex-shrink-0 mt-1"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                  {t('workoutGenerator.title')}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {t('workoutGenerator.subtitle')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-6">
          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50/80 backdrop-blur-md border border-red-200/50 shadow-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-800 font-medium">Error</p>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

        {/* Profile Info Banner */}
          {profile && (
          <div className="mb-6 p-6 rounded-3xl bg-white/70 backdrop-blur-md shadow-xl border border-white/50">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {profile.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{profile.name || 'Usuario'}</h2>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                  {profile.height_cm && (
                    <span className="flex items-center gap-1">
                      <Ruler className="w-4 h-4" />
                      {profile.height_cm} cm
                    </span>
                  )}
                  {profile.current_weight_kg && (
                    <span className="flex items-center gap-1">
                      <Weight className="w-4 h-4" />
                      {profile.current_weight_kg} kg
                    </span>
                  )}
                  {profile.fitness_goal && (
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {profile.fitness_goal === 'gain_muscle' ? t('workoutGenerator.goal.gainMuscle') : 
                       profile.fitness_goal === 'lose_weight' ? t('workoutGenerator.goal.loseWeight') :
                       profile.fitness_goal === 'maintain' ? t('workoutGenerator.goal.maintain') :
                       t('workoutGenerator.goal.improveEndurance')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-green-50/80 backdrop-blur-md border border-green-200/50 shadow-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-green-800 font-medium">{t('common.success')}</p>
                <p className="text-green-700 text-sm mt-1">{t('workoutGenerator.successGenerated')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl p-6 sm:p-8 border border-white/50">
          <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            {t('workoutGenerator.configureRoutine')}
          </h2>

          {/* Goal */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {t('workoutGenerator.whatIsYourGoal')} *
            </label>
            <select
              value={formData.goal}
              onChange={(e) => handleInputChange('goal', e.target.value)}
              className={cn(
                "w-full px-4 py-3 border rounded-2xl bg-white/50 backdrop-blur-sm text-gray-900 focus:outline-none focus:ring-2 transition-all",
                touched.goal && validationErrors.goal
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-200 focus:ring-orange-500"
              )}
            >
              <option value="">{t('workoutGenerator.selectGoalPlaceholder')}</option>
              <option value="lose_weight">{t('workoutGenerator.goal.loseWeight')}</option>
              <option value="gain_muscle">{t('workoutGenerator.goal.gainMuscle')}</option>
              <option value="improve_endurance">{t('workoutGenerator.goal.improveEndurance')}</option>
              <option value="strength_training">{t('workoutGenerator.goal.strengthTraining')}</option>
              <option value="maintain_fitness">{t('workoutGenerator.goal.maintainFitness')}</option>
              <option value="flexibility">{t('workoutGenerator.goal.flexibility')}</option>
            </select>
            {touched.goal && validationErrors.goal && (
              <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.goal}
              </p>
            )}
          </div>

          {/* Difficulty */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {t('workoutGenerator.whatIsYourLevel')} *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['beginner', 'intermediate', 'advanced', 'expert'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => handleInputChange('difficulty', level)}
                  className={cn(
                    "px-4 py-3 rounded-2xl border-2 transition-all duration-300 font-medium",
                    formData.difficulty === level
                      ? 'border-transparent bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/30'
                      : touched.difficulty && validationErrors.difficulty
                      ? 'border-red-500 text-red-700 hover:bg-red-50'
                      : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
                  )}
                >
                  {level === 'beginner' ? t('workoutGenerator.difficulty.beginner') : 
                   level === 'intermediate' ? t('workoutGenerator.difficulty.intermediate') : 
                   level === 'advanced' ? t('workoutGenerator.difficulty.advanced') : t('workoutGenerator.difficulty.expert')}
                </button>
              ))}
            </div>
            {touched.difficulty && validationErrors.difficulty && (
              <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.difficulty}
              </p>
            )}
          </div>

          {/* Days per Week */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {t('workoutGenerator.daysPerWeekLabel')}: <span className="text-orange-600 font-bold">{formData.daysPerWeek}</span>
            </label>
            <div className="relative">
              <input
                type="range"
                min="1"
                max="7"
                value={formData.daysPerWeek}
                onChange={(e) => handleInputChange('daysPerWeek', parseInt(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-orange-200 to-pink-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-orange-500 [&::-webkit-slider-thumb]:to-pink-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:scale-110 [&::-webkit-slider-thumb]:transition-transform"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>{t('workoutGenerator.oneDay')}</span>
                <span>{t('workoutGenerator.sevenDays')}</span>
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="mb-6">
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
              <Clock className="w-4 h-4 mr-2 text-orange-500" />
              {t('workoutGenerator.durationPerSession')}: <span className="text-orange-600 font-bold ml-1">{formData.duration} {t('workoutGenerator.minutes')}</span>
            </label>
            <div className="relative">
              <input
                type="range"
                min="30"
                max="120"
                step="15"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-orange-200 to-pink-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-orange-500 [&::-webkit-slider-thumb]:to-pink-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:scale-110 [&::-webkit-slider-thumb]:transition-transform"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>30 {t('workoutGenerator.minutes')}</span>
                <span>120 {t('workoutGenerator.minutes')}</span>
              </div>
            </div>
          </div>

          {/* Equipment */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {t('workoutGenerator.equipmentAvailable')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {equipmentOptions.map((equipment) => (
                <button
                  key={equipment}
                  type="button"
                  onClick={() => handleArrayToggle('equipment', equipment)}
                  className={cn(
                    "px-3 py-2 rounded-2xl border-2 text-sm transition-all duration-300 font-medium",
                    formData.equipment.includes(equipment)
                      ? 'border-transparent bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/20'
                      : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
                  )}
                >
                  {t(`workoutGenerator.${equipment}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Target Muscles */}
          <div className="mb-6">
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
              <Dumbbell className="w-4 h-4 mr-2 text-orange-500" />
              {t('workoutGenerator.muscleGroupsToFocus')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {muscleGroups.map((muscle) => (
                <button
                  key={muscle}
                  type="button"
                  onClick={() => handleArrayToggle('targetMuscles', muscle)}
                  className={cn(
                    "px-3 py-2 rounded-2xl border-2 text-sm transition-all duration-300 font-medium",
                    formData.targetMuscles.includes(muscle)
                      ? 'border-transparent bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/20'
                      : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
                  )}
                >
                  {t(`workoutGenerator.${muscle}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div className="mb-0">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {t('workoutGenerator.additionalPreferences')}
            </label>
            <div className="relative">
              <textarea
                value={formData.preferences}
                onChange={(e) => handleInputChange('preferences', e.target.value)}
                placeholder={t('workoutGenerator.preferencesPlaceholder')}
                rows={4}
                maxLength={MAX_PREFERENCES_LENGTH}
                className={cn(
                  "w-full px-4 py-3 border rounded-2xl bg-white/50 backdrop-blur-sm text-gray-900 focus:outline-none focus:ring-2 transition-all resize-none",
                  touched.preferences && validationErrors.preferences
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-200 focus:ring-orange-500"
                )}
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded-lg backdrop-blur-sm">
                {formData.preferences.length}/{MAX_PREFERENCES_LENGTH}
              </div>
            </div>
            {touched.preferences && validationErrors.preferences && (
              <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.preferences}
              </p>
            )}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateWorkout}
          disabled={generating || success}
          className={cn(
            "w-full mt-6 py-4 rounded-2xl font-bold text-white transition-all duration-300 flex items-center justify-center shadow-xl",
            generating || success
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 hover:shadow-2xl hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98]'
          )}
        >
          {generating ? (
            <>
              <TrendingUp className="w-5 h-5 mr-2 animate-pulse" />
              {t('workoutGenerator.generating')}
            </>
          ) : success ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              {t('workoutGenerator.routineGenerated')}
            </>
          ) : (
            <>
              <TrendingUp className="w-5 h-5 mr-2" />
              {t('workoutGenerator.generate')}
            </>
          )}
        </button>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">{t('workoutGenerator.poweredByGemini')}</p>
              <p>{t('workoutGenerator.aiDescription')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default WorkoutGeneratorPage;
