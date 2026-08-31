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
import { Card, Input, Textarea } from '../design-system/components';

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
        <Input id="p-nombre" label="Nombre" required value={form.firstName} onChange={(e) => set('firstName', e.target.value)} placeholder="Ej. Carlos" disabled={loading} />
        <Input id="p-apellido" label="Apellido" required value={form.lastName} onChange={(e) => set('lastName', e.target.value)} placeholder="Ej. Cervantes" disabled={loading} />
        <Input id="p-email" label="Correo" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="carlos@ejemplo.com" disabled={loading} />
        <Input id="p-tel" label="Teléfono" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+52 …" disabled={loading} />
        <Input id="p-dob" label="Fecha de nacimiento" type="date" value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} disabled={loading} />
        <Combobox name="gender" label="Género" options={GENEROS} value={form.gender} onChange={onSelect} placeholder="Seleccionar…" disabled={loading} />
      </div>
    </FormSection>
  );

  const datosClinicos = (
    <>
      <FormSection title="Medidas iniciales" description="Opcional. Las mediciones de seguimiento se capturan después, en la pestaña Evolución del expediente.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input id="p-peso" label="Peso (kg)" type="number" step="0.1" min="0" value={form.weight} onChange={(e) => set('weight', e.target.value)} placeholder="70.5" disabled={loading} />
          <Input id="p-talla" label="Talla (cm)" type="number" step="0.1" min="0" value={form.height} onChange={(e) => set('height', e.target.value)} placeholder="175" disabled={loading} />
          <Input id="p-grasa" label="Grasa (%)" type="number" step="0.1" min="0" value={form.fatPercentage} onChange={(e) => set('fatPercentage', e.target.value)} disabled={loading} />
          <Input id="p-musculo" label="Masa muscular (kg)" type="number" step="0.1" min="0" value={form.muscleMass} onChange={(e) => set('muscleMass', e.target.value)} disabled={loading} />
          <Input id="p-agua" label="Agua (%)" type="number" step="0.1" min="0" value={form.waterPercentage} onChange={(e) => set('waterPercentage', e.target.value)} disabled={loading} />
          <Input id="p-visceral" label="Grasa visceral" type="number" step="0.1" min="0" value={form.visceralFat} onChange={(e) => set('visceralFat', e.target.value)} disabled={loading} />
          <Input id="p-osea" label="Masa ósea (kg)" type="number" step="0.1" min="0" value={form.boneMass} onChange={(e) => set('boneMass', e.target.value)} disabled={loading} />
          <Input id="p-edadmet" label="Edad metabólica (años)" type="number" min="0" value={form.metabolicAge} onChange={(e) => set('metabolicAge', e.target.value)} disabled={loading} />
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
          <Textarea id="p-cond" label="Antecedentes personales" rows="2" value={form.conditions} onChange={(e) => set('conditions', e.target.value)} placeholder="Enfermedades crónicas, cirugías, alergias… (separadas por comas)" disabled={loading} />
          <Textarea id="p-fam" label="Antecedentes familiares" rows="2" value={form.familyHistory} onChange={(e) => set('familyHistory', e.target.value)} placeholder="Diabetes, hipertensión, cáncer en la familia…" disabled={loading} />
          <Textarea id="p-habitos" label="Hábitos alimentarios" rows="2" value={form.eatingHabits} onChange={(e) => set('eatingHabits', e.target.value)} disabled={loading} />
          <Textarea id="p-notas" label="Notas" rows="2" value={form.notes} onChange={(e) => set('notes', e.target.value)} disabled={loading} />
        </div>
      </FormSection>
    </>
  );

  return (
    <div className="mx-auto max-w-4xl space-y-5 animate-fade-up">
      <Button as={Link} variant="ghost" size="sm" to={esEdicion ? `/pacientes/${id}` : '/pacientes'} className="gap-2">
        <ArrowLeft size={16} /> Volver
      </Button>

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
