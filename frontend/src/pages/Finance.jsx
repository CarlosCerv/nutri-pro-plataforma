import { Wallet, TrendingUp, TrendingDown, Clock } from 'lucide-react';

export default function Finance() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="page-header">
        <h1 className="page-title">Finanzas</h1>
        <p className="page-subtitle">Gestiona ingresos, gastos y cobros de pacientes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-5 !hover:shadow-none">
          <div className="text-2xs font-bold text-white/30 uppercase tracking-wide mb-2 flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald" /> Ingresos este mes
          </div>
          <div className="font-mono text-3xl text-emerald">$12,450<span className="text-sm text-emerald/50">MXN</span></div>
        </div>
        <div className="card p-5 !hover:shadow-none">
          <div className="text-2xs font-bold text-white/30 uppercase tracking-wide mb-2 flex items-center gap-2">
            <TrendingDown size={14} className="text-danger" /> Gastos este mes
          </div>
          <div className="font-mono text-3xl text-danger">$3,200<span className="text-sm text-danger/50">MXN</span></div>
        </div>
        <div className="card p-5 !hover:shadow-none bg-gold/5 border-gold/20">
          <div className="text-2xs font-bold text-gold/60 uppercase tracking-wide mb-2 flex items-center gap-2">
            <Wallet size={14} className="text-gold" /> Balance neto
          </div>
          <div className="font-mono text-3xl text-gold">$9,250<span className="text-sm text-gold/50">MXN</span></div>
        </div>
      </div>

      <div className="empty-state border border-dashed border-navy-700 bg-navy-800/30">
        <Clock size={32} className="text-white/20 mb-3" />
        <div className="text-sm font-semibold text-white/50">Módulo en Desarrollo (Fase 2)</div>
        <div className="text-xs text-white/30 mt-1 max-w-sm mx-auto">
          Próximamente podrás generar links de pago, facturar y llevar el control automático de las mensualidades de tus pacientes desde aquí.
        </div>
      </div>
    </div>
  );
}
