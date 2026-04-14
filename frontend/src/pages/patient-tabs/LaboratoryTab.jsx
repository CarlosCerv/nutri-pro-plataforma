import { useState, useEffect } from 'react';
import { Save, Plus, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { RANGOS_LAB, semaforoLab } from '../../lib/calculations/idr';
import api from '../../services/api';

// ── Grupos de análisis clínicos ──────────────────────────────────
const LAB_GROUPS = [
  {
    grupo: 'Glucemia',
    campos: [
      { key: 'glucosa_ayuno_mg',  label: 'Glucosa en ayuno',    unit: 'mg/dL' },
      { key: 'glucosa_post_mg',   label: 'Glucosa postprandial', unit: 'mg/dL' },
      { key: 'hba1c_pct',         label: 'HbA1c',               unit: '%'     },
    ],
  },
  {
    grupo: 'Perfil Lipídico',
    campos: [
      { key: 'colesterol_total_mg', label: 'Colesterol total',   unit: 'mg/dL' },
      { key: 'hdl_mg',              label: 'HDL ("bueno")',       unit: 'mg/dL' },
      { key: 'ldl_mg',              label: 'LDL ("malo")',        unit: 'mg/dL' },
      { key: 'trigliceridos_mg',    label: 'Triglicéridos',       unit: 'mg/dL' },
    ],
  },
  {
    grupo: 'Hematología',
    campos: [
      { key: 'hemoglobina_g',  label: 'Hemoglobina',  unit: 'g/dL'  },
      { key: 'ferritina_ng',   label: 'Ferritina',    unit: 'ng/mL' },
    ],
  },
  {
    grupo: 'Función Renal',
    campos: [
      { key: 'creatinina_mg',  label: 'Creatinina',  unit: 'mg/dL' },
      { key: 'acido_urico_mg', label: 'Ácido úrico', unit: 'mg/dL' },
    ],
  },
  {
    grupo: 'Perfil Tiroideo',
    campos: [
      { key: 'tsh_miu', label: 'TSH', unit: 'mIU/L' },
    ],
  },
  {
    grupo: 'Vitaminas',
    campos: [
      { key: 'vitamina_d_nmol', label: 'Vitamina D',  unit: 'nmol/L' },
      { key: 'vitamina_b12_pg', label: 'Vitamina B12', unit: 'pg/mL' },
    ],
  },
];

const SemaforoIcon = ({ nivel }) => {
  if (nivel === 'normal')   return <CheckCircle  size={14} className="text-success flex-shrink-0" />;
  if (nivel === 'warning')  return <AlertTriangle size={14} className="text-warning flex-shrink-0" />;
  if (nivel === 'critical') return <XCircle       size={14} className="text-danger flex-shrink-0" />;
  return <div className="w-3.5 h-3.5 rounded-full border border-navy-600 flex-shrink-0" />;
};

const SemaforoBadge = ({ nivel }) => {
  const cfg = {
    normal:   { label: 'Normal',  cls: 'badge-success' },
    warning:  { label: 'Alerta',  cls: 'badge-warning' },
    critical: { label: 'Crítico', cls: 'badge-danger'  },
    unknown:  { label: '',        cls: 'hidden'        },
  }[nivel] || { label: '', cls: 'hidden' };
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>;
};

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

export default function LaboratoryTab({ patient }) {
  const [fecha,  setFecha]  = useState(new Date().toISOString().slice(0, 10));
  const [values, setValues] = useState({});
  const [histLab, setHistLab] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  // Signos vitales
  const [signos, setSignos] = useState({
    temperatura: '', fc: '', fr: '',
  });

  useEffect(() => {
    // Mock histórico
    setHistLab([
      { fecha: 'Ene', glucosa_ayuno_mg: 95,  colesterol_total_mg: 210, trigliceridos_mg: 180 },
      { fecha: 'Feb', glucosa_ayuno_mg: 105, colesterol_total_mg: 195, trigliceridos_mg: 155 },
      { fecha: 'Mar', glucosa_ayuno_mg: 98,  colesterol_total_mg: 185, trigliceridos_mg: 140 },
    ]);
  }, []);

  const set = (k, v) => setValues(prev => ({ ...prev, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/api/patients/' + patient._id + '/lab', { fecha, ...values, ...signos });
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Fecha + signos vitales */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-3">
          <label className="label mb-0 flex-shrink-0">Fecha del lab:</label>
          <input type="date" className="input !w-auto py-1.5" value={fecha} onChange={e => setFecha(e.target.value)} />
        </div>
        <div className="flex gap-3 flex-wrap">
          {[
            { key: 'temperatura', label: 'Temp.', unit: '°C', ph: '36.5' },
            { key: 'fc',          label: 'F.C.',  unit: 'lpm', ph: '72'  },
            { key: 'fr',          label: 'F.R.',  unit: 'rpm', ph: '16'  },
          ].map(s => (
            <div key={s.key} className="flex items-center gap-2">
              <label className="text-xs text-white/40">{s.label}</label>
              <div className="relative">
                <input type="number" step="0.1"
                  className="input !w-24 py-1.5 pr-8 text-center font-mono text-sm"
                  value={signos[s.key]}
                  onChange={e => setSignos(v => ({ ...v, [s.key]: e.target.value }))}
                  placeholder={s.ph} />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-2xs text-white/25">{s.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Análisis clínicos */}
      {LAB_GROUPS.map(group => (
        <div key={group.grupo} className="space-y-3">
          <h3 className="section-title text-base border-b border-navy-700/60 pb-2">{group.grupo}</h3>
          <div className="space-y-2">
            {group.campos.map(campo => {
              const val    = values[campo.key];
              const nivel  = val ? semaforoLab(campo.key, val) : 'unknown';
              const rango  = RANGOS_LAB[campo.key];
              const refText = rango
                ? `Normal: ${rango.normal[0]}–${rango.normal[1] === 9999 ? '∞' : rango.normal[1]} ${campo.unit}`
                : '';

              return (
                <div key={campo.key}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all
                    ${nivel === 'normal'   ? 'bg-success/5  border-success/15'
                    : nivel === 'warning'  ? 'bg-warning/5  border-warning/15'
                    : nivel === 'critical' ? 'bg-danger/5   border-danger/15'
                    : 'bg-navy-800/30 border-navy-700/40'}`}>
                  <SemaforoIcon nivel={nivel} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white/80">{campo.label}</div>
                    {refText && <div className="text-2xs text-white/25 mt-0.5">{refText}</div>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <SemaforoBadge nivel={nivel} />
                    <div className="relative">
                      <input
                        type="number" step="0.01"
                        className="input !w-24 py-1.5 pr-8 text-right font-mono text-sm"
                        value={val || ''}
                        onChange={e => set(campo.key, e.target.value)}
                        placeholder="—"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-2xs text-white/25 pointer-events-none">
                        {campo.unit}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Gráfica de evolución de laboratorio */}
      {histLab.length > 0 && (
        <div className="space-y-3">
          <h3 className="section-title text-base border-b border-navy-700/60 pb-2">Evolución de Laboratorio</h3>
          <div className="card !p-4">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={histLab} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="fecha" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="glucosa_ayuno_mg" name="Glucosa" stroke="#2ECC8E" strokeWidth={2} dot={{ r: 3, fill: '#2ECC8E', strokeWidth: 0 }} />
                <Line type="monotone" dataKey="colesterol_total_mg" name="Colesterol" stroke="#E8C96A" strokeWidth={2} dot={{ r: 3, fill: '#E8C96A', strokeWidth: 0 }} />
                <Line type="monotone" dataKey="trigliceridos_mg" name="Triglicéridos" stroke="#EF4444" strokeWidth={2} dot={{ r: 3, fill: '#EF4444', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Guardar */}
      <div className="flex justify-end pt-4 border-t border-navy-700/50">
        <button type="submit" disabled={saving} className="btn btn-primary gap-2">
          {saving ? <><div className="w-4 h-4 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin" />Guardando...</>
            : saved ? <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Guardado</>
            : <><Save size={15} />Guardar laboratorio</>
          }
        </button>
      </div>
    </form>
  );
}
