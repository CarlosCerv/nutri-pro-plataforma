import { useState } from 'react';
import { Save, Lock } from 'lucide-react';
import api from '../../services/api';

const PATOLOGIAS = [
  { grupo: 'Metabólicas',    items: ['Diabetes tipo 1', 'Diabetes tipo 2', 'Prediabetes', 'Síndrome metabólico', 'Resistencia a la insulina', 'Hipotiroidismo', 'Hipertiroidismo', 'SOP'] },
  { grupo: 'Cardiovascular', items: ['Hipertensión arterial', 'Dislipidemia', 'Hipercolesterolemia', 'Hipertrigliceridemia', 'Enfermedad coronaria'] },
  { grupo: 'Digestivas',     items: ['Enfermedad de Crohn', 'Colitis ulcerosa', 'SII', 'ERGE/Reflujo', 'Estreñimiento crónico', 'Hígado graso'] },
  { grupo: 'Renales',        items: ['Enfermedad renal crónica (ERC)', 'Litiasis renal', 'Hiperuricemia/Gota'] },
  { grupo: 'Oncológicas',    items: ['Cáncer (en tratamiento)', 'Cáncer (en remisión)'] },
  { grupo: 'Otras',          items: ['Anemia', 'Osteoporosis', 'Artritis reumatoide', 'Lupus', 'Fibromialgia'] },
];

const SINTOMAS_GI = [
  'Estreñimiento', 'Diarrea', 'Distensión abdominal', 'Gases/Flatulencia',
  'Reflujo / ERGE', 'Náuseas', 'Dolor abdominal', 'Sangrado rectal',
];

const OBJETIVOS_PACIENTE = [
  'Bajar de peso', 'Subir de peso', 'Ganar músculo', 'Mejorar composición corporal',
  'Control glucémico', 'Control de lípidos', 'Mejorar energía', 'Tratar anemia',
  'Embarazo / lactancia', 'Rendimiento deportivo', 'Mejorar hábitos', 'Control de HTA',
];

const DIAGNOSTICOS_NUTRICIONALES = [
  'Bajo peso', 'Peso normal', 'Sobrepeso', 'Obesidad grado I', 'Obesidad grado II', 'Obesidad grado III',
  'Desnutrición leve', 'Desnutrición moderada', 'Desnutrición severa',
  'Masa muscular elevada', 'Composición corporal óptima',
];

export default function ClinicalTab({ patient }) {
  const [form, setForm] = useState({
    diagnosticoNutricional: patient?.diagnosticoNutricional || '',
    patologias:   patient?.patologias   || [],
    sintomasGI:   patient?.sintomasGI   || [],
    objetivos:    patient?.objetivos    || [],
    notasClinicas: patient?.notasClinicas || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const toggle = (campo, valor) => {
    setForm(f => {
      const arr = f[campo] || [];
      return {
        ...f,
        [campo]: arr.includes(valor) ? arr.filter(x => x !== valor) : [...arr, valor],
      };
    });
  };

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

  const ChipToggle = ({ campo, valor }) => {
    const active = (form[campo] || []).includes(valor);
    return (
      <button type="button" onClick={() => toggle(campo, valor)}
        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 border
          ${active
            ? 'bg-emerald/15 text-emerald border-emerald/30'
            : 'bg-navy-800/50 text-white/40 border-navy-700/50 hover:border-navy-600 hover:text-white/70'
          }`}>
        {active && <span className="mr-1">✓</span>}
        {valor}
      </button>
    );
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* ── Diagnóstico nutricional ── */}
      <div className="space-y-3">
        <h3 className="section-title text-base border-b border-navy-700/60 pb-2">Diagnóstico Nutricional</h3>
        <div className="flex flex-wrap gap-2">
          {DIAGNOSTICOS_NUTRICIONALES.map(d => (
            <button key={d} type="button"
              onClick={() => setForm(f => ({ ...f, diagnosticoNutricional: d }))}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border
                ${form.diagnosticoNutricional === d
                  ? 'bg-gold/15 text-gold border-gold/30'
                  : 'bg-navy-800/50 text-white/40 border-navy-700/50 hover:text-white/70 hover:border-navy-600'
                }`}>
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* ── Patologías ── */}
      <div className="space-y-4">
        <h3 className="section-title text-base border-b border-navy-700/60 pb-2">Patologías Presentes</h3>
        {PATOLOGIAS.map(grupo => (
          <div key={grupo.grupo}>
            <div className="text-2xs font-bold text-white/25 uppercase tracking-wider mb-2">{grupo.grupo}</div>
            <div className="flex flex-wrap gap-2">
              {grupo.items.map(p => <ChipToggle key={p} campo="patologias" valor={p} />)}
            </div>
          </div>
        ))}
      </div>

      {/* ── Síntomas GI ── */}
      <div className="space-y-3">
        <h3 className="section-title text-base border-b border-navy-700/60 pb-2">Síntomas Gastrointestinales</h3>
        <div className="flex flex-wrap gap-2">
          {SINTOMAS_GI.map(s => (
            <button key={s} type="button"
              onClick={() => toggle('sintomasGI', s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border
                ${(form.sintomasGI || []).includes(s)
                  ? 'bg-warning/15 text-warning border-warning/30'
                  : 'bg-navy-800/50 text-white/40 border-navy-700/50 hover:text-white/70 hover:border-navy-600'
                }`}>
              {(form.sintomasGI || []).includes(s) && '⚠ '}{s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Objetivos del paciente ── */}
      <div className="space-y-3">
        <h3 className="section-title text-base border-b border-navy-700/60 pb-2">Objetivos del Tratamiento Nutricional</h3>
        <div className="flex flex-wrap gap-2">
          {OBJETIVOS_PACIENTE.map(o => <ChipToggle key={o} campo="objetivos" valor={o} />)}
        </div>
      </div>

      {/* ── Notas clínicas privadas ── */}
      <div className="space-y-3">
        <h3 className="section-title text-base border-b border-navy-700/60 pb-2 flex items-center gap-2">
          <Lock size={14} className="text-gold" />
          Notas Clínicas Privadas
          <span className="badge badge-gold text-2xs">Solo visible para ti</span>
        </h3>
        <textarea
          className="input min-h-[150px] resize-none"
          value={form.notasClinicas}
          onChange={e => setForm(f => ({ ...f, notasClinicas: e.target.value }))}
          placeholder="Observaciones clínicas, impresiones del nutriólogo, evolución del caso, consideraciones especiales..."
        />
      </div>

      {/* Guardar */}
      <div className="flex justify-end pt-4 border-t border-navy-700/50">
        <button type="submit" disabled={saving} className="btn btn-primary gap-2">
          {saving ? <><div className="w-4 h-4 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin" />Guardando...</>
            : saved ? <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Guardado</>
            : <><Save size={15} />Guardar clínica</>
          }
        </button>
      </div>
    </form>
  );
}
