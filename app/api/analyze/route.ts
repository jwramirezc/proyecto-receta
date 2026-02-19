import { analyzeImageToRecipe } from "@/lib/ai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString("base64");
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Archivo inválido." }, { status: 400 });
    }

    if (!ACCEPTED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Formato no soportado. Usa JPG, PNG o WEBP." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Archivo demasiado grande. Máximo 8MB." }, { status: 413 });
    }

    const buffer = await file.arrayBuffer();
    const base64 = arrayBufferToBase64(buffer);
    const analysis = await analyzeImageToRecipe(base64, file.type);

    return NextResponse.json(analysis, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado.";
    return NextResponse.json({ error: `Falló el análisis IA: ${message}` }, { status: 500 });
  }
}
