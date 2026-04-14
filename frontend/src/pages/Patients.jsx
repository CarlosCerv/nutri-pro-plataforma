import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Search, Users, ChevronRight,
} from 'lucide-react';
import api from '../services/api';

const FILTROS = ['Todos', 'Activos', 'Sin dieta', 'Con alerta'];

const IMC_COLORS = {
  'Bajo peso':   { color: '#3B82F6', dot: 'bg-info'      },
  'Normal':      { color: '#2ECC8E', dot: 'bg-success'    },
  'Sobrepeso':   { color: '#F59E0B', dot: 'bg-warning'    },
  'Obesidad I':  { color: '#EF4444', dot: 'bg-danger'     },
  'Obesidad II': { color: '#DC2626', dot: 'bg-danger'     },
  'Obesidad III':{ color: '#991B1B', dot: 'bg-danger'     },
};

const calcIMC = (peso, talla) => {
  if (!peso || !talla) return null;
  const h = talla / 100;
  return (peso / (h * h)).toFixed(1);
};

const clasificarIMC = (imc) => {
  if (!imc) return null;
  if (imc < 18.5) return 'Bajo peso';
  if (imc < 25)   return 'Normal';
  if (imc < 30)   return 'Sobrepeso';
  if (imc < 35)   return 'Obesidad I';
  if (imc < 40)   return 'Obesidad II';
  return 'Obesidad III';
};

// Skeleton de fila de tabla
const RowSkeleton = () => (
  <div className="flex items-center gap-4 px-4 py-3.5 border-b border-navy-800/60">
    <div className="skeleton w-9 h-9 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="skeleton h-3.5 w-36 rounded" />
      <div className="skeleton h-3 w-24 rounded" />
    </div>
    <div className="skeleton h-6 w-20 rounded-full hidden md:block" />
    <div className="skeleton h-5 w-16 rounded hidden lg:block" />
    <div className="skeleton h-5 w-16 rounded hidden xl:block" />
    <div className="skeleton w-5 h-5 rounded ml-auto" />
  </div>
);

export default function Patients() {
  const [patients, setPatients]   = useState([]);
  const [search, setSearch]       = useState('');
  const [filtro, setFiltro]       = useState('Todos');
  const [loading, setLoading]     = useState(true);

  const fetchPatients = useCallback(async () => {
    try {
      const res = await api.get('/api/patients');
      setPatients(res.data.data || res.data || []);
    } catch {
      // Mock data para desarrollo sin backend
      setPatients([
        { _id: '1', firstName: 'María',  lastName: 'González',   email: 'maria@email.com', phone: '3310001111', lastWeight: 72.4, height: 165, sex: 'F', lastConsult: '2026-04-10', objective: 'Bajar de peso',   active: true },
        { _id: '2', firstName: 'Juan',   lastName: 'Rodríguez',  email: 'juan@email.com',  phone: '3320002222', lastWeight: 88.5, height: 175, sex: 'M', lastConsult: '2026-04-08', objective: 'Ganar músculo',  active: true },
        { _id: '3', firstName: 'Ana',    lastName: 'Martínez',   email: 'ana@email.com',   phone: '3330003333', lastWeight: 55.2, height: 158, sex: 'F', lastConsult: '2026-03-30', objective: 'Control glucémico', active: true },
        { _id: '4', firstName: 'Luis',   lastName: 'Hernández',  email: 'luis@email.com',  phone: '3340004444', lastWeight: 95.0, height: 170, sex: 'M', lastConsult: '2026-04-05', objective: 'Bajar de peso',   active: true },
        { _id: '5', firstName: 'Sofía',  lastName: 'Torres',     email: 'sofia@email.com', phone: '3350005555', lastWeight: 62.8, height: 162, sex: 'F', lastConsult: '2026-04-12', objective: 'Mantener peso',  active: true },
        { _id: '6', firstName: 'Carlos', lastName: 'Flores',     email: 'carlos@email.com',phone: '3360006666', lastWeight: 79.3, height: 180, sex: 'M', lastConsult: '2026-03-15', objective: 'Deporte',        active: false },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  // Filtrado y búsqueda
  const filtered = patients.filter(p => {
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    const matchSearch = fullName.includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase()) ||
      p.phone?.includes(search);
    if (!matchSearch) return false;
    if (filtro === 'Activos')    return p.active !== false;
    if (filtro === 'Sin dieta')  return !p.hasDiet;
    return true;
  });

  const initials = (p) =>
    `${p.firstName?.[0] || ''}${p.lastName?.[0] || ''}`.toUpperCase();

  const COLORS_CYCLE = ['#2ECC8E', '#E8C96A', '#3B82F6', '#A855F7', '#F97316', '#EF4444'];
  const colorFor = (name) => COLORS_CYCLE[(name?.charCodeAt(0) || 0) % COLORS_CYCLE.length];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Pacientes</h1>
          <p className="page-subtitle">{patients.length} pacientes registrados</p>
        </div>
        <Link to="/pacientes/nuevo" className="btn btn-primary gap-2 self-start sm:self-auto">
          <Plus size={16} />
          Nuevo Paciente
        </Link>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: patients.length,                                  color: '#2ECC8E' },
          { label: 'Activos',  value: patients.filter(p => p.active !== false).length, color: '#E8C96A' },
          { label: 'Nuevos este mes', value: 3,                                        color: '#3B82F6' },
          { label: 'Con alerta',  value: patients.filter(p => !p.hasDiet).length,      color: '#EF4444' },
        ].map(s => (
          <div key={s.label} className="card p-4 !hover:shadow-none">
            <div className="font-mono text-2xl font-medium" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        {/* Filtro tabs */}
        <div className="tabs-nav flex-shrink-0">
          {FILTROS.map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`tab-btn ${filtro === f ? 'active' : ''}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de pacientes */}
      <div className="card !p-0 overflow-hidden">
        {/* Table header */}
        <div className="hidden md:grid grid-cols-[1fr_120px_80px_100px_80px_40px] gap-4 px-4 py-3 border-b border-navy-700 bg-navy-900/50">
          {['Paciente', 'Objetivo', 'IMC', 'Última consulta', 'Estado', ''].map(h => (
            <div key={h} className="text-2xs font-bold uppercase tracking-wider text-white/30">{h}</div>
          ))}
        </div>

        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Users size={28} /></div>
            <div>
              <div className="text-sm font-semibold text-white/50">
                {search ? 'Sin resultados' : 'Sin pacientes aún'}
              </div>
              <div className="text-xs text-white/25 mt-1">
                {search ? 'Intenta con otro término de búsqueda' : 'Agrega tu primer paciente para comenzar'}
              </div>
            </div>
            {!search && (
              <Link to="/pacientes/nuevo" className="btn btn-primary btn-sm gap-1.5 mt-2">
                <Plus size={13} /> Nuevo Paciente
              </Link>
            )}
          </div>
        ) : (
          filtered.map((p) => {
            const imc = calcIMC(p.lastWeight, p.height);
            const cat = clasificarIMC(parseFloat(imc));
            const imcStyle = IMC_COLORS[cat];
            const fg = colorFor(p.firstName);
            const diasDesde = p.lastConsult
              ? Math.floor((Date.now() - new Date(p.lastConsult)) / 86400000)
              : null;

            return (
              <Link
                key={p._id}
                to={`/pacientes/${p._id}`}
                className="flex items-center gap-4 px-4 py-3.5 border-b border-navy-800/60 last:border-0
                           hover:bg-white/[0.025] transition-colors group relative"
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-navy-950 text-xs font-bold"
                  style={{ background: fg }}>
                  {p.photoUrl
                    ? <img src={p.photoUrl} alt="" className="avatar avatar-sm" />
                    : initials(p)
                  }
                </div>

                {/* Nombre + email */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white group-hover:text-emerald transition-colors truncate">
                    {p.firstName} {p.lastName}
                  </div>
                  <div className="text-xs text-white/30 truncate hidden sm:block">{p.email}</div>
                </div>

                {/* Objetivo */}
                <div className="hidden md:block w-[120px]">
                  <span className="badge badge-neutral text-xs">{p.objective || '—'}</span>
                </div>

                {/* IMC */}
                <div className="hidden md:block w-20">
                  {imc ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: imcStyle?.color || '#fff' }} />
                      <span className="font-mono text-sm text-white/70">{imc}</span>
                    </div>
                  ) : <span className="text-white/20 text-xs">—</span>}
                </div>

                {/* Última consulta */}
                <div className="hidden lg:flex items-center gap-1 w-24 text-xs text-white/40">
                  {diasDesde !== null
                    ? diasDesde === 0 ? 'Hoy'
                      : diasDesde === 1 ? 'Ayer'
                      : `Hace ${diasDesde}d`
                    : '—'
                  }
                </div>

                {/* Estado */}
                <div className="hidden xl:block w-20">
                  <span className={`badge ${p.active !== false ? 'badge-success' : 'badge-neutral'}`}>
                    {p.active !== false ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                {/* Arrow */}
                <ChevronRight size={15} className="text-white/20 group-hover:text-emerald/60 flex-shrink-0 transition-colors" />
              </Link>
            );
          })
        )}
      </div>

      {/* Paginación placeholder */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between text-xs text-white/30">
          <span>Mostrando {filtered.length} de {patients.length}</span>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 transition-colors">Anterior</button>
            <button className="px-3 py-1.5 rounded-lg bg-emerald text-navy-950 font-semibold">1</button>
            <button className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 transition-colors">Siguiente</button>
          </div>
        </div>
      )}
    </div>
  );
}
