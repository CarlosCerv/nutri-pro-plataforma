import { Suspense, lazy, useState, useEffect } from 'react';
import {
  Users, CalendarCheck, Salad, TrendingUp, TrendingDown,
  Activity, Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const DashboardInsights = lazy(() => import('../components/Dashboard/DashboardInsights'));

// ── Componentes de UI reutilizables ──────────────────────────────

const KPICard = ({ label, value, delta, deltaLabel, icon, color, loading }) => {
  const IconComponent = icon;

  return (
  <div className="kpi-card group">
    {/* Decorative glow */}
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`}
      style={{ background: `radial-gradient(circle at top right, ${color}10, transparent 70%)` }} />

    <div className="relative flex items-start justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center`}
        style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
        <IconComponent size={18} style={{ color }} />
      </div>
      {delta !== undefined && (
        <div className={`kpi-delta ${delta >= 0 ? 'kpi-delta-up' : 'kpi-delta-down'}`}>
          {delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{Math.abs(delta)}%</span>
        </div>
      )}
    </div>

    {loading ? (
      <div className="space-y-2">
        <div className="skeleton h-8 w-24 rounded-lg" />
        <div className="skeleton h-3 w-32 rounded" />
      </div>
    ) : (
      <>
        <div className="kpi-value" style={{ color }}>{value ?? '—'}</div>
        <div className="kpi-label mt-1.5">{label}</div>
        {deltaLabel && (
          <div className="mt-1 text-xs text-white/30">{deltaLabel}</div>
        )}
      </>
    )}
  </div>
  );
};

// ── Dashboard Page ────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/dashboard/stats');
        setStats(res.data.data);
      } catch {
        // Usar mock data si la API no responde
        setStats({
          pacientesActivos: 47, pacientesDelta: 12,
          consultasMes: 89,     consultasDelta: 8,
          dietasTotal: 234,     dietasDelta: 5,
          apegoProm: 78,        apegoDelta: -3,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const horaActual = new Date().getHours();
  const saludo = horaActual < 12 ? 'Buenos días' : horaActual < 19 ? 'Buenas tardes' : 'Buenas noches';
  const nombreCorto = user?.name?.split(' ')[0] || 'Nutriólogo';

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title font-display text-2xl md:text-3xl">
            {saludo}, {nombreCorto} 👋
          </h1>
          <p className="text-sm text-white/30 mt-0.5">
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/pacientes/nuevo" className="btn btn-outline btn-sm gap-1.5">
            <Plus size={14} /> Paciente
          </Link>
          <Link to="/dietas/nueva" className="btn btn-primary btn-sm gap-1.5">
            <Plus size={14} /> Nueva Dieta
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard label="Pacientes activos" value={stats?.pacientesActivos}
          delta={stats?.pacientesDelta} deltaLabel="vs. mes anterior"
          icon={Users} color="#2ECC8E" loading={loading} />
        <KPICard label="Consultas este mes" value={stats?.consultasMes}
          delta={stats?.consultasDelta} deltaLabel="vs. mes anterior"
          icon={CalendarCheck} color="#E8C96A" loading={loading} />
        <KPICard label="Dietas generadas" value={stats?.dietasTotal}
          delta={stats?.dietasDelta} deltaLabel="total acumulado"
          icon={Salad} color="#3B82F6" loading={loading} />
        <KPICard label="Apego promedio" value={stats?.apegoProm ? `${stats.apegoProm}%` : null}
          delta={stats?.apegoDelta} deltaLabel="promedio de pacientes"
          icon={Activity} color="#A855F7" loading={loading} />
      </div>

      <Suspense
        fallback={
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 card"><div className="skeleton h-[280px] w-full rounded-2xl" /></div>
              <div className="card"><div className="skeleton h-[280px] w-full rounded-2xl" /></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="card"><div className="skeleton h-[220px] w-full rounded-2xl" /></div>
              <div className="lg:col-span-2 card"><div className="skeleton h-[220px] w-full rounded-2xl" /></div>
            </div>
            <div className="card"><div className="skeleton h-[240px] w-full rounded-2xl" /></div>
          </div>
        }
      >
        <DashboardInsights />
      </Suspense>
    </div>
  );
}
