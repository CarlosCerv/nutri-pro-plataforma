import Food from '../models/Food.js';

const SLOT_KEYS = ['breakfast', 'morningSnack', 'lunch', 'afternoonSnack', 'dinner', 'eveningSnack'];

// Agrupación por departamento de súper a partir de `Food.category`. Es la
// misma idea que `frontend/src/lib/smae.js` (aproximar con la categoría, no
// hay un campo de departamento propio en `Food`), pero aquí el destino es
// una lista de compras, no una porción SMAE.
const DEPARTMENTS = [
    { name: 'Frutas y Verduras', categories: ['fruits', 'vegetables'] },
    { name: 'Carnes y Proteínas', categories: ['proteins'] },
    { name: 'Lácteos', categories: ['dairy'] },
    { name: 'Abarrotes', categories: ['cereals', 'legumes', 'fats', 'nuts', 'beverages', 'other'] },
];

function departmentFor(category) {
    return DEPARTMENTS.find((d) => d.categories.includes(category))?.name || 'Abarrotes';
}

/** Junta los `foods[]` de los 6 tiempos de un documento `meals`. */
function foodsInMeals(meals) {
    if (!meals) return [];
    return SLOT_KEYS.flatMap((slot) => meals[slot]?.foods || []);
}

/** Todas las entradas de alimento del plan: `days[]` si existe, si no el `meals` de raíz. */
function allFoodEntries(plan) {
    if (Array.isArray(plan?.days) && plan.days.length > 0) {
        return plan.days.flatMap((d) => foodsInMeals(d.meals));
    }
    return foodsInMeals(plan?.meals);
}

/**
 * Consolida los ingredientes de un `MealPlan` (los 7 días si los tiene) en
 * una lista de compras agrupada por departamento: suma los gramos de cada
 * alimento repetido en la semana y agrupa por `Food.category`.
 */
export async function buildShoppingList(plan) {
    const entradas = allFoodEntries(plan).filter((f) => f.foodRef);

    const idsUnicos = [...new Set(entradas.map((f) => String(f.foodRef)))];
    const foods = idsUnicos.length > 0
        ? await Food.find({ _id: { $in: idsUnicos } }).select('name category').lean()
        : [];
    const foodById = new Map(foods.map((f) => [String(f._id), f]));

    const totalesPorAlimento = new Map();
    entradas.forEach((entrada) => {
        const id = String(entrada.foodRef);
        const food = foodById.get(id);
        const nombre = food?.name || entrada.item || 'Alimento';
        const acumulado = totalesPorAlimento.get(id) || {
            foodId: id,
            name: nombre,
            category: food?.category || 'other',
            totalGrams: 0,
        };
        acumulado.totalGrams += Number(entrada.quantityGrams) || 0;
        totalesPorAlimento.set(id, acumulado);
    });

    const porDepartamento = new Map(DEPARTMENTS.map((d) => [d.name, []]));
    for (const item of totalesPorAlimento.values()) {
        const depto = departmentFor(item.category);
        porDepartamento.get(depto).push({
            foodId: item.foodId,
            name: item.name,
            totalGrams: Math.round(item.totalGrams),
        });
    }

    return DEPARTMENTS.map((d) => ({
        department: d.name,
        items: porDepartamento.get(d.name).sort((a, b) => a.name.localeCompare(b.name, 'es')),
    })).filter((d) => d.items.length > 0);
}

export default { buildShoppingList };
