import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Megaphone, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../../components/Logo';

/**
 * Layout propio del panel de administrador, deliberadamente separado del
 * `Sidebar`/`Topbar` de nutriólogo: esos dos están acoplados al dominio de
 * nutriólogo (quick actions de "nuevo paciente/dieta/cita", búsqueda de
 * pacientes) y no tienen sentido aquí. Comparte las clases de grid
 * `.app-layout`/`.main-content`/`.content-area` de index.css para no
 * reinventar el layout de página completa.
 */
const NAV_ITEMS = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/nutriologos', icon: Users, label: 'Nutriólogos' },
  { to: '/admin/campanas', icon: Megaphone, label: 'Campañas' },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="app-layout">
      <div className="hidden w-[220px] shrink-0 flex-col border-r border-[var(--border-soft)] bg-[var(--surface)] md:flex">
        <div className="flex items-center gap-2 border-b border-[var(--border-soft)] px-4 py-4">
          <Logo size="sm" showText />
        </div>
        <nav className="flex-1 space-y-0.5 p-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-micro ${
                  isActive
                    ? 'bg-[rgba(0,113,227,0.1)] text-[var(--accent)]'
                    : 'text-[var(--ink-muted)] hover:bg-[var(--surface-alt)] hover:text-[var(--ink)]'
                }`
              }
            >
              <item.icon size={17} strokeWidth={1.75} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-[var(--border-soft)] p-3">
          <div className="mb-2 truncate px-1 text-xs text-[var(--ink-secondary)]">{user?.email}</div>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-[var(--ink-muted)] transition-colors duration-micro hover:bg-[rgba(196,30,22,0.08)] hover:text-[var(--danger)]"
          >
            <LogOut size={15} strokeWidth={1.75} />
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="flex items-center justify-between border-b border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3 md:hidden">
          <Logo size="sm" showText />
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 text-xs font-semibold text-[var(--ink-muted)]"
          >
            <LogOut size={14} strokeWidth={1.75} />
            Salir
          </button>
        </div>
        <main className="content-area" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
