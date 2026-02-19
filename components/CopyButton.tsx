"use client";

import { useState } from "react";

type CopyButtonProps = {
  text: string;
  label: string;
};

export default function CopyButton({ text, label }: CopyButtonProps) {
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("ok");
      setTimeout(() => setStatus("idle"), 1400);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 1800);
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
    >
      {status === "idle" ? label : status === "ok" ? "Copiado" : "No se pudo copiar"}
    </button>
  );
}
