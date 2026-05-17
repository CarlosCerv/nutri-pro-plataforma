/**
 * components/MealPlannerExamples.jsx
 * Ejemplos de uso avanzado y patrones para DailyMealPlanner
 */

import React, { useState, useEffect } from 'react';
import { useMealPlanner } from '../hooks/useMealPlanner';
import type { FoodItem, MealTime } from '../types/nutrition';

/**
 * Ejemplo 1: Cargar catálogo de alimentos desde API
 */
export const MealPlannerWithAPI = () => {
  const { mealTimes, dailyTotal } = useMealPlanner();
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        // Reemplaza con tu endpoint real
        const response = await fetch('/api/foods');
        const data = await response.json();
        setFoods(data);
      } catch (error) {
        console.error('Error fetching foods:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, []);

  if (loading) return <div>Cargando catálogo de alimentos...</div>;

  return <div>Planificador con {foods.length} alimentos disponibles</div>;
};

/**
 * Ejemplo 2: Guardar plan de comidas en backend
 */
export const MealPlannerWithPersistence = ({ patientId }) => {
  const { mealTimes, dailyTotal } = useMealPlanner();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const handleSaveMealPlan = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const payload = {
        patientId,
        date: new Date(),
        mealTimes,
        dailyTotal,
        createdAt: new Date(),
      };

      const response = await fetch(`/api/mealplans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Error guardando plan de comidas');
      }

      const savedPlan = await response.json();
      console.log('Plan guardado:', savedPlan);
      alert('Plan de comidas guardado exitosamente');
    } catch (error) {
      setSaveError(error.message);
      console.error('Error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleSaveMealPlan}
        disabled={isSaving}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
      >
        {isSaving ? 'Guardando...' : 'Guardar Plan'}
      </button>
      {saveError && <p className="text-red-600 mt-2">{saveError}</p>}
    </div>
  );
};

/**
 * Ejemplo 3: Cargar plan existente al iniciar
 */
export const MealPlannerWithLoading = ({ planId }) => {
  const { mealTimes, addFood, removeFood } = useMealPlanner();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const response = await fetch(`/api/mealplans/${planId}`);
        const plan = await response.json();

        // Poblar el estado con los datos cargados
        // Nota: Deberías adaptar useMealPlanner para aceptar initialMealTimes
        console.log('Plan cargado:', plan);
      } catch (error) {
        console.error('Error cargando plan:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (planId) {
      loadPlan();
    }
  }, [planId]);

  if (isLoading) return <div>Cargando plan de comidas...</div>;

  return <div>Plan cargado</div>;
};

/**
 * Ejemplo 4: Hook personalizado para objetivos de macros
 */
export const useMacroGoals = (targetCalories: number, proteinPercent: number) => {
  const targetProtein = (targetCalories * (proteinPercent / 100)) / 4;
  const targetCarbs = (targetCalories * 0.45) / 4;
  const targetFat = (targetCalories * 0.3) / 9;

  return {
    targetCalories,
    targetProtein,
    targetCarbs,
    targetFat,
  };
};

/**
 * Ejemplo 5: Componente con indicador de progreso hacia objetivos
 */
export const MealPlannerWithGoals = ({ targetCalories = 2000, proteinPercent = 30 }) => {
  const { dailyTotal } = useMealPlanner();
  const goals = useMacroGoals(targetCalories, proteinPercent);

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage <= 100) return 'bg-green-500';
    if (percentage <= 110) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const calorieProgress = getProgressPercentage(dailyTotal.calories, goals.targetCalories);
  const proteinProgress = getProgressPercentage(dailyTotal.protein, goals.targetProtein);

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-bold text-lg">Progreso hacia Objetivos</h3>

      <div>
        <div className="flex justify-between mb-2">
          <span>Calorías</span>
          <span>{dailyTotal.calories.toFixed(0)} / {goals.targetCalories}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`${getProgressColor(calorieProgress)} h-4 rounded-full transition-all`}
            style={{ width: `${calorieProgress}%` }}
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between mb-2">
          <span>Proteína</span>
          <span>{dailyTotal.protein.toFixed(1)}g / {goals.targetProtein.toFixed(1)}g</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`${getProgressColor(proteinProgress)} h-4 rounded-full transition-all`}
            style={{ width: `${proteinProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Ejemplo 6: Exportar plan a CSV
 */
export const exportPlanToCSV = (mealTimes: MealTime[], dailyTotal) => {
  let csv = 'Tiempo de Comida,Alimento,Porciones,Calorías,Proteína (g),Carbos (g),Grasas (g)\n';

  mealTimes.forEach((mealTime) => {
    mealTime.foods.forEach((food) => {
      csv += `${mealTime.name},${food.foodName},${food.portions},${Math.round(food.totalMacro.calories)},${food.totalMacro.protein.toFixed(1)},${food.totalMacro.carbs.toFixed(1)},${food.totalMacro.fat.toFixed(1)}\n`;
    });
  });

  csv += `\nTOTAL DIARIO,,,${Math.round(dailyTotal.calories)},${dailyTotal.protein.toFixed(1)},${dailyTotal.carbs.toFixed(1)},${dailyTotal.fat.toFixed(1)}\n`;

  const link = document.createElement('a');
  link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  link.download = `plan-comidas-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

/**
 * Ejemplo 7: Duplicar plan de un día anterior
 */
export const useCopyPreviousPlan = () => {
  const copyPlanFromDate = async (fromDate: Date, mealTimes) => {
    try {
      const response = await fetch(`/api/mealplans?date=${fromDate.toISOString().split('T')[0]}`);
      const previousPlan = await response.json();

      // Copiar alimentos al planificador actual
      // Esta lógica dependerá de tu implementación específica
      console.log('Plan anterior cargado:', previousPlan);
      return previousPlan;
    } catch (error) {
      console.error('Error copiando plan anterior:', error);
    }
  };

  return { copyPlanFromDate };
};

/**
 * Ejemplo 8: Validar plan contra restricciones dietéticas
 */
export const validateDietaryRestrictions = (
  mealTimes: MealTime[],
  restrictions: { maxCalories?: number; minProtein?: number; maxSodium?: number }
) => {
  const warnings: string[] = [];
  let totalCalories = 0;
  let totalProtein = 0;

  mealTimes.forEach((mealTime) => {
    totalCalories += mealTime.totalMacro.calories;
    totalProtein += mealTime.totalMacro.protein;
  });

  if (restrictions.maxCalories && totalCalories > restrictions.maxCalories) {
    warnings.push(
      `⚠️ Calorías (${totalCalories}) superan el límite (${restrictions.maxCalories})`
    );
  }

  if (restrictions.minProtein && totalProtein < restrictions.minProtein) {
    warnings.push(
      `⚠️ Proteína (${totalProtein}g) por debajo del mínimo (${restrictions.minProtein}g)`
    );
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  };
};

/**
 * Ejemplo 9: Comparar planes de múltiples días
 */
export const compareMultipleDays = async (startDate: Date, endDate: Date) => {
  try {
    const response = await fetch(
      `/api/nutrition-summary?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
    );
    const data = await response.json();

    const avgCalories = data.reduce((sum, day) => sum + day.calories, 0) / data.length;
    const avgProtein = data.reduce((sum, day) => sum + day.protein, 0) / data.length;

    return {
      avgCalories,
      avgProtein,
      days: data.length,
      data,
    };
  } catch (error) {
    console.error('Error comparando planes:', error);
  }
};
