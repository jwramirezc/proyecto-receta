import { Analysis } from "@/lib/validators";

type IngredientsListProps = {
  ingredients: Analysis["ingredients"];
};

function sourceLabel(source: "visible" | "typical") {
  return source === "visible" ? "Visible" : "Típico";
}

function sourceClasses(source: "visible" | "typical") {
  return source === "visible"
    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
    : "bg-amber-100 text-amber-900 border-amber-200";
}

export default function IngredientsList({ ingredients }: IngredientsListProps) {
  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold">Ingredientes detectados</h3>
      <ul className="space-y-2">
        {ingredients.map((ingredient, index) => (
          <li
            key={`${ingredient.name}-${index}`}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-3"
          >
            <div>
              <p className="font-medium">{ingredient.name}</p>
              <p className="text-xs text-slate-500">
                Confianza: {Math.round(ingredient.confidence * 100)}%
                {ingredient.amountGuess ? ` · aprox ${ingredient.amountGuess} ${ingredient.unit ?? ""}` : ""}
              </p>
            </div>
            <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${sourceClasses(ingredient.source)}`}>
              {sourceLabel(ingredient.source)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
