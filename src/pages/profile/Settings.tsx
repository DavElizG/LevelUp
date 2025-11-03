import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../../components/shared/LanguageSelector';

const Settings: React.FC = () => {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t('profile.settings')}</h1>
          <p className="text-gray-600">{t('profile.customizeExperience')}</p>
        </div>

        {/* Language Settings */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('profile.language')}</h3>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">{t('profile.appLanguage')}</h4>
              <p className="text-sm text-gray-500">{t('profile.changeInterfaceLanguage')}</p>
            </div>
            <LanguageSelector />
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('profile.account')}</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <h4 className="font-medium text-gray-900">{t('profile.accountEmail')}</h4>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
              <button className="text-orange-500 hover:text-orange-600 transition-colors">
                {t('profile.changeEmail')}
              </button>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <h4 className="font-medium text-gray-900">{t('profile.password')}</h4>
                <p className="text-sm text-gray-500">{t('profile.lastUpdated')}</p>
              </div>
              <button className="text-orange-500 hover:text-orange-600 transition-colors">
                {t('profile.changeEmail')}
              </button>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div>
                <h4 className="font-medium text-gray-900">{t('profile.twoFactorAuth')}</h4>
                <p className="text-sm text-gray-500">{t('profile.addExtraSecurity')}</p>
              </div>
              <button className="text-orange-500 hover:text-orange-600 transition-colors">
                {t('profile.configure')}
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('profile.notifications')}</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{t('profile.workoutReminders')}</h4>
                <p className="text-sm text-gray-500">{t('profile.workoutRemindersDesc')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{t('profile.mealReminders')}</h4>
                <p className="text-sm text-gray-500">{t('profile.mealRemindersDesc')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{t('profile.achievementsGoals')}</h4>
                <p className="text-sm text-gray-500">{t('profile.achievementsGoalsDesc')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('profile.privacy')}</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{t('profile.publicProfile')}</h4>
                <p className="text-sm text-gray-500">{t('profile.publicProfileDesc')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{t('profile.shareStats')}</h4>
                <p className="text-sm text-gray-500">{t('profile.shareStatsDesc')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('profile.about')}</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-700">{t('profile.appVersion')}</span>
              <span className="text-gray-500">1.0.0</span>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-700">{t('profile.termsOfService')}</span>
              <button className="text-orange-500 hover:text-orange-600 transition-colors">
                {t('common.view')}
              </button>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-700">{t('profile.privacyPolicy')}</span>
              <button className="text-orange-500 hover:text-orange-600 transition-colors">
                {t('common.view')}
              </button>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-700">{t('profile.support')}</span>
              <button className="text-orange-500 hover:text-orange-600 transition-colors">
                {t('profile.contact')}
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <h3 className="text-lg font-medium text-red-900 mb-4">{t('profile.dangerZone')}</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-red-900">{t('profile.signOut')}</h4>
                <p className="text-sm text-red-700">{t('profile.signOutDesc')}</p>
              </div>
              <button 
                onClick={handleSignOut}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {t('profile.signOut')}
              </button>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-red-200">
              <div>
                <h4 className="font-medium text-red-900">{t('profile.deleteAccount')}</h4>
                <p className="text-sm text-red-700">{t('profile.deleteAccountDesc')}</p>
              </div>
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                {t('profile.deleteAccount')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;