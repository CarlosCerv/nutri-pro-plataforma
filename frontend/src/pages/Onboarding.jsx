import { Check, FileBadge2, ImagePlus, Palette, Sparkles, UserRound } from 'lucide-react';

const STEPS = [
  {
    icon: UserRound,
    title: 'Identidad profesional',
    description: 'Nombre completo, especialidad, cédula y ciudad de consulta.',
  },
  {
    icon: ImagePlus,
    title: 'Branding clínico',
    description: 'Logo, foto profesional, acento premium y pie de PDF.',
  },
  {
    icon: FileBadge2,
    title: 'Formato de reportes',
    description: 'Define qué datos verán tus pacientes en planes y expedientes.',
  },
];

export default function Onboarding() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="card overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(46,204,142,0.14),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(232,201,106,0.12),transparent_36%)] pointer-events-none" />
          <div className="relative space-y-6">
            <div className="flex items-center gap-2 text-emerald text-xs font-semibold uppercase tracking-[0.24em]">
              <Sparkles size={14} />
              Primer acceso
            </div>
            <div>
              <h1 className="page-title max-w-2xl">Configura tu consulta para que cada PDF y cada expediente salgan con identidad clínica real.</h1>
              <p className="page-subtitle max-w-2xl mt-2">
                Este onboarding cubre el núcleo del MVP: perfil profesional, branding premium y preferencias de reportes para NutriPro.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {STEPS.map((step, index) => (
                <article key={step.title} className="rounded-2xl border border-navy-700/60 bg-navy-800/60 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald/15 border border-emerald/20 flex items-center justify-center text-emerald">
                      <step.icon size={18} />
                    </div>
                    <span className="text-2xs font-mono text-white/30">0{index + 1}</span>
                  </div>
                  <h2 className="text-lg text-white">{step.title}</h2>
                  <p className="text-sm text-white/45 mt-1.5">{step.description}</p>
                </article>
              ))}
            </div>

            <form className="grid gap-4 md:grid-cols-2">
              <div className="form-group">
                <label className="label">Nombre profesional</label>
                <input className="input" defaultValue="Dra. Andrea López, NC" />
              </div>
              <div className="form-group">
                <label className="label">Especialidad</label>
                <input className="input" defaultValue="Nutrición clínica y metabólica" />
              </div>
              <div className="form-group">
                <label className="label">Cédula profesional</label>
                <input className="input font-mono" defaultValue="12345678" />
              </div>
              <div className="form-group">
                <label className="label">Teléfono consultorio</label>
                <input className="input" defaultValue="+52 33 1000 1122" />
              </div>
              <div className="form-group md:col-span-2">
                <label className="label">Texto destacado del PDF</label>
                <input className="input" defaultValue="Nutrición basada en ciencia, adherencia y resultados sostenibles." />
              </div>
              <div className="form-group">
                <label className="label">Color esmeralda</label>
                <div className="flex items-center gap-3">
                  <input type="color" className="h-11 w-14 rounded-xl bg-transparent" defaultValue="#2ECC8E" />
                  <div className="text-sm text-white/50">Aplicado a botones, badges y encabezados de PDF.</div>
                </div>
              </div>
              <div className="form-group">
                <label className="label">Color premium secundario</label>
                <div className="flex items-center gap-3">
                  <input type="color" className="h-11 w-14 rounded-xl bg-transparent" defaultValue="#E8C96A" />
                  <div className="text-sm text-white/50">Usado en acentos de planes, QR y resaltados.</div>
                </div>
              </div>
              <div className="md:col-span-2 flex items-center justify-between rounded-2xl border border-navy-700/60 bg-navy-800/50 px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-white">Guardar y continuar</div>
                  <div className="text-xs text-white/35">Autosave cada 30 segundos en la siguiente iteración del flujo.</div>
                </div>
                <button type="button" className="btn btn-primary">
                  <Check size={16} />
                  Finalizar onboarding
                </button>
              </div>
            </form>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="card">
            <div className="flex items-center gap-2 text-gold mb-4">
              <Palette size={16} />
              <span className="text-sm font-semibold">Vista previa PDF</span>
            </div>
            <div className="rounded-2xl bg-white text-slate-900 p-4 min-h-[360px] shadow-navy-md">
              <div className="h-5 rounded-t-xl bg-[#07192E]" />
              <div className="flex items-start justify-between py-4 border-b border-slate-200">
                <div>
                  <div className="font-serif text-lg font-bold text-[#07192E]">Clínica NutriPro</div>
                  <div className="text-xs text-slate-500">Dra. Andrea López · Cédula 12345678</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#2ECC8E]/20 border border-[#2ECC8E]/30" />
              </div>
              <div className="mt-4 space-y-3">
                <div className="h-3 rounded bg-slate-200 w-2/3" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-100 p-3">
                    <div className="text-[10px] uppercase tracking-widest text-slate-400">Requerimientos</div>
                    <div className="mt-2 font-mono text-sm">1650 kcal</div>
                  </div>
                  <div className="rounded-xl bg-slate-100 p-3">
                    <div className="text-[10px] uppercase tracking-widest text-slate-400">Macros</div>
                    <div className="mt-2 font-mono text-sm">30 / 45 / 25</div>
                  </div>
                </div>
                <div className="rounded-xl border border-dashed border-slate-300 p-3">
                  <div className="text-sm font-semibold text-[#07192E]">Desayuno</div>
                  <div className="text-xs text-slate-500 mt-1">Huevos, espinaca, pan integral y fruta</div>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
