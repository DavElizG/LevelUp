import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import BottomNavbar from '../../components/shared/BottomNavbar';

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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 flex items-center justify-center pb-24">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-orange-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-orange-500 animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 pb-24">
      <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-4xl mx-auto">
        {/* Header with Gradient */}
        <div className="mb-6 sm:mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 rounded-3xl"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="relative p-6 sm:p-8 text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 backdrop-blur-sm rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 drop-shadow-lg">Mi Perfil</h1>
            <p className="text-white/90 text-sm sm:text-base">Gestiona tu información personal y preferencias</p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 sm:mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm animate-pulse">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              </div>
              <p className="text-red-700 text-sm sm:text-base font-medium">{error}</p>
            </div>
          </div>
        )}
        
        {successMessage && (
          <div className="mb-4 sm:mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg shadow-sm animate-pulse">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
              <p className="text-green-700 text-sm sm:text-base font-medium">{successMessage}</p>
            </div>
          </div>
        )}

        {!isEditing ? (
          <div>
            {/* View Mode */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-0 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  Información Personal
                </h3>
                <button
                  onClick={handleEditToggle}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white rounded-lg transition-all duration-300 text-sm sm:text-base font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                  Editar Perfil
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="group bg-gradient-to-br from-orange-50 to-white rounded-xl p-3 sm:p-4 border-2 border-orange-100 hover:border-orange-300 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center mr-2">
                      <svg className="w-3 h-3 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"/>
                      </svg>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 font-medium">Nombre Completo</div>
                  </div>
                  <div className="font-semibold text-sm sm:text-base text-gray-900">
                    {formData.name && formData.lastname1 
                      ? `${formData.name} ${formData.lastname1} ${formData.lastname2 || ''}`.trim()
                      : 'No especificado'
                    }
                  </div>
                </div>
                
                <div className="group bg-gradient-to-br from-blue-50 to-white rounded-xl p-3 sm:p-4 border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                      <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                      </svg>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 font-medium">Edad</div>
                  </div>
                  <div className="font-semibold text-sm sm:text-base text-gray-900">{formatAge()}</div>
                </div>
                
                <div className="group bg-gradient-to-br from-purple-50 to-white rounded-xl p-3 sm:p-4 border-2 border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-2">
                      <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
                      </svg>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 font-medium">Año de Nacimiento</div>
                  </div>
                  <div className="font-semibold text-sm sm:text-base text-gray-900">{formatBirthDate()}</div>
                </div>
                
                <div className="group bg-gradient-to-br from-pink-50 to-white rounded-xl p-3 sm:p-4 border-2 border-pink-100 hover:border-pink-300 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-pink-100 rounded-lg flex items-center justify-center mr-2">
                      <svg className="w-3 h-3 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                      </svg>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 font-medium">Género</div>
                  </div>
                  <div className="font-semibold text-sm sm:text-base text-gray-900">{formatGender()}</div>
                </div>
                
                <div className="group bg-gradient-to-br from-green-50 to-white rounded-xl p-3 sm:p-4 border-2 border-green-100 hover:border-green-300 transition-all duration-300 hover:shadow-md sm:col-span-2">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-2">
                      <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 font-medium">Email</div>
                  </div>
                  <div className="font-semibold text-sm sm:text-base text-gray-900 truncate">{user?.email}</div>
                </div>
              </div>
            </div>

            {/* Physical Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
                  </svg>
                </div>
                Estadísticas Físicas
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative overflow-hidden group bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 rounded-xl p-4 sm:p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200/30 rounded-full blur-2xl"></div>
                  <div className="relative flex items-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-blue-700 font-medium mb-1">Peso Actual</div>
                      <div className="text-xl sm:text-2xl font-bold text-blue-900">{formatWeight()}</div>
                    </div>
                  </div>
                </div>
                
                <div className="relative overflow-hidden group bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 rounded-xl p-4 sm:p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-green-200/30 rounded-full blur-2xl"></div>
                  <div className="relative flex items-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V9H1v11h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-green-700 font-medium mb-1">Altura</div>
                      <div className="text-xl sm:text-2xl font-bold text-green-900">{formatHeight()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fitness Goal */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                Objetivo de Fitness
              </h3>
              
              <div className="relative overflow-hidden group bg-gradient-to-br from-orange-50 via-pink-50 to-purple-100 rounded-xl p-5 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/30 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-200/30 rounded-full blur-2xl"></div>
                
                <div className="relative flex items-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 sm:mr-5 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs sm:text-sm text-purple-700 font-medium mb-1">Mi Meta</div>
                    <div className="text-lg sm:text-xl font-bold text-purple-900 mb-2">{formatGoal()}</div>
                    <div className="flex items-center text-xs text-purple-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                      Objetivo activo
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings & Logout */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
                  </svg>
                </div>
                Configuración
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full group flex items-center justify-between p-4 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-md group-hover:scale-110 transition-transform duration-300">
                      {isLoggingOut ? (
                        <div className="relative w-5 h-5 sm:w-6 sm:h-6">
                          <div className="absolute inset-0 rounded-full border-2 border-white/30"></div>
                          <div className="absolute inset-0 rounded-full border-2 border-t-white animate-spin"></div>
                        </div>
                      ) : (
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                        </svg>
                      )}
                    </div>
                    <div className="text-left">
                      <div className="text-sm sm:text-base font-semibold text-red-700">
                        {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
                      </div>
                      <div className="text-xs sm:text-sm text-red-600">Salir de la aplicación</div>
                    </div>
                  </div>
                  <div className="text-red-400 group-hover:translate-x-1 transition-transform duration-300">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
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
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-0 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                  </div>
                  Editar Información
                </h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></span>
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200 text-sm sm:text-base group-hover:border-gray-300"
                    required
                  />
                </div>
                
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></span>
                    Primer Apellido *
                  </label>
                  <input
                    type="text"
                    value={formData.lastname1}
                    onChange={(e) => handleInputChange('lastname1', e.target.value)}
                    placeholder="Primer apellido"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200 text-sm sm:text-base group-hover:border-gray-300"
                    required
                  />
                </div>
                
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                    Segundo Apellido
                  </label>
                  <input
                    type="text"
                    value={formData.lastname2}
                    onChange={(e) => handleInputChange('lastname2', e.target.value)}
                    placeholder="Segundo apellido (opcional)"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200 text-sm sm:text-base group-hover:border-gray-300"
                  />
                </div>
                
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                    Edad *
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', parseInt(e.target.value) || '')}
                    placeholder="Tu edad"
                    min="13"
                    max="120"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-sm sm:text-base group-hover:border-gray-300"
                    required
                  />
                </div>
                
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <span className="w-1.5 h-1.5 bg-pink-500 rounded-full mr-2"></span>
                    Género *
                  </label>
                  <select 
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all duration-200 text-sm sm:text-base group-hover:border-gray-300"
                    required
                  >
                    <option value="">Seleccionar</option>
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                  </select>
                </div>
                
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
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
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-sm sm:text-base group-hover:border-gray-300"
                    required
                  />
                </div>
                
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                    Altura (cm) *
                  </label>
                  <input
                    type="number"
                    value={formData.height_cm}
                    onChange={(e) => handleInputChange('height_cm', parseInt(e.target.value) || '')}
                    placeholder="Tu altura en cm"
                    min="100"
                    max="250"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-200 text-sm sm:text-base group-hover:border-gray-300"
                    required
                  />
                </div>
                
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                    Objetivo de fitness *
                  </label>
                  <select 
                    value={formData.fitness_goal}
                    onChange={(e) => handleInputChange('fitness_goal', e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 text-sm sm:text-base group-hover:border-gray-300"
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
              
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t-2 border-gray-100">
                <button
                  type="button"
                  onClick={handleEditToggle}
                  disabled={isSaving}
                  className="w-full sm:w-auto px-6 py-2.5 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base shadow-sm hover:shadow-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full sm:w-auto px-8 py-2.5 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:from-orange-600 hover:via-pink-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  {isSaving ? (
                    <>
                      <div className="relative w-5 h-5 mr-2">
                        <div className="absolute inset-0 rounded-full border-2 border-white/30"></div>
                        <div className="absolute inset-0 rounded-full border-2 border-t-white animate-spin"></div>
                      </div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                      </svg>
                      Guardar cambios
                    </>
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