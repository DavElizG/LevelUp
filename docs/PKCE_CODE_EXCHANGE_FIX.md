# 🔐 PKCE Code Exchange Fix - Password Recovery Flow

## 🎯 Problema Identificado

La URL del correo de recuperación de contraseña mostraba:
```
http://localhost:5173/reset-password?code=bb7d3d50-ef22-4089-a842-7d79efc2de6f
```

Pero el sistema esperaba:
```
http://localhost:5173/reset-password?type=recovery&access_token=...
```

**Root Cause**: Supabase está usando **PKCE (Proof Key for Code Exchange) flow** en lugar de Implicit flow, lo que significa que envía un `code` temporal que debe intercambiarse por un `access_token` antes de poder usar la sesión.

---

## 📚 Contexto: PKCE vs Implicit Flow

### Implicit Flow (Antiguo - Menos Seguro)
```
Email → URL con access_token directo → Sesión inmediata
```

**Formato de URL:**
```
/reset-password?type=recovery&access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Ventajas:**
- Más simple, sesión inmediata
- No requiere exchange

**Desventajas:**
- ⚠️ Token expuesto en URL (logs, historial del navegador)
- ⚠️ Menos seguro para aplicaciones públicas

### PKCE Flow (Moderno - Más Seguro) ✅
```
Email → URL con code temporal → Exchange code por access_token → Sesión
```

**Formato de URL:**
```
/reset-password?code=bb7d3d50-ef22-4089-a842-7d79efc2de6f
```

**Ventajas:**
- ✅ El `code` es de un solo uso
- ✅ El `code` expira rápidamente (segundos)
- ✅ El `access_token` nunca aparece en la URL
- ✅ Recomendado por OAuth 2.1 y OpenID Connect
- ✅ Más seguro para aplicaciones móviles (Capacitor)

**Desventajas:**
- Requiere un paso extra (code exchange)
- Ligeramente más complejo de implementar

---

## 🔧 Solución Implementada

### 1. Actualizar `isRecoveryFlow()` en routes.tsx

**Antes (Solo Implicit Flow):**
```typescript
const isRecoveryFlow = (): boolean => {
  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = window.location.hash ? new URLSearchParams(window.location.hash.substring(1)) : null;
  
  const type = urlParams.get('type') || hashParams?.get('type');
  const accessToken = urlParams.get('access_token') || hashParams?.get('access_token');
  
  return type === 'recovery' && !!accessToken;
};
```

**Después (PKCE + Implicit Flow):**
```typescript
const isRecoveryFlow = (): boolean => {
  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = window.location.hash ? new URLSearchParams(window.location.hash.substring(1)) : null;
  
  const type = urlParams.get('type') || hashParams?.get('type');
  const code = urlParams.get('code') || hashParams?.get('code');
  const accessToken = urlParams.get('access_token') || hashParams?.get('access_token');
  
  // Recovery flow is detected if we have a code OR access_token
  // type=recovery is optional in PKCE flow
  return !!(code || accessToken) && (type === 'recovery' || !!code);
};
```

**Cambios clave:**
- Detecta tanto `code` como `access_token`
- PKCE flow puede omitir el parámetro `type=recovery`
- Compatible con ambos flujos simultáneamente

---

### 2. Implementar `exchangeCodeForSession()` en ResetPassword.tsx

**Nuevo código agregado:**
```typescript
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
    // Handle missing code/token
    setTokenError('No se encontró el código de recuperación...');
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
    // ... existing validation code
  }
};
```

**Flujo del código:**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuario hace clic en link del email                      │
│    URL: /reset-password?code=xyz123                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. ResetPassword.tsx useEffect ejecuta                      │
│    extractTokenOrCode()                                     │
│    → Detecta type='code', value='xyz123'                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Ejecuta validateAndExchangeToken()                       │
│    → type === 'code' branch                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Llama supabase.auth.exchangeCodeForSession(code)        │
│    ✓ Supabase valida el code                               │
│    ✓ Genera access_token + refresh_token                   │
│    ✓ Crea sesión temporal                                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Recibe { data: { session, user }, error: null }         │
│    → setTokenValid(true)                                    │
│    → Muestra formulario de cambio de contraseña            │
└─────────────────────────────────────────────────────────────┘
```

---

### 3. Actualizar Auth.tsx para detectar `code`

**Antes:**
```typescript
const token = urlParams.get('access_token') || hashParams?.get('access_token');
const type = urlParams.get('type') || hashParams?.get('type');

if (token && type === 'recovery') {
  setMode('reset-password');
  return;
}
```

**Después:**
```typescript
const token = urlParams.get('access_token') || hashParams?.get('access_token');
const code = urlParams.get('code') || hashParams?.get('code');
const type = urlParams.get('type') || hashParams?.get('type');

// Handle successful password reset link
// PKCE flow sends code, Implicit flow sends access_token
if (code || (token && type === 'recovery')) {
  setMode('reset-password');
  return;
}
```

---

## 🆕 Bonus: Página Dedicada de "Olvidé mi contraseña"

### Problema Original
En `Login.tsx`, el botón "¿Olvidaste tu contraseña?" ejecutaba `resetPasswordForEmail()` inmediatamente sin pedir confirmación del email.

### Solución
Nueva página `/forgot-password` con:

1. **Campo de email dedicado** con validación
2. **Botón "Enviar enlace de recuperación"**
3. **Mensaje de éxito** con auto-redirect
4. **Mensaje de advertencia** sobre expiración del link

**Archivo nuevo:** `src/components/Auth/ForgotPassword.tsx`

**Características:**
- ✅ Validación de email con regex
- ✅ Mensajes claros en español
- ✅ UX mejorada con estados de loading y success
- ✅ Auto-redirect a login después de 5 segundos
- ✅ Colores naranja de la marca
- ✅ Compatible con diseño responsive

---

## 🔐 Seguridad y Validación

### ¿El code puede ser reutilizado?
**NO**. El code es de un solo uso:
- Primer intento: Exchange exitoso → crea sesión
- Segundo intento: Error "code already used"

### ¿El code expira?
**SÍ**. El code tiene vida útil muy corta (típicamente 60 segundos):
- Si el usuario tarda en hacer clic: Error "code expired"
- Solución: Solicitar nuevo enlace

### ¿Qué pasa si interceptan el code?
**Riesgo mínimo**:
- El code expira en segundos
- El code solo sirve para crear una sesión temporal
- Después de cambiar contraseña, se fuerza logout
- El atacante necesitaría acceso al email Y actuar en <60 segundos

### ¿El access_token está más seguro ahora?
**SÍ**:
- ANTES: `access_token` en URL → visible en logs, historial
- AHORA: `code` en URL → se intercambia server-side → `access_token` solo vive en memoria

---

## 📊 Comparación: Antes vs Después

| Aspecto | ANTES (Implicit) | AHORA (PKCE) |
|---------|------------------|--------------|
| **URL del email** | `?type=recovery&access_token=long_jwt...` | `?code=short_code` |
| **Token en URL** | Sí (JWT completo) | No (solo code temporal) |
| **Reutilización** | Posible hasta expiración | Imposible (un solo uso) |
| **Seguridad** | ⚠️ Media | ✅ Alta |
| **OAuth 2.1 compliant** | ❌ No | ✅ Sí |
| **Mobile friendly** | ⚠️ Limitado | ✅ Óptimo |
| **Duración en URL** | 1 hora | 60 segundos |

---

## ✅ Casos de Prueba

### Test Case 1: PKCE Code Exchange Exitoso
```
1. Usuario solicita reset en /forgot-password
2. Ingresa email válido
3. Recibe correo con link: /reset-password?code=xyz123
4. Hace clic en el link
5. ✅ ESPERADO: exchangeCodeForSession() ejecuta
6. ✅ ESPERADO: Sesión temporal creada
7. ✅ ESPERADO: Formulario de cambio de contraseña se muestra
8. Usuario cambia contraseña
9. ✅ ESPERADO: Logout forzado + redirect a login
```

### Test Case 2: Code Expirado
```
1. Usuario recibe link de reset
2. Espera >60 segundos
3. Hace clic en el link
4. ✅ ESPERADO: exchangeCodeForSession() falla
5. ✅ ESPERADO: Mensaje "El código ha expirado"
6. ✅ ESPERADO: Botón "Volver al inicio de sesión"
```

### Test Case 3: Code Inválido
```
1. Usuario manipula el code en la URL
2. Ejemplo: ?code=invalid_xyz
3. ✅ ESPERADO: exchangeCodeForSession() falla
4. ✅ ESPERADO: Mensaje "El código es inválido"
```

### Test Case 4: Implicit Flow Sigue Funcionando (Backward Compatibility)
```
1. URL antigua con access_token
2. Ejemplo: ?type=recovery&access_token=jwt...
3. ✅ ESPERADO: Detecta type='token'
4. ✅ ESPERADO: Salta el exchange, valida directamente
5. ✅ ESPERADO: Formulario se muestra correctamente
```

---

## 🛠️ Configuración de Supabase

### Authentication → URL Configuration

```
Site URL: http://localhost:5173
Redirect URLs:
  - http://localhost:5173/**
  - http://localhost:5173/reset-password
  - http://localhost:5173/forgot-password
```

### Authentication → Settings → Auth Flow

```
✅ Enable PKCE flow (debe estar activado)
```

### Authentication → Email Templates → Reset Password

El template debe usar `{{ .Token }}` que automáticamente genera el `code` apropiado según el flow configurado:

```html
<h2>Restablecer tu contraseña</h2>
<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
<p><a href="{{ .SiteURL }}/reset-password?code={{ .Token }}">Restablecer contraseña</a></p>
<p>Este enlace expira en 1 hora.</p>
```

**Nota**: No necesitas cambiar `{{ .Token }}` por `{{ .Code }}`. Supabase automáticamente genera lo correcto según el flow.

---

## 🔄 Compatibilidad con Fixes Previos

### Clock Skew Fix ✅
- **Status**: Compatible
- **Razón**: PKCE code exchange ocurre server-side (Supabase)
- **Validación de timestamp**: Manejada por Supabase, no por el cliente
- **Resultado**: Clock skew no afecta el code exchange

### Recovery Flow Fix ✅
- **Status**: Mejorado
- **Razón**: `isRecoveryFlow()` ahora detecta ambos flujos
- **Backward compatibility**: Implicit flow sigue funcionando
- **Resultado**: Más robusto y seguro

---

## 📝 Archivos Modificados

| Archivo | Cambios | Líneas |
|---------|---------|--------|
| `src/routes/routes.tsx` | `isRecoveryFlow()` detecta `code` | ~10 |
| `src/components/Auth/ResetPassword.tsx` | `exchangeCodeForSession()` | ~50 |
| `src/components/Auth/Auth.tsx` | Detecta `code`, agrega modo forgot-password | ~5 |
| `src/components/Auth/Login.tsx` | Redirect a /forgot-password | ~5 |
| `src/components/Auth/ForgotPassword.tsx` | **NUEVO** Página dedicada | ~210 |

**Total**: ~280 líneas agregadas/modificadas

---

## 🎉 Beneficios del Fix

1. ✅ **Seguridad mejorada**: PKCE es más seguro que Implicit flow
2. ✅ **OAuth 2.1 compliant**: Siguiendo mejores prácticas modernas
3. ✅ **Mobile-ready**: Capacitor se beneficia de PKCE
4. ✅ **Backward compatible**: Implicit flow sigue funcionando
5. ✅ **Mejor UX**: Página dedicada de forgot password
6. ✅ **Mensajes claros**: Todo en español con feedback visual
7. ✅ **Clock skew tolerant**: Funciona incluso con relojes desincronizados
8. ✅ **Testeable**: Console logs para debugging

---

## 🚀 Próximos Pasos

1. **Probar en producción** con email real
2. **Verificar configuración** de Supabase Dashboard
3. **Probar en móvil** (Capacitor build)
4. **Monitorear logs** de console para debugging
5. **Actualizar documentación** si encuentras edge cases

---

## 📚 Referencias

- [Supabase PKCE Flow Documentation](https://supabase.com/docs/guides/auth/server-side/pkce-flow)
- [OAuth 2.1 PKCE Specification](https://oauth.net/2.1/)
- [IETF RFC 7636 - PKCE](https://datatracker.ietf.org/doc/html/rfc7636)
- `docs/RECOVERY_FLOW_FIX.md` - Fix anterior del redirect
- `docs/CLOCK_SKEW_FIX.md` - Fix de timestamp validation

---

## 🐛 Troubleshooting

### Si el code exchange falla:

**1. Verificar logs de console:**
```javascript
// Buscar en DevTools:
🔄 Exchanging PKCE code for session...
✅ Code exchange successful, session created
```

**2. Verificar que PKCE está habilitado en Supabase:**
```
Dashboard → Authentication → Settings → Enable PKCE flow
```

**3. Verificar que el code no expiró:**
```
El code tiene vida útil de ~60 segundos
```

**4. Verificar URL del correo:**
```
Debe tener: /reset-password?code=...
NO debe tener: type=recovery (opcional en PKCE)
```

**5. Limpiar caché y cookies:**
```javascript
// En DevTools Console:
localStorage.clear();
sessionStorage.clear();
// Luego recargar la página
```
