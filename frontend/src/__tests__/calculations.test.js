/**
 * Lógica clínica pura de `src/lib/calculations/`.
 *
 * Son las funciones con más valor por línea del proyecto: deciden el
 * diagnóstico que ve el nutriólogo (IMC, riesgo cardiovascular, gasto
 * energético) y hasta ahora no tenían ninguna prueba.
 */

import { describe, it, expect } from 'vitest';
import {
  calcularIMC,
  clasificarIMC,
  calcularICC,
  clasificarICC,
  complexionFrisancho,
} from '../lib/calculations/imc';
import {
  harrisBenedict,
  mifflinStJeor,
  calcularGET,
  calcularVET,
  calcularMacros,
  calcularAgua,
  ACTIVITY_FACTORS,
  GOAL_ADJUSTMENTS,
} from '../lib/calculations/tmb';

describe('IMC', () => {
  it('calcula el índice a partir de peso en kg y talla en cm', () => {
    // 70 kg / (1.75 m)^2 = 22.86
    expect(calcularIMC(70, 175)).toBeCloseTo(22.86, 2);
  });

  it.each([
    [17.0, 'Bajo peso'],
    [22.0, 'Normal'],
    [27.5, 'Sobrepeso'],
    [32.0, 'Obesidad I'],
    [37.0, 'Obesidad II'],
    [42.0, 'Obesidad III'],
  ])('clasifica %s como %s según la OMS', (imc, categoria) => {
    expect(clasificarIMC(imc).categoria).toBe(categoria);
  });

  it('respeta los límites exactos de la clasificación OMS', () => {
    // 18.5 y 25.0 son los cortes: pertenecen a la categoría superior.
    expect(clasificarIMC(18.5).categoria).toBe('Normal');
    expect(clasificarIMC(24.9).categoria).toBe('Normal');
    expect(clasificarIMC(25.0).categoria).toBe('Sobrepeso');
    expect(clasificarIMC(30.0).categoria).toBe('Obesidad I');
  });
});

describe('Índice cintura-cadera', () => {
  it('calcula el cociente', () => {
    expect(calcularICC(80, 100)).toBeCloseTo(0.8, 5);
  });

  it('usa umbrales distintos por sexo', () => {
    // 0.85 es riesgo alto en mujer pero bajo en hombre.
    expect(clasificarICC(0.85, 'F').riesgo).toBe('Alto');
    expect(clasificarICC(0.85, 'M').riesgo).toBe('Bajo');
  });

  it('clasifica el riesgo moderado en el rango intermedio', () => {
    expect(clasificarICC(0.82, 'F').riesgo).toBe('Moderado');
    expect(clasificarICC(0.95, 'M').riesgo).toBe('Moderado');
  });
});

describe('Complexión de Frisancho', () => {
  it('clasifica por el cociente talla / perímetro de muñeca', () => {
    expect(complexionFrisancho(175, 15)).toBe('Pequeña');   // 11.67
    expect(complexionFrisancho(175, 17.5)).toBe('Mediana'); // 10.0
    expect(complexionFrisancho(175, 19)).toBe('Grande');    // 9.21
  });
});

describe('Tasa metabólica basal', () => {
  it('Mifflin-St Jeor aplica el ajuste por sexo sobre la misma base', () => {
    // base = 10*70 + 6.25*175 - 5*30 = 1643.75
    expect(mifflinStJeor(70, 175, 30, 'M')).toBeCloseTo(1648.75, 2);
    expect(mifflinStJeor(70, 175, 30, 'F')).toBeCloseTo(1482.75, 2);
  });

  it('Harris-Benedict devuelve un valor del mismo orden que Mifflin', () => {
    const hb = harrisBenedict(70, 175, 30, 'M');
    const msj = mifflinStJeor(70, 175, 30, 'M');
    expect(Math.abs(hb - msj)).toBeLessThan(150);
  });

  it('un hombre tiene TMB mayor que una mujer con los mismos datos', () => {
    expect(mifflinStJeor(70, 175, 30, 'M')).toBeGreaterThan(mifflinStJeor(70, 175, 30, 'F'));
  });
});

describe('Gasto energético y macronutrientes', () => {
  it('multiplica la TMB por el factor de actividad', () => {
    const factor = ACTIVITY_FACTORS.sedentario?.value;
    expect(factor).toBeDefined();
    expect(calcularGET(1600, 'sedentario')).toBeCloseTo(1600 * factor, 5);
  });

  it('cae al factor sedentario (1.2) si la clave no existe', () => {
    expect(calcularGET(1600, 'no_existe')).toBeCloseTo(1920, 5);
  });

  it('aplica el ajuste calórico de la meta', () => {
    expect(calcularVET(2400, 'bajar_peso')).toBe(2400 + GOAL_ADJUSTMENTS.bajar_peso);
    expect(calcularVET(2400, 'mantener')).toBe(2400);
  });

  it('nunca prescribe menos de 1000 kcal', () => {
    expect(calcularVET(1200, 'bajar_rapido')).toBe(1000);
  });

  it('reparte el VET en gramos usando 4/4/9 kcal por gramo', () => {
    const macros = calcularMacros(2000, 0.2, 0.5, 0.3);
    expect(macros.proteinas_g).toBe(100); // 400 kcal / 4
    expect(macros.carbos_g).toBe(250);    // 1000 kcal / 4
    expect(macros.lipidos_g).toBe(67);    // 600 kcal / 9
  });

  it('calcula el requerimiento hídrico a 35 ml/kg', () => {
    expect(calcularAgua(70)).toBe(2450);
  });
});
