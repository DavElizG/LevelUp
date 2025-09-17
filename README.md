# 🏋️ LevelUp Gym App

**LevelUp** es una aplicación de fitness con inteligencia artificial que ofrece rutinas de entrenamiento personalizadas y planes de dieta adaptados a cada usuario.

## 🚀 Stack Tecnológico

- **Frontend**: React 19 + TypeScript + Vite
- **Móvil**: Capacitor (Android/iOS)
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Gestión de paquetes**: pnpm
- **IA**: OpenAI/Gemini APIs para generación de contenido

## ✨ Características Principales

- 💪 **Rutinas de Entrenamiento**: Generación automática de rutinas personalizadas con IA
- 🥗 **Planes de Dieta**: Recomendaciones nutricionales adaptadas a objetivos
- 📅 **Calendario de Entrenamientos**: Seguimiento de progreso y planificación
- 👥 **Dashboard Administrativo**: Panel de control para gestión de usuarios
- 🔐 **Autenticación**: Sistema seguro de login y registro
- 📱 **Multiplataforma**: Web, Android e iOS

## 🛠️ Guía de Desarrollo

### Prerrequisitos

- Node.js 18+ 
- pnpm (gestor de paquetes)
- Android Studio (para desarrollo Android)
- Git

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/DavElizG/LevelUp.git
   cd LevelUp
   ```

2. **Instalar dependencias**
   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus claves de Supabase y APIs
   ```

### Comandos de Desarrollo

#### 🌐 Desarrollo Web
```bash
# Servidor de desarrollo (Hot Reload)
pnpm run dev

# Build de producción
pnpm run build

# Preview del build
pnpm run preview

# Linting
pnpm run lint
```

#### 📱 Desarrollo Móvil

```bash
# Sincronizar cambios con plataformas nativas
npx cap sync

# Abrir en Android Studio
npx cap open android

# Abrir en Xcode (macOS únicamente)
npx cap open ios

# Build y sync en un comando
pnpm run build && npx cap sync
```

#### 🔧 Capacitor - Gestión de Plataformas

```bash
# Agregar plataforma Android
npx cap add android

# Agregar plataforma iOS (requiere macOS)
npx cap add ios

# Ejecutar en dispositivo Android
npx cap run android

# Ejecutar en simulador iOS
npx cap run ios
```

### 📁 Estructura del Proyecto

```
LevelUp/
├── src/
│   ├── components/       # Componentes reutilizables
│   ├── screens/         # Pantallas principales
│   │   ├── Auth/        # Login/Registro
│   │   ├── Rutina/      # Entrenamientos
│   │   ├── Dieta/       # Nutrición
│   │   └── Dashboard/   # Panel admin
│   ├── services/        # APIs y lógica de negocio
│   ├── hooks/          # Custom React hooks
│   ├── types/          # Definiciones TypeScript
│   ├── utils/          # Funciones utilitarias
│   └── constants/      # Constantes de la app
├── android/            # Proyecto Android nativo
├── dist/              # Build de producción
├── public/            # Archivos estáticos
└── capacitor.config.ts # Configuración Capacitor
```

### 🌍 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Supabase
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key

# APIs de IA
VITE_OPENAI_API_KEY=tu_openai_key
VITE_GEMINI_API_KEY=tu_gemini_key

# Configuración de desarrollo
VITE_APP_ENV=development
```

### 🚀 Deployment

#### Web
```bash
# Build optimizado
pnpm run build

# Los archivos están en /dist para deployment
```

#### Android
```bash
# Generar APK/AAB en Android Studio
npx cap open android
# En Android Studio: Build → Generate Signed Bundle/APK
```

### 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

### 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

### 📞 Contacto

- **Desarrollador**: DavElizG
- **Repositorio**: [https://github.com/DavElizG/LevelUp](https://github.com/DavElizG/LevelUp)

---

*Desarrollado con ❤️ para la comunidad fitness*