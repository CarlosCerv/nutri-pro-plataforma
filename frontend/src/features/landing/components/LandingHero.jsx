import PropTypes from 'prop-types';
import { ArrowRight, ShieldCheck, Utensils, Flame, Activity, Zap, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Sección Hero de alto impacto para la Landing Page de NutriPro.
 * Diseñada bajo principios Mobile-First y CRO:
 * - Badge de Autoridad SMAE / Normativa Clínica
 * - Titular con tipografía de alto contraste
 * - CTA principal de fricción cero con micro-copia
 * - Fila de prueba social con micro-avatares y valoración
 * - Mockup interactivo responsive con HUD nutricional
 */
export default function LandingHero({ onPrimaryCtaClick }) {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24 lg:pt-20 lg:pb-32 bg-[var(--surface-cool)]">
      {/* Luz ambiental sutil de fondo */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[450px] rounded-full bg-[radial-gradient(circle,rgba(0,113,227,0.08)_0%,rgba(255,255,255,0)_70%)] blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge de Autoridad Clínica */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-1.5 text-xs font-semibold text-[var(--accent)] mb-6 shadow-2xs">
          <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent)] shrink-0" />
          <span>100% Compatible con SMAE • Normativa de Expediente Clínico</span>
        </div>

        {/* Titular Principal Hero */}
        <h1 className="mx-auto max-w-4xl text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1D1D1F] leading-[1.15] sm:leading-[1.1] text-balance">
          Diseña dietas en minutos. <br className="hidden sm:inline" />
          <span className="text-[#0071E3]">Automatiza tu consulta</span> con precisión clínica.
        </h1>

        {/* Subtítulo */}
        <p className="mx-auto mt-5 sm:mt-6 max-w-2xl text-sm sm:text-base lg:text-lg text-[#424245] leading-relaxed text-balance font-normal">
          La plataforma todo-en-uno que une el diseño interactivo de planes por arrastrar y soltar,
          expediente antropométrico ISAK, recordatorios automáticos de citas y analítica financiera.
        </p>

        {/* CTA Principal y Micro-copia de Fricción Cero */}
        <div className="mt-8 sm:mt-10 flex flex-col items-center justify-center gap-3">
          <Link
            to="/register"
            onClick={onPrimaryCtaClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#0071E3] hover:bg-[#0077ED] active:scale-[0.98] px-8 py-3.5 sm:py-4 text-base font-medium text-white shadow-sm min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2 transition-all"
          >
            <span>Comenzar prueba gratis de 14 días</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          {/* Micro-copia inferior */}
          <span className="text-xs text-[#6E6E73] font-normal">
            Sin tarjeta de crédito requerida • Configuración en 2 min
          </span>
        </div>

        {/* Prueba Social Inmediata */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-[#424245]">
          <div className="flex items-center gap-3">
            {/* Micro-avatares superpuestos */}
            <div className="flex -space-x-2 overflow-hidden shrink-0">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-[#0071E3] font-bold text-[10px] ring-2 ring-white">
                MR
              </span>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] ring-2 ring-white">
                LC
              </span>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-[10px] ring-2 ring-white">
                AG
              </span>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700 font-bold text-[10px] ring-2 ring-white">
                DS
              </span>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-rose-700 font-bold text-[10px] ring-2 ring-white">
                +500
              </span>
            </div>

            {/* 5 Estrellas */}
            <div className="flex items-center gap-0.5 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
          </div>

          <span className="text-center sm:text-left text-[#424245] font-medium">
            Más de <strong>500+ nutriólogos y consultorios</strong> en México y LATAM confían en NutriPro
          </span>
        </div>

        {/* Mockup Interactivo de la Aplicación */}
        <div className="relative mx-auto mt-12 sm:mt-16 max-w-5xl">
          <div className="rounded-[18px] border border-[var(--border-soft)] bg-[var(--surface)] p-2 sm:p-3 shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-transform duration-300">
            {/* Barra de ventana superior */}
            <div className="flex items-center justify-between border-b border-[var(--border-soft)]/70 px-3 sm:px-4 py-2 sm:py-2.5 bg-[var(--surface-alt)] rounded-t-[14px]">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#FF5F56] inline-block border border-[#E0443E]/50" />
                <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#FFBD2E] inline-block border border-[#DEA123]/50" />
                <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#27C93F] inline-block border border-[#1AAB29]/50" />
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-medium text-[var(--ink-secondary)] bg-[var(--surface)] px-2.5 sm:px-4 py-1 rounded-full border border-[var(--border-soft)] shadow-2xs truncate max-w-[200px] sm:max-w-none">
                <Utensils className="h-3.5 w-3.5 text-[var(--accent)] shrink-0" />
                <span className="truncate">Constructor · Mariana Rivas (1,850 kcal)</span>
              </div>
              <div className="text-[11px] sm:text-xs text-[var(--ink-secondary)] flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[var(--success)] animate-pulse shrink-0" />
                <span className="hidden sm:inline">Guardado en vivo</span>
              </div>
            </div>

            {/* Contenido Visual del Mockup */}
            <div className="p-3 sm:p-6 bg-[var(--surface)] rounded-b-[14px] text-left grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
              {/* Panel Izquierdo: Catálogo de Alimentos */}
              <div className="lg:col-span-4 rounded-[12px] border border-[var(--border-soft)] bg-[var(--surface-cool)] p-3.5 sm:p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-secondary)]">Catálogo Clínico</span>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-full">
                      SMAE 100% Oficial
                    </span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: 'Pechuga de pollo a la plancha', detail: '100g · 165 kcal', cat: 'Proteína' },
                      { name: 'Aguacate Hass', detail: '50g · 80 kcal', cat: 'Grasa' },
                      { name: 'Arroz integral cocido', detail: '100g · 112 kcal', cat: 'Carbohidrato' },
                      { name: 'Espinacas baby frescas', detail: '80g · 18 kcal', cat: 'Verdura' },
                    ].map((food, idx) => (
                      <div
                        key={idx}
                        className="group flex items-center justify-between p-2 sm:p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border-soft)] shadow-2xs hover:border-[var(--accent)] hover:shadow-xs transition-all cursor-grab"
                      >
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="text-xs font-semibold text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors truncate">
                            {food.name}
                          </span>
                          <span className="text-[11px] text-[var(--ink-secondary)]">{food.detail}</span>
                        </div>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--surface-alt)] text-[var(--ink-muted)] shrink-0">
                          {food.cat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-[var(--border-soft)] flex items-center justify-between text-xs text-[var(--ink-secondary)]">
                  <span>Arrastra alimentos al plan</span>
                  <Zap className="h-3.5 w-3.5 text-[var(--accent)]" />
                </div>
              </div>

              {/* Panel Central: Tiempos de Comida con Drag & Drop */}
              <div className="lg:col-span-5 space-y-3">
                {/* Desayuno */}
                <div className="rounded-[12px] border border-[var(--border-soft)] bg-[var(--surface)] p-3 sm:p-3.5 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[var(--accent)] shrink-0" />
                      <span className="text-xs font-semibold text-[var(--ink)]">Desayuno (08:00 AM)</span>
                    </div>
                    <span className="text-xs font-bold text-[var(--accent)]">465 kcal</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-[var(--ink-muted)]">
                    <div className="flex justify-between bg-[var(--surface-alt)] px-2.5 py-1.5 rounded-md">
                      <span className="truncate pr-2">• Omelette de 2 claras y 1 huevo</span>
                      <span className="font-semibold text-[var(--ink)] shrink-0">180 kcal</span>
                    </div>
                    <div className="flex justify-between bg-[var(--surface-alt)] px-2.5 py-1.5 rounded-md">
                      <span className="truncate pr-2">• Avena cocida con manzana (40g)</span>
                      <span className="font-semibold text-[var(--ink)] shrink-0">205 kcal</span>
                    </div>
                    <div className="flex justify-between bg-[var(--surface-alt)] px-2.5 py-1.5 rounded-md">
                      <span className="truncate pr-2">• Nueces en mitades (15g)</span>
                      <span className="font-semibold text-[var(--ink)] shrink-0">80 kcal</span>
                    </div>
                  </div>
                </div>

                {/* Comida / Almuerzo */}
                <div className="rounded-[12px] border border-[var(--accent-border)] bg-[var(--accent-soft)]/20 p-3 sm:p-3.5 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[var(--accent)] shrink-0" />
                      <span className="text-xs font-semibold text-[var(--ink)]">Comida Principal (02:30 PM)</span>
                    </div>
                    <span className="text-xs font-bold text-[var(--accent)]">680 kcal</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-[var(--ink-muted)]">
                    <div className="flex justify-between bg-[var(--surface)] px-2.5 py-1.5 rounded-md border border-[var(--border-soft)]/60">
                      <span className="truncate pr-2">• Pechuga de pollo asada (150g)</span>
                      <span className="font-semibold text-[var(--ink)] shrink-0">248 kcal</span>
                    </div>
                    <div className="flex justify-between bg-[var(--surface)] px-2.5 py-1.5 rounded-md border border-[var(--border-soft)]/60">
                      <span className="truncate pr-2">• Arroz integral y aguacate</span>
                      <span className="font-semibold text-[var(--ink)] shrink-0">292 kcal</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel Derecho: Métricas en Tiempo Real */}
              <div className="lg:col-span-3 rounded-[12px] border border-[var(--border-soft)] bg-[var(--surface-alt)] p-3.5 sm:p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-3 text-xs font-semibold text-[var(--ink)]">
                    <Flame className="h-4 w-4 text-[var(--accent)]" />
                    <span>Balance de Energía</span>
                  </div>

                  {/* Calorías Totales */}
                  <div className="bg-[var(--surface)] p-3 rounded-lg border border-[var(--border-soft)] mb-3">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs text-[var(--ink-secondary)]">Meta del Día</span>
                      <span className="text-xs sm:text-sm font-bold text-[var(--ink)]">1,850 / 1,850 kcal</span>
                    </div>
                    <div className="w-full bg-[var(--gray-200)] h-2 rounded-full overflow-hidden">
                      <div className="bg-[var(--accent)] h-full w-full rounded-full" />
                    </div>
                  </div>

                  {/* Barras de Macronutrientes */}
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-[11px] mb-0.5 font-medium">
                        <span className="text-[var(--ink-muted)]">Proteína (25%)</span>
                        <span className="text-[var(--ink)] font-semibold">115g</span>
                      </div>
                      <div className="w-full bg-[var(--gray-200)] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#0071E3] h-full w-full rounded-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] mb-0.5 font-medium">
                        <span className="text-[var(--ink-muted)]">Grasas (30%)</span>
                        <span className="text-[var(--ink)] font-semibold">62g</span>
                      </div>
                      <div className="w-full bg-[var(--gray-200)] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#B45309] h-full w-full rounded-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] mb-0.5 font-medium">
                        <span className="text-[var(--ink-muted)]">Carbohidratos (45%)</span>
                        <span className="text-[var(--ink)] font-semibold">208g</span>
                      </div>
                      <div className="w-full bg-[var(--gray-200)] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#1B7F3A] h-full w-full rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-[var(--border-soft)] flex items-center justify-between text-[11px] text-[var(--success)] font-semibold">
                  <div className="flex items-center gap-1">
                    <Activity className="h-3.5 w-3.5" />
                    <span>SMAE Balanceado</span>
                  </div>
                  <span className="text-[var(--ink-secondary)] text-[10px]">PDF Listo</span>
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
