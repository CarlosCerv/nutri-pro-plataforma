import PropTypes from 'prop-types';

/**
 * Encabezado de página: título, subtítulo y acciones a la derecha.
 *
 * Sustituye el mismo bloque `flex flex-col lg:flex-row lg:items-end
 * justify-between gap-4` que estaba repetido en doce páginas, más otras
 * cuatro variantes escritas a mano que no coincidían entre sí.
 *
 * `eyebrow` es la línea corta en versalitas que algunas pantallas ponen
 * encima del título.
 */
export default function PageHeader({ title, subtitle, eyebrow, actions, className = '' }) {
  return (
    <div className={['flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between', className].filter(Boolean).join(' ')}>
      <div className="min-w-0">
        {eyebrow ? (
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-secondary)]">
            {eyebrow}
          </div>
        ) : null}
        <h1 className="page-title">{title}</h1>
        {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

PageHeader.propTypes = {
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.node,
  eyebrow: PropTypes.node,
  actions: PropTypes.node,
  className: PropTypes.string,
};
