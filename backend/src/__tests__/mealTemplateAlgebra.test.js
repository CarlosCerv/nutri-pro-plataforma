import { describe, it, expect } from 'vitest';
import { det3, solve3x3, solveMainMeal, solveSnack, buildTemplate, BANDS } from '../services/mealTemplateAlgebra.js';

describe('det3 / solve3x3', () => {
    it('calcula el determinante de una matriz 3x3 conocida', () => {
        expect(det3([[1, 0, 0], [0, 1, 0], [0, 0, 1]])).toBe(1);
        expect(det3([[2, 0, 0], [0, 3, 0], [0, 0, 4]])).toBe(24);
    });

    it('resuelve un sistema 3x3 con solución exacta conocida', () => {
        const A = [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
        ];
        expect(solve3x3(A, [2, 3, 4])).toEqual([2, 3, 4]);
    });

    it('devuelve null si la matriz es singular', () => {
        const A = [
            [1, 2, 3],
            [2, 4, 6],
            [1, 1, 1],
        ];
        expect(solve3x3(A, [1, 2, 3])).toBeNull();
    });
});

// Foods de prueba con perfiles simples (un macro dominante cada uno) para que
// el sistema de ecuaciones quede bien condicionado y el resultado sea fácil
// de razonar a mano.
const CARB_FOOD = {
    _id: 'carb-id',
    name: 'Carb',
    nutrition: { energy: 350, protein: 8, carbohydrates: 75, fat: 2 },
    servingSizes: [{ grams: 50, name: 'porción' }],
};
const PROTEIN_FOOD = {
    _id: 'protein-id',
    name: 'Protein',
    nutrition: { energy: 165, protein: 31, carbohydrates: 0, fat: 3.6 },
    servingSizes: [{ grams: 100, name: 'porción' }],
};
const FAT_FOOD = {
    _id: 'fat-id',
    name: 'Fat',
    nutrition: { energy: 884, protein: 0, carbohydrates: 0, fat: 98 },
    servingSizes: [{ grams: 15, name: 'cucharada' }],
};
const EXTRA_FOOD = {
    _id: 'extra-id',
    name: 'Extra',
    nutrition: { energy: 50, protein: 1, carbohydrates: 12, fat: 0 },
    servingSizes: [{ grams: 150, name: 'pieza' }],
};

const FOOD_MAP = new Map([
    ['Carb', CARB_FOOD],
    ['Protein', PROTEIN_FOOD],
    ['Fat', FAT_FOOD],
    ['Extra', EXTRA_FOOD],
]);

const MAIN_MEAL_SPEC = { carb: 'Carb', protein: 'Protein', fat: 'Fat', extra: 'Extra' };
const SNACK_SPEC = { carb: 'Carb', protein: 'Protein', fat: 'Fat' };

describe('solveMainMeal', () => {
    it('no devuelve gramos negativos para un objetivo calórico razonable', () => {
        const items = solveMainMeal(FOOD_MAP, MAIN_MEAL_SPEC, 400);
        expect(items.length).toBeGreaterThan(0);
        for (const item of items) {
            expect(item.grams).toBeGreaterThanOrEqual(0);
        }
    });

    it('lanza un error si falta un alimento en el catálogo', () => {
        expect(() => solveMainMeal(FOOD_MAP, { ...MAIN_MEAL_SPEC, protein: 'No Existe' }, 400)).toThrow(
            'Alimento no encontrado'
        );
    });
});

describe('solveSnack', () => {
    it('no devuelve gramos negativos y escala hacia el objetivo calórico', () => {
        const items = solveSnack(FOOD_MAP, SNACK_SPEC, 150);
        expect(items.length).toBe(3);
        for (const item of items) {
            expect(item.grams).toBeGreaterThanOrEqual(0);
        }
    });
});

describe('buildTemplate', () => {
    const recipe = {
        name: 'Receta de prueba',
        category: 'custom',
        tags: ['test'],
        meals: {
            breakfast: MAIN_MEAL_SPEC,
            morningSnack: SNACK_SPEC,
            lunch: MAIN_MEAL_SPEC,
            afternoonSnack: SNACK_SPEC,
            dinner: MAIN_MEAL_SPEC,
        },
    };

    it('genera un menú completo con calorías cercanas a la banda declarada', () => {
        const band = BANDS[0]; // 1300-1400 kcal
        const template = buildTemplate(FOOD_MAP, recipe, band);

        expect(template.name).toContain(`${band.lo}-${band.hi} kcal`);
        expect(Object.keys(template.defaultMeals)).toEqual([
            'breakfast',
            'morningSnack',
            'lunch',
            'afternoonSnack',
            'dinner',
        ]);

        // El agregado no tiene que caer exacto en la banda (el redondeo a
        // gramos enteros de ~15 alimentos deja un margen), pero sí cerca.
        expect(template.targetCalories).toBeGreaterThan(band.lo * 0.9);
        expect(template.targetCalories).toBeLessThan(band.hi * 1.1);

        for (const meal of Object.values(template.defaultMeals)) {
            for (const food of meal.foods) {
                expect(food.quantityGrams).toBeGreaterThan(0);
            }
        }
    });
});
