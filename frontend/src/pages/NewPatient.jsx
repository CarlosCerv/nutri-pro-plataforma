import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { patientsAPI } from '../services/api';
import { getApiErrorMessage } from '../lib/apiError';
import { useToast } from '../contexts/ToastContext';
import Button from '../design-system/components/Button.jsx';
import Combobox from '../design-system/components/Combobox.jsx';
import FormSection from '../design-system/components/FormSection.jsx';
import { LoadingState } from '../design-system/components/StateViews.jsx';
import { Card } from '../design-system/components';

/**
 * Alta y edición de paciente.
 *
 * El formulario anterior pedía 31 campos en una sola pantalla, todo o nada:
 * si el nutriólogo salía antes de enviar, perdía la captura entera, y dar de
 * alta a alguien con solo su nombre y su teléfono obligaba a recorrer cuatro
 * secciones. Ahora el alta son dos pasos y el primero ya guarda: cuatro
 * campos bastan para tener el expediente creado.
 *
 * Se retiran dieciséis campos fantasma (`skinfolds_*`, `perimeters_*`,
 * `diameters_*`): vivían en el estado y se enviaban al backend en cada
 * guardado, pero no tenían ningún input en la pantalla, así que siempre
 * viajaban vacíos. Esas medidas se capturan en la pestaña Evolución del
 * expediente, que es donde tienen sentido, y se guardan con su fecha.
 */

const GENEROS = [
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Femenino' },
  { value: 'other', label: 'Otro' },
];

const OBJETIVOS = [
  { value: 'weight_loss', label: 'Pérdida de peso' },
  { value: 'weight_gain', label: 'Ganancia de peso' },
  { value: 'muscle_gain', label: 'Ganancia muscular' },
  { value: 'maintenance', label: 'Mantenimiento' },
  { value: 'health_improvement', label: 'Mejora de salud' },
  { value: 'other', label: 'Otro' },
];

const ACTIVIDADES = [
  { value: 'sedentary', label: 'Sedentario' },
  { value: 'lightly_active', label: 'Ligeramente activo' },
  { value: 'moderately_active', label: 'Moderadamente activo' },
  { value: 'very_active', label: 'Muy activo' },
  { value: 'extremely_active', label: 'Extremadamente activo' },
];

const FORM_VACIO = {
  firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', gender: '',
  weight: '', height: '',
  fatPercentage: '', muscleMass: '', waterPercentage: '', visceralFat: '', boneMass: '', metabolicAge: '',
  nutritionalGoal: '', activityLevel: '',
  conditions: '', familyHistory: '', eatingHabits: '', notes: '',
};

const numero = (v) => (v === '' || v === null || v === undefined ? undefined : parseFloat(v));

const Campo = ({ label, htmlFor, required, unit, children }) => (
  <div className="form-group">
    <label className="label" htmlFor={htmlFor}>
      {label}
      {unit ? <span className="normal-case text-[var(--ink-secondary)]"> ({unit})</span> : null}
      {required ? <span className="text-[var(--danger)]"> *</span> : null}
    </label>
    {children}
  </div>
);

export default function NewPatient() {
  const navigate = useNavigate();
  const { id } = useParams();
  const esEdicion = Boolean(id);
  const toast = useToast();

  const [paso, setPaso] = useState(1);
  const [pacienteId, setPacienteId] = useState(id || null);
  const [form, setForm] = useState(FORM_VACIO);
  const [loading, setLoading] = useState(false);
  const [cargaInicial, setCargaInicial] = useState(esEdicion);
  const [error, setError] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const onSelect = (e) => set(e.target.name, e.target.value);

  const cargar = useCallback(async () => {
    try {
      const res = await patientsAPI.getOne(id);
      const p = res.data.data;
      setForm({
        firstName: p.firstName || '',
        lastName: p.lastName || '',
        email: p.email || '',
        phone: p.phone || '',
        dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '',
        gender: p.gender || '',
        weight: p.anthropometry?.weight ?? '',
        height: p.anthropometry?.height ?? '',
        fatPercentage: p.anthropometry?.bioimpedance?.fatPercentage ?? '',
        muscleMass: p.anthropometry?.bioimpedance?.muscleMass ?? '',
        waterPercentage: p.anthropometry?.bioimpedance?.waterPercentage ?? '',
        visceralFat: p.anthropometry?.bioimpedance?.visceralFat ?? '',
        boneMass: p.anthropometry?.bioimpedance?.boneMass ?? '',
        metabolicAge: p.anthropometry?.bioimpedance?.metabolicAge ?? '',
        nutritionalGoal: p.nutritionalGoals?.primaryGoal || '',
        activityLevel: p.lifestyle?.activityLevel || '',
        conditions: p.medicalHistory?.conditions?.join(', ') || '',
        familyHistory: p.medicalHistory?.familyHistory || '',
        eatingHabits: p.eatingHabits || '',
        notes: p.notes || '',
      });
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo cargar el paciente.'));
    } finally {
      setCargaInicial(false);
    }
  }, [id]);

  useEffect(() => {
    if (esEdicion) cargar();
  }, [esEdicion, cargar]);

  /** Identificación: lo mínimo para que el expediente exista. */
  const payloadPaso1 = () => ({
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    email: form.email.trim() || undefined,
    phone: form.phone.trim() || undefined,
    dateOfBirth: form.dateOfBirth || undefined,
    gender: form.gender || undefined,
  });

  /** Datos clínicos iniciales: todo opcional. */
  const payloadPaso2 = () => ({
    anthropometry: {
      weight: numero(form.weight),
      height: numero(form.height),
      bioimpedance: {
        fatPercentage: numero(form.fatPercentage),
        muscleMass: numero(form.muscleMass),
        waterPercentage: numero(form.waterPercentage),
        visceralFat: numero(form.visceralFat),
        boneMass: numero(form.boneMass),
        metabolicAge: numero(form.metabolicAge),
      },
    },
    nutritionalGoals: { primaryGoal: form.nutritionalGoal || undefined },
    lifestyle: { activityLevel: form.activityLevel || undefined },
    medicalHistory: {
      conditions: form.conditions ? form.conditions.split(',').map((c) => c.trim()).filter(Boolean) : [],
      familyHistory: form.familyHistory || undefined,
    },
    eatingHabits: form.eatingHabits || undefined,
    notes: form.notes || undefined,
  });

  const guardar = async (datos, { avanzar = false, mensaje, destino } = {}) => {
    setLoading(true);
    setError('');
    try {
      if (pacienteId) {
        await patientsAPI.update(pacienteId, datos);
      } else {
        const res = await patientsAPI.create(datos);
        setPacienteId(res.data?.data?._id || null);
      }
      if (mensaje) toast.success(mensaje);
      if (avanzar) setPaso(2);
      if (destino) navigate(destino);
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo guardar el paciente.'));
    } finally {
      setLoading(false);
    }
  };

  const enviarPaso1 = (e) => {
    e.preventDefault();
    if (esEdicion) {
      guardar({ ...payloadPaso1(), ...payloadPaso2() }, { mensaje: 'Paciente actualizado.', destino: `/pacientes/${pacienteId}` });
    } else {
      guardar(payloadPaso1(), { avanzar: true, mensaje: `${form.firstName} quedó registrado. Puedes completar sus datos clínicos o dejarlo para después.` });
    }
  };

  const enviarPaso2 = (e) => {
    e.preventDefault();
    guardar(payloadPaso2(), { mensaje: 'Datos clínicos guardados.', destino: `/pacientes/${pacienteId}` });
  };

  if (cargaInicial) return <LoadingState label="Cargando paciente…" />;

  const identificacion = (
    <FormSection title="Identificación" description="Con esto basta para crear el expediente.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo label="Nombre" htmlFor="p-nombre" required>
          <input id="p-nombre" className="input" required value={form.firstName} onChange={(e) => set('firstName', e.target.value)} placeholder="Ej. Carlos" disabled={loading} />
        </Campo>
        <Campo label="Apellido" htmlFor="p-apellido" required>
          <input id="p-apellido" className="input" required value={form.lastName} onChange={(e) => set('lastName', e.target.value)} placeholder="Ej. Cervantes" disabled={loading} />
        </Campo>
        <Campo label="Correo" htmlFor="p-email">
          <input id="p-email" type="email" className="input" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="carlos@ejemplo.com" disabled={loading} />
        </Campo>
        <Campo label="Teléfono" htmlFor="p-tel">
          <input id="p-tel" type="tel" className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+52 …" disabled={loading} />
        </Campo>
        <Campo label="Fecha de nacimiento" htmlFor="p-dob">
          <input id="p-dob" type="date" className="input" value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} disabled={loading} />
        </Campo>
        <Combobox name="gender" label="Género" options={GENEROS} value={form.gender} onChange={onSelect} placeholder="Seleccionar…" disabled={loading} />
      </div>
    </FormSection>
  );

  const datosClinicos = (
    <>
      <FormSection title="Medidas iniciales" description="Opcional. Las mediciones de seguimiento se capturan después, en la pestaña Evolución del expediente.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Campo label="Peso" htmlFor="p-peso" unit="kg">
            <input id="p-peso" type="number" step="0.1" min="0" className="input" value={form.weight} onChange={(e) => set('weight', e.target.value)} placeholder="70.5" disabled={loading} />
          </Campo>
          <Campo label="Talla" htmlFor="p-talla" unit="cm">
            <input id="p-talla" type="number" step="0.1" min="0" className="input" value={form.height} onChange={(e) => set('height', e.target.value)} placeholder="175" disabled={loading} />
          </Campo>
          <Campo label="Grasa" htmlFor="p-grasa" unit="%">
            <input id="p-grasa" type="number" step="0.1" min="0" className="input" value={form.fatPercentage} onChange={(e) => set('fatPercentage', e.target.value)} disabled={loading} />
          </Campo>
          <Campo label="Masa muscular" htmlFor="p-musculo" unit="kg">
            <input id="p-musculo" type="number" step="0.1" min="0" className="input" value={form.muscleMass} onChange={(e) => set('muscleMass', e.target.value)} disabled={loading} />
          </Campo>
          <Campo label="Agua" htmlFor="p-agua" unit="%">
            <input id="p-agua" type="number" step="0.1" min="0" className="input" value={form.waterPercentage} onChange={(e) => set('waterPercentage', e.target.value)} disabled={loading} />
          </Campo>
          <Campo label="Grasa visceral" htmlFor="p-visceral">
            <input id="p-visceral" type="number" step="0.1" min="0" className="input" value={form.visceralFat} onChange={(e) => set('visceralFat', e.target.value)} disabled={loading} />
          </Campo>
          <Campo label="Masa ósea" htmlFor="p-osea" unit="kg">
            <input id="p-osea" type="number" step="0.1" min="0" className="input" value={form.boneMass} onChange={(e) => set('boneMass', e.target.value)} disabled={loading} />
          </Campo>
          <Campo label="Edad metabólica" htmlFor="p-edadmet" unit="años">
            <input id="p-edadmet" type="number" min="0" className="input" value={form.metabolicAge} onChange={(e) => set('metabolicAge', e.target.value)} disabled={loading} />
          </Campo>
        </div>
      </FormSection>

      <FormSection title="Objetivo y estilo de vida">
        <div className="grid gap-4 sm:grid-cols-2">
          <Combobox name="nutritionalGoal" label="Objetivo nutricional" options={OBJETIVOS} value={form.nutritionalGoal} onChange={onSelect} placeholder="Seleccionar…" disabled={loading} />
          <Combobox name="activityLevel" label="Nivel de actividad" options={ACTIVIDADES} value={form.activityLevel} onChange={onSelect} placeholder="Seleccionar…" disabled={loading} />
        </div>
      </FormSection>

      <FormSection title="Antecedentes">
        <div className="grid gap-4">
          <Campo label="Antecedentes personales" htmlFor="p-cond">
            <textarea id="p-cond" rows="2" className="input" value={form.conditions} onChange={(e) => set('conditions', e.target.value)} placeholder="Enfermedades crónicas, cirugías, alergias… (separadas por comas)" disabled={loading} />
          </Campo>
          <Campo label="Antecedentes familiares" htmlFor="p-fam">
            <textarea id="p-fam" rows="2" className="input" value={form.familyHistory} onChange={(e) => set('familyHistory', e.target.value)} placeholder="Diabetes, hipertensión, cáncer en la familia…" disabled={loading} />
          </Campo>
          <Campo label="Hábitos alimentarios" htmlFor="p-habitos">
            <textarea id="p-habitos" rows="2" className="input" value={form.eatingHabits} onChange={(e) => set('eatingHabits', e.target.value)} disabled={loading} />
          </Campo>
          <Campo label="Notas" htmlFor="p-notas">
            <textarea id="p-notas" rows="2" className="input" value={form.notes} onChange={(e) => set('notes', e.target.value)} disabled={loading} />
          </Campo>
        </div>
      </FormSection>
    </>
  );

  return (
    <div className="mx-auto max-w-4xl space-y-5 animate-fade-up">
      <Link to={esEdicion ? `/pacientes/${id}` : '/pacientes'} className="btn btn-ghost btn-sm gap-2">
        <ArrowLeft size={16} /> Volver
      </Link>

      {!esEdicion ? (
        <ol className="flex items-center gap-3 text-sm" aria-label="Progreso del alta">
          {[
            { n: 1, label: 'Identificación' },
            { n: 2, label: 'Datos clínicos' },
          ].map((p) => (
            <li key={p.n} className="flex items-center gap-2">
              <span
                aria-current={paso === p.n ? 'step' : undefined}
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                  paso > p.n
                    ? 'bg-[var(--success)] text-white'
                    : paso === p.n
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--surface-strong)] text-[var(--ink-secondary)]'
                }`}
              >
                {paso > p.n ? <Check size={13} /> : p.n}
              </span>
              <span className={paso === p.n ? 'font-semibold text-[var(--ink)]' : 'text-[var(--ink-secondary)]'}>
                {p.label}
              </span>
              {p.n === 1 ? <span className="text-[var(--border)]">›</span> : null}
            </li>
          ))}
        </ol>
      ) : null}

      {error ? (
        <div role="alert" className="rounded-[var(--radius-m)] border border-[var(--danger)] bg-[rgba(196,30,22,0.06)] px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </div>
      ) : null}

      {esEdicion ? (
        <Card as="form" onSubmit={enviarPaso1} className="space-y-8">
          {identificacion}
          {datosClinicos}
          <div className="flex justify-end gap-2 border-t border-[var(--border-soft)] pt-4">
            <Button type="submit" loading={loading} disabled={!form.firstName || !form.lastName}>
              Guardar cambios
            </Button>
          </div>
        </Card>
      ) : paso === 1 ? (
        <Card as="form" onSubmit={enviarPaso1} className="space-y-8">
          {identificacion}
          <div className="flex justify-end border-t border-[var(--border-soft)] pt-4">
            <Button type="submit" loading={loading} disabled={!form.firstName || !form.lastName} className="gap-2">
              Guardar y continuar
              <ArrowRight size={15} />
            </Button>
          </div>
        </Card>
      ) : (
        <Card as="form" onSubmit={enviarPaso2} className="space-y-8">
          {datosClinicos}
          <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--border-soft)] pt-4">
            <Button variant="outline" onClick={() => navigate(`/pacientes/${pacienteId}`)} disabled={loading}>
              Completar después
            </Button>
            <Button type="submit" loading={loading}>
              Guardar datos clínicos
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
