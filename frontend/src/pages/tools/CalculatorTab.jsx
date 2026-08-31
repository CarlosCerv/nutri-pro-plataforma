import { useMemo, useState } from 'react';
import { Calculator, Info } from 'lucide-react';
import {
  ACTIVITY_FACTORS,
  GOAL_ADJUSTMENTS,
  MACRO_PRESETS,
  calcularAgua,
  calcularGET,
  calcularMacros,
  calcularTodosTMB,
  calcularVET,
  pesoIdeal,
} from '../../lib/calculations/tmb';
import { calcularIMC, clasificarIMC, calcularICC, clasificarICC } from '../../lib/calculations/imc';
import Combobox from '../../design-system/components/Combobox.jsx';
import StatTile from '../../design-system/components/StatTile.jsx';
import { EmptyState } from '../../design-system/components/StateViews.jsx';
import { Card } from '../../design-system/components';

/**
 * Calculadora nutricional.
 *
 * La ruta `/calculos` prometía tres calculadoras (IMC, gasto energético,
 * nutrición deportiva) y en realidad renderizaba una segunda tabla de
 * alimentos, duplicando `/alimentos` — con un `ReferenceError` latente por
 * tres iconos usados sin importar. Esta es la calculadora que faltaba,
 * construida sobre `lib/calculations/`, que es la misma lógica que ya usan
 * las pestañas del expediente.
 */

// Las claves son las que devuelve `calcularTodosTMB`.
const FORMULAS = [
  { key: 'mifflinStJeor', label: 'Mifflin-St Jeor', nota: 'Recomendada para población general' },
  { key: 'harrisBenedict', label: 'Harris-Benedict', nota: 'Fórmula clásica de 1919' },
  { key: 'faoOms', label: 'FAO/OMS', nota: 'Por grupos de edad' },
  { key: 'owen', label: 'Owen', nota: 'Poca dependencia de la talla' },
  { key: 'katchMcArdle', label: 'Katch-McArdle', nota: 'Requiere masa magra' },
];

const OBJETIVOS = [
  { value: 'bajar_peso', label: 'Bajar de peso (−500 kcal)' },
  { value: 'bajar_rapido', label: 'Bajar rápido (−750 kcal)' },
  { value: 'mantener', label: 'Mantener peso' },
  { value: 'ganar_musculo', label: 'Ganar músculo (+300 kcal)' },
  { value: 'volumen', label: 'Volumen (+500 kcal)' },
];

const TONO_IMC = { info: 'accent', normal: 'success', warning: 'warning', danger: 'danger' };

const Campo = ({ label, unit, children }) => (
  <div className="form-group">
    <label className="label flex items-center gap-1.5">
      {label}
      {unit ? <span className="normal-case text-[var(--ink-secondary)]">({unit})</span> : null}
    </label>
    {children}
  </div>
);

export default function CalculatorTab() {
  const [form, setForm] = useState({
    peso: '', talla: '', edad: '', sexo: 'F',
    masaMagra: '', cintura: '', cadera: '',
    actividad: 'sedentario', objetivo: 'mantener', preset: 'estandar',
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const onSelect = (e) => set(e.target.name, e.target.value);
  const num = (v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  };

  const completo = num(form.peso) > 0 && num(form.talla) > 0 && num(form.edad) > 0;

  const resultado = useMemo(() => {
    if (!completo) return null;

    const peso = num(form.peso);
    const talla = num(form.talla);
    const edad = num(form.edad);
    const sexo = form.sexo;

    const tmbs = calcularTodosTMB({ weight: peso, height: talla, age: edad, sex: sexo, leanMass: num(form.masaMagra) });
    const imc = calcularIMC(peso, talla);
    const icc = num(form.cintura) > 0 && num(form.cadera) > 0 ? calcularICC(num(form.cintura), num(form.cadera)) : null;
    const preset = MACRO_PRESETS[form.preset] || MACRO_PRESETS.estandar;

    const tmbBase = tmbs.mifflinStJeor ?? 0;
    const get = calcularGET(tmbBase, form.actividad);
    const vet = calcularVET(get, form.objetivo);

    return {
      tmbs,
      imc,
      imcInfo: clasificarIMC(imc),
      icc,
      iccInfo: icc ? clasificarICC(icc, sexo) : null,
      get,
      vet,
      macros: calcularMacros(vet, preset.proteinas, preset.carbohidratos, preset.lipidos),
      agua: calcularAgua(peso),
      pesoIdealHamwi: pesoIdeal.hamwi(talla, sexo),
      pesoIdealDevine: pesoIdeal.devine(talla, sexo),
    };
  }, [form, completo]);

  return (
    <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
      <Card as="section" className="space-y-5">
        <h2 className="section-title flex items-center gap-2">
          <Calculator size={16} className="text-[var(--accent)]" />
          Datos del paciente
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <Campo label="Peso" unit="kg">
            <input type="number" step="0.1" min="0" className="input" value={form.peso} onChange={(e) => set('peso', e.target.value)} placeholder="70" />
          </Campo>
          <Campo label="Talla" unit="cm">
            <input type="number" step="0.1" min="0" className="input" value={form.talla} onChange={(e) => set('talla', e.target.value)} placeholder="175" />
          </Campo>
          <Campo label="Edad" unit="años">
            <input type="number" min="0" className="input" value={form.edad} onChange={(e) => set('edad', e.target.value)} placeholder="30" />
          </Campo>
          <Combobox
            name="sexo"
            label="Sexo"
            options={[{ value: 'F', label: 'Femenino' }, { value: 'M', label: 'Masculino' }]}
            value={form.sexo}
            onChange={onSelect}
          />
          <Campo label="Cintura" unit="cm">
            <input type="number" step="0.1" min="0" className="input" value={form.cintura} onChange={(e) => set('cintura', e.target.value)} placeholder="82" />
          </Campo>
          <Campo label="Cadera" unit="cm">
            <input type="number" step="0.1" min="0" className="input" value={form.cadera} onChange={(e) => set('cadera', e.target.value)} placeholder="98" />
          </Campo>
          <Campo label="Masa magra" unit="kg">
            <input type="number" step="0.1" min="0" className="input" value={form.masaMagra} onChange={(e) => set('masaMagra', e.target.value)} placeholder="Opcional" />
          </Campo>
        </div>

        <Combobox
          name="actividad"
          label="Nivel de actividad"
          options={Object.entries(ACTIVITY_FACTORS).map(([value, f]) => ({ value, label: f.label }))}
          value={form.actividad}
          onChange={onSelect}
        />
        <Combobox
          name="objetivo"
          label="Objetivo"
          options={OBJETIVOS}
          value={form.objetivo}
          onChange={onSelect}
        />
        <Combobox
          name="preset"
          label="Distribución de macronutrientes"
          options={Object.entries(MACRO_PRESETS).map(([value, p]) => ({
            value,
            label: value.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase()),
            description: `${Math.round(p.proteinas * 100)}% proteína · ${Math.round(p.carbohidratos * 100)}% HC · ${Math.round(p.lipidos * 100)}% lípidos`,
          }))}
          value={form.preset}
          onChange={onSelect}
        />
      </Card>

      <div className="space-y-4">
        {!resultado ? (
          <EmptyState
            icon={<Calculator size={26} strokeWidth={1.5} />}
            title="Captura peso, talla y edad"
            description="Con esos tres datos se calculan el IMC, la tasa metabólica basal, el gasto energético total y el reparto de macronutrientes."
          />
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatTile label="IMC" value={resultado.imc.toFixed(1)} tone={TONO_IMC[resultado.imcInfo.codigo] || 'neutral'} hint={resultado.imcInfo.categoria} />
              <StatTile label="TMB" value={Math.round(resultado.tmbs.mifflinStJeor || 0)} unit="kcal" hint="Mifflin-St Jeor" />
              <StatTile label="Gasto total" value={Math.round(resultado.get)} unit="kcal" hint={ACTIVITY_FACTORS[form.actividad]?.label} />
              <StatTile label="Meta calórica" value={Math.round(resultado.vet)} unit="kcal" tone="accent" hint={`${GOAL_ADJUSTMENTS[form.objetivo] >= 0 ? '+' : ''}${GOAL_ADJUSTMENTS[form.objetivo]} kcal`} />
            </div>

            <Card as="section">
              <h2 className="section-title mb-4">Macronutrientes de la meta</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                <StatTile label="Proteínas" value={resultado.macros.proteinas_g} unit="g" tone="success" />
                <StatTile label="Carbohidratos" value={resultado.macros.carbos_g} unit="g" tone="accent" />
                <StatTile label="Lípidos" value={resultado.macros.lipidos_g} unit="g" tone="warning" />
              </div>
              <p className="mt-3 flex items-start gap-2 text-xs text-[var(--ink-secondary)]">
                <Info size={13} className="mt-0.5 shrink-0" />
                Reparto energético a 4 kcal/g en proteína y carbohidrato, y 9 kcal/g en lípidos.
              </p>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card as="section">
                <h2 className="section-title mb-4">Tasa metabólica por fórmula</h2>
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Fórmula</th>
                        <th align="right">kcal/día</th>
                      </tr>
                    </thead>
                    <tbody>
                      {FORMULAS.map((f) => (
                        <tr key={f.key}>
                          <td>
                            <div className="font-medium text-[var(--ink)]">{f.label}</div>
                            <div className="text-xs text-[var(--ink-secondary)]">{f.nota}</div>
                          </td>
                          <td align="right" className="font-mono">
                            {resultado.tmbs[f.key] ? Math.round(resultado.tmbs[f.key]) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card as="section" className="space-y-3">
                <h2 className="section-title">Otros indicadores</h2>
                <dl className="space-y-2 text-sm">
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-[var(--ink-muted)]">Índice cintura-cadera</dt>
                    <dd className="font-mono text-[var(--ink)]">
                      {resultado.icc ? `${resultado.icc.toFixed(2)} · riesgo ${resultado.iccInfo.riesgo.toLowerCase()}` : '—'}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-[var(--ink-muted)]">Peso ideal (Hamwi)</dt>
                    <dd className="font-mono text-[var(--ink)]">{resultado.pesoIdealHamwi} kg</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-[var(--ink-muted)]">Peso ideal (Devine)</dt>
                    <dd className="font-mono text-[var(--ink)]">{resultado.pesoIdealDevine} kg</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-[var(--ink-muted)]">Requerimiento hídrico</dt>
                    <dd className="font-mono text-[var(--ink)]">{(resultado.agua / 1000).toFixed(1)} L/día</dd>
                  </div>
                </dl>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
