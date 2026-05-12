import { useState } from 'react';
import { Menu, Bell, Search, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const QUICK_ACTIONS = [
  { label: 'Nuevo paciente', to: '/pacientes/nuevo' },
  { label: 'Nueva dieta', to: '/dietas/nueva' },
  { label: 'Nueva cita', to: '/agenda/nueva' },
];

export default function Topbar({ onMenuToggle }) {
  const [quickOpen, setQuickOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="
      h-14 flex-shrink-0 flex items-center justify-between px-4 lg:px-6
      bg-white/95 backdrop-blur-xl border-b border-navy-700/50
      sticky top-0 z-30
    ">
      <button
        className="lg:hidden btn-icon btn btn-ghost"
        onClick={() => onMenuToggle(prev => !prev)}
        aria-label="Menu"
      >
        <Menu size={18} />
      </button>

      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Buscar paciente, dieta o cita"
            className="input pl-9 py-1.5 text-sm h-9 bg-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => { setQuickOpen(v => !v); setNotifOpen(false); }}
            className="btn btn-primary btn-sm hidden md:inline-flex"
            aria-expanded={quickOpen}
          >
            <Plus size={14} />
            Nuevo
          </button>
          {quickOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setQuickOpen(false)} />
              <div className="absolute right-0 top-10 z-50 w-48 bg-white border border-navy-700 rounded-xl shadow-navy-lg overflow-hidden animate-scale-in">
                {QUICK_ACTIONS.map(a => (
                  <Link
                    key={a.to}
                    to={a.to}
                    onClick={() => setQuickOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Plus size={14} className="text-info" />
                    {a.label}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => { setNotifOpen(v => !v); setQuickOpen(false); }}
            className="btn-icon btn btn-ghost relative"
            aria-label="Notificaciones"
            aria-expanded={notifOpen}
          >
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-info" />
          </button>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-11 z-50 w-72 bg-white border border-navy-700 rounded-2xl shadow-navy-lg overflow-hidden animate-scale-in">
                <div className="px-4 py-3 border-b border-navy-700/50 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Notificaciones</span>
                  <span className="badge badge-info text-2xs">2 nuevas</span>
                </div>
                <div className="py-1">
                  {[
                    { msg: 'Cita con Maria G. en 2 horas', time: 'Hace 5 min' },
                    { msg: 'Juan Lopez subio fotos de progreso', time: 'Hace 1 hora' },
                  ].map((n) => (
                    <div key={n.msg} className="px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer">
                      <div className="text-xs text-white/80 font-medium">{n.msg}</div>
                      <div className="text-2xs text-white/30 mt-0.5">{n.time}</div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-navy-700/50">
                  <button className="text-xs text-info hover:text-blue-600 font-semibold w-full text-center">
                    Ver todas
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
