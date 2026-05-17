/**
 * utils/calculations.ts
 * Funciones de cálculo para macronutrientes en NutriPro
 */

import type { MacroNutrients, AddedFood, MealTime, DailyMealPlan } from '../types/nutrition';

/**
 * Calcula los macronutrientes totales multiplicando la porción base por el número de porciones
 * @param baseNutrients - Macronutrientes de la porción base del alimento
 * @param portions - Número de porciones a consumir
 * @returns Macronutrientes totales
 */
export const calculateFoodNutrients = (
  baseNutrients: MacroNutrients,
  portions: number
): MacroNutrients => {
  return {
    calories: baseNutrients.calories * portions,
    protein: baseNutrients.protein * portions,
    carbs: baseNutrients.carbs * portions,
    fat: baseNutrients.fat * portions,
  };
};

/**
 * Suma los macronutrientes de múltiples alimentos
 * @param foods - Array de alimentos con sus macros
 * @returns Total de macronutrientes
 */
export const calculateMealTimeTotals = (foods: AddedFood[]): MacroNutrients => {
  return foods.reduce(
    (total, food) => ({
      calories: total.calories + food.totalMacro.calories,
      protein: total.protein + food.totalMacro.protein,
      carbs: total.carbs + food.totalMacro.carbs,
      fat: total.fat + food.totalMacro.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
};

/**
 * Suma los macronutrientes de todos los tiempos de comida en el día
 * @param mealTimes - Array de tiempos de comida con sus alimentos
 * @returns Total diario de macronutrientes
 */
export const calculateDailyTotals = (mealTimes: MealTime[]): MacroNutrients => {
  return mealTimes.reduce(
    (total, mealTime) => ({
      calories: total.calories + mealTime.totalMacro.calories,
      protein: total.protein + mealTime.totalMacro.protein,
      carbs: total.carbs + mealTime.totalMacro.carbs,
      fat: total.fat + mealTime.totalMacro.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
};

/**
 * Redondea macronutrientes a 2 decimales
 * @param nutrients - Macronutrientes a redondear
 * @returns Macronutrientes redondeados
 */
export const roundNutrients = (nutrients: MacroNutrients): MacroNutrients => {
  return {
    calories: Math.round(nutrients.calories * 100) / 100,
    protein: Math.round(nutrients.protein * 100) / 100,
    carbs: Math.round(nutrients.carbs * 100) / 100,
    fat: Math.round(nutrients.fat * 100) / 100,
  };
};

/**
 * Calcula calorías a partir de macronutrientes (si es necesario)
 * Fórmula: (proteínas * 4) + (carbohidratos * 4) + (grasas * 9)
 * @param nutrients - Macronutrientes
 * @returns Calorías calculadas
 */
export const calculateCaloriesFromMacros = (
  protein: number,
  carbs: number,
  fat: number
): number => {
  return protein * 4 + carbs * 4 + fat * 9;
};

/**
 * Calcula el porcentaje de cada macronutriente sobre el total de calorías
 * @param nutrients - Macronutrientes
 * @returns Objeto con porcentajes
 */
export const calculateMacroPercentages = (nutrients: MacroNutrients) => {
  const total = nutrients.calories;
  if (total === 0) return { protein: 0, carbs: 0, fat: 0 };

  return {
    protein: Math.round((nutrients.protein * 4) / total * 100),
    carbs: Math.round((nutrients.carbs * 4) / total * 100),
    fat: Math.round((nutrients.fat * 9) / total * 100),
  };
};
