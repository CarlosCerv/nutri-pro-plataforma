import { useId, useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown } from 'lucide-react';

/**
 * Sección plegable.
 *
 * El expediente clínico tenía siete pestañas, cada una con un formulario
 * largo. Fundirlas en tres sin plegado produciría una página interminable, y
 * dejarlas separadas obliga a saltar entre pestañas para leer una sola
 * consulta. Con esto, cada bloque se abre solo cuando hace falta.
 *
 * Se implementa con botón y región en vez de `<details>` para poder animar la
 * flecha y controlar el estado desde fuera cuando la página lo necesite.
 */
export default function Disclosure({
  title,
  description,
  icon,
  defaultOpen = false,
  badge,
  children,
  className = '',
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();

  return (
    <section className={['card !p-0 overflow-hidden', className].filter(Boolean).join(' ')}>
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors duration-micro hover:bg-[var(--surface-alt)]"
        >
          {icon ? (
            <span aria-hidden="true" className="shrink-0 text-[var(--accent)]">
              {icon}
            </span>
          ) : null}
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-[var(--ink)]">{title}</span>
            {description ? (
              <span className="mt-0.5 block text-xs text-[var(--ink-secondary)]">{description}</span>
            ) : null}
          </span>
          {badge}
          <ChevronDown
            size={18}
            aria-hidden="true"
            className={`shrink-0 text-[var(--ink-secondary)] transition-transform duration-micro ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </h3>
      <div id={`${id}-panel`} hidden={!open} className="border-t border-[var(--border-soft)] p-5">
        {children}
      </div>
    </section>
  );
}

Disclosure.propTypes = {
  title: PropTypes.node.isRequired,
  description: PropTypes.node,
  icon: PropTypes.node,
  defaultOpen: PropTypes.bool,
  badge: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
};
