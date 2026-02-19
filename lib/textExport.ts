import { getScaledRecipeIngredients } from "@/lib/portion";
import { Analysis } from "@/lib/validators";

export function recipeToText(analysis: Analysis, portions: number): string {
  const scaledIngredients = getScaledRecipeIngredients(analysis, portions);
  const lines: string[] = [];

  lines.push(`${analysis.recipeForTwo.title} (${portions} porciones)`);
  lines.push("");
  lines.push("Ingredientes:");
  for (const ingredient of scaledIngredients) {
    const notes = ingredient.notes ? ` (${ingredient.notes})` : "";
    lines.push(`- ${ingredient.name}: ${ingredient.quantity} ${ingredient.unit}${notes}`);
  }

  lines.push("");
  lines.push("Pasos:");
  for (const step of analysis.recipeForTwo.steps) {
    lines.push(`${step.order}. ${step.instruction}`);
  }

  if (analysis.recipeForTwo.tips.length > 0) {
    lines.push("");
    lines.push("Tips:");
    for (const tip of analysis.recipeForTwo.tips) {
      lines.push(`- ${tip}`);
    }
  }

  return lines.join("\n");
}

export function shoppingListToText(analysis: Analysis, portions: number): string {
  const scaledIngredients = getScaledRecipeIngredients(analysis, portions);
  return scaledIngredients.map((item) => `- ${item.name}: ${item.quantity} ${item.unit}`).join("\n");
}
