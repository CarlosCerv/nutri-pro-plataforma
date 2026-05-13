import { useState, useEffect } from 'react';
import { Menu, Search, Plus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getPageMeta } from '../../lib/pageMeta';

const QUICK_ACTIONS = [
  { label: 'Nuevo paciente', to: '/pacientes/nuevo' },
  { label: 'Nueva dieta', to: '/dietas/nueva' },
  { label: 'Nueva cita', to: '/agenda/nueva' },
];

/** Rutas con búsqueda propia en el contenido: evita duplicar el campo del topbar. */
const HIDE_TOOLBAR_SEARCH = [/^\/pacientes$/, /^\/agenda$/, /^\/finanzas$/, /^\/dietas\/nueva$/];

export default function Topbar({ onMenuToggle }) {
  const [quickOpen, setQuickOpen] = useState(false);
  const location = useLocation();
  const meta = getPageMeta(location.pathname);
  const hideToolbarSearch = HIDE_TOOLBAR_SEARCH.some((re) => re.test(location.pathname));

  useEffect(() => {
    setQuickOpen(false);
  }, [location.pathname]);

  return (
    <header
      className="
      flex-shrink-0 sticky top-0 z-30 supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)]
      border-b border-[var(--border-soft)]
      bg-[var(--surface)]
    "
    >
      <div className="px-3 md:px-4 lg:px-5 py-2.5 md:py-3 flex flex-col gap-2.5 min-w-0">
        <div className="flex items-start gap-2 md:gap-3 min-w-0">
          <button
            type="button"
            className="lg:hidden btn btn-ghost shrink-0 min-h-11 min-w-11 px-0 rounded-xl -ml-1 mt-0.5"
            onClick={() => onMenuToggle((prev) => !prev)}
            aria-label="Abrir menú"
          >
            <Menu size={20} strokeWidth={1.75} />
          </button>

          <div className="min-w-0 flex-1 space-y-1">
            <h1 className="text-base md:text-lg font-semibold text-[var(--text-primary)] tracking-apple-tight leading-snug">
              {meta.title}
            </h1>

            {meta.subtitle ? (
              <p className="text-2xs md:text-xs text-[var(--text-secondary)] leading-relaxed max-w-2xl">
                {meta.subtitle}
              </p>
            ) : null}
          </div>

          <div className="relative shrink-0 self-start pt-0.5">
            <button
              type="button"
              onClick={() => setQuickOpen((v) => !v)}
              className="btn btn-primary btn-sm min-h-11 px-3 md:inline-flex gap-1.5"
              aria-expanded={quickOpen}
              aria-haspopup="menu"
            >
              <Plus size={16} strokeWidth={1.75} />
              <span className="hidden sm:inline">Nuevo</span>
            </button>
            {quickOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-[var(--text-primary)]/[0.04]"
                  onClick={() => setQuickOpen(false)}
                  aria-hidden
                />
                <div
                  role="menu"
                  className="absolute right-0 top-12 z-50 w-[min(calc(100vw-2rem),18rem)] bg-[var(--surface)] border border-[var(--border-soft)] rounded-xl shadow-card-hover overflow-hidden animate-scale-in"
                >
                  {QUICK_ACTIONS.map((a) => (
                    <Link
                      key={a.to}
                      role="menuitem"
                      to={a.to}
                      onClick={() => setQuickOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-3.5 min-h-[48px] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors border-b border-[var(--border-soft)] last:border-0"
                    >
                      <Plus size={14} className="text-[var(--accent)] shrink-0" strokeWidth={1.75} />
                      <span className="truncate">{a.label}</span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {!hideToolbarSearch && (
        <div className="hidden md:block w-full max-w-md lg:max-w-lg min-w-0">
          <div className="relative w-full">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none"
              strokeWidth={1.75}
            />
            <input
              type="search"
              name="q"
              autoComplete="off"
              placeholder="Buscar"
              className="input pl-9 py-2 text-sm min-h-11 w-full bg-[var(--surface-muted)] border-[var(--border-soft)]"
              aria-label="Búsqueda"
              enterKeyHint="search"
            />
          </div>
        </div>
        )}
      </div>
    </header>
  );
}
