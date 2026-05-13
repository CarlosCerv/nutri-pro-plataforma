import { Wallet, TrendingUp, TrendingDown, Clock } from 'lucide-react';

export default function Finance() {
  return (
    <div className="space-y-6 animate-fade-up">
      <p className="text-sm text-[var(--text-secondary)]">
        Resumen mensual (datos de ejemplo hasta activar cobros).
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="card p-5 !hover:shadow-none border border-[var(--border-soft)]">
          <div className="mb-2 flex items-center gap-2 text-2xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
            <TrendingUp size={14} className="text-[#34C759]" strokeWidth={1.75} />
            Ingresos este mes
          </div>
          <div className="font-mono text-2xl font-medium text-[var(--text-primary)] sm:text-3xl">
            $12,450
            <span className="ml-1 text-sm font-normal text-[var(--text-tertiary)]">MXN</span>
          </div>
        </div>
        <div className="card p-5 !hover:shadow-none border border-[var(--border-soft)]">
          <div className="mb-2 flex items-center gap-2 text-2xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
            <TrendingDown size={14} className="text-[var(--danger)]" strokeWidth={1.75} />
            Gastos este mes
          </div>
          <div className="font-mono text-2xl font-medium text-[var(--text-primary)] sm:text-3xl">
            $3,200
            <span className="ml-1 text-sm font-normal text-[var(--text-tertiary)]">MXN</span>
          </div>
        </div>
        <div className="card p-5 !hover:shadow-none border border-[var(--border-soft)] bg-[var(--surface-muted)]/60">
          <div className="mb-2 flex items-center gap-2 text-2xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
            <Wallet size={14} className="text-[var(--accent)]" strokeWidth={1.75} />
            Balance neto
          </div>
          <div className="font-mono text-2xl font-medium text-[var(--text-primary)] sm:text-3xl">
            $9,250
            <span className="ml-1 text-sm font-normal text-[var(--text-tertiary)]">MXN</span>
          </div>
        </div>
      </div>

      <div className="empty-state rounded-xl border border-dashed border-[var(--border-soft)] bg-[var(--surface-muted)]/50">
        <div className="empty-state-icon">
          <Clock size={26} strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">Próximamente</p>
          <p className="mx-auto mt-1 max-w-md text-xs text-[var(--text-secondary)]">
            Enlaces de pago, facturación y seguimiento de mensualidades desde un solo lugar.
          </p>
        </div>
      </div>
    </div>
  );
}
