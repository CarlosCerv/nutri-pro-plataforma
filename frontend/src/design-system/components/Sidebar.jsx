import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, CalendarDays, Salad, UtensilsCrossed,
  Calculator, FileText, BarChart3, Settings, UserCircle,
  ChevronLeft, ChevronRight, LogOut, ShieldCheck, Apple,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const NAV_ITEMS = [
  {
    section: 'Principal',
    items: [
      { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/pacientes',  icon: Users,            label: 'Pacientes' },
      { to: '/agenda',     icon: CalendarDays,     label: 'Agenda' },
    ],
  },
  {
    section: 'Clínico',
    items: [
      { to: '/dietas',     icon: UtensilsCrossed,  label: 'Dietas' },
      { to: '/alimentos',  icon: Apple,            label: 'Alimentos' },
      { to: '/calculos',   icon: Calculator,       label: 'Calculadoras' },
      { to: '/reportes',   icon: FileText,         label: 'Reportes PDF' },
    ],
  },
  {
    section: 'Cuenta',
    items: [
      { to: '/reportes-poblacionales', icon: BarChart3,  label: 'Estadísticas' },
      { to: '/perfil',                 icon: UserCircle, label: 'Mi Perfil' },
      { to: '/configuracion',          icon: Settings,   label: 'Configuración' },
      { to: '/admin/licencias',        icon: ShieldCheck, label: 'Admin', adminOnly: true },
    ],
  },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => { onClose?.(); }, [location.pathname, onClose]);

  // Detect small screens → force expand
  useEffect(() => {
    const check = () => { if (window.innerWidth < 1024) setCollapsed(false); };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const isAdmin = user?.role === 'admin';
  const sidebarW = collapsed ? 'w-[70px]' : 'w-64';

  const NavItem = ({ item }) => {
    if (item.adminOnly && !isAdmin) return null;
    return (
      <NavLink
        to={item.to}
        className={({ isActive }) =>
          `group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
           font-sans text-sm font-medium select-none
           ${isActive
             ? 'bg-emerald/15 text-emerald border border-emerald/20 shadow-emerald-sm'
             : 'text-white/50 hover:text-white/90 hover:bg-white/5'
           }`
        }
      >
        <item.icon
          size={18}
          className={`flex-shrink-0 transition-all duration-200
            ${collapsed ? 'mx-auto' : ''}`}
        />
        {!collapsed && <span className="truncate">{item.label}</span>}
        {collapsed && (
          <div className={`
            absolute left-[74px] px-2.5 py-1.5 bg-navy-800 border border-navy-600
            rounded-lg text-xs font-semibold text-white whitespace-nowrap shadow-navy-md
            opacity-0 group-hover:opacity-100 pointer-events-none z-50
            transition-all duration-150 translate-x-1 group-hover:translate-x-0
          `}>
            {item.label}
          </div>
        )}
      </NavLink>
    );
  };

  const sidebarContent = (
    <div className={`
      ${sidebarW} flex flex-col h-full bg-navy-900 border-r border-navy-700/50
      transition-all duration-300 overflow-hidden flex-shrink-0
    `}>
      {/* Logo + Collapse toggle */}
      <div className={`flex items-center ${collapsed ? 'justify-center px-3' : 'justify-between px-5'} py-5 border-b border-navy-700/50`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-emerald flex items-center justify-center shadow-emerald-sm">
              <Salad size={16} className="text-navy-950" />
            </div>
            <div>
              <div className="font-display font-bold text-base text-white leading-none">NutriPro</div>
              <div className="text-2xs text-white/30 font-sans mt-0.5">v2.0</div>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-xl bg-gradient-emerald flex items-center justify-center shadow-emerald-sm">
            <Salad size={16} className="text-navy-950" />
          </div>
        )}
        {/* Collapse toggle — solo desktop */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex w-6 h-6 items-center justify-center rounded-lg
                     text-white/30 hover:text-white/70 hover:bg-white/5 transition-all duration-200"
        >
          {collapsed
            ? <ChevronRight size={14} />
            : <ChevronLeft  size={14} />
          }
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2.5 no-scrollbar">
        {NAV_ITEMS.map((group) => (
          <div key={group.section} className="mb-5">
            {!collapsed && (
              <div className="px-3 mb-2 text-2xs font-bold text-white/25 uppercase tracking-[0.08em]">
                {group.section}
              </div>
            )}
            <div className="flex flex-col gap-0.5 relative">
              {group.items.map((item) => (
                <NavItem key={item.to} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User info + Logout */}
      <div className="px-2.5 py-4 border-t border-navy-700/50">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-2'} mb-2`}>
          <div className="w-8 h-8 rounded-full bg-gradient-emerald flex-shrink-0 flex items-center justify-center">
            <span className="text-xs font-bold text-navy-950 font-mono">
              {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'NP'}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">{user?.name || 'Nutriólogo'}</div>
              <div className="text-2xs text-white/30 truncate">{user?.email || ''}</div>
            </div>
          )}
        </div>
        <button
          onClick={logout}
          className={`
            flex items-center gap-2.5 w-full px-3 py-2 rounded-xl
            text-xs font-semibold text-white/40 hover:text-danger hover:bg-danger/10
            transition-all duration-200
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut size={15} />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-navy-950/80 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
          <div className="fixed inset-y-0 left-0 z-50 flex lg:hidden animate-slide-in-left">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}
