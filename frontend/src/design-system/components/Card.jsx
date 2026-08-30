import PropTypes from 'prop-types';

/**
 * Contenedor de tarjeta del sistema de diseno (.card/.card-kpi de index.css).
 * `hover`/`padded` cubren las dos variaciones que ya aparecian repetidas por
 * la app como overrides sueltos (`!p-0`, `!hover:shadow-none`).
 */
const Card = ({
  as,
  kpi = false,
  hover = true,
  padded = true,
  className = '',
  children,
  ...rest
}) => {
  const Tag = as || 'div';
  const classes = [
    kpi ? 'card-kpi' : 'card',
    !padded ? '!p-0' : '',
    !hover ? 'hover:shadow-none hover:border-[var(--border-soft)]' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
};

Card.propTypes = {
  as: PropTypes.elementType,
  kpi: PropTypes.bool,
  hover: PropTypes.bool,
  padded: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
};

export default Card;
