import React from 'react';
import logoImage from '../../assets/image.png';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src={logoImage} 
            alt="LevelUp Logo" 
            className="w-32 h-32 object-contain"
          />
        </div>
        
        {/* Tagline */}
        <div className="text-center mb-8">
          <h1 className="text-lg font-medium text-gray-800">
            Fitness y nutrición en tu bolsillo
          </h1>
        </div>
        
        {/* Auth Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;