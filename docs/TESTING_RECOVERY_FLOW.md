# 🧪 Guía de Pruebas - Password Recovery Flow Fix

## 📋 Pre-requisitos

Antes de comenzar las pruebas:

### 1. Verificar Configuración de Supabase

**Authentication → URL Configuration**:

```
Site URL: http://localhost:5173
Redirect URLs:
  - http://localhost:5173/**
  - http://localhost:5173/reset-password
```

### 2. Verificar Email Template

**Authentication → Email Templates → Reset Password**:

```html
<a href="{{ .SiteURL }}/reset-password?type=recovery&access_token={{ .Token }}">
  Restablecer contraseña
</a>
```

### 3. Levantar la aplicación

```bash
cd LevelUp
pnpm dev
```

Espera a que se abra en `http://localhost:5173`

---

## ✅ Caso de Prueba 1: Flujo Normal de Recuperación

### Objetivo
Verificar que el link de recuperación del email muestra el formulario correctamente.

### Pasos

1. **Solicitar reset password**:
   - Ve a `/login`
   - Haz clic en "¿Olvidaste tu contraseña?"
   - Ingresa tu email (debe existir en la base de datos)
   - Haz clic en "Enviar enlace de recuperación"
   - ✅ Deberías ver: "Revisa tu email para el enlace de recuperación"

2. **Revisar email**:
   - Abre tu bandeja de entrada
   - Busca el email de "Reset Password" de LevelUp
   - ⚠️ Si no lo ves, revisa spam/correo no deseado

3. **Hacer clic en el link del email**:
   - Haz clic en "Restablecer contraseña"
   - ⚠️ **VERIFICACIÓN CRÍTICA**: Deberías ver el formulario de cambio de contraseña
   - ❌ **NO deberías** ser redirigido al dashboard

4. **Verificar la URL**:
   ```
   http://localhost:5173/reset-password?type=recovery&access_token=...
   ```
   - ✅ Debe contener `type=recovery`
   - ✅ Debe contener `access_token=...`

5. **Cambiar la contraseña**:
   - Ingresa una nueva contraseña (mínimo 6 caracteres)
   - Confirma la nueva contraseña
   - Haz clic en "Actualizar contraseña"
   - ✅ Deberías ver: "Contraseña actualizada exitosamente"

6. **Verificar logout automático**:
   - ✅ Deberías ser redirigido a `/login`
   - ✅ Deberías ver mensaje: "Contraseña actualizada. Inicia sesión nuevamente"

7. **Iniciar sesión con nueva contraseña**:
   - Ingresa tu email
   - Ingresa la **nueva contraseña**
   - ✅ Deberías poder iniciar sesión correctamente
   - ✅ Deberías ser redirigido al dashboard

### Resultado Esperado

| Paso | Esperado | ¿Funciona? |
|------|----------|------------|
| Email recibido | ✅ | [ ] |
| Link abre formulario | ✅ | [ ] |
| NO redirige a dashboard | ✅ | [ ] |
| Permite cambiar contraseña | ✅ | [ ] |
| Logout automático | ✅ | [ ] |
| Login con nueva contraseña | ✅ | [ ] |

---

## ⏰ Caso de Prueba 2: Token Expirado

### Objetivo
Verificar que los tokens expirados muestran error apropiado.

### Pasos

1. **Solicitar reset password**:
   - Ve a `/login` → "¿Olvidaste tu contraseña?"
   - Ingresa tu email y solicita el link

2. **ESPERAR 1+ hora** ⏳
   - Los tokens de recuperación expiran en 1 hora (configuración de Supabase)
   - Puedes configurar un tiempo menor en Supabase Dashboard para testing:
     - Authentication → Settings → Auth Providers → Email
     - "Email OTP expiration time": Cambia de 3600 a 300 (5 minutos) para pruebas

3. **Hacer clic en el link expirado**:
   - ✅ Deberías ver mensaje de error: "Token expirado o inválido"
   - ✅ Deberías ver opción: "Solicitar nuevo enlace"

4. **Solicitar nuevo enlace**:
   - Haz clic en "Solicitar nuevo enlace"
   - ✅ Deberías ser redirigido a la página de "Forgot Password"
   - Completa el flujo normal (Caso de Prueba 1)

### Resultado Esperado

| Paso | Esperado | ¿Funciona? |
|------|----------|------------|
| Token expirado detectado | ✅ | [ ] |
| Mensaje de error mostrado | ✅ | [ ] |
| Opción de solicitar nuevo link | ✅ | [ ] |
| Nuevo flujo funciona | ✅ | [ ] |

---

## 🚫 Caso de Prueba 3: Token Inválido o Manipulado

### Objetivo
Verificar que tokens inválidos son rechazados por seguridad.

### Pasos

1. **Solicitar reset password normal**:
   - Obtén un link válido del email

2. **Manipular la URL**:
   - Copia el link completo
   - Modifica el `access_token` (cambia algunos caracteres)
   - Ejemplo:
     ```
     Válido:   ...&access_token=abc123xyz789...
     Inválido: ...&access_token=abc999xyz789...
     ```

3. **Pegar la URL manipulada en el navegador**:
   - ✅ Deberías ver mensaje de error
   - ✅ NO deberías poder cambiar la contraseña
   - ✅ Deberías ser redirigido a `/login` con error

### Resultado Esperado

| Paso | Esperado | ¿Funciona? |
|------|----------|------------|
| Token inválido detectado | ✅ | [ ] |
| Error mostrado | ✅ | [ ] |
| NO permite cambio | ✅ | [ ] |
| Redirect a login | ✅ | [ ] |

---

## 🔐 Caso de Prueba 4: Usuario Ya Autenticado

### Objetivo
Verificar que usuarios autenticados no pueden "hackear" el recovery flow.

### Pasos

1. **Iniciar sesión normalmente**:
   - Ve a `/login`
   - Inicia sesión con email y contraseña válidos
   - ✅ Deberías estar en el dashboard

2. **Intentar acceder a /reset-password sin token**:
   - Manualmente ingresa en la barra de direcciones:
     ```
     http://localhost:5173/reset-password
     ```
   - (Sin parámetros `?type=recovery&access_token=...`)

3. **Verificar comportamiento**:
   - ✅ Deberías ser redirigido al dashboard
   - ✅ NO deberías ver el formulario de reset

4. **Intentar acceder con parámetros falsos**:
   - Manualmente ingresa:
     ```
     http://localhost:5173/reset-password?type=recovery
     ```
   - (Con `type=recovery` pero sin `access_token`)

5. **Verificar comportamiento**:
   - ✅ Deberías ser redirigido al dashboard
   - ✅ `isRecoveryFlow()` retorna `false` porque falta el token

### Resultado Esperado

| Paso | Esperado | ¿Funciona? |
|------|----------|------------|
| Acceso sin token → redirect | ✅ | [ ] |
| Acceso con solo type → redirect | ✅ | [ ] |
| NO muestra formulario | ✅ | [ ] |
| Dashboard se muestra | ✅ | [ ] |

---

## 🌐 Caso de Prueba 5: Diferentes Formatos de URL

### Objetivo
Verificar que el helper `isRecoveryFlow()` detecta tokens en query params Y hash fragments.

### Pasos

#### A. Query Params (Implicit Flow)

```
http://localhost:5173/reset-password?type=recovery&access_token=xyz123
```

- ✅ Formulario debe mostrarse
- ✅ No debe redirigir a dashboard

#### B. Hash Fragments (PKCE Flow)

```
http://localhost:5173/reset-password#access_token=xyz123&type=recovery
```

- ✅ Formulario debe mostrarse
- ✅ No debe redirigir a dashboard

#### C. Mixto (edge case poco común)

```
http://localhost:5173/reset-password?other=param#access_token=xyz123&type=recovery
```

- ✅ Formulario debe mostrarse
- ✅ No debe redirigir a dashboard

### Resultado Esperado

| Formato | Esperado | ¿Funciona? |
|---------|----------|------------|
| Query params | ✅ Muestra formulario | [ ] |
| Hash fragments | ✅ Muestra formulario | [ ] |
| Mixto | ✅ Muestra formulario | [ ] |

---

## 🕐 Caso de Prueba 6: Clock Skew (Integración)

### Objetivo
Verificar que el Recovery Flow Fix no rompe el Clock Skew Fix previo.

### Pasos

1. **Simular clock skew** (opcional, requiere manipular hora del sistema):
   - Adelanta el reloj de tu sistema 10 minutos
   - O retrasa el reloj 10 minutos

2. **Solicitar reset password**:
   - Completa el flujo normal de recuperación
   - Haz clic en el link del email

3. **Verificar comportamiento**:
   - ✅ El formulario debe mostrarse (Recovery Flow Fix)
   - ✅ El token debe validarse correctamente (Clock Skew Fix con fallback)
   - ✅ NO deberías ver error de "Session issued in future"

4. **Cambiar contraseña**:
   - ✅ Debe permitir cambiar la contraseña
   - ✅ Debe hacer logout y redirigir a login

### Resultado Esperado

| Componente | Esperado | ¿Funciona? |
|------------|----------|------------|
| Recovery Flow Fix activo | ✅ | [ ] |
| Clock Skew Fix activo | ✅ | [ ] |
| Ambos trabajan juntos | ✅ | [ ] |
| Sin errores de timestamp | ✅ | [ ] |

---

## 📱 Caso de Prueba 7: Mobile (Capacitor)

### Objetivo
Verificar que el fix funciona en la versión móvil con Capacitor.

### Pasos

1. **Compilar para Android**:
   ```bash
   pnpm build
   npx cap sync
   npx cap open android
   ```

2. **Ejecutar en emulador o dispositivo**

3. **Solicitar reset password desde la app**:
   - Haz clic en "¿Olvidaste tu contraseña?"
   - Ingresa tu email

4. **Abrir email en el dispositivo móvil**:
   - ⚠️ El link del email debe abrir la app (no el navegador)
   - Esto requiere configurar Deep Links en Capacitor

5. **Verificar comportamiento**:
   - ✅ La app debe abrirse en la pantalla de reset password
   - ✅ El formulario debe mostrarse
   - ✅ Debe permitir cambiar la contraseña

### Resultado Esperado

| Paso | Esperado | ¿Funciona? |
|------|----------|------------|
| Email recibido en móvil | ✅ | [ ] |
| Link abre la app | ✅ | [ ] |
| Formulario se muestra | ✅ | [ ] |
| Cambio de contraseña funciona | ✅ | [ ] |

---

## 🐛 Debugging Tips

### Si el formulario no se muestra

1. **Abrir DevTools Console**:
   ```javascript
   // Verificar si isRecoveryFlow() está funcionando
   const urlParams = new URLSearchParams(window.location.search);
   const hashParams = window.location.hash ? new URLSearchParams(window.location.hash.substring(1)) : null;
   console.log('Query type:', urlParams.get('type'));
   console.log('Query token:', urlParams.get('access_token'));
   console.log('Hash type:', hashParams?.get('type'));
   console.log('Hash token:', hashParams?.get('access_token'));
   ```

2. **Verificar sesión de Supabase**:
   ```javascript
   // En la consola del navegador
   supabase.auth.getSession().then(console.log);
   ```

3. **Revisar React Router**:
   - Busca en console logs si hay navegaciones inesperadas
   - Verifica que no haya múltiples `<Navigate>` components ejecutándose

### Si el token siempre expira

1. **Verificar configuración de Supabase**:
   - Authentication → Settings → Auth Providers → Email
   - "Email OTP expiration time": Debe ser al menos 3600 (1 hora)

2. **Verificar hora del sistema**:
   ```bash
   # Windows
   echo %date% %time%
   
   # Compara con hora UTC real
   ```

### Si hay errores de CORS

1. **Verificar Site URL en Supabase**:
   - Debe coincidir exactamente con `http://localhost:5173`
   - NO uses `https://` en localhost

2. **Verificar Redirect URLs**:
   - Debe incluir `http://localhost:5173/**`

---

## 📊 Resumen de Pruebas

Al completar todas las pruebas, deberías tener:

| # | Caso de Prueba | Estado |
|---|----------------|--------|
| 1 | Flujo normal de recuperación | [ ] ✅ [ ] ❌ |
| 2 | Token expirado | [ ] ✅ [ ] ❌ |
| 3 | Token inválido | [ ] ✅ [ ] ❌ |
| 4 | Usuario autenticado | [ ] ✅ [ ] ❌ |
| 5 | Diferentes formatos de URL | [ ] ✅ [ ] ❌ |
| 6 | Integración con Clock Skew Fix | [ ] ✅ [ ] ❌ |
| 7 | Mobile (Capacitor) | [ ] ✅ [ ] ❌ |

**Criterio de éxito**: Al menos los casos 1-4 deben pasar. Los casos 5-7 son opcionales dependiendo de tu configuración.

---

## 🔧 Troubleshooting Adicional

### Logs Útiles

Agrega estos logs temporalmente si necesitas debugging:

**En `src/routes/routes.tsx` (AuthRoutes)**:

```typescript
const isRecoveryFlow = (): boolean => {
  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = window.location.hash 
    ? new URLSearchParams(window.location.hash.substring(1)) 
    : null;
  
  const type = urlParams.get('type') || hashParams?.get('type');
  const accessToken = urlParams.get('access_token') || hashParams?.get('access_token');
  
  const result = type === 'recovery' && !!accessToken;
  
  // 🐛 DEBUG LOG (remover después)
  console.log('🔍 isRecoveryFlow check:', {
    type,
    hasToken: !!accessToken,
    result,
    url: window.location.href
  });
  
  return result;
};
```

### Verificar Estado de Auth

```typescript
// En useAuth.ts, agrega logs en el onAuthStateChange
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log('🔐 Auth event:', event, { session });
      // ... resto del código
    }
  );
}, []);
```

---

## ✅ Checklist Final

Antes de considerar el fix completo:

- [ ] Caso de prueba 1 pasa
- [ ] Caso de prueba 2 pasa
- [ ] Caso de prueba 3 pasa
- [ ] Caso de prueba 4 pasa
- [ ] No hay errores en console
- [ ] No hay warnings de React Router
- [ ] Clock Skew Fix sigue funcionando
- [ ] Commit realizado con mensaje descriptivo
- [ ] Documentación actualizada (`RECOVERY_FLOW_FIX.md`)
- [ ] Push a la rama Jose

Si todos los checkmarks están completos, el fix está listo para QA/Production! 🎉
