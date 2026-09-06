import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Check, Loader, Minus, Plus, PlusCircle, Search, UtensilsCrossed } from 'lucide-react';
import { foodsAPI } from '../../services/api';
import { getApiErrorMessage } from '../../lib/apiError';
import { CATEGORIAS, ETIQUETA_CATEGORIA } from '../../lib/foodCategories';
import { SLOT_META, nutritionPer100g, defaultQuantityFor, resolveGramsForUnit, quantityLabelForUnit } from '../../lib/mealPlanSlots';
import { Badge, Button, Input, Modal, Select } from '../../design-system/components';
import { EmptyState, ErrorState } from '../../design-system/components/StateViews';

const RESULT_LIMIT = 30;

/** Estado de cantidad de una fila de resultado: gramos o una porción común del alimento. */
function useQuantity(food) {
  const [{ count, unitName }, setQty] = useState(() => defaultQuantityFor(food));
  return {
    count,
    unitName,
    grams: resolveGramsForUnit(food, unitName, count),
    label: quantityLabelForUnit(unitName, count),
    setCount: (n) => setQty((q) => ({ ...q, count: Math.max(0, n) })),
    setUnitName: (u) => setQty({ count: 1, unitName: u }),
  };
}

/** Stepper +/- y unidad (g o una porción común del alimento) de una fila de resultado. */
function QuantityStepper({ food, quantity }) {
  const { count, unitName, setCount, setUnitName } = quantity;
  const step = unitName === 'g' ? 5 : 1;
  const options = [{ name: 'g' }, ...(food.servingSizes || [])];

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => setCount(count - step)}
          className="rounded-full p-1.5 text-[var(--ink-secondary)] hover:bg-[var(--surface-alt)] hover:text-[var(--ink)]"
          aria-label="Disminuir cantidad"
        >
          <Minus size={13} />
        </button>
        <input
          type="number"
          min={0}
          step={step}
          value={count}
          onChange={(e) => setCount(Number(e.target.value) || 0)}
          className="input w-14 py-1 text-center text-xs"
          aria-label="Cantidad"
        />
        <button
          type="button"
          onClick={() => setCount(count + step)}
          className="rounded-full p-1.5 text-[var(--ink-secondary)] hover:bg-[var(--surface-alt)] hover:text-[var(--ink)]"
          aria-label="Aumentar cantidad"
        >
          <Plus size={13} />
        </button>
      </div>
      {options.length > 1 ? (
        <select
          value={unitName}
          onChange={(e) => setUnitName(e.target.value)}
          className="select w-auto py-1 text-xs"
          aria-label="Unidad"
        >
          {options.map((o) => (
            <option key={o.name} value={o.name}>{o.name}</option>
          ))}
        </select>
      ) : (
        <span className="text-xs text-[var(--ink-secondary)]">g</span>
      )}
    </div>
  );
}

/** Fila de un resultado de búsqueda: categoría, macros por 100 g, cantidad y botón de alta. */
function ResultRow({ food, onAdd, justAdded }) {
  const quantity = useQuantity(food);
  const n = nutritionPer100g(food);

  return (
    <li className="flex flex-col gap-2 border-b border-[var(--border-soft)] px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-[var(--ink)]">{food.name}</p>
          <Badge variant="neutral" className="shrink-0">{ETIQUETA_CATEGORIA[food.category] || food.category}</Badge>
        </div>
        <p className="mt-0.5 text-xs text-[var(--ink-secondary)]">
          {n.energy} kcal · P {n.protein}g · HC {n.carbohydrates}g · G {n.fats}g (por 100 g)
        </p>
      </div>
      <div className="flex shrink-0 items-center justify-between gap-2 sm:justify-end">
        <QuantityStepper food={food} quantity={quantity} />
        <Button
          type="button"
          size="sm"
          variant={justAdded ? 'ghost' : 'outline'}
          className="gap-1.5"
          onClick={() => onAdd(food, quantity.grams, quantity.unitName, quantity.label)}
        >
          {justAdded ? <Check size={14} /> : <Plus size={14} />}
          {justAdded ? 'Agregado' : 'Agregar'}
        </Button>
      </div>
    </li>
  );
}

ResultRow.propTypes = {
  food: PropTypes.object.isRequired,
  onAdd: PropTypes.func.isRequired,
  justAdded: PropTypes.bool,
};

const emptyCreateForm = { name: '', category: '', energy: '', protein: '', carbohydrates: '', fat: '' };

/**
 * Panel único de búsqueda y alta de alimentos del Creador Híbrido de Dietas.
 *
 * Reemplaza el `Combobox` que antes vivía repetido dentro de cada
 * `MealSlotCard` (buscaba solo por substring exacto sobre hasta 500
 * alimentos precargados, siempre agregaba a 100 g, y no ofrecía forma de
 * crear un alimento que no existiera). Este panel es compartido por todos
 * los tiempos de comida: el selector "Agregando a" decide el destino sin
 * cerrar el panel, así se puede agregar a varios tiempos seguidos.
 */
export default function AddFoodPanel({ open, targetSlotKey, onChangeTargetSlot, recentFoods, onClose, onAddFood, onCreateFood }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [justAddedId, setJustAddedId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    setQuery('');
    setCategory('');
    setResults([]);
    setCreating(false);
    setCreateForm(emptyCreateForm);
    setCreateError('');
  }, [open]);

  // Búsqueda contra el servidor (no cliente sobre 500 alimentos precargados):
  // escala con catálogos grandes y con los alimentos propios de cada
  // nutriólogo. Mismo patrón de debounce que `pages/tools/FoodsTab.jsx`.
  useEffect(() => {
    if (!open) return undefined;
    let cancelado = false;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await foodsAPI.getAll({
          search: query.trim() || undefined,
          category: category || undefined,
          limit: RESULT_LIMIT,
        });
        if (cancelado) return;
        setResults(res.data?.data || []);
        setError('');
      } catch (err) {
        if (!cancelado) setError(getApiErrorMessage(err, 'No se pudo buscar en el catálogo.'));
      } finally {
        if (!cancelado) setLoading(false);
      }
    }, query ? 300 : 0);

    return () => {
      cancelado = true;
      clearTimeout(t);
    };
  }, [open, query, category]);

  if (!open) return null;

  const flashAdded = (foodId) => {
    setJustAddedId(foodId);
    setTimeout(() => setJustAddedId((id) => (id === foodId ? null : id)), 1200);
  };

  const handleAdd = (food, grams, unitName, label) => {
    onAddFood(targetSlotKey, food, grams, unitName, label);
    flashAdded(food._id);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const energy = Number(createForm.energy);
    if (!createForm.name.trim() || !createForm.category || !(energy > 0)) {
      setCreateError('Nombre, grupo y calorías por 100 g son obligatorios.');
      return;
    }
    setCreateLoading(true);
    setCreateError('');
    try {
      const created = await onCreateFood({
        name: createForm.name.trim(),
        category: createForm.category,
        nutrition: {
          energy,
          protein: Number(createForm.protein) || 0,
          carbohydrates: Number(createForm.carbohydrates) || 0,
          fat: Number(createForm.fat) || 0,
        },
      });
      setCreating(false);
      setCreateForm(emptyCreateForm);
      handleAdd(created, 100, 'g', null);
    } catch (err) {
      setCreateError(getApiErrorMessage(err, 'No se pudo crear el alimento.'));
    } finally {
      setCreateLoading(false);
    }
  };

  const showRecents = !query.trim() && !category && recentFoods.length > 0;

  return (
    <Modal open={open} onClose={onClose} title="Agregar alimento" size="lg">
      <div className="space-y-4">
        <Select
          label="Agregando a"
          value={targetSlotKey || ''}
          onChange={(e) => onChangeTargetSlot(e.target.value)}
        >
          {SLOT_META.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </Select>

        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-secondary)]" />
          <input
            type="search"
            autoFocus
            className="input w-full pl-9"
            placeholder="Buscar alimento por nombre…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar alimento"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIAS.map((c) => (
            <button
              key={c.value || 'todos'}
              type="button"
              className={`tab-btn${category === c.value ? ' active' : ''}`}
              onClick={() => setCategory(c.value)}
            >
              {c.label}
            </button>
          ))}
        </div>

        {showRecents && (
          <div>
            <p className="mb-1.5 text-2xs font-semibold uppercase tracking-wide text-[var(--ink-secondary)]">
              Usados en este plan
            </p>
            <div className="flex flex-wrap gap-1.5">
              {recentFoods.map((f) => {
                const { count, unitName } = defaultQuantityFor(f);
                const addRecent = () => handleAdd(f, resolveGramsForUnit(f, unitName, count), unitName, quantityLabelForUnit(unitName, count));
                return (
                  <button
                    key={f._id}
                    type="button"
                    onClick={addRecent}
                    className="rounded-full border border-[var(--border-soft)] px-3 py-1 text-xs font-medium text-[var(--ink-muted)] transition-colors duration-micro hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    + {f.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="max-h-[min(50vh,26rem)] overflow-y-auto rounded-[var(--radius-m)] border border-[var(--border-soft)]">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-[var(--ink-muted)]">
              <Loader className="animate-spin" size={18} /> Buscando…
            </div>
          ) : error ? (
            <ErrorState message={error} />
          ) : results.length === 0 ? (
            <EmptyState
              icon={<UtensilsCrossed size={22} strokeWidth={1.5} />}
              title="Sin coincidencias"
              description={query ? `Nada llamado "${query}" en el catálogo.` : 'Prueba con otro término o grupo.'}
            />
          ) : (
            <ul>
              {results.map((food) => (
                <ResultRow key={food._id} food={food} onAdd={handleAdd} justAdded={justAddedId === food._id} />
              ))}
            </ul>
          )}
        </div>

        {!creating ? (
          <button
            type="button"
            onClick={() => {
              setCreateForm((f) => ({ ...f, name: f.name || query }));
              setCreating(true);
            }}
            className="flex items-center gap-2 text-sm font-semibold text-[var(--accent)] hover:underline"
          >
            <PlusCircle size={16} />
            ¿No lo encuentras? Crea{query ? ` "${query}"` : ' un alimento nuevo'}
          </button>
        ) : (
          <form onSubmit={handleCreateSubmit} className="space-y-3 rounded-[var(--radius-m)] border border-[var(--border-soft)] p-4">
            <p className="text-sm font-semibold text-[var(--ink)]">Crear alimento nuevo</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Nombre"
                required
                value={createForm.name}
                onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
              />
              <Select
                label="Grupo"
                required
                value={createForm.category}
                onChange={(e) => setCreateForm((f) => ({ ...f, category: e.target.value }))}
              >
                <option value="" disabled>Elige un grupo</option>
                {CATEGORIAS.filter((c) => c.value).map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Input label="Kcal / 100g" required type="number" min={0} value={createForm.energy} onChange={(e) => setCreateForm((f) => ({ ...f, energy: e.target.value }))} />
              <Input label="Proteína (g)" type="number" min={0} value={createForm.protein} onChange={(e) => setCreateForm((f) => ({ ...f, protein: e.target.value }))} />
              <Input label="Carbs (g)" type="number" min={0} value={createForm.carbohydrates} onChange={(e) => setCreateForm((f) => ({ ...f, carbohydrates: e.target.value }))} />
              <Input label="Lípidos (g)" type="number" min={0} value={createForm.fat} onChange={(e) => setCreateForm((f) => ({ ...f, fat: e.target.value }))} />
            </div>
            {createError ? <p className="error-text" role="alert">{createError}</p> : null}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setCreating(false)}>Cancelar</Button>
              <Button type="submit" size="sm" disabled={createLoading} className="gap-2">
                {createLoading ? <Loader className="animate-spin" size={16} /> : <PlusCircle size={16} />}
                Crear y agregar
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}

AddFoodPanel.propTypes = {
  open: PropTypes.bool.isRequired,
  targetSlotKey: PropTypes.string,
  onChangeTargetSlot: PropTypes.func.isRequired,
  recentFoods: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onAddFood: PropTypes.func.isRequired,
  onCreateFood: PropTypes.func.isRequired,
};
