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
 * Utiliza tarjetas asimétricas, bordes sutiles, micro-interacciones
 * y tipografía jerárquica para comunicar el valor clínico y operativo.
 */
export default function BentoGrid() {
  return (
    <section id="caracteristicas" className="py-20 md:py-28 bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Encabezado de Sección */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[var(--ink)] leading-tight text-balance">
            La suite clínica más completa para nutricionistas.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[var(--ink-secondary)] leading-relaxed font-normal">
            Elimina el caos de hojas de cálculo y programas desconectados. NutriPro unifica cada aspecto de tu práctica profesional.
          </p>
        </div>

        {/* Layout Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Constructor de Dietas Drag & Drop (Grande - Col Span 2 en LG) */}
          <div className="lg:col-span-2 rounded-[18px] border border-[var(--border-soft)] bg-[var(--surface-cool)] p-6 sm:p-8 shadow-xs hover:border-[var(--accent-border)] transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[var(--accent)] text-white shadow-xs">
                  <Utensils className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-[var(--accent)] bg-[var(--accent-soft)] px-3 py-1 rounded-full">
                  5 Minutos por Dieta
                </span>
              </div>
              <h3 className="text-2xl font-semibold text-[var(--ink)] mb-2 group-hover:text-[var(--accent)] transition-colors">
                Constructor de Dietas por Arrastrar y Soltar
              </h3>
              <p className="text-[var(--ink-secondary)] text-sm sm:text-base leading-relaxed mb-6">
                Organiza menús completos en 6 tiempos de comida. Conforme añades o ajustas porciones,
                NutriPro recalcula en tiempo real las calorías totales y el porcentaje de macronutrientes frente a tu meta calculada.
              </p>
            </div>

            {/* Visual interactivo interno */}
            <div className="rounded-[12px] border border-[var(--border-soft)] bg-[var(--surface)] p-4 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-medium text-[var(--ink-secondary)] pb-3 mb-3 border-b border-[var(--border-soft)]">
                <span>Tiempo de comida: <strong>Colación Matutina</strong></span>
                <span className="text-[var(--success)] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> 100% Cubierto
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="bg-[var(--surface-alt)] p-2.5 rounded-lg border border-[var(--border-soft)]/50">
                  <div className="text-[11px] text-[var(--ink-secondary)]">Kcal objetivo</div>
                  <div className="text-base font-bold text-[var(--ink)]">320 kcal</div>
                </div>
                <div className="bg-[var(--surface-alt)] p-2.5 rounded-lg border border-[var(--border-soft)]/50">
                  <div className="text-[11px] text-[var(--ink-secondary)]">Proteína (g)</div>
                  <div className="text-base font-bold text-[#0058B0]">22g (28%)</div>
                </div>
                <div className="bg-[var(--surface-alt)] p-2.5 rounded-lg border border-[var(--border-soft)]/50">
                  <div className="text-[11px] text-[var(--ink-secondary)]">Fibra Dietética</div>
                  <div className="text-base font-bold text-[#1B7F3A]">8.5g</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Cineantropometría ISAK y Bioimpedancia */}
          <div className="rounded-[18px] border border-[var(--border-soft)] bg-[var(--surface)] p-6 sm:p-8 shadow-xs hover:border-[var(--accent-border)] transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#5B21B6] text-white shadow-xs">
                  <Activity className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-[#5B21B6] bg-[#5B21B6]/10 px-3 py-1 rounded-full">
                  Protocolo ISAK
                </span>
              </div>
              <h3 className="text-xl font-semibold text-[var(--ink)] mb-2 group-hover:text-[var(--accent)] transition-colors">
                Antropometría y Composición Corporal
              </h3>
              <p className="text-[var(--ink-secondary)] text-sm leading-relaxed mb-6">
                Captura pliegues cutáneos milimétricos, perímetros, diámetros óseos y bioimpedancia (% grasa, masa magra, agua, grasa visceral).
              </p>
            </div>

            <div className="space-y-2 bg-[var(--surface-alt)] p-3.5 rounded-[12px] border border-[var(--border-soft)]">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--ink-secondary)]">% Grasa Corporal</span>
                <span className="font-semibold text-[var(--ink)]">19.4% (Saludable)</span>
              </div>
              <div className="w-full bg-[var(--gray-200)] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[var(--success)] h-full w-[65%] rounded-full" />
              </div>
              <div className="flex justify-between text-xs pt-1">
                <span className="text-[var(--ink-secondary)]">Masa Muscular</span>
                <span className="font-semibold text-[var(--ink)]">32.8 kg (+1.2 kg)</span>
              </div>
            </div>
          </div>

          {/* Card 3: Agenda Inteligente y Recordatorios Multicanal */}
          <div className="rounded-[18px] border border-[var(--border-soft)] bg-[var(--surface)] p-6 sm:p-8 shadow-xs hover:border-[var(--accent-border)] transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[var(--accent)] text-white shadow-xs">
                  <Calendar className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-[var(--success)] bg-[var(--success)]/10 px-3 py-1 rounded-full">
                  -80% Ausentismo
                </span>
              </div>
              <h3 className="text-xl font-semibold text-[var(--ink)] mb-2 group-hover:text-[var(--accent)] transition-colors">
                Recordatorios Automáticos por SMS y Correo
              </h3>
              <p className="text-[var(--ink-secondary)] text-sm leading-relaxed mb-6">
                NutriPro despacha avisos de cita automatizados vía Email y SMS en una ventana inteligente de 36 horas. Evita citas olvidadas sin mover un dedo.
              </p>
            </div>

            <div className="p-3 bg-[var(--surface-cool)] rounded-[12px] border border-[var(--border-soft)] flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-[var(--success)] animate-ping" />
              <div className="text-xs">
                <div className="font-semibold text-[var(--ink)]">SMS Entregado · 08:30 AM</div>
                <div className="text-[var(--ink-secondary)] text-[11px]">"Hola Mariana, tu cita de nutrición es mañana a las 4:00 PM."</div>
              </div>
            </div>
          </div>

          {/* Card 4: Bioquímica y Notas SOAP */}
          <div className="rounded-[18px] border border-[var(--border-soft)] bg-[var(--surface)] p-6 sm:p-8 shadow-xs hover:border-[var(--accent-border)] transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#B45309] text-white shadow-xs">
                  <FileText className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-[#B45309] bg-[#B45309]/10 px-3 py-1 rounded-full">
                  Formato SOAP
                </span>
              </div>
              <h3 className="text-xl font-semibold text-[var(--ink)] mb-2 group-hover:text-[var(--accent)] transition-colors">
                Historial de Laboratorio y Notas Clínicas
              </h3>
              <p className="text-[var(--ink-secondary)] text-sm leading-relaxed mb-6">
                Registra analitos de sangre seriados, signos vitales y notas formales SOAP con subida de estudios y recetas a la nube de Cloudinary.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[var(--surface-alt)] p-2.5 rounded-lg">
                <span className="text-[var(--ink-secondary)]">Glucosa en ayuno</span>
                <div className="font-bold text-[var(--ink)]">88 mg/dL (Normal)</div>
              </div>
              <div className="bg-[var(--surface-alt)] p-2.5 rounded-lg">
                <span className="text-[var(--ink-secondary)]">Colesterol Total</span>
                <div className="font-bold text-[var(--ink)]">174 mg/dL (Óptimo)</div>
              </div>
            </div>
          </div>

          {/* Card 5: Analítica Poblacional OMS y Finanzas */}
          <div className="rounded-[18px] border border-[var(--border-soft)] bg-[var(--surface-cool)] p-6 sm:p-8 shadow-xs hover:border-[var(--accent-border)] transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[var(--ink)] text-white shadow-xs">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-[var(--ink)] bg-[var(--gray-200)] px-3 py-1 rounded-full">
                  Control Total
                </span>
              </div>
              <h3 className="text-xl font-semibold text-[var(--ink)] mb-2 group-hover:text-[var(--accent)] transition-colors">
                Inteligencia del Consultorio y Finanzas
              </h3>
              <p className="text-[var(--ink-secondary)] text-sm leading-relaxed mb-6">
                Visualiza la distribución de IMC de toda tu cartera de pacientes bajo los cortes epidemiológicos de la OMS y monitorea tus ingresos mensuales.
              </p>
            </div>

            <div className="p-3 bg-[var(--surface)] rounded-[12px] border border-[var(--border-soft)] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[var(--ink-secondary)]">Ingresos Mes Actual</span>
                <div className="text-sm font-bold text-[var(--success)]">$42,500 MXN (+18%)</div>
              </div>
              <DollarSign className="h-6 w-6 text-[var(--success)] p-1 bg-[var(--success)]/10 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

BentoGrid.propTypes = {};
