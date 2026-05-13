import { Suspense, lazy, useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, NavLink, useLocation, Link } from 'react-router-dom';
import {
  ArrowLeft, Edit3, Download, Salad,
  User, Activity, FlaskConical, Heart, Apple, Dumbbell,
} from 'lucide-react';
import api from '../services/api';

const GeneralDataTab = lazy(() => import('./patient-tabs/GeneralDataTab'));
const MeasurementsTab = lazy(() => import('./patient-tabs/MeasurementsTab'));
const FoodHabitsTab = lazy(() => import('./patient-tabs/FoodHabitsTab'));
const ClinicalTab = lazy(() => import('./patient-tabs/ClinicalTab'));
const LaboratoryTab = lazy(() => import('./patient-tabs/LaboratoryTab'));
const PhysicalActivityTab = lazy(() => import('./patient-tabs/PhysicalActivityTab'));
const PatientMealPlansTab = lazy(() => import('../components/PatientMealPlansTab'));

const TABS = [
  { id: 'general', label: 'General', icon: User, suffix: '' },
  { id: 'mediciones', label: 'Mediciones', icon: Activity, suffix: 'mediciones' },
  { id: 'habitos', label: 'Hábitos', icon: Apple, suffix: 'habitos' },
  { id: 'clinica', label: 'Clínica', icon: Heart, suffix: 'clinica' },
  { id: 'laboratorio', label: 'Laboratorio', icon: FlaskConical, suffix: 'laboratorio' },
  { id: 'actividad', label: 'Act. física', icon: Dumbbell, suffix: 'actividad' },
  { id: 'dietas', label: 'Dietas', icon: Salad, suffix: 'dietas' },
];

const calcIMC = (peso, talla) => {
  if (!peso || !talla) return null;
  return (peso / ((talla / 100) ** 2)).toFixed(1);
};

const clasificarIMC = (imc) => {
  if (!imc) return { cat: '—', color: 'var(--text-tertiary)' };
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

  const activeTab = useMemo(() => tabFromPath(pathname, id), [pathname, id]);

  const fetchPatient = useCallback(async () => {
    try {
      const res = await api.get(`/api/patients/${id}`);
      setPatient(res.data.data || res.data);
    } catch {
      setPatient({
        _id: id,
        firstName: 'María',
        lastName: 'González',
        email: 'maria@email.com',
        phone: '3310001111',
        dob: '1990-06-15',
        sex: 'F',
        lastWeight: 72.4,
        height: 165,
        objective: 'Bajar de peso',
        active: true,
        createdAt: '2025-01-10',
      });
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
        <div className="card space-y-4">
          <div className="flex gap-4">
            <div className="skeleton w-20 h-20 rounded-2xl" />
            <div className="space-y-2 flex-1">
              <div className="skeleton h-6 w-48 rounded-lg" />
              <div className="skeleton h-4 w-32 rounded-lg" />
              <div className="skeleton h-4 w-64 rounded-lg" />
            </div>
          </div>
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
        <div className="text-sm text-[var(--text-secondary)]">Paciente no encontrado</div>
        <Link to="/pacientes" className="btn btn-outline btn-sm">
          ← Volver
        </Link>
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
  const COLORS = ['var(--chart-green)', 'var(--chart-orange)', 'var(--chart-blue)', '#7C3AED'];
  const avatarColor = COLORS[(patient.firstName?.charCodeAt(0) || 0) % COLORS.length];

  const TAB_COMPONENTS = {
    general: GeneralDataTab,
    mediciones: MeasurementsTab,
    habitos: FoodHabitsTab,
    clinica: ClinicalTab,
    laboratorio: LaboratoryTab,
    actividad: PhysicalActivityTab,
  };
  const ActiveTabComponent = TAB_COMPONENTS[activeTab] || GeneralDataTab;

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
        <button
          type="button"
          onClick={() => navigate('/pacientes')}
          className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1"
        >
          <ArrowLeft size={13} strokeWidth={1.75} /> Pacientes
        </button>
        <span aria-hidden>/</span>
        <span className="text-[var(--text-secondary)]">{nombre}</span>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="flex-shrink-0">
            <div
              className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center text-2xl font-semibold font-display text-white"
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
              <h1 className="font-display text-2xl text-[var(--text-primary)] tracking-apple-tight">{nombre}</h1>
              <span
                className={`badge self-center ${patient.active !== false ? 'badge-success' : 'badge-neutral'}`}
              >
                {patient.active !== false ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-[var(--text-secondary)]">
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
                className="text-center px-4 py-2 rounded-xl bg-[var(--surface-muted)] border border-[var(--border-soft)] min-w-[70px]"
              >
                <div className="font-mono text-lg font-medium" style={{ color: k.color }}>
                  {k.value}
                </div>
                <div className="text-2xs text-[var(--text-tertiary)] mt-0.5">{k.label}</div>
                {k.sub && (
                  <div className="text-2xs mt-0.5 font-semibold" style={{ color: k.color }}>
                    {k.sub}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 sm:flex-col sm:justify-start">
            <Link to={`/pacientes/${id}/editar`} className="btn btn-ghost btn-sm gap-1.5">
              <Edit3 size={13} strokeWidth={1.75} /> Editar
            </Link>
            <Link to={`/dietas/nueva?paciente=${id}`} className="btn btn-outline btn-sm gap-1.5">
              <Salad size={13} strokeWidth={1.75} /> Nueva dieta
            </Link>
            <button type="button" className="btn btn-secondary btn-sm gap-1.5">
              <Download size={13} strokeWidth={1.75} /> PDF
            </button>
          </div>
        </div>
      </div>

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

      <div key={activeTab} className="animate-fade-up">
        <Suspense
          fallback={
            <div className="card space-y-3">
              <div className="skeleton h-6 w-40 rounded-lg" />
              <div className="skeleton h-24 w-full rounded-2xl" />
              <div className="skeleton h-24 w-full rounded-2xl" />
            </div>
          }
        >
          {activeTab === 'dietas' ? (
            <PatientMealPlansTab patientId={id} patient={patient} />
          ) : (
            <ActiveTabComponent patient={patient} onUpdate={setPatient} />
          )}
        </Suspense>
      </div>
    </div>
  );
}
