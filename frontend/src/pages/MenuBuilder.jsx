import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { ArrowLeft, Save, Loader, AlertCircle } from 'lucide-react';
import { mealPlansAPI, foodsAPI, patientsAPI, dietTemplatesAPI } from '../services/api';
import { getApiErrorMessage } from '../lib/apiError';
import { Button, Card } from '../design-system/components';
import {
  DAYS,
  newUid,
  macrosForGrams,
  emptyDaysState,
  mealsDocumentToSlots,
  daySlotsToMealsPayload,
  computeDayTotals,
  representativeDayKey,
  computeWeekNutrition,
} from '../lib/mealPlanSlots';
import { DEFAULT_META, metaDesdeExpediente } from '../lib/dietGoal';
import StickyMacroBar from '../components/MenuBuilder/StickyMacroBar';
import MealSlotCard from '../components/MenuBuilder/MealSlotCard';
import FoodBrowserPanel from '../components/MenuBuilder/FoodBrowserPanel';
import SubstitutesModal from '../components/MenuBuilder/SubstitutesModal';
import MetaModal from '../components/MenuBuilder/MetaModal';

function insertFoodAt(daySlots, slotKey, index, food) {
  const item = {
    uid: newUid(),
    foodRef: food._id,
    foodCategory: food.category,
    foodName: food.name,
    unitName: 'g',
    quantityLabel: null,
    ...macrosForGrams(food, 100),
  };
  return daySlots.map((s) => {
    if (s.slotKey !== slotKey) return s;
    const items = [...s.items];
    items.splice(index, 0, item);
    return { ...s, items };
  });
}

function moveItemInDay(daySlots, uid, targetSlotKey, targetIndex) {
  const sourceSlot = daySlots.find((s) => s.items.some((it) => it.uid === uid));
  if (!sourceSlot) return daySlots;
  const item = sourceSlot.items.find((it) => it.uid === uid);
  return daySlots.map((s) => {
    if (s.slotKey === sourceSlot.slotKey && s.slotKey === targetSlotKey) {
      const without = s.items.filter((it) => it.uid !== uid);
      const idx = Math.min(targetIndex, without.length);
      without.splice(idx, 0, item);
      return { ...s, items: without };
    }
    if (s.slotKey === sourceSlot.slotKey) {
      return { ...s, items: s.items.filter((it) => it.uid !== uid) };
    }
    if (s.slotKey === targetSlotKey) {
      const items = [...s.items];
      items.splice(Math.min(targetIndex, items.length), 0, item);
      return { ...s, items };
    }
    return s;
  });
}

export default function MenuBuilder() {
  const { id: routePlanId } = useParams();
  const [searchParams] = useSearchParams();
  const pacienteId = searchParams.get('paciente');
  const plantilla = searchParams.get('plantilla') === '1';
  const templateId = searchParams.get('templateId');

  const mealPlanId = routePlanId && routePlanId !== 'nueva' ? routePlanId : null;
  const linkedPatientId = pacienteId || null;

  const [nombre, setNombre] = useState('');
  const [daysState, setDaysState] = useState(emptyDaysState);
  const [activeDay, setActiveDay] = useState('lun');
  const [portionMode, setPortionMode] = useState('grams');
  const [meta, setMeta] = useState(DEFAULT_META);
  const [metaModalOpen, setMetaModalOpen] = useState(false);
  const [substitutesItem, setSubstitutesItem] = useState(null);

  const [patient, setPatient] = useState(null);
  const [foods, setFoods] = useState([]);
  const [foodsLoading, setFoodsLoading] = useState(true);
  const [foodSearch, setFoodSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(!!mealPlanId);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [activeDragLabel, setActiveDragLabel] = useState(null);
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

  // Paciente vinculado: da contexto de alergias en pantalla y alimenta el
  // cálculo de la meta (Mifflin-St Jeor) con su peso/talla/edad reales.
  useEffect(() => {
    if (!linkedPatientId) return undefined;
    let cancelado = false;
    (async () => {
      try {
        const res = await patientsAPI.getOne(linkedPatientId);
        const p = res.data?.data || res.data;
        if (!cancelado && p) {
          setPatient(p);
          setMeta(metaDesdeExpediente(p));
        }
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [linkedPatientId]);

  // Un plan existente manda sobre una plantilla: `templateId` solo siembra
  // un plan nuevo, nunca sustituye uno que ya se está editando.
  useEffect(() => {
    if (mealPlanId) return undefined;
    setLoadingPlan(false);
    setLoadError('');
    if (!templateId) return undefined;

    let cancelado = false;
    (async () => {
      try {
        const res = await dietTemplatesAPI.getOne(templateId);
        const tpl = res.data?.data || res.data;
        if (cancelado || !tpl) return;
        setNombre(tpl.name || '');
        setDaysState((prev) => ({ ...prev, lun: mealsDocumentToSlots(tpl.defaultMeals) }));
        if (tpl.targetCalories) {
          setMeta({
            kcal: tpl.targetCalories,
            protein: tpl.targetMacros?.protein || DEFAULT_META.protein,
            carbohydrates: tpl.targetMacros?.carbohydrates || DEFAULT_META.carbohydrates,
            fats: tpl.targetMacros?.fats || DEFAULT_META.fats,
          });
        }
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [mealPlanId, templateId]);

  useEffect(() => {
    if (!mealPlanId) return undefined;
    let cancelado = false;
    (async () => {
      setLoadingPlan(true);
      setLoadError('');
      try {
        const res = await mealPlansAPI.getOne(mealPlanId);
        const plan = res.data?.data || res.data;
        if (cancelado || !plan) return;
        setNombre(plan.name || '');
        if (Array.isArray(plan.days) && plan.days.length > 0) {
          setDaysState((prev) => {
            const next = { ...prev };
            plan.days.forEach((d) => {
              if (d.key) next[d.key] = mealsDocumentToSlots(d.meals);
            });
            return next;
          });
        } else {
          // Plan anterior al editor multi-día: su único menú se coloca en
          // "lun" y el resto de la semana arranca vacía.
          setDaysState((prev) => ({ ...prev, lun: mealsDocumentToSlots(plan.meals) }));
        }
      } catch (e) {
        console.error(e);
        if (!cancelado) setLoadError('No se pudo cargar la dieta.');
      } finally {
        if (!cancelado) setLoadingPlan(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [mealPlanId]);

  const updateActiveDay = useCallback(
    (updater) => {
      setDaysState((prev) => ({ ...prev, [activeDay]: updater(prev[activeDay]) }));
    },
    [activeDay]
  );

  const addFoodToActiveDay = useCallback(
    (slotKey, food) => {
      updateActiveDay((slots) =>
        insertFoodAt(slots, slotKey, slots.find((s) => s.slotKey === slotKey).items.length, food)
      );
    },
    [updateActiveDay]
  );

  const updateItemInActiveDay = useCallback(
    (uid, patch) => {
      updateActiveDay((slots) =>
        slots.map((s) => ({
          ...s,
          items: s.items.map((it) => (it.uid === uid ? { ...it, ...patch } : it)),
        }))
      );
    },
    [updateActiveDay]
  );

  const removeItemInActiveDay = useCallback(
    (uid) => {
      updateActiveDay((slots) => slots.map((s) => ({ ...s, items: s.items.filter((it) => it.uid !== uid) })));
    },
    [updateActiveDay]
  );

  const handleCopyDay = useCallback(
    (targetKeys) => {
      setDaysState((prev) => {
        const source = prev[activeDay];
        const next = { ...prev };
        targetKeys.forEach((key) => {
          next[key] = source.map((s) => ({ ...s, items: s.items.map((it) => ({ ...it, uid: newUid() })) }));
        });
        return next;
      });
    },
    [activeDay]
  );

  const handleSelectSubstitute = useCallback(
    (candidate) => {
      if (!substitutesItem) return;
      const macros = macrosForGrams({ nutrition: candidate.nutrition }, substitutesItem.quantityGrams);
      updateItemInActiveDay(substitutesItem.uid, {
        foodRef: candidate.id,
        foodName: candidate.name,
        foodCategory: candidate.category,
        quantityLabel: null,
        unitName: 'g',
        ...macros,
      });
      setSubstitutesItem(null);
    },
    [substitutesItem, updateItemInActiveDay]
  );

  const handleDragStart = useCallback(
    ({ active }) => {
      const activeId = String(active.id);
      if (activeId.startsWith('food:')) {
        setActiveDragLabel(active.data.current?.food?.name || null);
      } else if (activeId.startsWith('item:')) {
        const uid = activeId.slice(5);
        const item = daysState[activeDay].flatMap((s) => s.items).find((it) => it.uid === uid);
        setActiveDragLabel(item?.foodName || null);
      }
    },
    [daysState, activeDay]
  );

  const handleDragEnd = useCallback(
    ({ active, over }) => {
      setActiveDragLabel(null);
      if (!over) return;
      const activeId = String(active.id);
      const overId = String(over.id);

      if (activeId.startsWith('food:')) {
        const food = active.data.current?.food;
        if (!food) return;
        updateActiveDay((slots) => {
          let targetSlotKey;
          let targetIndex;
          if (overId.startsWith('slot:')) {
            targetSlotKey = overId.slice(5);
            targetIndex = slots.find((s) => s.slotKey === targetSlotKey).items.length;
          } else if (overId.startsWith('item:')) {
            const overUid = overId.slice(5);
            const slot = slots.find((s) => s.items.some((it) => it.uid === overUid));
            if (!slot) return slots;
            targetSlotKey = slot.slotKey;
            targetIndex = slot.items.findIndex((it) => it.uid === overUid);
          } else {
            return slots;
          }
          return insertFoodAt(slots, targetSlotKey, targetIndex, food);
        });
        return;
      }

      if (activeId.startsWith('item:')) {
        const uid = activeId.slice(5);
        updateActiveDay((slots) => {
          let targetSlotKey;
          let targetIndex;
          if (overId.startsWith('slot:')) {
            targetSlotKey = overId.slice(5);
            targetIndex = slots.find((s) => s.slotKey === targetSlotKey).items.length;
          } else if (overId.startsWith('item:')) {
            const overUid = overId.slice(5);
            if (overUid === uid) return slots;
            const slot = slots.find((s) => s.items.some((it) => it.uid === overUid));
            if (!slot) return slots;
            targetSlotKey = slot.slotKey;
            targetIndex = slot.items.findIndex((it) => it.uid === overUid);
          } else {
            return slots;
          }
          return moveItemInDay(slots, uid, targetSlotKey, targetIndex);
        });
      }
    },
    [updateActiveDay]
  );

  const handleSave = async () => {
    if (!nombre.trim()) {
      setSaveError('Escribe un nombre para la dieta.');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      const days = DAYS.map((d) => ({ key: d.key, meals: daySlotsToMealsPayload(daysState[d.key]) }));
      const repKey = representativeDayKey(daysState);
      const body = {
        name: nombre.trim(),
        days,
        meals: daySlotsToMealsPayload(daysState[repKey]),
        nutrition: computeWeekNutrition(daysState),
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

  const activeSlots = daysState[activeDay];
  const totals = useMemo(() => computeDayTotals(activeSlots), [activeSlots]);

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
        <Button size="sm" type="button" onClick={handleSave} disabled={saving} className="gap-2">
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
        {patient && (
          <p className="mt-2 text-xs text-[var(--ink-secondary)]">
            Asociado a {patient.firstName} {patient.lastName}.
            {(patient.alergias || patient.patologias?.length > 0) && ' Revisa sus alertas antes de armar el plan.'}
          </p>
        )}
      </Card>

      <StickyMacroBar
        activeDay={activeDay}
        onChangeDay={setActiveDay}
        portionMode={portionMode}
        onChangePortionMode={setPortionMode}
        totals={totals}
        meta={meta}
        onOpenMeta={() => setMetaModalOpen(true)}
        onCopyDay={handleCopyDay}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragCancel={() => setActiveDragLabel(null)}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {activeSlots.map((slot) => (
              <MealSlotCard
                key={slot.slotKey}
                slot={slot}
                foods={foods}
                portionMode={portionMode}
                onAddFood={(food) => addFoodToActiveDay(slot.slotKey, food)}
                onUpdateItem={updateItemInActiveDay}
                onRemoveItem={removeItemInActiveDay}
                onOpenSubstitutes={setSubstitutesItem}
              />
            ))}
          </div>

          {/* El panel de arrastre es una vía adicional a la del buscador de
              cada tiempo de comida, pensada para mouse y teclado: en un
              celular, arrastrar un alimento a través de una pantalla que
              además hace scroll es incómodo, y obligaba a bajar más allá de
              los 6 tiempos de comida solo para encontrar el panel. Cada
              MealSlotCard ya trae su propio buscador — se esconde aquí en vez
              de duplicar esa función con peor ergonomía. */}
          <div className="hidden lg:col-span-1 lg:block">
            <FoodBrowserPanel
              foods={foods}
              loading={foodsLoading}
              search={foodSearch}
              onSearchChange={setFoodSearch}
              onQuickAdd={addFoodToActiveDay}
            />
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeDragLabel ? (
            <div className="rounded-[var(--radius-m)] border border-[var(--accent)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--ink)] shadow-card">
              {activeDragLabel}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <MetaModal
        open={metaModalOpen}
        meta={meta}
        onClose={() => setMetaModalOpen(false)}
        onSave={(next) => {
          setMeta(next);
          setMetaModalOpen(false);
        }}
      />

      <SubstitutesModal item={substitutesItem} onClose={() => setSubstitutesItem(null)} onSelect={handleSelectSubstitute} />
    </div>
  );
}
