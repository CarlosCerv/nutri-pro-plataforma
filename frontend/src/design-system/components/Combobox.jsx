import { useEffect, useId, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Check, ChevronDown, Search } from 'lucide-react';

/**
 * Selector desplegable, con búsqueda opcional.
 *
 * Unifica las cuatro formas de elegir un valor que convivían en la app:
 * `<select>` nativo, `PremiumSelect`, `SearchableSelect` y el `Select` de
 * `Input.jsx`. Las dos primeras eran `div` con `onClick`: no se podían usar
 * con teclado, no anunciaban nada a un lector de pantalla, y dependían de
 * CSS que vivía en el archivo de una página concreta.
 *
 * `onChange` recibe un evento sintético `{ target: { name, value } }` para
 * encajar con los `handleChange` genéricos que ya usan los formularios.
 */
export default function Combobox({
  options,
  value,
  onChange,
  name,
  label,
  placeholder = 'Seleccionar…',
  searchPlaceholder = 'Buscar…',
  disabled = false,
  searchable = false,
  required = false,
  error,
  id,
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef(null);
  const searchRef = useRef(null);
  const generatedId = useId();
  const fieldId = id || generatedId;
  const listId = `${fieldId}-listbox`;

  const selected = options.find((o) => o.value === value) || null;

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter((o) => `${o.label} ${o.description || ''}`.toLowerCase().includes(q));
  }, [options, query, searchable]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  useEffect(() => {
    if (open && searchable) searchRef.current?.focus();
  }, [open, searchable]);

  const commit = (option) => {
    onChange?.({ target: { name, value: option.value } });
    setOpen(false);
    setQuery('');
    setActiveIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!open) {
      if (['Enter', ' ', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        setOpen(true);
        setActiveIndex(filtered.findIndex((o) => o.value === value));
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      setQuery('');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % Math.max(filtered.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? filtered.length - 1 : i - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0 && filtered[activeIndex]) {
      e.preventDefault();
      commit(filtered[activeIndex]);
    }
  };

  return (
    <div className={['form-group', className].filter(Boolean).join(' ')} ref={rootRef}>
      {label ? (
        <label htmlFor={fieldId} className="label">
          {label}
          {required ? <span className="text-[var(--danger)]"> *</span> : null}
        </label>
      ) : null}

      <div className="relative">
        <button
          type="button"
          id={fieldId}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-haspopup="listbox"
          aria-invalid={error ? true : undefined}
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          onKeyDown={handleKeyDown}
          className={[
            'input flex w-full items-center justify-between gap-2 text-left',
            error ? 'input-error' : '',
            disabled ? 'cursor-not-allowed opacity-45' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span className={['truncate', selected ? 'text-[var(--ink)]' : 'text-[var(--ink-secondary)]'].join(' ')}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown
            size={16}
            aria-hidden="true"
            className={[
              'shrink-0 text-[var(--ink-secondary)] transition-transform duration-micro',
              open ? 'rotate-180' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          />
        </button>

        {open ? (
          <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 overflow-hidden rounded-[var(--radius-m)] border border-[var(--border-soft)] bg-[var(--surface)] shadow-card animate-scale-in">
            {searchable ? (
              <div className="relative border-b border-[var(--border-soft)] p-2">
                <Search
                  size={15}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-secondary)]"
                />
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={searchPlaceholder}
                  aria-label={searchPlaceholder}
                  className="input w-full py-2 pl-8 text-sm"
                />
              </div>
            ) : null}

            <ul id={listId} role="listbox" className="max-h-64 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <li className="px-4 py-3 text-sm text-[var(--ink-secondary)]">Sin coincidencias</li>
              ) : (
                filtered.map((option, i) => {
                  const isSelected = option.value === value;
                  return (
                    <li key={option.value} role="option" aria-selected={isSelected}>
                      <button
                        type="button"
                        onClick={() => commit(option)}
                        onMouseEnter={() => setActiveIndex(i)}
                        className={[
                          'flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition-colors duration-micro',
                          i === activeIndex ? 'bg-[var(--surface-alt)]' : '',
                          isSelected ? 'text-[var(--accent)]' : 'text-[var(--ink-muted)]',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        <span className="min-w-0">
                          <span className="block truncate">{option.label}</span>
                          {option.description ? (
                            <span className="block truncate text-xs text-[var(--ink-secondary)]">{option.description}</span>
                          ) : null}
                        </span>
                        {isSelected ? <Check size={16} aria-hidden="true" className="shrink-0" /> : null}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="error-text" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

Combobox.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      description: PropTypes.string,
    })
  ).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func,
  name: PropTypes.string,
  label: PropTypes.node,
  placeholder: PropTypes.string,
  searchPlaceholder: PropTypes.string,
  disabled: PropTypes.bool,
  searchable: PropTypes.bool,
  required: PropTypes.bool,
  error: PropTypes.string,
  id: PropTypes.string,
  className: PropTypes.string,
};
