import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import BottomNavbar from '../components/shared/BottomNavbar';

const Profile: React.FC = () => {
  const { user, signOut } = useAuth();
  const { 
    formData, 
    loading, 
    error, 
    isSaving, 
    updateFormData, 
    saveProfile, 
    resetForm 
  } = useProfile(user?.id);
  
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    updateFormData(field, value);
    // Clear messages when user starts typing
    if (error || successMessage) {
      setSuccessMessage(null);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset form
      resetForm();
      setSuccessMessage(null);
    }
    setIsEditing(!isEditing);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    
    const success = await saveProfile();
    if (success) {
      setSuccessMessage('Perfil actualizado correctamente');
      setIsEditing(false);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const formatAge = () => {
    if (!formData.age) return 'No especificado';
    return `${formData.age} años`;
  };

  const formatBirthDate = () => {
    if (!formData.age) return 'No especificado';
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - Number(formData.age);
    return `${birthYear}`;
  };

  const formatGender = () => {
    if (!formData.gender) return 'No especificado';
    return formData.gender === 'male' ? 'Masculino' : 'Femenino';
  };

  const formatWeight = () => {
    if (!formData.current_weight_kg) return 'No especificado';
    return `${formData.current_weight_kg} kg`;
  };

  const formatHeight = () => {
    if (!formData.height_cm) return 'No especificado';
    return `${formData.height_cm} cm`;
  };

  const formatGoal = () => {
    if (!formData.fitness_goal) return 'No especificado';
    const goals = {
      'lose_weight': 'Perder Peso',
      'gain_weight': 'Ganar Peso', 
      'gain_muscle': 'Ganar Músculo',
      'maintain': 'Mantener Peso',
      'improve_endurance': 'Mejorar Resistencia'
    };
    return goals[formData.fitness_goal as keyof typeof goals] || 'Objetivo personalizado';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center">Mi Perfil</h1>
          <p className="text-gray-600 text-sm sm:text-base text-center">Gestiona tu información personal y preferencias</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm sm:text-base">{error}</p>
          </div>
        )}
        
        {successMessage && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm sm:text-base">{successMessage}</p>
          </div>
        )}

        {!isEditing ? (
          <div>
            {/* View Mode */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-0">Información Personal</h3>
                <button
                  onClick={handleEditToggle}
                  className="w-full sm:w-auto px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm sm:text-base font-medium"
                >
                  Editar Perfil
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <div className="text-xs sm:text-sm text-gray-500 mb-1">Nombre Completo</div>
                  <div className="font-medium text-sm sm:text-base text-gray-900">
                    {formData.name && formData.lastname1 
                      ? `${formData.name} ${formData.lastname1} ${formData.lastname2 || ''}`.trim()
                      : 'No especificado'
                    }
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <div className="text-xs sm:text-sm text-gray-500 mb-1">Edad</div>
                  <div className="font-medium text-sm sm:text-base text-gray-900">{formatAge()}</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <div className="text-xs sm:text-sm text-gray-500 mb-1">Año de Nacimiento</div>
                  <div className="font-medium text-sm sm:text-base text-gray-900">{formatBirthDate()}</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <div className="text-xs sm:text-sm text-gray-500 mb-1">Género</div>
                  <div className="font-medium text-sm sm:text-base text-gray-900">{formatGender()}</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <div className="text-xs sm:text-sm text-gray-500 mb-1">Email</div>
                  <div className="font-medium text-sm sm:text-base text-gray-900 truncate">{user?.email}</div>
                </div>
              </div>
            </div>

            {/* Physical Stats */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Estadísticas Físicas</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13 7.5h5v2h-5zm0 7h5v2h-5zM19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 19V5h14v14H5z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-gray-600">Peso Actual</div>
                      <div className="text-base sm:text-lg font-bold text-gray-900">{formatWeight()}</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-gray-600">Altura</div>
                      <div className="text-base sm:text-lg font-bold text-gray-900">{formatHeight()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fitness Goal */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Objetivo de Fitness</h3>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 sm:p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm text-gray-600">Mi Meta</div>
                    <div className="text-base sm:text-lg font-bold text-gray-900">{formatGoal()}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings & Logout */}
            <div className="bg-white rounded-2xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Configuración</h3>
              
              <div className="space-y-3">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center justify-between p-3 sm:p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                      {isLoggingOut ? (
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                      ) : (
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                        </svg>
                      )}
                    </div>
                    <div className="text-left">
                      <div className="text-sm sm:text-base font-medium text-red-700">
                        {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
                      </div>
                      <div className="text-xs sm:text-sm text-red-600">Salir de la aplicación</div>
                    </div>
                  </div>
                  <div className="text-red-400">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Edit Mode */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-0">Editar Información</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primer Apellido *
                  </label>
                  <input
                    type="text"
                    value={formData.lastname1}
                    onChange={(e) => handleInputChange('lastname1', e.target.value)}
                    placeholder="Primer apellido"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Segundo Apellido
                  </label>
                  <input
                    type="text"
                    value={formData.lastname2}
                    onChange={(e) => handleInputChange('lastname2', e.target.value)}
                    placeholder="Segundo apellido (opcional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Edad *
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', parseInt(e.target.value) || '')}
                    placeholder="Tu edad"
                    min="13"
                    max="120"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Género *
                  </label>
                  <select 
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                    required
                  >
                    <option value="">Seleccionar</option>
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peso (kg) *
                  </label>
                  <input
                    type="number"
                    value={formData.current_weight_kg}
                    onChange={(e) => handleInputChange('current_weight_kg', parseFloat(e.target.value) || '')}
                    placeholder="Tu peso en kg"
                    min="30"
                    max="300"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Altura (cm) *
                  </label>
                  <input
                    type="number"
                    value={formData.height_cm}
                    onChange={(e) => handleInputChange('height_cm', parseInt(e.target.value) || '')}
                    placeholder="Tu altura en cm"
                    min="100"
                    max="250"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Objetivo de fitness *
                  </label>
                  <select 
                    value={formData.fitness_goal}
                    onChange={(e) => handleInputChange('fitness_goal', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                    required
                  >
                    <option value="">Seleccionar objetivo</option>
                    <option value="lose_weight">Perder peso</option>
                    <option value="maintain">Mantener peso</option>
                    <option value="gain_weight">Ganar peso</option>
                    <option value="gain_muscle">Ganar músculo</option>
                    <option value="improve_endurance">Mejorar resistencia</option>
                  </select>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6">
                <button
                  type="button"
                  onClick={handleEditToggle}
                  disabled={isSaving}
                  className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full sm:w-auto px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    'Guardar cambios'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <BottomNavbar />
    </div>
  );
};

export default Profile;