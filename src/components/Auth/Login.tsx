import React, { useState } from 'react';
import { User, Lock, Facebook, Twitter } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import AuthLayout from './AuthLayout';

interface LoginProps {
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const { signIn, signInWithProvider, resetPassword, loading, error } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await signIn(formData.email, formData.password);
    if (result.success) {
      console.log('Login successful!');
      // Navigation will be handled by the auth state change
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'twitter') => {
    const result = await signInWithProvider(provider);
    if (result.success) {
      console.log(`Social login with ${provider} initiated`);
    }
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      alert('Por favor ingresa tu email primero');
      return;
    }

    const result = await resetPassword(formData.email);
    if (result.success) {
      setResetMessage('Te hemos enviado un enlace para restablecer tu contraseña. Revisa tu email.');
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Success Message */}
        {resetMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p className="text-green-600 text-sm">{resetMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Email Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email"
            className="w-full pl-10 pr-4 py-3 bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors"
            required
          />
        </div>

        {/* Password Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Password"
            className="w-full pl-10 pr-4 py-3 bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors"
            required
          />
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Iniciando...' : 'Iniciar sesión'}
        </button>

        {/* Social Login Section */}
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-4">inicia sesión con</p>
          
          <div className="flex justify-center space-x-4">
            <button
              type="button"
              onClick={() => handleSocialLogin('facebook')}
              disabled={loading}
              className="w-12 h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <Facebook className="h-5 w-5" />
            </button>
            
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
              className="w-12 h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <span className="font-bold text-lg">G+</span>
            </button>
            
            <button
              type="button"
              onClick={() => handleSocialLogin('twitter')}
              disabled={loading}
              className="w-12 h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <Twitter className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Forgot Password Link */}
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={loading || !formData.email}
            className="text-blue-500 hover:text-blue-600 text-sm underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ¿Olvidaste tu contraseña?
          </button>
          {!formData.email && (
            <p className="text-gray-400 text-xs mt-1">
              Ingresa tu email primero
            </p>
          )}
        </div>

        {/* Switch to Register */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            ¿No tienes una cuenta?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-blue-500 hover:text-blue-600 underline transition-colors"
            >
              Regístrate
            </button>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;