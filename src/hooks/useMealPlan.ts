import { useState, useEffect } from "react";

export type MealSlot = "petit-dejeuner" | "dejeuner" | "diner" | "snack";

export const MEAL_SLOTS: { id: MealSlot; label: string; emoji: string }[] = [
  { id: "petit-dejeuner", label: "Petit déjeuner", emoji: "🌅" },
  { id: "dejeuner", label: "Déjeuner", emoji: "☀️" },
  { id: "diner", label: "Dîner", emoji: "🌙" },
  { id: "snack", label: "Snack", emoji: "🍎" },
];

export const DAYS: { id: number; label: string; short: string }[] = [
  { id: 0, label: "Lundi", short: "Lun" },
  { id: 1, label: "Mardi", short: "Mar" },
  { id: 2, label: "Mercredi", short: "Mer" },
  { id: 3, label: "Jeudi", short: "Jeu" },
  { id: 4, label: "Vendredi", short: "Ven" },
  { id: 5, label: "Samedi", short: "Sam" },
  { id: 6, label: "Dimanche", short: "Dim" },
];

export interface MealPlanEntry {
  recipeId: string;
  portions: number;
}

// mealPlan[dayIndex][slot] = MealPlanEntry | null
export type MealPlanWeek = Record<number, Partial<Record<MealSlot, MealPlanEntry>>>;

const STORAGE_KEY = "souka_meal_plan_v1";

function loadFromStorage(): MealPlanWeek {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as MealPlanWeek;
  } catch {
    return {};
  }
}

function saveToStorage(plan: MealPlanWeek) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  } catch {}
}

export function useMealPlan() {
  const [plan, setPlan] = useState<MealPlanWeek>(loadFromStorage);

  // Persist on every change
  useEffect(() => {
    saveToStorage(plan);
  }, [plan]);

  const addMeal = (day: number, slot: MealSlot, recipeId: string, portions = 1) => {
    setPlan((prev) => ({
      ...prev,
      [day]: {
        ...(prev[day] || {}),
        [slot]: { recipeId, portions },
      },
    }));
  };

  const removeMeal = (day: number, slot: MealSlot) => {
    setPlan((prev) => {
      const dayPlan = { ...(prev[day] || {}) };
      delete dayPlan[slot];
      return { ...prev, [day]: dayPlan };
    });
  };

  const updatePortions = (day: number, slot: MealSlot, portions: number) => {
    setPlan((prev) => {
      const entry = prev[day]?.[slot];
      if (!entry) return prev;
      return {
        ...prev,
        [day]: {
          ...(prev[day] || {}),
          [slot]: { ...entry, portions },
        },
      };
    });
  };

  const clearDay = (day: number) => {
    setPlan((prev) => {
      const next = { ...prev };
      delete next[day];
      return next;
    });
  };

  const clearAll = () => {
    setPlan({});
  };

  // Retourne la liste agrégée de tous les ingrédients de la semaine
  const getShoppingList = (recipes: import("../data/recipes").Recipe[]) => {
    const ingredientMap = new Map<
      string,
      { name: string; totalQty: number | null; unit: string | null; recipeCount: number; searchTerms: string[] }
    >();

    for (const [, slots] of Object.entries(plan)) {
      for (const [, entry] of Object.entries(slots || {})) {
        if (!entry) continue;
        const recipe = recipes.find((r) => r.id === entry.recipeId);
        if (!recipe) continue;
        const portions = entry.portions || 1;
        const recipeParts = recipe.serves ? portions / recipe.serves : 1;

        for (const ing of recipe.ingredients) {
          const key = ing.name.toLowerCase().trim();
          const existing = ingredientMap.get(key);
          const qty = ing.quantity ? ing.quantity * recipeParts : null;

          if (existing) {
            ingredientMap.set(key, {
              ...existing,
              totalQty:
                existing.totalQty !== null && qty !== null
                  ? existing.totalQty + qty
                  : null,
              recipeCount: existing.recipeCount + 1,
            });
          } else {
            ingredientMap.set(key, {
              name: ing.name,
              totalQty: qty,
              unit: ing.unit,
              recipeCount: 1,
              searchTerms: ing.searchTerms,
            });
          }
        }
      }
    }

    return Array.from(ingredientMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name, "fr")
    );
  };

  return { plan, addMeal, removeMeal, updatePortions, clearDay, clearAll, getShoppingList };
}
