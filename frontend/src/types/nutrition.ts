/**
 * tipos/nutrition.ts
 * Interfaces y tipos para el sistema de planificación de comidas NutriPro
 */

export interface MacroNutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodItem {
  id: string;
  name: string;
  basePortionSize: string; // ej. "1 taza", "100g", "1 cucharada"
  macroPerPortion: MacroNutrients;
}

export interface AddedFood {
  id: string;
  foodId: string;
  foodName: string;
  portions: number;
  basePortionSize: string;
  totalMacro: MacroNutrients;
  addedAt: Date;
}

export interface MealTime {
  id: string;
  name: string; // ej. "Desayuno", "Comida", "Cena", "Merienda"
  foods: AddedFood[];
  totalMacro: MacroNutrients;
  order: number; // Para ordenar los tiempos de comida
}

export interface DailyMealPlan {
  id: string;
  date: Date;
  mealTimes: MealTime[];
  dailyTotalMacro: MacroNutrients;
  patientId?: string; // Para vincular con pacientes en el sistema real
}

export interface FoodCatalog {
  foods: FoodItem[];
  lastUpdated: Date;
}
