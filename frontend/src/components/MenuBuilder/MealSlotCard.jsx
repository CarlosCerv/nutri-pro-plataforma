import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { UtensilsCrossed } from 'lucide-react';
import { Combobox } from '../../design-system/components';
import { EmptyState } from '../../design-system/components/StateViews';
import { nutritionPer100g, SLOT_META } from '../../lib/mealPlanSlots';
import FoodRow from './FoodRow';

/**
 * Un tiempo de comida: buscador de alta directa (Combobox + Enter) y la
 * lista de alimentos, cada uno con su menú de acciones para reordenar o
 * moverse a otro tiempo — ver FoodRow.jsx para el porqué no es arrastrable.
 */
export default function MealSlotCard({ slot, foods, portionMode, onAddFood, onUpdateItem, onRemoveItem, onOpenSubstitutes, onReorderItem, onMoveItemToSlot }) {
  const options = useMemo(
    () => foods.map((f) => ({
      value: f._id,
      label: f.name,
      description: `${nutritionPer100g(f).energy} kcal / 100 g`,
    })),
    [foods]
  );

  const foodsById = useMemo(() => new Map(foods.map((f) => [String(f._id), f])), [foods]);

  const otherSlots = useMemo(
    () => SLOT_META.filter((s) => s.key !== slot.slotKey).map((s) => ({ key: s.key, label: s.label })),
    [slot.slotKey]
  );

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-[var(--border-soft)] bg-[var(--surface-alt)] px-4 py-3 sm:px-5">
        <h3 className="mb-2 text-sm font-semibold text-[var(--ink)]">{slot.slotLabel}</h3>
        <Combobox
          searchable
          options={options}
          value=""
          onChange={(e) => {
            const food = foodsById.get(String(e.target.value));
            if (food) onAddFood(food);
          }}
          placeholder="Buscar y agregar alimento…"
          searchPlaceholder="Escribe para buscar…"
          id={`combo-${slot.slotKey}`}
        />
      </div>

      {slot.items.length === 0 ? (
        <EmptyState
          icon={<UtensilsCrossed size={22} strokeWidth={1.5} />}
          title="Sin alimentos"
          description="Búscalos arriba para agregarlos a este tiempo."
          className="py-8"
        />
      ) : (
        <div className="divide-y divide-[var(--border-soft)]">
          {slot.items.map((item, index) => (
            <FoodRow
              key={item.uid}
              item={item}
              food={foodsById.get(String(item.foodRef))}
              portionMode={portionMode}
              onUpdate={(patch) => onUpdateItem(item.uid, patch)}
              onRemove={() => onRemoveItem(item.uid)}
              onOpenSubstitutes={() => onOpenSubstitutes(item)}
              canMoveUp={index > 0}
              canMoveDown={index < slot.items.length - 1}
              onMoveUp={() => onReorderItem(slot.slotKey, item.uid, -1)}
              onMoveDown={() => onReorderItem(slot.slotKey, item.uid, 1)}
              otherSlots={otherSlots}
              onMoveToSlot={(targetSlotKey) => onMoveItemToSlot(item.uid, slot.slotKey, targetSlotKey)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

MealSlotCard.propTypes = {
  slot: PropTypes.shape({
    slotKey: PropTypes.string.isRequired,
    slotLabel: PropTypes.string.isRequired,
    items: PropTypes.array.isRequired,
  }).isRequired,
  foods: PropTypes.array.isRequired,
  portionMode: PropTypes.oneOf(['grams', 'smae']).isRequired,
  onAddFood: PropTypes.func.isRequired,
  onUpdateItem: PropTypes.func.isRequired,
  onRemoveItem: PropTypes.func.isRequired,
  onOpenSubstitutes: PropTypes.func.isRequired,
  onReorderItem: PropTypes.func.isRequired,
  onMoveItemToSlot: PropTypes.func.isRequired,
};
