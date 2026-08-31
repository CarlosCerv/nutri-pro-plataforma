import PropTypes from 'prop-types';

const SIZE = { sm: 'h-4 w-4 border-2', md: 'h-6 w-6 border-2', lg: 'h-9 w-9 border-[3px]' };

const TONE = {
  accent: 'border-[var(--border-soft)] border-t-[var(--accent)]',
  onAccent: 'border-white/35 border-t-white',
  muted: 'border-[var(--border-soft)] border-t-[var(--ink-secondary)]',
};

/**
 * Indicador de carga del sistema de diseño.
 *
 * Existe porque el mismo div de spinner estaba copiado literalmente en siete
 * archivos, con tres variantes de color distintas que nadie mantenía juntas.
 * `Button` resuelve su propio spinner internamente; este es para el resto.
 */
export default function Spinner({ size = 'md', tone = 'accent', label = 'Cargando', className = '' }) {
  return (
    <span
      role="status"
      aria-label={label}
      className={[
        'inline-block animate-spin rounded-full',
        SIZE[size] || SIZE.md,
        TONE[tone] || TONE.accent,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  );
}

Spinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  tone: PropTypes.oneOf(['accent', 'onAccent', 'muted']),
  label: PropTypes.string,
  className: PropTypes.string,
};
