import React, { useState } from 'react';
import { Mail, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import AuthLayout from './AuthLayout';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const { resetPassword, loading, error } = useAuth();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({});

    // Validate email
    if (!email) {
      setErrors({ email: 'El correo electrónico es requerido' });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: 'Por favor ingresa un correo electrónico válido' });
      return;
    }

    const result = await resetPassword(email);
    
    if (result.success) {
      setSuccess(true);
      // Auto redirect to login after 5 seconds
      setTimeout(() => {
        onBackToLogin();
      }, 5000);
    } else if (result.error) {
      setErrors({ email: result.error });
    }
  };

  // Success state
  if (success) {
    return (
      <AuthLayout>
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="h-8 w-8 text-green-500" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Correo enviado!
            </h2>
            <p className="text-gray-600 mb-4">
              Hemos enviado un enlace de recuperación a:
            </p>
            <p className="text-orange-600 font-medium mb-4">
              {email}
            </p>
            <p className="text-sm text-gray-500">
              Por favor revisa tu bandeja de entrada y haz clic en el enlace para restablecer tu contraseña.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Si no ves el correo, revisa tu carpeta de spam.
            </p>
          </div>

          <button
            onClick={onBackToLogin}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-full transition-colors"
          >
            Volver al inicio de sesión
          </button>

          <p className="text-xs text-gray-500">
            Serás redirigido automáticamente en 5 segundos...
          </p>
        </div>
      </AuthLayout>
    );
  }

  // Form state
  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¿Olvidaste tu contraseña?
          </h2>
          <p className="text-gray-600">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors({});
                  }
                }}
                className={`block w-full pl-10 pr-3 py-3 border ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                placeholder="tu@email.com"
              />
            </div>
            {errors.email && (
              <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.email}</span>
              </div>
            )}
          </div>

          {/* General error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-full transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </span>
            ) : (
              'Enviar enlace de recuperación'
            )}
          </button>

          {/* Back to login */}
          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full flex items-center justify-center gap-2 text-orange-600 hover:text-orange-700 font-medium py-2 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Volver al inicio de sesión
          </button>
        </form>

        {/* Additional info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> El enlace de recuperación expira en 1 hora por motivos de seguridad.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
