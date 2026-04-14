import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, FileText, Download, MoreVertical, Salad, Trash2, Calendar, FileBadge } from 'lucide-react';
import api from '../services/api';

const MOCK_DIETAS = [
  { _id: '1', nombre: 'Plan Hipocalórico 1600', pacienteNombre: 'María González', pacienteId: '1', kcal: 1600, fecha: '2026-04-12', estado: 'activa' },
  { _id: '2', nombre: 'Aumento Masa Muscular 2800', pacienteNombre: 'Juan Rodríguez', pacienteId: '2', kcal: 2800, fecha: '2026-04-10', estado: 'activa' },
  { _id: '3', nombre: 'Plan Mantenimiento', pacienteNombre: 'Ana Martínez', pacienteId: '3', kcal: 1900, fecha: '2026-03-30', estado: 'inactiva' },
  { _id: '4', nombre: 'Ayuno Intermitente 16/8', pacienteNombre: 'Luis Hernández', pacienteId: '4', kcal: 1800, fecha: '2026-04-05', estado: 'activa' },
  { _id: '5', nombre: 'Plan Diabético 1500 kcal', pacienteNombre: 'Sofía Torres', pacienteId: '5', kcal: 1500, fecha: '2026-04-12', estado: 'activa' },
];

export default function MealPlans() {
  const [dietas, setDietas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchDietas = async () => {
      try {
        const res = await api.get('/api/mealplans');
        setDietas(res.data.data || res.data || []);
      } catch {
        setDietas(MOCK_DIETAS);
      } finally {
        setLoading(false);
      }
    };
    fetchDietas();
  }, []);

  const filtered = dietas.filter(d => 
    d.nombre.toLowerCase().includes(search.toLowerCase()) || 
    d.pacienteNombre?.toLowerCase().includes(search.toLowerCase())
  );

  const simulateGenerarPDF = async (_id, nombre) => {
    // Aquí iría la llamada al backend para generar y descargar o html2pdf
    alert(`Generando PDF Premium Branding para: ${nombre}`);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Dietas y Reportes</h1>
          <p className="page-subtitle">Gestiona planes nutricionales y genera PDFs premium</p>
        </div>
        <div className="flex gap-2">
          <Link to="/dietas/catalogo" className="btn btn-outline gap-2">
            <FileBadge size={16} /> Ver Plantillas SMAE
          </Link>
          <Link to="/dietas/nueva" className="btn btn-primary gap-2">
            <Plus size={16} /> Crear Dieta
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            className="input pl-10"
            placeholder="Buscar por nombre de dieta o paciente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grilla de dietas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center text-white/30">Cargando dietas...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full empty-state">
            <div className="empty-state-icon"><Salad size={28} /></div>
            <div className="text-sm text-white/50">No se encontraron planes alimentarios.</div>
          </div>
        ) : (
          filtered.map(dieta => (
            <div key={dieta._id} className="card p-5 group flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald/10 border border-emerald/20 flex items-center justify-center text-emerald">
                  <Salad size={20} />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => simulateGenerarPDF(dieta._id, dieta.nombre)}
                    className="p-1.5 rounded-lg text-white/30 hover:bg-emerald/20 hover:text-emerald transition-colors"
                    title="Exportar a PDF Premium">
                    <Download size={16} />
                  </button>
                  <button className="p-1.5 rounded-lg text-white/30 hover:bg-white/5 hover:text-white transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-base font-semibold text-white mb-1 group-hover:text-emerald transition-colors line-clamp-2">
                  {dieta.nombre}
                </h3>
                <Link to={`/pacientes/${dieta.pacienteId}`} className="text-xs text-white/50 hover:text-white transition-colors inline-block mb-3">
                  Para: <span className="font-semibold text-white/80">{dieta.pacienteNombre || 'Paciente genérico'}</span>
                </Link>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="badge badge-gold bg-gold/10 text-gold border border-gold/20 font-mono">
                    {dieta.kcal} kcal
                  </span>
                  <span className={`badge ${dieta.estado === 'activa' ? 'badge-success' : 'badge-neutral'}`}>
                    {dieta.estado}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-navy-700/50 flex items-center justify-between text-xs mt-auto">
                <div className="flex items-center gap-1.5 text-white/30">
                  <Calendar size={13} /> Modificado: {dieta.fecha}
                </div>
                <Link to={`/dietas/${dieta._id}/editar`} className="text-emerald font-semibold hover:text-emerald-300 transition-colors flex items-center gap-1">
                  Abrir editor &rarr;
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
