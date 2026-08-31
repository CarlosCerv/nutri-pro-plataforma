/**
 * NutriPro v2.0 — Porciones aproximadas al Sistema Mexicano de Alimentos
 * Equivalentes (SMAE), a partir de `Food.category`.
 *
 * El catálogo de alimentos no captura el grupo SMAE ni el tamaño de ración
 * por alimento (eso requeriría una tabla de equivalentes curada aparte), así
 * que esto es una aproximación por categoría: cada grupo usa el tamaño de
 * ración típico del SMAE para ese tipo de alimento. Sirve para que el
 * nutriólogo piense en porciones mientras arma el plan, no como sustituto de
 * la tabla de equivalentes oficial.
 */
export const SMAE_GROUPS = {
  cereals: { label: 'Cereales y tubérculos', grams: 30 },
  proteins: { label: 'Alimentos de origen animal', grams: 30 },
  dairy: { label: 'Leche y derivados', grams: 240 },
  fruits: { label: 'Frutas', grams: 100 },
  vegetables: { label: 'Verduras', grams: 100 },
  fats: { label: 'Grasas', grams: 5 },
  legumes: { label: 'Leguminosas', grams: 45 },
  nuts: { label: 'Grasas con proteína (oleaginosas)', grams: 20 },
  beverages: { label: 'Bebidas', grams: 240 },
  other: { label: 'Azúcares y otros', grams: 15 },
};

const DEFAULT_GROUP = { label: 'Ración', grams: 100 };

export function smaeGroup(category) {
  return SMAE_GROUPS[category] || DEFAULT_GROUP;
}

export function gramsToPortions(grams, category) {
  const { grams: ref } = smaeGroup(category);
  return Math.round((Math.max(0, Number(grams) || 0) / ref) * 2) / 2;
}

export function portionsToGrams(portions, category) {
  const { grams: ref } = smaeGroup(category);
  return Math.round(Math.max(0, Number(portions) || 0) * ref);
}
