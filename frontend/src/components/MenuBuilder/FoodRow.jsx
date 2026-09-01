import { useState } from 'react';
import PropTypes from 'prop-types';
import { ArrowLeftRight, ArrowRight, ChevronDown, ChevronUp, Minus, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { gramsToPortions, portionsToGrams, smaeGroup } from '../../lib/smae';
import { macrosForGrams } from '../../lib/mealPlanSlots';

/** Botón de una línea dentro del menú "⋯" — mismo patrón visual en las tres secciones. */
function MenuButton({ icon: Icon, label, onClick, disabled, tone }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors duration-micro disabled:cursor-not-allowed disabled:opacity-40 ${
        tone === 'danger'
          ? 'text-[var(--danger)] hover:bg-[rgba(196,30,22,0.06)]'
          : 'text-[var(--ink-muted)] hover:bg-[var(--surface-alt)] hover:text-[var(--ink)]'
      }`}
    >
      {Icon ? <Icon size={15} className="shrink-0" strokeWidth={1.75} /> : null}
      <span className="truncate">{label}</span>
    </button>
  );
}

MenuButton.propTypes = {
  icon: PropTypes.elementType,
  label: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  tone: PropTypes.oneOf(['default', 'danger']),
};

/**
 * Fila de alimento del Creador Híbrido de Dietas.
 *
 * Reordenar y mover de tiempo de comida se resuelven con botones, no
 * arrastrando: en un teléfono, arrastrar con precisión mientras la página
 * puede hacer scroll es de las interacciones táctiles menos confiables que
 * hay, y en escritorio no aporta nada que un par de flechas y un menú no
 * resuelvan igual de rápido — con la ventaja de que aquí funcionan idéntico
 * en los dos.
 */
export default function FoodRow({
  item,
  food,
  portionMode,
  onUpdate,
  onRemove,
  onOpenSubstitutes,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  otherSlots,
  onMoveToSlot,
}) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [submenuMover, setSubmenuMover] = useState(false);

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

  const cerrarMenu = () => {
    setMenuAbierto(false);
    setSubmenuMover(false);
  };

  const cambiarUnidad = (unitName) => {
    // Mantiene los gramos actuales y solo recalcula cómo se muestran.
    onUpdate({ unitName, quantityLabel: null });
    cerrarMenu();
  };

  const conAccion = (fn) => () => {
    fn?.();
    cerrarMenu();
  };

  return (
    <div className="flex flex-col gap-2 bg-[var(--surface)] px-4 py-3 sm:flex-row sm:items-center sm:gap-3 sm:px-5">
      <div className="min-w-0 sm:flex-1">
        <p className="truncate font-medium text-[var(--ink)]">{item.foodName}</p>
        <p className="text-xs text-[var(--ink-secondary)]">
          {item.calories} kcal · P {item.protein}g · HC {item.carbohydrates}g · G {item.fats}g
        </p>
      </div>

      <div className="flex items-center justify-between gap-2 sm:shrink-0 sm:justify-end sm:gap-3">
        <div className="flex items-center gap-1.5">
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
          <span className="w-14 shrink-0 truncate text-xs text-[var(--ink-secondary)]" title={unitLabel}>
            {unitLabel}
          </span>
        </div>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuAbierto((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuAbierto}
            aria-label={`Más acciones para ${item.foodName}`}
            className="rounded-full p-2 text-[var(--ink-secondary)] hover:bg-[var(--surface-alt)] hover:text-[var(--ink)]"
          >
            <MoreHorizontal size={18} />
          </button>

          {menuAbierto && (
            <>
              <div className="fixed inset-0 z-40" onClick={cerrarMenu} aria-hidden />
              <div
                role="menu"
                className="absolute right-0 top-10 z-50 w-60 max-w-[calc(100vw-2rem)] overflow-hidden rounded-[var(--radius-m)] border border-[var(--border-soft)] bg-[var(--surface)] py-1 shadow-card animate-scale-in"
              >
                {!submenuMover ? (
                  <>
                    {servingSizes.length > 0 && portionMode !== 'smae' && (
                      <div className="border-b border-[var(--border-soft)] px-4 py-2.5">
                        <p className="mb-1.5 text-2xs font-semibold uppercase tracking-wide text-[var(--ink-secondary)]">Unidad</p>
                        <div className="flex flex-wrap gap-1.5">
                          {[{ name: 'g' }, ...servingSizes].map((s) => (
                            <button
                              key={s.name}
                              type="button"
                              onClick={() => cambiarUnidad(s.name)}
                              className={`rounded-full border px-2.5 py-1 text-2xs font-semibold transition-colors duration-micro ${
                                (item.unitName || 'g') === s.name
                                  ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                                  : 'border-[var(--border-soft)] text-[var(--ink-muted)]'
                              }`}
                            >
                              {s.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <MenuButton icon={ChevronUp} label="Subir" onClick={conAccion(onMoveUp)} disabled={!canMoveUp} />
                    <MenuButton icon={ChevronDown} label="Bajar" onClick={conAccion(onMoveDown)} disabled={!canMoveDown} />

                    {otherSlots.length > 0 && (
                      <MenuButton
                        icon={ArrowRight}
                        label="Mover a otro tiempo"
                        onClick={() => setSubmenuMover(true)}
                      />
                    )}

                    <div className="mt-1 border-t border-[var(--border-soft)] pt-1">
                      <MenuButton icon={ArrowLeftRight} label="Sustitutos sugeridos" onClick={conAccion(onOpenSubstitutes)} />
                      <MenuButton icon={Trash2} label="Eliminar" tone="danger" onClick={conAccion(onRemove)} />
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setSubmenuMover(false)}
                      className="flex w-full items-center gap-1.5 border-b border-[var(--border-soft)] px-4 py-2.5 text-left text-2xs font-semibold uppercase tracking-wide text-[var(--ink-secondary)] hover:text-[var(--ink)]"
                    >
                      <ChevronUp size={13} className="-rotate-90" /> Mover a…
                    </button>
                    {otherSlots.map((s) => (
                      <MenuButton key={s.key} label={s.label} onClick={conAccion(() => onMoveToSlot(s.key))} />
                    ))}
                  </>
                )}
              </div>
            </>
          )}
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
  onMoveUp: PropTypes.func.isRequired,
  onMoveDown: PropTypes.func.isRequired,
  canMoveUp: PropTypes.bool.isRequired,
  canMoveDown: PropTypes.bool.isRequired,
  otherSlots: PropTypes.arrayOf(PropTypes.shape({ key: PropTypes.string, label: PropTypes.string })).isRequired,
  onMoveToSlot: PropTypes.func.isRequired,
};
