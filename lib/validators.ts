import { z } from "zod";

export const DishSchema = z.object({
  name: z.string().min(1),
  altNames: z.array(z.string()).default([]),
  cuisine: z.string().optional(),
  confidence: z.number().min(0).max(1)
});

export const IngredientInferenceSchema = z.object({
  name: z.string().min(1),
  amountGuess: z.number().positive().optional(),
  unit: z.string().optional(),
  confidence: z.number().min(0).max(1),
  source: z.enum(["visible", "typical"])
});

export const RecipeIngredientSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  notes: z.string().optional()
});

export const RecipeStepSchema = z.object({
  order: z.number().int().positive(),
  instruction: z.string().min(1),
  timerMinutes: z.number().int().nonnegative().optional()
});

export const RecipeSchema = z.object({
  title: z.string().min(1),
  portions: z.literal(2),
  time: z.object({
    prepMinutes: z.number().int().nonnegative(),
    cookMinutes: z.number().int().nonnegative(),
    totalMinutes: z.number().int().nonnegative()
  }),
  equipment: z.array(z.string()).default([]),
  ingredients: z.array(RecipeIngredientSchema),
  steps: z.array(RecipeStepSchema),
  tips: z.array(z.string()).default([]),
  substitutions: z
    .array(
      z.object({
        ingredient: z.string().min(1),
        options: z.array(z.string())
      })
    )
    .default([]),
  allergens: z.array(z.string()).default([])
});

export const AnalysisSchema = z.object({
  dish: DishSchema,
  ingredients: z.array(IngredientInferenceSchema),
  recipeForTwo: RecipeSchema,
  assumptions: z.array(z.string()).default([]),
  missingInfoQuestions: z.array(z.string()).default([])
});

export type Analysis = z.infer<typeof AnalysisSchema>;
export type Recipe = z.infer<typeof RecipeSchema>;
