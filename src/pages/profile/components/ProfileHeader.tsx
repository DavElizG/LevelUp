import React from 'react';
import { useTranslation } from 'react-i18next';

const ProfileHeader: React.FC = () => {
  const { t } = useTranslation();
  
  return (
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
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 drop-shadow-lg">{t('profile.myProfile')}</h1>
        <p className="text-white/90 text-sm sm:text-base">{t('profile.personalInfo')}</p>
      </div>
    </div>
  );
};

export default ProfileHeader;

