import { useState } from 'react';
import PropTypes from 'prop-types';
import { Copy, Settings2 } from 'lucide-react';
import { DAYS } from '../../lib/mealPlanSlots';

const MACROS = [
  { key: 'protein', label: 'Proteína', color: 'var(--chart-green)' },
  { key: 'fats', label: 'Lípidos', color: 'var(--chart-orange)' },
  { key: 'carbohydrates', label: 'Carbohidratos', color: 'var(--chart-blue)' },
];

const Barra = ({ label, valor, meta, unidad, color }) => {
  const pct = meta > 0 ? Math.min(100, Math.round((valor / meta) * 100)) : 0;
  return (
    <div className="min-w-0">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-2xs font-semibold uppercase tracking-wide text-[var(--ink-secondary)]">{label}</span>
        <span className="shrink-0 font-mono text-xs text-[var(--ink-muted)]">
          {valor}{unidad} <span className="text-[var(--ink-secondary)]">/ {meta}{unidad}</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-alt)]">
        <div className="h-full rounded-full transition-all duration-layout" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
};

/**
 * Barra superior fija (glassmorphism) del Creador Híbrido de Dietas: kcal y
 * macros del día activo frente a la meta, el toggle Gramos/Porciones SMAE,
 * el segmentado de días y "Copiar día a...".
 */
export default function StickyMacroBar({
  activeDay,
  onChangeDay,
  portionMode,
  onChangePortionMode,
  totals,
  meta,
  onOpenMeta,
  onCopyDay,
}) {
  const [copiarAbierto, setCopiarAbierto] = useState(false);
  const [destinos, setDestinos] = useState([]);

  const toggleDestino = (key) => {
    setDestinos((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const confirmarCopia = () => {
    if (destinos.length > 0) onCopyDay(destinos);
    setDestinos([]);
    setCopiarAbierto(false);
  };

  return (
    <div
      className="sticky top-24 z-20 space-y-3 rounded-[var(--radius-m)] border border-[var(--border-soft)] px-4 py-3 shadow-card backdrop-blur-[20px] backdrop-saturate-[180%] sm:px-6"
      style={{ background: 'rgba(255,255,255,0.82)' }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Día de la semana" className="flex gap-1 overflow-x-auto no-scrollbar">
          {DAYS.map((d) => (
            <button
              key={d.key}
              type="button"
              role="tab"
              aria-selected={activeDay === d.key}
              onClick={() => onChangeDay(d.key)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-micro ${
                activeDay === d.key
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--ink-muted)] hover:bg-[var(--surface-alt)]'
              }`}
            >
              {d.short}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button type="button" onClick={() => setCopiarAbierto((v) => !v)} className="btn btn-outline btn-sm gap-1.5">
              <Copy size={13} /> Copiar día a…
            </button>
            {copiarAbierto && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setCopiarAbierto(false)} aria-hidden />
                <div className="absolute right-0 top-10 z-50 w-56 rounded-[var(--radius-m)] border border-[var(--border-soft)] bg-[var(--surface)] p-3 shadow-card animate-scale-in">
                  <p className="mb-2 text-2xs font-semibold uppercase tracking-wide text-[var(--ink-secondary)]">
                    Copiar {DAYS.find((d) => d.key === activeDay)?.label} a:
                  </p>
                  <div className="space-y-1.5">
                    {DAYS.filter((d) => d.key !== activeDay).map((d) => (
                      <label key={d.key} className="flex items-center gap-2 text-sm text-[var(--ink-muted)]">
                        <input
                          type="checkbox"
                          checked={destinos.includes(d.key)}
                          onChange={() => toggleDestino(d.key)}
                        />
                        {d.label}
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={confirmarCopia}
                    disabled={destinos.length === 0}
                    className="btn btn-primary btn-sm mt-3 w-full disabled:opacity-45"
                  >
                    Copiar
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="flex rounded-full border border-[var(--border-soft)] p-0.5">
            {[
              { value: 'grams', label: 'Gramos' },
              { value: 'smae', label: 'SMAE' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChangePortionMode(opt.value)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-micro ${
                  portionMode === opt.value ? 'bg-[var(--accent)] text-white' : 'text-[var(--ink-muted)]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button type="button" onClick={onOpenMeta} className="rounded-full p-1.5 text-[var(--ink-secondary)] hover:bg-[var(--surface-alt)] hover:text-[var(--ink)]" aria-label="Editar meta nutricional">
            <Settings2 size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Barra label="Kcal" valor={totals.totalCalories} meta={meta.kcal} unidad="" color="var(--accent)" />
        {MACROS.map((m) => (
          <Barra key={m.key} label={m.label} valor={totals[m.key]} meta={meta[m.key]} unidad="g" color={m.color} />
        ))}
      </div>
    </div>
  );
}

StickyMacroBar.propTypes = {
  activeDay: PropTypes.string.isRequired,
  onChangeDay: PropTypes.func.isRequired,
  portionMode: PropTypes.oneOf(['grams', 'smae']).isRequired,
  onChangePortionMode: PropTypes.func.isRequired,
  totals: PropTypes.shape({
    totalCalories: PropTypes.number,
    protein: PropTypes.number,
    carbohydrates: PropTypes.number,
    fats: PropTypes.number,
  }).isRequired,
  meta: PropTypes.shape({
    kcal: PropTypes.number,
    protein: PropTypes.number,
    carbohydrates: PropTypes.number,
    fats: PropTypes.number,
  }).isRequired,
  onOpenMeta: PropTypes.func.isRequired,
  onCopyDay: PropTypes.func.isRequired,
};
