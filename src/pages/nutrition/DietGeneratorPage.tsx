import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { serviceAdapter } from '../../shared/services/adapters/service-adapter';
import { UtensilsCrossed, Clock, AlertCircle, CheckCircle, Zap, ArrowLeft, User, Ruler, Weight } from 'lucide-react';
import DietGenerationSkeleton from '../../components/shared/DietGenerationSkeleton';
import Toast, { type ToastType } from '../../components/shared/Toast';
import { cn } from '../../lib/utils';

interface DietFormData {
  goal: string;
  calories: number;
  restrictions: string[];
  meals: number;
  dietType: string;
  allergies: string[];
  preferences: string;
}

const DietGeneratorPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile(user?.id);
  
  const [formData, setFormData] = useState<DietFormData>({
    goal: '',
    calories: 2000,
    restrictions: [],
    meals: 3,
    dietType: '',
    allergies: [],
    preferences: ''
  });

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Cargar datos del perfil del usuario y calcular calorías
  useEffect(() => {
    if (profile) {
      // Calcular calorías basándose en peso y objetivo
      const calculateCalories = () => {
        const baseCalories = profile.current_weight_kg * 24; // TMB aproximado
        const activityMultiplier = 1.4; // Moderadamente activo
        let maintenanceCalories = baseCalories * activityMultiplier;

        // Ajustar según objetivo
        if (profile.fitness_goal === 'lose_weight') {
          maintenanceCalories -= 500; // Déficit de 500 kcal
        } else if (profile.fitness_goal === 'gain_muscle' || profile.fitness_goal === 'gain_weight') {
          maintenanceCalories += 300; // Superávit de 300 kcal
        }

        return Math.round(maintenanceCalories);
      };

      setFormData(prev => ({
        ...prev,
        goal: profile.fitness_goal || '',
        calories: calculateCalories(),
        restrictions: [], // dietary_restrictions doesn't exist in profile yet
        allergies: [] // allergies doesn't exist in profile yet
      }));
    }
  }, [profile]);

  const handleInputChange = (field: keyof DietFormData, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleArrayToggle = (field: 'restrictions' | 'allergies', value: string) => {
    setFormData(prev => {
      const currentArray = prev[field];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  const handleGenerateDiet = async () => {
    if (!user) {
      setToast({ message: t('dietGenerator.loginRequired'), type: 'error' });
      return;
    }

    if (!formData.goal) {
      setToast({ message: t('dietGenerator.completeRequired'), type: 'warning' });
      return;
    }

    // Validaciones que coinciden con el backend
    if (formData.calories < 1000 || formData.calories > 5000) {
      setToast({ message: t('dietGenerator.caloriesRange'), type: 'warning' });
      return;
    }

    if (formData.meals < 3 || formData.meals > 6) {
      setToast({ message: 'El número de comidas debe estar entre 3 y 6', type: 'warning' });
      return;
    }

    setGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      // Convertir restricciones de español a inglés
      const mappedRestrictions = formData.restrictions.map(restriction => 
        restrictionsMap[restriction] || restriction
      );
      
      // Preparar datos para enviar
      const dataToSend = {
        userId: user.id,
        goal: formData.goal,
        calories: formData.calories,
        restrictions: mappedRestrictions,
        meals: formData.meals,
        dietType: formData.dietType,
        allergies: formData.allergies
      };
      
      // Debug: ver qué estamos enviando
      console.log('📤 Datos enviados al backend:', JSON.stringify(dataToSend, null, 2));
      
      // Use service adapter to generate AI diet AND save to Supabase
      const response = await serviceAdapter.generateAndSaveDietPlan(dataToSend);

      if (response.success && response.data) {
        setSuccess(true);
        setToast({ message: '¡Plan de dieta generado exitosamente! Redirigiendo...', type: 'success' });
        // Redirigir a la página de dieta después de 2 segundos
        setTimeout(() => {
          navigate('/diet');
        }, 2000);
      } else {
        // Manejar errores del backend con mensajes claros
        let errorMessage = 'Error al generar el plan de dieta';
        
        if (response.error) {
          // Si el error es un objeto con message array (validación del backend)
          if (typeof response.error === 'object' && 'message' in response.error) {
            const err = response.error as { message: string | string[] };
            if (Array.isArray(err.message)) {
              // Traducir mensajes de validación del backend
              const translatedMessages = err.message.map((msg: string) => {
                if (msg.includes('targetProtein must not be greater than 300')) {
                  return 'La proteína objetivo no puede ser mayor a 300g';
                }
                if (msg.includes('targetProtein must not be less than 50')) {
                  return 'La proteína objetivo no puede ser menor a 50g';
                }
                if (msg.includes('calories must not be greater than 5000')) {
                  return 'Las calorías no pueden ser mayores a 5000';
                }
                if (msg.includes('calories must not be less than 1000')) {
                  return 'Las calorías no pueden ser menores a 1000';
                }
                if (msg.includes('mealsPerDay must not be greater than 6')) {
                  return 'El número de comidas no puede ser mayor a 6';
                }
                if (msg.includes('mealsPerDay must not be less than 3')) {
                  return 'El número de comidas no puede ser menor a 3';
                }
                return msg;
              });
              errorMessage = translatedMessages.join('. ');
            } else {
              errorMessage = err.message;
            }
          } else if (typeof response.error === 'string') {
            errorMessage = response.error;
          }
        }
        
        setToast({ message: errorMessage, type: 'error' });
        setError(errorMessage);
      }
    } catch (err: unknown) {
      console.error('Error generating diet:', err);
      
      // Manejar errores de Axios con mejor contexto
      let errorMessage = 'Error al conectar con el servicio de IA';
      
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string | string[] } } };
        if (axiosError.response?.data) {
          const data = axiosError.response.data;
          if (Array.isArray(data.message)) {
            // Traducir mensajes de validación
            const translatedMessages = data.message.map((msg: string) => {
              if (msg.includes('targetProtein must not be greater than 300')) {
                return 'La proteína objetivo no puede ser mayor a 300g';
              }
              if (msg.includes('targetProtein must not be less than 50')) {
                return 'La proteína objetivo no puede ser menor a 50g';
              }
              if (msg.includes('calories must not be greater than 5000')) {
                return 'Las calorías no pueden ser mayores a 5000';
              }
              if (msg.includes('calories must not be less than 1000')) {
                return 'Las calorías no pueden ser menores a 1000';
              }
              if (msg.includes('mealsPerDay must not be greater than 6')) {
                return 'El número de comidas no puede ser mayor a 6';
              }
              if (msg.includes('mealsPerDay must not be less than 3')) {
                return 'El número de comidas no puede ser menor a 3';
              }
              return msg;
            });
            errorMessage = translatedMessages.join('. ');
          } else if (data.message) {
            errorMessage = data.message;
          }
        }
      } else if (err && typeof err === 'object' && 'message' in err) {
        const error = err as { message: string };
        errorMessage = error.message;
      }
      
      setToast({ message: errorMessage, type: 'error' });
      setError(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  // Mapeo de restricciones español -> inglés para el backend
  const restrictionsMap: Record<string, string> = {
    'Vegetariano': 'vegetarian',
    'Vegano': 'vegan',
    'Sin gluten': 'no_gluten',
    'Sin lácteos': 'no_dairy',
    'Sin azúcar': 'no_nuts', // Note: "Sin azúcar" no está en la lista del backend, usando no_nuts como fallback
    'Bajo en carbohidratos': 'low_carb',
    'Keto': 'keto',
    'Paleo': 'paleo',
    'Mediterránea': 'mediterranean'
  };

  const dietaryRestrictions = [
    'Vegetariano',
    'Vegano',
    'Sin gluten',
    'Sin lácteos',
    'Bajo en carbohidratos',
    'Keto',
    'Paleo',
    'Mediterránea'
  ];

  const commonAllergies = [
    'Nueces',
    'Maní',
    'Mariscos',
    'Pescado',
    'Huevos',
    'Soja',
    'Trigo',
    'Lácteos'
  ];

  const dietTypes = [
    { value: 'balanced', label: 'Balanceada' },
    { value: 'high-protein', label: 'Alta en proteínas' },
    { value: 'low-carb', label: 'Baja en carbohidratos' },
    { value: 'low-fat', label: 'Baja en grasas' },
    { value: 'ketogenic', label: 'Cetogénica' },
    { value: 'mediterranean', label: 'Mediterránea' }
  ];

  if (profileLoading) {
    return <DietGenerationSkeleton />;
  }

  return (
    <>
      {/* Show skeleton during AI generation */}
      {generating && <DietGenerationSkeleton />}
      
      <div className="relative min-h-screen bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 dark:from-gray-900 dark:via-green-900/10 dark:to-emerald-900/10 pb-24 overflow-hidden">
        {/* Burbujas decorativas */}
        <div className="fixed top-0 left-0 w-96 h-96 bg-gradient-to-br from-green-300/30 to-emerald-400/30 dark:from-green-600/20 dark:to-emerald-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="fixed top-1/3 right-0 w-80 h-80 bg-gradient-to-br from-teal-300/30 to-cyan-400/30 dark:from-teal-600/20 dark:to-cyan-600/20 rounded-full blur-3xl translate-x-1/2 pointer-events-none"></div>
        <div className="fixed bottom-0 left-1/4 w-72 h-72 bg-gradient-to-br from-lime-300/30 to-green-400/30 dark:from-lime-600/20 dark:to-green-600/20 rounded-full blur-3xl translate-y-1/2 pointer-events-none"></div>

        {/* Header Sticky */}
        <div className="sticky top-0 z-10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md shadow-xl border-b border-white/50 dark:border-gray-800/50">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-start gap-4">
              <button
                onClick={() => navigate('/diet')}
                className="p-2 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 hover:scale-105 flex-shrink-0 mt-1"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 dark:from-green-400 dark:via-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                  {t('dietGenerator.title')}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('dietGenerator.subtitle')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-6">
          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50/80 dark:bg-red-900/20 backdrop-blur-md border border-red-200/50 dark:border-red-800/50 shadow-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-800 dark:text-red-300 font-medium">{t('common.error')}</p>
                  <p className="text-red-700 dark:text-red-400 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 rounded-2xl bg-green-50/80 dark:bg-green-900/20 backdrop-blur-md border border-green-200/50 dark:border-green-800/50 shadow-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-green-800 dark:text-green-300 font-medium">{t('common.success')}</p>
                <p className="text-green-700 dark:text-green-400 text-sm mt-1">{t('dietGenerator.successGenerated')}</p>
              </div>
              </div>
            </div>
          )}

        {/* Profile Info Banner */}
        {profile && (
          <div className="mb-6 p-6 rounded-3xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-md shadow-xl border border-white/50 dark:border-gray-700/50">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {profile.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{profile.name || 'Usuario'}</h2>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
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
                       t('dietGenerator.improveHealth')}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Calorie info */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">{t('dietGenerator.suggestedCalories')}</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">{formData.calories} kcal</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">{t('dietGenerator.mealsPerDay')}</p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formData.meals}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-3xl shadow-xl p-6 sm:p-8 border border-white/50 dark:border-gray-700/50">
          <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
            {t('dietGenerator.configureDiet')}
          </h2>

          {/* Goal */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              {t('dietGenerator.whatIsYourGoal')} *
            </label>
            <select
              value={formData.goal}
              onChange={(e) => handleInputChange('goal', e.target.value)}
              className={cn(
                "w-full px-4 py-3 border rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition-all",
                "border-gray-200 dark:border-gray-700 focus:ring-green-500 dark:focus:ring-green-400"
              )}
              required
            >
              <option value="">{t('dietGenerator.selectGoalPlaceholder')}</option>
              <option value="lose_weight">{t('dietGenerator.goals.loseWeight')}</option>
              <option value="gain_weight">{t('dietGenerator.goals.gainWeight')}</option>
              <option value="maintain_weight">{t('dietGenerator.goals.maintainWeight')}</option>
              <option value="build_muscle">{t('dietGenerator.goals.buildMuscle')}</option>
              <option value="improve_health">{t('dietGenerator.goals.improveHealth')}</option>
            </select>
          </div>

          {/* Calories */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              {t('dietGenerator.dailyCaloriesLabel')}: <span className="text-green-600 dark:text-green-400 font-bold">{formData.calories} kcal</span>
            </label>
            <div className="relative">
              <input
                type="range"
                min="1000"
                max="5000"
                step="100"
                value={formData.calories}
                onChange={(e) => handleInputChange('calories', parseInt(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-green-200 to-emerald-200 dark:from-green-900 dark:to-emerald-900 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-green-500 [&::-webkit-slider-thumb]:to-emerald-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:scale-110 [&::-webkit-slider-thumb]:transition-transform"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                <span>1000 kcal</span>
                <span>5000 kcal</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-1">
              {formData.calories < 1500 ? (
                <><AlertCircle className="w-3 h-3" /> {t('dietGenerator.calorieDeficit')}</>
              ) : formData.calories < 2500 ? (
                <><CheckCircle className="w-3 h-3" /> {t('dietGenerator.maintenanceCalories')}</>
              ) : (
                <><Zap className="w-3 h-3" /> {t('dietGenerator.calorieSurplus')}</>
              )}
            </p>
          </div>

          {/* Meals per Day */}
          <div className="mb-6">
            <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              <Clock className="w-4 h-4 mr-2 text-green-500 dark:text-green-400" />
              {t('dietGenerator.mealsPerDayLabel')}: <span className="text-green-600 dark:text-green-400 font-bold ml-1">{formData.meals}</span>
            </label>
            <div className="grid grid-cols-4 gap-3">
              {[3, 4, 5, 6].map((mealCount) => (
                <button
                  key={mealCount}
                  type="button"
                  onClick={() => handleInputChange('meals', mealCount)}
                  className={cn(
                    "px-4 py-3 rounded-2xl border-2 transition-all duration-300 font-medium",
                    formData.meals === mealCount
                      ? 'border-transparent bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:bg-green-50/50 dark:hover:bg-green-900/20 text-gray-700 dark:text-gray-300'
                  )}
                >
                  {mealCount}
                </button>
              ))}
            </div>
          </div>

          {/* Diet Type */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              {t('dietGenerator.dietType')}
            </label>
            <select
              value={formData.dietType}
              onChange={(e) => handleInputChange('dietType', e.target.value)}
              className={cn(
                "w-full px-4 py-3 border rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition-all",
                "border-gray-200 dark:border-gray-700 focus:ring-green-500 dark:focus:ring-green-400"
              )}
            >
              <option value="">{t('dietGenerator.selectDietTypePlaceholder')}</option>
              {dietTypes.map((type) => (
                <option key={type.value} value={type.value}>{t(`dietGenerator.dietTypes.${type.value.replace(/-/g, '')}`)}</option>
              ))}
            </select>
          </div>

          {/* Dietary Restrictions */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              {t('dietGenerator.restrictions')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {dietaryRestrictions.map((restriction) => (
                <button
                  key={restriction}
                  type="button"
                  onClick={() => handleArrayToggle('restrictions', restriction)}
                  className={cn(
                    "px-3 py-2 rounded-2xl border-2 text-sm transition-all duration-300 font-medium",
                    formData.restrictions.includes(restriction)
                      ? 'border-transparent bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:bg-green-50/50 dark:hover:bg-green-900/20 text-gray-700 dark:text-gray-300'
                  )}
                >
                  {restriction}
                </button>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <div className="mb-6">
            <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              <AlertCircle className="w-4 h-4 mr-2 text-red-500 dark:text-red-400" />
              {t('dietGenerator.allergies')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {commonAllergies.map((allergy) => (
                <button
                  key={allergy}
                  type="button"
                  onClick={() => handleArrayToggle('allergies', allergy)}
                  className={cn(
                    "px-3 py-2 rounded-2xl border-2 text-sm transition-all duration-300 font-medium",
                    formData.allergies.includes(allergy)
                      ? 'border-transparent bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600 hover:bg-red-50/50 dark:hover:bg-red-900/20 text-gray-700 dark:text-gray-300'
                  )}
                >
                  {allergy}
                </button>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div className="mb-0">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              {t('dietGenerator.additionalPreferences')}
            </label>
            <textarea
              value={formData.preferences}
              onChange={(e) => handleInputChange('preferences', e.target.value)}
              placeholder={t('dietGenerator.preferencesPlaceholder')}
              rows={4}
              className={cn(
                "w-full px-4 py-3 border rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition-all resize-none",
                "border-gray-200 dark:border-gray-700 focus:ring-green-500 dark:focus:ring-green-400"
              )}
            />
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateDiet}
          disabled={generating || success}
          className={cn(
            "w-full mt-6 py-4 rounded-2xl font-bold text-white transition-all duration-300 flex items-center justify-center shadow-xl",
            generating || success
              ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:shadow-2xl hover:shadow-green-500/40 hover:scale-[1.02] active:scale-[0.98]'
          )}
        >
          {generating ? (
            <>
              <UtensilsCrossed className="w-5 h-5 mr-2 animate-pulse" />
              {t('dietGenerator.generating')}
            </>
          ) : success ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              {t('dietGenerator.dietGenerated')}
            </>
          ) : (
            <>
              <UtensilsCrossed className="w-5 h-5 mr-2" />
              {t('dietGenerator.generate')}
            </>
          )}
        </button>

        {/* Macros Info */}
        <div className="mt-6 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-md rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/50">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
            {t('dietGenerator.macrosDistribution')}
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {Math.round((formData.calories * 0.30) / 4)}g
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('nutrition.protein')} (30%)</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {Math.round((formData.calories * 0.40) / 4)}g
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('nutrition.carbs')} (40%)</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {Math.round((formData.calories * 0.30) / 9)}g
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('nutrition.fat')} (30%)</p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-md border border-blue-200/50 dark:border-blue-800/50 rounded-2xl p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-semibold mb-1">{t('dietGenerator.poweredByGemini')}</p>
              <p>{t('dietGenerator.aiDescription')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Toast Notification */}
    {toast && (
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(null)}
        duration={5000}
      />
    )}
    </>
  );
};

export default DietGeneratorPage;
