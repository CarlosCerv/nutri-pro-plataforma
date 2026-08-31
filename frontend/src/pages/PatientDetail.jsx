import { Suspense, lazy, useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, NavLink, useLocation, Link } from 'react-router-dom';
import {
  ArrowLeft, Edit3, Download, Salad, AlertCircle, RefreshCw, Trash2,
  User, Activity, Heart,
} from 'lucide-react';
import api from '../services/api';
import PatientAlertPanel from '../components/PatientAlertPanel';
import ConfirmDialog from '../design-system/components/ConfirmDialog.jsx';
import { useToast } from '../contexts/ToastContext';
import { patientsAPI } from '../services/api';
import { getApiErrorMessage } from '../lib/apiError';
import { Button, Card } from '../design-system/components';

const GeneralDataTab = lazy(() => import('./patient-tabs/GeneralDataTab'));
const EvolucionTab = lazy(() => import('./patient-tabs/EvolucionTab'));
const ClinicaTab = lazy(() => import('./patient-tabs/ClinicaTab'));
const PatientMealPlansTab = lazy(() => import('../components/PatientMealPlansTab'));

/**
 * Cuatro pestañas, antes siete.
 *
 * Mediciones, Laboratorio y Actividad física se recorren en la misma consulta
 * y se interpretan juntas, así que viven bajo "Evolución" en secciones
 * plegables. Clínica, Hábitos y las notas de consulta describen el mismo
 * cuadro y viven bajo "Clínica". "Dietas" se mantiene aparte porque es una
 * lista de planes, no un formulario de captura, y es donde vive la
 * exportación a PDF que sí funciona.
 */
const TABS = [
  { id: 'general', label: 'Resumen', icon: User, suffix: '' },
  { id: 'evolucion', label: 'Evolución', icon: Activity, suffix: 'evolucion' },
  { id: 'clinica', label: 'Clínica', icon: Heart, suffix: 'clinica' },
  { id: 'dietas', label: 'Dietas', icon: Salad, suffix: 'dietas' },
];

const calcIMC = (peso, talla) => {
  if (!peso || !talla) return null;
  return (peso / ((talla / 100) ** 2)).toFixed(1);
};

const clasificarIMC = (imc) => {
  if (!imc) return { cat: '—', color: 'var(--ink-secondary)' };
  const v = parseFloat(imc);
  if (v < 18.5) return { cat: 'Bajo peso', color: 'var(--chart-blue)' };
  if (v < 25) return { cat: 'Normal', color: 'var(--chart-green)' };
  if (v < 30) return { cat: 'Sobrepeso', color: 'var(--chart-orange)' };
  if (v < 35) return { cat: 'Obesidad I', color: 'var(--chart-red)' };
  if (v < 40) return { cat: 'Obesidad II', color: 'var(--chart-red)' };
  return { cat: 'Obesidad III', color: 'var(--chart-red)' };
};

const calcEdad = (dob) => {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob);
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

const sexLabel = (sex) => {
  if (sex === 'M' || sex === 'male' || sex === 'Masculino') return 'Masculino';
  if (sex === 'F' || sex === 'female' || sex === 'Femenino') return 'Femenino';
  return sex || '—';
};

function tabFromPath(pathname, id) {
  const base = `/pacientes/${id}`;
  if (pathname === base || pathname === `${base}/`) return 'general';
  const rest = pathname.slice(base.length + 1);
  const hit = TABS.find((t) => t.suffix && t.suffix === rest);
  return hit ? hit.id : 'general';
}

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmarBorrado, setConfirmarBorrado] = useState(false);
  const toast = useToast();

  const activeTab = useMemo(() => tabFromPath(pathname, id), [pathname, id]);

  // Un expediente clínico no puede inventar al paciente cuando la API falla:
  // antes este catch sustituía la respuesta por una ficha ficticia, y el
  // nutriólogo terminaba leyendo (y editando) datos que no eran de nadie.
  const fetchPatient = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/patients/${id}`);
      setPatient(res.data.data || res.data);
    } catch (err) {
      setPatient(null);
      setError(getApiErrorMessage(err, 'No se pudo cargar el expediente.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-up">
        <div className="skeleton h-8 w-48 rounded-xl" />
        <Card className="space-y-4">
          <div className="flex gap-4">
            <div className="skeleton w-20 h-20 rounded-2xl" />
            <div className="space-y-2 flex-1">
              <div className="skeleton h-6 w-48 rounded-lg" />
              <div className="skeleton h-4 w-32 rounded-lg" />
              <div className="skeleton h-4 w-64 rounded-lg" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state" role="alert">
        <div className="empty-state-icon">
          <AlertCircle size={28} />
        </div>
        <div className="text-sm text-[var(--ink-muted)]">{error}</div>
        <div className="flex gap-2">
          <Button size="sm" type="button" onClick={fetchPatient} className="gap-2">
            <RefreshCw size={14} />
            Reintentar
          </Button>
          <Button as={Link} variant="outline" size="sm" to="/pacientes">
            Volver a pacientes
          </Button>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <User size={28} />
        </div>
        <div className="text-sm text-[var(--ink-muted)]">Paciente no encontrado</div>
        <Button as={Link} variant="outline" size="sm" to="/pacientes">
          ← Volver
        </Button>
      </div>
    );
  }

  const imc = calcIMC(patient.lastWeight, patient.height);
  const imcInfo = clasificarIMC(imc);
  const edad = calcEdad(patient.dob);
  const nombre = `${patient.firstName} ${patient.lastName}`;
  const initials = nombre
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  // El avatar no codifica información clínica: superficie neutra, no una
  // paleta de cuatro colores que el usuario podría leer como un estado.
  const avatarColor = 'var(--surface-strong)';

  const borrarPaciente = async () => {
    try {
      await patientsAPI.delete(id);
      toast.success(`${nombre} fue eliminado.`);
      navigate('/pacientes');
    } catch (err) {
      throw { mensaje: getApiErrorMessage(err, 'No se pudo eliminar al paciente.') };
    }
  };

  const TAB_COMPONENTS = {
    general: GeneralDataTab,
    evolucion: EvolucionTab,
    clinica: ClinicaTab,
  };
  const ActiveTabComponent = TAB_COMPONENTS[activeTab] || GeneralDataTab;

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center gap-2 text-xs text-[var(--ink-secondary)]">
        <button
          type="button"
          onClick={() => navigate('/pacientes')}
          className="hover:text-[var(--ink)] transition-colors flex items-center gap-1"
        >
          <ArrowLeft size={13} strokeWidth={1.75} /> Pacientes
        </button>
        <span aria-hidden>/</span>
        <span className="text-[var(--ink-muted)]">{nombre}</span>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="flex-shrink-0">
            <div
              className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center text-2xl font-semibold font-display text-[var(--ink)]"
              style={{ background: avatarColor }}
            >
              {patient.photoUrl ? (
                <img src={patient.photoUrl} alt="" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                initials
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-3 mb-2">
              <h1 className="font-display text-2xl text-[var(--ink)] tracking-apple-tight">{nombre}</h1>
              <span
                className={`badge self-center ${patient.active !== false ? 'badge-success' : 'badge-neutral'}`}
              >
                {patient.active !== false ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-[var(--ink-muted)]">
              {edad != null && <span>{edad} años</span>}
              <span>{sexLabel(patient.sex)}</span>
              {patient.email && <span>{patient.email}</span>}
              {patient.phone && <span>{patient.phone}</span>}
            </div>
            {patient.objective && (
              <div className="mt-2">
                <span className="badge badge-neutral">{patient.objective}</span>
              </div>
            )}
          </div>

          <div className="flex gap-4 flex-wrap sm:flex-nowrap">
            {[
              { label: 'Peso', value: patient.lastWeight ? `${patient.lastWeight} kg` : '—', color: 'var(--chart-green)' },
              { label: 'Talla', value: patient.height ? `${patient.height} cm` : '—', color: 'var(--chart-orange)' },
              { label: 'IMC', value: imc || '—', sub: imcInfo.cat, color: imcInfo.color },
            ].map((k) => (
              <div
                key={k.label}
                className="text-center px-4 py-2 rounded-xl bg-[var(--surface-alt)] border border-[var(--border-soft)] min-w-[70px]"
              >
                <div className="font-mono text-lg font-medium" style={{ color: k.color }}>
                  {k.value}
                </div>
                <div className="text-2xs text-[var(--ink-secondary)] mt-0.5">{k.label}</div>
                {k.sub && (
                  <div className="text-2xs mt-0.5 font-semibold" style={{ color: k.color }}>
                    {k.sub}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 sm:flex-col sm:justify-start">
            <Button as={Link} variant="ghost" size="sm" to={`/pacientes/${id}/editar`} className="gap-1.5">
              <Edit3 size={13} strokeWidth={1.75} /> Editar
            </Button>
            <Button as={Link} variant="outline" size="sm" to={`/dietas/nueva?paciente=${id}`} className="gap-1.5">
              <Salad size={13} strokeWidth={1.75} /> Nueva dieta
            </Button>
            {/* La exportación a PDF vive en la pestaña de dietas, junto al plan
                que se exporta (hooks/usePDFExport.js). Antes este botón no
                tenía onClick y no hacía absolutamente nada. */}
            <Button as={Link} variant="secondary" size="sm" to={`/pacientes/${id}/dietas`} className="gap-1.5">
              <Download size={13} strokeWidth={1.75} /> Exportar PDF
            </Button>
            {/* `patientsAPI.delete` existía sin que ninguna pantalla lo
                expusiera: no había forma de dar de baja a un paciente. */}
            <Button variant="ghost" size="sm"
              type="button"
              onClick={() => setConfirmarBorrado(true)} className="gap-1.5 text-[var(--danger)] hover:bg-[rgba(196,30,22,0.08)]">
              <Trash2 size={13} strokeWidth={1.75} /> Eliminar
            </Button>
          </div>
        </div>
      </Card>

      <div className="overflow-x-auto no-scrollbar">
        <div className="tabs-nav min-w-max">
          {TABS.map((t) => {
            const to = t.suffix ? `/pacientes/${id}/${t.suffix}` : `/pacientes/${id}`;
            return (
              <NavLink
                key={t.id}
                to={to}
                end={t.id === 'general'}
                className={({ isActive }) =>
                  `tab-btn flex items-center gap-2 ${isActive ? 'active' : ''}`
                }
              >
                <t.icon size={14} strokeWidth={1.75} />
                {t.label}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* El panel de datos críticos acompaña a todas las pestañas: alergias,
          patologías y medicamentos pueden cambiar una decisión clínica en
          cualquier momento de la consulta, y antes estaban enterrados dentro
          de dos pestañas distintas. */}
      <div className="grid gap-5 xl:grid-cols-[1fr_300px] xl:items-start">
        <div key={activeTab} className="min-w-0 animate-fade-up">
          <Suspense
            fallback={
              <Card className="space-y-3">
                <div className="skeleton h-6 w-40 rounded-lg" />
                <div className="skeleton h-24 w-full rounded-2xl" />
                <div className="skeleton h-24 w-full rounded-2xl" />
              </Card>
            }
          >
            {activeTab === 'dietas' ? (
              <PatientMealPlansTab patientId={id} patient={patient} />
            ) : (
              <ActiveTabComponent patient={patient} onUpdate={setPatient} />
            )}
          </Suspense>
        </div>

        <div className="xl:sticky xl:top-24">
          <PatientAlertPanel patient={patient} />
        </div>
      </div>

      <ConfirmDialog
        open={confirmarBorrado}
        onClose={() => setConfirmarBorrado(false)}
        onConfirm={borrarPaciente}
        title="Eliminar paciente"
        descripcion={`Se eliminará el expediente de ${nombre} de forma permanente: sus mediciones, laboratorios, notas clínicas y planes asociados dejarán de ser accesibles. Esta acción no se puede deshacer.`}
      />
    </div>
  );
}
