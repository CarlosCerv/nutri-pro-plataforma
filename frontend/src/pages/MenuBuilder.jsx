import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
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

/** Intercambia un alimento con su vecino inmediato (-1 sube, +1 baja). Reemplaza el arrastre para reordenar. */
function reorderItemInSlot(daySlots, slotKey, uid, direction) {
  return daySlots.map((s) => {
    if (s.slotKey !== slotKey) return s;
    const idx = s.items.findIndex((it) => it.uid === uid);
    const destino = idx + direction;
    if (idx === -1 || destino < 0 || destino >= s.items.length) return s;
    const items = [...s.items];
    [items[idx], items[destino]] = [items[destino], items[idx]];
    return { ...s, items };
  });
}

/** Mueve un alimento a otro tiempo de comida (al final). Reemplaza soltar sobre otro tiempo al arrastrar. */
function moveItemBetweenSlots(daySlots, uid, fromSlotKey, toSlotKey) {
  if (fromSlotKey === toSlotKey) return daySlots;
  const origen = daySlots.find((s) => s.slotKey === fromSlotKey);
  const item = origen?.items.find((it) => it.uid === uid);
  if (!item) return daySlots;
  return daySlots.map((s) => {
    if (s.slotKey === fromSlotKey) return { ...s, items: s.items.filter((it) => it.uid !== uid) };
    if (s.slotKey === toSlotKey) return { ...s, items: [...s.items, item] };
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
  const [saving, setSaving] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(!!mealPlanId);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const navigate = useNavigate();

  const loadFoods = useCallback(async () => {
    try {
      const res = await foodsAPI.getAll({ limit: 500 });
      const list = res.data?.data || res.data || [];
      setFoods(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
      setFoods([]);
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

  const reorderItemInActiveDay = useCallback(
    (slotKey, uid, direction) => {
      updateActiveDay((slots) => reorderItemInSlot(slots, slotKey, uid, direction));
    },
    [updateActiveDay]
  );

  const moveItemToSlotInActiveDay = useCallback(
    (uid, fromSlotKey, toSlotKey) => {
      updateActiveDay((slots) => moveItemBetweenSlots(slots, uid, fromSlotKey, toSlotKey));
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
    <div className="space-y-5 animate-fade-up sm:space-y-6">
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

      <Card className="p-4 sm:p-5">
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

      {/* Un solo tiempo de comida por ancho de pantalla: sin panel lateral de
          arrastre que alimentar, no hay nada que ganar partiendo la pantalla
          en columnas — y una sola columna es exactamente el mismo flujo en
          celular, tablet o escritorio. */}
      <div className="mx-auto max-w-3xl space-y-4">
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
            onReorderItem={reorderItemInActiveDay}
            onMoveItemToSlot={moveItemToSlotInActiveDay}
          />
        ))}
      </div>

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
