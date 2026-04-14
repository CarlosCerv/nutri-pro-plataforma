import { Activity, BarChart3, Download, HeartPulse, Users } from 'lucide-react';

const KPIS = [
  { label: 'Pacientes totales', value: 284, icon: Users, color: '#2ECC8E' },
  { label: 'Prevalencia DM2', value: '22%', icon: HeartPulse, color: '#E8C96A' },
  { label: 'IMC promedio', value: '28.4', icon: Activity, color: '#3B82F6' },
  { label: 'Exportaciones', value: 19, icon: Download, color: '#A855F7' },
];

export default function PopulationReports() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald mb-2">
            <BarChart3 size={14} />
            Módulo 11
          </div>
          <h1 className="page-title">Reportes Poblacionales</h1>
          <p className="page-subtitle">Vista consolidada para clínicas, universidades y análisis de cohortes atendidas.</p>
        </div>
        <button className="btn btn-primary">
          <Download size={15} />
          Exportar Excel
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((item) => (
          <div key={item.label} className="card">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${item.color}20`, border: `1px solid ${item.color}35` }}>
              <item.icon size={18} style={{ color: item.color }} />
            </div>
            <div className="font-mono text-3xl" style={{ color: item.color }}>{item.value}</div>
            <div className="text-sm text-white/40 mt-1">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="card">
          <h2 className="section-title">Indicadores que cubre esta vista</h2>
          <div className="mt-4 grid gap-3">
            {[
              'Distribución global de IMC y prevalencia de patologías.',
              'Evolución de peso promedio por mes o por cohorte.',
              'Exportación para investigación y análisis académico.',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-navy-700/50 bg-navy-800/50 px-4 py-3 text-sm text-white/65">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h2 className="section-title">Estado del módulo</h2>
          <p className="text-sm text-white/45 mt-2">
            La navegación y el shell del reporte ya quedan integrados. Falta conectar agregaciones reales desde backend para IMC poblacional, patologías y series temporales.
          </p>
        </section>
      </div>
    </div>
  );
}
