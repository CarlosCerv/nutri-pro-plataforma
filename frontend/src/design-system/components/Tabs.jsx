import PropTypes from 'prop-types';

/**
 * Barra de pestañas del sistema de diseño (.tabs-nav/.tab-btn de index.css).
 *
 * Unifica las tres implementaciones que convivían (expediente de paciente,
 * catálogo de alimentos y calculadora), que diferían en marcado y en
 * accesibilidad: ninguna exponía `role="tab"` ni el estado seleccionado.
 *
 * `renderItem` permite envolver cada pestaña en un `<Link>` cuando las
 * pestañas son rutas en vez de estado local.
 */
export default function Tabs({ items, value, onChange, renderItem, className = '', ariaLabel }) {
  return (
    <div role="tablist" aria-label={ariaLabel} className={['tabs-nav', className].filter(Boolean).join(' ')}>
      {items.map((item) => {
        const active = item.id === value;
        const content = (
          <>
            {item.icon ? <span aria-hidden="true">{item.icon}</span> : null}
            {item.label}
          </>
        );

        if (renderItem) {
          return renderItem({ item, active, className: `tab-btn${active ? ' active' : ''}`, content });
        }

        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={`tab-btn${active ? ' active' : ''}`}
            onClick={() => onChange?.(item.id)}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}

Tabs.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.node.isRequired,
      icon: PropTypes.node,
    })
  ).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func,
  renderItem: PropTypes.func,
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
};
