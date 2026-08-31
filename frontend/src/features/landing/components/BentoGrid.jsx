import PropTypes from 'prop-types';
import {
  Utensils,
  Activity,
  Calendar,
  TrendingUp,
  CheckCircle2,
  FileText,
  DollarSign
} from 'lucide-react';

/**
 * Bento Grid modular que destaca los 5 pilares funcionales de NutriPro.
 * Diseñado bajo principios Mobile-First:
 * - Colapso fluido de 1 columna en móvil a 2 en tablet y 3 en desktop
 * - Alto contraste visual y tarjetas con micro-interacciones
 */
export default function BentoGrid() {
  return (
    <section id="caracteristicas" className="py-16 md:py-24 lg:py-28 bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Encabezado de Sección */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1D1D1F] leading-tight text-balance">
            La suite clínica más completa para tu consultorio.
          </h2>
          <p className="mt-4 text-sm sm:text-base lg:text-lg text-[#424245] leading-relaxed font-normal">
            Elimina el desorden de hojas de cálculo y programas desconectados. NutriPro unifica cada aspecto de tu práctica profesional en una experiencia fluida.
          </p>
        </div>

        {/* Layout Bento Grid Responsivo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Card 1: Constructor de Dietas Drag & Drop (Grande - Col Span 2 en MD/LG) */}
          <div className="md:col-span-2 rounded-[18px] border border-[var(--border-soft)] bg-[var(--surface-cool)] p-5 sm:p-8 shadow-xs hover:border-[var(--accent-border)] transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#0071E3] text-white shadow-xs">
                  <Utensils className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-semibold tracking-wide uppercase px-3 py-1 rounded-full bg-[var(--surface)] text-[#0071E3] border border-[var(--border-soft)]">
                  Constructor Visual 2.0
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] mb-2 group-hover:text-[#0071E3] transition-colors">
                Diseño interactivo de planes en menos de 8 minutos
              </h3>
              <p className="text-sm sm:text-base text-[#424245] leading-relaxed mb-6">
                Arrastra ingredientes del catálogo oficial SMAE y USDA. Visualiza cómo se calculan en vivo las calorías, macronutrientes y distribución por tiempos de comida sin hacer una sola suma manual.
              </p>
            </div>

            {/* Mini preview visual interactivo */}
            <div className="rounded-[14px] bg-[var(--surface)] border border-[var(--border-soft)] p-4 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-[#424245] mb-2 font-medium">
                <span>Distribución Calórica Automática</span>
                <span className="text-[#0071E3] font-bold">100% Precisión</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-[var(--surface-alt)] border border-[var(--border-soft)]/50">
                  <span className="block text-[11px] text-[var(--ink-secondary)]">Proteínas</span>
                  <span className="font-bold text-[#0071E3]">115g (25%)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--surface-alt)] border border-[var(--border-soft)]/50">
                  <span className="block text-[11px] text-[var(--ink-secondary)]">Lípidos</span>
                  <span className="font-bold text-[#B45309]">62g (30%)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--surface-alt)] border border-[var(--border-soft)]/50">
                  <span className="block text-[11px] text-[var(--ink-secondary)]">Carbohidratos</span>
                  <span className="font-bold text-[#1B7F3A]">208g (45%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Antropometría ISAK y Bioimpedancia */}
          <div className="rounded-[18px] border border-[var(--border-soft)] bg-[var(--surface-cool)] p-5 sm:p-8 shadow-xs hover:border-[var(--accent-border)] transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#1B7F3A] text-white shadow-xs">
                  <Activity className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full bg-[var(--surface)] text-[#1B7F3A] border border-[var(--border-soft)]">
                  Protocolo ISAK
                </span>
              </div>

              <h3 className="text-xl font-bold text-[#1D1D1F] mb-2 group-hover:text-[#1B7F3A] transition-colors">
                Antropometría & Composición
              </h3>
              <p className="text-sm text-[#424245] leading-relaxed mb-4">
                Registra pliegues cutáneos (Durnin, Jackson-Pollock, Faulkner), circunferencias y bioimpedancia con gráficas comparativas de evolución entre consultas.
              </p>
            </div>

            <div className="p-3.5 rounded-[12px] bg-[var(--surface)] border border-[var(--border-soft)] flex items-center justify-between text-xs font-semibold text-[#1D1D1F]">
              <span>Masa Grasa vs Muscular</span>
              <span className="text-[#1B7F3A] font-bold">-2.4 kg grasa</span>
            </div>
          </div>

          {/* Card 3: Agenda Inteligente y Recordatorios Multicanal */}
          <div className="rounded-[18px] border border-[var(--border-soft)] bg-[var(--surface-cool)] p-5 sm:p-8 shadow-xs hover:border-[var(--accent-border)] transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#B45309] text-white shadow-xs">
                  <Calendar className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full bg-[var(--surface)] text-[#B45309] border border-[var(--border-soft)]">
                  Cero Ausentismo
                </span>
              </div>

              <h3 className="text-xl font-bold text-[#1D1D1F] mb-2 group-hover:text-[#B45309] transition-colors">
                Recordatorios por SMS y Email
              </h3>
              <p className="text-sm text-[#424245] leading-relaxed mb-4">
                El sistema contacta automáticamente a tus pacientes 36 horas antes de su consulta. Reduce las cancelaciones y citas olvidadas en más del 80%.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border-soft)] text-[#424245]">
                <CheckCircle2 className="h-4 w-4 text-[#1B7F3A] shrink-0" />
                <span>SMS de confirmación enviado</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border-soft)] text-[#424245]">
                <CheckCircle2 className="h-4 w-4 text-[#1B7F3A] shrink-0" />
                <span>Recordatorio por correo sincronizado</span>
              </div>
            </div>
          </div>

          {/* Card 4: Expediente SOAP y Laboratorio */}
          <div className="rounded-[18px] border border-[var(--border-soft)] bg-[var(--surface-cool)] p-5 sm:p-8 shadow-xs hover:border-[var(--accent-border)] transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#6366F1] text-white shadow-xs">
                  <FileText className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full bg-[var(--surface)] text-[#6366F1] border border-[var(--border-soft)]">
                  Expediente SOAP
                </span>
              </div>

              <h3 className="text-xl font-bold text-[#1D1D1F] mb-2 group-hover:text-[#6366F1] transition-colors">
                Historial Clínico y Laboratorio
              </h3>
              <p className="text-sm text-[#424245] leading-relaxed mb-4">
                Registra analitos de sangre seriados, signos vitales y notas formales SOAP con subida de estudios y recetas a la nube de Cloudinary.
              </p>
            </div>

            <div className="p-3.5 rounded-[12px] bg-[var(--surface)] border border-[var(--border-soft)] flex items-center justify-between text-xs">
              <span className="font-semibold text-[#1D1D1F]">Glucosa, Perfil Lipídico</span>
              <span className="text-[#6366F1] font-bold">100% Digital</span>
            </div>
          </div>

          {/* Card 5: Control Financiero y Reportes */}
          <div className="rounded-[18px] border border-[var(--border-soft)] bg-[var(--surface-cool)] p-5 sm:p-8 shadow-xs hover:border-[var(--accent-border)] transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#0071E3] text-white shadow-xs">
                  <DollarSign className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full bg-[var(--surface)] text-[#0071E3] border border-[var(--border-soft)]">
                  Finanzas Claras
                </span>
              </div>

              <h3 className="text-xl font-bold text-[#1D1D1F] mb-2 group-hover:text-[#0071E3] transition-colors">
                Finanzas & Analítica Poblacional
              </h3>
              <p className="text-sm text-[#424245] leading-relaxed mb-4">
                Supervisa ingresos por paciente, cuentas por cobrar, desglose de métodos de pago y estadísticas de salud comunitaria bajo estándares de la OMS.
              </p>
            </div>

            <div className="p-3.5 rounded-[12px] bg-[var(--surface)] border border-[var(--border-soft)] flex items-center justify-between text-xs">
              <span className="font-semibold text-[#1D1D1F]">Balance de Consultas</span>
              <span className="text-[#1B7F3A] font-bold flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>+32% Ingresos</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

BentoGrid.propTypes = {};
