import { useState } from 'react';
import { Menu, Search, Plus, ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getPageMeta } from '../../lib/pageMeta';

const QUICK_ACTIONS = [
  { label: 'Nuevo paciente', to: '/pacientes/nuevo' },
  { label: 'Nueva dieta', to: '/dietas/nueva' },
  { label: 'Nueva cita', to: '/agenda/nueva' },
];

export default function Topbar({ onMenuToggle }) {
  const [quickOpen, setQuickOpen] = useState(false);
  const location = useLocation();
  const meta = getPageMeta(location.pathname);

  return (
    <header
      className="
      min-h-[52px] h-[52px] md:min-h-14 md:h-14 flex-shrink-0 flex items-center gap-2 md:gap-3 px-3 md:px-4 lg:px-5
      bg-[var(--surface)]/95 backdrop-blur-xl border-b border-[var(--border-soft)]
      sticky top-0 z-30 supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)]
    "
    >
      <button
        type="button"
        className="lg:hidden btn btn-ghost shrink-0 min-h-11 min-w-11 px-0 rounded-xl -ml-1"
        onClick={() => onMenuToggle((prev) => !prev)}
        aria-label="Abrir menú"
      >
        <Menu size={20} strokeWidth={1.75} />
      </button>

      <div className="hidden sm:flex flex-col min-w-0 flex-1 md:max-w-[min(380px,52vw)] lg:max-w-[min(420px,40vw)]">
        <nav
          className="flex items-center gap-1 text-2xs text-[var(--text-tertiary)] font-medium mb-0.5"
          aria-label="Migas de pan"
        >
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-1 min-h-8 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors"
          >
            <Home size={12} strokeWidth={1.75} aria-hidden />
            Inicio
          </Link>
          {meta.trail?.map((crumb) => (
            <span key={crumb.to} className="inline-flex items-center gap-1 min-w-0">
              <ChevronRight size={12} className="shrink-0 opacity-60" aria-hidden />
              <Link
                to={crumb.to}
                className="truncate rounded-md px-1.5 py-1 min-h-8 inline-flex items-center hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors"
              >
                {crumb.label}
              </Link>
            </span>
          ))}
        </nav>
        <div className="flex items-baseline gap-2 min-w-0">
          <h1 className="text-base md:text-lg font-semibold text-[var(--text-primary)] tracking-apple-tight truncate leading-tight">
            {meta.title}
          </h1>
        </div>
        {meta.subtitle && (
          <p className="text-2xs text-[var(--text-secondary)] truncate hidden lg:block leading-snug">
            {meta.subtitle}
          </p>
        )}
      </div>

      <div className="flex sm:hidden flex-1 min-w-0 pr-1">
        <h1 className="text-sm font-semibold text-[var(--text-primary)] tracking-apple-tight truncate leading-tight">
          {meta.title}
        </h1>
      </div>

      <div className="hidden md:flex flex-1 justify-end max-w-sm lg:max-w-md mx-1 lg:mx-4 min-w-0">
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
            placeholder="Buscar…"
            className="input pl-9 py-2 text-sm min-h-11 bg-[var(--surface-muted)] border-[var(--border-soft)]"
            aria-label="Búsqueda"
            enterKeyHint="search"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <div className="relative">
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
              <div className="fixed inset-0 z-40" onClick={() => setQuickOpen(false)} aria-hidden />
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
    </header>
  );
}
