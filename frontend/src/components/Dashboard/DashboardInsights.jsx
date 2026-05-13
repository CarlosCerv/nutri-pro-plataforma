import { useEffect, useState } from 'react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Users, Salad, Clock, ChevronRight, FileText, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const ESTADO_COLORS = { confirmada: 'badge-success', pendiente: 'badge-warning', cancelada: 'badge-danger' };

const ACTIVIDAD_ICONS = {
  patient: { Icon: Users, color: '#007AFF' },
  diet: { Icon: Salad, color: '#34C759' },
  pdf: { Icon: FileText, color: '#FF9F0A' },
};

const CustomTooltip = ({ active, payload, label, unit = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-navy-600 rounded-xl px-3 py-2.5 shadow-navy-md">
      <div className="text-xs text-white/40 mb-1">{label}</div>
      {payload.map((entry, index) => (
        <div key={index} className="text-sm font-mono font-medium" style={{ color: entry.color }}>
          {entry.value}{unit}
          <span className="text-white/30 text-xs ml-1">{entry.name}</span>
        </div>
      ))}
    </div>
  );
};

const SectionHeader = ({ title, subtitle, action, actionTo }) => (
  <div className="flex items-center justify-between mb-5">
    <div>
      <h2 className="section-title mb-0.5">{title}</h2>
      {subtitle && <p className="text-xs text-white/30">{subtitle}</p>}
    </div>
    {action && (
      <Link to={actionTo} className="flex items-center gap-1 text-xs font-semibold text-emerald hover:text-emerald-300 transition-colors">
        {action} <ChevronRight size={13} />
      </Link>
    )}
  </div>
);

export default function DashboardInsights() {
  const [weightData, setWeightData] = useState([]);
  const [pathologyData, setPathologyData] = useState([]);
  const [macroData, setMacroData] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsightsData = async () => {
      try {
        const [
          weightRes,
          pathologyRes,
          macroRes,
          appointmentsRes,
          activityRes,
        ] = await Promise.all([
          api.get('/api/dashboard/weight-data').catch(() => ({ data: { data: [] } })),
          api.get('/api/dashboard/pathology-data').catch(() => ({ data: { data: [] } })),
          api.get('/api/dashboard/macro-data').catch(() => ({ data: { data: [] } })),
          api.get('/api/appointments/today').catch(() => ({ data: { data: [] } })),
          api.get('/api/dashboard/activity').catch(() => ({ data: { data: [] } })),
        ]);

        setWeightData(weightRes.data.data || []);
        setPathologyData(pathologyRes.data.data || []);
        setMacroData(macroRes.data.data || []);
        setAppointments(appointmentsRes.data.data || []);
        setActivity(activityRes.data.data || []);
      } catch (error) {
        console.error('Error fetching insights data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsightsData();
  }, []);

  if (loading) {
    return (
      <>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 card"><div className="skeleton h-[280px] w-full rounded-2xl" /></div>
          <div className="card"><div className="skeleton h-[280px] w-full rounded-2xl" /></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card"><div className="skeleton h-[220px] w-full rounded-2xl" /></div>
          <div className="lg:col-span-2 card"><div className="skeleton h-[220px] w-full rounded-2xl" /></div>
        </div>
        <div className="card"><div className="skeleton h-[240px] w-full rounded-2xl" /></div>
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card">
          {weightData && weightData.length > 0 ? (
            <>
              <SectionHeader title="Evolución de Peso" subtitle="Promedio de todos los pacientes — últimas 8 semanas" />
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={weightData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#007AFF" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#007AFF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" />
                  <XAxis dataKey="semana" tick={{ fill: '#86868B', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#86868B', fontSize: 11 }} axisLine={false} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip content={<CustomTooltip unit=" kg" />} />
                  <Area type="monotone" dataKey="promedio" name="kg promedio" stroke="#007AFF" strokeWidth={2} fill="url(#emeraldGrad)" dot={{ r: 4, fill: '#007AFF', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#007AFF' }} />
                </AreaChart>
              </ResponsiveContainer>
            </>
          ) : (
            <div className="min-h-[280px] flex items-center justify-center text-white/30">
              <p>No hay datos de peso disponibles</p>
            </div>
          )}
        </div>

        <div className="card">
          {pathologyData && pathologyData.length > 0 ? (
            <>
              <SectionHeader title="Patologías" subtitle="Distribución de pacientes" />
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pathologyData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                    {pathologyData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} opacity={0.85} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, '']} contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E5EA', borderRadius: '8px', padding: '8px 12px', color: '#1D1D1F' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {pathologyData.slice(0, 4).map((pathology) => (
                  <div key={pathology.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: pathology.color }} />
                      <span className="text-xs text-white/50 truncate">{pathology.name}</span>
                    </div>
                    <span className="text-xs font-mono text-white/60">{pathology.value}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="min-h-[280px] flex items-center justify-center text-white/30">
              <p>Sin datos</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card">
          {macroData && macroData.length > 0 ? (
            <>
              <SectionHeader title="Distribución Calórica" subtitle="% adherencia por macro (promedio)" />
              <div className="space-y-3">
                {macroData.map((macro) => (
                  <div key={macro.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-white/50">{macro.name}</span>
                      <span className="text-xs font-mono font-medium" style={{ color: macro.color }}>{macro.valor}%</span>
                    </div>
                    <div className="h-1.5 bg-navy-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${macro.valor}%`, background: macro.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="min-h-[220px] flex items-center justify-center text-white/30">
              <p>Sin datos</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 card">
          {appointments && appointments.length > 0 ? (
            <>
              <SectionHeader title="Agenda de Hoy" subtitle={`${appointments.length} consultas programadas`} action="Ver calendario" actionTo="/agenda" />
              <div className="space-y-2">
                {appointments.map((cita, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-navy-800/50 hover:bg-navy-800 transition-colors group cursor-pointer">
                    <div className="flex-shrink-0 text-center w-12">
                      <div className="font-mono text-xs font-semibold text-white">{cita.hora}</div>
                    </div>
                    <div className="w-px h-8 bg-navy-700" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{cita.nombre}</div>
                      <div className="text-xs text-white/30">{cita.tipo}</div>
                    </div>
                    <span className={`badge ${ESTADO_COLORS[cita.estado] || 'badge-neutral'}`}>{cita.estado}</span>
                    <ChevronRight size={14} className="text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0" />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="min-h-[220px] flex items-center justify-center flex-col gap-2">
              <p className="text-white/30">Sin citas programadas</p>
              <Link to="/agenda/nueva" className="btn btn-sm btn-primary gap-1">
                <Plus size={13} /> Agendar cita
              </Link>
            </div>
          )}
          <Link to="/agenda/nueva" className="mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-navy-700 text-xs text-white/30 hover:text-emerald hover:border-emerald/30 transition-all duration-200">
            <Plus size={13} /> Agregar consulta
          </Link>
        </div>
      </div>

      <div className="card">
        {activity && activity.length > 0 ? (
          <>
            <SectionHeader title="Actividad Reciente" subtitle="Últimas acciones del sistema" />
            <div className="space-y-1">
              {activity.map((actItem, index) => {
                const { Icon, color } = ACTIVIDAD_ICONS[actItem.tipo] || ACTIVIDAD_ICONS.patient;
                return (
                  <div key={index} className="flex items-start gap-3 px-2 py-2.5 rounded-xl hover:bg-white/[0.02] transition-colors">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${color}15`, border: `1px solid ${color}20` }}>
                      <Icon size={13} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/70">{actItem.msg}</p>
                      <p className="text-xs text-white/25 mt-0.5 flex items-center gap-1">
                        <Clock size={10} /> {actItem.tiempo}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="min-h-[240px] flex items-center justify-center text-white/30">
            <p>Sin actividad reciente</p>
          </div>
        )}
      </div>
    </>
  );
}
