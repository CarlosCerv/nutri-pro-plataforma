import PropTypes from 'prop-types';
import { ArrowRight, CheckCircle2, Utensils, Flame, Activity, Zap, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Sección Hero de alto impacto para la Landing Page de NutriPro.
 * Incluye titulares calibrados con tipografía del sistema, botones píldora,
 * badges de confianza y un mockup interactivo del constructor de dietas.
 */
export default function LandingHero({ onPrimaryCtaClick }) {
  const handleScrollToFeatures = (e) => {
    e.preventDefault();
    const element = document.querySelector('#caracteristicas');
    if (element) {
      const navHeight = 64;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 lg:pt-24 lg:pb-32 bg-[var(--surface-cool)]">
      {/* Luz ambiental sutil de fondo */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[450px] rounded-full bg-[radial-gradient(circle,rgba(0,113,227,0.08)_0%,rgba(255,255,255,0)_70%)] blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Titular Principal H1 */}
        <h1 className="mx-auto max-w-4xl text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-[var(--ink)] leading-[1.1] text-balance">
          Diseña dietas en minutos. <br className="hidden sm:inline" />
          <span className="text-[var(--accent)]">Automatiza tu consulta</span> con precisión clínica.
        </h1>

        {/* Subtítulo */}
        <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-[var(--ink-secondary)] leading-relaxed text-balance font-normal">
          La plataforma todo-en-uno que une el diseño interactivo de planes por arrastrar y soltar,
          expediente antropométrico ISAK, recordatorios automáticos de citas y analítica financiera.
        </p>

        {/* CTAs Principales */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            onClick={onPrimaryCtaClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-8 py-4 text-[16px] font-semibold text-white shadow-md hover:bg-[var(--accent-hover)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
          >
            <span>Comenzar prueba gratis de 14 días</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#caracteristicas"
            onClick={handleScrollToFeatures}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-7 py-4 text-[16px] font-medium text-[var(--ink)] hover:bg-[var(--surface-alt)] hover:border-[var(--border)] transition-all duration-200"
          >
            <Play className="h-4 w-4 fill-current text-[var(--accent)]" />
            <span>Ver cómo funciona</span>
          </a>
        </div>

        {/* Puntos de Confianza */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs sm:text-sm text-[var(--ink-secondary)]">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
            <span>Sin tarjeta de crédito requerida</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
            <span>Listo para usar en 2 minutos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
            <span>100% en la nube y multidispositivo</span>
          </div>
        </div>

        {/* Mockup Interactivo de la Aplicación */}
        <div className="relative mx-auto mt-14 sm:mt-18 max-w-5xl">
          <div className="rounded-[18px] border border-[var(--border-soft)] bg-[var(--surface)] p-2 sm:p-3 shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-transform duration-300">
            {/* Barra de ventana superior */}
            <div className="flex items-center justify-between border-b border-[var(--border-soft)]/70 px-4 py-2.5 bg-[var(--surface-alt)] rounded-t-[14px]">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#FF5F56] inline-block border border-[#E0443E]/50" />
                <span className="h-3 w-3 rounded-full bg-[#FFBD2E] inline-block border border-[#DEA123]/50" />
                <span className="h-3 w-3 rounded-full bg-[#27C93F] inline-block border border-[#1AAB29]/50" />
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-[var(--ink-secondary)] bg-[var(--surface)] px-4 py-1 rounded-full border border-[var(--border-soft)] shadow-2xs">
                <Utensils className="h-3.5 w-3.5 text-[var(--accent)]" />
                <span>Constructor de Dietas · Paciente: <strong>Mariana Rivas (1,850 kcal)</strong></span>
              </div>
              <div className="text-xs text-[var(--ink-secondary)] flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[var(--success)] animate-pulse" />
                <span className="hidden sm:inline">Guardado automático</span>
              </div>
            </div>

            {/* Contenido Visual del Mockup */}
            <div className="p-4 sm:p-6 bg-[var(--surface)] rounded-b-[14px] text-left grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Panel Izquierdo: Catálogo de Alimentos */}
              <div className="lg:col-span-4 rounded-[11px] border border-[var(--border-soft)] bg-[var(--surface-cool)] p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-secondary)]">Catálogo Clínico</span>
                    <span className="text-[11px] font-medium text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-full">SMAE & USDA</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: 'Pechuga de pollo a la plancha', detail: '100g · 165 kcal', p: '31g', c: '0g', g: '3.6g', cat: 'Proteína' },
                      { name: 'Aguacate Hass', detail: '50g · 80 kcal', p: '1g', c: '4g', g: '7.5g', cat: 'Grasa' },
                      { name: 'Arroz integral cocido', detail: '100g · 112 kcal', p: '2.6g', c: '24g', g: '0.9g', cat: 'Carbohidrato' },
                      { name: 'Espinacas baby frescas', detail: '80g · 18 kcal', p: '2.3g', c: '2.9g', g: '0.3g', cat: 'Verdura' },
                    ].map((food, idx) => (
                      <div
                        key={idx}
                        className="group flex items-center justify-between p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border-soft)] shadow-2xs hover:border-[var(--accent)] hover:shadow-xs transition-all cursor-grab"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">{food.name}</span>
                          <span className="text-[11px] text-[var(--ink-secondary)]">{food.detail}</span>
                        </div>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--surface-alt)] text-[var(--ink-muted)]">
                          {food.cat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--border-soft)] flex items-center justify-between text-xs text-[var(--ink-secondary)]">
                  <span>Arrastra alimentos al plan</span>
                  <Zap className="h-3.5 w-3.5 text-[var(--accent)]" />
                </div>
              </div>

              {/* Panel Central: Tiempos de Comida con Drag & Drop */}
              <div className="lg:col-span-5 space-y-3">
                {/* Desayuno */}
                <div className="rounded-[11px] border border-[var(--border-soft)] bg-[var(--surface)] p-3.5 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                      <span className="text-xs font-semibold text-[var(--ink)]">Desayuno (08:00 AM)</span>
                    </div>
                    <span className="text-xs font-semibold text-[var(--accent)]">465 kcal</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-[var(--ink-muted)]">
                    <div className="flex justify-between bg-[var(--surface-alt)] px-2.5 py-1.5 rounded-md">
                      <span>• Omelette de 2 claras y 1 huevo</span>
                      <span className="font-medium text-[var(--ink)]">180 kcal</span>
                    </div>
                    <div className="flex justify-between bg-[var(--surface-alt)] px-2.5 py-1.5 rounded-md">
                      <span>• Avena cocida con manzana (40g)</span>
                      <span className="font-medium text-[var(--ink)]">205 kcal</span>
                    </div>
                    <div className="flex justify-between bg-[var(--surface-alt)] px-2.5 py-1.5 rounded-md">
                      <span>• Nueces en mitades (15g)</span>
                      <span className="font-medium text-[var(--ink)]">80 kcal</span>
                    </div>
                  </div>
                </div>

                {/* Comida / Almuerzo */}
                <div className="rounded-[11px] border border-[var(--accent-border)] bg-[var(--accent-soft)]/20 p-3.5 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                      <span className="text-xs font-semibold text-[var(--ink)]">Comida Principal (02:30 PM)</span>
                    </div>
                    <span className="text-xs font-semibold text-[var(--accent)]">680 kcal</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-[var(--ink-muted)]">
                    <div className="flex justify-between bg-[var(--surface)] px-2.5 py-1.5 rounded-md border border-[var(--border-soft)]/60">
                      <span>• Pechuga de pollo asada (150g)</span>
                      <span className="font-medium text-[var(--ink)]">248 kcal</span>
                    </div>
                    <div className="flex justify-between bg-[var(--surface)] px-2.5 py-1.5 rounded-md border border-[var(--border-soft)]/60">
                      <span>• Arroz integral y aguacate</span>
                      <span className="font-medium text-[var(--ink)]">292 kcal</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel Derecho: Métricas en Tiempo Real */}
              <div className="lg:col-span-3 rounded-[11px] border border-[var(--border-soft)] bg-[var(--surface-alt)] p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-3 text-xs font-semibold text-[var(--ink)]">
                    <Flame className="h-4 w-4 text-[var(--accent)]" />
                    <span>Balance de Energía</span>
                  </div>

                  {/* Calorías Totales */}
                  <div className="bg-[var(--surface)] p-3 rounded-lg border border-[var(--border-soft)] mb-3">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs text-[var(--ink-secondary)]">Meta del Día</span>
                      <span className="text-sm font-bold text-[var(--ink)]">1,850 / 1,850 kcal</span>
                    </div>
                    <div className="w-full bg-[var(--gray-200)] h-2 rounded-full overflow-hidden">
                      <div className="bg-[var(--accent)] h-full w-full rounded-full" />
                    </div>
                  </div>

                  {/* Barras de Macronutrientes */}
                  <div className="space-y-2.5">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1 font-medium">
                        <span className="text-[var(--ink-muted)]">Proteína (25%)</span>
                        <span className="text-[var(--ink)]">115g / 115g</span>
                      </div>
                      <div className="w-full bg-[var(--gray-200)] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#0058B0] h-full w-full rounded-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] mb-1 font-medium">
                        <span className="text-[var(--ink-muted)]">Grasas (30%)</span>
                        <span className="text-[var(--ink)]">62g / 62g</span>
                      </div>
                      <div className="w-full bg-[var(--gray-200)] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#B45309] h-full w-full rounded-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] mb-1 font-medium">
                        <span className="text-[var(--ink-muted)]">Carbohidratos (45%)</span>
                        <span className="text-[var(--ink)]">208g / 208g</span>
                      </div>
                      <div className="w-full bg-[var(--gray-200)] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#1B7F3A] h-full w-full rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--border-soft)] flex items-center justify-between text-[11px] text-[var(--success)] font-semibold">
                  <div className="flex items-center gap-1">
                    <Activity className="h-3.5 w-3.5" />
                    <span>Plan Balanceado 100%</span>
                  </div>
                  <span className="text-[var(--ink-secondary)]">PDF Listo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

LandingHero.propTypes = {
  onPrimaryCtaClick: PropTypes.func,
};
