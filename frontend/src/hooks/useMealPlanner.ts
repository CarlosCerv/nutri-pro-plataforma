/**
 * hooks/useMealPlanner.ts
 * Hook personalizado para gestionar el estado del planificador de comidas
 */

import { useState, useCallback, useMemo } from 'react';
import type { MealTime, AddedFood, FoodItem, MacroNutrients } from '../types/nutrition';
import {
  calculateFoodNutrients,
  calculateMealTimeTotals,
  calculateDailyTotals,
  roundNutrients,
} from '../utils/calculations';

const DEFAULT_MEAL_TIMES: MealTime[] = [
  {
    id: '1',
    name: 'Desayuno',
    foods: [],
    totalMacro: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    order: 1,
  },
  {
    id: '2',
    name: 'Comida',
    foods: [],
    totalMacro: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    order: 2,
  },
  {
    id: '3',
    name: 'Cena',
    foods: [],
    totalMacro: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    order: 3,
  },
];

interface UseMealPlannerReturn {
  mealTimes: MealTime[];
  dailyTotal: MacroNutrients;
  addFood: (mealTimeId: string, food: FoodItem, portions: number) => void;
  removeFood: (mealTimeId: string, foodId: string) => void;
  editFood: (mealTimeId: string, foodId: string, newPortions: number) => void;
  updateMealTimeName: (mealTimeId: string, newName: string) => void;
  addMealTime: (name: string) => void;
  removeMealTime: (mealTimeId: string) => void;
  clearAllFoods: () => void;
}

export const useMealPlanner = (initialMealTimes?: MealTime[]): UseMealPlannerReturn => {
  const [mealTimes, setMealTimes] = useState<MealTime[]>(initialMealTimes || DEFAULT_MEAL_TIMES);

  /**
   * Recalcula los totales de un tiempo de comida específico
   */
  const updateMealTimeTotal = useCallback(
    (mealTimeId: string, foods: AddedFood[]): MealTime | undefined => {
      return mealTimes.find((mt) => {
        if (mt.id === mealTimeId) {
          mt.totalMacro = roundNutrients(calculateMealTimeTotals(foods));
          return true;
        }
        return false;
      });
    },
    [mealTimes]
  );

  /**
   * Añade un alimento a un tiempo de comida
   */
  const addFood = useCallback(
    (mealTimeId: string, food: FoodItem, portions: number) => {
      setMealTimes((prevMealTimes) =>
        prevMealTimes.map((mealTime) => {
          if (mealTime.id === mealTimeId) {
            const totalMacro = calculateFoodNutrients(food.macroPerPortion, portions);
            const addedFood: AddedFood = {
              id: `${food.id}-${Date.now()}`, // ID único para cada adición
              foodId: food.id,
              foodName: food.name,
              portions,
              basePortionSize: food.basePortionSize,
              totalMacro: roundNutrients(totalMacro),
              addedAt: new Date(),
            };

            const updatedFoods = [...mealTime.foods, addedFood];
            return {
              ...mealTime,
              foods: updatedFoods,
              totalMacro: roundNutrients(calculateMealTimeTotals(updatedFoods)),
            };
          }
          return mealTime;
        })
      );
    },
    []
  );

  /**
   * Elimina un alimento de un tiempo de comida
   */
  const removeFood = useCallback((mealTimeId: string, foodId: string) => {
    setMealTimes((prevMealTimes) =>
      prevMealTimes.map((mealTime) => {
        if (mealTime.id === mealTimeId) {
          const updatedFoods = mealTime.foods.filter((f) => f.id !== foodId);
          return {
            ...mealTime,
            foods: updatedFoods,
            totalMacro: roundNutrients(calculateMealTimeTotals(updatedFoods)),
          };
        }
        return mealTime;
      })
    );
  }, []);

  /**
   * Edita el número de porciones de un alimento
   */
  const editFood = useCallback((mealTimeId: string, foodId: string, newPortions: number) => {
    setMealTimes((prevMealTimes) =>
      prevMealTimes.map((mealTime) => {
        if (mealTime.id === mealTimeId) {
          const updatedFoods = mealTime.foods.map((f) => {
            if (f.id === foodId) {
              const baseNutrients = {
                calories: f.totalMacro.calories / f.portions,
                protein: f.totalMacro.protein / f.portions,
                carbs: f.totalMacro.carbs / f.portions,
                fat: f.totalMacro.fat / f.portions,
              };
              return {
                ...f,
                portions: newPortions,
                totalMacro: roundNutrients(calculateFoodNutrients(baseNutrients, newPortions)),
              };
            }
            return f;
          });

          return {
            ...mealTime,
            foods: updatedFoods,
            totalMacro: roundNutrients(calculateMealTimeTotals(updatedFoods)),
          };
        }
        return mealTime;
      })
    );
  }, []);

  /**
   * Actualiza el nombre de un tiempo de comida
   */
  const updateMealTimeName = useCallback((mealTimeId: string, newName: string) => {
    setMealTimes((prevMealTimes) =>
      prevMealTimes.map((mealTime) =>
        mealTime.id === mealTimeId ? { ...mealTime, name: newName } : mealTime
      )
    );
  }, []);

  /**
   * Añade un nuevo tiempo de comida
   */
  const addMealTime = useCallback((name: string) => {
    setMealTimes((prevMealTimes) => {
      const newMealTime: MealTime = {
        id: `meal-${Date.now()}`,
        name,
        foods: [],
        totalMacro: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        order: prevMealTimes.length + 1,
      };
      return [...prevMealTimes, newMealTime];
    });
  }, []);

  /**
   * Elimina un tiempo de comida
   */
  const removeMealTime = useCallback((mealTimeId: string) => {
    setMealTimes((prevMealTimes) => prevMealTimes.filter((mt) => mt.id !== mealTimeId));
  }, []);

  /**
   * Elimina todos los alimentos de todos los tiempos de comida
   */
  const clearAllFoods = useCallback(() => {
    setMealTimes((prevMealTimes) =>
      prevMealTimes.map((mealTime) => ({
        ...mealTime,
        foods: [],
        totalMacro: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      }))
    );
  }, []);

  /**
   * Calcula el total diario (useMemo para evitar recálculos innecesarios)
   */
  const dailyTotal = useMemo(() => {
    return roundNutrients(calculateDailyTotals(mealTimes));
  }, [mealTimes]);

  return {
    mealTimes,
    dailyTotal,
    addFood,
    removeFood,
    editFood,
    updateMealTimeName,
    addMealTime,
    removeMealTime,
    clearAllFoods,
  };
};
