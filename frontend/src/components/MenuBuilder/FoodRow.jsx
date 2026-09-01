import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PropTypes from 'prop-types';
import { ArrowLeftRight, GripVertical, Minus, Plus, Trash2 } from 'lucide-react';
import { gramsToPortions, portionsToGrams, smaeGroup } from '../../lib/smae';
import { macrosForGrams } from '../../lib/mealPlanSlots';

/**
 * Fila de alimento del Creador Híbrido de Dietas.
 *
 * El control numérico edita gramos, porciones SMAE o "unidades" del alimento
 * (pieza, taza…) según el modo activo, pero `quantityGrams` sigue siendo la
 * única fuente de verdad: los otros dos son solo la forma de editarla.
 */
export default function FoodRow({ item, food, portionMode, onUpdate, onRemove, onOpenSubstitutes }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `item:${item.uid}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const category = food?.category || item.foodCategory;
  const servingSizes = food?.servingSizes || [];
  const group = smaeGroup(category);

  let count;
  let step;
  let unitLabel;
  if (portionMode === 'smae') {
    count = gramsToPortions(item.quantityGrams, category);
    step = 0.5;
    unitLabel = group.label;
  } else if (item.unitName && item.unitName !== 'g') {
    const serving = servingSizes.find((s) => s.name === item.unitName);
    count = serving ? Math.round((item.quantityGrams / serving.grams) * 10) / 10 : item.quantityGrams;
    step = 1;
    unitLabel = item.unitName;
  } else {
    count = item.quantityGrams;
    step = 5;
    unitLabel = 'g';
  }

  const applyCount = (rawCount) => {
    const n = Math.max(0, Math.round(rawCount * 100) / 100);
    let grams;
    let quantityLabel = null;
    if (portionMode === 'smae') {
      grams = portionsToGrams(n, category);
      quantityLabel = `${n} ${group.label}`;
    } else if (item.unitName && item.unitName !== 'g') {
      const serving = servingSizes.find((s) => s.name === item.unitName);
      grams = serving ? n * serving.grams : n;
      quantityLabel = serving ? `${n} ${serving.name}` : null;
    } else {
      grams = n;
    }
    const patch = { quantityGrams: grams, quantityLabel };
    if (food) Object.assign(patch, macrosForGrams(food, grams));
    onUpdate(patch);
  };

  const changeUnit = (unitName) => {
    // Mantiene los gramos actuales y solo recalcula cómo se muestran.
    onUpdate({ unitName, quantityLabel: null });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col gap-2.5 px-4 py-3 bg-[var(--surface)] sm:flex-row sm:items-center sm:gap-3 sm:px-5"
    >
      {/* Fila 1 en móvil / bloque izquierdo en escritorio: asa + nombre. */}
      <div className="flex min-w-0 items-center gap-2 sm:min-w-0 sm:flex-1">
        <button
          type="button"
          className="-ml-1 shrink-0 cursor-grab touch-none rounded-lg p-2.5 text-[var(--ink-secondary)] hover:text-[var(--ink)] active:cursor-grabbing"
          aria-label={`Reordenar ${item.foodName}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} />
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-[var(--ink)]">{item.foodName}</p>
          <p className="text-xs text-[var(--ink-secondary)]">
            {item.calories} kcal · P {item.protein}g · HC {item.carbohydrates}g · G {item.fats}g
          </p>
        </div>
      </div>

      {/* Fila 2 en móvil / bloque derecho en escritorio: cantidad y acciones. */}
      <div className="flex items-center justify-between gap-2 pl-11 sm:shrink-0 sm:justify-end sm:gap-1.5 sm:pl-0">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => applyCount(Math.max(0, count - step))}
            className="rounded-full p-2 text-[var(--ink-secondary)] hover:bg-[var(--surface-alt)] hover:text-[var(--ink)] active:bg-[var(--surface-alt)]"
            aria-label="Disminuir"
          >
            <Minus size={14} />
          </button>
          <input
            type="number"
            min={0}
            step={step}
            className="input w-16 py-1.5 text-center text-sm"
            value={count}
            onChange={(e) => applyCount(Number(e.target.value) || 0)}
          />
          <button
            type="button"
            onClick={() => applyCount(count + step)}
            className="rounded-full p-2 text-[var(--ink-secondary)] hover:bg-[var(--surface-alt)] hover:text-[var(--ink)] active:bg-[var(--surface-alt)]"
            aria-label="Aumentar"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="flex items-center gap-0.5">
          {portionMode === 'smae' ? (
            <span className="w-16 shrink-0 truncate text-right text-xs text-[var(--ink-secondary)] sm:w-28 sm:text-left" title={unitLabel}>
              {unitLabel}
            </span>
          ) : servingSizes.length > 0 ? (
            <select
              className="input w-20 py-1.5 text-xs sm:w-24"
              value={item.unitName || 'g'}
              onChange={(e) => changeUnit(e.target.value)}
              aria-label={`Unidad de ${item.foodName}`}
            >
              <option value="g">g</option>
              {servingSizes.map((s) => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          ) : (
            <span className="w-6 shrink-0 text-xs text-[var(--ink-secondary)]">{unitLabel}</span>
          )}

          <button
            type="button"
            onClick={onOpenSubstitutes}
            className="rounded-lg p-2 text-[var(--ink-secondary)] hover:bg-[var(--accent-tint)] hover:text-[var(--accent)] active:bg-[var(--accent-tint)]"
            aria-label={`Sustitutos sugeridos para ${item.foodName}`}
            title="Sustitutos sugeridos"
          >
            <ArrowLeftRight size={16} />
          </button>

          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg p-2 text-[var(--ink-secondary)] hover:bg-[rgba(196,30,22,0.08)] hover:text-[var(--danger)] active:bg-[rgba(196,30,22,0.08)]"
            aria-label={`Quitar ${item.foodName}`}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

FoodRow.propTypes = {
  item: PropTypes.shape({
    uid: PropTypes.string.isRequired,
    foodRef: PropTypes.string,
    foodCategory: PropTypes.string,
    foodName: PropTypes.string,
    quantityGrams: PropTypes.number,
    calories: PropTypes.number,
    protein: PropTypes.number,
    carbohydrates: PropTypes.number,
    fats: PropTypes.number,
    unitName: PropTypes.string,
    quantityLabel: PropTypes.string,
  }).isRequired,
  food: PropTypes.object,
  portionMode: PropTypes.oneOf(['grams', 'smae']).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onOpenSubstitutes: PropTypes.func.isRequired,
};
