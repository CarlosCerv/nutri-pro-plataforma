import { Suspense, lazy, useEffect, useState } from 'react';
import { Users, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { dashboardAPI, paymentsAPI } from '../services/api';
import { getApiErrorMessage } from '../lib/apiError';
import Card from '../design-system/components/Card';
import ConsultaHoyHero from '../components/Dashboard/ConsultaHoyHero';
import RetencionRadar from '../components/Dashboard/RetencionRadar';

const DashboardInsights = lazy(() => import('../components/Dashboard/DashboardInsights'));
const RadarEpidemiologico = lazy(() => import('../components/Dashboard/RadarEpidemiologico'));

const pesos = (n) => `$${Math.round(n || 0).toLocaleString('es-MX')}`;

/** Grid de 3 KPI del consultorio: los dos primeros son StatTile, el tercero es RetencionRadar (necesita lista, no cabe en StatTile). */
function KpisConsultorio() {
  const [stats, setStats] = useState(null);
  const [finanzas, setFinanzas] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const [statsRes, finRes] = await Promise.all([
          dashboardAPI.getStats(),
          paymentsAPI.getSummary(),
        ]);
        if (cancelado) return;
        setStats(statsRes.data?.data || null);
        setFinanzas(finRes.data?.data || null);
      } catch (err) {
        if (!cancelado) setError(getApiErrorMessage(err, 'No se pudieron cargar los indicadores.'));
      } finally {
        if (!cancelado) setLoading(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  const pacientesActivos = stats?.stats?.activePatients;
  const cambioMensual = stats?.stats?.monthlyChange;
  const cobrado = finanzas?.mes?.cobrado;
  const pendiente = finanzas?.mes?.pendiente;
  const variacionIngresos = finanzas?.mes?.variacionVsMesAnterior;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="card p-5">
        <div className="mb-2 flex items-center gap-2 text-2xs font-semibold uppercase tracking-wide text-[var(--ink-secondary)]">
          <Users size={14} strokeWidth={1.75} className="text-[var(--accent)]" />
          Pacientes activos
        </div>
        {loading ? (
          <div className="space-y-2">
            <div className="skeleton h-8 w-16 rounded-lg" />
            <div className="skeleton h-3 w-24 rounded" />
          </div>
        ) : error ? (
          <p className="text-xs text-[var(--danger)]">{error}</p>
        ) : (
          <>
            <div className="font-mono text-2xl font-medium text-[var(--ink)] sm:text-3xl">{pacientesActivos ?? '—'}</div>
            {cambioMensual != null && (
              <div className={`mt-1 flex items-center gap-1 text-xs ${cambioMensual >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                {cambioMensual >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(cambioMensual)}% vs mes anterior
              </div>
            )}
          </>
        )}
      </div>

      <div className="card p-5">
        <div className="mb-2 flex items-center gap-2 text-2xs font-semibold uppercase tracking-wide text-[var(--ink-secondary)]">
          <DollarSign size={14} strokeWidth={1.75} className="text-[var(--accent)]" />
          Ingresos del mes
        </div>
        {loading ? (
          <div className="space-y-2">
            <div className="skeleton h-8 w-24 rounded-lg" />
            <div className="skeleton h-3 w-32 rounded" />
          </div>
        ) : error ? (
          <p className="text-xs text-[var(--danger)]">{error}</p>
        ) : (
          <>
            <div className="font-mono text-2xl font-medium text-[var(--success)] sm:text-3xl">{pesos(cobrado)}</div>
            <div className="mt-1 text-xs text-[var(--ink-secondary)]">
              {pesos(pendiente)} pendiente
              {variacionIngresos != null ? ` · ${variacionIngresos >= 0 ? '+' : ''}${variacionIngresos}% vs mes anterior` : ''}
            </div>
          </>
        )}
      </div>

      <RetencionRadar />
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-up">
      <ConsultaHoyHero />

      <KpisConsultorio />

      <Suspense fallback={<Card><div className="skeleton h-[220px] w-full rounded-2xl" /></Card>}>
        <RadarEpidemiologico />
      </Suspense>

      <Suspense
        fallback={
          <div className="space-y-4">
            <div className="card"><div className="skeleton h-[280px] w-full rounded-2xl" /></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card><div className="skeleton h-[220px] w-full rounded-2xl" /></Card>
              <div className="lg:col-span-2 card"><div className="skeleton h-[220px] w-full rounded-2xl" /></div>
            </div>
            <Card><div className="skeleton h-[240px] w-full rounded-2xl" /></Card>
          </div>
        }
      >
        <DashboardInsights />
      </Suspense>
    </div>
  );
}
