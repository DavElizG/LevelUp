import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from './Login';
import * as useAuthModule from '../../hooks/useAuth';

// Mock the useAuth hook
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('Login Component', () => {
  const mockSignIn = vi.fn();
  const mockSignInWithProvider = vi.fn();
  const mockResetPassword = vi.fn();
  const mockOnSwitchToRegister = vi.fn();

  const defaultAuthReturn = {
    signIn: mockSignIn,
    signInWithProvider: mockSignInWithProvider,
    resetPassword: mockResetPassword,
    loading: false,
    error: null,
    user: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthModule.useAuth as any).mockReturnValue(defaultAuthReturn);
  });

  describe('Rendering', () => {
    it('should render login form with all elements', () => {
      render(<Login onSwitchToRegister={mockOnSwitchToRegister} />);

      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
      expect(screen.getByText(/¿No tienes una cuenta?/i)).toBeInTheDocument();
    });

    it('should display error message when error prop is provided', () => {
      (useAuthModule.useAuth as any).mockReturnValue({
        ...defaultAuthReturn,
        error: 'Invalid credentials',
      });

      render(<Login onSwitchToRegister={mockOnSwitchToRegister} />);

      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    it('should display success message when reset password is successful', async () => {
      mockResetPassword.mockResolvedValue({ success: true });
      
      render(<Login onSwitchToRegister={mockOnSwitchToRegister} />);

      const emailInput = screen.getByPlaceholderText('Email');
      await userEvent.type(emailInput, 'test@example.com');

      const forgotPasswordBtn = screen.getByText(/¿Olvidaste tu contraseña?/i);
      await userEvent.click(forgotPasswordBtn);

      await waitFor(() => {
        expect(screen.getByText(/Te hemos enviado un enlace/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Interaction', () => {
    it('should update email input value', async () => {
      render(<Login onSwitchToRegister={mockOnSwitchToRegister} />);

      const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement;
      await userEvent.type(emailInput, 'test@example.com');

      expect(emailInput.value).toBe('test@example.com');
    });

    it('should update password input value', async () => {
      render(<Login onSwitchToRegister={mockOnSwitchToRegister} />);

      const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement;
      await userEvent.type(passwordInput, 'password123');

      expect(passwordInput.value).toBe('password123');
    });
  });

  describe('Form Submission', () => {
    it('should call signIn with correct credentials on submit', async () => {
      mockSignIn.mockResolvedValue({ success: true });

      render(<Login onSwitchToRegister={mockOnSwitchToRegister} />);

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('should prevent submission with empty fields', async () => {
      render(<Login onSwitchToRegister={mockOnSwitchToRegister} />);

      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      await userEvent.click(submitButton);

      // HTML5 validation should prevent submission
      expect(mockSignIn).not.toHaveBeenCalled();
    });

    it('should show loading state during submission', () => {
      (useAuthModule.useAuth as any).mockReturnValue({
        ...defaultAuthReturn,
        loading: true,
      });

      render(<Login onSwitchToRegister={mockOnSwitchToRegister} />);

      expect(screen.getByText('Iniciando...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /iniciando/i })).toBeDisabled();
    });
  });

  describe('Social Login', () => {
    it('should call signInWithProvider when clicking Facebook button', async () => {
      mockSignInWithProvider.mockResolvedValue({ success: true });

      render(<Login onSwitchToRegister={mockOnSwitchToRegister} />);

      const facebookButton = screen.getAllByRole('button')[1]; // First social button
      await userEvent.click(facebookButton);

      expect(mockSignInWithProvider).toHaveBeenCalledWith('facebook');
    });

    it('should call signInWithProvider when clicking Google button', async () => {
      mockSignInWithProvider.mockResolvedValue({ success: true });

      render(<Login onSwitchToRegister={mockOnSwitchToRegister} />);

      const buttons = screen.getAllByRole('button');
      const googleButton = buttons.find(btn => btn.textContent === 'G+');
      
      if (googleButton) {
        await userEvent.click(googleButton);
      }

      expect(mockSignInWithProvider).toHaveBeenCalledWith('google');
    });

    it('should disable social login buttons when loading', () => {
      (useAuthModule.useAuth as any).mockReturnValue({
        ...defaultAuthReturn,
        loading: true,
      });

      render(<Login onSwitchToRegister={mockOnSwitchToRegister} />);

      // Get all buttons and filter only the ones that should be disabled during loading
      const allButtons = screen.getAllByRole('button');
      
      // The submit button and social login buttons should be disabled
      // The "Regístrate" link button should NOT be disabled
      const submitButton = screen.getByRole('button', { name: /iniciando/i });
      expect(submitButton).toBeDisabled();
      
      // Find social login buttons by checking if they contain icons or specific classes
      const socialButtons = allButtons.filter(btn => 
        btn.className.includes('w-12 h-12')
      );
      
      socialButtons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('Password Reset', () => {
    it('should call resetPassword when forgot password is clicked with email', async () => {
      mockResetPassword.mockResolvedValue({ success: true });

      render(<Login onSwitchToRegister={mockOnSwitchToRegister} />);

      const emailInput = screen.getByPlaceholderText('Email');
      await userEvent.type(emailInput, 'test@example.com');

      const forgotPasswordBtn = screen.getByText(/¿Olvidaste tu contraseña?/i);
      await userEvent.click(forgotPasswordBtn);

      expect(mockResetPassword).toHaveBeenCalledWith('test@example.com');
    });

    it('should disable forgot password button when email is empty', () => {
      render(<Login onSwitchToRegister={mockOnSwitchToRegister} />);

      const forgotPasswordBtn = screen.getByText(/¿Olvidaste tu contraseña?/i);
      
      expect(forgotPasswordBtn).toBeDisabled();
      expect(screen.getByText('Ingresa tu email primero')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should call onSwitchToRegister when register button is clicked', async () => {
      render(<Login onSwitchToRegister={mockOnSwitchToRegister} />);

      const registerButton = screen.getByText('Regístrate');
      await userEvent.click(registerButton);

      expect(mockOnSwitchToRegister).toHaveBeenCalled();
    });
  });
});
