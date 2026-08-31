import { useCallback, useEffect, useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Activity, BarChart3, HeartPulse, Users } from 'lucide-react';
import { dashboardAPI } from '../services/api';
import { getApiErrorMessage } from '../lib/apiError';
import StatTile from '../design-system/components/StatTile.jsx';
import { EmptyState, ErrorState, LoadingState } from '../design-system/components/StateViews.jsx';
import { Card } from '../design-system/components';

/**
 * Estadísticas de la población atendida.
 *
 * La versión anterior mostraba cuatro cifras inventadas (284 pacientes, 22 %
 * de prevalencia de DM2, IMC promedio 28.4) y el propio componente admitía en
 * pantalla que "falta conectar agregaciones reales desde backend". Aquí están
 * esas agregaciones, en `GET /api/dashboard/population`.
 */

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const TooltipCard = ({ active, payload, label, unidad = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[var(--radius-m)] border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-2.5 shadow-card">
      <div className="mb-1 text-xs text-[var(--ink-secondary)]">{label}</div>
      {payload.map((entry, i) => (
        <div key={i} className="font-mono text-sm font-medium" style={{ color: entry.color }}>
          {entry.value}
          {unidad}
          <span className="ml-1 text-xs text-[var(--ink-secondary)]">{entry.name}</span>
        </div>
      ))}
    </div>
  );
};

export default function PopulationReports() {
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let cancelado = false;
    setLoading(true);

    (async () => {
      try {
        const res = await dashboardAPI.getPopulation();
        if (!cancelado) {
          setDatos(res.data?.data || null);
          setError(null);
        }
      } catch (err) {
        if (!cancelado) setError(getApiErrorMessage(err, 'No se pudieron cargar las estadísticas.'));
      } finally {
        if (!cancelado) setLoading(false);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [recarga]);

  const reintentar = useCallback(() => setRecarga((n) => n + 1), []);

  if (loading) return <LoadingState label="Calculando estadísticas…" />;
  if (error) return <ErrorState message={error} onRetry={reintentar} />;

  if (!datos || datos.total === 0) {
    return (
      <EmptyState
        icon={<BarChart3 size={26} strokeWidth={1.5} />}
        title="Todavía no hay pacientes que analizar"
        description="Las estadísticas se calculan sobre tus pacientes y sus mediciones. Da de alta el primero para empezar."
      />
    );
  }

  const evolucion = datos.evolucion.map((e) => ({
    periodo: `${MESES[e.month - 1]} ${String(e.year).slice(2)}`,
    peso: e.pesoPromedio,
    imc: e.imcPromedio,
  }));

  const prevalenciaTop = datos.prevalencias[0];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Pacientes" value={datos.total} icon={<Users size={14} strokeWidth={1.75} />} hint={`${datos.activos} activos`} />
        <StatTile
          label="IMC promedio"
          value={datos.imcPromedio ?? '—'}
          tone="accent"
          icon={<Activity size={14} strokeWidth={1.75} />}
          hint={datos.conImc > 0 ? `Sobre ${datos.conImc} con medición` : 'Sin mediciones capturadas'}
        />
        <StatTile
          label="Patología más frecuente"
          value={prevalenciaTop ? `${prevalenciaTop.porcentaje}%` : '—'}
          tone="warning"
          icon={<HeartPulse size={14} strokeWidth={1.75} />}
          hint={prevalenciaTop ? prevalenciaTop.nombre : 'Sin patologías registradas'}
        />
        <StatTile
          label="Mediciones registradas"
          value={datos.evolucion.reduce((a, e) => a + e.mediciones, 0)}
          icon={<BarChart3 size={14} strokeWidth={1.75} />}
          hint={`En ${datos.evolucion.length} ${datos.evolucion.length === 1 ? 'mes' : 'meses'}`}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card as="section">
          <h2 className="section-title mb-4">Distribución de IMC</h2>
          {datos.conImc === 0 ? (
            <EmptyState title="Sin mediciones de IMC" description="Captura peso y talla en el expediente para poblar esta gráfica." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={datos.distribucionIMC} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" vertical={false} />
                <XAxis dataKey="categoria" tick={{ fill: 'var(--ink-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fill: 'var(--ink-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<TooltipCard />} cursor={{ fill: 'var(--surface-alt)' }} />
                <Bar dataKey="pacientes" name="pacientes" fill="var(--chart-blue)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card as="section">
          <h2 className="section-title mb-4">Evolución del peso promedio</h2>
          {evolucion.length === 0 ? (
            <EmptyState title="Sin serie histórica" description="Las mediciones de composición corporal alimentan esta gráfica." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={evolucion} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" vertical={false} />
                <XAxis dataKey="periodo" tick={{ fill: 'var(--ink-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--ink-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip content={<TooltipCard unidad=" kg" />} />
                <Line type="monotone" dataKey="peso" name="kg promedio" stroke="var(--chart-green)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <Card as="section">
        <h2 className="section-title mb-4">Prevalencia de patologías</h2>
        {datos.prevalencias.length === 0 ? (
          <EmptyState
            title="Sin patologías registradas"
            description="Se toman de la pestaña Clínica del expediente de cada paciente."
          />
        ) : (
          <div className="space-y-3">
            {datos.prevalencias.map((p) => (
              <div key={p.nombre}>
                <div className="mb-1 flex justify-between gap-3">
                  <span className="truncate text-sm text-[var(--ink-muted)]">{p.nombre}</span>
                  <span className="shrink-0 font-mono text-sm text-[var(--ink)]">
                    {p.pacientes} · {p.porcentaje}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-alt)]">
                  <div
                    className="h-full rounded-full bg-[var(--accent)] transition-all duration-layout"
                    style={{ width: `${p.porcentaje}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
