import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Filter, Salad, Apple, Beef, Wheat, Droplets } from 'lucide-react';
import api from '../services/api';

const MOCK_ALIMENTOS = [
  { _id: '1', nombre: 'Huevo entero', grupo: 'AOA', cal: 155, prot: 13, carbs: 1.1, fat: 11, fibra: 0, porcion: 100, unidad: 'g' },
  { _id: '2', nombre: 'Pechuga de pollo al horno', grupo: 'AOA', cal: 165, prot: 31, carbs: 0, fat: 3.6, fibra: 0, porcion: 100, unidad: 'g' },
  { _id: '3', nombre: 'Arroz blanco cocido', grupo: 'Cereales', cal: 130, prot: 2.7, carbs: 28, fat: 0.3, fibra: 0.4, porcion: 100, unidad: 'g' },
  { _id: '4', nombre: 'Pan integral', grupo: 'Cereales', cal: 265, prot: 9, carbs: 49, fat: 3.5, fibra: 7, porcion: 100, unidad: 'g' },
  { _id: '5', nombre: 'Frijoles negros cocidos', grupo: 'Leguminosas', cal: 132, prot: 8.9, carbs: 24, fat: 0.5, fibra: 8.7, porcion: 100, unidad: 'g' },
  { _id: '6', nombre: 'Brócoli cocido', grupo: 'Verduras', cal: 35, prot: 2.4, carbs: 7.2, fat: 0.4, fibra: 3.3, porcion: 100, unidad: 'g' },
  { _id: '7', nombre: 'Manzana con piel', grupo: 'Frutas', cal: 52, prot: 0.3, carbs: 14, fat: 0.2, fibra: 2.4, porcion: 100, unidad: 'g' },
  { _id: '8', nombre: 'Leche descremada', grupo: 'Lácteos', cal: 35, prot: 3.4, carbs: 5, fat: 0.1, fibra: 0, porcion: 100, unidad: 'ml' },
  { _id: '9', nombre: 'Aceite de oliva extra virgen', grupo: 'Aceites y Grasas', cal: 884, prot: 0, carbs: 0, fat: 100, fibra: 0, porcion: 100, unidad: 'ml' },
  { _id: '10', nombre: 'Avena (seca)', grupo: 'Cereales', cal: 389, prot: 17, carbs: 66, fat: 7, fibra: 11, porcion: 100, unidad: 'g' },
  { _id: '11', nombre: 'Plátano', grupo: 'Frutas', cal: 89, prot: 1.1, carbs: 23, fat: 0.3, fibra: 2.6, porcion: 100, unidad: 'g' },
  { _id: '12', nombre: 'Yogurt griego natural', grupo: 'Lácteos', cal: 59, prot: 10, carbs: 3.6, fat: 0.4, fibra: 0, porcion: 100, unidad: 'g' },
  { _id: '13', nombre: 'Salmón al horno', grupo: 'AOA', cal: 208, prot: 20, carbs: 0, fat: 13, fibra: 0, porcion: 100, unidad: 'g' },
  { _id: '14', nombre: 'Almendras', grupo: 'Aceites y Grasas', cal: 579, prot: 21, carbs: 22, fat: 50, fibra: 12.5, porcion: 100, unidad: 'g' },
];

const GRUPO_ICONS = {
  'AOA': Beef,
  'Cereales': Wheat,
  'Leguminosas': Wheat,
  'Verduras': Salad,
  'Frutas': Apple,
  'Lácteos': Droplets,
  'Aceites y Grasas': Droplets,
};

const GRUPO_COLORS = {
  'AOA': '#EF4444',
  'Cereales': '#E8C96A',
  'Leguminosas': '#F59E0B',
  'Verduras': '#2ECC8E',
  'Frutas': '#3B82F6',
  'Lácteos': '#A855F7',
  'Aceites y Grasas': '#f97316',
};

export default function NutritionCalculator() {
  const [alimentos, setAlimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('Todos');
  const [page, setPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchAlimentos = async () => {
      try {
        const res = await api.get('/api/foods');
        setAlimentos(res.data.data || res.data || []);
      } catch {
        setAlimentos(MOCK_ALIMENTOS);
      } finally {
        setLoading(false);
      }
    };
    fetchAlimentos();
  }, []);

  const grupos = ['Todos', ...new Set(alimentos.map(a => a.grupo))];

  const filteredAlimentos = useMemo(() => {
    let result = alimentos;
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(a => a.nombre.toLowerCase().includes(lowerSearch));
    }
    if (selectedGroup !== 'Todos') {
      result = result.filter(a => a.grupo === selectedGroup);
    }
    return result;
  }, [alimentos, search, selectedGroup]);

  const paginatedAlimentos = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredAlimentos.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAlimentos, page]);

  const totalPages = Math.ceil(filteredAlimentos.length / ITEMS_PER_PAGE);

  // Reset pagination on filter change
  useEffect(() => {
    setPage(1);
  }, [search, selectedGroup]);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Base de Alimentos</h1>
          <p className="page-subtitle">Gestiona tu catálogo de alimentos e información nutrimental</p>
        </div>
        <button className="btn btn-primary gap-2 self-start sm:self-auto">
          <Plus size={16} />
          Nuevo Alimento
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Búsqueda */}
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            className="input pl-10"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {/* Filtro por grupo */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar pb-1">
          <span className="text-xs text-white/30 font-semibold mr-1 flex-shrink-0"><Filter size={14} className="inline mr-1" />Grupo:</span>
          {grupos.map((grupo) => (
            <button
              key={grupo}
              onClick={() => setSelectedGroup(grupo)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border
                ${selectedGroup === grupo
                  ? 'bg-emerald/20 text-emerald border-emerald/30'
                  : 'bg-navy-800/50 text-white/50 border-navy-700/50 hover:bg-navy-800'
                }`}
            >
              {grupo}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Alimentos */}
      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-navy-900/50 border-b border-navy-700/50">
                <th className="px-5 py-3 text-2xs font-bold text-white/30 uppercase tracking-wider">Alimento</th>
                <th className="px-3 py-3 text-2xs font-bold text-white/30 uppercase tracking-wider">Grupo</th>
                <th className="px-3 py-3 text-2xs font-bold text-white/30 uppercase tracking-wider text-right">Porción</th>
                <th className="px-3 py-3 text-2xs font-bold text-white/30 uppercase tracking-wider text-right text-emerald">Kcal</th>
                <th className="px-3 py-3 text-2xs font-bold text-white/30 uppercase tracking-wider text-right">Prot</th>
                <th className="px-3 py-3 text-2xs font-bold text-white/30 uppercase tracking-wider text-right">Carbs</th>
                <th className="px-3 py-3 text-2xs font-bold text-white/30 uppercase tracking-wider text-right">Líp</th>
                <th className="px-5 py-3 text-2xs font-bold text-white/30 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700/50">
              {loading ? (
                <tr><td colSpan="8" className="p-8 text-center text-white/30">Cargando base de datos...</td></tr>
              ) : paginatedAlimentos.length === 0 ? (
                <tr><td colSpan="8" className="p-8 text-center text-white/30">No se encontraron alimentos.</td></tr>
              ) : (
                paginatedAlimentos.map(a => {
                  const Icono = GRUPO_ICONS[a.grupo] || Salad;
                  const color = GRUPO_COLORS[a.grupo] || '#ffffff';
                  return (
                    <tr key={a._id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-5 py-3.5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}>
                          <Icono size={14} style={{ color }} />
                        </div>
                        <div className="text-sm font-semibold text-white/90 truncate max-w-[200px] sm:max-w-xs">{a.nombre}</div>
                      </td>
                      <td className="px-3 py-3 text-xs text-white/50">{a.grupo}</td>
                      <td className="px-3 py-3 text-xs text-white/50 text-right"><span className="font-mono">{a.porcion}</span>{a.unidad}</td>
                      <td className="px-3 py-3 text-sm font-mono font-medium text-emerald text-right">{a.cal}</td>
                      <td className="px-3 py-3 text-xs font-mono text-white/60 text-right">{a.prot}g</td>
                      <td className="px-3 py-3 text-xs font-mono text-white/60 text-right">{a.carbs}g</td>
                      <td className="px-3 py-3 text-xs font-mono text-white/60 text-right">{a.fat}g</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 text-white/30 hover:text-white transition-colors" title="Ver detalles"><Eye size={14} /></button>
                          <button className="p-1.5 text-white/30 hover:text-emerald transition-colors" title="Editar"><Edit3 size={14} /></button>
                          <button className="p-1.5 text-white/30 hover:text-danger transition-colors" title="Eliminar"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-5 py-3 border-t border-navy-700/50 flex items-center justify-between">
            <span className="text-xs text-white/30">
              Mostrando {((page - 1) * ITEMS_PER_PAGE) + 1} a {Math.min(page * ITEMS_PER_PAGE, filteredAlimentos.length)} de {filteredAlimentos.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-navy-800 text-xs font-semibold hover:bg-navy-700 disabled:opacity-50 transition-colors"
              >Anterior</button>
              <div className="px-3 py-1.5 text-xs font-mono font-medium text-emerald">{page} / {totalPages}</div>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg bg-navy-800 text-xs font-semibold hover:bg-navy-700 disabled:opacity-50 transition-colors"
              >Siguiente</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
