import { useState } from 'react';
import { Input, Select, Textarea } from '../../design-system/components';
import { Camera, User, MapPin, Phone, Mail, Calendar, CreditCard } from 'lucide-react';
import api from '../../services/api';
import useSaveState from '../../hooks/useSaveState';
import SaveBar from '../../design-system/components/SaveBar.jsx';

const SECTION = ({ title, children }) => (
  <div className="space-y-4">
    <h3 className="section-title text-base border-b border-[var(--border-soft)] pb-2">{title}</h3>
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
  const { saving, saved, error, save } = useSaveState();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // `Date.now()` no puede llamarse durante el render (regla de pureza de React):
  // se captura una sola vez al montar y de ahí sale la edad.
  const [ahora] = useState(() => Date.now());
  const calcEdad = () => {
    if (!form.dob) return null;
    return Math.floor((ahora - new Date(form.dob)) / (1000 * 60 * 60 * 24 * 365.25));
  };

  const handleSave = (e) => {
    e.preventDefault();
    save(async () => {
      const res = await api.put(`/api/patients/${patient._id}`, form);
      onUpdate?.(res.data.data || res.data);
    });
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Foto de perfil */}
      <div className="flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-[var(--surface-alt)] border-2 border-dashed border-[var(--border-soft)] flex flex-col items-center justify-center cursor-pointer hover:border-[var(--accent-border)] transition-colors group">
          <Camera size={20} className="text-[var(--ink-secondary)] group-hover:text-[var(--accent)] transition-colors" />
          <span className="text-2xs text-[var(--ink-secondary)] mt-1">Foto</span>
        </div>
        <div>
          <div className="text-sm font-semibold text-[var(--ink)] mb-0.5">Foto del paciente</div>
          <div className="text-xs text-[var(--ink-secondary)]">PNG, JPG hasta 5 MB</div>
        </div>
      </div>

      {/* ── Datos personales ── */}
      <SECTION title="Datos Personales">
        <Row cols={2}>
          <Input label="Nombre(s)" required value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="María" />
          <Input label="Apellidos" required value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="González" />
        </Row>
        <Row cols={3}>
          <Input label="Fecha de nacimiento" required type="date" value={form.dob} onChange={e => set('dob', e.target.value)} />
          <div className="form-group">
            <span className="label">Edad calculada</span>
            <output className="input block cursor-default text-[var(--ink-secondary)] font-mono">
              {calcEdad() ? `${calcEdad()} años` : '—'}
            </output>
          </div>
          <Select label="Sexo biológico" required value={form.sex} onChange={e => set('sex', e.target.value)}>
              <option value="F">Femenino</option>
              <option value="M">Masculino</option>
            </Select>
        </Row>
        <Row cols={2}>
          <Input label="CURP" value={form.curp} onChange={e => set('curp', e.target.value.toUpperCase())} placeholder="GOAM900615MJCNRR01" maxLength={18} />
          <Input label="Teléfono" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="3310001111" />
        </Row>
        <Row cols={2}>
          <Input label="Correo electrónico" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="paciente@email.com" />
          <Input label="Dirección" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Calle, Colonia, Ciudad" />
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
                    ? 'bg-[var(--accent-tint)] border-[var(--accent-border)] text-[var(--accent)]'
                    : 'bg-[var(--surface-alt)] border-[var(--border-soft)] text-[var(--ink-secondary)] hover:border-[var(--border-soft)]'
                  }`}>
                <input type="checkbox" className="hidden" checked={form[f.key]} onChange={e => set(f.key, e.target.checked)} />
                <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border
                  ${form[f.key] ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--border-soft)]'}`}>
                  {form[f.key] && <svg className="w-2.5 h-2.5 text-[var(--ink)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                </div>
                <span className="text-xs font-semibold">{f.label}</span>
              </label>
            ))}
          </div>
        </div>
        <Row cols={2}>
          <Textarea label="Antecedentes personales patológicos" className="min-h-[80px] resize-none" value={form.antPersonales} onChange={e => set('antPersonales', e.target.value)} placeholder="Enfermedades previas..." />
          <Textarea label="Cirugías previas" className="min-h-[80px] resize-none" value={form.cirugiasPrevias} onChange={e => set('cirugiasPrevias', e.target.value)} placeholder="Tipo de cirugía, año..." />
        </Row>
        <Row cols={2}>
          <Input label="Alergias alimentarias" value={form.alergias} onChange={e => set('alergias', e.target.value)} placeholder="Mariscos, nueces, lácteos..." />
          <Input label="Intolerancias confirmadas" value={form.intolerancias} onChange={e => set('intolerancias', e.target.value)} placeholder="Lactosa, gluten..." />
        </Row>
        <Textarea label="Medicamentos actuales" className="min-h-[70px] resize-none" value={form.medicamentos} onChange={e => set('medicamentos', e.target.value)} placeholder="Nombre del medicamento, dosis, frecuencia..." />
      </SECTION>

      {/* ── Estilo de vida ── */}
      <SECTION title="Estilo de Vida">
        <Row cols={3}>
          <Input label="Horas de sueño/noche" type="number" min={0} max={24} step={0.5} value={form.horasSueno} onChange={e => set('horasSueno', e.target.value)} placeholder="7" />
          <div className="form-group">
            <label className="label" htmlFor="nivel-estres">Nivel de estrés</label>
            <div className="flex items-center gap-3 mt-1">
              <input
                id="nivel-estres"
                type="range"
                min={1}
                max={10}
                value={form.nivelEstres}
                onChange={e => set('nivelEstres', Number(e.target.value))}
                className="flex-1 accent-[var(--accent)]"
              />
              <output className="font-mono text-sm text-[var(--accent)] w-8 text-right">{form.nivelEstres}/10</output>
            </div>
          </div>
          <Input label="Horas laborales/día" type="number" min={0} max={24} value={form.horasLaboral} onChange={e => set('horasLaboral', e.target.value)} placeholder="8" />
        </Row>
        <Input label="Ocupación" value={form.ocupacion} onChange={e => set('ocupacion', e.target.value)} placeholder="Enfermera, oficinista, docente..." />
      </SECTION>

      {/* ── Hábitos tóxicos ── */}
      <SECTION title="Hábitos Tóxicos">
        <Row cols={2}>
          <Input label="Tabaquismo (cigarrillos/día, 0 = no fuma)" type="number" min={0} max={100} value={form.tabaquismo} onChange={e => set('tabaquismo', e.target.value)} />
          <Input label="Alcoholismo (copas/semana, 0 = no consume)" type="number" min={0} max={100} value={form.alcoholismo} onChange={e => set('alcoholismo', e.target.value)} />
        </Row>
      </SECTION>

      <SaveBar saving={saving} saved={saved} error={error} id="save-general-btn" label="Guardar cambios" />
    </form>
  );
}
