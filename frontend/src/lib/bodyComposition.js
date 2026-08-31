/**
 * Traduccion entre el formulario de mediciones (campos planos, en español) y
 * el esquema de `backend/src/models/BodyComposition.js` (objetos anidados, en
 * ingles).
 *
 * Sin esta capa el formulario enviaba `{ tricipital, bicipital, pierna, ... }`
 * al mismo nivel del body; Mongoose descartaba todo lo que no reconocia y el
 * controlador, que solo calcula composicion si existe `data.skinfolds`,
 * tampoco hacia nada. La peticion devolvia 201 y la captura se perdia entera.
 */

/** Convierte a numero, o `undefined` si el campo viene vacio (para no guardar ceros falsos). */
const num = (v) => {
    if (v === '' || v === null || v === undefined) return undefined;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : undefined;
};

/** Quita las claves `undefined` para no escribir subdocumentos vacios en Mongo. */
const compact = (obj) => {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v !== undefined) out[k] = v;
    }
    return Object.keys(out).length > 0 ? out : undefined;
};

/** Nombre de formula del frontend (`lib/calculations/bodyFat.js`) → enum del modelo. */
const METODOS = {
    durninWomersley: 'durnin-womersley',
    jacksonPollock3: 'jackson-pollock-3',
    jacksonPollock7: 'jackson-pollock-7',
    faulkner: 'manual',
    siri: 'manual',
};

/**
 * Arma el body de `POST /api/body-composition` a partir del formulario.
 *
 * @param {object} form   estado del formulario de MeasurementsTab
 * @param {object} extras `{ patientId, imc, icc, grasa, formula }`
 */
export function toBodyCompositionPayload(form, { patientId, imc, icc, grasa, formula } = {}) {
    return {
        patientId,
        date: form.fecha || undefined,
        calculationMethod: METODOS[formula] || 'manual',

        measurements: compact({
            weight: num(form.peso),
            height: num(form.talla),
            bmi: num(imc),
            waistHipRatio: num(icc),
        }),

        bloodPressure: compact({
            systolic: num(form.pa_sis),
            diastolic: num(form.pa_dia),
        }),

        skinfolds: compact({
            triceps: num(form.tricipital),
            biceps: num(form.bicipital),
            subscapular: num(form.subescapular),
            suprailiac: num(form.suprailiaco),
            abdominal: num(form.abdominal),
            thigh: num(form.muslo_pliegue),
            calf: num(form.pierna),
            chest: num(form.pecho),
            midaxillary: num(form.axilar),
        }),

        circumferences: compact({
            waist: num(form.cintura),
            hip: num(form.cadera),
            chest: num(form.torax),
            // El formulario captura brazo relajado y contraido; se guarda el
            // relajado, que es el que usan las formulas de area muscular.
            arm: num(form.brazo_rel),
            forearm: num(form.antebrazo),
            thigh: num(form.muslo),
            calf: num(form.pantorrilla),
        }),

        boneDiameters: compact({
            wrist: num(form.muneca),
            elbow: num(form.biepicondilar_humero),
            knee: num(form.biepicondilar_femur),
        }),

        // El porcentaje de grasa ya se calculo en el cliente con la formula que
        // eligio el nutriologo; se envia para no depender de que el backend
        // soporte esa misma formula.
        composition: compact({
            bodyFatPercentage: num(grasa),
        }),
    };
}

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

/**
 * Convierte los registros de `GET /api/body-composition/patient/:id` en las
 * series que consumen las graficas de recharts, en orden cronologico.
 */
export function toHistorySeries(records = []) {
    return [...records]
        .filter((r) => r?.date)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map((r) => {
            const d = new Date(r.date);
            return {
                fecha: `${MESES[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`,
                peso: r.measurements?.weight ?? null,
                grasa: r.composition?.bodyFatPercentage ?? null,
                imc: r.measurements?.bmi ?? null,
            };
        });
}
