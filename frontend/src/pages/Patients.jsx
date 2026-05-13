import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Search, Users, ChevronRight,
} from 'lucide-react';
import api from '../services/api';

const FILTROS = ['Todos', 'Activos', 'Sin dieta', 'Con alerta'];

/** Misma cuadrícula en cabecera y filas (scroll horizontal en pantallas angostas). */
const TABLE_GRID =
  'grid grid-cols-[minmax(200px,1fr)_108px_72px_96px_80px_32px] gap-x-3 items-center';

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

const RowSkeleton = () => (
  <div className={`${TABLE_GRID} px-4 py-3 border-b border-[var(--border-soft)]`}>
    <div className="flex items-center gap-3 min-w-0">
      <div className="skeleton w-9 h-9 rounded-full shrink-0" />
      <div className="flex-1 space-y-2 min-w-0">
        <div className="skeleton h-3.5 w-36 max-w-full rounded" />
        <div className="skeleton h-3 w-28 max-w-full rounded hidden sm:block" />
      </div>
    </div>
    <div className="skeleton h-6 w-full max-w-[5.5rem] rounded-full justify-self-start" />
    <div className="skeleton h-5 w-12 rounded justify-self-start" />
    <div className="skeleton h-4 w-14 rounded justify-self-start" />
    <div className="skeleton h-6 w-14 rounded-full justify-self-start" />
    <div className="skeleton w-4 h-4 rounded justify-self-end" />
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
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-sm text-[var(--text-secondary)]">
          {patients.length} {patients.length === 1 ? 'paciente registrado' : 'pacientes registrados'}
        </p>
        <Link to="/pacientes/nuevo" className="btn btn-primary gap-2 self-start sm:self-auto">
          <Plus size={16} />
          Nuevo paciente
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: patients.length,                                  color: '#2ECC8E' },
          { label: 'Activos',  value: patients.filter(p => p.active !== false).length, color: '#E8C96A' },
          { label: 'Nuevos este mes', value: 3,                                        color: '#3B82F6' },
          { label: 'Con alerta',  value: patients.filter(p => !p.hasDiet).length,      color: '#EF4444' },
        ].map(s => (
          <div key={s.label} className="card p-4 !hover:shadow-none">
            <div className="font-mono text-2xl font-medium" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-[var(--text-tertiary)] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="relative flex-1 min-w-0">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-10 w-full bg-[var(--surface)] border-[var(--border-soft)]"
          />
        </div>
        <div className="tabs-nav flex-shrink-0 overflow-x-auto no-scrollbar">
          {FILTROS.map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setFiltro(f)}
              className={`tab-btn whitespace-nowrap ${filtro === f ? 'active' : ''}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="card !p-0 overflow-hidden border border-[var(--border-soft)] bg-[var(--surface)]">
        <div className="overflow-x-auto">
          <div className="min-w-[680px]">
            <div
              className={`${TABLE_GRID} px-4 py-2.5 border-b border-[var(--border-soft)] bg-[var(--surface)]`}
              role="row"
            >
              {['Paciente', 'Objetivo', 'IMC', 'Última consulta', 'Estado', ''].map((h) => (
                <div
                  key={h || 'acciones'}
                  className="text-2xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)] last:text-right last:pr-0.5"
                >
                  {h}
                </div>
              ))}
            </div>

            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><Users size={28} /></div>
                <div>
                  <div className="text-sm font-semibold text-[var(--text-primary)]">
                    {search ? 'Sin resultados' : 'Sin pacientes aún'}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">
                    {search ? 'Prueba con otro término de búsqueda' : 'Agrega tu primer paciente para comenzar'}
                  </div>
                </div>
                {!search && (
                  <Link to="/pacientes/nuevo" className="btn btn-primary btn-sm gap-1.5 mt-2">
                    <Plus size={13} /> Nuevo paciente
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
                    className={`${TABLE_GRID} px-4 py-3 border-b border-[var(--border-soft)] last:border-0
                      hover:bg-[var(--surface-muted)] transition-colors group`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
                        style={{ background: fg }}
                      >
                        {p.photoUrl
                          ? <img src={p.photoUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                          : initials(p)
                        }
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
                          {p.firstName} {p.lastName}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] truncate hidden sm:block">{p.email}</div>
                      </div>
                    </div>

                    <div className="min-w-0 justify-self-start">
                      <span className="badge badge-neutral text-xs truncate max-w-full inline-block">{p.objective || '—'}</span>
                    </div>

                    <div className="justify-self-start">
                      {imc ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: imcStyle?.color || '#86868b' }} />
                          <span className="font-mono text-sm text-[var(--text-primary)]">{imc}</span>
                        </div>
                      ) : <span className="text-xs text-[var(--text-tertiary)]">—</span>}
                    </div>

                    <div className="text-xs text-[var(--text-secondary)] justify-self-start tabular-nums">
                      {diasDesde !== null
                        ? diasDesde === 0 ? 'Hoy'
                          : diasDesde === 1 ? 'Ayer'
                          : `Hace ${diasDesde}d`
                        : '—'
                      }
                    </div>

                    <div className="justify-self-start">
                      <span className={`badge text-xs ${p.active !== false ? 'badge-success' : 'badge-neutral'}`}>
                        {p.active !== false ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>

                    <div className="flex justify-end">
                      <ChevronRight size={16} className="text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>

      {filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
          <span>Mostrando {filtered.length} de {patients.length}</span>
          <div className="flex gap-1">
            <button type="button" className="px-3 py-1.5 rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] transition-colors">
              Anterior
            </button>
            <button type="button" className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white font-semibold">
              1
            </button>
            <button type="button" className="px-3 py-1.5 rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] transition-colors">
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
