import React, { useState } from 'react';
import { AlertCircle, Mail, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import AuthLayout from './AuthLayout';

interface ResetPasswordErrorProps {
  onBackToLogin: () => void;
  errorType?: 'expired' | 'invalid' | 'access_denied';
}

const ResetPasswordError: React.FC<ResetPasswordErrorProps> = ({ 
  onBackToLogin, 
  errorType = 'expired' 
}) => {
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const { resetPassword } = useAuth();

  const getErrorMessage = () => {
    switch (errorType) {
      case 'expired':
        return {
          title: 'Enlace expirado',
          description: 'El enlace para restablecer tu contraseña ha expirado. Los enlaces de restablecimiento son válidos por 1 hora por seguridad.'
        };
      case 'invalid':
        return {
          title: 'Enlace inválido',
          description: 'El enlace para restablecer tu contraseña no es válido o ya fue utilizado.'
        };
      case 'access_denied':
        return {
          title: 'Acceso denegado',
          description: 'No tienes permisos para acceder a esta página de restablecimiento de contraseña.'
        };
      default:
        return {
          title: 'Error de enlace',
          description: 'Hubo un problema con el enlace de restablecimiento de contraseña.'
        };
    }
  };

  const handleResendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setResendError('Por favor ingresa tu email');
      return;
    }

    setIsResending(true);
    setResendError(null);
    
    const result = await resetPassword(email);
    
    if (result.success) {
      setResendSuccess(true);
      setEmail('');
    } else {
      setResendError(result.error || 'Error enviando el email de restablecimiento');
    }
    
    setIsResending(false);
  };

  const errorInfo = getErrorMessage();

  if (resendSuccess) {
    return (
      <AuthLayout>
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-green-500" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Email enviado!
            </h2>
            <p className="text-gray-600 mb-4">
              Te hemos enviado un nuevo enlace para restablecer tu contraseña.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Revisa tu bandeja de entrada y también la carpeta de spam. El enlace será válido por 1 hora.
            </p>
          </div>

          <button
            onClick={onBackToLogin}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-full transition-colors"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Error Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {errorInfo.title}
          </h2>
          <p className="text-gray-600">
            {errorInfo.description}
          </p>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-blue-800 font-medium text-sm mb-1">
                Sobre la seguridad de los enlaces
              </h3>
              <p className="text-blue-700 text-sm">
                Los enlaces de restablecimiento expiran después de 1 hora por tu seguridad. 
                Esto previene el acceso no autorizado a tu cuenta.
              </p>
            </div>
          </div>
        </div>

        {/* Resend Form */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Solicitar nuevo enlace
          </h3>
          
          <form onSubmit={handleResendReset} className="space-y-4">
            {resendError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{resendError}</p>
              </div>
            )}

            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingresa tu email"
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isResending}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? 'Enviando...' : 'Enviar nuevo enlace'}
            </button>
          </form>
        </div>

        {/* Tips Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Consejos útiles:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Revisa tu carpeta de spam o correo no deseado</li>
            <li>• Asegúrate de usar el enlace más reciente</li>
            <li>• Los enlaces expiran después de 1 hora</li>
            <li>• Cada enlace solo puede usarse una vez</li>
          </ul>
        </div>

        {/* Back to Login */}
        <div className="text-center pt-4 border-t">
          <button
            onClick={onBackToLogin}
            className="text-blue-500 hover:text-blue-600 text-sm underline transition-colors"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ResetPasswordError;