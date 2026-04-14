/**
 * NutriPro v2.0 — IMC, Perímetros y Clasificación OMS
 */

// ── IMC ───────────────────────────────────────────────────────────
export const calcularIMC = (weightKg, heightCm) => {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
};

// Clasificación OMS con código de color para semáforo UI
export const clasificarIMC = (imc) => {
  if (imc < 18.5) return { categoria: 'Bajo peso',     codigo: 'info',    color: '#3B82F6', rango: '< 18.5' };
  if (imc < 25.0) return { categoria: 'Normal',         codigo: 'normal',  color: '#2ECC8E', rango: '18.5–24.9' };
  if (imc < 30.0) return { categoria: 'Sobrepeso',      codigo: 'warning', color: '#F59E0B', rango: '25–29.9' };
  if (imc < 35.0) return { categoria: 'Obesidad I',     codigo: 'danger',  color: '#EF4444', rango: '30–34.9' };
  if (imc < 40.0) return { categoria: 'Obesidad II',    codigo: 'danger',  color: '#DC2626', rango: '35–39.9' };
  return              { categoria: 'Obesidad III',   codigo: 'danger',  color: '#991B1B', rango: '≥ 40' };
};

// ── ICC — Índice Cintura-Cadera ───────────────────────────────────
export const calcularICC = (cinturaCm, caderaCm) => cinturaCm / caderaCm;

export const clasificarICC = (icc, sex) => {
  if (sex === 'M') {
    if (icc < 0.90) return { riesgo: 'Bajo',  codigo: 'normal'  };
    if (icc < 1.00) return { riesgo: 'Moderado', codigo: 'warning' };
    return                  { riesgo: 'Alto',  codigo: 'danger'  };
  }
  // Femenino
  if (icc < 0.80) return { riesgo: 'Bajo',  codigo: 'normal'  };
  if (icc < 0.85) return { riesgo: 'Moderado', codigo: 'warning' };
  return                  { riesgo: 'Alto',  codigo: 'danger'  };
};

// ── Complexión por índice de Frisancho ────────────────────────────
export const complexionFrisancho = (heightCm, munecaCm) => {
  const r = heightCm / munecaCm;
  if (r > 10.4) return 'Pequeña';
  if (r > 9.6)  return 'Mediana';
  return               'Grande';
};

// ── Somatotipo Heath-Carter ────────────────────────────────────────
/**
 * @param {object} datos
 *   triceps, subescapular, suprailiaco, pantorrilla — pliegues en mm
 *   altura — cm, peso — kg
 *   biepicondilar_humero, biepicondilar_femur — cm
 *   perimetro_brazo, perimetro_pantorrilla — cm
 */
export const calcularSomatotipo = ({
  triceps,
  subescapular,
  suprailiaco,
  pantorrilla_pliegue,
  altura,
  peso,
  biepicondilar_humero,
  biepicondilar_femur,
  perimetro_brazo,
  perimetro_pantorrilla,
}) => {
  // Endomorfia (adiposidad relativa)
  const sumaPliegues = (triceps + subescapular + suprailiaco) * (170.18 / altura);
  const endomorfia = -0.7182 + (0.1451 * sumaPliegues) - (0.00068 * sumaPliegues ** 2) + (0.0000014 * sumaPliegues ** 3);

  // Mesomorfia (predominio músculo-esquelético)
  const brazoCorr  = perimetro_brazo - (triceps / 10);
  const piernaCorr = perimetro_pantorrilla - (pantorrilla_pliegue / 10);
  const mesomorfia = (0.858 * biepicondilar_humero) + (0.601 * biepicondilar_femur) + (0.188 * brazoCorr) + (0.161 * piernaCorr) - (0.131 * altura) + 4.5;

  // Ectomorfia (linealidad relativa)
  const ipp = peso / (altura ** 3) * 100000; // Índice Ponderal
  let ectomorfia;
  if      (ipp >= 40.75) ectomorfia = 0.732 * ipp - 28.58;
  else if (ipp >= 38.25) ectomorfia = 0.463 * ipp - 17.63;
  else                   ectomorfia = 0.1;

  return {
    endomorfia: Math.max(0, Math.round(endomorfia * 10) / 10),
    mesomorfia: Math.max(0, Math.round(mesomorfia * 10) / 10),
    ectomorfia: Math.max(0, Math.round(ectomorfia * 10) / 10),
  };
};

// ── Coordenadas de somatocarta (X, Y) ────────────────────────────
export const somatocartaXY = (endomorfia, mesomorfia, ectomorfia) => {
  const x = ectomorfia - endomorfia;
  const y = (2 * mesomorfia) - (endomorfia + ectomorfia);
  return { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 };
};

// ── Clasificación de somatotipo ───────────────────────────────────
export const clasificarSomatotipo = (endo, meso, ecto) => {
  const max = Math.max(endo, meso, ecto);
  const diff = 0.5;
  if (max === endo && meso < max - diff && ecto < max - diff) return 'Endomorfo puro';
  if (max === meso && endo < max - diff && ecto < max - diff) return 'Mesomorfo puro';
  if (max === ecto && endo < max - diff && meso < max - diff) return 'Ectomorfo puro';
  if (endo >= meso && endo >= ecto)  return 'Endo-mesomorfo';
  if (meso >= endo && meso >= ecto)  return 'Meso-endomorfo';
  return 'Balanced';
};
