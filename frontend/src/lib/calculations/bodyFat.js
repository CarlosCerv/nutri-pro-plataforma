/**
 * NutriPro v2.0 — Cálculo de % Grasa Corporal mediante Pliegues Cutáneos
 * Implementa: Durnin & Womersley, Jackson & Pollock 3 y 7, Siri, Brozek
 */

// ── Constantes Durnin & Womersley (4 pliegues) ───────────────────
// Valores de c y m por grupo de edad y sexo
const DW_TABLE = {
  M: [
    { min: 17, max: 19, c: 1.1620, m: 0.0630 },
    { min: 20, max: 29, c: 1.1631, m: 0.0632 },
    { min: 30, max: 39, c: 1.1422, m: 0.0544 },
    { min: 40, max: 49, c: 1.1620, m: 0.0700 },
    { min: 50, max: 999,c: 1.1715, m: 0.0779 },
  ],
  F: [
    { min: 17, max: 19, c: 1.1549, m: 0.0678 },
    { min: 20, max: 29, c: 1.1599, m: 0.0717 },
    { min: 30, max: 39, c: 1.1423, m: 0.0632 },
    { min: 40, max: 49, c: 1.1333, m: 0.0612 },
    { min: 50, max: 999,c: 1.1339, m: 0.0645 },
  ],
};

/**
 * Durnin & Womersley — 4 pliegues (bicipital, tricipital, subescapular, suprailiaco)
 * Todos en mm.
 */
export const durninWomersley = ({ bicipital, tricipital, subescapular, suprailiaco, edad, sexo }) => {
  const suma = bicipital + tricipital + subescapular + suprailiaco;
  if (suma <= 0) return null;

  const table = DW_TABLE[sexo] || DW_TABLE['M'];
  const row = table.find(r => edad >= r.min && edad <= r.max) || table[table.length - 1];

  const logSuma = Math.log10(suma);
  const densidad = row.c - (row.m * logSuma);
  const pctGrasa = ((4.95 / densidad) - 4.5) * 100;

  return { densidad, pctGrasa: Math.round(pctGrasa * 10) / 10 };
};

// ── Jackson & Pollock 3 pliegues ──────────────────────────────────
/**
 * Hombres: pecho + abdomen + muslo (mm)
 * Mujeres: tríceps + suprailiaco + muslo (mm)
 */
export const jacksonPollock3 = ({ pliegue1, pliegue2, pliegue3, edad, sexo }) => {
  const suma = pliegue1 + pliegue2 + pliegue3;
  let densidad;

  if (sexo === 'M') {
    densidad = 1.10938
      - (0.0008267 * suma)
      + (0.0000016 * suma ** 2)
      - (0.0002574 * edad);
  } else {
    densidad = 1.0994921
      - (0.0009929 * suma)
      + (0.0000023 * suma ** 2)
      - (0.0001392 * edad);
  }

  const pctGrasa = ((4.95 / densidad) - 4.5) * 100;
  return { densidad, pctGrasa: Math.round(pctGrasa * 10) / 10 };
};

// ── Jackson & Pollock 7 pliegues ──────────────────────────────────
/**
 * Hombres: pecho + axilar + tricipital + subescapular + abdominal + suprailiaco + muslo
 * Mujeres: mismos 7
 */
export const jacksonPollock7 = ({ pecho, axilar, tricipital, subescapular, abdominal, suprailiaco, muslo, edad, sexo }) => {
  const suma = pecho + axilar + tricipital + subescapular + abdominal + suprailiaco + muslo;
  let densidad;

  if (sexo === 'M') {
    densidad = 1.112
      - (0.00043499 * suma)
      + (0.00000055 * suma ** 2)
      - (0.00028826 * edad);
  } else {
    densidad = 1.097
      - (0.00046971 * suma)
      + (0.00000056 * suma ** 2)
      - (0.00012828 * edad);
  }

  const pctGrasa = ((4.95 / densidad) - 4.5) * 100;
  return { densidad, pctGrasa: Math.round(pctGrasa * 10) / 10 };
};

// ── Ecuaciones de conversión de Densidad → % Grasa ───────────────
/** Siri (1956) */
export const pctGrasaSiri   = (densidad) => ((4.95 / densidad) - 4.5) * 100;

/** Brozek (1963) */
export const pctGrasaBrozek = (densidad) => ((4.57 / densidad) - 4.142) * 100;

// ── Masa Grasa y Masa Magra ───────────────────────────────────────
export const calcularMasas = (pesoKg, pctGrasa) => {
  const masaGrasa = (pesoKg * pctGrasa) / 100;
  const masaMagra = pesoKg - masaGrasa;
  return {
    masaGrasa: Math.round(masaGrasa * 10) / 10,
    masaMagra: Math.round(masaMagra * 10) / 10,
  };
};

// ── Clasificación de % Grasa por sexo y edad ──────────────────────
export const clasificarPctGrasa = (pctGrasa, sexo) => {
  // Rangos ACSM simplificados
  if (sexo === 'M') {
    if (pctGrasa < 6)  return { nivel: 'Esencial',     codigo: 'info'    };
    if (pctGrasa < 14) return { nivel: 'Atlético',     codigo: 'normal'  };
    if (pctGrasa < 18) return { nivel: 'Fitness',      codigo: 'normal'  };
    if (pctGrasa < 25) return { nivel: 'Promedio',     codigo: 'warning' };
    return                    { nivel: 'Obeso',        codigo: 'danger'  };
  }
  // Femenino
  if (pctGrasa < 14) return { nivel: 'Esencial',     codigo: 'info'    };
  if (pctGrasa < 21) return { nivel: 'Atlético',     codigo: 'normal'  };
  if (pctGrasa < 25) return { nivel: 'Fitness',      codigo: 'normal'  };
  if (pctGrasa < 32) return { nivel: 'Promedio',     codigo: 'warning' };
  return                    { nivel: 'Obeso',        codigo: 'danger'  };
};

// ── Helper: calcula con todos los métodos y los agrupa ───────────
export const calcularTodosMetodos = ({ pliegues, edad, sexo, peso }) => {
  const { bicipital = 0, tricipital = 0, subescapular = 0, suprailiaco = 0,
          abdominal = 0, muslo = 0, pecho = 0, axilar = 0 } = pliegues;

  const dw  = durninWomersley({ bicipital, tricipital, subescapular, suprailiaco, edad, sexo });
  const jp3 = jacksonPollock3({
    pliegue1: sexo === 'M' ? pecho     : tricipital,
    pliegue2: sexo === 'M' ? abdominal : suprailiaco,
    pliegue3: muslo,
    edad, sexo,
  });
  const jp7 = jacksonPollock7({ pecho, axilar, tricipital, subescapular, abdominal, suprailiaco, muslo, edad, sexo });

  return {
    durninWomersley: dw  ? { ...dw,  ...calcularMasas(peso, dw.pctGrasa)  } : null,
    jacksonPollock3: jp3 ? { ...jp3, ...calcularMasas(peso, jp3.pctGrasa) } : null,
    jacksonPollock7: jp7 ? { ...jp7, ...calcularMasas(peso, jp7.pctGrasa) } : null,
  };
};
