import React from 'react';

interface ProfileFormData {
  name: string;
  lastname1: string;
  lastname2: string;
  age: number | string;
  gender: string;
  current_weight_kg: number | string;
  height_cm: number | string;
  fitness_goal: string;
}

interface PersonalInfoFormProps {
  formData: ProfileFormData;
  isSaving: boolean;
  onInputChange: (field: keyof ProfileFormData, value: string | number) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  formData,
  isSaving,
  onInputChange,
  onSubmit,
  onCancel
}) => {
  return (
    <form onSubmit={onSubmit} className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl p-4 sm:p-6 border border-white/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-0 flex items-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mr-3 shadow-lg">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
          </div>
          Editar Información
        </h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <div className="group">
          <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></span>
            Nombre *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            placeholder="Tu nombre"
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200 text-sm sm:text-base group-hover:border-gray-300"
            required
          />
        </div>
        
        <div className="group">
          <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></span>
            Primer Apellido *
          </label>
          <input
            type="text"
            value={formData.lastname1}
            onChange={(e) => onInputChange('lastname1', e.target.value)}
            placeholder="Primer apellido"
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200 text-sm sm:text-base group-hover:border-gray-300"
            required
          />
        </div>
        
        <div className="group">
          <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
            Segundo Apellido
          </label>
          <input
            type="text"
            value={formData.lastname2}
            onChange={(e) => onInputChange('lastname2', e.target.value)}
            placeholder="Segundo apellido (opcional)"
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200 text-sm sm:text-base group-hover:border-gray-300"
          />
        </div>
        
        <div className="group">
          <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
            Edad *
          </label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => onInputChange('age', parseInt(e.target.value) || '')}
            placeholder="Tu edad"
            min="13"
            max="120"
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-sm sm:text-base group-hover:border-gray-300"
            required
          />
        </div>
        
        <div className="group">
          <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center">
            <span className="w-1.5 h-1.5 bg-pink-500 rounded-full mr-2"></span>
            Género *
          </label>
          <select 
            value={formData.gender}
            onChange={(e) => onInputChange('gender', e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all duration-200 text-sm sm:text-base group-hover:border-gray-300"
            required
          >
            <option value="">Seleccionar</option>
            <option value="male">Masculino</option>
            <option value="female">Femenino</option>
          </select>
        </div>
        
        <div className="group">
          <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
            Peso (kg) *
          </label>
          <input
            type="number"
            value={formData.current_weight_kg}
            onChange={(e) => onInputChange('current_weight_kg', parseFloat(e.target.value) || '')}
            placeholder="Tu peso en kg"
            min="30"
            max="300"
            step="0.1"
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-sm sm:text-base group-hover:border-gray-300"
            required
          />
        </div>
        
        <div className="group">
          <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
            Altura (cm) *
          </label>
          <input
            type="number"
            value={formData.height_cm}
            onChange={(e) => onInputChange('height_cm', parseInt(e.target.value) || '')}
            placeholder="Tu altura en cm"
            min="100"
            max="250"
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-200 text-sm sm:text-base group-hover:border-gray-300"
            required
          />
        </div>
        
        <div className="group">
          <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
            Objetivo de fitness *
          </label>
          <select 
            value={formData.fitness_goal}
            onChange={(e) => onInputChange('fitness_goal', e.target.value)}
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
          onClick={onCancel}
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
  );
};

export default PersonalInfoForm;
