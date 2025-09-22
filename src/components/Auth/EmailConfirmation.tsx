import React, { useState } from 'react';
import { Mail, RefreshCw, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import AuthLayout from './AuthLayout';

interface EmailConfirmationProps {
  email: string;
  onBackToLogin: () => void;
}

const EmailConfirmation: React.FC<EmailConfirmationProps> = ({ email, onBackToLogin }) => {
  const [resendCount, setResendCount] = useState(0);
  const [lastResendTime, setLastResendTime] = useState<Date | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { resendConfirmation, loading, error } = useAuth();

  const canResend = () => {
    if (!lastResendTime) return true;
    const timeDiff = Date.now() - lastResendTime.getTime();
    return timeDiff > 60000; // 1 minute cooldown
  };

  const getNextResendTime = () => {
    if (!lastResendTime) return 0;
    const timeDiff = Date.now() - lastResendTime.getTime();
    const remaining = Math.max(0, 60000 - timeDiff);
    return Math.ceil(remaining / 1000);
  };

  const handleResendConfirmation = async () => {
    if (!canResend()) return;

    const result = await resendConfirmation(email);
    if (result.success) {
      setResendCount(prev => prev + 1);
      setLastResendTime(new Date());
      setSuccessMessage('¡Correo de confirmación reenviado! Revisa tu bandeja de entrada.');
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  const [countdown, setCountdown] = useState(getNextResendTime());

  React.useEffect(() => {
    if (!canResend()) {
      const timer = setInterval(() => {
        const remaining = getNextResendTime();
        setCountdown(remaining);
        if (remaining === 0) {
          clearInterval(timer);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lastResendTime]);

  return (
    <AuthLayout>
      <div className="text-center space-y-6">
        {/* Email Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Confirma tu email
          </h2>
          <p className="text-gray-600 text-sm">
            Te hemos enviado un enlace de confirmación a:
          </p>
          <p className="text-orange-600 font-medium mt-1">
            {email}
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-700 text-sm mb-3">
            Para completar tu registro:
          </p>
          <ol className="text-gray-600 text-sm space-y-1 text-left">
            <li>1. Revisa tu bandeja de entrada</li>
            <li>2. Busca el email de LevelUp</li>
            <li>3. Haz clic en el enlace de confirmación</li>
            <li>4. Regresa aquí para continuar</li>
          </ol>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-600 text-sm">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Resend Button */}
        <div className="space-y-3">
          <p className="text-gray-500 text-sm">
            ¿No recibiste el email?
          </p>
          
          {canResend() ? (
            <button
              onClick={handleResendConfirmation}
              disabled={loading}
              className="flex items-center justify-center space-x-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span>
                {loading ? 'Reenviando...' : resendCount > 0 ? 'Reenviar nuevamente' : 'Reenviar confirmación'}
              </span>
            </button>
          ) : (
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">
                Podrás reenviar el email en:
              </p>
              <div className="bg-gray-100 rounded-full py-2 px-4 inline-block">
                <span className="text-orange-600 font-medium">
                  {countdown}s
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Resend Count */}
        {resendCount > 0 && (
          <p className="text-gray-400 text-xs">
            Emails enviados: {resendCount}
          </p>
        )}

        {/* Help Text */}
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-blue-700 text-sm">
            💡 <strong>Consejo:</strong> Si no encuentras el email, revisa tu carpeta de spam o correo no deseado.
          </p>
        </div>

        {/* Back to Login */}
        <button
          onClick={onBackToLogin}
          className="flex items-center justify-center space-x-2 w-full text-gray-600 hover:text-gray-800 py-2 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al inicio de sesión</span>
        </button>
      </div>
    </AuthLayout>
  );
};

export default EmailConfirmation;