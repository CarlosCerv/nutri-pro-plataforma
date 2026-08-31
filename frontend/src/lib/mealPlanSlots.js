/**
 * NutriPro v2.0 — Modelo de UI del Creador Híbrido de Dietas.
 *
 * `MealPlan.days` (backend) es un arreglo de 7 días con 6 tiempos de comida
 * cada uno; aquí se representa como un objeto `{ lun: [...6 slots], mar: ... }`
 * porque el editor solo trabaja sobre un día a la vez y así se indexa sin
 * buscar en un arreglo. `SLOT_META`/`DAYS` son la fuente única de las claves
 * y etiquetas que usan tanto `MenuBuilder` como sus subcomponentes.
 */

export const SLOT_META = [
  { key: 'breakfast', label: 'Desayuno' },
  { key: 'morningSnack', label: 'Colación 1' },
  { key: 'lunch', label: 'Comida' },
  { key: 'afternoonSnack', label: 'Colación 2' },
  { key: 'dinner', label: 'Cena' },
  { key: 'eveningSnack', label: 'Colación 3' },
];

export const DAYS = [
  { key: 'lun', label: 'Lunes', short: 'Lun' },
  { key: 'mar', label: 'Martes', short: 'Mar' },
  { key: 'mie', label: 'Miércoles', short: 'Mié' },
  { key: 'jue', label: 'Jueves', short: 'Jue' },
  { key: 'vie', label: 'Viernes', short: 'Vie' },
  { key: 'sab', label: 'Sábado', short: 'Sáb' },
  { key: 'dom', label: 'Domingo', short: 'Dom' },
];

let uidCounter = 0;
/** Id local estable para drag & drop (@dnd-kit necesita un id que sobreviva reordenamientos). */
export function newUid() {
  uidCounter += 1;
  return `f${Date.now().toString(36)}${uidCounter}`;
}

/** Valores por 100 g según modelo Food (nutrition.*). */
export function nutritionPer100g(food) {
  const n = food?.nutrition || {};
  return {
    energy: Number(n.energy) || 0,
    protein: Number(n.protein) || 0,
    carbohydrates: Number(n.carbohydrates) || 0,
    fats: Number(n.fat) || 0,
    fiber: Number(n.fiber) || 0,
  };
}

export function macrosForGrams(food, grams) {
  const g = Math.max(0, Number(grams) || 0);
  const r = g / 100;
  const n = nutritionPer100g(food);
  return {
    quantityGrams: g,
    calories: Math.round(n.energy * r),
    protein: Math.round(n.protein * r * 10) / 10,
    carbohydrates: Math.round(n.carbohydrates * r * 10) / 10,
    fats: Math.round(n.fats * r * 10) / 10,
    fiber: Math.round(n.fiber * r * 10) / 10,
  };
}

export function emptyDaySlots() {
  return SLOT_META.map((s) => ({ slotKey: s.key, slotLabel: s.label, items: [] }));
}

export function emptyDaysState() {
  return Object.fromEntries(DAYS.map((d) => [d.key, emptyDaySlots()]));
}

/** Convierte un documento `meals` (de MealPlan o de DietTemplate.defaultMeals) a los 6 slots de un día. */
export function mealsDocumentToSlots(meals) {
  if (!meals || typeof meals !== 'object') return emptyDaySlots();
  return SLOT_META.map((s) => {
    const block = meals[s.key];
    const arr = Array.isArray(block?.foods) ? block.foods : Array.isArray(block) ? block : [];
    const items = arr.map((f) => {
      const ref = f.foodRef?._id || f.foodRef || f.food;
      const name = f.item || f.foodName || f.foodRef?.name || 'Alimento';
      return {
        uid: newUid(),
        foodRef: ref,
        foodCategory: f.foodRef?.category || null,
        foodName: name,
        quantityGrams: f.quantityGrams ?? 100,
        calories: f.calories ?? 0,
        protein: f.protein ?? 0,
        carbohydrates: f.carbohydrates ?? 0,
        fats: f.fats ?? 0,
        fiber: f.fiber ?? 0,
        unitName: 'g',
        quantityLabel: f.quantity || null,
      };
    });
    return { slotKey: s.key, slotLabel: s.label, items };
  });
}

/** Slots de un día → `meals` con la forma que espera el backend. */
export function daySlotsToMealsPayload(slots) {
  const o = {};
  slots.forEach((s) => {
    o[s.slotKey] = {
      foods: s.items.map((it) => ({
        item: it.foodName,
        foodRef: it.foodRef,
        quantity: it.quantityLabel || undefined,
        quantityGrams: it.quantityGrams ?? 100,
        calories: it.calories ?? 0,
        protein: it.protein ?? 0,
        carbohydrates: it.carbohydrates ?? 0,
        fats: it.fats ?? 0,
      })),
    };
  });
  return o;
}

export function computeDayTotals(slots) {
  let totalCalories = 0;
  let protein = 0;
  let carbohydrates = 0;
  let fats = 0;
  let fiber = 0;
  slots.forEach((s) => {
    s.items.forEach((it) => {
      totalCalories += Number(it.calories) || 0;
      protein += Number(it.protein) || 0;
      carbohydrates += Number(it.carbohydrates) || 0;
      fats += Number(it.fats) || 0;
      fiber += Number(it.fiber) || 0;
    });
  });
  return {
    totalCalories: Math.round(totalCalories),
    protein: Math.round(protein * 10) / 10,
    carbohydrates: Math.round(carbohydrates * 10) / 10,
    fats: Math.round(fats * 10) / 10,
    fiber: Math.round(fiber * 10) / 10,
  };
}

/** El día "representativo" que se copia a `meals` (nivel raíz) para PDF y compatibilidad. */
export function representativeDayKey(daysState) {
  const conContenido = (key) => daysState[key]?.some((s) => s.items.length > 0);
  if (conContenido('lun')) return 'lun';
  const encontrado = DAYS.find((d) => conContenido(d.key));
  return encontrado ? encontrado.key : 'lun';
}

/** Promedio semanal (o del único día con contenido) para `nutrition` a nivel raíz del plan. */
export function computeWeekNutrition(daysState) {
  const totales = DAYS.map((d) => computeDayTotals(daysState[d.key]));
  const conContenido = totales.filter((t) => t.totalCalories > 0);
  const base = conContenido.length > 0 ? conContenido : [totales[0]];
  const promedio = (campo) => Math.round((base.reduce((a, t) => a + t[campo], 0) / base.length) * 10) / 10;
  return {
    totalCalories: Math.round(base.reduce((a, t) => a + t.totalCalories, 0) / base.length),
    protein: promedio('protein'),
    carbohydrates: promedio('carbohydrates'),
    fats: promedio('fats'),
    fiber: promedio('fiber'),
  };
}
