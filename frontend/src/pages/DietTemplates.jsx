import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Layers, Copy, Edit3, Trash2, FileBadge, ArrowRight } from 'lucide-react';

const MOCK_TEMPLATES = [
  { _id: '1', nombre: 'Plan Hipocalórico Estándar', kcal: 1500, macros: '25P/45C/30L', description: 'Plan estructurado para pérdida de peso gradual.', tipo: 'SMAE', color: '#2ECC8E' },
  { _id: '2', nombre: 'Aumento Muscular (Deportivo)', kcal: 2800, macros: '30P/50C/20L', description: 'Enfocado en hipertrofia y superávit de proteínas.', tipo: 'Avanzado', color: '#3B82F6' },
  { _id: '3', nombre: 'Ayuno Intermitente 16/8', kcal: 1800, macros: '25P/40C/35L', description: 'Distribución en 2 comidas fuertes y 1 colación.', tipo: 'Estilo de vida', color: '#A855F7' },
  { _id: '4', nombre: 'Dieta Keto (Baja en CH)', kcal: 1600, macros: '20P/10C/70L', description: 'Cetogénica clásica. Minimiza carbohidratos.', tipo: 'Keto', color: '#E8C96A' },
  { _id: '5', nombre: 'Plan Vegetariano Balanceado', kcal: 2000, macros: '20P/55C/25L', description: 'Sin carnes. Basado en leguminosas, cereales y lácteos.', tipo: 'Vegetariano', color: '#2ECC8E' },
  { _id: '6', nombre: 'Plan Diabético (Control IK)', kcal: 1700, macros: '25P/45C/30L', description: 'Bajo índice glucémico, alto en fibra.', tipo: 'Clínico', color: '#EF4444' },
];

export default function DietTemplates() {
  const [templates] = useState(MOCK_TEMPLATES);
  const [search, setSearch] = useState('');

  const filtered = templates.filter(t => t.nombre.toLowerCase().includes(search.toLowerCase()) || t.tipo.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Catálogo de Plantillas</h1>
          <p className="page-subtitle">Acelera tu trabajo utilizando plantillas base o SMAE pre-configuradas</p>
        </div>
        <Link to="/dietas/nueva?template=new" className="btn btn-primary gap-2">
          <Layers size={16} /> Crear Plantilla
        </Link>
      </div>

      <div className="relative w-full max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          className="input pl-10"
          placeholder="Buscar plantilla o etiqueta..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(t => (
          <div key={t._id} className="card p-5 group flex flex-col h-full border-t-4" style={{ borderTopColor: t.color }}>
            <div className="flex justify-between items-start mb-3">
              <span className="badge font-semibold" style={{ backgroundColor: `${t.color}20`, color: t.color }}>
                {t.tipo}
              </span>
              <div className="flex gap-1">
                <button className="p-1.5 rounded-lg text-white/30 hover:bg-white/5 transition-colors" title="Editar"><Edit3 size={15} /></button>
                <button className="p-1.5 rounded-lg text-white/30 hover:text-danger hover:bg-danger/10 transition-colors" title="Eliminar"><Trash2 size={15} /></button>
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-base font-semibold text-white mb-1">{t.nombre}</h3>
              <p className="text-xs text-white/50 mb-4 line-clamp-2">{t.description}</p>
              
              <div className="flex gap-4">
                <div>
                  <div className="text-2xs text-white/30 uppercase tracking-widest mb-0.5">Kcal</div>
                  <div className="font-mono text-sm font-medium text-gold">{t.kcal}</div>
                </div>
                <div className="w-px h-8 bg-navy-700"></div>
                <div>
                  <div className="text-2xs text-white/30 uppercase tracking-widest mb-0.5">Macros</div>
                  <div className="font-mono text-sm font-medium text-white/80">{t.macros}</div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-5 border-t border-navy-700/50">
              <Link to={`/dietas/nueva?templateId=${t._id}`} 
                className="w-full btn btn-ghost justify-between text-emerald hover:bg-emerald/10 hover:border-emerald/20 transition-all border border-transparent">
                <span className="flex items-center gap-2"><Copy size={16} /> Usar esta plantilla</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-navy-700 rounded-3xl">
            <FileBadge size={32} className="mx-auto text-white/20 mb-3" />
            <div className="text-white/50 font-semibold mb-1">Sin coincidencias</div>
            <div className="text-white/30 text-xs text-center">No se encontraron plantillas con ese nombre.</div>
          </div>
        )}
      </div>
    </div>
  );
}
