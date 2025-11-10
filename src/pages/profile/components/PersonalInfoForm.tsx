import React from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  
  return (
    <form onSubmit={onSubmit} className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl p-4 sm:p-6 border border-white/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-0 flex items-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mr-3 shadow-lg">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
          </div>
          {t('profile.editInfo')}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <div className="group">
          <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></span>
            {t('profile.name')} *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            placeholder={t('profile.yourName')}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200 text-sm sm:text-base group-hover:border-gray-300"
            required
          />
        </div>
        
        <div className="group">
          <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></span>
            {t('profile.firstName')} *
          </label>
          <input
            type="text"
            value={formData.lastname1}
            onChange={(e) => onInputChange('lastname1', e.target.value)}
            placeholder={t('profile.firstLastname')}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200 text-sm sm:text-base group-hover:border-gray-300"
            required
          />
        </div>
        
        <div className="group">
          <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
            {t('profile.secondName')}
          </label>
          <input
            type="text"
            value={formData.lastname2}
            onChange={(e) => onInputChange('lastname2', e.target.value)}
            placeholder={t('profile.secondLastname')}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200 text-sm sm:text-base group-hover:border-gray-300"
          />
        </div>
        
        <div className="group">
          <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
            {t('profile.age')} *
          </label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => onInputChange('age', parseInt(e.target.value) || '')}
            placeholder={t('profile.age')}
            min="13"
            max="120"
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-sm sm:text-base group-hover:border-gray-300"
            required
          />
        </div>
        
        <div className="group">
          <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center">
            <span className="w-1.5 h-1.5 bg-pink-500 rounded-full mr-2"></span>
            {t('profile.gender')} *
          </label>
          <select 
            value={formData.gender}
            onChange={(e) => onInputChange('gender', e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all duration-200 text-sm sm:text-base group-hover:border-gray-300"
            required
          >
            <option value="">{t('common.select')}</option>
            <option value="male">{t('setup.male')}</option>
            <option value="female">{t('setup.female')}</option>
          </select>
        </div>
        
        <div className="group">
          <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
            {t('profile.weight')} ({t('setup.kg')}) *
          </label>
          <input
            type="number"
            value={formData.current_weight_kg}
            onChange={(e) => onInputChange('current_weight_kg', Number.parseFloat(e.target.value) || '')}
            placeholder={t('profile.weight')}
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
            {t('profile.height')} ({t('setup.cm')}) *
          </label>
          <input
            type="number"
            value={formData.height_cm}
            onChange={(e) => onInputChange('height_cm', Number.parseInt(e.target.value) || '')}
            placeholder={t('profile.height')}
            min="100"
            max="250"
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-200 text-sm sm:text-base group-hover:border-gray-300"
            required
          />
        </div>
        
        <div className="group">
          <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
            {t('profile.fitnessGoal')} *
          </label>
          <select 
            value={formData.fitness_goal}
            onChange={(e) => onInputChange('fitness_goal', e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 text-sm sm:text-base group-hover:border-gray-300"
            required
          >
            <option value="">{t('setup.selectGoal')}</option>
            <option value="lose_weight">{t('setup.loseWeight')}</option>
            <option value="maintain">{t('setup.stayFit')}</option>
            <option value="gain_weight">{t('setup.loseWeight')}</option>
            <option value="gain_muscle">{t('setup.gainMuscle')}</option>
            <option value="improve_endurance">{t('workouts.intensity')}</option>
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
          {t('common.cancel')}
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
              {t('common.loading')}
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
              </svg>
              {t('profile.saveChanges')}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default PersonalInfoForm;
