/**
 * Estado del planificador de comidas.
 *
 * Este archivo reemplaza a `DailyMealPlanner.test.ts`, que probaba un
 * componente que ya no existe (se fusionó en MenuBuilder) y que además nunca
 * llegó a ejecutarse: el proyecto no tenía Vitest instalado ni script `test`.
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMealPlanner } from '../hooks/useMealPlanner';
import { calculateMacroPercentages, roundNutrients } from '../utils/calculations';
import type { FoodItem } from '../types/nutrition';

const TORTILLA: FoodItem = {
  id: 'tortilla',
  name: 'Tortilla de maíz',
  basePortionSize: '1 pieza (30 g)',
  macroPerPortion: { calories: 64, protein: 1.7, carbs: 13.4, fat: 0.7 },
};

const POLLO: FoodItem = {
  id: 'pollo',
  name: 'Pechuga de pollo',
  basePortionSize: '100 g',
  macroPerPortion: { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
};

describe('useMealPlanner', () => {
  it('arranca con los tres tiempos de comida por defecto y sin alimentos', () => {
    const { result } = renderHook(() => useMealPlanner());

    expect(result.current.mealTimes.map((m) => m.name)).toEqual(['Desayuno', 'Comida', 'Cena']);
    expect(result.current.mealTimes.every((m) => m.foods.length === 0)).toBe(true);
    expect(result.current.dailyTotal).toEqual({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  });

  it('escala los macros por el número de porciones al agregar un alimento', () => {
    const { result } = renderHook(() => useMealPlanner());
    const desayunoId = result.current.mealTimes[0].id;

    act(() => result.current.addFood(desayunoId, TORTILLA, 2));

    const desayuno = result.current.mealTimes[0];
    expect(desayuno.foods).toHaveLength(1);
    expect(desayuno.foods[0].totalMacro.calories).toBe(128);
    expect(desayuno.totalMacro.calories).toBe(128);
    expect(desayuno.totalMacro.protein).toBeCloseTo(3.4, 5);
  });

  it('suma el total diario a través de varios tiempos de comida', () => {
    const { result } = renderHook(() => useMealPlanner());
    const [desayuno, comida] = result.current.mealTimes;

    act(() => result.current.addFood(desayuno.id, TORTILLA, 2));
    act(() => result.current.addFood(comida.id, POLLO, 1));

    expect(result.current.dailyTotal.calories).toBe(293);
    expect(result.current.dailyTotal.fat).toBeCloseTo(5, 5);
  });

  it('recalcula el total del tiempo de comida al editar las porciones', () => {
    const { result } = renderHook(() => useMealPlanner());
    const desayunoId = result.current.mealTimes[0].id;

    act(() => result.current.addFood(desayunoId, TORTILLA, 2));
    const addedId = result.current.mealTimes[0].foods[0].id;

    act(() => result.current.editFood(desayunoId, addedId, 4));

    expect(result.current.mealTimes[0].foods[0].portions).toBe(4);
    expect(result.current.mealTimes[0].totalMacro.calories).toBe(256);
  });

  it('deja el tiempo de comida en cero al eliminar su único alimento', () => {
    const { result } = renderHook(() => useMealPlanner());
    const desayunoId = result.current.mealTimes[0].id;

    act(() => result.current.addFood(desayunoId, POLLO, 1));
    const addedId = result.current.mealTimes[0].foods[0].id;

    act(() => result.current.removeFood(desayunoId, addedId));

    expect(result.current.mealTimes[0].foods).toHaveLength(0);
    expect(result.current.mealTimes[0].totalMacro).toEqual({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    expect(result.current.dailyTotal.calories).toBe(0);
  });

  it('agrega y elimina tiempos de comida', () => {
    const { result } = renderHook(() => useMealPlanner());

    act(() => result.current.addMealTime('Colación AM'));
    expect(result.current.mealTimes).toHaveLength(4);

    const nuevo = result.current.mealTimes.find((m) => m.name === 'Colación AM');
    expect(nuevo).toBeDefined();

    act(() => result.current.removeMealTime(nuevo!.id));
    expect(result.current.mealTimes).toHaveLength(3);
  });

  it('vacía todos los alimentos pero conserva los tiempos de comida', () => {
    const { result } = renderHook(() => useMealPlanner());
    const [desayuno, comida] = result.current.mealTimes;

    act(() => result.current.addFood(desayuno.id, TORTILLA, 3));
    act(() => result.current.addFood(comida.id, POLLO, 2));

    act(() => result.current.clearAllFoods());

    expect(result.current.mealTimes).toHaveLength(3);
    expect(result.current.mealTimes.every((m) => m.foods.length === 0)).toBe(true);
    expect(result.current.dailyTotal.calories).toBe(0);
  });

  it('renombra un tiempo de comida sin tocar sus alimentos', () => {
    const { result } = renderHook(() => useMealPlanner());
    const desayunoId = result.current.mealTimes[0].id;

    act(() => result.current.addFood(desayunoId, TORTILLA, 1));
    act(() => result.current.updateMealTimeName(desayunoId, 'Primer tiempo'));

    expect(result.current.mealTimes[0].name).toBe('Primer tiempo');
    expect(result.current.mealTimes[0].foods).toHaveLength(1);
  });
});

describe('utils/calculations', () => {
  it('reparte el porcentaje calórico entre los tres macronutrientes', () => {
    // 100 g de proteína y 100 g de carbohidrato aportan 400 kcal cada uno;
    // 100 g de grasa aportan 900 kcal. Total 1700 kcal.
    const pct = calculateMacroPercentages({ calories: 1700, protein: 100, carbs: 100, fat: 100 });

    expect(pct).toEqual({ protein: 24, carbs: 24, fat: 53 });
    // Cada porcentaje se redondea por separado, así que la suma puede quedar
    // a un punto de 100. Es el comportamiento esperado, no un error de cálculo.
    expect(Math.abs(pct.protein + pct.carbs + pct.fat - 100)).toBeLessThanOrEqual(1);
  });

  it('devuelve ceros cuando el tiempo de comida no tiene calorías', () => {
    expect(calculateMacroPercentages({ calories: 0, protein: 0, carbs: 0, fat: 0 })).toEqual({
      protein: 0,
      carbs: 0,
      fat: 0,
    });
  });

  it('redondea los macros a dos decimales', () => {
    expect(roundNutrients({ calories: 128.041, protein: 3.446, carbs: 26.833, fat: 1.415 })).toEqual({
      calories: 128.04,
      protein: 3.45,
      carbs: 26.83,
      fat: 1.42,
    });
  });
});
