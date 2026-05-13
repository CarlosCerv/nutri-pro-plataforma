import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  UtensilsCrossed,
  Calculator,
  FileText,
  BarChart3,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
  Apple,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../../components/Logo';

const NAV_ITEMS = [
  {
    section: 'Principal',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Panel' },
      { to: '/pacientes', icon: Users, label: 'Pacientes' },
      { to: '/agenda', icon: CalendarDays, label: 'Agenda' },
      { to: '/finanzas', icon: Wallet, label: 'Finanzas' },
    ],
  },
  {
    section: 'Clínica',
    items: [
      { to: '/dietas', icon: UtensilsCrossed, label: 'Dietas' },
      { to: '/alimentos', icon: Apple, label: 'Alimentos' },
      { to: '/calculos', icon: Calculator, label: 'Calculadoras' },
      { to: '/reportes', icon: FileText, label: 'Reportes PDF' },
    ],
  },
  {
    section: 'Cuenta',
    items: [
      { to: '/reportes-poblacionales', icon: BarChart3, label: 'Estadísticas' },
      { to: '/perfil', icon: UserCircle, label: 'Cuenta y ajustes' },
      { to: '/admin/licencias', icon: ShieldCheck, label: 'Admin', adminOnly: true },
    ],
  },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    onClose?.();
  }, [location.pathname, onClose]);

  useEffect(() => {
    const check = () => {
      if (window.innerWidth < 1024) setCollapsed(false);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const isAdmin = user?.role === 'admin';
  const sidebarW = collapsed ? 'w-[72px]' : 'w-[260px]';

  const NavItem = ({ item }) => {
    if (item.adminOnly && !isAdmin) return null;

    return (
      <NavLink
        to={item.to}
        className={({ isActive }) =>
          `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
           font-sans text-sm font-medium select-none border border-transparent min-h-11
           ${
             isActive
               ? 'bg-[rgba(0,113,227,0.1)] text-[var(--accent)] border-[rgba(0,113,227,0.2)]'
               : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)]'
           }`
        }
      >
        <item.icon
          size={18}
          strokeWidth={1.75}
          className={`flex-shrink-0 transition-all duration-200 ${collapsed ? 'mx-auto' : ''}`}
        />
        {!collapsed && <span className="truncate">{item.label}</span>}
        {collapsed && (
          <div
            className="
            absolute left-[calc(100%+10px)] px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap
            bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border-soft)] shadow-card
            opacity-0 pointer-events-none z-50 transition-all duration-150 translate-x-0.5
            group-hover:opacity-100 group-hover:translate-x-0
          "
          >
            {item.label}
          </div>
        )}
      </NavLink>
    );
  };

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'NP';

  const sidebarContent = (
    <div
      className={`${sidebarW} flex flex-col h-full max-h-[100dvh] bg-[var(--surface)] border-r border-[var(--border-soft)] transition-all duration-300 overflow-hidden flex-shrink-0`}
    >
      <div
        className={`flex items-center ${collapsed ? 'justify-center px-2' : 'justify-between px-4'} py-4 border-b border-[var(--border-soft)]`}
      >
        <div className={`flex min-w-0 items-center ${collapsed ? 'justify-center' : 'gap-2'}`}>
          {collapsed ? (
            <img
              src="/brand-icon.svg?v=6"
              width={30}
              height={30}
              alt="NutriPro"
              className="rounded-[9px] shadow-sm ring-1 ring-black/[0.06]"
            />
          ) : (
            <Logo size="sm" showText />
          )}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-all duration-200"
          aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
        >
          {collapsed ? <ChevronRight size={16} strokeWidth={1.75} /> : <ChevronLeft size={16} strokeWidth={1.75} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 no-scrollbar">
        {NAV_ITEMS.map((group) => (
          <div key={group.section} className="mb-4">
            {!collapsed && (
              <div className="px-3 mb-1.5 text-2xs font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
                {group.section}
              </div>
            )}
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <NavItem key={item.to} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-2 py-3 border-t border-[var(--border-soft)] bg-[var(--surface-muted)]/40">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-1'} mb-2`}>
          <div className="w-9 h-9 rounded-full bg-[var(--accent)] text-white flex-shrink-0 flex items-center justify-center shadow-[0_6px_16px_rgba(0,113,227,0.22)]">
            <span className="text-xs font-bold font-mono">{initials}</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-[var(--text-primary)] truncate">{user?.name || 'Nutrición'}</div>
              <div className="text-2xs text-[var(--text-tertiary)] truncate">{user?.email || ''}</div>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={logout}
          className={`
            flex items-center gap-2.5 w-full px-3 py-3 rounded-xl border border-transparent min-h-11
            text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[rgba(196,30,22,0.08)]
            transition-all duration-200
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut size={15} strokeWidth={1.75} />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:flex">{sidebarContent}</div>

      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-[var(--text-primary)]/10 backdrop-blur-sm lg:hidden" onClick={onClose} />
          <div className="fixed inset-y-0 left-0 z-50 flex lg:hidden animate-slide-in-left shadow-card-hover max-w-[min(100vw,20rem)] w-full">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}
