import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { UtensilsCrossed } from 'lucide-react';
import { Combobox } from '../../design-system/components';
import { EmptyState } from '../../design-system/components/StateViews';
import { nutritionPer100g } from '../../lib/mealPlanSlots';
import FoodRow from './FoodRow';

/**
 * Un tiempo de comida: buscador de alta directa (Combobox + Enter, sin
 * arrastre), lista reordenable de alimentos, y la zona donde `@dnd-kit`
 * suelta alimentos arrastrados desde el panel lateral o desde otro tiempo.
 */
export default function MealSlotCard({ slot, foods, portionMode, onAddFood, onUpdateItem, onRemoveItem, onOpenSubstitutes }) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot:${slot.slotKey}` });

  const options = useMemo(
    () => foods.map((f) => ({
      value: f._id,
      label: f.name,
      description: `${nutritionPer100g(f).energy} kcal / 100 g`,
    })),
    [foods]
  );

  const foodsById = useMemo(() => new Map(foods.map((f) => [String(f._id), f])), [foods]);

  return (
    <div
      ref={setNodeRef}
      className={`card overflow-hidden transition-colors duration-micro ${isOver ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : ''}`}
    >
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
          description={
            <>
              Búscalos arriba<span className="hidden lg:inline"> o arrástralos desde el panel de la derecha</span>.
            </>
          }
          className="py-8"
        />
      ) : (
        <SortableContext items={slot.items.map((it) => `item:${it.uid}`)} strategy={verticalListSortingStrategy}>
          <div className="divide-y divide-[var(--border-soft)]">
            {slot.items.map((item) => (
              <FoodRow
                key={item.uid}
                item={item}
                food={foodsById.get(String(item.foodRef))}
                portionMode={portionMode}
                onUpdate={(patch) => onUpdateItem(item.uid, patch)}
                onRemove={() => onRemoveItem(item.uid)}
                onOpenSubstitutes={() => onOpenSubstitutes(item)}
              />
            ))}
          </div>
        </SortableContext>
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
};
