import { useState } from 'react';
import { Settings, Save, Key, Zap, Flag, Database, AlertCircle } from 'lucide-react';

interface ConfigSection {
  title: string;
  description: string;
  icon: typeof Settings;
  fields: ConfigField[];
}

interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  value: string | number | boolean;
  options?: Array<{ label: string; value: string }>;
  description?: string;
  sensitive?: boolean;
}

export function SystemSettingsPage() {
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [aiConfig, setAiConfig] = useState<ConfigField[]>([
    {
      key: 'gemini_api_key',
      label: 'Google Gemini API Key',
      type: 'text',
      value: '••••••••••••••••',
      sensitive: true,
      description: 'Clave API para Google Gemini (versión gratuita)',
    },
    {
      key: 'ai_temperature',
      label: 'Temperature',
      type: 'number',
      value: 0.7,
      description: 'Creatividad del modelo (0.0 - 1.0)',
    },
    {
      key: 'ai_max_tokens',
      label: 'Max Tokens',
      type: 'number',
      value: 2000,
      description: 'Máximo de tokens por respuesta',
    },
  ]);

  const [rateLimits, setRateLimits] = useState<ConfigField[]>([
    {
      key: 'api_rate_limit_per_minute',
      label: 'Límite API por Minuto',
      type: 'number',
      value: 60,
      description: 'Solicitudes máximas por minuto por usuario',
    },
    {
      key: 'ai_generations_per_day',
      label: 'Generaciones IA por Día',
      type: 'number',
      value: 10,
      description: 'Generaciones de IA permitidas por usuario al día',
    },
    {
      key: 'max_routines_per_user',
      label: 'Máximo de Rutinas',
      type: 'number',
      value: 50,
      description: 'Rutinas máximas que puede crear un usuario',
    },
    {
      key: 'max_diet_plans_per_user',
      label: 'Máximo de Planes de Dieta',
      type: 'number',
      value: 20,
      description: 'Planes de dieta máximos por usuario',
    },
  ]);

  const [featureFlags, setFeatureFlags] = useState<ConfigField[]>([
    {
      key: 'enable_ai_workout_generation',
      label: 'Generación de Rutinas con IA',
      type: 'boolean',
      value: true,
      description: 'Permitir a los usuarios generar rutinas con IA',
    },
    {
      key: 'enable_ai_diet_generation',
      label: 'Generación de Dietas con IA',
      type: 'boolean',
      value: true,
      description: 'Permitir a los usuarios generar planes de dieta con IA',
    },
    {
      key: 'enable_public_routines',
      label: 'Rutinas Públicas',
      type: 'boolean',
      value: true,
      description: 'Permitir que las rutinas sean públicas',
    },
    {
      key: 'enable_social_features',
      label: 'Funciones Sociales',
      type: 'boolean',
      value: false,
      description: 'Activar seguimiento de usuarios y funciones sociales',
    },
    {
      key: 'maintenance_mode',
      label: 'Modo Mantenimiento',
      type: 'boolean',
      value: false,
      description: 'Poner la aplicación en modo mantenimiento',
    },
  ]);

  const [systemConfig, setSystemConfig] = useState<ConfigField[]>([
    {
      key: 'app_name',
      label: 'Nombre de la Aplicación',
      type: 'text',
      value: 'LevelUp Gym',
      description: 'Nombre mostrado en la aplicación',
    },
    {
      key: 'support_email',
      label: 'Email de Soporte',
      type: 'text',
      value: 'support@levelupgym.com',
      description: 'Email de contacto para soporte',
    },
    {
      key: 'session_timeout_minutes',
      label: 'Timeout de Sesión (minutos)',
      type: 'number',
      value: 60,
      description: 'Minutos de inactividad antes de cerrar sesión',
    },
    {
      key: 'enable_registration',
      label: 'Registro Abierto',
      type: 'boolean',
      value: true,
      description: 'Permitir que nuevos usuarios se registren',
    },
  ]);

  const configSections: ConfigSection[] = [
    {
      title: 'Configuración de IA',
      description: 'Configuración de modelos de inteligencia artificial y generación de contenido',
      icon: Zap,
      fields: aiConfig,
    },
    {
      title: 'Límites y Rate Limiting',
      description: 'Control de uso de recursos y límites por usuario',
      icon: AlertCircle,
      fields: rateLimits,
    },
    {
      title: 'Feature Flags',
      description: 'Activar o desactivar funcionalidades del sistema',
      icon: Flag,
      fields: featureFlags,
    },
    {
      title: 'Configuración General',
      description: 'Configuración general del sistema y la aplicación',
      icon: Database,
      fields: systemConfig,
    },
  ];

  const handleFieldChange = (
    sectionFields: ConfigField[],
    setter: React.Dispatch<React.SetStateAction<ConfigField[]>>,
    key: string,
    value: string | number | boolean
  ) => {
    setter(
      sectionFields.map(field =>
        field.key === key ? { ...field, value } : field
      )
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Implement save to database/API
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setHasChanges(false);
    console.log('Saving configuration...', {
      aiConfig,
      rateLimits,
      featureFlags,
      systemConfig,
    });
  };

  const renderField = (
    field: ConfigField,
    sectionFields: ConfigField[],
    setter: React.Dispatch<React.SetStateAction<ConfigField[]>>
  ) => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type={field.sensitive ? 'password' : 'text'}
            value={field.value as string}
            onChange={(e) => handleFieldChange(sectionFields, setter, field.key, e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={field.label}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={field.value as number}
            onChange={(e) => handleFieldChange(sectionFields, setter, field.key, parseFloat(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            step={field.key.includes('temperature') ? 0.1 : 1}
          />
        );
      
      case 'boolean':
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={field.value as boolean}
              onChange={(e) => handleFieldChange(sectionFields, setter, field.key, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-700">
              {field.value ? 'Activado' : 'Desactivado'}
            </span>
          </label>
        );
      
      case 'select':
        return (
          <select
            value={field.value as string}
            onChange={(e) => handleFieldChange(sectionFields, setter, field.key, e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
          <p className="text-gray-600 mt-1">Administra la configuración global de LevelUp</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      {hasChanges && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <p className="text-sm text-yellow-800">
              Tienes cambios sin guardar. Haz clic en "Guardar Cambios" para aplicarlos.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {configSections.map((section, index) => {
          const Icon = section.icon;
          const setter = 
            index === 0 ? setAiConfig :
            index === 1 ? setRateLimits :
            index === 2 ? setFeatureFlags :
            setSystemConfig;

          return (
            <div key={section.title} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                    <p className="text-sm text-gray-600">{section.description}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {section.fields.map((field) => (
                  <div key={field.key} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        {field.label}
                        {field.sensitive && <Key className="inline w-3 h-3 ml-1 text-gray-400" />}
                      </label>
                      {field.description && (
                        <p className="text-xs text-gray-500">{field.description}</p>
                      )}
                    </div>
                    <div>
                      {renderField(field, section.fields, setter)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Warning about sensitive data */}
      <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-semibold text-red-900 mb-1">⚠️ Advertencia de Seguridad</h3>
            <p className="text-sm text-red-800">
              Los cambios en esta configuración pueden afectar significativamente el funcionamiento del sistema.
              Las claves API sensibles están enmascaradas por seguridad. Asegúrate de tener copias de seguridad
              antes de realizar cambios importantes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
