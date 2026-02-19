# Recetas por Foto (MVP sin BD)

Proyecto Next.js + TypeScript para analizar una imagen de un plato y devolver:
- Plato probable + confianza
- Ingredientes visibles/típicos
- Receta completa para 2 personas

## Requisitos
- Node.js 18+
- NPM
- Variables de entorno:
  - `AI_PROVIDER=anthropic` o `AI_PROVIDER=openai`
  - Si usas Anthropic: `ANTHROPIC_API_KEY`
  - Si usas OpenAI: `AI_API_KEY`
  - `AI_MODEL_VISION` (opcional)

## Configuración
1. Instala dependencias:
```bash
npm install
```
2. Crea el archivo `.env.local`:
```bash
cp .env.example .env.local
```
Edita `.env.local` según proveedor:

- Anthropic (Claude):
```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=tu_clave_de_claude
AI_MODEL_VISION=claude-sonnet-4-20250514
```

- OpenAI:
```env
AI_PROVIDER=openai
AI_API_KEY=tu_clave_openai
AI_MODEL_VISION=gpt-4o-mini
```

3. Ejecuta en local:
```bash
npm run dev
```

## Endpoints
- `POST /api/analyze`
  - `multipart/form-data` con `file`
  - respuestas:
    - `200` OK
    - `400` archivo inválido
    - `413` demasiado grande
    - `500` error IA

## Notas
- No usa base de datos.
- No persiste información en servidor.
