import { AnalysisSchema } from "@/lib/validators";

const AI_PROVIDER = process.env.AI_PROVIDER ?? "anthropic";
const DEFAULT_MODEL =
  process.env.AI_MODEL_VISION ?? (AI_PROVIDER === "anthropic" ? "claude-sonnet-4-20250514" : "gpt-4o-mini");

const SYSTEM_PROMPT = `
Eres un asistente culinario con visión por computadora.
Debes analizar una imagen de comida y devolver SOLO JSON válido.
No markdown, no texto fuera del JSON.
Idioma obligatorio: español (es-ES o español latino neutro).

Reglas:
- Debe cumplir este schema:
{
  "dish": { "name": "string", "altNames": ["string"], "cuisine": "string?", "confidence": 0-1 },
  "ingredients": [
    { "name": "string", "amountGuess": "number?", "unit": "string?", "confidence": 0-1, "source": "visible|typical" }
  ],
  "recipeForTwo": {
    "title": "string",
    "portions": 2,
    "time": { "prepMinutes": 0, "cookMinutes": 0, "totalMinutes": 0 },
    "equipment": ["string"],
    "ingredients": [{ "name": "string", "quantity": 1, "unit": "string", "notes": "string?" }],
    "steps": [{ "order": 1, "instruction": "string", "timerMinutes": 0 }],
    "tips": ["string"],
    "substitutions": [{ "ingredient": "string", "options": ["string"] }],
    "allergens": ["string"]
  },
  "assumptions": ["string"],
  "missingInfoQuestions": ["string"]
}
- Debe ser realista y coherente con el plato detectado.
- Todo el contenido textual debe estar en español:
  - dish.name, dish.altNames, dish.cuisine
  - ingredients[].name y unit
  - recipeForTwo.title, equipment, ingredients, steps, tips, substitutions, allergens
  - assumptions y missingInfoQuestions
- Ingredientes visibles: source=visible.
- Ingredientes inferidos típicos: source=typical.
- Mantener incertidumbre honesta con confidence.
- Evitar ingredientes raros no típicos.
`;

const USER_PROMPT =
  "Analiza la foto y devuelve un resultado completo con receta para 2 porciones exactas. Evita bloquear el resultado. Responde todo en español.";

function safeJsonParse<T>(input: string): T {
  const trimmed = input.trim();
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("No se encontró JSON válido en la respuesta del modelo.");
    }
    return JSON.parse(trimmed.slice(start, end + 1)) as T;
  }
}

async function callVisionModel(imageBase64: string, mimeType: string): Promise<string> {
  if (AI_PROVIDER === "anthropic") {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("Falta ANTHROPIC_API_KEY en variables de entorno.");
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        max_tokens: 4000,
        temperature: 0.2,
        system: `${SYSTEM_PROMPT}\nResponde solo con JSON válido y en español.`,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: USER_PROMPT },
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mimeType,
                  data: imageBase64
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Proveedor IA (Anthropic) error (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as {
      content?: Array<{ type?: string; text?: string }>;
    };
    const content = data.content?.find((block) => block.type === "text")?.text;
    if (!content) {
      throw new Error("Respuesta vacía del proveedor IA (Anthropic).");
    }
    return content;
  }

  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    throw new Error("Falta AI_API_KEY en variables de entorno.");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: USER_PROMPT },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`
              }
            }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Proveedor IA (OpenAI) error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Respuesta vacía del proveedor IA (OpenAI).");
  }

  return content;
}

async function repairJson(rawOutput: string): Promise<string> {
  if (AI_PROVIDER === "anthropic") {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("Falta ANTHROPIC_API_KEY en variables de entorno.");
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        max_tokens: 3000,
        temperature: 0,
        system: "Repara el JSON y devuelve únicamente JSON válido en español que respete el schema requerido.",
        messages: [
          {
            role: "user",
            content: [{ type: "text", text: `Salida a reparar:\n${rawOutput}` }]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Fallo repair prompt (Anthropic ${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as {
      content?: Array<{ type?: string; text?: string }>;
    };
    const content = data.content?.find((block) => block.type === "text")?.text;
    if (!content) {
      throw new Error("Respuesta vacía en repair prompt (Anthropic).");
    }
    return content;
  }

  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    throw new Error("Falta AI_API_KEY en variables de entorno.");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Repara el JSON y devuelve únicamente JSON válido en español que respete el schema requerido."
        },
        {
          role: "user",
          content: `Salida a reparar:\n${rawOutput}`
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Fallo repair prompt (OpenAI ${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Respuesta vacía en repair prompt (OpenAI).");
  }

  return content;
}

export async function analyzeImageToRecipe(imageBase64: string, mimeType: string) {
  const firstOutput = await callVisionModel(imageBase64, mimeType);
  const firstParsed = safeJsonParse<unknown>(firstOutput);
  const firstValidated = AnalysisSchema.safeParse(firstParsed);

  if (firstValidated.success) {
    return firstValidated.data;
  }

  const repairedOutput = await repairJson(firstOutput);
  const repairedParsed = safeJsonParse<unknown>(repairedOutput);
  const repairedValidated = AnalysisSchema.safeParse(repairedParsed);

  if (!repairedValidated.success) {
    throw new Error("La IA respondió en formato inválido incluso tras reintento.");
  }

  return repairedValidated.data;
}
