"use client";

import { useCallback, useRef } from "react";

type ImageUploaderProps = {
  previewUrl: string | null;
  onFileSelect: (file: File) => void;
  disabled?: boolean;
};

const ACCEPT = "image/jpeg,image/png,image/webp";

export default function ImageUploader({ previewUrl, onFileSelect, disabled = false }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      const file = fileList[0];
      if (!ACCEPT.includes(file.type)) return;
      onFileSelect(file);
    },
    [onFileSelect]
  );

  return (
    <section className="card space-y-4">
      <h2 className="text-lg font-semibold">Sube una foto del plato</h2>
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          handleFiles(event.dataTransfer.files);
        }}
        className="rounded-xl border-2 border-dashed border-slate-300 p-6 text-center"
      >
        <p className="text-sm text-slate-600">Arrastra una imagen aquí o usa el botón.</p>
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="mt-3 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-60"
        >
          Subir imagen
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </div>
      {previewUrl && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Vista previa</p>
          <img src={previewUrl} alt="Vista previa del plato a analizar" className="w-full rounded-lg border border-slate-200" />
        </div>
      )}
    </section>
  );
}
