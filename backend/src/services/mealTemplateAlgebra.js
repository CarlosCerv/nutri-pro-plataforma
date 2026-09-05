/**
 * Álgebra pura para generar plantillas de dieta (`DietTemplate`) a partir del
 * catálogo real de `Food`. Extraído de `scripts/seedGeneratedTemplates.js`
 * para poder testear el álgebra sin tocar la base de datos: nada aquí hace
 * I/O, todo recibe el `foodMap` ya cargado y devuelve datos en memoria.
 */

// Distribución de macronutrientes objetivo del DÍA (estándar, dentro de 50-55/15-20/25-30).
export const MACROS = { carbP: 0.52, protP: 0.18, fatP: 0.30 };

// Objetivo que se resuelve exacto en desayuno/comida/cena (80% del día). Las
// colaciones (solveSnack) no se fuerzan al macro exacto y en la práctica
// salen más grasas que el objetivo general — su "ancla de grasa" (fruto seco,
// aceite) es, proporcionalmente, más concentrada que en una comida grande.
// Se compensa aquí: bajar el objetivo de grasa de las comidas grandes para
// que el promedio ponderado del día completo (80% comidas + 20% colaciones)
// termine cerca de MACROS.
export const MACROS_MAIN = { carbP: 0.53, protP: 0.18, fatP: 0.29 };

// Reparto de calorías del día entre tiempos de comida.
export const MEAL_SPLIT = {
    breakfast: 0.25,
    morningSnack: 0.10,
    lunch: 0.30,
    afternoonSnack: 0.10,
    dinner: 0.25,
};

// 17 rangos de 100 kcal: 1300-1400 ... 2900-3000. El objetivo se fija 60% del
// rango hacia arriba (no en el punto medio): el redondeo a gramos enteros de
// ~15 alimentos por menú resta unas pocas kcal en el agregado, y un objetivo
// justo a la mitad del rango deja muy poco margen antes de cruzar el límite
// inferior declarado.
export const BANDS = [];
for (let lo = 1300; lo < 3000; lo += 100) {
    BANDS.push({ lo, hi: lo + 100, mid: lo + 75 });
}

export const MEAL_TIMES = {
    breakfast: '08:00',
    morningSnack: '11:00',
    lunch: '14:00',
    afternoonSnack: '17:30',
    dinner: '20:30',
};

const SNACK_KEYS = new Set(['morningSnack', 'afternoonSnack']);

export function det3(m) {
    return (
        m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
        m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
        m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
    );
}

export function solve3x3(A, b) {
    const D = det3(A);
    if (Math.abs(D) < 1e-9) return null;
    const replCol = (col) => A.map((row, i) => row.map((v, j) => (j === col ? b[i] : v)));
    return [det3(replCol(0)) / D, det3(replCol(1)) / D, det3(replCol(2)) / D];
}

function per100(food) {
    return {
        e: food.nutrition.energy || 0,
        p: food.nutrition.protein || 0,
        c: food.nutrition.carbohydrates || 0,
        f: food.nutrition.fat || 0,
    };
}

function contrib(food, grams) {
    const n = per100(food);
    const k = grams / 100;
    return { calories: n.e * k, protein: n.p * k, carbohydrates: n.c * k, fats: n.f * k };
}

/**
 * Resuelve un alimento (nombre) o una pareja (`[nombreA, nombreB]`) como un
 * único "ancla virtual" cuyo per-100g es el promedio de ambos. Repartir el
 * carbohidrato de una comida grande entre dos alimentos evita que, a 3000
 * kcal, un solo pan o una sola tortilla tengan que cargar con los ~100g de
 * carbohidrato del día completo — 500g de un mismo alimento en una sola
 * comida no es una porción real, aunque la cuenta de calorías sí cierre.
 */
function resolveAnchor(foodMap, nameOrPair) {
    const names = Array.isArray(nameOrPair) ? nameOrPair : [nameOrPair];
    const foods = names.map((n) => {
        const food = foodMap.get(n);
        if (!food) throw new Error(`Alimento no encontrado en el catálogo: ${n}`);
        return food;
    });
    const avg = (key) => foods.reduce((s, f) => s + (f.nutrition[key] || 0), 0) / foods.length;
    return {
        foods,
        per100: { e: avg('energy'), p: avg('protein'), c: avg('carbohydrates'), f: avg('fat') },
    };
}

/** Resuelve gramos de [carb, protein, fat] para llegar exacto al macro objetivo de `targetKcal`, tras descontar `extra` (porción fija). */
export function solveMainMeal(foodMap, spec, targetKcal) {
    const carbAnchor = resolveAnchor(foodMap, spec.carb);
    const proteinFood = foodMap.get(spec.protein);
    const fatFood = foodMap.get(spec.fat);
    const extraFood = spec.extra ? foodMap.get(spec.extra) : null;
    if (!proteinFood || !fatFood || (spec.extra && !extraFood)) {
        throw new Error(`Alimento no encontrado en el catálogo: ${JSON.stringify(spec)}`);
    }

    const extraGrams = extraFood ? extraFood.servingSizes[0].grams : 0;
    const extra = extraFood ? contrib(extraFood, extraGrams) : { calories: 0, protein: 0, carbohydrates: 0, fats: 0 };

    const targetCarbsG = (targetKcal * MACROS_MAIN.carbP) / 4;
    const targetProteinG = (targetKcal * MACROS_MAIN.protP) / 4;
    const targetFatG = (targetKcal * MACROS_MAIN.fatP) / 9;

    const nc = carbAnchor.per100;
    const np = per100(proteinFood);
    const nf = per100(fatFood);

    const A = [
        [nc.c / 100, np.c / 100, nf.c / 100],
        [nc.p / 100, np.p / 100, nf.p / 100],
        [nc.f / 100, np.f / 100, nf.f / 100],
    ];
    const b = [targetCarbsG - extra.carbohydrates, targetProteinG - extra.protein, targetFatG - extra.fats];
    const sol = solve3x3(A, b);
    if (!sol) throw new Error(`Sistema singular para receta con ${spec.carb}/${spec.protein}/${spec.fat}`);
    const [gCarbTotal, gProt, gFat] = sol;

    const items = [];
    if (extraFood) items.push({ food: extraFood, grams: extraGrams });
    for (const carbFood of carbAnchor.foods) {
        items.push({ food: carbFood, grams: gCarbTotal / carbAnchor.foods.length });
    }
    items.push({ food: proteinFood, grams: gProt }, { food: fatFood, grams: gFat });
    return items;
}

/**
 * Escala proporcionalmente el trío carb/protein/fat de una colación hasta
 * llegar a `targetKcal`, en sus porciones habituales relativas entre sí.
 *
 * No se le exige el macro exacto como a las comidas grandes: con solo ~10%
 * de las calorías del día, el "ancla de proteína" (yogurt, queso, hummus)
 * ya trae de por sí algo de grasa — a veces más que el presupuesto de grasa
 * completo de la colación —, así que el álgebra exacta que sí funciona bien
 * en desayuno/comida/cena pide aquí gramos negativos para compensarlo.
 */
export function solveSnack(foodMap, spec, targetKcal) {
    // La porción de grasa se toma a un tercio de su ración habitual: un puño
    // entero de almendras o una cucharada completa de aceite ya son, por sí
    // solos, más de lo que le corresponde a una colación de ~10% del día.
    const roles = [
        [spec.carb, 1],
        [spec.protein, 1],
        [spec.fat, 1 / 3],
    ];
    const items = roles.map(([name, portion]) => {
        const food = foodMap.get(name);
        if (!food) throw new Error(`Alimento no encontrado: ${name}`);
        return { food, baseGrams: food.servingSizes[0].grams * portion };
    });
    const baseKcal = items.reduce((sum, it) => sum + contrib(it.food, it.baseGrams).calories, 0);
    const scale = targetKcal / baseKcal;
    return items.map((it) => ({ food: it.food, grams: it.baseGrams * scale }));
}

/** "1.5 taza", "80 g" — múltiplo de la porción común del alimento cuando es razonable, gramos si no. */
function describeQuantity(grams, serving) {
    const multiple = grams / serving.grams;
    if (multiple >= 0.25 && multiple <= 6) {
        const rounded = Math.round(multiple * 4) / 4; // cuartos
        return `${rounded} ${serving.name}`;
    }
    return `${grams} g`;
}

function buildMeal(foodMap, mealKey, spec, targetKcal, time) {
    const rawItems = SNACK_KEYS.has(mealKey) ? solveSnack(foodMap, spec, targetKcal) : solveMainMeal(foodMap, spec, targetKcal);

    // -0.5g de margen: el álgebra de punto flotante a veces deja un residuo
    // negativo minúsculo (p.ej. -0.02) donde el valor real es esencialmente
    // cero, no un ancla mal elegida.
    const negatives = rawItems.filter((it) => it.grams < -0.5);
    if (negatives.length > 0) {
        throw new Error(
            `Gramos inválidos en ${mealKey} (${negatives.map((n) => `${n.food.name}: ${n.grams.toFixed(1)}g`).join(', ')}) — receta necesita otro alimento ancla.`
        );
    }
    // Un resultado entre 0 y 2g es válido (el resto de la comida ya cubrió casi
    // todo ese macro) pero no es una porción real — se sube a un mínimo de
    // "una pizca" en vez de mostrar "0.6 g de aceite" en el menú.
    const MIN_GRAMS = 2;
    const items = rawItems.map((it) => (it.grams < MIN_GRAMS ? { ...it, grams: MIN_GRAMS } : it));

    const foods = items.map((it) => {
        const grams = Math.round(it.grams);
        const c = contrib(it.food, grams);
        const serving = it.food.servingSizes?.[0];
        return {
            foodRef: it.food._id,
            quantity: serving ? describeQuantity(grams, serving) : `${grams} g`,
            quantityGrams: grams,
            calories: Math.round(c.calories),
            protein: Math.round(c.protein * 10) / 10,
            carbohydrates: Math.round(c.carbohydrates * 10) / 10,
            fats: Math.round(c.fats * 10) / 10,
        };
    });

    return { time, foods };
}

/** Construye un `DietTemplate` en memoria (sin `_id`/`createdBy`) para una receta y una banda de calorías del día. */
export function buildTemplate(foodMap, recipe, band) {
    const dayKcal = band.mid;
    const defaultMeals = {};
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    for (const [mealKey, split] of Object.entries(MEAL_SPLIT)) {
        const mealTargetKcal = dayKcal * split;
        const meal = buildMeal(foodMap, mealKey, recipe.meals[mealKey], mealTargetKcal, MEAL_TIMES[mealKey]);
        defaultMeals[mealKey] = meal;
        for (const f of meal.foods) {
            totalCalories += f.calories;
            totalProtein += f.protein;
            totalCarbs += f.carbohydrates;
            totalFats += f.fats;
        }
    }

    return {
        name: `${recipe.name} · ${band.lo}-${band.hi} kcal`,
        description: `Menú de ${band.lo} a ${band.hi} kcal con desayuno, colación matutina, comida, colación vespertina y cena. Distribución 52% carbohidratos / 18% proteína / 30% grasa.`,
        category: recipe.category,
        tags: [...recipe.tags, `${band.lo}-${band.hi}kcal`],
        targetCalories: Math.round(totalCalories),
        targetMacros: {
            protein: Math.round(totalProtein),
            carbohydrates: Math.round(totalCarbs),
            fats: Math.round(totalFats),
        },
        defaultMeals,
        isSystemTemplate: true,
        isPublic: true,
        _band: band,
        _achieved: {
            calories: totalCalories,
            carbP: (totalCarbs * 4) / totalCalories,
            protP: (totalProtein * 4) / totalCalories,
            fatP: (totalFats * 9) / totalCalories,
        },
    };
}
