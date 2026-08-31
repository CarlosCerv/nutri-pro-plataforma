import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChevronRight } from 'lucide-react';
import { dashboardAPI } from '../../services/api';
import { getApiErrorMessage } from '../../lib/apiError';
import { ErrorState } from '../../design-system/components/StateViews';
import { Card } from '../../design-system/components';

const TooltipCard = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[var(--radius-m)] border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-2.5 shadow-card">
      <div className="mb-1 text-xs text-[var(--ink-secondary)]">{label}</div>
      <div className="font-mono text-sm font-medium" style={{ color: payload[0].color }}>
        {payload[0].value} pacientes
      </div>
    </div>
  );
};

/**
 * Radar epidemiológico del dashboard: versión compacta de
 * `PopulationReports.jsx` (misma fuente, `/api/dashboard/population`) — solo
 * los dos vistazos que importan para arrancar el día. El reporte completo
 * sigue viviendo en Herramientas › Estadísticas.
 */
export default function RadarEpidemiologico() {
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

  const header = (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="section-title mb-0">Radar epidemiológico</h2>
      <Link to="/herramientas/estadisticas" className="flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)]">
        Reporte completo <ChevronRight size={13} />
      </Link>
    </div>
  );

  if (loading) {
    return (
      <Card>
        {header}
        <div className="skeleton h-[200px] w-full rounded-2xl" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        {header}
        <ErrorState message={error} onRetry={() => setRecarga((n) => n + 1)} className="min-h-[200px]" />
      </Card>
    );
  }

  if (!datos || datos.total === 0) {
    return (
      <Card>
        {header}
        <div className="flex min-h-[200px] items-center justify-center text-sm text-[var(--ink-secondary)]">
          Aún no hay pacientes que analizar.
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        {header}
        {datos.conImc === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center text-sm text-[var(--ink-secondary)]">
            Sin mediciones de IMC capturadas.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={datos.distribucionIMC} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" vertical={false} />
              <XAxis dataKey="categoria" tick={{ fill: 'var(--ink-secondary)', fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fill: 'var(--ink-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<TooltipCard />} cursor={{ fill: 'var(--surface-alt)' }} />
              <Bar dataKey="pacientes" fill="var(--chart-blue)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card>
        <h2 className="section-title mb-4">Prevalencia de patologías</h2>
        {datos.prevalencias.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center text-sm text-[var(--ink-secondary)]">
            Sin patologías registradas en el expediente.
          </div>
        ) : (
          <div className="space-y-3">
            {datos.prevalencias.slice(0, 5).map((p) => (
              <div key={p.nombre}>
                <div className="mb-1 flex justify-between gap-3">
                  <span className="truncate text-sm text-[var(--ink-muted)]">{p.nombre}</span>
                  <span className="shrink-0 font-mono text-sm text-[var(--ink)]">{p.pacientes} · {p.porcentaje}%</span>
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
