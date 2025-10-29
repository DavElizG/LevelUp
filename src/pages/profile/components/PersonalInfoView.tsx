import React from 'react';

interface PersonalInfoViewProps {
  name: string;
  lastname1: string;
  lastname2: string;
  age: number | string;
  gender: string;
  email: string;
  onEdit: () => void;
}

const PersonalInfoView: React.FC<PersonalInfoViewProps> = ({
  name,
  lastname1,
  lastname2,
  age,
  gender,
  email,
  onEdit
}) => {
  const formatAge = () => {
    if (!age) return 'No especificado';
    return `${age} años`;
  };

  const formatBirthDate = () => {
    if (!age) return 'No especificado';
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - Number(age);
    return `${birthYear}`;
  };

  const formatGender = () => {
    if (!gender) return 'No especificado';
    return gender === 'male' ? 'Masculino' : 'Femenino';
  };

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl p-4 sm:p-6 mb-6 border border-white/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-0 flex items-center bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center mr-3 shadow-lg">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          Información Personal
        </h3>
        <button
          onClick={onEdit}
          className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white rounded-2xl transition-all duration-300 text-sm sm:text-base font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center"
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
          Editar Perfil
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="group bg-gradient-to-br from-orange-50/80 to-white/80 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-orange-100/50 hover:border-orange-300/50 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center mr-2">
              <svg className="w-3 h-3 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"/>
              </svg>
            </div>
            <div className="text-xs sm:text-sm text-gray-500 font-medium">Nombre Completo</div>
          </div>
          <div className="font-semibold text-sm sm:text-base text-gray-900">
            {name && lastname1 
              ? `${name} ${lastname1} ${lastname2 || ''}`.trim()
              : 'No especificado'
            }
          </div>
        </div>
        
        <div className="group bg-gradient-to-br from-blue-50/80 to-white/80 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-blue-100/50 hover:border-blue-300/50 transition-all duration-300 hover:shadow-lg">
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
        
        <div className="group bg-gradient-to-br from-purple-50/80 to-white/80 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-purple-100/50 hover:border-purple-300/50 transition-all duration-300 hover:shadow-lg">
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
        
        <div className="group bg-gradient-to-br from-pink-50/80 to-white/80 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-pink-100/50 hover:border-pink-300/50 transition-all duration-300 hover:shadow-lg">
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
        
        <div className="group bg-gradient-to-br from-green-50/80 to-white/80 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-green-100/50 hover:border-green-300/50 transition-all duration-300 hover:shadow-lg sm:col-span-2">
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-2">
              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </div>
            <div className="text-xs sm:text-sm text-gray-500 font-medium">Email</div>
          </div>
          <div className="font-semibold text-sm sm:text-base text-gray-900 truncate">{email}</div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoView;
