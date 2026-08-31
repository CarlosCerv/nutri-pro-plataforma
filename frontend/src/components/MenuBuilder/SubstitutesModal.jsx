import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { ArrowLeftRight, Loader } from 'lucide-react';
import { foodExchangeAPI } from '../../services/api';
import { getApiErrorMessage } from '../../lib/apiError';
import { Badge, Button, Modal } from '../../design-system/components';
import { EmptyState, ErrorState } from '../../design-system/components/StateViews';

/**
 * "Sustitutos sugeridos": equivalentes nutricionales del alimento de la fila
 * (±10% kcal, ±15% macros — tolerancias de `foodExchange.controller.js`),
 * priorizando los del mismo grupo. Sustituir conserva la cantidad en gramos
 * de la fila y recalcula los macros con el nuevo alimento.
 */
export default function SubstitutesModal({ item, onClose, onSelect }) {
  const [equivalentes, setEquivalentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!item) return undefined;
    let cancelado = false;
    setLoading(true);
    setError('');
    (async () => {
      try {
        const res = await foodExchangeAPI.getEquivalents(item.foodRef);
        if (!cancelado) setEquivalentes(res.data?.equivalents || []);
      } catch (err) {
        if (!cancelado) setError(getApiErrorMessage(err, 'No se pudieron cargar los sustitutos.'));
      } finally {
        if (!cancelado) setLoading(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [item]);

  return (
    <Modal open={!!item} onClose={onClose} title={item ? `Sustitutos para ${item.foodName}` : ''} size="md">
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-[var(--ink-muted)]">
          <Loader className="animate-spin" size={18} /> Buscando equivalentes…
        </div>
      ) : error ? (
        <ErrorState message={error} />
      ) : equivalentes.length === 0 ? (
        <EmptyState
          icon={<ArrowLeftRight size={22} strokeWidth={1.5} />}
          title="Sin equivalentes cercanos"
          description="No hay alimentos con aporte calórico y de macros similar en el catálogo."
        />
      ) : (
        <ul className="space-y-2">
          {equivalentes.map((eq) => (
            <li key={eq.id} className="flex items-center justify-between gap-3 rounded-[var(--radius-m)] border border-[var(--border-soft)] p-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-[var(--ink)]">{eq.name}</p>
                  <Badge variant={eq.score >= 80 ? 'success' : 'neutral'}>{eq.score}% afín</Badge>
                </div>
                <p className="mt-0.5 text-xs text-[var(--ink-secondary)]">
                  {eq.nutrition.energy} kcal · P {eq.nutrition.protein}g · HC {eq.nutrition.carbohydrates}g · G {eq.nutrition.fat}g (por 100 g)
                </p>
              </div>
              <Button size="sm" variant="outline" type="button" onClick={() => onSelect(eq)} className="shrink-0">
                Usar este
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

SubstitutesModal.propTypes = {
  item: PropTypes.shape({
    foodRef: PropTypes.string,
    foodName: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
};
