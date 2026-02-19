# Proyecto: Recetas por Foto (MVP sin Base de Datos)

Construir un aplicativo web de recetas que permita al usuario subir una foto de un plato y que la app:
1. Identifique el plato (nombre probable y variantes).
2. Estime ingredientes visibles + ingredientes típicos del plato (con niveles de confianza).
3. Genere una receta completa y coherente para 2 personas (porciones exactas).
4. NO usar base de datos. NO persistencia en servidor.
5. (Opcional) Guardar historial local en el navegador con `localStorage` (solo para UX, no obligatorio).

## Stack obligatorio
- TypeScript
- React con Next.js (App Router)
- Despliegue: Vercel
- UI: TailwindCSS + componentes accesibles (shadcn/ui o equivalente)
- Validación: Zod
- Form: React Hook Form (opcional, pero recomendado)
- Requests: `fetch`
- Subida de imagen: `multipart/form-data` al backend de Next (Route Handler)
- NO usar Prisma. NO usar Neon. NO usar DB.

## Objetivo UX
- Mobile-first, responsive, rápido.
- Flujo simple:
  Home -> Subir foto -> Resultado (plato + ingredientes + receta para 2).
- UI clara: skeleton loaders, manejo de errores, estados vacíos.
- Accesibilidad: labels, contraste, teclado.

## Funcionalidades (MVP)

### 1) Subida de foto
- Drag & drop + botón “Subir imagen”
- Aceptar: jpg/png/webp
- Límite: ~5–10MB (ajustable)
- Mostrar preview, permitir cambiar imagen antes de analizar

### 2) Análisis con IA (visión + texto)
- Endpoint server-side (Route Handler) para procesar la imagen (NO exponer claves en el cliente).
- La IA debe devolver un JSON estructurado (no texto suelto) con:

Schema esperado:
- `dish`: `{ name, altNames[], cuisine?, confidence(0-1) }`
- `ingredients`: array de `{ name, amountGuess?, unit?, confidence(0-1), source: "visible"|"typical" }`
- `recipeForTwo`:
  - `title`
  - `portions`: `2`
  - `time`: `{ prepMinutes, cookMinutes, totalMinutes }`
  - `equipment`: `string[]`
  - `ingredients`: `{ name, quantity, unit, notes? }[]`
  - `steps`: `{ order, instruction, timerMinutes? }[]`
  - `tips`: `string[]`
  - `substitutions`: `{ ingredient, options[] }[]`
  - `allergens`: `string[]` (si se puede inferir)
- `assumptions`: `string[]` (qué supuso la IA)
- `missingInfoQuestions[]` (solo si es realmente necesario; preferir NO bloquear resultado)

La receta debe ser realista, consistente y alineada al plato detectado.

### 3) Vista de resultados
- Mostrar nombre del plato + confianza
- Lista de ingredientes (con chips “visible/típico”)
- Botón “Ajustar porciones” (por defecto 2, permitir 1–6 recalculando cantidades)
- Receta paso a paso con checks
- Botón “Generar lista de compras”
- Botón “Copiar receta” (texto al portapapeles)
- Botón “Analizar otra foto”

### 4) Persistencia (SIN BD)
- No guardar nada en servidor.
- (Opcional) Guardar últimos N análisis en `localStorage`:
  - `timestamp`, `dishName`, `analysisJson`, `imagePreview` (preferible guardar solo un `dataURL` pequeño o nada)
  - Permitir “limpiar historial local”
- Esto es opcional y debe ser simple.

## No-funcionales
- Seguridad: claves solo server-side, validar tamaño/formato de imagen
- Performance: opcional compresión de imagen client-side antes de subir
- UX: estados de loading, error, empty

---

## Arquitectura recomendada (Next.js App Router)

Estructura sugerida:
- `app/`
  - `page.tsx` (home)
  - `result/page.tsx` (opcional si se navega; si no, todo en home)
  - `api/`
    - `analyze/route.ts` (POST: recibe imagen, llama IA, retorna JSON)
- `components/`
  - `ImageUploader.tsx`
  - `ResultView.tsx`
  - `IngredientsList.tsx`
  - `RecipeSteps.tsx`
  - `PortionStepper.tsx`
  - `CopyButton.tsx`
- `lib/`
  - `ai.ts` (cliente del proveedor IA, prompts, schema)
  - `validators.ts` (Zod schemas)
  - `portion.ts` (recalcular cantidades)
  - `textExport.ts` (convertir JSON a texto)
- `styles/` (si aplica)

---

## Contrato API (Route Handler)

### POST `/api/analyze`
Body: `multipart/form-data` con `"file"` (imagen)
Response `200`: JSON con el schema acordado
Errores:
- `400`: archivo inválido
- `413`: muy grande
- `500`: fallo IA

---

## Reglas para el prompt de IA (crítico)
- Responder SIEMPRE en JSON válido (sin markdown)
- Ajustar cantidades para 2 porciones por defecto
- Marcar ingredientes como `"visible"` si se infieren por la foto y `"typical"` si son típicos del plato
- Ser honesta con incertidumbre (`confidence`)
- Evitar inventar ingredientes raros si no son típicos
- Mantener consistencia (si dice “ramen”, pasos/ingredientes deben ser ramen)

Implementar validación estricta con Zod en el backend.
Si la salida no valida, reintentar con un “repair prompt” server-side.

---

## UI Rules
- Tailwind + componentes accesibles
- Layout: `max-w-3xl` + padding
- Mobile: columna; Desktop: dos columnas (preview / resultados) opcional
- Estados:
  - Loading: skeleton + “Analizando…”
  - Error: tarjeta con mensaje + botón reintentar
  - Empty: explicación y ejemplo

---

## Variables de entorno
- `AI_API_KEY=...`
- `AI_MODEL_VISION=...` (si aplica)

---

## Deploy (Vercel)
- Next.js compatible
- Rutas API server-side
- No DB
- Asegurar que el proveedor de IA se llama desde runtime Node.js (no edge si no es compatible)

---

## Criterios de aceptación (MVP)
1. Subo una foto y veo:
   - nombre del plato + confianza
   - ingredientes con origen (visible/típico)
   - receta para 2 personas con cantidades
2. Puedo cambiar porciones y se recalculan cantidades
3. UI responsive
4. Manejo de errores correcto
5. Copiar receta / lista de compras funciona
