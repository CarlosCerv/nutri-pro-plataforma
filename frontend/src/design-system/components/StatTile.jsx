import PropTypes from 'prop-types';

const TONE = {
  neutral: 'text-[var(--ink)]',
  accent: 'text-[var(--accent)]',
  success: 'text-[var(--success)]',
  warning: 'text-[var(--warning)]',
  danger: 'text-[var(--danger)]',
};

/**
 * Indicador numérico (KPI).
 *
 * Estaba reimplementado en cuatro páginas, cada una con sus propios hex
 * literales y un `style={{ background: color+'20' }}` calculado a mano. Aquí
 * el color sale de los tokens semánticos y solo admite los cinco tonos que
 * el sistema define.
 */
export default function StatTile({ label, value, unit, icon, tone = 'neutral', hint, className = '' }) {
  return (
    <div className={['card p-5', className].filter(Boolean).join(' ')}>
      <div className="mb-2 flex items-center gap-2 text-2xs font-semibold uppercase tracking-wide text-[var(--ink-secondary)]">
        {icon ? (
          <span aria-hidden="true" className={TONE[tone] || TONE.neutral}>
            {icon}
          </span>
        ) : null}
        {label}
      </div>
      <div className={['font-mono text-2xl font-medium sm:text-3xl', TONE[tone] || TONE.neutral].join(' ')}>
        {value}
        {unit ? <span className="ml-1 text-sm font-normal text-[var(--ink-secondary)]">{unit}</span> : null}
      </div>
      {hint ? <div className="mt-1 text-xs text-[var(--ink-secondary)]">{hint}</div> : null}
    </div>
  );
}

StatTile.propTypes = {
  label: PropTypes.node.isRequired,
  value: PropTypes.node.isRequired,
  unit: PropTypes.node,
  icon: PropTypes.node,
  tone: PropTypes.oneOf(['neutral', 'accent', 'success', 'warning', 'danger']),
  hint: PropTypes.node,
  className: PropTypes.string,
};
