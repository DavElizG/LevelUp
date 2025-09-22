import React, { useState, useEffect } from 'react';
import Login from './Login';
import Register from './Register';
import EmailConfirmation from './EmailConfirmation';
import ResetPassword from './ResetPassword';
import ResetPasswordError from './ResetPasswordError';

type AuthMode = 'login' | 'register' | 'email-confirmation' | 'reset-password' | 'reset-password-error';

const Auth: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [pendingEmail, setPendingEmail] = useState<string>('');
  const [accessToken, setAccessToken] = useState<string>('');
  const [errorType, setErrorType] = useState<'expired' | 'invalid' | 'access_denied'>('expired');

  useEffect(() => {
    // Check URL parameters for auth-related actions
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('access_token');
    const type = urlParams.get('type');
    const error = urlParams.get('error');
    const errorCode = urlParams.get('error_code');
    const errorDescription = urlParams.get('error_description');
    
    // Handle password reset errors
    if (error || errorCode) {
      if (errorCode === 'otp_expired' || errorDescription?.includes('expired')) {
        setErrorType('expired');
      } else if (error === 'access_denied') {
        setErrorType('access_denied');
      } else {
        setErrorType('invalid');
      }
      setMode('reset-password-error');
      return;
    }
    
    // Handle successful password reset link
    if (token && type === 'recovery') {
      setAccessToken(token);
      setMode('reset-password');
      return;
    }

    // Check for hash parameters (sometimes auth providers use hash instead of query)
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hashError = hashParams.get('error');
      const hashErrorCode = hashParams.get('error_code');
      const hashToken = hashParams.get('access_token');
      const hashType = hashParams.get('type');
      
      if (hashError || hashErrorCode) {
        if (hashErrorCode === 'otp_expired' || hashParams.get('error_description')?.includes('expired')) {
          setErrorType('expired');
        } else if (hashError === 'access_denied') {
          setErrorType('access_denied');
        } else {
          setErrorType('invalid');
        }
        setMode('reset-password-error');
        return;
      }
      
      if (hashToken && hashType === 'recovery') {
        setAccessToken(hashToken);
        setMode('reset-password');
        return;
      }
    }
  }, []);

  const switchToLogin = () => {
    setMode('login');
    // Clean up URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
  };
  
  const switchToRegister = () => setMode('register');
  
  const switchToEmailConfirmation = (email: string) => {
    setPendingEmail(email);
    setMode('email-confirmation');
  };

  return (
    <>
      {mode === 'login' && (
        <Login onSwitchToRegister={switchToRegister} />
      )}
      {mode === 'register' && (
        <Register 
          onSwitchToLogin={switchToLogin}
          onEmailConfirmationNeeded={switchToEmailConfirmation}
        />
      )}
      {mode === 'email-confirmation' && (
        <EmailConfirmation 
          email={pendingEmail}
          onBackToLogin={switchToLogin}
        />
      )}
      {mode === 'reset-password' && (
        <ResetPassword 
          onBackToLogin={switchToLogin}
          accessToken={accessToken}
        />
      )}
      {mode === 'reset-password-error' && (
        <ResetPasswordError 
          onBackToLogin={switchToLogin}
          errorType={errorType}
        />
      )}
    </>
  );
};

export default Auth;