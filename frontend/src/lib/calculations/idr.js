/**
 * NutriPro v2.0 — Tabla IDR/DRI completa y semáforo de micronutrimentos
 * Basada en DRI (Institute of Medicine) + rangos de referencia clínica
 */

// ── IDR por sexo biológico adulto (18-50 años) ───────────────────
export const IDR = {
  // Macros
  proteinas_g:        { M: 56,    F: 46,    unidad: 'g',   nombre: 'Proteínas' },
  carbohidratos_g:    { M: 130,   F: 130,   unidad: 'g',   nombre: 'Carbohidratos' },
  fibra_g:            { M: 38,    F: 25,    unidad: 'g',   nombre: 'Fibra' },
  lipidos_g:          { M: 78,    F: 62,    unidad: 'g',   nombre: 'Lípidos totales' },

  // Vitaminas
  vitamina_a_mcg:     { M: 900,   F: 700,   unidad: 'mcg', nombre: 'Vitamina A' },
  vitamina_c_mg:      { M: 90,    F: 75,    unidad: 'mg',  nombre: 'Vitamina C' },
  vitamina_d_mcg:     { M: 15,    F: 15,    unidad: 'mcg', nombre: 'Vitamina D' },
  vitamina_e_mg:      { M: 15,    F: 15,    unidad: 'mg',  nombre: 'Vitamina E' },
  vitamina_k_mcg:     { M: 120,   F: 90,    unidad: 'mcg', nombre: 'Vitamina K' },
  vitamina_b1_mg:     { M: 1.2,   F: 1.1,   unidad: 'mg',  nombre: 'Tiamina (B1)' },
  vitamina_b2_mg:     { M: 1.3,   F: 1.1,   unidad: 'mg',  nombre: 'Riboflavina (B2)' },
  vitamina_b3_mg:     { M: 16,    F: 14,    unidad: 'mg',  nombre: 'Niacina (B3)' },
  vitamina_b5_mg:     { M: 5,     F: 5,     unidad: 'mg',  nombre: 'Ácido Pantoténico (B5)' },
  vitamina_b6_mg:     { M: 1.3,   F: 1.3,   unidad: 'mg',  nombre: 'Vitamina B6' },
  vitamina_b9_mcg:    { M: 400,   F: 400,   unidad: 'mcg', nombre: 'Folato (B9)' },
  vitamina_b12_mcg:   { M: 2.4,   F: 2.4,   unidad: 'mcg', nombre: 'Vitamina B12' },
  colina_mg:          { M: 550,   F: 425,   unidad: 'mg',  nombre: 'Colina' },

  // Minerales
  calcio_mg:          { M: 1000,  F: 1000,  unidad: 'mg',  nombre: 'Calcio' },
  hierro_mg:          { M: 8,     F: 18,    unidad: 'mg',  nombre: 'Hierro' },
  magnesio_mg:        { M: 420,   F: 320,   unidad: 'mg',  nombre: 'Magnesio' },
  fosforo_mg:         { M: 700,   F: 700,   unidad: 'mg',  nombre: 'Fósforo' },
  potasio_mg:         { M: 3400,  F: 2600,  unidad: 'mg',  nombre: 'Potasio' },
  sodio_mg:           { M: 2300,  F: 2300,  unidad: 'mg',  nombre: 'Sodio', esLimite: true },
  zinc_mg:            { M: 11,    F: 8,     unidad: 'mg',  nombre: 'Zinc' },
  cobre_mcg:          { M: 900,   F: 900,   unidad: 'mcg', nombre: 'Cobre' },
  manganeso_mg:       { M: 2.3,   F: 1.8,   unidad: 'mg',  nombre: 'Manganeso' },
  selenio_mcg:        { M: 55,    F: 55,    unidad: 'mcg', nombre: 'Selenio' },
  yodo_mcg:           { M: 150,   F: 150,   unidad: 'mcg', nombre: 'Yodo' },

  // Ácidos grasos
  omega3_g:           { M: 1.6,   F: 1.1,   unidad: 'g',   nombre: 'Omega-3 total' },
  saturadas_g:        { M: null,  F: null,  unidad: 'g',   nombre: 'Grasas saturadas', esLimite: true, limiteMax: 22 },
  colesterol_mg:      { M: null,  F: null,  unidad: 'mg',  nombre: 'Colesterol', esLimite: true, limiteMax: 300 },
};

// ── Rangos de laboratorio clínico ────────────────────────────────
export const RANGOS_LAB = {
  glucosa_ayuno_mg:    { normal: [70, 100],   warning: [100, 125],  critico: [125, 9999], unidad: 'mg/dL', nombre: 'Glucosa en ayuno' },
  glucosa_post_mg:     { normal: [0, 140],    warning: [140, 200],  critico: [200, 9999], unidad: 'mg/dL', nombre: 'Glucosa postprandial' },
  hba1c_pct:           { normal: [0, 5.7],    warning: [5.7, 6.5],  critico: [6.5, 100],  unidad: '%',     nombre: 'HbA1c' },
  colesterol_total_mg: { normal: [0, 200],    warning: [200, 240],  critico: [240, 9999], unidad: 'mg/dL', nombre: 'Colesterol total' },
  hdl_mg:              { normal: [60, 9999],  warning: [40, 60],    critico: [0, 40],     unidad: 'mg/dL', nombre: 'HDL', invertido: true },
  ldl_mg:              { normal: [0, 100],    warning: [100, 160],  critico: [160, 9999], unidad: 'mg/dL', nombre: 'LDL' },
  trigliceridos_mg:    { normal: [0, 150],    warning: [150, 200],  critico: [200, 9999], unidad: 'mg/dL', nombre: 'Triglicéridos' },
  hemoglobina_g:       { normal: [12, 17.5],  warning: [10, 12],    critico: [0, 10],     unidad: 'g/dL',  nombre: 'Hemoglobina', invertido: true },
  ferritina_ng:        { normal: [15, 300],   warning: [10, 15],    critico: [0, 10],     unidad: 'ng/mL', nombre: 'Ferritina', invertido: true },
  creatinina_mg:       { normal: [0.6, 1.2],  warning: [1.2, 2.0],  critico: [2.0, 9999], unidad: 'mg/dL', nombre: 'Creatinina' },
  acido_urico_mg:      { normal: [2.4, 6.0],  warning: [6.0, 8.0],  critico: [8.0, 9999], unidad: 'mg/dL', nombre: 'Ácido úrico' },
  tsh_miu:             { normal: [0.4, 4.0],  warning: [4.0, 10.0], critico: [10.0, 9999],unidad: 'mIU/L', nombre: 'TSH' },
  vitamina_d_nmol:     { normal: [75, 9999],  warning: [50, 75],    critico: [0, 50],     unidad: 'nmol/L',nombre: 'Vitamina D', invertido: true },
  vitamina_b12_pg:     { normal: [200, 9999], warning: [150, 200],  critico: [0, 150],    unidad: 'pg/mL', nombre: 'Vitamina B12', invertido: true },
};

/**
 * Determina el semáforo de un resultado de laboratorio.
 * @returns {'normal' | 'warning' | 'critical'}
 */
export const semaforoLab = (campo, valor) => {
  const rango = RANGOS_LAB[campo];
  if (!rango || valor == null) return 'unknown';

  const v = parseFloat(valor);
  if (isNaN(v)) return 'unknown';

  // Para rangos invertidos (mayor = peor), ya están codificados con los mismos rangos
  const [nMin, nMax] = rango.normal;
  const [wMin, wMax] = rango.warning;

  if (v >= nMin && v <= nMax) return 'normal';
  if (v >= wMin && v <= wMax) return 'warning';
  return 'critical';
};

/**
 * Determina el semáforo de un micronutrimento del plan.
 * Compara el valor consumido vs IDR.
 */
export const semaforoMicro = (campo, valor, sexo = 'F') => {
  const idr = IDR[campo];
  if (!idr) return 'unknown';

  const recomendado = idr[sexo] || idr.M;
  if (!recomendado || valor == null) return 'unknown';

  const pct = (valor / recomendado) * 100;

  if (idr.esLimite) {
    // Para límites superiores (sodio, saturadas), invertir lógica
    if (pct <= 80)   return 'normal';
    if (pct <= 100)  return 'warning';
    return 'critical';
  }

  // Para recomendaciones mínimas
  if (pct >= 80)  return 'normal';
  if (pct >= 50)  return 'warning';
  return 'critical';
};

// ── Grupos de micronutrimentos para UI ────────────────────────────
export const GRUPOS_MICROS = {
  vitaminas: ['vitamina_a_mcg', 'vitamina_c_mg', 'vitamina_d_mcg', 'vitamina_e_mg',
              'vitamina_k_mcg', 'vitamina_b1_mg', 'vitamina_b2_mg', 'vitamina_b3_mg',
              'vitamina_b6_mg', 'vitamina_b9_mcg', 'vitamina_b12_mcg', 'colina_mg'],
  minerales: ['calcio_mg', 'hierro_mg', 'magnesio_mg', 'fosforo_mg', 'potasio_mg',
              'sodio_mg', 'zinc_mg', 'selenio_mcg'],
  lipidos:   ['omega3_g', 'saturadas_g', 'colesterol_mg'],
};
