import React, { useState } from 'react';
import { User, Mail, Lock, Facebook, Twitter } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import AuthLayout from './AuthLayout';

interface RegisterProps {
  onSwitchToLogin: () => void;
  onEmailConfirmationNeeded: (email: string) => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin, onEmailConfirmationNeeded }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signUp, signInWithProvider, loading, error } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await signUp(formData.email, formData.password, formData.username);
    if (result.success) {
      console.log('Registration successful!');
      // Show email confirmation screen
      onEmailConfirmationNeeded(formData.email);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'twitter') => {
    const result = await signInWithProvider(provider);
    if (result.success) {
      console.log(`Social registration with ${provider} initiated`);
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Username Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Usuario"
            className={`w-full pl-10 pr-4 py-3 bg-gray-100 text-gray-900 placeholder:text-gray-500 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors ${
              errors.username ? 'ring-2 ring-red-500' : ''
            }`}
            required
          />
          {errors.username && (
            <p className="text-red-500 text-xs mt-1 ml-3">{errors.username}</p>
          )}
        </div>

        {/* Email Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email"
            className={`w-full pl-10 pr-4 py-3 bg-gray-100 text-gray-900 placeholder:text-gray-500 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors ${
              errors.email ? 'ring-2 ring-red-500' : ''
            }`}
            required
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1 ml-3">{errors.email}</p>
          )}
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
            placeholder="Contraseña"
            className={`w-full pl-10 pr-4 py-3 bg-gray-100 text-gray-900 placeholder:text-gray-500 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors ${
              errors.password ? 'ring-2 ring-red-500' : ''
            }`}
            required
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1 ml-3">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirmar contraseña"
            className={`w-full pl-10 pr-4 py-3 bg-gray-100 text-gray-900 placeholder:text-gray-500 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors ${
              errors.confirmPassword ? 'ring-2 ring-red-500' : ''
            }`}
            required
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1 ml-3">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Register Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>

        {/* Social Login Section */}
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-4">Regístrate con</p>
          
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

        {/* Switch to Login */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            ¿Ya tienes una cuenta?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-blue-500 hover:text-blue-600 underline transition-colors"
            >
              Inicia sesión
            </button>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register;