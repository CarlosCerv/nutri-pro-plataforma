import { Download, Eye, FileSpreadsheet, FileText, QrCode, Sparkles } from 'lucide-react';

const REPORT_TYPES = [
  {
    title: 'Plan alimentario premium',
    subtitle: 'Logo, macros, tiempos, fotos y QR del portal del paciente.',
    accent: 'text-emerald',
    badge: 'badge-success',
  },
  {
    title: 'Expediente clínico NOM-168',
    subtitle: 'Datos generales, antecedentes y consulta actual.',
    accent: 'text-gold',
    badge: 'badge-gold',
  },
  {
    title: 'Cuadro de equivalentes SMAE',
    subtitle: 'Formato imprimible y versión compacta para paciente.',
    accent: 'text-info',
    badge: 'badge-info',
  },
  {
    title: 'Evolución antropométrica',
    subtitle: 'Peso, grasa, IMC y avance hacia la meta.',
    accent: 'text-warning',
    badge: 'badge-warning',
  },
];

export default function ReportsHub() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-gold mb-2">
            <FileText size={14} />
            Módulo 6
          </div>
          <h1 className="page-title">Generación de PDFs Profesionales</h1>
          <p className="page-subtitle">Centro de reportes con branding clínico, vista previa y exportación premium.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline">
            <Eye size={15} />
            Vista previa
          </button>
          <button className="btn btn-primary">
            <Download size={15} />
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="grid gap-4 md:grid-cols-2">
          {REPORT_TYPES.map((report) => (
            <article key={report.title} className="card">
              <div className={`badge ${report.badge}`}>Disponible</div>
              <h2 className={`text-xl mt-4 ${report.accent}`}>{report.title}</h2>
              <p className="text-sm text-white/45 mt-2">{report.subtitle}</p>
              <div className="mt-5 flex gap-2">
                <button className="btn btn-ghost btn-sm">Configurar</button>
                <button className="btn btn-outline btn-sm">Generar</button>
              </div>
            </article>
          ))}
        </section>

        <aside className="card overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,201,106,0.16),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(46,204,142,0.14),transparent_42%)] pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4 text-emerald">
              <Sparkles size={16} />
              <span className="text-sm font-semibold">Mockup de salida</span>
            </div>
            <div className="rounded-[28px] bg-white text-slate-900 p-6 min-h-[520px] shadow-navy-lg">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <div className="font-serif text-2xl font-bold text-[#07192E]">Plan Alimentario</div>
                  <div className="text-xs text-slate-500">Clínica NutriPro · Semana 1 · 1650 kcal</div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-[#07192E]" />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="rounded-2xl bg-slate-100 p-4">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Proteínas</div>
                  <div className="mt-2 font-mono text-xl">124 g</div>
                </div>
                <div className="rounded-2xl bg-slate-100 p-4">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Carbs</div>
                  <div className="mt-2 font-mono text-xl">206 g</div>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {['Desayuno', 'Comida', 'Cena'].map((meal) => (
                  <div key={meal} className="rounded-2xl border border-slate-200 p-4 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100" />
                    <div className="flex-1">
                      <div className="font-semibold text-[#07192E]">{meal}</div>
                      <div className="text-xs text-slate-500">Porciones, equivalentes y observaciones clínicas.</div>
                    </div>
                    <div className="text-xs font-mono text-slate-500">380 kcal</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
                <div className="text-xs text-slate-500">qr paciente · firma · nutripro.mx</div>
                <QrCode size={24} className="text-[#07192E]" />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 mt-4">
              <button className="btn btn-secondary">
                <FileSpreadsheet size={15} />
                Exportar Excel
              </button>
              <button className="btn btn-ghost">
                <Eye size={15} />
                Compartir link temporal
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
