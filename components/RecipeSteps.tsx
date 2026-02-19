"use client";

import { useMemo, useState } from "react";
import { Recipe } from "@/lib/validators";

type RecipeStepsProps = {
  steps: Recipe["steps"];
};

export default function RecipeSteps({ steps }: RecipeStepsProps) {
  const ordered = useMemo(() => [...steps].sort((a, b) => a.order - b.order), [steps]);
  const [done, setDone] = useState<Record<number, boolean>>({});

  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold">Paso a paso</h3>
      <ol className="space-y-2">
        {ordered.map((step) => (
          <li key={step.order} className="rounded-lg border border-slate-200 p-3">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={Boolean(done[step.order])}
                onChange={(event) => setDone((prev) => ({ ...prev, [step.order]: event.target.checked }))}
                className="mt-1 h-4 w-4 accent-teal-700"
              />
              <span>
                <span className={`block font-medium ${done[step.order] ? "line-through text-slate-400" : ""}`}>
                  {step.order}. {step.instruction}
                </span>
                {typeof step.timerMinutes === "number" && (
                  <span className="text-xs text-slate-500">Timer sugerido: {step.timerMinutes} min</span>
                )}
              </span>
            </label>
          </li>
        ))}
      </ol>
    </section>
  );
}
