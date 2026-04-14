import { useState } from 'react';
import { Save } from 'lucide-react';
import api from '../../services/api';

const GRUPOS_FRECUENCIA = [
  'Verduras y hortalizas', 'Frutas', 'Cereales y derivados', 'Leguminosas',
  'Carnes rojas', 'Aves', 'Pescados y mariscos', 'Huevo',
  'Lácteos', 'Aceites y grasas', 'Azúcares y dulces', 'Comida rápida / ultra-procesada',
];
const FRECUENCIAS = ['Nunca', 'Ocasional', 'Semanal', 'Diario'];
const FREQ_COLORS = { 'Nunca': 'neutral', 'Ocasional': 'info', 'Semanal': 'warning', 'Diario': 'success' };

const TIEMPOS_DEFAULT = [
  { nombre: 'Desayuno',     hora: '08:00' },
  { nombre: 'Colación AM',  hora: '10:30' },
  { nombre: 'Comida',       hora: '14:00' },
  { nombre: 'Merienda',     hora: '17:00' },
  { nombre: 'Cena',         hora: '20:00' },
];

export default function FoodHabitsTab({ patient }) {
  const [form, setForm] = useState({
    preferencias:  patient?.preferencias  || '',
    disgustos:     patient?.disgustos     || '',
    objetivoAlim:  patient?.objetivoAlim  || '',
    frecuencias:   patient?.frecuencias   || {},
    horariosComida: patient?.horariosComida || TIEMPOS_DEFAULT,
    recordatorio24h: patient?.recordatorio24h || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const set    = (k, v)  => setForm(f => ({ ...f, [k]: v }));
  const setFreq = (g, v) => setForm(f => ({ ...f, frecuencias: { ...f.frecuencias, [g]: v } }));
  const setHorario = (i, k, v) => setForm(f => {
    const arr = [...f.horariosComida];
    arr[i] = { ...arr[i], [k]: v };
    return { ...f, horariosComida: arr };
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/api/patients/${patient._id}`, form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* ── Recordatorio de 24 horas ── */}
      <div className="space-y-3">
        <h3 className="section-title text-base border-b border-navy-700/60 pb-2">Recordatorio de 24 Horas</h3>
        <p className="text-xs text-white/30">Registra todos los alimentos y bebidas consumidos en las últimas 24 horas</p>
        <textarea
          className="input min-h-[120px] resize-none font-mono text-sm"
          value={form.recordatorio24h}
          onChange={e => set('recordatorio24h', e.target.value)}
          placeholder={`Desayuno: 2 huevos revueltos, pan integral tostado (2 rebanadas), 1 taza de café con leche descremada\nColación: 1 manzana mediana\nComida: Arroz (1 taza), frijoles (1/2 taza), pechuga a la plancha (150g), ensalada mixta\n...`}
        />
      </div>

      {/* ── Horarios habituales de comida ── */}
      <div className="space-y-3">
        <h3 className="section-title text-base border-b border-navy-700/60 pb-2">Horarios Habituales de Comida</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {form.horariosComida.map((t, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-navy-800/50 border border-navy-700/50">
              <input
                type="time"
                className="input !w-auto !py-1.5 font-mono text-sm flex-shrink-0"
                value={t.hora}
                onChange={e => setHorario(i, 'hora', e.target.value)}
              />
              <input
                className="input flex-1 !py-1.5 text-sm"
                value={t.nombre}
                onChange={e => setHorario(i, 'nombre', e.target.value)}
                placeholder="Tiempo de comida"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Preferencias ── */}
      <div className="space-y-4">
        <h3 className="section-title text-base border-b border-navy-700/60 pb-2">Preferencias Alimentarias</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="label">Alimentos preferidos / que le gustan</label>
            <textarea className="input min-h-[90px] resize-none" value={form.preferencias}
              onChange={e => set('preferencias', e.target.value)}
              placeholder="Pollo, ensaladas, fruta, leguminosas..." />
          </div>
          <div className="form-group">
            <label className="label">Alimentos que rechaza o no come</label>
            <textarea className="input min-h-[90px] resize-none" value={form.disgustos}
              onChange={e => set('disgustos', e.target.value)}
              placeholder="Hígado, brócoli, mariscos..." />
          </div>
        </div>
        <div className="form-group">
          <label className="label">Objetivo alimentario del paciente</label>
          <input className="input" value={form.objetivoAlim}
            onChange={e => set('objetivoAlim', e.target.value)}
            placeholder="Mejorar composición corporal, aprender a comer saludable, controlar azúcar..." />
        </div>
      </div>

      {/* ── Frecuencia de consumo ── */}
      <div className="space-y-4">
        <h3 className="section-title text-base border-b border-navy-700/60 pb-2">Frecuencia de Consumo por Grupos</h3>
        <div className="space-y-2">
          {GRUPOS_FRECUENCIA.map(grupo => {
            const val = form.frecuencias[grupo] || 'Nunca';
            return (
              <div key={grupo} className="flex items-center gap-3 p-3 rounded-xl bg-navy-800/30 hover:bg-navy-800/50 transition-colors">
                <span className="text-sm text-white/70 flex-1 min-w-0 truncate">{grupo}</span>
                <div className="flex gap-1.5 flex-shrink-0">
                  {FRECUENCIAS.map(f => (
                    <button key={f} type="button"
                      onClick={() => setFreq(grupo, f)}
                      className={`px-2.5 py-1 rounded-lg text-2xs font-bold transition-all
                        ${val === f
                          ? f === 'Nunca'     ? 'bg-white/15 text-white/70'
                          : f === 'Ocasional' ? 'bg-info/20 text-info border border-info/30'
                          : f === 'Semanal'   ? 'bg-warning/20 text-warning border border-warning/30'
                          : 'bg-emerald/20 text-emerald border border-emerald/30'
                          : 'bg-transparent text-white/25 hover:text-white/50'
                        }`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Guardar */}
      <div className="flex justify-end pt-4 border-t border-navy-700/50">
        <button type="submit" disabled={saving} className="btn btn-primary gap-2">
          {saving ? <><div className="w-4 h-4 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin" />Guardando...</>
            : saved ? <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Guardado</>
            : <><Save size={15} />Guardar hábitos</>
          }
        </button>
      </div>
    </form>
  );
}
