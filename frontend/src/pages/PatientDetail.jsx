import { Suspense, lazy, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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

const TABS = [
  { id: 'general',   label: 'General',          icon: User          },
  { id: 'mediciones',label: 'Mediciones',        icon: Activity      },
  { id: 'habitos',   label: 'Hábitos',           icon: Apple         },
  { id: 'clinica',   label: 'Clínica',           icon: Heart         },
  { id: 'laboratorio',label: 'Laboratorio',      icon: FlaskConical  },
  { id: 'actividad', label: 'Act. Física',       icon: Dumbbell      },
];

const calcIMC = (peso, talla) => {
  if (!peso || !talla) return null;
  return (peso / ((talla / 100) ** 2)).toFixed(1);
};

const clasificarIMC = (imc) => {
  if (!imc) return { cat: '—', color: '#fff' };
  const v = parseFloat(imc);
  if (v < 18.5) return { cat: 'Bajo peso',   color: '#3B82F6' };
  if (v < 25)   return { cat: 'Normal',       color: '#2ECC8E' };
  if (v < 30)   return { cat: 'Sobrepeso',    color: '#F59E0B' };
  if (v < 35)   return { cat: 'Obesidad I',   color: '#EF4444' };
  if (v < 40)   return { cat: 'Obesidad II',  color: '#DC2626' };
  return             { cat: 'Obesidad III', color: '#991B1B' };
};

const calcEdad = (dob) => {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob);
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

export default function PatientDetail({ tab: tabProp }) {
  const { id }          = useParams();
  const navigate        = useNavigate();
  const [patient, setPatient]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState(tabProp || 'general');

  const fetchPatient = useCallback(async () => {
    try {
      const res = await api.get(`/api/patients/${id}`);
      setPatient(res.data.data || res.data);
    } catch {
      // Mock
      setPatient({
        _id: id,
        firstName: 'María', lastName: 'González',
        email: 'maria@email.com', phone: '3310001111',
        dob: '1990-06-15', sex: 'F',
        lastWeight: 72.4, height: 165,
        objective: 'Bajar de peso',
        active: true,
        createdAt: '2025-01-10',
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchPatient(); }, [fetchPatient]);
  useEffect(() => { if (tabProp) setActiveTab(tabProp); }, [tabProp]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-up">
        <div className="skeleton h-8 w-48 rounded-xl" />
        <div className="card space-y-4">
          <div className="flex gap-4">
            <div className="skeleton w-20 h-20 rounded-2xl" />
            <div className="space-y-2 flex-1">
              <div className="skeleton h-6 w-48 rounded-lg" />
              <div className="skeleton h-4 w-32 rounded" />
              <div className="skeleton h-4 w-64 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon"><User size={28} /></div>
        <div className="text-sm text-white/50">Paciente no encontrado</div>
        <Link to="/pacientes" className="btn btn-outline btn-sm">← Volver</Link>
      </div>
    );
  }

  const imc     = calcIMC(patient.lastWeight, patient.height);
  const imcInfo = clasificarIMC(imc);
  const edad    = calcEdad(patient.dob);
  const nombre  = `${patient.firstName} ${patient.lastName}`;
  const initials = nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const COLORS = ['#2ECC8E', '#E8C96A', '#3B82F6', '#A855F7'];
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
      {/* Breadcrumb + Back */}
      <div className="flex items-center gap-2 text-xs text-white/30">
        <button onClick={() => navigate('/pacientes')} className="hover:text-white transition-colors flex items-center gap-1">
          <ArrowLeft size={13} /> Pacientes
        </button>
        <span>/</span>
        <span className="text-white/60">{nombre}</span>
      </div>

      {/* Header Card del Paciente */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-5">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center text-2xl font-bold font-display text-navy-950"
              style={{ background: avatarColor }}>
              {patient.photoUrl
                ? <img src={patient.photoUrl} alt={nombre} className="w-full h-full object-cover rounded-2xl" />
                : initials
              }
            </div>
          </div>

          {/* Info principal */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-3 mb-2">
              <h1 className="font-display text-2xl text-white">{nombre}</h1>
              <span className={`badge ${patient.active !== false ? 'badge-success' : 'badge-neutral'} self-center`}>
                {patient.active !== false ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-white/40">
              {edad && <span>{edad} años</span>}
              <span>{patient.sex === 'M' ? 'Masculino' : 'Femenino'}</span>
              {patient.email && <span>{patient.email}</span>}
              {patient.phone && <span>{patient.phone}</span>}
            </div>
            {patient.objective && (
              <div className="mt-2">
                <span className="badge badge-gold">{patient.objective}</span>
              </div>
            )}
          </div>

          {/* KPIs rápidos */}
          <div className="flex gap-4 flex-wrap sm:flex-nowrap">
            {[
              { label: 'Peso',   value: patient.lastWeight ? `${patient.lastWeight} kg` : '—', color: '#2ECC8E' },
              { label: 'Talla',  value: patient.height     ? `${patient.height} cm`     : '—', color: '#E8C96A' },
              { label: 'IMC',    value: imc || '—',  sub: imcInfo.cat,                  color: imcInfo.color },
            ].map(k => (
              <div key={k.label} className="text-center px-4 py-2 rounded-xl bg-navy-800/60 border border-navy-700/50 min-w-[70px]">
                <div className="font-mono text-lg font-medium" style={{ color: k.color }}>{k.value}</div>
                <div className="text-2xs text-white/30 mt-0.5">{k.label}</div>
                {k.sub && <div className="text-2xs mt-0.5 font-semibold" style={{ color: k.color }}>{k.sub}</div>}
              </div>
            ))}
          </div>

          {/* Acciones */}
          <div className="flex flex-wrap gap-2 sm:flex-col sm:justify-start">
            <Link to={`/pacientes/${id}/editar`} className="btn btn-ghost btn-sm gap-1.5">
              <Edit3 size={13} /> Editar
            </Link>
            <Link to={`/dietas/nueva?paciente=${id}`} className="btn btn-outline btn-sm gap-1.5">
              <Salad size={13} /> Nueva dieta
            </Link>
            <button className="btn btn-secondary btn-sm gap-1.5">
              <Download size={13} /> PDF
            </button>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="overflow-x-auto no-scrollbar">
        <div className="tabs-nav min-w-max">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`tab-btn flex items-center gap-2 ${activeTab === t.id ? 'active' : ''}`}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
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
          <ActiveTabComponent patient={patient} onUpdate={setPatient} />
        </Suspense>
      </div>
    </div>
  );
}
