import { useEffect, useState } from 'react';
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Users, Salad, Clock, ChevronRight, FileText, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { getApiErrorMessage } from '../../lib/apiError';
import { ErrorState } from '../../design-system/components/StateViews';
import { Button, Card } from '../../design-system/components';

const ESTADO_COLORS = { confirmada: 'badge-success', pendiente: 'badge-warning', cancelada: 'badge-danger' };

// Los iconos de actividad diferencian el tipo de evento, no la marca: van en
// la paleta de graficas, que es la unica del sistema pensada para distinguir
// categorias entre si.
const ACTIVIDAD_ICONS = {
  patient: { Icon: Users, color: 'var(--chart-blue)' },
  diet: { Icon: Salad, color: 'var(--chart-green)' },
  pdf: { Icon: FileText, color: 'var(--chart-orange)' },
};

/**
 * El color de cada serie lo asigna el cliente, no la API: el backend devuelve
 * `{ name, value }` y aquí se le aplica la paleta de gráficas del sistema de
 * diseño (tokens `--chart-*` de index.css).
 */
const CHART_PALETTE = [
  'var(--chart-blue)',
  'var(--chart-green)',
  'var(--chart-orange)',
  'var(--chart-red)',
  'var(--chart-purple)',
  'var(--gray-500)',
];
const conColor = (items = []) => items.map((item, i) => ({ ...item, color: CHART_PALETTE[i % CHART_PALETTE.length] }));

const CustomTooltip = ({ active, payload, label, unit = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[var(--border-soft)] rounded-xl px-3 py-2.5 shadow-card">
      <div className="text-xs text-[var(--ink-secondary)] mb-1">{label}</div>
      {payload.map((entry, index) => (
        <div key={index} className="text-sm font-mono font-medium" style={{ color: entry.color }}>
          {entry.value}{unit}
          <span className="text-[var(--ink-secondary)] text-xs ml-1">{entry.name}</span>
        </div>
      ))}
    </div>
  );
};

const SectionHeader = ({ title, subtitle, action, actionTo }) => (
  <div className="flex items-center justify-between mb-5">
    <div>
      <h2 className="section-title mb-0.5">{title}</h2>
      {subtitle && <p className="text-xs text-[var(--ink-secondary)]">{subtitle}</p>}
    </div>
    {action && (
      <Link to={actionTo} className="flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
        {action} <ChevronRight size={13} />
      </Link>
    )}
  </div>
);

/**
 * Las cinco secciones se piden a la vez pero fallan por separado.
 *
 * Antes cada peticion llevaba `.catch(() => ({ data: { data: [] } }))`, con lo
 * que un 500 quedaba indistinguible de "todavia no hay datos": la grafica se
 * pintaba vacia y no habia forma de saber que el servidor habia contestado
 * mal. Con `allSettled` cada seccion conserva su propio resultado, y la que
 * falla muestra el error con su boton de reintento en vez de un hueco mudo.
 */
const FUENTES = [
  ['weight', '/api/dashboard/weight-data'],
  ['macro', '/api/dashboard/macro-data'],
  ['appointments', '/api/appointments/today'],
  ['activity', '/api/dashboard/activity'],
];

export default function DashboardInsights() {
  const [weightData, setWeightData] = useState([]);
  const [macroData, setMacroData] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activity, setActivity] = useState([]);
  const [fallos, setFallos] = useState({});
  const [loading, setLoading] = useState(true);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let cancelado = false;

    Promise.allSettled(FUENTES.map(([, url]) => api.get(url))).then((resultados) => {
      if (cancelado) return;

      const datos = {};
      const errores = {};

      resultados.forEach((resultado, i) => {
        const [clave] = FUENTES[i];
        if (resultado.status === 'fulfilled') {
          datos[clave] = resultado.value.data?.data || [];
        } else {
          errores[clave] = getApiErrorMessage(resultado.reason, 'No se pudo cargar esta seccion.');
        }
      });

      setWeightData(datos.weight || []);
      setMacroData(conColor(datos.macro || []));
      setAppointments(datos.appointments || []);
      setActivity(datos.activity || []);
      setFallos(errores);
      setLoading(false);
    });

    return () => {
      cancelado = true;
    };
  }, [recarga]);

  // `setLoading` vive aqui y no dentro del efecto: llamarlo en el cuerpo del
  // efecto encadena un render de mas, y en la primera carga no hace falta
  // porque `loading` ya arranca en true.
  const reintentar = () => {
    setLoading(true);
    setRecarga((n) => n + 1);
  };

  if (loading) {
    return (
      <>
        <div className="card"><div className="skeleton h-[280px] w-full rounded-2xl" /></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card><div className="skeleton h-[220px] w-full rounded-2xl" /></Card>
          <div className="lg:col-span-2 card"><div className="skeleton h-[220px] w-full rounded-2xl" /></div>
        </div>
        <Card><div className="skeleton h-[240px] w-full rounded-2xl" /></Card>
      </>
    );
  }

  return (
    <>
      <div className="card">
        {fallos.weight ? (
            <ErrorState message={fallos.weight} onRetry={reintentar} className="min-h-[280px]" />
          ) : weightData.length > 0 ? (
            <>
              <SectionHeader title="Evolución de Peso" subtitle="Promedio de todos los pacientes — últimas 8 semanas" />
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={weightData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="gradienteAcento" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-strong)" />
                  <XAxis dataKey="semana" tick={{ fill: 'var(--ink-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--ink-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip content={<CustomTooltip unit=" kg" />} />
                  <Area type="monotone" dataKey="promedio" name="kg promedio" stroke="var(--accent)" strokeWidth={2} fill="url(#gradienteAcento)" dot={{ r: 4, fill: 'var(--accent)', strokeWidth: 0 }} activeDot={{ r: 6, fill: 'var(--accent)' }} />
                </AreaChart>
              </ResponsiveContainer>
            </>
          ) : (
            <div className="min-h-[280px] flex items-center justify-center text-[var(--ink-secondary)]">
              <p>No hay datos de peso disponibles</p>
            </div>
          )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          {fallos.macro ? (
            <ErrorState message={fallos.macro} onRetry={reintentar} className="min-h-[220px]" />
          ) : macroData.length > 0 ? (
            <>
              <SectionHeader title="Distribución Calórica" subtitle="% adherencia por macro (promedio)" />
              <div className="space-y-3">
                {macroData.map((macro) => (
                  <div key={macro.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-[var(--ink-secondary)]">{macro.name}</span>
                      <span className="text-xs font-mono font-medium" style={{ color: macro.color }}>{macro.valor}%</span>
                    </div>
                    <div className="h-1.5 bg-[var(--surface-alt)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${macro.valor}%`, background: macro.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="min-h-[220px] flex items-center justify-center text-[var(--ink-secondary)]">
              <p>Sin datos</p>
            </div>
          )}
        </Card>

        <div className="lg:col-span-2 card">
          {fallos.appointments ? (
            <ErrorState message={fallos.appointments} onRetry={reintentar} className="min-h-[220px]" />
          ) : appointments.length > 0 ? (
            <>
              <SectionHeader title="Agenda de Hoy" subtitle={`${appointments.length} consultas programadas`} action="Ver calendario" actionTo="/agenda" />
              <div className="space-y-2">
                {appointments.map((cita, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-alt)] hover:bg-[var(--surface-alt)] transition-colors group cursor-pointer">
                    <div className="flex-shrink-0 text-center w-12">
                      <div className="font-mono text-xs font-semibold text-[var(--ink)]">{cita.hora}</div>
                    </div>
                    <div className="w-px h-8 bg-[var(--surface-strong)]" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[var(--ink)] truncate">{cita.nombre}</div>
                      <div className="text-xs text-[var(--ink-secondary)]">{cita.tipo}</div>
                    </div>
                    <span className={`badge ${ESTADO_COLORS[cita.estado] || 'badge-neutral'}`}>{cita.estado}</span>
                    <ChevronRight size={14} className="text-[var(--ink-secondary)] group-hover:text-[var(--ink-secondary)] transition-colors flex-shrink-0" />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="min-h-[220px] flex items-center justify-center flex-col gap-2">
              <p className="text-[var(--ink-secondary)]">Sin citas programadas</p>
              <Button as={Link} size="sm" to="/agenda/nueva" className="gap-1">
                <Plus size={13} /> Agendar cita
              </Button>
            </div>
          )}
          <Link to="/agenda/nueva" className="mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-[var(--border-soft)] text-xs text-[var(--ink-secondary)] hover:text-[var(--accent-hover)] hover:border-[var(--accent-border)] transition-all duration-200">
            <Plus size={13} /> Agregar consulta
          </Link>
        </div>
      </div>

      <Card>
        {fallos.activity ? (
          <ErrorState message={fallos.activity} onRetry={reintentar} className="min-h-[240px]" />
        ) : activity.length > 0 ? (
          <>
            <SectionHeader title="Actividad Reciente" subtitle="Últimas acciones del sistema" />
            <div className="space-y-1">
              {activity.map((actItem, index) => {
                const { Icon, color } = ACTIVIDAD_ICONS[actItem.tipo] || ACTIVIDAD_ICONS.patient;
                return (
                  <div key={index} className="flex items-start gap-3 px-2 py-2.5 rounded-xl hover:bg-[rgba(60,60,67,0.05)] transition-colors">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${color}15`, border: `1px solid ${color}20` }}>
                      <Icon size={13} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--ink-muted)]">{actItem.msg}</p>
                      <p className="text-xs text-[var(--ink-secondary)] mt-0.5 flex items-center gap-1">
                        <Clock size={10} /> {actItem.tiempo}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="min-h-[240px] flex items-center justify-center text-[var(--ink-secondary)]">
            <p>Sin actividad reciente</p>
          </div>
        )}
      </Card>
    </>
  );
}
