# Sistema de Internacionalización (i18n)

## 📋 Descripción General

El proyecto LevelUp ahora cuenta con soporte para múltiples idiomas utilizando **react-i18next**. Actualmente soporta:

- 🇪🇸 Español (es) - Idioma por defecto
- 🇺🇸 Inglés (en)
- 🇫🇷 Francés (fr)
- 🇧🇷 Portugués (pt)

## 🚀 Configuración

### Dependencias Instaladas

```json
{
  "i18next": "^23.x.x",
  "react-i18next": "^14.x.x",
  "i18next-browser-languagedetector": "^7.x.x"
}
```

### Estructura de Archivos

```
src/
├── i18n/
│   ├── config.ts           # Configuración de i18next
│   ├── index.ts            # Exportaciones principales
│   └── locales/            # Archivos de traducción
│       ├── es.json         # Español
│       ├── en.json         # Inglés
│       ├── fr.json         # Francés
│       └── pt.json         # Portugués
├── hooks/
│   └── useLanguage.ts      # Hook personalizado para idiomas
└── components/
    └── shared/
        └── LanguageSelector.tsx  # Componente selector de idioma
```

## 💻 Uso

### 1. Usar traducciones en componentes

```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('common.loading')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
};
```

### 2. Usar el hook personalizado

```tsx
import { useLanguage } from '../hooks/useLanguage';

const MyComponent = () => {
  const { currentLanguage, changeLanguage, languages, t } = useLanguage();

  return (
    <div>
      <p>Idioma actual: {currentLanguage}</p>
      <button onClick={() => changeLanguage('en')}>
        {t('profile.language')}
      </button>
    </div>
  );
};
```

### 3. Selector de idioma

```tsx
import LanguageSelector from '../../components/shared/LanguageSelector';

const Settings = () => {
  return (
    <div>
      <h2>Configuración</h2>
      <LanguageSelector />
    </div>
  );
};
```

## 📝 Estructura de las Traducciones

Las traducciones están organizadas por categorías:

```json
{
  "common": {
    "loading": "...",
    "error": "...",
    "save": "..."
  },
  "auth": {
    "login": "...",
    "register": "...",
    "email": "..."
  },
  "navigation": {
    "dashboard": "...",
    "workouts": "...",
    "nutrition": "..."
  },
  "setup": { ... },
  "workouts": { ... },
  "nutrition": { ... },
  "profile": { ... },
  "progress": { ... }
}
```

## ➕ Agregar nuevas traducciones

### 1. Agregar una nueva clave

Edita todos los archivos de idioma en `src/i18n/locales/`:

**es.json:**
```json
{
  "mySection": {
    "myKey": "Mi texto en español"
  }
}
```

**en.json:**
```json
{
  "mySection": {
    "myKey": "My text in English"
  }
}
```

### 2. Usar la nueva traducción

```tsx
const { t } = useTranslation();
return <p>{t('mySection.myKey')}</p>;
```

## 🌐 Agregar un nuevo idioma

### 1. Crear archivo de traducción

Crea un nuevo archivo en `src/i18n/locales/`, por ejemplo `de.json` para alemán:

```json
{
  "common": {
    "loading": "Wird geladen...",
    ...
  }
}
```

### 2. Registrar en la configuración

Edita `src/i18n/config.ts`:

```typescript
import de from './locales/de.json';

i18n.init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    fr: { translation: fr },
    pt: { translation: pt },
    de: { translation: de }, // Nuevo idioma
  },
  supportedLngs: ['en', 'es', 'fr', 'pt', 'de'],
  ...
});
```

### 3. Agregar al hook useLanguage

Edita `src/hooks/useLanguage.ts`:

```typescript
const languages = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' }, // Nuevo
];
```

## 🔧 Características

### Detección automática de idioma

El sistema detecta automáticamente el idioma preferido del usuario en este orden:

1. **LocalStorage** - Si el usuario ya seleccionó un idioma
2. **Navegador** - Idioma del navegador del usuario
3. **HTML Tag** - Idioma especificado en el tag HTML
4. **Fallback** - Español (idioma por defecto)

### Persistencia

El idioma seleccionado se guarda automáticamente en `localStorage` con la clave `i18nextLng`.

### Cambio dinámico

El idioma se puede cambiar en tiempo real sin necesidad de recargar la página:

```tsx
const { changeLanguage } = useLanguage();
changeLanguage('en'); // Cambia a inglés inmediatamente
```

## 📱 Integración con Componentes Existentes

### Ejemplo: Login

```tsx
import { useTranslation } from 'react-i18next';

const Login = () => {
  const { t } = useTranslation();

  return (
    <form>
      <input placeholder={t('auth.email')} />
      <input placeholder={t('auth.password')} />
      <button>{t('auth.login')}</button>
    </form>
  );
};
```

### Ejemplo: Navigation

```tsx
const navItems = [
  { id: 'home', label: t('navigation.dashboard'), path: '/dashboard' },
  { id: 'workouts', label: t('navigation.workouts'), path: '/workouts' },
  { id: 'nutrition', label: t('navigation.nutrition'), path: '/nutrition' },
  { id: 'progress', label: t('navigation.progress'), path: '/progress' },
  { id: 'profile', label: t('navigation.profile'), path: '/profile' },
];
```

## 🎨 Componente LanguageSelector

El selector de idioma incluye:

- ✅ Dropdown con todos los idiomas disponibles
- ✅ Indicador visual del idioma actual
- ✅ Banderas para fácil identificación
- ✅ Cierre al hacer clic fuera
- ✅ Soporte para tema oscuro
- ✅ Diseño responsive

## 🚧 Próximos Pasos

1. **Migrar componentes existentes** - Reemplazar textos hardcodeados por traducciones
2. **Ampliar traducciones** - Agregar más textos y mensajes
3. **Validación** - Revisar que todas las traducciones sean coherentes
4. **Testing** - Probar el cambio de idioma en todos los componentes
5. **Documentar** - Crear guía de estilo para traducciones

## 📖 Referencias

- [react-i18next Documentation](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)
- [Language Codes (ISO 639-1)](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)

## 🐛 Troubleshooting

### Las traducciones no aparecen

1. Verifica que importaste i18n en `main.tsx`
2. Asegúrate de que la clave existe en todos los archivos de idioma
3. Revisa la consola para errores de i18next

### El idioma no cambia

1. Verifica que el código de idioma esté en `supportedLngs`
2. Limpia el localStorage si es necesario
3. Recarga la página

### Advertencias de keys faltantes

Asegúrate de que todas las keys existan en todos los archivos de idioma. i18next mostrará advertencias en la consola si falta alguna traducción.
