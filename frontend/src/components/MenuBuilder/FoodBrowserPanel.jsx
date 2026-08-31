import { useDraggable } from '@dnd-kit/core';
import PropTypes from 'prop-types';
import { GripVertical, Loader, Search } from 'lucide-react';
import { Card } from '../../design-system/components';
import { nutritionPer100g, SLOT_META } from '../../lib/mealPlanSlots';

/**
 * Alimento arrastrable del panel lateral.
 *
 * Los botones "+ tiempo" se conservan a propósito: son la vía accesible por
 * teclado y en pantallas táctiles pequeñas, donde arrastrar es incómodo. El
 * Combobox de cada tiempo de comida (`MealSlotCard`) cubre el mismo caso
 * escribiendo en vez de navegar esta lista.
 */
function AlimentoArrastrable({ food, onQuickAdd }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `food:${food._id}`,
    data: { food },
  });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border border-[var(--border-soft)] p-2 transition-opacity duration-micro ${isDragging ? 'opacity-40' : ''}`}
    >
      <div className="flex items-start gap-1.5">
        <button
          type="button"
          className="-ml-1 mt-0.5 cursor-grab touch-none rounded p-0.5 text-[var(--ink-secondary)] hover:text-[var(--ink)] active:cursor-grabbing"
          aria-label={`Arrastrar ${food.name}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical size={14} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[var(--ink)]">{food.name}</p>
          <p className="text-xs text-[var(--ink-secondary)]">{nutritionPer100g(food).energy} kcal / 100g</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {SLOT_META.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => onQuickAdd(s.key, food)}
                className="rounded-md border border-[var(--border-soft)] bg-[var(--surface-alt)] px-2 py-0.5 text-[10px] font-medium text-[var(--ink-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                + {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FoodBrowserPanel({ foods, loading, search, onSearchChange, onQuickAdd }) {
  const filtered = foods.filter((f) => (f.name || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <Card className="sticky top-24 p-5">
      <h3 className="mb-3 text-sm font-semibold text-[var(--ink)]">Alimentos</h3>
      <div className="relative mb-3">
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-secondary)]" />
        <input
          type="text"
          className="input w-full py-2 pl-9 text-sm"
          placeholder="Buscar…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Buscar alimentos"
        />
      </div>
      {loading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-[var(--ink-muted)]">
          <Loader className="animate-spin" size={18} /> Cargando…
        </div>
      ) : (
        <div className="max-h-[60vh] space-y-1 overflow-y-auto pr-1">
          {filtered.slice(0, 120).map((food) => (
            <AlimentoArrastrable key={food._id} food={food} onQuickAdd={onQuickAdd} />
          ))}
        </div>
      )}
    </Card>
  );
}

FoodBrowserPanel.propTypes = {
  foods: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  search: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onQuickAdd: PropTypes.func.isRequired,
};
