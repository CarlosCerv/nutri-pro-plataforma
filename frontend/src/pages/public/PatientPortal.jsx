import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ArrowLeftRight, Salad, ShoppingCart, Loader } from 'lucide-react';
import { portalAPI } from '../../services/publicApi';
import { getApiErrorMessage } from '../../lib/apiError';
import { Modal, Tabs } from '../../design-system/components';
import Disclosure from '../../design-system/components/Disclosure';
import { EmptyState, ErrorState, LoadingState } from '../../design-system/components/StateViews';
import { DAYS, SLOT_META } from '../../lib/mealPlanSlots';
import PublicPageShell from './PublicPageShell';

const TABS = [
  { id: 'menu', label: 'Mi menú', icon: <Salad size={14} /> },
  { id: 'compras', label: 'Lista del súper', icon: <ShoppingCart size={14} /> },
];

function foodsInMeals(meals) {
  if (!meals) return [];
  return SLOT_META.map((s) => ({ slot: s, foods: meals[s.key]?.foods || [] }));
}

/**
 * `PatientPortal` la monta con `key={foodId}`: al cambiar de alimento React
 * desecha esta instancia y crea una nueva, así el estado de carga arranca
 * limpio sin tener que resetearlo a mano dentro de un efecto (el ajuste de
 * estado por cambio de prop es justo lo que ese patrón evita).
 */
function SustitucionModal({ token, item, onClose }) {
  const [estado, setEstado] = useState('cargando');
  const [equivalentes, setEquivalentes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const res = await portalAPI.getSubstitutes(token, item.foodRef?._id || item.foodRef);
        if (!cancelado) {
          setEquivalentes(res.data?.equivalents || []);
          setEstado('listo');
        }
      } catch (err) {
        if (!cancelado) {
          setError(getApiErrorMessage(err, 'No se pudieron cargar los sustitutos.'));
          setEstado('error');
        }
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [token, item]);

  return (
    <Modal open onClose={onClose} title={`Sustitutos para ${item.item || item.foodName}`} size="sm">
      <p className="mb-4 text-xs text-[var(--ink-secondary)]">
        Son sugerencias con aporte calórico y de macros similar, del mismo grupo. Coméntalas con tu nutriólogo antes de cambiar tu plan.
      </p>
      {estado === 'cargando' ? (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-[var(--ink-muted)]">
          <Loader className="animate-spin" size={16} /> Buscando…
        </div>
      ) : estado === 'error' ? (
        <ErrorState message={error} />
      ) : equivalentes.length === 0 ? (
        <EmptyState icon={<ArrowLeftRight size={20} />} title="Sin equivalentes disponibles" />
      ) : (
        <ul className="space-y-2">
          {equivalentes.map((eq) => (
            <li key={eq.id} className="rounded-[var(--radius-m)] border border-[var(--border-soft)] p-3">
              <p className="text-sm font-medium text-[var(--ink)]">{eq.name}</p>
              <p className="mt-0.5 text-xs text-[var(--ink-secondary)]">
                {eq.nutrition.energy} kcal · P {eq.nutrition.protein}g · HC {eq.nutrition.carbohydrates}g · G {eq.nutrition.fat}g (por 100 g)
              </p>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

SustitucionModal.propTypes = {
  token: PropTypes.string.isRequired,
  item: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

function MiMenu({ plan, onOpenSustitucion }) {
  const dias = useMemo(() => (Array.isArray(plan.days) ? plan.days.filter((d) => d.meals) : []), [plan.days]);
  const [diaActivo, setDiaActivo] = useState(dias[0]?.key || null);

  const mealsAMostrar = dias.length > 0
    ? dias.find((d) => d.key === diaActivo)?.meals || dias[0]?.meals
    : plan.meals;

  const bloques = foodsInMeals(mealsAMostrar).filter((b) => b.foods.length > 0);

  return (
    <div className="space-y-3">
      {dias.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {DAYS.map((d) => {
            const tieneContenido = dias.find((x) => x.key === d.key);
            if (!tieneContenido) return null;
            return (
              <button
                key={d.key}
                type="button"
                onClick={() => setDiaActivo(d.key)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-micro ${
                  diaActivo === d.key ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface)] text-[var(--ink-muted)] border border-[var(--border-soft)]'
                }`}
              >
                {d.short}
              </button>
            );
          })}
        </div>
      )}

      {bloques.length === 0 ? (
        <EmptyState icon={<Salad size={22} strokeWidth={1.5} />} title="Sin alimentos capturados para este día" />
      ) : (
        bloques.map(({ slot, foods }) => (
          <Disclosure key={slot.key} title={slot.label} badge={<span className="text-2xs text-[var(--ink-secondary)]">{foods.length}</span>} defaultOpen>
            <ul className="space-y-2">
              {foods.map((f, i) => (
                <li key={`${slot.key}-${i}`} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--ink)]">{f.item || f.foodName}</p>
                    <p className="text-xs text-[var(--ink-secondary)]">
                      {f.quantity || `${f.quantityGrams ?? ''} g`} · {f.calories ?? 0} kcal
                    </p>
                  </div>
                  {f.foodRef && (
                    <button
                      type="button"
                      onClick={() => onOpenSustitucion(f)}
                      className="shrink-0 rounded-full p-2 text-[var(--ink-secondary)] hover:bg-[var(--accent-tint)] hover:text-[var(--accent)]"
                      aria-label={`Sustitutos para ${f.item || f.foodName}`}
                    >
                      <ArrowLeftRight size={15} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </Disclosure>
        ))
      )}
    </div>
  );
}

MiMenu.propTypes = {
  plan: PropTypes.object.isRequired,
  onOpenSustitucion: PropTypes.func.isRequired,
};

function ListaDeCompras({ planId, shoppingList }) {
  const storageKey = `nutripro-portal-compras-${planId}`;
  const [marcados, setMarcados] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '{}');
    } catch {
      return {};
    }
  });

  const toggle = (foodId) => {
    setMarcados((prev) => {
      const next = { ...prev, [foodId]: !prev[foodId] };
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // localStorage puede fallar en modo privado; el check simplemente no persiste.
      }
      return next;
    });
  };

  if (shoppingList.length === 0) {
    return <EmptyState icon={<ShoppingCart size={22} strokeWidth={1.5} />} title="Sin ingredientes que comprar" />;
  }

  return (
    <div className="space-y-3">
      {shoppingList.map((depto) => (
        <div key={depto.department} className="card p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--ink-secondary)]">{depto.department}</h3>
          <ul className="space-y-1">
            {depto.items.map((item) => (
              <li key={item.foodId}>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition-colors duration-micro hover:bg-[var(--surface-alt)]">
                  <input
                    type="checkbox"
                    checked={!!marcados[item.foodId]}
                    onChange={() => toggle(item.foodId)}
                    className="h-4 w-4 accent-[var(--accent)]"
                  />
                  <span className={`flex-1 text-sm transition-opacity duration-micro ${marcados[item.foodId] ? 'text-[var(--ink-secondary)] line-through opacity-60' : 'text-[var(--ink-muted)]'}`}>
                    {item.name}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-[var(--ink-secondary)]">{item.totalGrams} g</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

ListaDeCompras.propTypes = {
  planId: PropTypes.string.isRequired,
  shoppingList: PropTypes.array.isRequired,
};

export default function PatientPortal() {
  const { token } = useParams();
  const [estado, setEstado] = useState('cargando');
  const [errorMsg, setErrorMsg] = useState('');
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('menu');
  const [sustitucionItem, setSustitucionItem] = useState(null);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const res = await portalAPI.get(token);
        if (!cancelado) {
          setData(res.data?.data || null);
          setEstado('listo');
        }
      } catch (err) {
        if (!cancelado) {
          setErrorMsg(getApiErrorMessage(err, 'Este enlace no es válido.'));
          setEstado('error');
        }
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [token]);

  if (estado === 'cargando') {
    return (
      <PublicPageShell eyebrow="Portal del paciente">
        <LoadingState label="Cargando tu plan…" />
      </PublicPageShell>
    );
  }

  if (estado === 'error') {
    return (
      <PublicPageShell eyebrow="Portal del paciente">
        <div className="card p-8" style={{ borderRadius: 'var(--radius-l)' }}>
          <ErrorState message={errorMsg} />
        </div>
      </PublicPageShell>
    );
  }

  return (
    <PublicPageShell eyebrow="Portal del paciente" maxWidth="max-w-2xl">
      <h1 className="mb-1 text-xl font-semibold text-[var(--ink)]">Hola, {data.patientFirstName}</h1>

      {!data.plan ? (
        <div className="card mt-4 p-8" style={{ borderRadius: 'var(--radius-l)' }}>
          <EmptyState icon={<Salad size={26} strokeWidth={1.5} />} title="Aún no tienes un plan asignado" description="Cuando tu nutriólogo publique tu plan, aparecerá aquí." />
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-[var(--ink-secondary)]">{data.plan.name}</p>
          <Tabs items={TABS} value={tab} onChange={setTab} ariaLabel="Secciones del portal" className="mb-4" />

          {tab === 'menu' ? (
            <MiMenu plan={data.plan} onOpenSustitucion={setSustitucionItem} />
          ) : (
            <ListaDeCompras planId={data.plan.id} shoppingList={data.shoppingList} />
          )}

          {sustitucionItem ? (
            <SustitucionModal
              key={sustitucionItem.foodRef?._id || sustitucionItem.foodRef}
              token={token}
              item={sustitucionItem}
              onClose={() => setSustitucionItem(null)}
            />
          ) : null}
        </>
      )}
    </PublicPageShell>
  );
}
