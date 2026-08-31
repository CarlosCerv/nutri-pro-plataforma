import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardList, Loader } from 'lucide-react';
import { preConsultationAPI } from '../../services/publicApi';
import { getApiErrorMessage } from '../../lib/apiError';
import { Button, Input, Textarea } from '../../design-system/components';
import { ErrorState, LoadingState } from '../../design-system/components/StateViews';
import PublicPageShell from './PublicPageShell';

const FORM_VACIO = {
  antFamDM: false, antFamHTA: false, antFamObesidad: false, antFamCancer: false,
  antPersonales: '', cirugiasPrevias: '',
  alergias: '', intolerancias: '', medicamentos: '',
  horasSueno: '', nivelEstres: '', ocupacion: '', horasLaboral: '', tabaquismo: '', alcoholismo: '',
  preferencias: '', disgustos: '', objetivoAlim: '',
  recordatorio24h: '',
};

const CasillaHeredofamiliar = ({ label, checked, onChange }) => (
  <label className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-m)] border border-[var(--border-soft)] px-4 py-3 transition-colors duration-micro hover:bg-[var(--surface-alt)]">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
    <span className="text-sm text-[var(--ink-muted)]">{label}</span>
  </label>
);

CasillaHeredofamiliar.propTypes = {
  label: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

/**
 * Wizard público del cuestionario pre-consulta.
 *
 * Sin sesión: valida el token contra `/api/public/pre-consultation/:token` al
 * montar, y el envío consume ese mismo token (un solo uso). El progreso vive
 * solo en memoria — si el paciente cierra la pestaña a medio wizard, tiene
 * que volver a pedir el enlace, que es la misma garantía de un solo uso que
 * ya ofrece el token.
 */
export default function PreConsultationWizard() {
  const { token } = useParams();
  const [estado, setEstado] = useState('cargando'); // cargando | listo | error | enviado
  const [errorMsg, setErrorMsg] = useState('');
  const [contexto, setContexto] = useState(null);
  const [paso, setPaso] = useState(0);
  const [form, setForm] = useState(FORM_VACIO);
  const [enviando, setEnviando] = useState(false);
  const [enviarError, setEnviarError] = useState('');

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const res = await preConsultationAPI.get(token);
        if (!cancelado) {
          setContexto(res.data?.data || null);
          setEstado('listo');
        }
      } catch (err) {
        if (!cancelado) {
          setErrorMsg(getApiErrorMessage(err, 'Este enlace no es válido.'));
          setEstado('error');
        }
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [token]);

  const set = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));

  const PASOS = useMemo(
    () => [
      { titulo: 'Antecedentes familiares', descripcion: '¿Alguien en tu familia directa ha tenido...?' },
      { titulo: 'Alergias y medicamentos', descripcion: 'Lo que debemos saber antes de tu consulta' },
      { titulo: 'Estilo de vida', descripcion: 'Sueño, estrés y actividad diaria' },
      { titulo: 'Preferencias alimentarias', descripcion: 'Lo que te gusta y lo que evitas' },
      { titulo: 'Recordatorio de 24 horas', descripcion: 'Cuéntanos qué comiste ayer, con el detalle que recuerdes' },
    ],
    []
  );

  const totalPasos = PASOS.length;
  const progreso = Math.round(((paso + 1) / totalPasos) * 100);

  const siguiente = () => setPaso((p) => Math.min(p + 1, totalPasos - 1));
  const anterior = () => setPaso((p) => Math.max(p - 1, 0));

  const enviar = async () => {
    setEnviando(true);
    setEnviarError('');
    try {
      const payload = { ...form };
      // Los numéricos vacíos no deben viajar como cadena: el validador del
      // servidor los rechazaría al no ser un float.
      ['horasSueno', 'nivelEstres', 'horasLaboral', 'tabaquismo', 'alcoholismo'].forEach((c) => {
        payload[c] = payload[c] === '' ? undefined : Number(payload[c]);
      });
      await preConsultationAPI.submit(token, payload);
      setEstado('enviado');
    } catch (err) {
      setEnviarError(getApiErrorMessage(err, 'No se pudo guardar tu cuestionario. Intenta de nuevo.'));
    } finally {
      setEnviando(false);
    }
  };

  if (estado === 'cargando') {
    return (
      <PublicPageShell eyebrow="Cuestionario pre-consulta">
        <LoadingState label="Abriendo tu cuestionario…" />
      </PublicPageShell>
    );
  }

  if (estado === 'error') {
    return (
      <PublicPageShell eyebrow="Cuestionario pre-consulta">
        <div className="card p-8" style={{ borderRadius: 'var(--radius-l)' }}>
          <ErrorState message={errorMsg} />
        </div>
      </PublicPageShell>
    );
  }

  if (estado === 'enviado') {
    return (
      <PublicPageShell eyebrow="Cuestionario pre-consulta">
        <div className="card flex flex-col items-center gap-3 p-10 text-center" style={{ borderRadius: 'var(--radius-l)' }}>
          <CheckCircle2 size={40} className="text-[var(--success)]" />
          <h1 className="text-xl font-semibold text-[var(--ink)]">¡Listo, {contexto?.patientFirstName}!</h1>
          <p className="max-w-sm text-sm text-[var(--ink-muted)]">
            Tu información llegó a {contexto?.nutritionistName}. Nos vemos en tu próxima consulta.
          </p>
        </div>
      </PublicPageShell>
    );
  }

  return (
    <PublicPageShell eyebrow="Cuestionario pre-consulta">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[var(--ink-secondary)]">
          <span className="flex items-center gap-1.5">
            <ClipboardList size={14} /> Paso {paso + 1} de {totalPasos}
          </span>
          <span>{progreso}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-strong)]">
          <div
            className="h-full rounded-full transition-all duration-layout"
            style={{ width: `${progreso}%`, background: 'var(--accent)' }}
          />
        </div>
      </div>

      <div className="card p-6 sm:p-8" style={{ borderRadius: 'var(--radius-l)' }}>
        <h1 className="text-xl font-semibold text-[var(--ink)]">{PASOS[paso].titulo}</h1>
        <p className="mt-1 text-sm text-[var(--ink-secondary)]">{PASOS[paso].descripcion}</p>

        <div className="mt-6 space-y-4">
          {paso === 0 && (
            <>
              <div className="grid gap-2 sm:grid-cols-2">
                <CasillaHeredofamiliar label="Diabetes" checked={form.antFamDM} onChange={(v) => set('antFamDM', v)} />
                <CasillaHeredofamiliar label="Hipertensión" checked={form.antFamHTA} onChange={(v) => set('antFamHTA', v)} />
                <CasillaHeredofamiliar label="Obesidad" checked={form.antFamObesidad} onChange={(v) => set('antFamObesidad', v)} />
                <CasillaHeredofamiliar label="Cáncer" checked={form.antFamCancer} onChange={(v) => set('antFamCancer', v)} />
              </div>
              <Textarea
                label="Antecedentes personales relevantes"
                placeholder="Enfermedades que tú mismo has tenido…"
                value={form.antPersonales}
                onChange={(e) => set('antPersonales', e.target.value)}
              />
              <Textarea
                label="Cirugías previas"
                value={form.cirugiasPrevias}
                onChange={(e) => set('cirugiasPrevias', e.target.value)}
              />
            </>
          )}

          {paso === 1 && (
            <>
              <Input label="Alergias" placeholder="Ej. mariscos, penicilina" value={form.alergias} onChange={(e) => set('alergias', e.target.value)} />
              <Input label="Intolerancias" placeholder="Ej. lactosa, gluten" value={form.intolerancias} onChange={(e) => set('intolerancias', e.target.value)} />
              <Textarea label="Medicamentos que tomas actualmente" value={form.medicamentos} onChange={(e) => set('medicamentos', e.target.value)} />
            </>
          )}

          {paso === 2 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Horas de sueño" type="number" min={0} max={24} value={form.horasSueno} onChange={(e) => set('horasSueno', e.target.value)} />
                <Input label="Nivel de estrés (0-10)" type="number" min={0} max={10} value={form.nivelEstres} onChange={(e) => set('nivelEstres', e.target.value)} />
                <Input label="Ocupación" value={form.ocupacion} onChange={(e) => set('ocupacion', e.target.value)} />
                <Input label="Horas laborales al día" type="number" min={0} max={24} value={form.horasLaboral} onChange={(e) => set('horasLaboral', e.target.value)} />
                <Input label="Cigarros al día" type="number" min={0} value={form.tabaquismo} onChange={(e) => set('tabaquismo', e.target.value)} />
                <Input label="Bebidas alcohólicas por semana" type="number" min={0} value={form.alcoholismo} onChange={(e) => set('alcoholismo', e.target.value)} />
              </div>
            </>
          )}

          {paso === 3 && (
            <>
              <Textarea label="Alimentos que te gustan" value={form.preferencias} onChange={(e) => set('preferencias', e.target.value)} />
              <Textarea label="Alimentos que evitas o no te gustan" value={form.disgustos} onChange={(e) => set('disgustos', e.target.value)} />
              <Textarea label="¿Qué esperas lograr con tu alimentación?" value={form.objetivoAlim} onChange={(e) => set('objetivoAlim', e.target.value)} />
            </>
          )}

          {paso === 4 && (
            <>
              <Textarea
                label="Todo lo que comiste y bebiste ayer"
                helperText="Incluye horarios aproximados, cantidades y cómo se preparó cada alimento."
                rows={8}
                value={form.recordatorio24h}
                onChange={(e) => set('recordatorio24h', e.target.value)}
              />
              {enviarError ? (
                <p role="alert" className="text-sm text-[var(--danger)]">{enviarError}</p>
              ) : null}
            </>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button variant="ghost" type="button" onClick={anterior} disabled={paso === 0} className="gap-1.5">
            <ArrowLeft size={16} /> Atrás
          </Button>
          {paso < totalPasos - 1 ? (
            <Button type="button" onClick={siguiente} className="gap-1.5">
              Siguiente <ArrowRight size={16} />
            </Button>
          ) : (
            <Button type="button" onClick={enviar} disabled={enviando} className="gap-2">
              {enviando ? <Loader className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
              Enviar cuestionario
            </Button>
          )}
        </div>
      </div>
    </PublicPageShell>
  );
}
