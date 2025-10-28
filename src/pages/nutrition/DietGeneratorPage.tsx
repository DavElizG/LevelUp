import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { aiService } from '../../shared/services/ai/microservice';
import { UtensilsCrossed, Target, Clock, Zap, AlertCircle, CheckCircle, Apple } from 'lucide-react';
import DietGenerationSkeleton from '../../components/shared/DietGenerationSkeleton';

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
      setError('Debes iniciar sesión para generar planes de dieta');
      return;
    }

    if (!formData.goal) {
      setError('Por favor completa los campos obligatorios');
      return;
    }

    setGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await aiService.generateDietPlan({
        userId: user.id,
        goal: formData.goal,
        calories: formData.calories,
        restrictions: formData.restrictions,
        mealsPerDay: formData.meals,
        avoidFoods: formData.allergies,
        preferences: formData.preferences
      });

      if (response.success && response.data) {
        setSuccess(true);
        // Redirigir a la página de dieta después de 2 segundos
        setTimeout(() => {
          navigate('/diet');
        }, 2000);
      } else {
        const errorMessage = typeof response.error === 'string' ? response.error : response.error?.message || 'Error al generar el plan de dieta';
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Error generating diet:', err);
      setError('Error al conectar con el servicio de IA. Verifica que el microservicio esté funcionando.');
    } finally {
      setGenerating(false);
    }
  };

  const dietaryRestrictions = [
    'Vegetariano',
    'Vegano',
    'Sin gluten',
    'Sin lácteos',
    'Sin azúcar',
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
      
      <div className="min-h-screen bg-gray-50 pb-24">
      <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate('/diet')}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Generar Plan de Dieta con IA</h1>
              <p className="text-gray-600 mt-1">Crea un plan nutricional personalizado</p>
            </div>
          </div>
        </div>

        {/* Profile Info Banner */}
        {profile && (
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 mb-6 text-white">
            <div className="flex items-center mb-3">
              <Apple className="w-6 h-6 mr-2" />
              <h3 className="font-semibold text-lg">Tu Perfil Nutricional</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="opacity-80">Objetivo</p>
                <p className="font-semibold">
                  {profile.fitness_goal === 'gain_muscle' ? 'Ganar músculo' : 
                   profile.fitness_goal === 'lose_weight' ? 'Perder peso' : 
                   profile.fitness_goal === 'gain_weight' ? 'Ganar peso' : 'Mantener'}
                </p>
              </div>
              <div>
                <p className="opacity-80">Peso Actual</p>
                <p className="font-semibold">{profile.current_weight_kg} kg</p>
              </div>
              <div>
                <p className="opacity-80">Calorías Sugeridas</p>
                <p className="font-semibold">{formData.calories} kcal</p>
              </div>
              <div>
                <p className="opacity-80">Comidas/día</p>
                <p className="font-semibold">{formData.meals} comidas</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
            <p className="text-green-800">¡Plan de dieta generado exitosamente! Redirigiendo...</p>
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
            <Target className="w-5 h-5 mr-2 text-green-500" />
            Configuración del Plan de Dieta
          </h2>

          {/* Goal */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Objetivo Nutricional *
            </label>
            <select
              value={formData.goal}
              onChange={(e) => handleInputChange('goal', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            >
              <option value="">Selecciona un objetivo</option>
              <option value="lose_weight">Perder peso</option>
              <option value="gain_weight">Ganar peso</option>
              <option value="maintain_weight">Mantener peso</option>
              <option value="build_muscle">Ganar músculo</option>
              <option value="improve_health">Mejorar salud</option>
            </select>
          </div>

          {/* Calories */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calorías Diarias: {formData.calories} kcal
            </label>
            <input
              type="range"
              min="1200"
              max="4000"
              step="100"
              value={formData.calories}
              onChange={(e) => handleInputChange('calories', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1200 kcal</span>
              <span>4000 kcal</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {formData.calories < 1500 ? '⚠️ Déficit calórico (pérdida de peso)' : 
               formData.calories < 2500 ? '✅ Calorías de mantenimiento' : 
               '💪 Superávit calórico (ganancia)'}
            </p>
          </div>

          {/* Meals per Day */}
          <div className="mb-6">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 mr-2" />
              Comidas por Día: {formData.meals}
            </label>
            <div className="grid grid-cols-4 gap-3">
              {[3, 4, 5, 6].map((mealCount) => (
                <button
                  key={mealCount}
                  onClick={() => handleInputChange('meals', mealCount)}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    formData.meals === mealCount
                      ? 'border-green-500 bg-green-50 text-green-700 font-semibold'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {mealCount}
                </button>
              ))}
            </div>
          </div>

          {/* Diet Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Dieta
            </label>
            <select
              value={formData.dietType}
              onChange={(e) => handleInputChange('dietType', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Selecciona tipo (Opcional)</option>
              {dietTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Dietary Restrictions */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Restricciones Dietéticas
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {dietaryRestrictions.map((restriction) => (
                <button
                  key={restriction}
                  onClick={() => handleArrayToggle('restrictions', restriction)}
                  className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                    formData.restrictions.includes(restriction)
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {restriction}
                </button>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <div className="mb-6">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
              <AlertCircle className="w-4 h-4 mr-2" />
              Alergias Alimentarias
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {commonAllergies.map((allergy) => (
                <button
                  key={allergy}
                  onClick={() => handleArrayToggle('allergies', allergy)}
                  className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                    formData.allergies.includes(allergy)
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {allergy}
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
              placeholder="Ej: Prefiero comidas fáciles de preparar, me gustan los smoothies, evitar comida picante..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateDiet}
          disabled={generating || success}
          className={`w-full py-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center ${
            generating || success
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg'
          }`}
        >
          {generating ? (
            <>
              <UtensilsCrossed className="w-5 h-5 mr-2 animate-pulse" />
              Generando con IA... (10-20 segundos)
            </>
          ) : success ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Plan de Dieta Generado
            </>
          ) : (
            <>
              <UtensilsCrossed className="w-5 h-5 mr-2" />
              Generar Plan de Dieta con IA
            </>
          )}
        </button>

        {/* Macros Info */}
        <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-blue-500" />
            Distribución de Macros Estimada
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {Math.round((formData.calories * 0.30) / 4)}g
              </p>
              <p className="text-sm text-gray-600">Proteína (30%)</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {Math.round((formData.calories * 0.40) / 4)}g
              </p>
              <p className="text-sm text-gray-600">Carbohidratos (40%)</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {Math.round((formData.calories * 0.30) / 9)}g
              </p>
              <p className="text-sm text-gray-600">Grasas (30%)</p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Powered by Gemini AI</p>
              <p>La IA generará un plan nutricional completo con recetas y macros basado en tus necesidades. El proceso puede tomar 10-20 segundos.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default DietGeneratorPage;
