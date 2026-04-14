import { Apple, Filter, Plus, Search, Sparkles } from 'lucide-react';

const GROUPS = ['Todos', 'Verduras', 'Frutas', 'AOA', 'Cereales', 'Leguminosas', 'Grasas'];

const FOODS = [
  { name: 'Tortilla de maíz', group: 'Cereales', kcal: 64, protein: 1.7, carbs: 13.4, fat: 0.7 },
  { name: 'Pechuga de pollo', group: 'AOA', kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: 'Frijol negro cocido', group: 'Leguminosas', kcal: 132, protein: 8.9, carbs: 23.7, fat: 0.5 },
  { name: 'Aguacate hass', group: 'Grasas', kcal: 160, protein: 2, carbs: 8.5, fat: 14.7 },
  { name: 'Nopal cocido', group: 'Verduras', kcal: 16, protein: 1.3, carbs: 3.2, fat: 0.1 },
];

export default function FoodsDatabase() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald mb-2">
            <Apple size={14} />
            Módulo 4
          </div>
          <h1 className="page-title">Base de Datos de Alimentos</h1>
          <p className="page-subtitle">Catálogo clínico con alimentos USDA, preparaciones mexicanas y alimentos personalizados del nutriólogo.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline">
            <Sparkles size={15} />
            Importar etiqueta
          </button>
          <button className="btn btn-primary">
            <Plus size={15} />
            Nuevo alimento
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
        <section className="card !p-0 overflow-hidden">
          <div className="border-b border-navy-700/50 p-4 flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input className="input pl-10" placeholder="Buscar por nombre, grupo o micronutrimento..." />
            </div>
            <button className="btn btn-ghost">
              <Filter size={15} />
              Filtros avanzados
            </button>
          </div>

          <div className="px-4 pt-4 flex flex-wrap gap-2">
            {GROUPS.map((group, index) => (
              <button key={group} className={`tab-btn ${index === 0 ? 'active' : ''}`}>
                {group}
              </button>
            ))}
          </div>

          <div className="p-4">
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Alimento</th>
                    <th>Grupo</th>
                    <th>Kcal</th>
                    <th>Prot</th>
                    <th>Carbs</th>
                    <th>Lípidos</th>
                  </tr>
                </thead>
                <tbody>
                  {FOODS.map((food) => (
                    <tr key={food.name}>
                      <td>
                        <div className="font-semibold text-white">{food.name}</div>
                        <div className="text-xs text-white/30">Referencia por 100 g</div>
                      </td>
                      <td><span className="badge badge-neutral">{food.group}</span></td>
                      <td className="font-mono">{food.kcal}</td>
                      <td className="font-mono">{food.protein} g</td>
                      <td className="font-mono">{food.carbs} g</td>
                      <td className="font-mono">{food.fat} g</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="card">
            <h2 className="section-title">Cobertura del catálogo</h2>
            <div className="mt-4 space-y-3">
              {[
                ['USDA + LATAM', '3,200+ registros base'],
                ['Mexicanos típicos', 'Tortillas, nopales, moles, tamales'],
                ['Alimentos propios', 'Recetas y productos del nutriólogo'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-navy-700/50 bg-navy-800/50 p-4">
                  <div className="text-xs text-white/35 uppercase tracking-wide">{label}</div>
                  <div className="text-sm text-white mt-1">{value}</div>
                </div>
              ))}
            </div>
          </section>
          <section className="card">
            <h2 className="section-title">Listo para el constructor</h2>
            <p className="text-sm text-white/45 mt-2">
              Esta pantalla deja preparada la búsqueda fuzzy, filtros por grupo y alta de alimentos personalizados para integrarse con el módulo de dietas automáticas.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
