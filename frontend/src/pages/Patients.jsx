import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Search, Users, ChevronRight,
} from 'lucide-react';
import api from '../services/api';
import { calcularIMC, clasificarIMC } from '../lib/calculations/imc';
import { Card } from '../design-system/components';

const FILTROS = ['Todos', 'Activos', 'Sin dieta', 'Con alerta'];

/**
 * "Con alerta" son los pacientes con algo clínicamente relevante ya
 * registrado: alguna patología, alergia o intolerancia. Antes este filtro
 * caía en el `return true` por defecto, así que era indistinguible de
 * "Todos" y el usuario no tenía forma de saberlo.
 */
const tieneAlerta = (p) =>
  (p.patologias?.length || 0) > 0 ||
  Boolean(p.alergias?.trim()) ||
  Boolean(p.intolerancias?.trim());

/** Misma cuadrícula en cabecera y filas (scroll horizontal en pantallas angostas). */
const TABLE_GRID =
  'grid grid-cols-[minmax(200px,1fr)_108px_72px_96px_80px_32px] gap-x-3 items-center';

/**
 * El IMC y su clasificación vienen de `lib/calculations/imc`, no de una copia
 * local. Esta pantalla tenía las dos funciones duplicadas con sus propios
 * umbrales y su propia tabla de colores; la del `lib` es la que cubren las
 * pruebas y la que usa el resto de la aplicación.
 */
const imcDe = (peso, talla) => (peso && talla ? calcularIMC(peso, talla).toFixed(1) : null);

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

  /**
   * Antes este contador era el literal `3`.
   *
   * Se calcula sobre `createdAt`, que el backend ya devuelve en cada paciente
   * (`Patient.js` lo declara y `getPatients` no proyecta campos fuera).
   */
  const nuevosEsteMes = patients.filter((p) => {
    if (!p.createdAt) return false;
    const alta = new Date(p.createdAt);
    const hoy = new Date();
    return alta.getFullYear() === hoy.getFullYear() && alta.getMonth() === hoy.getMonth();
  }).length;

  const filtered = patients.filter(p => {
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    const matchSearch = fullName.includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase()) ||
      p.phone?.includes(search);
    if (!matchSearch) return false;
    if (filtro === 'Activos')    return p.active !== false;
    if (filtro === 'Sin dieta')  return !p.hasDiet;
    if (filtro === 'Con alerta') return tieneAlerta(p);
    return true;
  });

  const initials = (p) =>
    `${p.firstName?.[0] || ''}${p.lastName?.[0] || ''}`.toUpperCase();

  // Los avatares no codifican información: usan la superficie neutra del
  // sistema en vez de una paleta propia de seis colores de marca.
  const colorFor = () => 'var(--surface-strong)';

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-sm text-[var(--ink-muted)]">
          {patients.length} {patients.length === 1 ? 'paciente registrado' : 'pacientes registrados'}
        </p>
        <Link to="/pacientes/nuevo" className="btn btn-primary gap-2 self-start sm:self-auto">
          <Plus size={16} />
          Nuevo paciente
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: patients.length, color: 'var(--ink)' },
          { label: 'Activos', value: patients.filter((p) => p.active !== false).length, color: 'var(--success)' },
          { label: 'Nuevos este mes', value: nuevosEsteMes, color: 'var(--accent)' },
          { label: 'Con alerta', value: patients.filter(tieneAlerta).length, color: 'var(--danger)' },
        ].map(s => (
          <Card key={s.label} className="p-4 !hover:shadow-none">
            <div className="font-mono text-2xl font-medium" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-[var(--ink-secondary)] mt-0.5">{s.label}</div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="relative flex-1 min-w-0">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-secondary)] pointer-events-none" />
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

      <Card className="!p-0 overflow-hidden border border-[var(--border-soft)] bg-[var(--surface)]">
        <div className="overflow-x-auto">
          <div className="min-w-[680px]">
            <div
              className={`${TABLE_GRID} px-4 py-2.5 border-b border-[var(--border-soft)] bg-[var(--surface)]`}
              role="row"
            >
              {['Paciente', 'Objetivo', 'IMC', 'Última consulta', 'Estado', ''].map((h) => (
                <div
                  key={h || 'acciones'}
                  className="text-2xs font-semibold uppercase tracking-wide text-[var(--ink-secondary)] last:text-right last:pr-0.5"
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
                  <div className="text-sm font-semibold text-[var(--ink)]">
                    {search ? 'Sin resultados' : 'Sin pacientes aún'}
                  </div>
                  <div className="text-xs text-[var(--ink-muted)] mt-1 max-w-sm mx-auto">
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
                const imc = imcDe(p.lastWeight, p.height);
                const imcStyle = imc ? clasificarIMC(parseFloat(imc)) : null;
                const fg = colorFor(p.firstName);
                const diasDesde = p.lastConsult
                  ? Math.floor((Date.now() - new Date(p.lastConsult)) / 86400000)
                  : null;

                return (
                  <Link
                    key={p._id}
                    to={`/pacientes/${p._id}`}
                    className={`${TABLE_GRID} px-4 py-3 border-b border-[var(--border-soft)] last:border-0
                      hover:bg-[var(--surface-alt)] transition-colors group`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold text-[var(--ink-muted)]"
                        style={{ background: fg }}
                      >
                        {p.photoUrl
                          ? <img src={p.photoUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                          : initials(p)
                        }
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[var(--ink)] truncate group-hover:text-[var(--accent)] transition-colors">
                          {p.firstName} {p.lastName}
                        </div>
                        <div className="text-xs text-[var(--ink-muted)] truncate hidden sm:block">{p.email}</div>
                      </div>
                    </div>

                    <div className="min-w-0 justify-self-start">
                      <span className="badge badge-neutral text-xs truncate max-w-full inline-block">{p.objective || '—'}</span>
                    </div>

                    <div className="justify-self-start">
                      {imc ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: imcStyle?.color || 'var(--ink-secondary)' }} />
                          <span className="font-mono text-sm text-[var(--ink)]">{imc}</span>
                        </div>
                      ) : <span className="text-xs text-[var(--ink-secondary)]">—</span>}
                    </div>

                    <div className="text-xs text-[var(--ink-muted)] justify-self-start tabular-nums">
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
                      <ChevronRight size={16} className="text-[var(--ink-secondary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </Card>

      {filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[var(--ink-muted)]">
          <span>Mostrando {filtered.length} de {patients.length}</span>
          <div className="flex gap-1">
            <button type="button" className="px-3 py-1.5 rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] text-[var(--ink-muted)] hover:bg-[var(--surface-alt)] transition-colors">
              Anterior
            </button>
            <button type="button" className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white font-semibold">
              1
            </button>
            <button type="button" className="px-3 py-1.5 rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] text-[var(--ink-muted)] hover:bg-[var(--surface-alt)] transition-colors">
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
