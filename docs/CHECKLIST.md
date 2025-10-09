# ✅ Checklist de Configuración - LevelUp App

## 📋 Antes de Empezar

### Prerrequisitos
- [ ] Node.js 18+ instalado
- [ ] pnpm instalado (`npm install -g pnpm`)
- [ ] Cuenta de Supabase creada
- [ ] Proyecto de Supabase creado

---

## 🗄️ Configuración de Base de Datos

### Paso 1: Ejecutar Script de Setup
1. [ ] Abre tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. [ ] Ve a **SQL Editor** en el menú lateral
3. [ ] Crea una nueva query
4. [ ] Copia todo el contenido de `scripts/setup-database.sql`
5. [ ] Pega en el editor de SQL
6. [ ] Click en **Run** o presiona `Ctrl+Enter`
7. [ ] Verifica que veas el mensaje: "Database setup completed successfully!"

### Paso 2: Verificar Instalación
1. [ ] Crea una nueva query en SQL Editor
2. [ ] Copia todo el contenido de `scripts/verify-database.sql`
3. [ ] Ejecuta el script
4. [ ] Verifica que:
   - [ ] Todas las tablas existen (water_logs, meal_logs, photo_food_analyses, foods)
   - [ ] RLS está habilitado en todas las tablas
   - [ ] Existen políticas de seguridad
   - [ ] Hay datos de ejemplo en la tabla foods

---

## 💾 Configuración de Storage

### Crear Bucket para Fotos de Comida
1. [ ] En Supabase Dashboard, ve a **Storage**
2. [ ] Click en **New bucket**
3. [ ] Configura el bucket:
   - **Name:** `food-photos`
   - **Public:** ✅ Yes
   - **File size limit:** `10 MB`
   - **Allowed MIME types:** `image/jpeg, image/png, image/webp`
4. [ ] Click en **Create bucket**
5. [ ] Ve a las políticas del bucket (Policies tab)
6. [ ] Verifica que existan políticas para:
   - [ ] Usuarios pueden subir fotos
   - [ ] Usuarios pueden ver sus propias fotos
   - [ ] Lectura pública permitida

**Si las políticas no existen, créalas manualmente:**

```sql
-- Política 1: Usuarios pueden subir
CREATE POLICY "Users can upload food photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'food-photos');

-- Política 2: Usuarios pueden ver sus fotos
CREATE POLICY "Users can view their own food photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'food-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política 3: Lectura pública
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'food-photos');
```

---

## ⚙️ Configuración del Proyecto

### Variables de Entorno
1. [ ] Copia `.env.example` a `.env`
2. [ ] En Supabase Dashboard, ve a **Settings → API**
3. [ ] Copia los valores y actualiza tu `.env`:
   ```env
   VITE_SUPABASE_URL=tu_proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
   ```
4. [ ] Guarda el archivo `.env`

### Instalación de Dependencias
```bash
# En la terminal, en la raíz del proyecto:
pnpm install
```
- [ ] Todas las dependencias instaladas correctamente
- [ ] No hay errores en la consola

---

## 🚀 Iniciar la Aplicación

### Modo Desarrollo
```bash
pnpm run dev
```
- [ ] El servidor de desarrollo inicia correctamente
- [ ] Ves la URL (generalmente `http://localhost:5173`)
- [ ] Puedes abrir la app en el navegador

---

## 🧪 Testing de Funcionalidades

### Test 1: Autenticación
1. [ ] Abre la app en el navegador
2. [ ] Registra un nuevo usuario
3. [ ] Verifica que recibes el email de confirmación
4. [ ] Confirma el email
5. [ ] Inicia sesión correctamente

### Test 2: Vista Nutrition
1. [ ] Navega a la página `/nutrition`
2. [ ] Verifica que ves:
   - [ ] Círculo de progreso de calorías (0 / 2400 kcal)
   - [ ] Barras de macronutrientes (proteínas, carbos, grasas)
   - [ ] Sección de comidas del día (4 tipos: desayuno, almuerzo, merienda, cena)
   - [ ] Sección de hidratación con 8 vasos

### Test 3: Registro de Agua
1. [ ] En la sección de hidratación, haz click en un vaso gris
2. [ ] Verifica que:
   - [ ] El vaso se pone azul
   - [ ] La barra de progreso se actualiza
   - [ ] El contador muestra "0.3L / 2.5L"
3. [ ] Haz click en un vaso azul
4. [ ] Verifica que:
   - [ ] El vaso se pone gris
   - [ ] La barra retrocede
   - [ ] El contador se actualiza
5. [ ] Recarga la página
6. [ ] Verifica que el progreso se mantiene (datos guardados en DB)

### Test 4: Búsqueda de Alimentos
1. [ ] Click en botón "Agregar Comida" o en "+ Agregar" de cualquier comida
2. [ ] Verifica que se abre la página de búsqueda
3. [ ] Escribe "pollo" en el buscador
4. [ ] Verifica que aparecen resultados
5. [ ] Click en un alimento
6. [ ] Verifica que muestra:
   - [ ] Información nutricional
   - [ ] Campo para cantidad en gramos
   - [ ] Cálculo automático de macros
7. [ ] Ajusta la cantidad a 200g
8. [ ] Click en "Agregar Alimento"
9. [ ] Verifica que vuelves a Nutrition
10. [ ] Verifica que las calorías y macros se actualizaron

### Test 5: Análisis con Foto
1. [ ] Click en botón "Foto con IA" (morado)
2. [ ] Verifica que se abre la página de foto analyzer
3. [ ] Click en "Tomar o seleccionar foto"
4. [ ] Selecciona una imagen de comida
5. [ ] Verifica que la imagen se muestra
6. [ ] Click en "Enviar para análisis (IA)"
7. [ ] Verifica que:
   - [ ] Aparece spinner de carga
   - [ ] Se muestra mensaje de éxito
   - [ ] Vuelves a la página nutrition
   - [ ] Se agregó una comida "Análisis en progreso..."
   - [ ] Las calorías se actualizaron con estimación (300 kcal aprox)

### Test 6: Persistencia de Datos
1. [ ] Agrega varias comidas y vasos de agua
2. [ ] Cierra el navegador completamente
3. [ ] Vuelve a abrir la app
4. [ ] Inicia sesión
5. [ ] Verifica que:
   - [ ] Todas las comidas del día siguen ahí
   - [ ] El progreso de agua se mantiene
   - [ ] Los macros totales son correctos

---

## 🔍 Troubleshooting

### Problema: "Supabase no está configurado"
**Solución:**
- [ ] Verifica que el archivo `.env` existe y tiene los valores correctos
- [ ] Reinicia el servidor de desarrollo (`Ctrl+C` y luego `pnpm run dev`)
- [ ] Limpia la caché del navegador

### Problema: "Error al actualizar el agua"
**Solución:**
- [ ] Verifica que la tabla `water_logs` existe en Supabase
- [ ] Ejecuta `scripts/verify-database.sql` para verificar la estructura
- [ ] Verifica que las políticas RLS están activas
- [ ] Abre la consola del navegador (F12) y busca errores específicos

### Problema: "No se muestran las comidas"
**Solución:**
- [ ] Verifica que `meal_logs` tiene datos: ejecuta en SQL Editor
  ```sql
  SELECT * FROM meal_logs 
  WHERE user_id = auth.uid() 
  ORDER BY logged_at DESC;
  ```
- [ ] Si no hay datos, agrega una comida manualmente desde la app
- [ ] Verifica que las fechas están en el rango de hoy

### Problema: "Error al subir foto"
**Solución:**
- [ ] Verifica que el bucket `food-photos` existe en Storage
- [ ] Verifica que el bucket es público
- [ ] Verifica las políticas de Storage
- [ ] Verifica que la imagen no sea muy grande (max 10MB)

### Problema: "Las calorías no se actualizan"
**Solución:**
- [ ] Abre la consola del navegador (F12)
- [ ] Ve a Network tab y recarga la página
- [ ] Busca la petición a Supabase
- [ ] Si falla, verifica las políticas RLS
- [ ] Verifica que estás autenticado correctamente

---

## 📱 Testing en Android (Opcional)

### Preparación
1. [ ] Android Studio instalado
2. [ ] SDK de Android configurado
3. [ ] Dispositivo Android o emulador disponible

### Build y Deploy
```bash
# Sincronizar con Android
pnpm run build
npx cap sync android

# Abrir en Android Studio
npx cap open android
```

1. [ ] El proyecto se abre en Android Studio
2. [ ] Selecciona un dispositivo/emulador
3. [ ] Click en Run (triángulo verde)
4. [ ] La app se instala y abre
5. [ ] Repite todos los tests anteriores en el dispositivo móvil

---

## ✨ Funcionalidades Completadas

Una vez que todos los tests pasen, deberías tener:

- ✅ **Sistema de autenticación** funcionando
- ✅ **Registro de agua** con 8 vasos interactivos
- ✅ **Registro de comidas** manual con búsqueda
- ✅ **Análisis de fotos con IA** (placeholder hasta implementar worker)
- ✅ **Dashboard nutricional** con calorías y macros en tiempo real
- ✅ **Persistencia de datos** en Supabase
- ✅ **RLS** protegiendo datos por usuario
- ✅ **UI responsive** funcionando en web y móvil

---

## 📚 Documentación Adicional

Para más información, consulta:
- `docs/DATABASE_SETUP.md` - Schema completo de la base de datos
- `docs/SETUP_INSTRUCTIONS.md` - Guía detallada paso a paso
- `docs/CHANGELOG.md` - Lista de todas las funcionalidades
- `README.md` - Información general del proyecto

---

## 🎉 ¡Listo!

Si completaste todos los pasos y tests, tu aplicación LevelUp está completamente configurada y lista para usar.

**Próximos pasos sugeridos:**
1. Implementar worker de IA para análisis real de fotos
2. Agregar edición/eliminación de comidas
3. Agregar gráficos de progreso histórico
4. Implementar notificaciones
5. Agregar sistema de metas personalizadas

¡Feliz desarrollo! 🚀
