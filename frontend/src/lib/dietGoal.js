import { mifflinStJeor, calcularGET, calcularVET, calcularMacros, MACRO_PRESETS } from './calculations/tmb.js';

export const DEFAULT_META = { kcal: 2000, protein: 100, carbohydrates: 250, fats: 65 };

const calcEdad = (dob) => {
  if (!dob) return null;
  return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
};

/**
 * Meta calórica y de macros por defecto para el plan, a partir del
 * expediente del paciente (Mifflin-St Jeor + factor de actividad + reparto
 * estándar 20/50/30). Si falta peso, talla o edad, cae en valores genéricos:
 * el nutriólogo siempre puede ajustarla a mano en el constructor.
 */
export function metaDesdeExpediente(patient) {
  const weight = patient?.anthropometry?.weight || patient?.lastWeight;
  const height = patient?.anthropometry?.height || patient?.height;
  const age = calcEdad(patient?.dob);
  const sex = patient?.sex === 'F' ? 'F' : 'M';

  if (!weight || !height || !age) return { ...DEFAULT_META };

  const tmb = mifflinStJeor(weight, height, age, sex);
  const get = calcularGET(tmb, patient?.nivelActividad || 'sedentario');
  const vet = calcularVET(get, 'mantener');
  const preset = MACRO_PRESETS.estandar;
  const macros = calcularMacros(vet, preset.proteinas, preset.carbohidratos, preset.lipidos);

  return {
    kcal: Math.round(vet),
    protein: macros.proteinas_g,
    carbohydrates: macros.carbos_g,
    fats: macros.lipidos_g,
  };
}
