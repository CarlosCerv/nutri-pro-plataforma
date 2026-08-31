import PropTypes from 'prop-types';

const VARIANT_CLASS = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-info',
  neutral: 'badge-neutral',
};

/**
 * Etiqueta de estado del sistema de diseno (.badge/.badge-* de index.css).
 * Usa siempre una de las variantes semanticas en vez de recrear los colores
 * con clases de Tailwind sueltas.
 */
const Badge = ({ variant = 'neutral', className = '', children, ...rest }) => (
  <span
    className={['badge', VARIANT_CLASS[variant] || VARIANT_CLASS.neutral, className].filter(Boolean).join(' ')}
    {...rest}
  >
    {children}
  </span>
);

Badge.propTypes = {
  variant: PropTypes.oneOf(['success', 'warning', 'danger', 'info', 'neutral']),
  className: PropTypes.string,
  children: PropTypes.node,
};

export default Badge;
