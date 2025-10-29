import React from 'react';

interface LogoutButtonProps {
  onLogout: () => void;
  isLoggingOut: boolean;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ onLogout, isLoggingOut }) => {
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl p-4 sm:p-6 border border-white/50">
      <button
        onClick={onLogout}
        disabled={isLoggingOut}
        className="w-full group flex items-center justify-between p-4 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-xl hover:-translate-y-1 border border-red-200"
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
  );
};

export default LogoutButton;
