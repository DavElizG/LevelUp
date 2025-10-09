# Configuración de Base de Datos - LevelUp

## Pasos para configurar Supabase

### 1. Crear la tabla `water_logs`

Ve a tu proyecto en Supabase → SQL Editor y ejecuta:

```sql
-- Crear tabla para registro de agua
CREATE TABLE IF NOT EXISTS water_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_ml NUMERIC NOT NULL DEFAULT 250,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_water_logs_user_id ON water_logs(user_id);
CREATE INDEX idx_water_logs_logged_at ON water_logs(logged_at);

-- Habilitar Row Level Security (RLS)
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Users can view their own water logs"
ON water_logs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own water logs"
ON water_logs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own water logs"
ON water_logs FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

### 2. Verificar/Actualizar tabla `meal_logs`

Asegúrate de que la tabla `meal_logs` tenga todas las columnas necesarias:

```sql
-- Si la tabla no existe, créala
CREATE TABLE IF NOT EXISTS meal_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_name TEXT NOT NULL,
  quantity_grams NUMERIC NOT NULL,
  calories NUMERIC NOT NULL DEFAULT 0,
  protein NUMERIC DEFAULT 0,
  carbs NUMERIC DEFAULT 0,
  fat NUMERIC DEFAULT 0,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_id ON meal_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_logs_logged_at ON meal_logs(logged_at);
CREATE INDEX IF NOT EXISTS idx_meal_logs_meal_type ON meal_logs(meal_type);

-- Habilitar RLS
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Users can view their own meal logs"
ON meal_logs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal logs"
ON meal_logs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal logs"
ON meal_logs FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal logs"
ON meal_logs FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

### 3. Actualizar tabla `photo_food_analyses`

Asegúrate de que incluya la columna `meal_type`:

```sql
-- Agregar columna meal_type si no existe
ALTER TABLE photo_food_analyses 
ADD COLUMN IF NOT EXISTS meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack'));

-- Agregar columnas para resultados del análisis si no existen
ALTER TABLE photo_food_analyses 
ADD COLUMN IF NOT EXISTS estimated_calories NUMERIC,
ADD COLUMN IF NOT EXISTS estimated_protein NUMERIC,
ADD COLUMN IF NOT EXISTS estimated_carbs NUMERIC,
ADD COLUMN IF NOT EXISTS estimated_fat NUMERIC,
ADD COLUMN IF NOT EXISTS food_items JSONB,
ADD COLUMN IF NOT EXISTS error_message TEXT,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
```

## Funcionalidades Implementadas

### ✅ Registro de Agua
- **Ubicación:** Página Nutrition (`/nutrition`)
- **Funcionalidad:** 
  - Los usuarios pueden hacer clic en los vasos de agua para agregar/quitar consumo
  - Cada vaso representa 250ml de agua
  - El progreso se muestra visualmente con una barra
  - Los datos se guardan en la tabla `water_logs`
  - Se muestra el total consumido vs objetivo diario (2.5L)

### ✅ Registro de Comidas
- **Ubicación:** Múltiples páginas
  - `/nutrition` - Vista general con macros del día
  - `/meal-log` - Registro detallado de comidas
  - `/food-search` - Búsqueda de alimentos
  - `/food-photo-analyzer` - Análisis con cámara

- **Funcionalidad:**
  - Búsqueda manual de alimentos en la base de datos
  - Análisis automático mediante foto con IA
  - Todas las comidas se guardan en `meal_logs` con:
    - Nombre del alimento
    - Cantidad en gramos
    - Calorías totales
    - Macronutrientes (proteínas, carbohidratos, grasas)
    - Tipo de comida (desayuno, almuerzo, cena, merienda)
    - Timestamp

### ✅ Vista de Macronutrientes
- **Ubicación:** Página Nutrition
- **Funcionalidad:**
  - Círculo de progreso para calorías totales
  - Barras de progreso para proteínas, carbohidratos y grasas
  - Datos calculados en tiempo real desde `meal_logs`
  - Actualización automática al agregar comidas

### ✅ Análisis de Fotos con IA
- **Ubicación:** `/food-photo-analyzer`
- **Funcionalidad:**
  - Tomar foto con la cámara del dispositivo (web o nativo)
  - Subir la foto a Supabase Storage
  - Crear un registro en `photo_food_analyses` para procesamiento
  - Agregar un placeholder en `meal_logs` con estimaciones iniciales
  - (Nota: Requiere un worker de IA separado para el análisis real)

## Próximos Pasos

Para completar el sistema de análisis de fotos, necesitarás:

1. **Worker de IA** que:
   - Escuche los nuevos registros en `photo_food_analyses` con status 'pending'
   - Analice la imagen usando un modelo de visión (ej: GPT-4 Vision, Claude Vision)
   - Actualice los campos `estimated_*` con los resultados
   - Actualice el status a 'completed'
   - Actualice el registro correspondiente en `meal_logs` con datos reales

2. **Configuración de Storage:**
   - Crear el bucket `food-photos` en Supabase Storage
   - Configurar políticas de acceso público para lectura
   - Configurar límites de tamaño de archivo (10MB recomendado)

## Verificación

Para verificar que todo está configurado correctamente:

1. Inicia sesión en la app
2. Ve a la página Nutrition
3. Intenta agregar/quitar vasos de agua
4. Verifica que los cambios se reflejen en tiempo real
5. Agrega una comida manualmente
6. Verifica que las calorías y macros se actualicen
7. Toma una foto de comida
8. Verifica que se agregue un placeholder en la lista de comidas

## Troubleshooting

### "Error al actualizar el agua"
- Verifica que la tabla `water_logs` existe
- Verifica que las políticas RLS están configuradas correctamente
- Verifica que el usuario está autenticado

### "No se muestran las calorías"
- Verifica que `meal_logs` tiene datos para el día actual
- Verifica que las columnas de macros tienen valores numéricos
- Abre la consola del navegador para ver errores

### "Error al subir la foto"
- Verifica que el bucket `food-photos` existe en Supabase Storage
- Verifica que las políticas de Storage permiten upload
- Verifica el tamaño del archivo (max 10MB recomendado)
