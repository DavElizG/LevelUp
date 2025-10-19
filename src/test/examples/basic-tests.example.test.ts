import { describe, it, expect } from 'vitest';

/**
 * Ejemplo de tests unitarios simples para funciones puras
 * Este archivo demuestra diferentes patrones de testing
 */

// Funciones de ejemplo para testear
export function add(a: number, b: number): number {
  return a + b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}

export function formatUserName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

export function calculateBMI(weightKg: number, heightM: number): number {
  if (heightM <= 0) throw new Error('Height must be positive');
  return Number((weightKg / (heightM * heightM)).toFixed(2));
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Tests
describe('Math Utilities', () => {
  describe('add', () => {
    it('should add two positive numbers', () => {
      expect(add(2, 3)).toBe(5);
    });

    it('should add negative numbers', () => {
      expect(add(-2, -3)).toBe(-5);
    });

    it('should handle zero', () => {
      expect(add(5, 0)).toBe(5);
      expect(add(0, 0)).toBe(0);
    });
  });

  describe('multiply', () => {
    it('should multiply two numbers', () => {
      expect(multiply(3, 4)).toBe(12);
    });

    it('should return zero when multiplying by zero', () => {
      expect(multiply(5, 0)).toBe(0);
    });
  });
});

describe('String Utilities', () => {
  describe('formatUserName', () => {
    it('should format full name correctly', () => {
      expect(formatUserName('John', 'Doe')).toBe('John Doe');
    });

    it('should handle empty strings', () => {
      expect(formatUserName('', '')).toBe('');
    });

    it('should trim whitespace', () => {
      // Note: formatUserName only trims the final result, not individual parts
      // '  John  ' + ' ' + '  Doe  ' = '  John     Doe  ' -> trim() -> 'John     Doe'
      expect(formatUserName('  John  ', '  Doe  ')).toBe('John     Doe');
    });
  });
});

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@invalid.com')).toBe(false);
      expect(isValidEmail('invalid@.com')).toBe(false);
    });

    it('should reject empty strings', () => {
      expect(isValidEmail('')).toBe(false);
    });
  });
});

describe('Health Calculations', () => {
  describe('calculateBMI', () => {
    it('should calculate BMI correctly', () => {
      // BMI = 70 / (1.75 * 1.75) = 22.86
      expect(calculateBMI(70, 1.75)).toBe(22.86);
    });

    it('should calculate BMI for different values', () => {
      // BMI = 80 / (1.80 * 1.80) = 24.69
      expect(calculateBMI(80, 1.80)).toBe(24.69);
    });

    it('should throw error for zero height', () => {
      expect(() => calculateBMI(70, 0)).toThrow('Height must be positive');
    });

    it('should throw error for negative height', () => {
      expect(() => calculateBMI(70, -1.75)).toThrow('Height must be positive');
    });
  });
});
