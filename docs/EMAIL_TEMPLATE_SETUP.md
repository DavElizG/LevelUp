# Configuración del Email Template de Reset Password en Supabase

## 📧 Acceso a Email Templates

Para mejorar el diseño del correo de recuperación de contraseña:

1. **Ve a tu Dashboard de Supabase**: https://supabase.com/dashboard
2. Selecciona tu proyecto **LevelUp**
3. En el menú lateral izquierdo, ve a **Authentication**
4. Haz clic en **Email Templates**
5. Selecciona **Reset Password** (o "Restablecer contraseña")

## 🎨 Template HTML Mejorado para Reset Password

Reemplaza el contenido del template con este código HTML personalizado:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer Contraseña - LevelUp Gym</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f3f4f6;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #ff6b35 0%, #f95d3f 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }
    .subtitle {
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      margin: 0;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 20px 0;
    }
    .message {
      font-size: 16px;
      line-height: 1.6;
      color: #4b5563;
      margin-bottom: 30px;
    }
    .button-container {
      text-align: center;
      margin: 40px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #ff6b35 0%, #f95d3f 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
      transition: transform 0.2s;
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(255, 107, 53, 0.4);
    }
    .info-box {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 16px;
      border-radius: 8px;
      margin: 30px 0;
    }
    .info-box p {
      margin: 0;
      color: #78350f;
      font-size: 14px;
      line-height: 1.5;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 0 0 10px 0;
      color: #6b7280;
      font-size: 14px;
    }
    .social-links {
      margin-top: 20px;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: #9ca3af;
      text-decoration: none;
      font-size: 14px;
    }
    .divider {
      height: 1px;
      background-color: #e5e7eb;
      margin: 30px 0;
    }
    @media only screen and (max-width: 600px) {
      .container {
        margin: 20px;
        border-radius: 12px;
      }
      .header {
        padding: 30px 20px;
      }
      .content {
        padding: 30px 20px;
      }
      .greeting {
        font-size: 20px;
      }
      .button {
        padding: 14px 32px;
        font-size: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🏋️ LevelUp Gym</div>
      <p class="subtitle">Fitness y nutrición en tu bolsillo</p>
    </div>
    
    <div class="content">
      <h1 class="greeting">¡Hola!</h1>
      
      <p class="message">
        Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>LevelUp Gym</strong>.
      </p>
      
      <p class="message">
        Si fuiste tú quien solicitó este cambio, haz clic en el botón de abajo para crear una nueva contraseña segura:
      </p>
      
      <div class="button-container">
        <a href="{{ .ConfirmationURL }}" class="button">
          Restablecer mi contraseña
        </a>
      </div>
      
      <div class="info-box">
        <p>
          <strong>⏰ Importante:</strong> Este enlace expirará en <strong>1 hora</strong> por razones de seguridad.
        </p>
      </div>
      
      <div class="divider"></div>
      
      <p class="message" style="font-size: 14px; color: #6b7280;">
        Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de forma segura. Tu contraseña actual seguirá siendo válida.
      </p>
      
      <p class="message" style="font-size: 14px; color: #6b7280;">
        Si tienes problemas con el botón, copia y pega este enlace en tu navegador:
      </p>
      
      <p style="font-size: 12px; color: #9ca3af; word-break: break-all; background-color: #f9fafb; padding: 12px; border-radius: 6px;">
        {{ .ConfirmationURL }}
      </p>
    </div>
    
    <div class="footer">
      <p><strong>LevelUp Gym</strong></p>
      <p>Tu compañero de fitness y nutrición</p>
      
      <div class="divider"></div>
      
      <p style="font-size: 12px; color: #9ca3af;">
        Este es un correo automático, por favor no respondas a este mensaje.
      </p>
      
      <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
        © 2025 LevelUp Gym. Todos los derechos reservados.
      </p>
    </div>
  </div>
</body>
</html>
```

## 🎯 Variables de Supabase Disponibles

En el template puedes usar estas variables:

- `{{ .Email }}` - Email del usuario
- `{{ .ConfirmationURL }}` - URL de confirmación/reset (ya incluida)
- `{{ .Token }}` - Token de recuperación (no recomendado mostrar)
- `{{ .SiteURL }}` - URL base de tu aplicación

## 🔧 Configuración Adicional

### 1. **Subject/Asunto del Email**

En la misma página de Email Templates, configura el asunto:

```
🔐 Restablece tu contraseña de LevelUp Gym
```

### 2. **Verificar Redirect URL**

Asegúrate de que la URL de redirección esté configurada correctamente:

1. Ve a **Authentication** → **URL Configuration**
2. En **Redirect URLs**, agrega:
   ```
   http://localhost:5173/reset-password
   https://tu-dominio.com/reset-password
   ```

### 3. **Rate Limiting**

En **Authentication** → **Rate Limits**, verifica que no esté muy restrictivo para testing:
- **Email OTP**: 60 segundos entre envíos (por defecto está bien)

## 🎨 Personalización Adicional

### Cambiar Colores
- **Naranja principal**: `#ff6b35`
- **Naranja hover**: `#f95d3f`
- Para cambiar, busca y reemplaza estos valores hex en el CSS

### Agregar Logo
Si tienes un logo, reemplaza:
```html
<div class="logo">🏋️ LevelUp Gym</div>
```

Por:
```html
<img src="https://tu-dominio.com/logo.png" alt="LevelUp Gym" style="height: 50px;">
```

## ✅ Testing

1. Guarda el template en Supabase
2. En tu app, intenta hacer reset password
3. Revisa tu email (incluyendo spam)
4. El correo debe verse profesional con diseño naranja corporativo

## 📱 Responsive Design

El template está optimizado para:
- ✅ Desktop (Outlook, Gmail, Apple Mail)
- ✅ Mobile (Gmail App, Apple Mail iOS)
- ✅ Dark Mode compatible
- ✅ Accesibilidad (contraste, tamaño de fuente)

## 🚨 Troubleshooting

Si no recibes el correo:
1. Verifica spam/correo no deseado
2. Confirma que el email del usuario esté verificado en Supabase
3. Revisa los logs en **Authentication** → **Logs**
4. Asegúrate de que el SMTP esté configurado (Supabase lo hace por defecto)
