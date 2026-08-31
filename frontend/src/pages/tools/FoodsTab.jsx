import { useCallback, useEffect, useState } from 'react';
import { Apple, Search } from 'lucide-react';
import { foodsAPI } from '../../services/api';
import { getApiErrorMessage } from '../../lib/apiError';
import DataTable from '../../design-system/components/DataTable.jsx';
import Button from '../../design-system/components/Button.jsx';
import { EmptyState } from '../../design-system/components/StateViews.jsx';

/**
 * Catálogo de alimentos.
 *
 * La versión anterior de esta pantalla mostraba cinco alimentos escritos a
 * mano dentro del propio archivo, con el buscador y los botones sin ningún
 * manejador, mientras `/api/foods` existía con el catálogo completo sembrado
 * y `foodsAPI` estaba declarado en `services/api.js` sin que nadie lo usara.
 */

const CATEGORIAS = [
  { value: '', label: 'Todos' },
  { value: 'cereals', label: 'Cereales' },
  { value: 'proteins', label: 'Proteínas' },
  { value: 'dairy', label: 'Lácteos' },
  { value: 'fruits', label: 'Frutas' },
  { value: 'vegetables', label: 'Verduras' },
  { value: 'legumes', label: 'Leguminosas' },
  { value: 'fats', label: 'Grasas' },
  { value: 'nuts', label: 'Oleaginosas' },
  { value: 'beverages', label: 'Bebidas' },
  { value: 'other', label: 'Otros' },
];

const ETIQUETA_CATEGORIA = Object.fromEntries(CATEGORIAS.map((c) => [c.value, c.label]));
const LIMITE = 25;

const numero = (v, decimales = 1) => (typeof v === 'number' ? v.toFixed(decimales).replace(/\.0$/, '') : '—');

export default function FoodsTab() {
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('');
  const [pagina, setPagina] = useState(1);
  const [datos, setDatos] = useState({ foods: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recarga, setRecarga] = useState(0);

  // El filtrado y la paginación son del servidor: el catálogo clínico puede
  // tener miles de alimentos y traerlos todos para filtrar en el navegador
  // no escala.
  useEffect(() => {
    let cancelado = false;
    setLoading(true);

    const t = setTimeout(async () => {
      try {
        const res = await foodsAPI.getAll({
          search: busqueda.trim() || undefined,
          category: categoria || undefined,
          page: pagina,
          limit: LIMITE,
        });
        if (cancelado) return;
        setDatos({
          foods: res.data?.data || [],
          total: res.data?.pagination?.total || 0,
          pages: res.data?.pagination?.pages || 1,
        });
        setError(null);
      } catch (err) {
        if (!cancelado) setError(getApiErrorMessage(err, 'No se pudo cargar el catálogo de alimentos.'));
      } finally {
        if (!cancelado) setLoading(false);
      }
    }, busqueda ? 300 : 0); // debounce solo al escribir

    return () => {
      cancelado = true;
      clearTimeout(t);
    };
  }, [busqueda, categoria, pagina, recarga]);

  const cambiarCategoria = useCallback((valor) => {
    setCategoria(valor);
    setPagina(1);
  }, []);

  const columnas = [
    {
      key: 'name',
      header: 'Alimento',
      render: (f) => (
        <div>
          <div className="font-medium text-[var(--ink)]">{f.name}</div>
          <div className="text-xs text-[var(--ink-secondary)]">
            {f.portionSize?.name ? `Porción: ${f.portionSize.name}` : 'Por 100 g'}
          </div>
        </div>
      ),
    },
    { key: 'category', header: 'Grupo', render: (f) => ETIQUETA_CATEGORIA[f.category] || f.category || '—' },
    { key: 'energy', header: 'kcal', align: 'right', render: (f) => numero(f.nutrition?.energy, 0) },
    { key: 'protein', header: 'Proteína (g)', align: 'right', render: (f) => numero(f.nutrition?.protein) },
    { key: 'carbs', header: 'HC (g)', align: 'right', render: (f) => numero(f.nutrition?.carbohydrates) },
    { key: 'fat', header: 'Lípidos (g)', align: 'right', render: (f) => numero(f.nutrition?.fat) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative w-full lg:max-w-md">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-secondary)]" />
          <input
            type="search"
            className="input w-full pl-9"
            placeholder="Buscar alimento por nombre"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPagina(1);
            }}
            aria-label="Buscar alimento"
          />
        </div>
        <p className="text-sm text-[var(--ink-secondary)] lg:ml-auto">
          {loading ? 'Buscando…' : `${datos.total} ${datos.total === 1 ? 'alimento' : 'alimentos'}`}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIAS.map((c) => (
          <button
            key={c.value || 'todos'}
            type="button"
            className={`tab-btn${categoria === c.value ? ' active' : ''}`}
            onClick={() => cambiarCategoria(c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columnas}
        rows={datos.foods}
        loading={loading}
        error={error}
        onRetry={() => setRecarga((n) => n + 1)}
        empty={
          <EmptyState
            icon={<Apple size={26} strokeWidth={1.5} />}
            title={busqueda || categoria ? 'Sin coincidencias' : 'El catálogo está vacío'}
            description={
              busqueda || categoria
                ? 'Prueba con otro término o quita el filtro de grupo.'
                : 'Ejecuta `npm run seed:foods` en el backend para cargar el catálogo base.'
            }
          />
        }
      />

      {datos.pages > 1 ? (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={pagina <= 1} onClick={() => setPagina((p) => p - 1)}>
            Anterior
          </Button>
          <span className="text-sm text-[var(--ink-secondary)]">
            Página {pagina} de {datos.pages}
          </span>
          <Button variant="outline" size="sm" disabled={pagina >= datos.pages} onClick={() => setPagina((p) => p + 1)}>
            Siguiente
          </Button>
        </div>
      ) : null}
    </div>
  );
}
