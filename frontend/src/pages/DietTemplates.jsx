import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Layers, Copy, FileBadge, ArrowRight } from 'lucide-react';
import { dietTemplatesAPI } from '../services/api';
import { getApiErrorMessage } from '../lib/apiError';
import { Badge, Button, Card } from '../design-system/components';
import { ErrorState } from '../design-system/components/StateViews';

const CATEGORY_LABEL = {
  mediterranean: 'Mediterránea',
  diabetic: 'Para diabéticos',
  hypertensive: 'Para hipertensos',
  'weight-loss': 'Pérdida de peso',
  'weight-gain': 'Ganancia de peso',
  vegetarian: 'Vegetariana',
  vegan: 'Vegana',
  'low-carb': 'Baja en carbohidratos',
  'high-protein': 'Alta en proteína',
  custom: 'Personalizada',
};

/**
 * Plantillas de dieta (`DietTemplate`, no `MealPlan.isTemplate`).
 *
 * Esta pantalla leía campos que el modelo nunca tuvo (`t.nombre`, `t.tipo`,
 * `t.color`, `t.kcal`, `t.macros`): pintaba "undefined" en cada tarjeta y el
 * filtro de búsqueda tronaba al llamar `.toLowerCase()` sobre esos
 * `undefined`. Aquí se leen los campos reales de `DietTemplate` y "Usar esta
 * plantilla" entrega a `MenuBuilder` un `?templateId=` que ya sabe leer.
 */
export default function DietTemplates() {
  const [templates, setTemplates] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const res = await dietTemplatesAPI.getAll();
        if (!cancelado) setTemplates(res.data?.data || []);
      } catch (err) {
        if (!cancelado) setError(getApiErrorMessage(err, 'No se pudieron cargar las plantillas.'));
      } finally {
        if (!cancelado) setLoading(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  const filtered = templates.filter((t) => {
    const q = search.toLowerCase();
    return (t.name || '').toLowerCase().includes(q) || (CATEGORY_LABEL[t.category] || t.category || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--ink-muted)]">
          Plantillas base para acelerar el armado de un plan.
        </p>
        <Button as={Link} size="sm" to="/dietas/nueva" className="gap-2">
          <Layers size={16} /> Crear plan desde cero
        </Button>
      </div>

      <div className="relative w-full max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-secondary)]" />
        <input
          aria-label="Buscar plantillas"
          type="text"
          className="input pl-10"
          placeholder="Buscar plantilla o categoría..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-48 bg-gradient-to-br from-[var(--surface-alt)] to-[var(--surface-strong)] animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} />
      ) : templates.length === 0 ? (
        <div className="empty-state py-12">
          <FileBadge size={32} className="mx-auto text-[var(--ink-secondary)] mb-3" />
          <div className="text-[var(--ink-secondary)] font-semibold mb-1">Sin plantillas disponibles</div>
          <div className="text-[var(--ink-secondary)] text-xs mb-4">Las plantillas del sistema aparecerán aquí cuando el catálogo las incluya.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <Card key={t._id} className="p-5 group flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <Badge variant="info">{CATEGORY_LABEL[t.category] || t.category}</Badge>
              </div>

              <div className="flex-1">
                <h3 className="text-base font-semibold text-[var(--ink)] mb-1">{t.name}</h3>
                <p className="text-xs text-[var(--ink-secondary)] mb-4 line-clamp-2">{t.description}</p>

                <div className="flex gap-4">
                  <div>
                    <div className="text-2xs text-[var(--ink-secondary)] uppercase tracking-widest mb-0.5">Kcal</div>
                    <div className="font-mono text-sm font-medium text-[var(--warning)]">{t.targetCalories ?? '—'}</div>
                  </div>
                  <div className="w-px h-8 bg-[var(--surface-strong)]"></div>
                  <div>
                    <div className="text-2xs text-[var(--ink-secondary)] uppercase tracking-widest mb-0.5">Macros</div>
                    <div className="font-mono text-sm font-medium text-[var(--ink-muted)]">
                      P{t.targetMacros?.protein ?? '—'} · HC{t.targetMacros?.carbohydrates ?? '—'} · G{t.targetMacros?.fats ?? '—'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-5 border-t border-[var(--border-soft)]">
                <Link
                  to={`/dietas/nueva?templateId=${t._id}`}
                  className="w-full btn btn-ghost justify-between text-[var(--accent)] hover:bg-[var(--accent-tint)] hover:border-[var(--accent-border)] transition-all border border-transparent"
                >
                  <span className="flex items-center gap-2"><Copy size={16} /> Usar esta plantilla</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && search && (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-[var(--border-soft)] rounded-3xl">
              <FileBadge size={32} className="mx-auto text-[var(--ink-secondary)] mb-3" />
              <div className="text-[var(--ink-secondary)] font-semibold mb-1">Sin coincidencias</div>
              <div className="text-[var(--ink-secondary)] text-xs text-center">No se encontraron plantillas con ese nombre.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
