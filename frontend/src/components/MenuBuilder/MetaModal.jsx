import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Input, Modal } from '../../design-system/components';

/** Edita la meta calórica y de macros contra la que la barra sticky mide el día activo. */
export default function MetaModal({ open, meta, onClose, onSave }) {
  const [borrador, setBorrador] = useState(meta);

  if (!open) return null;

  const campo = (name, label) => (
    <Input
      label={label}
      type="number"
      min={0}
      name={name}
      value={borrador[name]}
      onChange={(e) => setBorrador((prev) => ({ ...prev, [name]: Number(e.target.value) || 0 }))}
    />
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Meta nutricional del plan"
      size="sm"
      footer={
        <>
          <Button variant="ghost" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="button" onClick={() => onSave(borrador)}>Guardar meta</Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        {campo('kcal', 'Kcal / día')}
        {campo('protein', 'Proteína (g)')}
        {campo('carbohydrates', 'Carbohidratos (g)')}
        {campo('fats', 'Lípidos (g)')}
      </div>
    </Modal>
  );
}

MetaModal.propTypes = {
  open: PropTypes.bool.isRequired,
  meta: PropTypes.shape({
    kcal: PropTypes.number,
    protein: PropTypes.number,
    carbohydrates: PropTypes.number,
    fats: PropTypes.number,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};
