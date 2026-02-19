import { Analysis, RecipeIngredientSchema } from "@/lib/validators";

const roundQuantity = (value: number): number => {
  if (value >= 10) {
    return Math.round(value);
  }

  return Math.round(value * 100) / 100;
};

export function scaleIngredientQuantity(quantity: number, from: number, to: number): number {
  return roundQuantity((quantity * to) / from);
}

export function getScaledRecipeIngredients(analysis: Analysis, portions: number) {
  return analysis.recipeForTwo.ingredients.map((ingredient) =>
    RecipeIngredientSchema.parse({
      ...ingredient,
      quantity: scaleIngredientQuantity(ingredient.quantity, analysis.recipeForTwo.portions, portions)
    })
  );
}
