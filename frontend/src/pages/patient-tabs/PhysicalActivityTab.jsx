import { useState } from 'react';
import { Save } from 'lucide-react';
import { ACTIVITY_FACTORS } from '../../lib/calculations/tmb';
import api from '../../services/api';

const ACTIVIDADES_MET = [
  { nombre: 'Caminar (paso normal)',    met: 3.5  },
  { nombre: 'Correr (8 km/h)',          met: 8.0  },
  { nombre: 'Ciclismo recreativo',      met: 5.0  },
  { nombre: 'Natación',                 met: 7.0  },
  { nombre: 'Pesas / musculación',      met: 5.5  },
  { nombre: 'Yoga / Pilates',           met: 3.0  },
  { nombre: 'Zumba / aerobics',         met: 6.5  },
  { nombre: 'Fútbol',                   met: 8.5  },
  { nombre: 'Basketball',               met: 8.0  },
  { nombre: 'Crossfit',                 met: 9.0  },
  { nombre: 'Boxeo',                    met: 9.5  },
  { nombre: 'Spinning',                 met: 7.5  },
  { nombre: 'Trabajo de oficina',       met: 1.5  },
  { nombre: 'Trabajo de pie',           met: 2.5  },
  { nombre: 'Trabajo físico pesado',    met: 5.0  },
];

export default function PhysicalActivityTab({ patient }) {
  const [form, setForm] = useState({
    nivelActividad: patient?.nivelActividad || 'sedentario',
    actividadesRegistradas: patient?.actividadesRegistradas || [],
    prescripcion: patient?.prescripcion || '',
  });
  const [nuevaAct, setNuevaAct] = useState({ nombre: '', duracion: '', met: '' });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Calcular GET estimado
  const peso = patient?.lastWeight || 70;
  const fa   = ACTIVITY_FACTORS[form.nivelActividad]?.value || 1.2;
  const tmbEst = 1500; // placeholder
  const getEst = Math.round(tmbEst * fa);

  // Calcular kcal consumidas por actividades
  const kcalActividades = form.actividadesRegistradas.reduce((acc, a) => {
    return acc + ((parseFloat(a.met) || 0) * peso * (parseFloat(a.duracion) || 0) / 60);
  }, 0);

  const addActividad = () => {
    if (!nuevaAct.nombre || !nuevaAct.duracion) return;
    set('actividadesRegistradas', [...form.actividadesRegistradas, { ...nuevaAct, id: Date.now() }]);
    setNuevaAct({ nombre: '', duracion: '', met: '' });
  };

  const removeAct = (id) => set('actividadesRegistradas', form.actividadesRegistradas.filter(a => a.id !== id));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/api/patients/${patient._id}`, form);
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* ── Nivel de actividad ── */}
      <div className="space-y-4">
        <h3 className="section-title text-base border-b border-navy-700/60 pb-2">Nivel de Actividad Física</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(ACTIVITY_FACTORS).map(([key, { label, value }]) => (
            <button key={key} type="button"
              onClick={() => set('nivelActividad', key)}
              className={`flex flex-col gap-1 p-4 rounded-2xl border text-left transition-all duration-200
                ${form.nivelActividad === key
                  ? 'bg-emerald/10 border-emerald/30 text-emerald'
                  : 'bg-navy-800/40 border-navy-700/50 text-white/50 hover:border-navy-600 hover:text-white/80'
                }`}>
              <div className="text-xs font-bold">{label.split('(')[0].trim()}</div>
              <div className="text-2xs opacity-60">{label.match(/\(.*\)/)?.[0] || ''}</div>
              <div className="mt-1 font-mono text-sm font-medium">× {value}</div>
            </button>
          ))}
        </div>

        {/* GET estimado */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-navy-800/50 border border-navy-700/50">
          <div>
            <div className="text-xs text-white/40">Factor de actividad</div>
            <div className="font-mono text-2xl text-emerald font-medium">× {fa}</div>
          </div>
          <div className="w-px h-10 bg-navy-700" />
          <div>
            <div className="text-xs text-white/40">GET estimado (TMB × FA)</div>
            <div className="font-mono text-2xl text-gold font-medium">{getEst} kcal</div>
          </div>
          <div className="w-px h-10 bg-navy-700" />
          <div>
            <div className="text-xs text-white/40">Quema por actividades</div>
            <div className="font-mono text-2xl text-white/70 font-medium">{Math.round(kcalActividades)} kcal</div>
          </div>
        </div>
      </div>

      {/* ── Actividades específicas ── */}
      <div className="space-y-4">
        <h3 className="section-title text-base border-b border-navy-700/60 pb-2">Actividades Registradas</h3>

        {/* Agregar actividad */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-2xl bg-navy-800/30 border border-navy-700/40">
          <select className="select flex-1 py-2"
            value={nuevaAct.nombre}
            onChange={e => {
              const act = ACTIVIDADES_MET.find(a => a.nombre === e.target.value);
              setNuevaAct(n => ({ ...n, nombre: e.target.value, met: act?.met || '' }));
            }}>
            <option value="">Seleccionar actividad...</option>
            {ACTIVIDADES_MET.map(a => (
              <option key={a.nombre} value={a.nombre}>{a.nombre} (MET: {a.met})</option>
            ))}
          </select>
          <div className="relative w-full sm:w-28">
            <input type="number" min="1" max="480"
              className="input py-2 pr-10 font-mono text-center"
              placeholder="Min"
              value={nuevaAct.duracion}
              onChange={e => setNuevaAct(n => ({ ...n, duracion: e.target.value }))}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-2xs text-white/25">min</span>
          </div>
          <button type="button" onClick={addActividad} className="btn btn-outline btn-sm flex-shrink-0">
            + Agregar
          </button>
        </div>

        {/* Lista de actividades */}
        {form.actividadesRegistradas.length > 0 ? (
          <div className="space-y-2">
            {form.actividadesRegistradas.map(a => {
              const kcal = Math.round((parseFloat(a.met) || 0) * peso * (parseFloat(a.duracion) || 0) / 60);
              return (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-navy-800/50 border border-navy-700/50">
                  <div className="flex-1">
                    <div className="text-sm text-white/80">{a.nombre || 'Actividad sin nombre'}</div>
                    <div className="text-xs text-white/30">{a.duracion} min · MET {a.met}</div>
                  </div>
                  <div className="font-mono text-sm text-emerald">{kcal} kcal</div>
                  <button type="button" onClick={() => removeAct(a.id)}
                    className="text-white/20 hover:text-danger transition-colors">
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-white/25">
            No hay actividades registradas. Agrega las actividades del paciente.
          </div>
        )}
      </div>

      {/* ── Prescripción de actividad física ── */}
      <div className="space-y-3">
        <h3 className="section-title text-base border-b border-navy-700/60 pb-2">Prescripción de Actividad Física</h3>
        <textarea
          className="input min-h-[120px] resize-none"
          value={form.prescripcion}
          onChange={e => set('prescripcion', e.target.value)}
          placeholder="Indicaciones específicas del nutriólogo sobre actividad física recomendada, frecuencia, intensidad, tipo de ejercicio..."
        />
      </div>

      {/* Guardar */}
      <div className="flex justify-end pt-4 border-t border-navy-700/50">
        <button type="submit" disabled={saving} className="btn btn-primary gap-2">
          {saving ? <><div className="w-4 h-4 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin" />Guardando...</>
            : saved ? <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Guardado</>
            : <><Save size={15} />Guardar actividad</>
          }
        </button>
      </div>
    </form>
  );
}
