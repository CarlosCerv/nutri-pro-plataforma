import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Layers, Copy, Edit3, Trash2, FileBadge, ArrowRight } from 'lucide-react';
import api from '../services/api';

export default function DietTemplates() {
  const [templates, setTemplates] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await api.get('/api/diet-templates');
        setTemplates(res.data.data || res.data || []);
      } catch (error) {
        console.error('Error fetching templates:', error);
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const filtered = templates.filter(t => t.nombre.toLowerCase().includes(search.toLowerCase()) || t.tipo.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--ink-muted)]">
          Plantillas base y SMAE preconfiguradas para acelerar el armado de un plan.
        </p>
        <Link to="/dietas/nueva?template=new" className="btn btn-primary btn-sm gap-2">
          <Layers size={16} /> Crear plantilla
        </Link>
      </div>

      <div className="relative w-full max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-secondary)]" />
        <input
          type="text"
          className="input pl-10"
          placeholder="Buscar plantilla o etiqueta..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card h-48 bg-gradient-to-br from-[var(--surface-alt)] to-[var(--surface-strong)] animate-pulse" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="empty-state py-12">
          <FileBadge size={32} className="mx-auto text-[var(--ink-secondary)] mb-3" />
          <div className="text-[var(--ink-secondary)] font-semibold mb-1">Sin plantillas disponibles</div>
          <div className="text-[var(--ink-secondary)] text-xs mb-4">Crea tu primera plantilla para comenzar.</div>
          <Link to="/dietas/nueva?template=new" className="btn btn-primary btn-sm gap-2">
            <Layers size={14} /> Crear Plantilla
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(t => (
            <div key={t._id} className="card p-5 group flex flex-col h-full border-t-4" style={{ borderTopColor: t.color }}>
              <div className="flex justify-between items-start mb-3">
                <span className="badge font-semibold" style={{ backgroundColor: `${t.color}20`, color: t.color }}>
                  {t.tipo}
                </span>
                <div className="flex gap-1">
                  <button className="p-1.5 rounded-lg text-[var(--ink-secondary)] hover:bg-[rgba(60,60,67,0.07)] transition-colors" title="Editar"><Edit3 size={15} /></button>
                  <button className="p-1.5 rounded-lg text-[var(--ink-secondary)] hover:text-danger hover:bg-danger/10 transition-colors" title="Eliminar"><Trash2 size={15} /></button>
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-base font-semibold text-[var(--ink)] mb-1">{t.nombre}</h3>
                <p className="text-xs text-[var(--ink-secondary)] mb-4 line-clamp-2">{t.description}</p>
                
                <div className="flex gap-4">
                  <div>
                    <div className="text-2xs text-[var(--ink-secondary)] uppercase tracking-widest mb-0.5">Kcal</div>
                    <div className="font-mono text-sm font-medium text-[var(--warning)]">{t.kcal}</div>
                  </div>
                  <div className="w-px h-8 bg-[var(--surface-strong)]"></div>
                  <div>
                    <div className="text-2xs text-[var(--ink-secondary)] uppercase tracking-widest mb-0.5">Macros</div>
                    <div className="font-mono text-sm font-medium text-[var(--ink-muted)]">{t.macros}</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-5 border-t border-[var(--border-soft)]">
                <Link to={`/dietas/nueva?templateId=${t._id}`} 
                  className="w-full btn btn-ghost justify-between text-[var(--accent)] hover:bg-[var(--accent-tint)] hover:border-[var(--accent-border)] transition-all border border-transparent">
                  <span className="flex items-center gap-2"><Copy size={16} /> Usar esta plantilla</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
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
