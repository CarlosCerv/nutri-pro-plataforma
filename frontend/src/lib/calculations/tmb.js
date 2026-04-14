/**
 * NutriPro v2.0 — Cálculo de Tasa Metabólica Basal (TMB)
 * Todas las funciones son puras y testeables independientemente de la UI.
 * Unidades: peso en kg, altura en cm, edad en años.
 * TMB resultante en kcal/día.
 */

// ── Factores de Actividad (OMS/Harris-Benedict) ───────────────────
export const ACTIVITY_FACTORS = {
  sedentario:          { label: 'Sedentario (sin ejercicio)',                  value: 1.2   },
  ligero:              { label: 'Ligeramente activo (1–3 días/semana)',        value: 1.375 },
  moderado:            { label: 'Moderadamente activo (3–5 días/semana)',      value: 1.55  },
  activo:              { label: 'Muy activo (6–7 días/semana)',                value: 1.725 },
  muy_activo:          { label: 'Extremadamente activo (deporte + trabajo)',   value: 1.9   },
};

// ── Harris-Benedict Original (1919) ───────────────────────────────
export const harrisBenedict = (weight, height, age, sex) => {
  if (sex === 'M') {
    return 66.47 + (13.75 * weight) + (5.003 * height) - (6.755 * age);
  }
  return 655.1 + (9.563 * weight) + (1.85 * height) - (4.676 * age);
};

// ── Mifflin-St Jeor (1990) — más precisa para población general ───
export const mifflinStJeor = (weight, height, age, sex) => {
  const base = (10 * weight) + (6.25 * height) - (5 * age);
  return sex === 'M' ? base + 5 : base - 161;
};

// ── FAO/OMS por grupos de edad ────────────────────────────────────
const FAO_TABLE = {
  M: [
    { min: 0,   max: 3,  a: 60.9,   b: -54   },
    { min: 3,   max: 10, a: 22.7,   b: 495   },
    { min: 10,  max: 18, a: 17.5,   b: 651   },
    { min: 18,  max: 30, a: 15.3,   b: 679   },
    { min: 30,  max: 60, a: 11.6,   b: 879   },
    { min: 60,  max: 999,a: 13.5,   b: 487   },
  ],
  F: [
    { min: 0,   max: 3,  a: 61.0,   b: -51   },
    { min: 3,   max: 10, a: 22.5,   b: 499   },
    { min: 10,  max: 18, a: 12.2,   b: 746   },
    { min: 18,  max: 30, a: 14.7,   b: 496   },
    { min: 30,  max: 60, a: 8.7,    b: 829   },
    { min: 60,  max: 999,a: 10.5,   b: 596   },
  ],
};

export const faoOms = (weight, age, sex) => {
  const table = FAO_TABLE[sex] || FAO_TABLE['M'];
  const row = table.find(r => age >= r.min && age < r.max);
  if (!row) return null;
  return row.a * weight + row.b;
};

// ── Katch-McArdle (requiere masa magra) ───────────────────────────
export const katchMcArdle = (leanMassKg) => {
  return 370 + (21.6 * leanMassKg);
};

// ── Owen (1987) ───────────────────────────────────────────────────
export const owen = (weight, sex) => {
  return sex === 'M' ? 879 + (10.2 * weight) : 795 + (7.18 * weight);
};

// ── GET = TMB × Factor de Actividad ──────────────────────────────
export const calcularGET = (tmb, factorKey) => {
  const factor = ACTIVITY_FACTORS[factorKey]?.value ?? 1.2;
  return tmb * factor;
};

// ── VET objetivo con ajuste por meta ──────────────────────────────
export const GOAL_ADJUSTMENTS = {
  bajar_peso:    -500,
  bajar_rapido:  -750,
  mantener:       0,
  ganar_musculo: +300,
  volumen:       +500,
};

export const calcularVET = (get, goalKey) => {
  const adj = GOAL_ADJUSTMENTS[goalKey] ?? 0;
  return Math.max(1000, get + adj); // mínimo 1,000 kcal
};

// ── Distribución de Macronutrimentos ─────────────────────────────
export const MACRO_PRESETS = {
  estandar:       { proteinas: 0.20, carbohidratos: 0.50, lipidos: 0.30 },
  alto_proteina:  { proteinas: 0.30, carbohidratos: 0.40, lipidos: 0.30 },
  bajo_carbo:     { proteinas: 0.25, carbohidratos: 0.25, lipidos: 0.50 },
  deportista:     { proteinas: 0.30, carbohidratos: 0.50, lipidos: 0.20 },
  diabetes:       { proteinas: 0.20, carbohidratos: 0.35, lipidos: 0.45 },
  renal:          { proteinas: 0.10, carbohidratos: 0.60, lipidos: 0.30 },
};

/**
 * Calcula gramos de cada macro dado el VET y los porcentajes.
 * @returns {{ proteinas_g, carbos_g, lipidos_g, fibra_g, agua_ml }}
 */
export const calcularMacros = (vet, prot = 0.20, carbs = 0.50, fat = 0.30) => {
  return {
    proteinas_g:     Math.round((vet * prot) / 4),
    carbos_g:        Math.round((vet * carbs) / 4),
    lipidos_g:       Math.round((vet * fat) / 9),
  };
};

// ── Requerimiento hídrico ─────────────────────────────────────────
export const calcularAgua = (weightKg) => {
  // Fórmula: 35 ml/kg para adultos
  return weightKg * 35;
};

// ── Peso Ideal ────────────────────────────────────────────────────
export const pesoIdeal = {
  hamwi: (heightCm, sex) => {
    const baseIn = sex === 'M' ? 48 : 45.5;
    const extraIn = sex === 'M' ? 2.7 : 2.3;
    const heightIn = heightCm / 2.54;
    const base = heightIn > 60 ? baseIn + extraIn * (heightIn - 60) : baseIn;
    return Math.round(base * 0.453592 * 10) / 10;
  },
  devine: (heightCm, sex) => {
    const base = sex === 'M' ? 50 : 45.5;
    const extra = sex === 'M' ? 2.3 : 2.3;
    const heightIn = heightCm / 2.54;
    return Math.round((base + extra * ((heightIn - 60))) * 0.453592 * 10) / 10;
  },
};

// ── Calcula todos los TMBs de una vez ────────────────────────────
export const calcularTodosTMB = ({ weight, height, age, sex, leanMass }) => {
  return {
    harrisBenedict: Math.round(harrisBenedict(weight, height, age, sex)),
    mifflinStJeor:  Math.round(mifflinStJeor(weight, height, age, sex)),
    faoOms:         Math.round(faoOms(weight, age, sex) ?? 0),
    owen:           Math.round(owen(weight, sex)),
    katchMcArdle:   leanMass ? Math.round(katchMcArdle(leanMass)) : null,
  };
};
