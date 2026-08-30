import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';

const SIZE_CLASS = {
  sm: 'max-w-sm',
  md: '',
  lg: 'max-w-2xl',
};

/**
 * Modal del sistema de diseno (.modal-overlay/.modal-content/... de index.css).
 * Centraliza el comportamiento que antes se repetia a mano en cada modal:
 * cierre con Escape, bloqueo de scroll del body mientras esta abierto, y
 * render via portal a document.body para que un position: fixed no quede
 * atrapado por un ancestro con transform/filter/overflow.
 */
const Modal = ({
  open = true,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  className = '',
}) => {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="modal-overlay" onClick={closeOnOverlayClick ? onClose : undefined}>
      <div
        className={['modal-content', SIZE_CLASS[size], className].filter(Boolean).join(' ')}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
      >
        {title && (
          <div className="modal-header">
            <h3>{title}</h3>
            <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Cerrar">
              <X size={20} />
            </button>
          </div>
        )}
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
};

Modal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.node,
  children: PropTypes.node,
  footer: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  closeOnOverlayClick: PropTypes.bool,
  className: PropTypes.string,
};

export default Modal;
