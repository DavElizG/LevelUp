import React, { useState, useEffect } from 'react';
import { Lock, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import AuthLayout from './AuthLayout';

interface ResetPasswordProps {
  onBackToLogin: () => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ onBackToLogin }) => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenError, setTokenError] = useState<string>('');
  const { updatePassword, verifyRecoveryToken, signOutAfterPasswordReset, loading, error } = useAuth();

  useEffect(() => {
    // Extract code (PKCE flow) or access_token (Implicit flow) from URL
    const extractTokenOrCode = (): { type: 'code' | 'token' | null; value: string | null } => {
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = window.location.hash ? new URLSearchParams(window.location.hash.substring(1)) : null;
      
      // Check for PKCE code first
      const code = urlParams.get('code') || hashParams?.get('code');
      if (code) {
        return { type: 'code', value: code };
      }
      
      // Check for implicit flow access_token
      const token = urlParams.get('access_token') || hashParams?.get('access_token');
      if (token) {
        return { type: 'token', value: token };
      }
      
      return { type: null, value: null };
    };

    const validateAndExchangeToken = async () => {
      const { type, value } = extractTokenOrCode();
      
      if (!value) {
        // Check if there's an error in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = window.location.hash ? new URLSearchParams(window.location.hash.substring(1)) : null;
        const errorParam = urlParams.get('error') || hashParams?.get('error');
        const errorDescription = urlParams.get('error_description') || hashParams?.get('error_description');
        
        if (errorParam || errorDescription) {
          setTokenError(errorDescription || 'Error al procesar el enlace de recuperación.');
        } else {
          setTokenError('No se encontró el código de recuperación. El enlace puede ser inválido.');
        }
        setTokenValid(false);
        return;
      }

      // Handle PKCE code exchange
      if (type === 'code') {
        if (!supabase) {
          setTokenError('Error de configuración: cliente de Supabase no disponible.');
          setTokenValid(false);
          return;
        }

        try {
          console.log('🔄 Exchanging PKCE code for session...');
          const { data, error } = await supabase.auth.exchangeCodeForSession(value);
          
          if (error) {
            console.error('❌ Code exchange failed:', error);
            setTokenError(error.message || 'El código de recuperación es inválido o ha expirado.');
            setTokenValid(false);
            return;
          }
          
          if (data?.session) {
            console.log('✅ Code exchange successful, session created');
            setTokenValid(true);
          } else {
            setTokenError('No se pudo crear la sesión de recuperación.');
            setTokenValid(false);
          }
        } catch (err) {
          console.error('❌ Unexpected error during code exchange:', err);
          setTokenError('Error inesperado al procesar el código de recuperación.');
          setTokenValid(false);
        }
        return;
      }

      // Handle implicit flow access_token (legacy)
      if (type === 'token') {
        setTokenValid(true);
        
        // Optionally verify in background but don't block the UI
        verifyRecoveryToken(value).then(result => {
          if (!result.success && result.error) {
            console.warn('Token verification warning:', result.error);
            // Don't block the UI, let user try to update password anyway
          }
        }).catch(err => {
          console.warn('Token verification error:', err);
        });
      }
    };

    validateAndExchangeToken();
  }, [verifyRecoveryToken]);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Debe contener al menos una letra minúscula');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Debe contener al menos una letra mayúscula');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Debe contener al menos un número');
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Debe contener al menos un carácter especial (@$!%*?&)');
    }
    
    return errors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};

    // Validate password
    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      newErrors.password = passwordErrors.join('. ');
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await updatePassword(formData.password);
    if (result.success) {
      setSuccess(true);
      // Auto redirect to login after 3 seconds by signing out the user
      setTimeout(async () => {
        await signOutAfterPasswordReset();
      }, 3000);
    }
  };

  // Loading state while validating token
  if (tokenValid === null) {
    return (
      <AuthLayout>
        <div className="text-center space-y-6">
          <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600">Validando enlace de recuperación...</p>
        </div>
      </AuthLayout>
    );
  }

  // Invalid token state
  if (tokenValid === false) {
    return (
      <AuthLayout>
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Enlace inválido o expirado
            </h2>
            <p className="text-gray-600 mb-4">
              {tokenError}
            </p>
            <p className="text-sm text-gray-500">
              Por favor, solicita un nuevo enlace de recuperación de contraseña.
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

  if (success) {
    return (
      <AuthLayout>
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="h-8 w-8 text-green-500" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Contraseña actualizada!
            </h2>
            <p className="text-gray-600 mb-4">
              Tu contraseña ha sido cambiada exitosamente.
            </p>
            <p className="text-sm text-gray-500 mb-2">
              Por seguridad, necesitarás iniciar sesión nuevamente con tu nueva contraseña.
            </p>
            <p className="text-sm text-gray-500">
              Serás redirigido al inicio de sesión en unos segundos...
            </p>
          </div>

          <button
            onClick={() => signOutAfterPasswordReset()}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-full transition-colors"
          >
            Ir a inicio de sesión
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Restablecer contraseña
          </h2>
          <p className="text-gray-600">
            Ingresa tu nueva contraseña
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* New Password Input */}
          <div className="space-y-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Nueva contraseña"
                className={`w-full pl-10 pr-4 py-3 bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors ${
                  errors.password ? 'ring-2 ring-red-500' : ''
                }`}
                required
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm px-4">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirmar nueva contraseña"
                className={`w-full pl-10 pr-4 py-3 bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors ${
                  errors.confirmPassword ? 'ring-2 ring-red-500' : ''
                }`}
                required
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm px-4">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Password Requirements */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-800 text-sm font-medium mb-2">
              Requisitos de la contraseña:
            </p>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Mínimo 8 caracteres</li>
              <li>• Al menos una letra minúscula</li>
              <li>• Al menos una letra mayúscula</li>
              <li>• Al menos un número</li>
              <li>• Al menos un carácter especial (@$!%*?&)</li>
            </ul>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>

          {/* Back to Login */}
          <div className="text-center">
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-blue-500 hover:text-blue-600 text-sm underline transition-colors"
            >
              Volver al inicio de sesión
            </button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;