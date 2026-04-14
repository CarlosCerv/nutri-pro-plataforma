import { useState } from 'react';
import { Save, Camera, User, MapPin, Phone, Mail, Calendar, CreditCard } from 'lucide-react';
import api from '../../services/api';

const SECTION = ({ title, children }) => (
  <div className="space-y-4">
    <h3 className="section-title text-base border-b border-navy-700/60 pb-2">{title}</h3>
    {children}
  </div>
);

const Field = ({ label, required, children }) => (
  <div className="form-group">
    <label className="label">{label}{required && <span className="text-danger ml-1">*</span>}</label>
    {children}
  </div>
);

const Row = ({ cols = 2, children }) => (
  <div className={`grid grid-cols-1 sm:grid-cols-${cols} gap-4`}>{children}</div>
);

export default function GeneralDataTab({ patient, onUpdate }) {
  const [form, setForm]   = useState({
    firstName:  patient?.firstName  || '',
    lastName:   patient?.lastName   || '',
    dob:        patient?.dob        ? patient.dob.slice(0, 10) : '',
    sex:        patient?.sex        || 'F',
    curp:       patient?.curp       || '',
    phone:      patient?.phone      || '',
    email:      patient?.email      || '',
    address:    patient?.address    || '',
    // Historia clínica
    antFamDM:        patient?.antFamDM        || false,
    antFamHTA:       patient?.antFamHTA       || false,
    antFamObesidad:  patient?.antFamObesidad  || false,
    antFamCancer:    patient?.antFamCancer    || false,
    antPersonales:   patient?.antPersonales   || '',
    cirugiasPrevias: patient?.cirugiasPrevias || '',
    alergias:        patient?.alergias        || '',
    intolerancias:   patient?.intolerancias   || '',
    medicamentos:    patient?.medicamentos    || '',
    // Estilo de vida
    horasSueno:      patient?.horasSueno      || '',
    nivelEstres:     patient?.nivelEstres     || 5,
    ocupacion:       patient?.ocupacion       || '',
    horasLaboral:    patient?.horasLaboral    || '',
    // Hábitos tóxicos
    tabaquismo:      patient?.tabaquismo      || 0,
    alcoholismo:     patient?.alcoholismo     || 0,
  });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const calcEdad = () => {
    if (!form.dob) return null;
    return Math.floor((Date.now() - new Date(form.dob)) / (1000*60*60*24*365.25));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put(`/api/patients/${patient._id}`, form);
      onUpdate?.(res.data.data || res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      // En desarrollo sin backend: simular guardado
      onUpdate?.({ ...patient, ...form });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Foto de perfil */}
      <div className="flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-navy-800 border-2 border-dashed border-navy-600 flex flex-col items-center justify-center cursor-pointer hover:border-emerald/40 transition-colors group">
          <Camera size={20} className="text-white/20 group-hover:text-emerald/50 transition-colors" />
          <span className="text-2xs text-white/20 mt-1">Foto</span>
        </div>
        <div>
          <div className="text-sm font-semibold text-white mb-0.5">Foto del paciente</div>
          <div className="text-xs text-white/30">PNG, JPG hasta 5 MB</div>
        </div>
      </div>

      {/* ── Datos personales ── */}
      <SECTION title="Datos Personales">
        <Row cols={2}>
          <Field label="Nombre(s)" required>
            <input className="input" value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="María" required />
          </Field>
          <Field label="Apellidos" required>
            <input className="input" value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="González" required />
          </Field>
        </Row>
        <Row cols={3}>
          <Field label="Fecha de nacimiento" required>
            <input type="date" className="input" value={form.dob} onChange={e => set('dob', e.target.value)} required />
          </Field>
          <Field label="Edad calculada">
            <div className="input bg-navy-900/50 cursor-default text-white/50 font-mono">
              {calcEdad() ? `${calcEdad()} años` : '—'}
            </div>
          </Field>
          <Field label="Sexo biológico" required>
            <select className="select" value={form.sex} onChange={e => set('sex', e.target.value)}>
              <option value="F">Femenino</option>
              <option value="M">Masculino</option>
            </select>
          </Field>
        </Row>
        <Row cols={2}>
          <Field label="CURP">
            <input className="input" value={form.curp} onChange={e => set('curp', e.target.value.toUpperCase())} placeholder="GOAM900615MJCNRR01" maxLength={18} />
          </Field>
          <Field label="Teléfono">
            <input className="input" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="3310001111" />
          </Field>
        </Row>
        <Row cols={2}>
          <Field label="Correo electrónico">
            <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="paciente@email.com" />
          </Field>
          <Field label="Dirección">
            <input className="input" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Calle, Colonia, Ciudad" />
          </Field>
        </Row>
      </SECTION>

      {/* ── Historia clínica ── */}
      <SECTION title="Historia Clínica">
        <div>
          <label className="label mb-3">Antecedentes familiares</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { key: 'antFamDM',       label: 'Diabetes'  },
              { key: 'antFamHTA',      label: 'Hipertensión' },
              { key: 'antFamObesidad', label: 'Obesidad'  },
              { key: 'antFamCancer',   label: 'Cáncer'    },
            ].map(f => (
              <label key={f.key}
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all duration-200
                  ${form[f.key]
                    ? 'bg-emerald/10 border-emerald/30 text-emerald'
                    : 'bg-navy-800/50 border-navy-700/50 text-white/50 hover:border-navy-600'
                  }`}>
                <input type="checkbox" className="hidden" checked={form[f.key]} onChange={e => set(f.key, e.target.checked)} />
                <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border
                  ${form[f.key] ? 'bg-emerald border-emerald' : 'border-navy-600'}`}>
                  {form[f.key] && <svg className="w-2.5 h-2.5 text-navy-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                </div>
                <span className="text-xs font-semibold">{f.label}</span>
              </label>
            ))}
          </div>
        </div>
        <Row cols={2}>
          <Field label="Antecedentes personales patológicos">
            <textarea className="input min-h-[80px] resize-none" value={form.antPersonales} onChange={e => set('antPersonales', e.target.value)} placeholder="Enfermedades previas..." />
          </Field>
          <Field label="Cirugías previas">
            <textarea className="input min-h-[80px] resize-none" value={form.cirugiasPrevias} onChange={e => set('cirugiasPrevias', e.target.value)} placeholder="Tipo de cirugía, año..." />
          </Field>
        </Row>
        <Row cols={2}>
          <Field label="Alergias alimentarias">
            <input className="input" value={form.alergias} onChange={e => set('alergias', e.target.value)} placeholder="Mariscos, nueces, lácteos..." />
          </Field>
          <Field label="Intolerancias confirmadas">
            <input className="input" value={form.intolerancias} onChange={e => set('intolerancias', e.target.value)} placeholder="Lactosa, gluten..." />
          </Field>
        </Row>
        <Field label="Medicamentos actuales">
          <textarea className="input min-h-[70px] resize-none" value={form.medicamentos} onChange={e => set('medicamentos', e.target.value)} placeholder="Nombre del medicamento, dosis, frecuencia..." />
        </Field>
      </SECTION>

      {/* ── Estilo de vida ── */}
      <SECTION title="Estilo de Vida">
        <Row cols={3}>
          <Field label="Horas de sueño/noche">
            <input type="number" className="input" min={0} max={24} step={0.5} value={form.horasSueno} onChange={e => set('horasSueno', e.target.value)} placeholder="7" />
          </Field>
          <Field label={`Nivel de estrés (${form.nivelEstres}/10)`}>
            <div className="flex items-center gap-3 mt-1">
              <input type="range" min={1} max={10} value={form.nivelEstres}
                onChange={e => set('nivelEstres', Number(e.target.value))}
                className="flex-1 accent-emerald" />
              <span className="font-mono text-sm text-emerald w-4">{form.nivelEstres}</span>
            </div>
          </Field>
          <Field label="Horas laborales/día">
            <input type="number" className="input" min={0} max={24} value={form.horasLaboral} onChange={e => set('horasLaboral', e.target.value)} placeholder="8" />
          </Field>
        </Row>
        <Field label="Ocupación">
          <input className="input" value={form.ocupacion} onChange={e => set('ocupacion', e.target.value)} placeholder="Enfermera, oficinista, docente..." />
        </Field>
      </SECTION>

      {/* ── Hábitos tóxicos ── */}
      <SECTION title="Hábitos Tóxicos">
        <Row cols={2}>
          <Field label="Tabaquismo (cigarrillos/día, 0 = no fuma)">
            <input type="number" className="input" min={0} max={100} value={form.tabaquismo} onChange={e => set('tabaquismo', e.target.value)} />
          </Field>
          <Field label="Alcoholismo (copas/semana, 0 = no consume)">
            <input type="number" className="input" min={0} max={100} value={form.alcoholismo} onChange={e => set('alcoholismo', e.target.value)} />
          </Field>
        </Row>
      </SECTION>

      {/* Botón guardar */}
      <div className="flex justify-end pt-4 border-t border-navy-700/50">
        <button type="submit" disabled={saving} id="save-general-btn"
          className="btn btn-primary gap-2">
          {saving
            ? <><div className="w-4 h-4 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin" />Guardando...</>
            : saved
            ? <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Guardado</>
            : <><Save size={15} />Guardar cambios</>
          }
        </button>
      </div>
    </form>
  );
}
