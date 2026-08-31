import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  ArrowLeft, GripVertical, Save, Trash2, Search, Loader, AlertCircle,
} from 'lucide-react';
import { mealPlansAPI, foodsAPI } from '../services/api';
import { getApiErrorMessage } from '../lib/apiError';
import { Button, Card } from '../design-system/components';

/**
 * Alimento arrastrable del panel lateral.
 *
 * El estado vacío de cada tiempo de comida decía "Arrastra alimentos desde la
 * derecha" desde el principio, pero el arrastre nunca existió: toda la
 * interacción era por botones. `@dnd-kit` estaba instalado y había dos
 * componentes de drag & drop en el repositorio que ninguna ruta alcanzaba.
 *
 * Los botones "+ tiempo" se conservan a propósito: son la vía accesible por
 * teclado y en pantallas táctiles pequeñas, donde arrastrar es incómodo.
 */
function AlimentoArrastrable({ food, children }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `food:${food._id}`,
    data: { food },
  });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border border-[var(--border-soft)] p-2 transition-opacity duration-micro ${
        isDragging ? 'opacity-40' : ''
      }`}
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
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

/** Tiempo de comida que acepta alimentos soltados encima. */
function TiempoSoltable({ slotKey, children }) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot:${slotKey}` });

  return (
    <div
      ref={setNodeRef}
      className={`card overflow-hidden transition-colors duration-micro ${
        isOver ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : ''
      }`}
    >
      {children}
    </div>
  );
}

const SLOT_META = [
  { key: 'breakfast', label: 'Desayuno' },
  { key: 'morningSnack', label: 'Colación AM' },
  { key: 'lunch', label: 'Comida' },
  { key: 'afternoonSnack', label: 'Colación PM' },
  { key: 'dinner', label: 'Cena' },
  { key: 'eveningSnack', label: 'Colación nocturna' },
];

/** Valores por 100 g según modelo Food (nutrition.*). */
function nutritionPer100g(food) {
  const n = food?.nutrition || {};
  return {
    energy: Number(n.energy) || 0,
    protein: Number(n.protein) || 0,
    carbohydrates: Number(n.carbohydrates) || 0,
    fats: Number(n.fat) || 0,
    fiber: Number(n.fiber) || 0,
  };
}

function macrosForGrams(food, grams) {
  const g = Math.max(0, Number(grams) || 0);
  const r = g / 100;
  const n = nutritionPer100g(food);
  return {
    quantityGrams: g,
    calories: Math.round(n.energy * r),
    protein: Math.round(n.protein * r * 10) / 10,
    carbohydrates: Math.round(n.carbohydrates * r * 10) / 10,
    fats: Math.round(n.fats * r * 10) / 10,
    fiber: Math.round(n.fiber * r * 10) / 10,
  };
}

function mealsDocumentToSlots(meals) {
  if (!meals || typeof meals !== 'object') {
    return SLOT_META.map((s) => ({ slotKey: s.key, slotLabel: s.label, items: [] }));
  }
  return SLOT_META.map((s) => {
    const block = meals[s.key];
    const arr = Array.isArray(block?.foods)
      ? block.foods
      : Array.isArray(block)
        ? block
        : [];
    const items = arr.map((f) => {
      const ref = f.foodRef?._id || f.foodRef || f.food;
      const name = f.item || f.foodName || f.foodRef?.name || 'Alimento';
      return {
        foodRef: ref,
        foodName: name,
        quantityGrams: f.quantityGrams ?? 100,
        calories: f.calories ?? 0,
        protein: f.protein ?? 0,
        carbohydrates: f.carbohydrates ?? 0,
        fats: f.fats ?? 0,
        fiber: f.fiber ?? 0,
      };
    });
    return { slotKey: s.key, slotLabel: s.label, items };
  });
}

export default function MenuBuilder() {
  const { id: routePlanId } = useParams();
  const [searchParams] = useSearchParams();
  const pacienteId = searchParams.get('paciente');
  const plantilla = searchParams.get('plantilla') === '1';

  const mealPlanId = routePlanId && routePlanId !== 'nueva' ? routePlanId : null;
  const linkedPatientId = pacienteId || null;

  const [nombre, setNombre] = useState('');
  const [slots, setSlots] = useState(() =>
    SLOT_META.map((s) => ({ slotKey: s.key, slotLabel: s.label, items: [] }))
  );
  const [foods, setFoods] = useState([]);
  const [foodsLoading, setFoodsLoading] = useState(true);
  const [foodSearch, setFoodSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(!!mealPlanId);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [arrastrando, setArrastrando] = useState(null);
  const navigate = useNavigate();

  // El sensor de puntero exige 6 px de desplazamiento antes de iniciar un
  // arrastre, para que un clic en el asa no cuente como arrastre accidental.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  );

  const loadFoods = useCallback(async () => {
    setFoodsLoading(true);
    try {
      const res = await foodsAPI.getAll({ limit: 500 });
      const list = res.data?.data || res.data || [];
      setFoods(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
      setFoods([]);
    } finally {
      setFoodsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFoods();
  }, [loadFoods]);

  useEffect(() => {
    if (!mealPlanId) {
      setLoadingPlan(false);
      setLoadError('');
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingPlan(true);
      setLoadError('');
      try {
        const res = await mealPlansAPI.getOne(mealPlanId);
        const plan = res.data?.data || res.data;
        if (cancelled || !plan) return;
        setNombre(plan.name || '');
        setSlots(mealsDocumentToSlots(plan.meals));
      } catch (e) {
        console.error(e);
        if (!cancelled) setLoadError('No se pudo cargar la dieta.');
      } finally {
        if (!cancelled) setLoadingPlan(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mealPlanId]);

  const filteredFoods = foods.filter((f) =>
    (f.name || '').toLowerCase().includes(foodSearch.toLowerCase())
  );

  const addFoodToSlot = (slotKey, food) => {
    const base = macrosForGrams(food, 100);
    setSlots((prev) =>
      prev.map((s) => {
        if (s.slotKey !== slotKey) return s;
        const next = [
          ...s.items,
          {
            foodRef: food._id,
            foodName: food.name,
            ...base,
          },
        ];
        return { ...s, items: next };
      })
    );
  };

  const removeItem = (slotKey, index) => {
    setSlots((prev) =>
      prev.map((s) =>
        s.slotKey === slotKey
          ? { ...s, items: s.items.filter((_, i) => i !== index) }
          : s
      )
    );
  };

  const updateItemGrams = (slotKey, index, grams) => {
    const g = Math.max(0, Number(grams) || 0);
    setSlots((prev) =>
      prev.map((s) => {
        if (s.slotKey !== slotKey) return s;
        const items = s.items.map((it, i) => {
          if (i !== index) return it;
          const food = foods.find((x) => String(x._id) === String(it.foodRef));
          if (!food) {
            return { ...it, quantityGrams: g };
          }
          const m = macrosForGrams(food, g);
          return { ...it, ...m };
        });
        return { ...s, items };
      })
    );
  };

  const mealsPayload = () => {
    const o = {};
    slots.forEach((s) => {
      o[s.slotKey] = {
        foods: s.items.map((it) => ({
          item: it.foodName,
          foodRef: it.foodRef,
          quantityGrams: it.quantityGrams ?? 100,
          calories: it.calories ?? 0,
          protein: it.protein ?? 0,
          carbohydrates: it.carbohydrates ?? 0,
          fats: it.fats ?? 0,
        })),
      };
    });
    return o;
  };

  const computeTotals = () => {
    let totalCalories = 0;
    let protein = 0;
    let carbohydrates = 0;
    let fats = 0;
    let fiber = 0;
    slots.forEach((s) => {
      s.items.forEach((it) => {
        totalCalories += Number(it.calories) || 0;
        protein += Number(it.protein) || 0;
        carbohydrates += Number(it.carbohydrates) || 0;
        fats += Number(it.fats) || 0;
        fiber += Number(it.fiber) || 0;
      });
    });
    return {
      totalCalories: Math.round(totalCalories),
      protein: Math.round(protein * 10) / 10,
      carbohydrates: Math.round(carbohydrates * 10) / 10,
      fats: Math.round(fats * 10) / 10,
      fiber: Math.round(fiber * 10) / 10,
    };
  };

  const handleSave = async () => {
    if (!nombre.trim()) {
      setSaveError('Escribe un nombre para la dieta.');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      const nutrition = computeTotals();
      const meals = mealsPayload();
      const body = {
        name: nombre.trim(),
        meals,
        nutrition,
        isTemplate: plantilla || !linkedPatientId,
      };
      if (linkedPatientId) body.patient = linkedPatientId;

      if (mealPlanId) {
        await mealPlansAPI.update(mealPlanId, body);
      } else {
        await mealPlansAPI.create(body);
      }
      // navigate() en vez de window.location.href: esto es una SPA y el
      // asignar location recargaba la aplicación entera, perdiendo la sesión
      // en memoria y volviendo a descargar todo el bundle.
      navigate('/dietas');
    } catch (e) {
      setSaveError(getApiErrorMessage(e, 'No se pudo guardar la dieta.'));
    } finally {
      setSaving(false);
    }
  };

  const onDragEnd = ({ active, over }) => {
    setArrastrando(null);
    if (!over) return;
    const slotKey = String(over.id).replace(/^slot:/, '');
    const food = active.data.current?.food;
    if (food && slotKey) addFoodToSlot(slotKey, food);
  };

  if (loadingPlan) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-[var(--ink-muted)]">
        <Loader className="animate-spin" size={24} />
        Cargando dieta…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-8 text-center">
        <AlertCircle className="mx-auto mb-3 text-[var(--danger)]" size={40} />
        <p className="text-[var(--ink-muted)]">{loadError}</p>
        <Button as={Link} to="/dietas" className="mt-4">Volver a dietas</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button as={Link} variant="ghost" size="sm" to="/dietas" className="w-fit gap-2 text-[var(--ink-muted)]">
          <ArrowLeft size={18} /> Volver
        </Button>
        <Button size="sm"
          type="button"
          onClick={handleSave}
          disabled={saving} className="gap-2">
          {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
          Guardar dieta
        </Button>
      </div>

      {/* El fallo al guardar se muestra en la página, no con `alert()`: el
          diálogo del navegador bloquea la interfaz y se pierde al aceptarlo,
          justo cuando el usuario necesita ver qué campo corregir. */}
      {saveError ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-[var(--radius-m)] border border-[var(--danger)] bg-[rgba(196,30,22,0.06)] px-4 py-3 text-sm text-[var(--danger)]"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {saveError}
        </div>
      ) : null}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={({ active }) => setArrastrando(active.data.current?.food || null)}
        onDragCancel={() => setArrastrando(null)}
        onDragEnd={onDragEnd}
      >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--ink-secondary)]">
              Nombre del plan
            </label>
            <input
              type="text"
              className="input w-full"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Plan control glucémico"
            />
            {linkedPatientId && (
              <p className="mt-2 text-xs text-[var(--ink-secondary)]">
                Asociado al paciente (ID en URL). Puedes abrir el paciente desde Pacientes.
              </p>
            )}
          </Card>

          {slots.map((slot) => (
            <TiempoSoltable key={slot.slotKey} slotKey={slot.slotKey}>
              <div className="border-b border-[var(--border-soft)] bg-[var(--surface-alt)] px-5 py-3">
                <h3 className="text-sm font-semibold text-[var(--ink)]">{slot.slotLabel}</h3>
              </div>
              <div className="divide-y divide-[var(--border-soft)]">
                {slot.items.length === 0 ? (
                  <p className="px-5 py-6 text-sm text-[var(--ink-secondary)]">
                    Arrastra alimentos desde la derecha, o usa los botones «+ {slot.slotLabel}» del buscador.
                  </p>
                ) : (
                  slot.items.map((item, idx) => (
                    <div key={`${slot.slotKey}-${idx}`} className="flex flex-wrap items-center gap-3 px-5 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-[var(--ink)]">{item.foodName}</p>
                        <p className="text-xs text-[var(--ink-secondary)]">
                          {item.calories} kcal · P {item.protein}g · HC {item.carbohydrates}g · G {item.fats}g
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          className="input w-24 py-1.5 text-sm"
                          value={item.quantityGrams ?? ''}
                          onChange={(e) => updateItemGrams(slot.slotKey, idx, e.target.value)}
                        />
                        <span className="text-xs text-[var(--ink-secondary)]">g</span>
                        <button
                          type="button"
                          onClick={() => removeItem(slot.slotKey, idx)}
                          className="rounded-lg p-2 text-[var(--ink-secondary)] hover:bg-[rgba(255,59,48,0.08)] hover:text-[var(--danger)]"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TiempoSoltable>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24 p-5">
            <h3 className="mb-3 text-sm font-semibold text-[var(--ink)]">Alimentos</h3>
            <div className="relative mb-3">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-secondary)]" />
              <input
                type="text"
                className="input w-full py-2 pl-9 text-sm"
                placeholder="Buscar…"
                value={foodSearch}
                onChange={(e) => setFoodSearch(e.target.value)}
              />
            </div>
            {foodsLoading ? (
              <div className="flex items-center gap-2 py-8 text-sm text-[var(--ink-muted)]">
                <Loader className="animate-spin" size={18} /> Cargando…
              </div>
            ) : (
              <div className="max-h-[60vh] space-y-1 overflow-y-auto pr-1">
                {filteredFoods.slice(0, 120).map((food) => (
                  <AlimentoArrastrable key={food._id} food={food}>
                    <p className="truncate text-sm font-medium text-[var(--ink)]">{food.name}</p>
                    <p className="text-xs text-[var(--ink-secondary)]">
                      {nutritionPer100g(food).energy} kcal / 100g
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {slots.map((s) => (
                        <button
                          key={s.slotKey}
                          type="button"
                          onClick={() => addFoodToSlot(s.slotKey, food)}
                          className="rounded-md border border-[var(--border-soft)] bg-[var(--surface-alt)] px-2 py-0.5 text-[10px] font-medium text-[var(--ink-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                        >
                          + {s.slotLabel}
                        </button>
                      ))}
                    </div>
                  </AlimentoArrastrable>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {arrastrando ? (
          <div className="rounded-[var(--radius-m)] border border-[var(--accent)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--ink)] shadow-card">
            {arrastrando.name}
          </div>
        ) : null}
      </DragOverlay>
      </DndContext>
    </div>
  );
}
