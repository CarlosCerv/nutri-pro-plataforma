import PropTypes from 'prop-types';

/**
 * Bloque titulado dentro de un formulario largo.
 *
 * Los formularios de alta de paciente y de cita agrupan sus campos en
 * secciones, pero cada archivo definía su propio componente `SECTION` local
 * con marcado ligeramente distinto.
 */
export default function FormSection({ title, description, children, className = '' }) {
  return (
    <section className={['space-y-4', className].filter(Boolean).join(' ')}>
      <div className="border-b border-[var(--border-soft)] pb-2">
        <h3 className="section-title text-base">{title}</h3>
        {description ? <p className="mt-1 text-xs text-[var(--ink-secondary)]">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

FormSection.propTypes = {
  title: PropTypes.node.isRequired,
  description: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
};
