import CopyButton from "@/components/CopyButton";
import IngredientsList from "@/components/IngredientsList";
import PortionStepper from "@/components/PortionStepper";
import RecipeSteps from "@/components/RecipeSteps";
import { getScaledRecipeIngredients } from "@/lib/portion";
import { recipeToText, shoppingListToText } from "@/lib/textExport";
import { Analysis } from "@/lib/validators";

type ResultViewProps = {
  analysis: Analysis;
  portions: number;
  onPortionsChange: (value: number) => void;
  onReset: () => void;
};

export default function ResultView({ analysis, portions, onPortionsChange, onReset }: ResultViewProps) {
  const scaledIngredients = getScaledRecipeIngredients(analysis, portions);
  const recipeText = recipeToText(analysis, portions);
  const shoppingListText = shoppingListToText(analysis, portions);

  return (
    <section className="space-y-4">
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">{analysis.dish.name}</h2>
            <p className="text-sm text-slate-500">Confianza: {Math.round(analysis.dish.confidence * 100)}%</p>
          </div>
          <PortionStepper portions={portions} onChange={onPortionsChange} />
        </div>
        {analysis.dish.altNames.length > 0 && (
          <p className="mt-2 text-sm text-slate-600">Variantes: {analysis.dish.altNames.join(", ")}</p>
        )}
      </div>

      <IngredientsList ingredients={analysis.ingredients} />

      <section className="card space-y-3">
        <h3 className="text-lg font-semibold">Ingredientes de la receta ({portions} porciones)</h3>
        <ul className="space-y-2">
          {scaledIngredients.map((ingredient, index) => (
            <li key={`${ingredient.name}-${index}`} className="rounded-lg border border-slate-200 p-2 text-sm">
              {ingredient.name}: {ingredient.quantity} {ingredient.unit}
              {ingredient.notes ? ` (${ingredient.notes})` : ""}
            </li>
          ))}
        </ul>
      </section>

      <RecipeSteps steps={analysis.recipeForTwo.steps} />

      <section className="card space-y-2 text-sm">
        <h3 className="text-lg font-semibold">Datos adicionales</h3>
        <p>
          Tiempo: prep {analysis.recipeForTwo.time.prepMinutes} min · cocción {analysis.recipeForTwo.time.cookMinutes} min · total{" "}
          {analysis.recipeForTwo.time.totalMinutes} min
        </p>
        {analysis.recipeForTwo.allergens.length > 0 && <p>Alérgenos: {analysis.recipeForTwo.allergens.join(", ")}</p>}
      </section>

      <section className="flex flex-wrap gap-2">
        <CopyButton text={recipeText} label="Copiar receta" />
        <CopyButton text={shoppingListText} label="Generar lista de compras" />
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
        >
          Analizar otra foto
        </button>
      </section>
    </section>
  );
}
