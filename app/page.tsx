"use client";

import { useState } from "react";
import ImageUploader from "@/components/ImageUploader";
import ResultView from "@/components/ResultView";
import { AnalysisSchema, type Analysis } from "@/lib/validators";

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [portions, setPortions] = useState(2);

  const handleSelectFile = (selected: File) => {
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setAnalysis(null);
    setError(null);
    setPortions(2);
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Selecciona una imagen primero.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const form = new FormData();
      form.append("file", file);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: form
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "No se pudo analizar la imagen.");
      }

      const parsed = AnalysisSchema.safeParse(payload);
      if (!parsed.success) {
        throw new Error("La respuesta del servidor no cumple el schema esperado.");
      }

      setAnalysis(parsed.data);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setFile(null);
    setPreviewUrl(null);
    setAnalysis(null);
    setError(null);
    setPortions(2);
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl space-y-5 p-4 sm:p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold sm:text-3xl">Recetas por Foto</h1>
        <p className="text-sm text-slate-600">
          Sube una foto y obtén plato probable, ingredientes visibles/típicos y receta completa para 2 personas.
        </p>
      </header>

      {!analysis && (
        <section className="space-y-4">
          <ImageUploader previewUrl={previewUrl} onFileSelect={handleSelectFile} disabled={loading} />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-60"
            >
              {loading ? "Analizando..." : "Analizar foto"}
            </button>
            {file && (
              <button
                type="button"
                onClick={resetFlow}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
              >
                Limpiar
              </button>
            )}
          </div>
          {loading && <div className="card animate-pulse text-sm text-slate-500">Analizando imagen y generando receta...</div>}
          {error && (
            <div className="card border-red-200 bg-red-50 text-sm text-red-700">
              {error}
              <div className="mt-2">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  className="rounded-lg border border-red-300 px-3 py-1 font-medium hover:bg-red-100"
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}
          {!file && !loading && !error && (
            <div className="card text-sm text-slate-600">
              Estado vacío: prueba con una foto clara del plato (ejemplo: pasta, ramen, tacos, ensalada).
            </div>
          )}
        </section>
      )}

      {analysis && (
        <ResultView
          analysis={analysis}
          portions={portions}
          onPortionsChange={setPortions}
          onReset={resetFlow}
        />
      )}
    </main>
  );
}
