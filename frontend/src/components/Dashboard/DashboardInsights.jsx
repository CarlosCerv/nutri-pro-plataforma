import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Users, Salad, Clock, ChevronRight, FileText, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const MOCK_WEIGHT_DATA = [
  { semana: 'S1', promedio: 74.2 }, { semana: 'S2', promedio: 73.8 },
  { semana: 'S3', promedio: 73.5 }, { semana: 'S4', promedio: 73.1 },
  { semana: 'S5', promedio: 72.9 }, { semana: 'S6', promedio: 72.4 },
  { semana: 'S7', promedio: 72.0 }, { semana: 'S8', promedio: 71.6 },
];

const MOCK_PATOLOGIAS = [
  { name: 'Sobrepeso/Obesidad', value: 38, color: '#F59E0B' },
  { name: 'Diabetes T2', value: 22, color: '#EF4444' },
  { name: 'Hipertensión', value: 15, color: '#8B5CF6' },
  { name: 'Dislipidemia', value: 13, color: '#3B82F6' },
  { name: 'Sin patología', value: 12, color: '#2ECC8E' },
];

const MOCK_MACROS = [
  { name: 'Calorías', valor: 78, color: '#E8C96A' },
  { name: 'Proteínas', valor: 65, color: '#2ECC8E' },
  { name: 'Carbohidratos', valor: 83, color: '#3B82F6' },
  { name: 'Lípidos', valor: 71, color: '#F97316' },
  { name: 'Fibra', valor: 54, color: '#A855F7' },
];

const MOCK_CITAS_HOY = [
  { hora: '09:00', nombre: 'María González', tipo: 'Control', estado: 'confirmada' },
  { hora: '10:30', nombre: 'Juan Rodríguez', tipo: 'Primera vez', estado: 'pendiente' },
  { hora: '12:00', nombre: 'Ana Martínez', tipo: 'Online', estado: 'confirmada' },
  { hora: '16:00', nombre: 'Luis Hernández', tipo: 'Control', estado: 'pendiente' },
  { hora: '17:30', nombre: 'Sofía Torres', tipo: 'Primera vez', estado: 'confirmada' },
];

const MOCK_ACTIVIDAD = [
  { tipo: 'patient', msg: 'Nueva paciente: Ana Ramírez registrada', tiempo: 'Hace 12 min' },
  { tipo: 'diet', msg: 'Dieta "Hipocalórica 1400 kcal" asignada a Juan R.', tiempo: 'Hace 1 hora' },
  { tipo: 'pdf', msg: 'PDF exportado para María González', tiempo: 'Hace 2 horas' },
  { tipo: 'patient', msg: 'Mediciones actualizadas — Luis Hernández', tiempo: 'Hoy, 9:15 AM' },
  { tipo: 'diet', msg: 'Nueva plantilla SMAE creada: "Diabético 1600"', tiempo: 'Ayer, 4:30 PM' },
];

const ESTADO_COLORS = { confirmada: 'badge-success', pendiente: 'badge-warning', cancelada: 'badge-danger' };

const ACTIVIDAD_ICONS = {
  patient: { Icon: Users, color: '#2ECC8E' },
  diet: { Icon: Salad, color: '#E8C96A' },
  pdf: { Icon: FileText, color: '#3B82F6' },
};

const CustomTooltip = ({ active, payload, label, unit = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy-800 border border-navy-600 rounded-xl px-3 py-2.5 shadow-navy-md">
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
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card">
          <SectionHeader title="Evolución de Peso" subtitle="Promedio de todos los pacientes — últimas 8 semanas" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MOCK_WEIGHT_DATA} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2ECC8E" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2ECC8E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="semana" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
              <Tooltip content={<CustomTooltip unit=" kg" />} />
              <Area type="monotone" dataKey="promedio" name="kg promedio" stroke="#2ECC8E" strokeWidth={2} fill="url(#emeraldGrad)" dot={{ r: 4, fill: '#2ECC8E', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#2ECC8E' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <SectionHeader title="Patologías" subtitle="Distribución de pacientes" />
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={MOCK_PATOLOGIAS} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                {MOCK_PATOLOGIAS.map((entry, index) => (
                  <Cell key={index} fill={entry.color} opacity={0.85} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, '']} contentStyle={{ background: '#0D1526', border: '1px solid #1A2E50', borderRadius: '12px', padding: '8px 12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {MOCK_PATOLOGIAS.slice(0, 4).map((pathology) => (
              <div key={pathology.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: pathology.color }} />
                  <span className="text-xs text-white/50 truncate">{pathology.name}</span>
                </div>
                <span className="text-xs font-mono text-white/60">{pathology.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card">
          <SectionHeader title="Distribución Calórica" subtitle="% adherencia por macro (promedio)" />
          <div className="space-y-3">
            {MOCK_MACROS.map((macro) => (
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
        </div>

        <div className="lg:col-span-2 card">
          <SectionHeader title="Agenda de Hoy" subtitle={`${MOCK_CITAS_HOY.length} consultas programadas`} action="Ver calendario" actionTo="/agenda" />
          <div className="space-y-2">
            {MOCK_CITAS_HOY.map((cita, index) => (
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
          <Link to="/agenda/nueva" className="mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-navy-700 text-xs text-white/30 hover:text-emerald hover:border-emerald/30 transition-all duration-200">
            <Plus size={13} /> Agregar consulta
          </Link>
        </div>
      </div>

      <div className="card">
        <SectionHeader title="Actividad Reciente" subtitle="Últimas acciones del sistema" />
        <div className="space-y-1">
          {MOCK_ACTIVIDAD.map((activity, index) => {
            const { Icon, color } = ACTIVIDAD_ICONS[activity.tipo] || ACTIVIDAD_ICONS.patient;
            return (
              <div key={index} className="flex items-start gap-3 px-2 py-2.5 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${color}15`, border: `1px solid ${color}20` }}>
                  <Icon size={13} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/70">{activity.msg}</p>
                  <p className="text-xs text-white/25 mt-0.5 flex items-center gap-1">
                    <Clock size={10} /> {activity.tiempo}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
