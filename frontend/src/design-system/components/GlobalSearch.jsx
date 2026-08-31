import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User } from 'lucide-react';
import { patientsAPI } from '../../services/api';

/**
 * Búsqueda global de pacientes desde la barra superior.
 *
 * Antes esta caja era decorativa: no tenía `onSubmit`, no filtraba nada y no
 * llevaba a ningún lado. Un campo de búsqueda que no busca es peor que no
 * tenerlo, porque el usuario lo intenta y concluye que la aplicación está
 * rota.
 *
 * La lista de pacientes se pide una sola vez, al primer foco, y se filtra en
 * el cliente: una consulta tiene decenas o cientos de pacientes, no miles, y
 * así el resultado aparece mientras se escribe.
 */
export default function GlobalSearch({ className = '' }) {
  const [query, setQuery] = useState('');
  const [pacientes, setPacientes] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);
  const rootRef = useRef(null);
  const navigate = useNavigate();
  const listId = useId();

  useEffect(() => {
    if (!abierto) return undefined;
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [abierto]);

  const cargar = async () => {
    if (pacientes !== null || cargando) return;
    setCargando(true);
    try {
      const res = await patientsAPI.getAll();
      setPacientes(res.data?.data || []);
    } catch {
      setPacientes([]);
    } finally {
      setCargando(false);
    }
  };

  const q = query.trim().toLowerCase();
  const resultados = !q
    ? []
    : (pacientes || [])
        .filter((p) =>
          `${p.firstName || ''} ${p.lastName || ''} ${p.email || ''} ${p.phone || ''}`.toLowerCase().includes(q)
        )
        .slice(0, 8);

  const ir = (paciente) => {
    setAbierto(false);
    setQuery('');
    navigate(`/pacientes/${paciente._id}`);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      setAbierto(false);
    } else if (e.key === 'ArrowDown' && resultados.length > 0) {
      e.preventDefault();
      setActivo((i) => (i + 1) % resultados.length);
    } else if (e.key === 'ArrowUp' && resultados.length > 0) {
      e.preventDefault();
      setActivo((i) => (i <= 0 ? resultados.length - 1 : i - 1));
    } else if (e.key === 'Enter' && resultados[activo]) {
      e.preventDefault();
      ir(resultados[activo]);
    }
  };

  return (
    <div className={['relative', className].filter(Boolean).join(' ')} ref={rootRef}>
      <Search
        size={15}
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-secondary)]"
      />
      <input
        type="search"
        role="combobox"
        aria-expanded={abierto && q.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        value={query}
        onFocus={() => {
          setAbierto(true);
          cargar();
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setActivo(0);
          setAbierto(true);
        }}
        onKeyDown={onKeyDown}
        placeholder="Buscar paciente"
        aria-label="Buscar paciente"
        enterKeyHint="search"
        className="input min-h-11 w-full bg-[var(--surface-alt)] py-2 pl-9 text-sm"
      />

      {abierto && q.length > 0 ? (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-40 overflow-hidden rounded-[var(--radius-m)] border border-[var(--border-soft)] bg-[var(--surface)] shadow-card animate-scale-in"
        >
          {cargando ? (
            <p className="px-4 py-3 text-sm text-[var(--ink-secondary)]">Cargando pacientes…</p>
          ) : resultados.length === 0 ? (
            <p className="px-4 py-3 text-sm text-[var(--ink-secondary)]">Ningún paciente coincide con «{query}»</p>
          ) : (
            <ul className="max-h-72 overflow-y-auto py-1">
              {resultados.map((p, i) => (
                <li key={p._id} role="option" aria-selected={i === activo}>
                  <button
                    type="button"
                    onClick={() => ir(p)}
                    onMouseEnter={() => setActivo(i)}
                    className={[
                      'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-micro',
                      i === activo ? 'bg-[var(--surface-alt)]' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--surface-strong)] text-[var(--ink-secondary)]">
                      <User size={15} aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-[var(--ink)]">
                        {p.firstName} {p.lastName}
                      </span>
                      {p.email || p.phone ? (
                        <span className="block truncate text-xs text-[var(--ink-secondary)]">{p.email || p.phone}</span>
                      ) : null}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
