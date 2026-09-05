import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, AlertCircle, CalendarPlus, HeartPulse, NotebookPen, Salad, UserX, Ban, CheckCircle2,
} from 'lucide-react';
import api, { appointmentsAPI, patientsAPI, mealPlansAPI } from '../services/api';
import clinicalNotesService from '../services/clinicalNotesService';
import { getApiErrorMessage } from '../lib/apiError';
import { calcularIMC } from '../lib/calculations/imc';
import useSaveState from '../hooks/useSaveState';
import { useToast } from '../contexts/ToastContext';
import PatientAlertPanel from '../components/PatientAlertPanel';
import {
  Button, Card, Badge, Disclosure, Input, Textarea, SaveBar, ConfirmDialog,
} from '../design-system/components';
import { EmptyState, ErrorState } from '../design-system/components/StateViews';

const TIPO_LABEL = {
  initial: 'Primera consulta',
  follow_up: 'Seguimiento',
  check_in: 'Control',
  final: 'Cierre',
};

const num = (v) => {
  if (v === '' || v === null || v === undefined) return undefined;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : undefined;
};

const compact = (obj) => {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return Object.keys(out).length > 0 ? out : undefined;
};

const fechaLarga = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
    : '—';

/**
 * Pantalla de sesión de consulta.
 *
 * Antes "Iniciar consulta" (ConsultaHoyHero) llevaba al expediente general —
 * la misma vista que se usa fuera de consulta. Aquí la cita es el contenedor:
 * se capturan las mediciones y la nota SOAP de esta visita (ambas quedan
 * referenciadas a `appointment`), se revisa el plan activo, y "Finalizar
 * consulta" es el primer punto del frontend que llama `appointmentsAPI.update`
 * para cerrar el status — antes ninguna pantalla lo hacía.
 */
export default function ConsultationSession() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [patient, setPatient] = useState(null);
  const [mealPlan, setMealPlan] = useState(null);
  const [lastNote, setLastNote] = useState(null);

  const [vitales, setVitales] = useState({ peso: '', talla: '', paSis: '', paDia: '', nota: '' });
  const vitalesSave = useSaveState();

  const [soap, setSoap] = useState({ subjective: '', objective: '', analysis: '', plan: '', followUpDate: '' });
  const [notaGuardada, setNotaGuardada] = useState(false);
  const soapSave = useSaveState();

  const finishSave = useSaveState();
  const [noShowOpen, setNoShowOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await appointmentsAPI.getOne(appointmentId);
      const cita = res.data?.data || res.data;
      setAppointment(cita);

      const patientId = cita?.patient?._id || cita?.patient;
      if (!patientId) {
        setLoading(false);
        return;
      }

      const [pacienteRes, planesRes, notasRes] = await Promise.allSettled([
        patientsAPI.getOne(patientId),
        mealPlansAPI.getAll({ patientId, isTemplate: 'false' }),
        clinicalNotesService.getPatientNotes(patientId),
      ]);

      if (pacienteRes.status === 'fulfilled') {
        const p = pacienteRes.value.data?.data || pacienteRes.value.data;
        setPatient(p);
        setVitales((v) => ({ ...v, talla: p?.height ? String(p.height) : v.talla }));
      }

      if (planesRes.status === 'fulfilled') {
        const planes = planesRes.value.data?.data || [];
        const activo = [...planes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        setMealPlan(activo || null);
      }

      if (notasRes.status === 'fulfilled') {
        const notas = notasRes.value.data || [];
        setLastNote(notas[0] || null);
      }
    } catch (err) {
      setAppointment(null);
      setError(getApiErrorMessage(err, 'No se pudo cargar la cita.'));
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const nombrePaciente = useMemo(() => {
    if (!patient) return appointment?.patient ? '' : 'Invitado';
    return `${patient.firstName || ''} ${patient.lastName || ''}`.trim();
  }, [patient, appointment]);

  const actualizarStatus = async (status) => {
    await appointmentsAPI.update(appointmentId, {
      date: appointment.date,
      time: appointment.time,
      type: appointment.type,
      patient: patient?._id,
      status,
    });
  };

  const guardarVitales = (e) => {
    e.preventDefault();
    vitalesSave.save(async () => {
      const imc =
        num(vitales.peso) && num(vitales.talla)
          ? Number(calcularIMC(num(vitales.peso), num(vitales.talla)).toFixed(1))
          : undefined;
      const payload = {
        patientId: patient._id,
        appointment: appointmentId,
        measurements: compact({ weight: num(vitales.peso), height: num(vitales.talla), bmi: imc }),
        bloodPressure: compact({ systolic: num(vitales.paSis), diastolic: num(vitales.paDia) }),
        notes: vitales.nota || undefined,
      };
      const res = await api.post('/api/body-composition', payload);
      return res.data;
    });
  };

  const guardarNota = (e) => {
    e.preventDefault();
    soapSave.save(async () => {
      const res = await clinicalNotesService.createNote(patient._id, {
        ...soap,
        followUpDate: soap.followUpDate || undefined,
        appointment: appointmentId,
      });
      setLastNote(res.data);
      setNotaGuardada(true);
      return res;
    });
  };

  const finalizarConsulta = () => {
    finishSave.save(async () => {
      await actualizarStatus('completed');
      toast.success(`Consulta con ${nombrePaciente} finalizada.`);
      navigate('/agenda');
    });
  };

  const marcarNoAsistio = async () => {
    try {
      await actualizarStatus('no_show');
      toast.success('Cita marcada como no asistida.');
      navigate('/agenda');
    } catch (err) {
      throw { mensaje: getApiErrorMessage(err, 'No se pudo actualizar la cita.') };
    }
  };

  const cancelarCita = async () => {
    try {
      await actualizarStatus('cancelled');
      toast.success('Cita cancelada.');
      navigate('/agenda');
    } catch (err) {
      throw { mensaje: getApiErrorMessage(err, 'No se pudo cancelar la cita.') };
    }
  };

  if (loading) {
    return (
      <div className="space-y-5 animate-fade-up">
        <div className="skeleton h-8 w-48 rounded-xl" />
        <Card className="space-y-4">
          <div className="flex gap-4">
            <div className="skeleton w-16 h-16 rounded-2xl" />
            <div className="space-y-2 flex-1">
              <div className="skeleton h-6 w-48 rounded-lg" />
              <div className="skeleton h-4 w-32 rounded-lg" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={cargar}
        action={
          <Button as={Link} variant="outline" size="sm" to="/agenda" className="gap-2">
            <ArrowLeft size={13} strokeWidth={1.75} /> Volver a la agenda
          </Button>
        }
      />
    );
  }

  if (!appointment) {
    return (
      <EmptyState
        icon={<AlertCircle size={28} />}
        title="Cita no encontrada"
        action={
          <Button as={Link} variant="outline" size="sm" to="/agenda">
            ← Volver a la agenda
          </Button>
        }
      />
    );
  }

  if (!patient) {
    return (
      <EmptyState
        icon={<UserX size={28} />}
        title="Esta cita no tiene un paciente con expediente"
        description="Es una cita de invitado. La sesión de consulta necesita un expediente al que asociar la nota y las mediciones."
        action={
          <Button as={Link} variant="outline" size="sm" to="/agenda">
            ← Volver a la agenda
          </Button>
        }
      />
    );
  }

  const yaCerrada = appointment.status !== 'scheduled';

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center gap-2 text-xs text-[var(--ink-secondary)]">
        <button
          type="button"
          onClick={() => navigate('/agenda')}
          className="hover:text-[var(--ink)] transition-colors flex items-center gap-1"
        >
          <ArrowLeft size={13} strokeWidth={1.75} /> Agenda
        </button>
        <span aria-hidden>/</span>
        <span className="text-[var(--ink-muted)]">Consulta · {nombrePaciente}</span>
      </div>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl text-[var(--ink)] tracking-apple-tight">{nombrePaciente}</h1>
              <Badge variant={appointment.type === 'initial' ? 'info' : 'neutral'}>
                {TIPO_LABEL[appointment.type] || 'Consulta'}
              </Badge>
              {appointment.status === 'completed' && <Badge variant="success">Finalizada</Badge>}
              {appointment.status === 'no_show' && <Badge variant="warning">No asistió</Badge>}
              {appointment.status === 'cancelled' && <Badge variant="danger">Cancelada</Badge>}
            </div>
            <p className="mt-1 text-sm capitalize text-[var(--ink-muted)]">
              {fechaLarga(appointment.date)} · {appointment.time}
            </p>
          </div>

          {!yaCerrada && (
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setNoShowOpen(true)} className="gap-1.5">
                <UserX size={13} strokeWidth={1.75} /> No asistió
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCancelOpen(true)}
                className="gap-1.5 text-[var(--danger)] hover:bg-[rgba(196,30,22,0.08)]"
              >
                <Ban size={13} strokeWidth={1.75} /> Cancelar
              </Button>
              <Button
                size="sm"
                onClick={finalizarConsulta}
                loading={finishSave.saving}
                disabled={!notaGuardada}
                title={!notaGuardada ? 'Guarda la nota de la consulta (Análisis y Plan) antes de finalizar' : undefined}
                className="gap-1.5"
              >
                <CheckCircle2 size={14} strokeWidth={1.75} /> Finalizar consulta
              </Button>
            </div>
          )}
        </div>
        {finishSave.error ? (
          <p role="alert" className="mt-3 text-sm text-[var(--danger)]">
            {finishSave.error}
          </p>
        ) : null}
        {!yaCerrada && !notaGuardada ? (
          <p className="mt-3 text-xs text-[var(--ink-secondary)]">
            Guarda la nota de la consulta para poder finalizar.
          </p>
        ) : null}
      </Card>

      {yaCerrada ? (
        <Card>
          <p className="text-sm text-[var(--ink-muted)]">
            Esta cita ya se cerró
            {appointment.status === 'completed' ? ' como atendida' : ''}
            {appointment.status === 'no_show' ? ' como no asistida' : ''}
            {appointment.status === 'cancelled' ? ' como cancelada' : ''}. Los datos de esta visita se consultan
            desde el expediente del paciente.
          </p>
          <Button as={Link} variant="outline" size="sm" to={`/pacientes/${patient._id}/evolucion`} className="mt-3 gap-2">
            Ver expediente
          </Button>
        </Card>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1fr_300px] xl:items-start">
          <div className="min-w-0 space-y-4">
            <Disclosure
              title="Antropometría de hoy"
              description="Peso, talla y presión arterial de esta visita"
              icon={<HeartPulse size={18} strokeWidth={1.75} />}
              defaultOpen
            >
              <form onSubmit={guardarVitales} className="space-y-4">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Input
                    label="Peso (kg)"
                    type="number"
                    step="0.1"
                    value={vitales.peso}
                    onChange={(e) => setVitales((v) => ({ ...v, peso: e.target.value }))}
                  />
                  <Input
                    label="Talla (cm)"
                    type="number"
                    step="0.1"
                    value={vitales.talla}
                    onChange={(e) => setVitales((v) => ({ ...v, talla: e.target.value }))}
                  />
                  <Input
                    label="PA sistólica"
                    type="number"
                    value={vitales.paSis}
                    onChange={(e) => setVitales((v) => ({ ...v, paSis: e.target.value }))}
                  />
                  <Input
                    label="PA diastólica"
                    type="number"
                    value={vitales.paDia}
                    onChange={(e) => setVitales((v) => ({ ...v, paDia: e.target.value }))}
                  />
                </div>
                <Textarea
                  label="Nota rápida (opcional)"
                  rows={2}
                  value={vitales.nota}
                  onChange={(e) => setVitales((v) => ({ ...v, nota: e.target.value }))}
                />
                <SaveBar
                  saving={vitalesSave.saving}
                  saved={vitalesSave.saved}
                  error={vitalesSave.error}
                  label="Guardar medición"
                />
              </form>
            </Disclosure>

            <Disclosure
              title="Nota de la consulta (SOAP)"
              description="Se guarda ligada a esta cita — obligatoria para poder finalizar"
              icon={<NotebookPen size={18} strokeWidth={1.75} />}
              defaultOpen
            >
              <form onSubmit={guardarNota} className="space-y-4">
                <Textarea
                  label="S · Subjetivo"
                  helperText="Síntomas y reporte del paciente"
                  rows={2}
                  value={soap.subjective}
                  onChange={(e) => setSoap((s) => ({ ...s, subjective: e.target.value }))}
                />
                <Textarea
                  label="O · Objetivo"
                  helperText="Datos medibles de hoy"
                  rows={2}
                  value={soap.objective}
                  onChange={(e) => setSoap((s) => ({ ...s, objective: e.target.value }))}
                />
                <Textarea
                  label="A · Análisis"
                  required
                  rows={3}
                  value={soap.analysis}
                  onChange={(e) => setSoap((s) => ({ ...s, analysis: e.target.value }))}
                />
                <Textarea
                  label="P · Plan"
                  required
                  rows={3}
                  value={soap.plan}
                  onChange={(e) => setSoap((s) => ({ ...s, plan: e.target.value }))}
                />
                <Input
                  label="Próxima revisión (opcional)"
                  type="date"
                  value={soap.followUpDate}
                  onChange={(e) => setSoap((s) => ({ ...s, followUpDate: e.target.value }))}
                />
                <SaveBar
                  saving={soapSave.saving}
                  saved={soapSave.saved}
                  error={soapSave.error}
                  label="Guardar nota"
                  savedLabel="Nota guardada"
                />
              </form>
            </Disclosure>

            <Disclosure
              title="Plan de alimentación"
              description={mealPlan ? mealPlan.name || 'Plan sin nombre' : 'Este paciente no tiene un plan activo'}
              icon={<Salad size={18} strokeWidth={1.75} />}
            >
              {mealPlan ? (
                <div className="space-y-3">
                  {mealPlan.nutrition ? (
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="font-mono font-medium text-[var(--ink)]">
                        {Math.round(mealPlan.nutrition.totalCalories || 0)} kcal
                      </span>
                      <span className="text-[var(--ink-secondary)]">
                        P {Math.round(mealPlan.nutrition.protein || 0)}g · C{' '}
                        {Math.round(mealPlan.nutrition.carbohydrates || 0)}g · G{' '}
                        {Math.round(mealPlan.nutrition.fats || 0)}g
                      </span>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    <Button as={Link} variant="outline" size="sm" to={`/dietas/${mealPlan._id}/editar`}>
                      Ver / editar plan
                    </Button>
                    <Button as={Link} variant="ghost" size="sm" to={`/dietas/nueva?paciente=${patient._id}`}>
                      Crear plan nuevo
                    </Button>
                  </div>
                </div>
              ) : (
                <Button as={Link} size="sm" to={`/dietas/nueva?paciente=${patient._id}`} className="gap-1.5">
                  <Salad size={13} strokeWidth={1.75} /> Crear plan
                </Button>
              )}
            </Disclosure>

            <div className="flex justify-end">
              <Button as={Link} variant="outline" size="sm" to="/agenda/nueva" className="gap-1.5">
                <CalendarPlus size={14} strokeWidth={1.75} /> Agendar siguiente cita
              </Button>
            </div>
          </div>

          <div className="space-y-5 xl:sticky xl:top-24">
            <PatientAlertPanel patient={patient} />
            {lastNote ? (
              <Card className="space-y-1.5">
                <h2 className="section-title">Última nota</h2>
                <p className="text-xs text-[var(--ink-secondary)]">
                  {new Date(lastNote.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}
                </p>
                <p className="line-clamp-3 text-sm text-[var(--ink-muted)]">{lastNote.plan}</p>
              </Card>
            ) : null}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={noShowOpen}
        onClose={() => setNoShowOpen(false)}
        onConfirm={marcarNoAsistio}
        title="Marcar como no asistió"
        descripcion={`Se cerrará la cita de ${nombrePaciente} como "no asistió", sin nota ni mediciones. Podrás agendar una nueva cuando quieras.`}
        confirmLabel="Marcar como no asistió"
      />
      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={cancelarCita}
        title="Cancelar cita"
        descripcion={`Se cancelará la cita de ${nombrePaciente}. Esta acción no borra al paciente ni su historial.`}
        confirmLabel="Cancelar cita"
      />
    </div>
  );
}
