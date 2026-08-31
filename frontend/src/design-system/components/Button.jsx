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
  ghost: 'border-[var(--ink-muted)]/30 border-t-[var(--ink-muted)]',
  danger: 'border-[var(--danger)]/30 border-t-[var(--danger)]',
};

/**
 * Boton del sistema de diseno. Envuelve las clases .btn/.btn-* de index.css
 * en una API con props en vez de className a mano, y agrega un estado de
 * carga con el spinner correcto para cada variante.
 *
 * `as` permite renderizar un enlace con aspecto de boton — `as={Link}` para
 * navegacion interna, `as="a"` para externa. Existe porque buena parte de los
 * botones de la aplicacion son en realidad enlaces («Nuevo paciente»,
 * «Agendar cita») y escribirlos como `<button onClick={navigate}>` les quita
 * lo que un enlace da gratis: abrir en pestaña nueva, copiar la direccion y
 * que el lector de pantalla lo anuncie como enlace.
 *
 * Cuando no es un `<button>` no se emiten `type` ni `disabled`, que no son
 * validos en un ancla; deshabilitar se comunica con `aria-disabled`.
 */
const Button = forwardRef(function Button(
  {
    as: Componente = 'button',
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
  const esBoton = Componente === 'button';
  const inactivo = disabled || loading;

  const classes = [
    'btn',
    VARIANT_CLASS[variant] || VARIANT_CLASS.primary,
    SIZE_CLASS[size],
    iconOnly ? 'btn-icon' : '',
    fullWidth ? 'w-full' : '',
    !esBoton && inactivo ? 'pointer-events-none opacity-60' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const propsDeBoton = esBoton
    ? { type, disabled: inactivo }
    : { 'aria-disabled': inactivo || undefined };

  return (
    <Componente
      ref={ref}
      className={classes}
      aria-busy={loading || undefined}
      {...propsDeBoton}
      {...rest}
    >
      {loading && (
        <span
          className={`h-4 w-4 rounded-full border-2 animate-spin ${SPINNER_CLASS[variant] || SPINNER_CLASS.primary}`}
          aria-hidden="true"
        />
      )}
      {children}
    </Componente>
  );
});

Button.propTypes = {
  as: PropTypes.elementType,
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
