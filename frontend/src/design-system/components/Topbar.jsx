import { useState } from 'react';
import { Menu, Bell, Search, Sun, Moon, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const QUICK_ACTIONS = [
  { label: 'Nuevo Paciente', to: '/pacientes/nuevo' },
  { label: 'Nueva Dieta',    to: '/dietas/nueva'   },
  { label: 'Nueva Cita',     to: '/agenda/nueva'   },
];

export default function Topbar({ onMenuToggle, darkMode, onToggleDark }) {
  const [quickOpen, setQuickOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="
      h-14 flex-shrink-0 flex items-center justify-between px-4 lg:px-6
      bg-navy-900/95 backdrop-blur-sm border-b border-navy-700/50
      sticky top-0 z-30
    ">
      {/* Left: hamburger (mobile) */}
      <button
        className="lg:hidden btn-icon btn text-white/50 hover:text-white hover:bg-white/5"
        onClick={() => onMenuToggle(prev => !prev)}
        aria-label="Menú"
      >
        <Menu size={18} />
      </button>

      {/* Center: Search */}
      <div className="hidden md:flex flex-1 max-w-sm mx-4">
        <div className="relative w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Buscar paciente, dieta..."
            className="input pl-9 py-1.5 text-sm bg-navy-800/70 border-navy-700/50 h-9"
          />
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5">
        {/* Quick add */}
        <div className="relative">
          <button
            onClick={() => { setQuickOpen(v => !v); setNotifOpen(false); }}
            className="btn btn-primary btn-sm hidden md:inline-flex gap-1.5"
          >
            <Plus size={14} />
            <span>Nuevo</span>
          </button>
          {quickOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setQuickOpen(false)} />
              <div className="absolute right-0 top-10 z-50 w-48 bg-navy-800 border border-navy-700 rounded-xl shadow-navy-lg overflow-hidden animate-scale-in">
                {QUICK_ACTIONS.map(a => (
                  <Link
                    key={a.to}
                    to={a.to}
                    onClick={() => setQuickOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Plus size={14} className="text-emerald" />
                    {a.label}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(v => !v); setQuickOpen(false); }}
            className="btn-icon btn text-white/50 hover:text-white hover:bg-white/5 relative"
            aria-label="Notificaciones"
          >
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald" />
          </button>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-11 z-50 w-72 bg-navy-800 border border-navy-700 rounded-2xl shadow-navy-lg overflow-hidden animate-scale-in">
                <div className="px-4 py-3 border-b border-navy-700/50 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Notificaciones</span>
                  <span className="badge badge-success text-2xs">2 nuevas</span>
                </div>
                <div className="py-1">
                  {[
                    { msg: 'Cita con María G. en 2 horas', time: 'Hace 5 min', tipo: 'agenda' },
                    { msg: 'Juan López subió 3 fotos de progreso', time: 'Hace 1 hora', tipo: 'seguimiento' },
                  ].map((n, i) => (
                    <div key={i} className="px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer">
                      <div className="text-xs text-white/80 font-medium">{n.msg}</div>
                      <div className="text-2xs text-white/30 mt-0.5">{n.time}</div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-navy-700/50">
                  <button className="text-xs text-emerald hover:text-emerald-300 font-semibold w-full text-center">
                    Ver todas
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={onToggleDark}
          className="btn-icon btn text-white/50 hover:text-white hover:bg-white/5"
          aria-label="Modo oscuro"
        >
          {darkMode ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  );
}
