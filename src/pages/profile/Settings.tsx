import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Crown, Shield, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import LanguageSelector from '../../components/shared/LanguageSelector';

const Settings: React.FC = () => {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Get user subscription
  const { data: subscription } = useQuery({
    queryKey: ['user-subscription'],
    queryFn: async () => {
      if (!supabase) return null;
      const { data, error } = await supabase.rpc('get_user_subscription').single();
      if (error) return null;
      return data as { plan: string } | null;
    },
  });

  // Check if user is admin
  const { data: isAdmin } = useQuery({
    queryKey: ['is-admin'],
    queryFn: async () => {
      if (!supabase) return false;
      const { data, error } = await supabase.rpc('is_admin');
      if (error) return false;
      return data === true;
    },
  });

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

        {/* Trash Bin */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Papelera de Reciclaje</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div>
                <h4 className="font-medium text-gray-900">Elementos Eliminados</h4>
                <p className="text-sm text-gray-500">Ver y restaurar rutinas y dietas eliminadas</p>
              </div>
              <button
                onClick={() => navigate('/profile/trash')}
                className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 transition-colors"
              >
                Ver Papelera
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg shadow border-2 border-orange-200 dark:border-orange-800 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Suscripción</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                Plan actual: <span className="font-bold text-orange-600 dark:text-orange-400 capitalize">{subscription?.plan || 'Free'}</span>
              </p>
              <button
                onClick={() => navigate('/subscription')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Crown className="w-4 h-4" />
                Mejorar Plan
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Admin Access */}
        {isAdmin && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg shadow border-2 border-blue-200 dark:border-blue-800 p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Panel de Administrador</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  Accede al panel de administración para gestionar usuarios, contenido y configuraciones del sistema.
                </p>
                <button
                  onClick={() => navigate('/admin')}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <Shield className="w-4 h-4" />
                  Ir al Panel Admin
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

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