import { forwardRef } from 'react';
import PropTypes from 'prop-types';

const VARIANT_CLASS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

const SIZE_CLASS = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
};

const SPINNER_CLASS = {
  primary: 'border-white/35 border-t-white',
  secondary: 'border-white/35 border-t-white',
  outline: 'border-[var(--accent)]/30 border-t-[var(--accent)]',
  ghost: 'border-[var(--text-secondary)]/30 border-t-[var(--text-secondary)]',
  danger: 'border-[var(--danger)]/30 border-t-[var(--danger)]',
};

/**
 * Boton del sistema de diseno. Envuelve las clases .btn/.btn-* de index.css
 * en una API con props en vez de className a mano, y agrega un estado de
 * carga con el spinner correcto para cada variante.
 */
const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    iconOnly = false,
    loading = false,
    fullWidth = false,
    disabled = false,
    type = 'button',
    className = '',
    children,
    ...rest
  },
  ref
) {
  const classes = [
    'btn',
    VARIANT_CLASS[variant] || VARIANT_CLASS.primary,
    SIZE_CLASS[size],
    iconOnly ? 'btn-icon' : '',
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && (
        <span
          className={`h-4 w-4 rounded-full border-2 animate-spin ${SPINNER_CLASS[variant] || SPINNER_CLASS.primary}`}
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
});

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  iconOnly: PropTypes.bool,
  loading: PropTypes.bool,
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
  children: PropTypes.node,
};

export default Button;
