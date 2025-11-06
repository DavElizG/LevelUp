import React, { useState, useEffect } from 'react';
import { Moon, Sun, Globe, Bell, Lock, HelpCircle, Info, ChevronRight, Contrast } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../app/providers/useTheme';
import type { ThemeMode } from '../../../app/providers/ThemeProvider';
import { cn, themeText } from '../../../shared/utils/themeUtils';

const SettingsSection: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { i18n, t } = useTranslation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications') !== 'false';
    setNotificationsEnabled(savedNotifications);
  }, []);

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
  };

  const getThemeIcon = () => {
    switch(theme) {
      case 'light': return <Sun className="w-5 h-5 text-white" />;
      case 'dark': return <Moon className="w-5 h-5 text-white" />;
      case 'high-contrast': return <Contrast className="w-5 h-5 text-white" />;
    }
  };

  const getThemeLabel = () => {
    switch(theme) {
      case 'light': return 'Modo Claro';
      case 'dark': return 'Modo Oscuro';
      case 'high-contrast': return 'Alto Contraste';
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    i18n.changeLanguage(newLanguage);
  };

  const getLanguageName = (lang: string): string => {
    const languageNames: Record<string, string> = {
      es: 'Español',
      en: 'English',
      fr: 'Français',
      pt: 'Português'
    };
    return languageNames[lang] || 'Español';
  };

  const handleNotificationsToggle = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    localStorage.setItem('notifications', String(newValue));
  };

  return (
    <div className={cn(
      "backdrop-blur-md rounded-3xl shadow-xl p-4 sm:p-6 mb-6 border",
      "bg-white/70 border-white/50",
      "dark:bg-gray-800/70 dark:border-gray-700/50",
      "high-contrast:bg-black/70 high-contrast:border-white/50 high-contrast:border-2"
    )}>
      <h3 className={cn(
        "text-base sm:text-lg font-semibold mb-6 flex items-center bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text",
        "dark:from-gray-200 dark:to-gray-400",
        "high-contrast:from-white high-contrast:to-white high-contrast:text-white"
      )}>
        <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-700 rounded-2xl flex items-center justify-center mr-3 shadow-lg">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
          </svg>
        </div>
        Configuración
      </h3>
      
      <div className="space-y-3">
        {/* Theme Toggle */}
        <div className={cn(
          "group backdrop-blur-sm rounded-2xl p-4 border transition-all duration-300 hover:shadow-lg",
          "bg-white/80 border-gray-100 hover:border-purple-200",
          "dark:bg-gray-900/50 dark:border-gray-700 dark:hover:border-purple-700",
          "high-contrast:bg-black/50 high-contrast:border-white/30 high-contrast:hover:border-purple-500 high-contrast:border-2"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                {getThemeIcon()}
              </div>
              <div>
                <h4 className={cn("text-sm font-semibold", themeText.primary)}>Tema de la Aplicación</h4>
                <p className={cn("text-xs", themeText.muted)}>{getThemeLabel()}</p>
              </div>
            </div>
            <div className={cn(
              "flex rounded-xl p-1 space-x-1",
              "bg-gray-100 dark:bg-gray-800 high-contrast:bg-black high-contrast:border high-contrast:border-white/30"
            )}>
              <button
                onClick={() => handleThemeChange('light')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                  theme === 'light' 
                    ? 'bg-white text-purple-600 shadow-md dark:bg-gray-700 dark:text-purple-400 high-contrast:bg-white high-contrast:text-black' 
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 high-contrast:text-white'
                }`}
                title="Modo Claro"
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                  theme === 'dark' 
                    ? 'bg-white text-purple-600 shadow-md dark:bg-gray-700 dark:text-purple-400 high-contrast:bg-white high-contrast:text-black' 
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 high-contrast:text-white'
                }`}
                title="Modo Oscuro"
              >
                <Moon className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleThemeChange('high-contrast')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                  theme === 'high-contrast' 
                    ? 'bg-white text-purple-600 shadow-md dark:bg-gray-700 dark:text-purple-400 high-contrast:bg-white high-contrast:text-black' 
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 high-contrast:text-white'
                }`}
                title="Alto Contraste (Accesibilidad)"
              >
                <Contrast className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Language Selector */}
        <div className={cn(
          "group backdrop-blur-sm rounded-2xl p-4 border transition-all duration-300 hover:shadow-lg",
          "bg-white/80 border-gray-100 hover:border-blue-200",
          "dark:bg-gray-900/50 dark:border-gray-700 dark:hover:border-blue-700",
          "high-contrast:bg-black/50 high-contrast:border-white/30 high-contrast:hover:border-blue-500 high-contrast:border-2"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className={cn("text-sm font-semibold", themeText.primary)}>{t('profile.language')}</h4>
                <p className={cn("text-xs", themeText.muted)}>{getLanguageName(i18n.language)}</p>
              </div>
            </div>
            <select
              value={i18n.language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium border-none focus:ring-2 focus:ring-blue-400 transition-all duration-300",
                "bg-gray-100 text-gray-700",
                "dark:bg-gray-800 dark:text-gray-200",
                "high-contrast:bg-black high-contrast:text-white high-contrast:border high-contrast:border-white/30"
              )}
            >
              <option value="es">🇪🇸 Español</option>
              <option value="en">🇺🇸 English</option>
              <option value="fr">🇫🇷 Français</option>
              <option value="pt">🇧🇷 Português</option>
            </select>
          </div>
        </div>

        {/* Notifications Toggle */}
        <div className={cn(
          "group backdrop-blur-sm rounded-2xl p-4 border transition-all duration-300 hover:shadow-lg",
          "bg-white/80 border-gray-100 hover:border-orange-200",
          "dark:bg-gray-900/50 dark:border-gray-700 dark:hover:border-orange-700",
          "high-contrast:bg-black/50 high-contrast:border-white/30 high-contrast:hover:border-orange-500 high-contrast:border-2"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className={cn("text-sm font-semibold", themeText.primary)}>Notificaciones</h4>
                <p className={cn("text-xs", themeText.muted)}>{notificationsEnabled ? 'Activadas' : 'Desactivadas'}</p>
              </div>
            </div>
            <button
              onClick={handleNotificationsToggle}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ${
                notificationsEnabled ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gray-300 dark:bg-gray-700 high-contrast:bg-gray-800'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                  notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Privacy Settings */}
        <button className="w-full group bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 hover:border-indigo-200 transition-all duration-300 hover:shadow-lg text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Privacidad y Seguridad</h4>
                <p className="text-xs text-gray-500">Gestiona tus datos y seguridad</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </button>

        {/* Help & Support */}
        <button className="w-full group bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 hover:border-green-200 transition-all duration-300 hover:shadow-lg text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Ayuda y Soporte</h4>
                <p className="text-xs text-gray-500">Centro de ayuda y preguntas frecuentes</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </button>

        {/* About */}
        <button className="w-full group bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 hover:border-gray-300 transition-all duration-300 hover:shadow-lg text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-700 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                <Info className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Acerca de LevelUp</h4>
                <p className="text-xs text-gray-500">Versión 1.0.0</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default SettingsSection;
