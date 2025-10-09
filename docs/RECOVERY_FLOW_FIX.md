# Password Recovery Flow - Fix del Redirect Incorrecto

## 🔴 Problema Reportado

Los usuarios que hacían clic en el enlace de recuperación de contraseña desde su email eran redirigidos a `/login` en lugar de mostrar el formulario de cambio de contraseña en `/reset-password`.

## 🔍 Análisis del Problema

### Flujo de Supabase para Password Recovery

Cuando un usuario solicita recuperar su contraseña:

1. **Se envía email con token de recuperación**:
   - URL: `http://localhost:5173/reset-password?type=recovery&access_token=...`
   - El token tiene una duración de 1 hora (configurable en Supabase)

2. **Supabase detecta automáticamente el token** (debido a `detectSessionInUrl: true`):
   - Crea una sesión temporal **antes** de que React Router procese las rutas
   - El usuario queda "autenticado" momentáneamente

3. **El problema**: AuthRoutes detectaba usuario autenticado y redirigía a dashboard
   - `if (user) { return <Navigate to="/dashboard" replace />; }`
   - El formulario de reset password **nunca se renderizaba**

### Root Cause Identificado

```typescript
// ❌ CÓDIGO ORIGINAL (PROBLEMA)
const AuthRoutes: React.FC = () => {
  const { user } = useAuth();

  // Redirige TODOS los usuarios autenticados al dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-orange-700">
      <Auth />
    </div>
  );
};
```

**Por qué fallaba**:
- Supabase crea sesión del token de recuperación → `user` es truthy
- AuthRoutes ve `user` y ejecuta redirect a `/dashboard`
- El componente `<Auth />` que detecta `type=recovery` nunca se renderiza
- Usuario ve dashboard en lugar del formulario de reset

## ✅ Solución Implementada

### 1. Helper Function para Detectar Recovery Flow

Agregamos una función que verifica si la URL actual es parte del flujo de recuperación:

```typescript
const isRecoveryFlow = (): boolean => {
  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = window.location.hash 
    ? new URLSearchParams(window.location.hash.substring(1)) 
    : null;
  
  const type = urlParams.get('type') || hashParams?.get('type');
  const accessToken = urlParams.get('access_token') || hashParams?.get('access_token');
  
  return type === 'recovery' && !!accessToken;
};
```

**Por qué revisar tanto query como hash**:
- Supabase puede enviar tokens en diferentes formatos según configuración
- PKCE flow usa hash fragments (`#access_token=...`)
- Implicit flow usa query params (`?access_token=...`)

### 2. Modificar la Lógica de Redirect

```typescript
// ✅ CÓDIGO CORREGIDO
const AuthRoutes: React.FC = () => {
  const { user } = useAuth();

  // Solo redirigir a dashboard si:
  // - Hay usuario autenticado Y
  // - NO estamos en flujo de recuperación
  if (user && !isRecoveryFlow()) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-orange-700">
      <Auth />
    </div>
  );
};
```

### 3. Cómo Funciona el Flujo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Usuario hace clic en link del email                          │
│    URL: /reset-password?type=recovery&access_token=xyz123       │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Supabase detectSessionInUrl procesa el token                 │
│    ✓ Crea sesión temporal                                       │
│    ✓ user está autenticado                                      │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. React Router evalúa las rutas                                │
│    → Llega a AuthRoutes component                               │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. AuthRoutes ejecuta isRecoveryFlow()                          │
│    ✓ Detecta type=recovery en URL                               │
│    ✓ Detecta access_token en URL                                │
│    → Retorna true                                                │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. Condición: user && !isRecoveryFlow()                         │
│    user = true                                                   │
│    !isRecoveryFlow() = false                                     │
│    → NO redirige a dashboard                                     │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. Se renderiza <Auth /> component                              │
│    ✓ useEffect detecta type=recovery                            │
│    ✓ Establece mode='reset-password'                            │
│    ✓ Muestra <ResetPassword /> component                        │
└─────────────────────────────────────────────────────────────────┘
```

## 🔒 Consideraciones de Seguridad

### ¿Por qué es seguro?

1. **Validación del token sigue siendo de Supabase**:
   - Nosotros solo detectamos la **presencia** del token
   - Supabase valida si el token es legítimo y no ha expirado
   - Si el token es inválido, Supabase no crea sesión

2. **Sesión temporal limitada**:
   - El token solo permite cambiar la contraseña
   - Después de cambiar contraseña, forzamos logout
   - El usuario debe iniciar sesión con la nueva contraseña

3. **No hay auto-login permanente**:
   ```typescript
   // En ResetPassword.tsx después de cambio exitoso
   await supabase.auth.signOut();
   navigate('/login', { 
     state: { message: 'Contraseña actualizada. Inicia sesión nuevamente.' } 
   });
   ```

### ¿Qué pasa si alguien manipula la URL?

**Escenario**: Un atacante agrega `?type=recovery` manualmente sin token válido

```typescript
// Si no hay access_token válido
isRecoveryFlow() retorna false → redirige normalmente

// Si hay access_token pero es inválido
Supabase no crea sesión → user = null → muestra login normalmente

// Si hay access_token válido (robado de alguna forma)
Token expira en 1 hora → después muestra error de token expirado
```

## 📋 Archivos Modificados

### 1. `src/routes/routes.tsx`

**Líneas modificadas**: 128-152

**Cambios**:
- Agregado helper function `isRecoveryFlow()`
- Modificado condicional de redirect en AuthRoutes

**Antes**:
```typescript
if (user) {
  return <Navigate to="/dashboard" replace />;
}
```

**Después**:
```typescript
if (user && !isRecoveryFlow()) {
  return <Navigate to="/dashboard" replace />;
}
```

## ✅ Verificación del Fix

### Archivos que NO necesitaron cambios

1. **`src/components/Auth/Auth.tsx`**:
   - Ya detectaba correctamente `type=recovery` desde URL
   - Ya establecía `mode='reset-password'` cuando detectaba token

2. **`src/hooks/useAuth.ts`**:
   - Ya tenía configurado `redirectTo: ${window.location.origin}/reset-password`
   - Método `resetPasswordForEmail` ya era correcto

3. **`src/lib/supabase.ts`**:
   - Ya tenía `detectSessionInUrl: true`
   - Ya tenía `flowType: 'pkce'` configurado
   - Custom sessionStorage ya funcionaba correctamente

### Casos de Prueba

#### ✅ Caso 1: Link de recuperación válido
```
1. Usuario solicita reset password
2. Hace clic en link del email
3. Resultado esperado: Ve formulario de cambio de contraseña
4. Cambia contraseña exitosamente
5. Es redirigido a /login y debe iniciar sesión nuevamente
```

#### ✅ Caso 2: Token expirado
```
1. Usuario hace clic en link después de 1+ hora
2. Resultado esperado: Ve mensaje de error "Token expirado"
3. Opción de solicitar nuevo link
```

#### ✅ Caso 3: Token inválido o manipulado
```
1. URL contiene token incorrecto
2. Resultado esperado: Supabase no crea sesión
3. Usuario ve página de login con mensaje de error
```

#### ✅ Caso 4: Usuario ya autenticado intenta acceder a /reset-password sin token
```
1. Usuario ya tiene sesión activa
2. Intenta ir a /reset-password directamente (sin ?type=recovery)
3. Resultado esperado: isRecoveryFlow() = false → redirige a dashboard
```

## 🔧 Configuración de Supabase Necesaria

### Authentication → URL Configuration

Verifica que tu proyecto tenga configurado:

```
Site URL: http://localhost:5173
Redirect URLs:
  - http://localhost:5173/**
  - http://localhost:5173/reset-password
```

### Authentication → Email Templates

El template de "Reset Password" debe usar esta URL:

```html
<a href="{{ .SiteURL }}/reset-password?type=recovery&access_token={{ .Token }}">
  Restablecer contraseña
</a>
```

## 🔗 Relación con Clock Skew Fix

Este fix es **independiente** del Clock Skew Fix documentado en `CLOCK_SKEW_FIX.md`.

- **Clock Skew Fix**: Resuelve errores de validación de timestamp cuando el reloj del cliente está desincronizado
- **Recovery Flow Fix**: Resuelve el problema de redirect incorrecto antes de mostrar el formulario

**Ambos fixes trabajan juntos**:
1. Recovery Flow Fix permite que el formulario se renderice
2. Clock Skew Fix permite que el token sea validado correctamente incluso con desfase de hora

## 📝 Notas de Implementación

### Por qué no usar React Router params

```typescript
// ❌ NO funciona
const { type } = useSearchParams();
// Problema: los params no están disponibles hasta que el componente se renderiza
// Pero el redirect ocurre ANTES del render
```

### Por qué revisar window.location directamente

```typescript
// ✅ SÍ funciona
const urlParams = new URLSearchParams(window.location.search);
// Solución: window.location está disponible de inmediato
// No depende del ciclo de vida de React
```

## 🎯 Resultado Final

✅ Los usuarios ahora pueden:
1. Hacer clic en el link de recuperación del email
2. Ver el formulario de cambio de contraseña correctamente
3. Cambiar su contraseña sin errores
4. Ser redirigidos a login para iniciar sesión nuevamente

✅ Se mantiene seguridad:
- No hay auto-login permanente
- Los tokens expiran correctamente
- Los tokens inválidos son rechazados

✅ Se preserva el Clock Skew Fix:
- Los tokens se validan con tolerancia a desfase horario
- No se rompe la funcionalidad existente

## 📚 Referencias

- [Supabase Auth Flow Documentation](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui)
- [PKCE Flow Explanation](https://supabase.com/docs/guides/auth/auth-helpers/nextjs#authentication-flow)
- `docs/CLOCK_SKEW_FIX.md` - Fix relacionado con validación de timestamps
