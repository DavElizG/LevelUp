# Tests Unitarios - LevelUp Gym App

Este proyecto incluye tests unitarios configurados con **Vitest** y **React Testing Library**.

## 📦 Dependencias de Testing

Las siguientes dependencias han sido instaladas:

- `vitest` - Framework de testing rápido para Vite
- `@testing-library/react` - Utilidades para testear componentes React
- `@testing-library/jest-dom` - Matchers adicionales para assertions de DOM
- `@testing-library/user-event` - Simulación avanzada de interacciones de usuario
- `jsdom` - Implementación de DOM para Node.js
- `@vitest/ui` - Interfaz gráfica para Vitest
- `happy-dom` - Alternativa ligera a jsdom

## 🚀 Comandos Disponibles

```bash
# Ejecutar todos los tests en modo watch (reejecutará al detectar cambios)
npm test

# Ejecutar tests una sola vez (para CI/CD)
npm test -- --run

# Ejecutar tests con interfaz gráfica
npm run test:ui

# Ejecutar tests con reporte de cobertura
npm run test:coverage
```

## 📁 Estructura de Tests

```
src/
├── test/
│   ├── setup.ts                    # Configuración global de tests
│   └── mocks/
│       └── supabase.ts             # Mocks de Supabase
├── hooks/
│   ├── useAuth.ts
│   └── useAuth.test.ts             # Tests del hook useAuth
├── components/
│   └── Auth/
│       ├── Login.tsx
│       └── Login.test.tsx          # Tests del componente Login
└── shared/
    └── utils/
        ├── type-converters.ts
        └── type-converters.test.ts # Tests de utilidades
```

## ✅ Tests Incluidos

### 1. Type Converters (`src/shared/utils/type-converters.test.ts`)
Tests para funciones de conversión de tipos:
- ✓ Conversión de WorkoutRoutine a Workout
- ✓ Conversión de Workout a CreateWorkoutData
- ✓ Conversión de Workout a UpdateWorkoutData
- ✓ Cálculo de calorías totales de un plan de dieta
- ✓ Conversión de arrays de WorkoutRoutines

### 2. useAuth Hook (`src/hooks/useAuth.test.ts`)
Tests para el hook de autenticación:
- ✓ Inicialización del estado de autenticación
- ✓ Carga de sesión de usuario al montar
- ✓ Manejo de errores de sesión
- ✓ Inicio de sesión exitoso y con errores
- ✓ Registro de usuario exitoso y con errores
- ✓ Cierre de sesión exitoso y con errores
- ✓ Recuperación de contraseña
- ✓ Actualización de contraseña

### 3. Login Component (`src/components/Auth/Login.test.tsx`)
Tests para el componente de Login:
- ✓ Renderizado de todos los elementos del formulario
- ✓ Visualización de mensajes de error
- ✓ Interacción con inputs (email y password)
- ✓ Envío del formulario
- ✓ Estado de carga durante el envío
- ✓ Login con redes sociales (Facebook, Google, Twitter)
- ✓ Recuperación de contraseña
- ✓ Navegación entre Login y Registro

## 📝 Convenciones de Testing

### Estructura de un Test
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('ComponentName', () => {
  beforeEach(() => {
    // Setup antes de cada test
  });

  describe('Feature Group', () => {
    it('should do something specific', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### Mocking Supabase
Para testear componentes que usan Supabase:

```typescript
import { vi } from 'vitest';

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signIn: vi.fn(),
      // ... otros métodos
    }
  }
}));
```

### Testing Hooks
Para testear custom hooks usa `renderHook`:

```typescript
import { renderHook, waitFor } from '@testing-library/react';

const { result } = renderHook(() => useCustomHook());

await waitFor(() => {
  expect(result.current.loading).toBe(false);
});
```

### Testing Componentes
Para testear componentes usa `render` y `screen`:

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

render(<MyComponent />);

const button = screen.getByRole('button', { name: /submit/i });
await userEvent.click(button);

expect(screen.getByText(/success/i)).toBeInTheDocument();
```

## 🎯 Mejores Prácticas

1. **AAA Pattern**: Organiza los tests en Arrange, Act, Assert
2. **Nombres Descriptivos**: Los nombres de los tests deben describir claramente qué están probando
3. **Tests Independientes**: Cada test debe poder ejecutarse de forma aislada
4. **Mocks Limpios**: Limpia los mocks en `beforeEach` para evitar interferencias
5. **Testing de Comportamiento**: Testea lo que el usuario ve y hace, no detalles de implementación

## 📊 Cobertura de Código

Para ver un reporte detallado de cobertura:

```bash
npm run test:coverage
```

Esto generará:
- Reporte en consola
- Reporte HTML en `coverage/index.html`
- Reporte JSON para herramientas de CI/CD

## 🔧 Configuración

La configuración de Vitest está en `vite.config.ts`:

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
      ],
    },
  },
});
```

## 🚧 Próximos Pasos

Para expandir la suite de tests, considera agregar:

1. Tests para más hooks (useProfile, useSetup)
2. Tests para componentes de Setup
3. Tests para servicios (workout.service, diet.service)
4. Tests de integración entre componentes
5. Tests E2E con Playwright o Cypress

## 🐛 Debugging Tests

Para debuggear un test específico:

```bash
# Ejecutar solo un archivo
npm test -- useAuth.test.ts

# Ejecutar con la UI para inspección visual
npm run test:ui

# Ejecutar en modo verbose
npm test -- --reporter=verbose
```

## 📚 Recursos

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
