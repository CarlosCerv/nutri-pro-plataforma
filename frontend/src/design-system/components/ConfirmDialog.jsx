import { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal.jsx';
import Button from './Button.jsx';

/**
 * Confirmación de una acción destructiva.
 *
 * Los endpoints de borrado del backend existían desde el principio, pero
 * ninguna pantalla los exponía: no se podía eliminar un paciente, un plan ni
 * una cita desde la interfaz. Al añadirlos hace falta una confirmación real,
 * y `window.confirm()` no sirve: bloquea el hilo, no se puede estilizar y en
 * iOS en modo standalone se comporta de forma distinta.
 *
 * `descripcion` debe decir qué se pierde exactamente, no "¿estás seguro?".
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  descripcion,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
}) {
  const [enCurso, setEnCurso] = useState(false);
  const [error, setError] = useState(null);

  const confirmar = async () => {
    setEnCurso(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err?.mensaje || 'No se pudo completar la acción.');
    } finally {
      setEnCurso(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={enCurso ? undefined : onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={enCurso}>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={confirmar} loading={enCurso}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-[var(--ink-muted)]">{descripcion}</p>
      {error ? (
        <p role="alert" className="mt-3 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}
    </Modal>
  );
}

ConfirmDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.node.isRequired,
  descripcion: PropTypes.node.isRequired,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
};
