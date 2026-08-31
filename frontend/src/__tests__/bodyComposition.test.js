/**
 * Traducción del formulario de mediciones al esquema de BodyComposition.
 *
 * Estas pruebas existen por una regresión concreta: el formulario enviaba los
 * pliegues como campos planos en español, el modelo espera `skinfolds{}`
 * anidado en inglés, y Mongoose los descartaba sin error. La petición
 * respondía 201 y la captura se perdía entera.
 */

import { describe, it, expect } from 'vitest';
import { toBodyCompositionPayload, toHistorySeries } from '../lib/bodyComposition';

const formVacio = {
  fecha: '2026-08-30',
  peso: '', talla: '', cintura: '', cadera: '', muneca: '',
  bicipital: '', tricipital: '', subescapular: '', suprailiaco: '',
  abdominal: '', muslo_pliegue: '', pierna: '', pecho: '', axilar: '',
  brazo_rel: '', brazo_cont: '', antebrazo: '', muslo: '', pantorrilla: '',
  torax: '', abdomen: '', pa_sis: '', pa_dia: '',
  biepicondilar_humero: '', biepicondilar_femur: '',
};

describe('toBodyCompositionPayload', () => {
  it('anida los pliegues bajo `skinfolds` con los nombres en inglés del modelo', () => {
    const payload = toBodyCompositionPayload(
      { ...formVacio, tricipital: '18', bicipital: '9', subescapular: '20', suprailiaco: '15', muslo_pliegue: '25', pierna: '12', pecho: '10', axilar: '8', abdominal: '22' },
      { patientId: 'p1', formula: 'durninWomersley' }
    );

    expect(payload.skinfolds).toEqual({
      triceps: 18,
      biceps: 9,
      subscapular: 20,
      suprailiac: 15,
      abdominal: 22,
      thigh: 25,
      calf: 12,
      chest: 10,
      midaxillary: 8,
    });
  });

  it('separa perímetros y diámetros óseos en sus propios subdocumentos', () => {
    const payload = toBodyCompositionPayload(
      { ...formVacio, cintura: '82', cadera: '98', torax: '95', brazo_rel: '30', antebrazo: '25', muslo: '55', pantorrilla: '36', muneca: '16', biepicondilar_humero: '6.5', biepicondilar_femur: '9' },
      { patientId: 'p1' }
    );

    expect(payload.circumferences).toEqual({ waist: 82, hip: 98, chest: 95, arm: 30, forearm: 25, thigh: 55, calf: 36 });
    expect(payload.boneDiameters).toEqual({ wrist: 16, elbow: 6.5, knee: 9 });
  });

  it('guarda peso, talla, IMC e ICC bajo `measurements`', () => {
    const payload = toBodyCompositionPayload(
      { ...formVacio, peso: '72.4', talla: '165' },
      { patientId: 'p1', imc: 26.6, icc: '0.84' }
    );

    expect(payload.measurements).toEqual({ weight: 72.4, height: 165, bmi: 26.6, waistHipRatio: 0.84 });
  });

  it('omite los subdocumentos cuyos campos están todos vacíos', () => {
    const payload = toBodyCompositionPayload(formVacio, { patientId: 'p1' });

    expect(payload.skinfolds).toBeUndefined();
    expect(payload.circumferences).toBeUndefined();
    expect(payload.boneDiameters).toBeUndefined();
    expect(payload.bloodPressure).toBeUndefined();
    expect(payload.measurements).toBeUndefined();
  });

  it('no convierte los campos vacíos en ceros', () => {
    const payload = toBodyCompositionPayload({ ...formVacio, peso: '70' }, { patientId: 'p1' });

    expect(payload.measurements).toEqual({ weight: 70 });
    expect(payload.measurements.height).toBeUndefined();
  });

  it('traduce la fórmula del cliente al enum del modelo', () => {
    const conFormula = (formula) => toBodyCompositionPayload(formVacio, { patientId: 'p1', formula }).calculationMethod;

    expect(conFormula('durninWomersley')).toBe('durnin-womersley');
    expect(conFormula('jacksonPollock3')).toBe('jackson-pollock-3');
    expect(conFormula('jacksonPollock7')).toBe('jackson-pollock-7');
    expect(conFormula('desconocida')).toBe('manual');
  });

  it('envía el porcentaje de grasa calculado en el cliente', () => {
    const payload = toBodyCompositionPayload(formVacio, { patientId: 'p1', grasa: 29.2 });
    expect(payload.composition).toEqual({ bodyFatPercentage: 29.2 });
  });
});

describe('toHistorySeries', () => {
  it('ordena los registros cronológicamente y aplana los valores de la gráfica', () => {
    const series = toHistorySeries([
      { date: '2026-04-10', measurements: { weight: 72.4, bmi: 26.6 }, composition: { bodyFatPercentage: 29.2 } },
      { date: '2026-02-05', measurements: { weight: 78.0, bmi: 28.7 }, composition: { bodyFatPercentage: 32.1 } },
    ]);

    expect(series.map((s) => s.peso)).toEqual([78.0, 72.4]);
    expect(series[0].fecha).toBe('Feb 05');
    expect(series[1].grasa).toBe(29.2);
  });

  it('deja en null los valores que un registro no capturó', () => {
    const [punto] = toHistorySeries([{ date: '2026-04-10', measurements: { weight: 70 } }]);

    expect(punto.peso).toBe(70);
    expect(punto.grasa).toBeNull();
    expect(punto.imc).toBeNull();
  });

  it('descarta registros sin fecha y tolera una lista vacía', () => {
    expect(toHistorySeries([{ measurements: { weight: 70 } }])).toEqual([]);
    expect(toHistorySeries()).toEqual([]);
  });
});
