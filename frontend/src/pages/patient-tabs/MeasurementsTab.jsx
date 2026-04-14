import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { Plus, Save, TrendingDown, TrendingUp, Info } from 'lucide-react';
import api from '../../services/api';
import { calcularIMC, clasificarIMC } from '../../lib/calculations/imc';
import { calcularTodosMetodos } from '../../lib/calculations/bodyFat';

const Field = ({ label, unit, children, hint }) => (
  <div className="form-group">
    <label className="label flex items-center gap-1.5">
      {label}
      {unit && <span className="text-white/30 normal-case">({unit})</span>}
      {hint && (
        <div className="group relative">
          <Info size={12} className="text-white/20 cursor-help" />
          <div className="absolute bottom-5 left-0 z-10 w-48 px-2.5 py-1.5 bg-navy-800 border border-navy-600 rounded-lg text-2xs text-white/60 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-navy-md">
            {hint}
          </div>
        </div>
      )}
    </label>
    {children}
  </div>
);

const Row = ({ cols = 2, children }) => (
  <div className={`grid grid-cols-1 sm:grid-cols-${cols} gap-4`}>{children}</div>
);

const FORMULAS_GRASA = [
  { key: 'durninWomersley', label: 'Durnin & Womersley',  pliegues: '4 pliegues' },
  { key: 'jacksonPollock3', label: 'Jackson & Pollock 3', pliegues: '3 pliegues' },
  { key: 'jacksonPollock7', label: 'Jackson & Pollock 7', pliegues: '7 pliegues' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy-800 border border-navy-600 rounded-xl px-3 py-2 shadow-navy-md text-xs">
      <div className="text-white/40 mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="font-mono font-medium" style={{ color: p.color }}>
          {p.value} {p.name}
        </div>
      ))}
    </div>
  );
};

const IMC_BAR_ZONES = [
  { label: 'Bajo',  w: 18.5, color: '#3B82F6' },
  { label: 'Normal',w: 6.5,  color: '#2ECC8E' },
  { label: 'Sobre', w: 5.0,  color: '#F59E0B' },
  { label: 'OI',    w: 5.0,  color: '#EF4444' },
  { label: 'OII',   w: 5.0,  color: '#DC2626' },
  { label: 'OIII',  w: '>',  color: '#991B1B' },
];

export default function MeasurementsTab({ patient }) {
  const edad = patient?.dob
    ? Math.floor((Date.now() - new Date(patient.dob)) / (1000*60*60*24*365.25))
    : 30;
  const sexo = patient?.sex || 'F';

  // Estado del formulario
  const [form, setForm] = useState({
    fecha:         new Date().toISOString().slice(0, 10),
    peso:          '', talla: '',
    cintura:       '', cadera: '', muneca: '',
    // Pliegues
    bicipital: '', tricipital: '', subescapular: '', suprailiaco: '',
    abdominal: '', muslo_pliegue: '', pierna: '', pecho: '', axilar: '',
    // Perímetros
    brazo_rel: '', brazo_cont: '', antebrazo: '', muslo: '', pantorrilla: '',
    torax: '', abdomen: '',
    // Presión
    pa_sis: '', pa_dia: '',
    // Somatotipo
    biepicondilar_humero: '', biepicondilar_femur: '',
    perimetro_brazo: '', perimetro_pantorrilla: '',
  });
  const [formulaGrasa,  setFormulaGrasa]  = useState('durninWomersley');
  const [historico,     setHistorico]     = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const num = (v) => parseFloat(v) || 0;

  // Cálculos automáticos
  const imc   = form.peso && form.talla ? calcularIMC(num(form.peso), num(form.talla)) : null;
  const imcCI = imc ? clasificarIMC(imc) : null;
  const icc   = form.cintura && form.cadera ? (num(form.cintura) / num(form.cadera)).toFixed(2) : null;

  const pliegues = {
    bicipital: num(form.bicipital), tricipital: num(form.tricipital),
    subescapular: num(form.subescapular), suprailiaco: num(form.suprailiaco),
    abdominal: num(form.abdominal), muslo: num(form.muslo_pliegue),
    pecho: num(form.pecho), axilar: num(form.axilar),
    pantorrilla: num(form.pierna),
  };

  const resultadosGrasa = calcularTodosMetodos({ pliegues, edad, sexo, peso: num(form.peso) });
  const grasaActual     = resultadosGrasa[formulaGrasa];

  // Histórico mock
  useEffect(() => {
    setHistorico([
      { fecha: 'Feb', peso: 78.0, grasa: 32.1, imc: 28.7 },
      { fecha: 'Mar', peso: 75.5, grasa: 30.8, imc: 27.7 },
      { fecha: 'Abr', peso: 72.4, grasa: 29.2, imc: 26.6 },
    ]);
  }, [patient]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/api/body-composition`, { patientId: patient._id, ...form, imc, icc });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const imcPct = imc ? Math.min(((imc / 45) * 100), 100) : 0;

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Fecha de consulta */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="label mb-0">Fecha de consulta:</label>
          <input type="date" className="input !w-auto py-1.5" value={form.fecha}
            onChange={e => set('fecha', e.target.value)} />
        </div>
        <button type="button" className="btn btn-ghost btn-sm gap-1.5 text-emerald">
          <Plus size={13} /> Nueva consulta
        </button>
      </div>

      {/* ── Medidas básicas ── */}
      <div className="space-y-4">
        <h3 className="section-title text-base border-b border-navy-700/60 pb-2">Medidas Básicas</h3>
        <Row cols={4}>
          <Field label="Peso" unit="kg">
            <input type="number" step="0.1" className="input" value={form.peso} onChange={e => set('peso', e.target.value)} placeholder="72.4" />
          </Field>
          <Field label="Estatura" unit="cm">
            <input type="number" step="0.1" className="input" value={form.talla} onChange={e => set('talla', e.target.value)} placeholder="165" />
          </Field>
          <Field label="C. Cintura" unit="cm">
            <input type="number" step="0.1" className="input" value={form.cintura} onChange={e => set('cintura', e.target.value)} placeholder="80" />
          </Field>
          <Field label="C. Cadera" unit="cm">
            <input type="number" step="0.1" className="input" value={form.cadera} onChange={e => set('cadera', e.target.value)} placeholder="96" />
          </Field>
        </Row>
        <Row cols={3}>
          <Field label="Muñeca" unit="cm" hint="Para determinar complexión (Frisancho)">
            <input type="number" step="0.1" className="input" value={form.muneca} onChange={e => set('muneca', e.target.value)} placeholder="16" />
          </Field>
          <Field label="P.A. Sistólica" unit="mmHg">
            <input type="number" className="input" value={form.pa_sis} onChange={e => set('pa_sis', e.target.value)} placeholder="120" />
          </Field>
          <Field label="P.A. Diastólica" unit="mmHg">
            <input type="number" className="input" value={form.pa_dia} onChange={e => set('pa_dia', e.target.value)} placeholder="80" />
          </Field>
        </Row>

        {/* IMC visual */}
        {imc && (
          <div className="p-4 rounded-2xl bg-navy-800/50 border border-navy-700/50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-white/40">IMC calculado</span>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="font-mono text-3xl font-medium" style={{ color: imcCI?.color }}>{imc.toFixed(1)}</span>
                  <span className="badge" style={{ background: `${imcCI?.color}20`, color: imcCI?.color, borderColor: `${imcCI?.color}30` }}>
                    {imcCI?.categoria}
                  </span>
                </div>
              </div>
              {icc && (
                <div className="text-right">
                  <span className="text-xs text-white/40">ICC (Cintura/Cadera)</span>
                  <div className="font-mono text-xl font-medium text-white/80 mt-0.5">{icc}</div>
                </div>
              )}
            </div>
            {/* Barra de IMC */}
            <div className="relative h-3 rounded-full overflow-hidden flex">
              {[
                { w: '20%', color: '#3B82F6' }, { w: '14%', color: '#2ECC8E' },
                { w: '11%', color: '#F59E0B' }, { w: '11%', color: '#EF4444' },
                { w: '11%', color: '#DC2626' }, { w: '33%', color: '#991B1B' },
              ].map((z, i) => <div key={i} style={{ width: z.w, background: z.color }} />)}
              {/* Indicador */}
              <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
                style={{ left: `${Math.min(imcPct, 98)}%`, transform: 'translateX(-50%)' }} />
            </div>
            <div className="flex justify-between text-2xs text-white/25">
              <span>16</span><span>18.5</span><span>25</span><span>30</span><span>35</span><span>40+</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Pliegues cutáneos ── */}
      <div className="space-y-4">
        <h3 className="section-title text-base border-b border-navy-700/60 pb-2">Pliegues Cutáneos (mm)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[
            { key: 'bicipital',    label: 'Bicipital'    },
            { key: 'tricipital',   label: 'Tricipital'   },
            { key: 'subescapular', label: 'Subescapular' },
            { key: 'suprailiaco',  label: 'Suprailiaco'  },
            { key: 'abdominal',    label: 'Abdominal'    },
            { key: 'muslo_pliegue',label: 'Muslo'        },
            { key: 'pierna',       label: 'Pierna'       },
            { key: 'pecho',        label: 'Pecho (♂)'    },
            { key: 'axilar',       label: 'Axilar'       },
          ].map(p => (
            <div key={p.key} className="form-group">
              <label className="label text-2xs">{p.label}</label>
              <input type="number" step="0.1" min="0" className="input py-2 text-center font-mono"
                value={form[p.key]} onChange={e => set(p.key, e.target.value)} placeholder="—" />
            </div>
          ))}
        </div>

        {/* Selector de fórmula + resultados */}
        <div className="p-4 rounded-2xl bg-navy-800/50 border border-navy-700/50">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-xs font-semibold text-white/60">Fórmula:</span>
            {FORMULAS_GRASA.map(f => (
              <button key={f.key} type="button"
                onClick={() => setFormulaGrasa(f.key)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all
                  ${formulaGrasa === f.key ? 'bg-emerald text-navy-950' : 'bg-navy-700 text-white/50 hover:text-white'}`}>
                {f.label}
                <span className="ml-1 opacity-50">({f.pliegues})</span>
              </button>
            ))}
          </div>

          {grasaActual ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: '% Grasa',     value: `${grasaActual.pctGrasa}%`, color: '#E8C96A' },
                { label: 'Densidad',    value: grasaActual.densidad?.toFixed(4), color: '#3B82F6' },
                { label: 'Masa grasa',  value: `${grasaActual.masaGrasa} kg`, color: '#EF4444' },
                { label: 'Masa magra',  value: `${grasaActual.masaMagra} kg`, color: '#2ECC8E' },
              ].map(r => (
                <div key={r.label} className="text-center p-3 rounded-xl bg-navy-900/60">
                  <div className="font-mono text-xl font-medium" style={{ color: r.color }}>{r.value || '—'}</div>
                  <div className="text-2xs text-white/30 mt-0.5">{r.label}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-white/30 text-center py-2">Ingresa los pliegues para calcular % de grasa</p>
          )}
        </div>
      </div>

      {/* ── Perímetros ── */}
      <div className="space-y-4">
        <h3 className="section-title text-base border-b border-navy-700/60 pb-2">Perímetros (cm)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { key: 'brazo_rel',  label: 'Brazo relajado'   },
            { key: 'brazo_cont', label: 'Brazo contraído'  },
            { key: 'antebrazo',  label: 'Antebrazo'        },
            { key: 'muslo',      label: 'Muslo'            },
            { key: 'pantorrilla',label: 'Pantorrilla'      },
            { key: 'torax',      label: 'Tórax'            },
            { key: 'abdomen',    label: 'Abdomen'          },
          ].map(p => (
            <div key={p.key} className="form-group">
              <label className="label text-2xs">{p.label}</label>
              <input type="number" step="0.1" min="0" className="input py-2 text-center font-mono"
                value={form[p.key]} onChange={e => set(p.key, e.target.value)} placeholder="—" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Gráficas de evolución ── */}
      {historico.length > 0 && (
        <div className="space-y-4">
          <h3 className="section-title text-base border-b border-navy-700/60 pb-2">Evolución Histórica</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Peso */}
            <div className="card !p-4">
              <div className="text-xs font-semibold text-white/40 mb-3">Peso (kg)</div>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={historico}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="fecha" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="peso" name="kg" stroke="#2ECC8E" strokeWidth={2} dot={{ fill: '#2ECC8E', r: 4, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* % Grasa */}
            <div className="card !p-4">
              <div className="text-xs font-semibold text-white/40 mb-3">% Grasa Corporal</div>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={historico}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="fecha" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="grasa" name="%" fill="#E8C96A" radius={[4, 4, 0, 0]} opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Guardar */}
      <div className="flex justify-end pt-4 border-t border-navy-700/50">
        <button type="submit" disabled={saving} className="btn btn-primary gap-2">
          {saving
            ? <><div className="w-4 h-4 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin" />Guardando...</>
            : saved
            ? <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Guardado</>
            : <><Save size={15} />Guardar mediciones</>
          }
        </button>
      </div>
    </form>
  );
}
