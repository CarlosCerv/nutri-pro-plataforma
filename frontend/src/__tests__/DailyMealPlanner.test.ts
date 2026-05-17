/**
 * __tests__/DailyMealPlanner.test.tsx
 * Ejemplos de tests para el componente DailyMealPlanner
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMealPlanner } from '../hooks/useMealPlanner';
import {
  calculateFoodNutrients,
  calculateMealTimeTotals,
  calculateDailyTotals,
  calculateMacroPercentages,
} from '../utils/calculations';
import type { FoodItem } from '../types/nutrition';

describe('DailyMealPlanner - Cálculos', () => {
  it('calcula los nutrientes correctamente al multiplicar porciones', () => {
    const baseNutrients = { calories: 100, protein: 10, carbs: 15, fat: 5 };
    const result = calculateFoodNutrients(baseNutrients, 2);

    expect(result.calories).toBe(200);
    expect(result.protein).toBe(20);
    expect(result.carbs).toBe(30);
    expect(result.fat).toBe(10);
  });

  it('calcula los totales de un tiempo de comida', () => {
    const foods = [
      {
        id: '1',
        foodId: 'chicken',
        foodName: 'Pollo',
        portions: 1,
        basePortionSize: '100g',
        totalMacro: { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
        addedAt: new Date(),
      },
      {
        id: '2',
        foodId: 'rice',
        foodName: 'Arroz',
        portions: 1,
        basePortionSize: '1 taza',
        totalMacro: { calories: 206, protein: 4.3, carbs: 45, fat: 0.3 },
        addedAt: new Date(),
      },
    ];

    const result = calculateMealTimeTotals(foods);

    expect(result.calories).toBe(371);
    expect(result.protein).toBeCloseTo(35.3, 1);
    expect(result.carbs).toBe(45);
    expect(result.fat).toBeCloseTo(3.9, 1);
  });

  it('calcula el porcentaje de macronutrientes correctamente', () => {
    const nutrients = { calories: 2000, protein: 150, carbs: 250, fat: 65 };
    const percentages = calculateMacroPercentages(nutrients);

    // Proteína: (150g * 4 kcal/g) / 2000 * 100 = 30%
    expect(percentages.protein).toBe(30);
    // Carbos: (250g * 4 kcal/g) / 2000 * 100 = 50%
    expect(percentages.carbs).toBe(50);
    // Grasas: (65g * 9 kcal/g) / 2000 * 100 = 29% (aprox)
    expect(percentages.fat).toBeCloseTo(29, 0);
  });
});

describe('useMealPlanner Hook', () => {
  let hookResult;

  beforeEach(() => {
    const { result } = renderHook(() => useMealPlanner());
    hookResult = result;
  });

  it('inicializa con 3 tiempos de comida por defecto', () => {
    expect(hookResult.current.mealTimes).toHaveLength(3);
    expect(hookResult.current.mealTimes[0].name).toBe('Desayuno');
    expect(hookResult.current.mealTimes[1].name).toBe('Comida');
    expect(hookResult.current.mealTimes[2].name).toBe('Cena');
  });

  it('inicia con total diario en cero', () => {
    expect(hookResult.current.dailyTotal.calories).toBe(0);
    expect(hookResult.current.dailyTotal.protein).toBe(0);
    expect(hookResult.current.dailyTotal.carbs).toBe(0);
    expect(hookResult.current.dailyTotal.fat).toBe(0);
  });

  it('añade alimento a un tiempo de comida', () => {
    const food: FoodItem = {
      id: 'chicken',
      name: 'Pollo',
      basePortionSize: '100g',
      macroPerPortion: { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    };

    act(() => {
      hookResult.current.addFood(hookResult.current.mealTimes[0].id, food, 1.5);
    });

    const mealTime = hookResult.current.mealTimes[0];
    expect(mealTime.foods).toHaveLength(1);
    expect(mealTime.foods[0].foodName).toBe('Pollo');
    expect(mealTime.foods[0].portions).toBe(1.5);
    expect(mealTime.totalMacro.calories).toBeCloseTo(247.5, 1);
  });

  it('elimina alimento de un tiempo de comida', () => {
    const food: FoodItem = {
      id: 'chicken',
      name: 'Pollo',
      basePortionSize: '100g',
      macroPerPortion: { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    };

    act(() => {
      hookResult.current.addFood(hookResult.current.mealTimes[0].id, food, 1);
    });

    const foodId = hookResult.current.mealTimes[0].foods[0].id;

    act(() => {
      hookResult.current.removeFood(hookResult.current.mealTimes[0].id, foodId);
    });

    expect(hookResult.current.mealTimes[0].foods).toHaveLength(0);
    expect(hookResult.current.mealTimes[0].totalMacro.calories).toBe(0);
  });

  it('edita el número de porciones de un alimento', () => {
    const food: FoodItem = {
      id: 'rice',
      name: 'Arroz',
      basePortionSize: '1 taza',
      macroPerPortion: { calories: 206, protein: 4.3, carbs: 45, fat: 0.3 },
    };

    act(() => {
      hookResult.current.addFood(hookResult.current.mealTimes[0].id, food, 1);
    });

    const foodId = hookResult.current.mealTimes[0].foods[0].id;
    const initialCalories = hookResult.current.mealTimes[0].totalMacro.calories;

    act(() => {
      hookResult.current.editFood(hookResult.current.mealTimes[0].id, foodId, 2);
    });

    const updatedCalories = hookResult.current.mealTimes[0].totalMacro.calories;
    expect(updatedCalories).toBeCloseTo(initialCalories * 2, 1);
  });

  it('actualiza el nombre de un tiempo de comida', () => {
    const originalId = hookResult.current.mealTimes[0].id;
    const newName = 'Desayuno Completo';

    act(() => {
      hookResult.current.updateMealTimeName(originalId, newName);
    });

    expect(hookResult.current.mealTimes[0].name).toBe('Desayuno Completo');
  });

  it('añade un nuevo tiempo de comida', () => {
    const initialLength = hookResult.current.mealTimes.length;

    act(() => {
      hookResult.current.addMealTime('Merienda');
    });

    expect(hookResult.current.mealTimes).toHaveLength(initialLength + 1);
    expect(hookResult.current.mealTimes[initialLength].name).toBe('Merienda');
  });

  it('elimina todos los alimentos de todos los tiempos', () => {
    const food: FoodItem = {
      id: 'chicken',
      name: 'Pollo',
      basePortionSize: '100g',
      macroPerPortion: { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    };

    act(() => {
      hookResult.current.addFood(hookResult.current.mealTimes[0].id, food, 1);
      hookResult.current.addFood(hookResult.current.mealTimes[1].id, food, 1);
    });

    act(() => {
      hookResult.current.clearAllFoods();
    });

    hookResult.current.mealTimes.forEach((mealTime) => {
      expect(mealTime.foods).toHaveLength(0);
      expect(mealTime.totalMacro.calories).toBe(0);
    });

    expect(hookResult.current.dailyTotal.calories).toBe(0);
  });

  it('calcula el total diario correctamente', () => {
    const food1: FoodItem = {
      id: 'chicken',
      name: 'Pollo',
      basePortionSize: '100g',
      macroPerPortion: { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    };

    const food2: FoodItem = {
      id: 'rice',
      name: 'Arroz',
      basePortionSize: '1 taza',
      macroPerPortion: { calories: 206, protein: 4.3, carbs: 45, fat: 0.3 },
    };

    act(() => {
      hookResult.current.addFood(hookResult.current.mealTimes[0].id, food1, 1);
      hookResult.current.addFood(hookResult.current.mealTimes[1].id, food2, 1);
    });

    expect(hookResult.current.dailyTotal.calories).toBeCloseTo(371, 0);
    expect(hookResult.current.dailyTotal.protein).toBeCloseTo(35.3, 1);
    expect(hookResult.current.dailyTotal.carbs).toBe(45);
  });
});

/**
 * Ejemplo de test para componente (React Testing Library)
 */
describe('DailyMealPlanner Component', () => {
  it('renders the main component without errors', () => {
    // Import DailyMealPlanner y usar render()
    // expect(screen.getByText(/Planificador de Comidas/i)).toBeInTheDocument();
  });

  it('opens modal when adding food', async () => {
    // const { container } = render(<DailyMealPlanner />);
    // const addButton = screen.getByText('Añadir Alimento');
    // fireEvent.click(addButton);
    // expect(screen.getByPlaceholderText(/Buscar alimento/i)).toBeInTheDocument();
  });

  it('displays daily macro summary', () => {
    // expect(screen.getByText(/Resumen Diario/i)).toBeInTheDocument();
    // expect(screen.getByText(/Calorías Totales/i)).toBeInTheDocument();
  });
});
