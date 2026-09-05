import { describe, it, expect } from 'vitest';
import NutritionCalculator from '../services/nutritionCalculator.js';

describe('NutritionCalculator.calculateBMR', () => {
    it('calcula BMR con Mifflin-St Jeor para hombre', () => {
        expect(NutritionCalculator.calculateBMR(70, 175, 30, 'male')).toBe(1649);
    });

    it('calcula BMR con Mifflin-St Jeor para mujer', () => {
        expect(NutritionCalculator.calculateBMR(60, 165, 28, 'female')).toBe(1330);
    });

    it('calcula BMR con Harris-Benedict', () => {
        expect(NutritionCalculator.calculateBMR(70, 175, 30, 'male', 'harris')).toBe(1702);
    });

    it('lanza un error con una fórmula inválida', () => {
        expect(() => NutritionCalculator.calculateBMR(70, 175, 30, 'male', 'bogus')).toThrow(
            'Invalid formula. Use "mifflin" or "harris"'
        );
    });
});

describe('NutritionCalculator.calculateTDEE', () => {
    it('aplica el factor de actividad correcto', () => {
        expect(NutritionCalculator.calculateTDEE(1649, 'sedentary')).toBe(1979);
    });

    it('cae al factor sedentario si el nivel no existe', () => {
        expect(NutritionCalculator.calculateTDEE(1649, 'not-a-level')).toBe(
            NutritionCalculator.calculateTDEE(1649, 'sedentary')
        );
    });
});

describe('NutritionCalculator.calculateMacros', () => {
    it('distribuye macros balanceados', () => {
        expect(NutritionCalculator.calculateMacros(2000, 'balanced')).toEqual({
            protein: { grams: 150, calories: 600, percentage: 30 },
            carbs: { grams: 200, calories: 800, percentage: 40 },
            fat: { grams: 67, calories: 600, percentage: 30 },
        });
    });

    it('distribuye macros keto', () => {
        expect(NutritionCalculator.calculateMacros(2000, 'keto')).toEqual({
            protein: { grams: 125, calories: 500, percentage: 25 },
            carbs: { grams: 25, calories: 100, percentage: 5 },
            fat: { grams: 156, calories: 1400, percentage: 70 },
        });
    });

    it('cae a la distribución balanceada si el tipo no existe', () => {
        expect(NutritionCalculator.calculateMacros(2000, 'not-a-distribution')).toEqual(
            NutritionCalculator.calculateMacros(2000, 'balanced')
        );
    });
});

describe('NutritionCalculator.calculateBodyFat3Site', () => {
    it('calcula % de grasa para hombre (chest/abdominal/thigh)', () => {
        expect(
            NutritionCalculator.calculateBodyFat3Site({ chest: 10, abdominal: 15, thigh: 12 }, 30, 'male')
        ).toBe(11.2);
    });

    it('calcula % de grasa para mujer (triceps/suprailiac/thigh)', () => {
        expect(
            NutritionCalculator.calculateBodyFat3Site({ triceps: 12, suprailiac: 10, thigh: 14 }, 28, 'female')
        ).toBe(15.7);
    });

    it('trata pliegues faltantes como 0 en vez de fallar', () => {
        expect(() => NutritionCalculator.calculateBodyFat3Site({}, 30, 'male')).not.toThrow();
    });
});

describe('NutritionCalculator.calculateBodyFat7Site', () => {
    it('calcula % de grasa para hombre con los 7 pliegues', () => {
        expect(
            NutritionCalculator.calculateBodyFat7Site(
                { chest: 10, abdominal: 15, thigh: 12, triceps: 8, subscapular: 9, suprailiac: 10, calf: 7 },
                30,
                'male'
            )
        ).toBe(10.4);
    });
});

describe('NutritionCalculator.calculateBodyComposition', () => {
    it('deriva masa grasa, magra, muscular y ósea del % de grasa', () => {
        expect(NutritionCalculator.calculateBodyComposition(70, 20)).toEqual({
            fatMass: 14,
            leanMass: 56,
            muscleMass: 25.2,
            boneMass: 8.4,
        });
    });
});

describe('NutritionCalculator.calculateIdealWeight', () => {
    it('calcula peso ideal (Devine) para hombre', () => {
        expect(NutritionCalculator.calculateIdealWeight(175, 'male')).toBe(70);
    });

    it('calcula peso ideal (Devine) para mujer', () => {
        expect(NutritionCalculator.calculateIdealWeight(165, 'female')).toBe(57);
    });
});

describe('NutritionCalculator.calculateWHR', () => {
    it('calcula el índice cintura-cadera y su riesgo', () => {
        expect(NutritionCalculator.calculateWHR(80, 100)).toEqual({ ratio: 0.8, risk: 'low' });
    });
});

describe('NutritionCalculator.calculateBMI', () => {
    it.each([
        [70, 175, 22.9, 'normal'],
        [45, 175, 14.7, 'underweight'],
        [80, 175, 26.1, 'overweight'],
        [100, 175, 32.7, 'obese'],
    ])('clasifica peso %d kg / talla %d cm como %s (%s)', (weight, height, value, category) => {
        expect(NutritionCalculator.calculateBMI(weight, height)).toEqual({ value, category });
    });
});
