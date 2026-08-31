import { useState } from 'react';
import PropTypes from 'prop-types';
import { Calculator, Clock, DollarSign, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Calculadora interactiva de Retorno de Inversión (ROI) y ahorro de tiempo.
 * Permite a los nutriólogos mover deslizadores interactivos para proyectar
 * cuántas horas al mes se liberan y cuánto dinero se recupera en citas.
 */
export default function RoiCalculator({ onCtaClick }) {
  const [patientsCount, setPatientsCount] = useState(35);
  const [consultationFee, setConsultationFee] = useState(800);
  const [minutesPerPlan, setMinutesPerPlan] = useState(45);

  // Cálculos dinámicos
  // Con NutriPro se toma un promedio de 8 minutos por plan
  const minutesSavedPerPatient = Math.max(0, minutesPerPlan - 8);
  const hoursSavedPerMonth = Math.round((patientsCount * minutesSavedPerPatient) / 60);

  // Reducción del ausentismo: tasa estándar de inasistencia del 15%, NutriPro evita el 80%
  const missedAppointmentsSaved = Math.max(1, Math.round(patientsCount * 0.15 * 0.8));
  const recoveredMoneyFromAppointments = missedAppointmentsSaved * consultationFee;

  // Valor económico total mensual generado (dinero de citas no perdidas)
  const estimatedSubscriptionCost = 499; // Precio mensual de referencia en MXN
  const netMonthlyBenefit = recoveredMoneyFromAppointments - estimatedSubscriptionCost;
  const roiPercentage = Math.round((recoveredMoneyFromAppointments / estimatedSubscriptionCost) * 100);

  return (
    <section id="calculadora-roi" className="py-20 md:py-28 bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-soft)] bg-[var(--surface-alt)] px-3.5 py-1 text-xs font-semibold text-[var(--accent)] mb-4">
            <Calculator className="h-3.5 w-3.5" />
            <span>Impacto Financiero Real</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[var(--ink)] leading-tight text-balance">
            Calcula el Retorno de Inversión en tu consulta.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[var(--ink-secondary)] leading-relaxed font-normal">
            Ajusta los valores de tu práctica privada para estimar el ahorro de horas semanales y el dinero recuperado por reducción de inasistencias.
          </p>
        </div>

        {/* Tarjeta Principal de la Calculadora */}
        <div className="mx-auto max-w-5xl rounded-[18px] border border-[var(--border-soft)] bg-[var(--surface-cool)] p-6 sm:p-10 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Columna Izquierda: Deslizadores de Entrada (7 cols) */}
          <div className="lg:col-span-7 space-y-7">
            <h3 className="text-lg font-semibold text-[var(--ink)] flex items-center gap-2">
              <span>Parámetros de tu consulta</span>
            </h3>

            {/* Slider 1: Pacientes al mes */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="patients-slider" className="text-sm font-medium text-[var(--ink)] flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-[var(--accent)]" />
                  <span>Pacientes atendidos por mes</span>
                </label>
                <span className="text-sm font-bold text-[var(--accent)] bg-[var(--accent-soft)] px-3 py-1 rounded-full">
                  {patientsCount} pacientes
                </span>
              </div>
              <input
                id="patients-slider"
                type="range"
                min="10"
                max="120"
                step="5"
                value={patientsCount}
                onChange={(e) => setPatientsCount(Number(e.target.value))}
                className="w-full h-2 bg-[var(--gray-200)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
              />
              <div className="flex justify-between text-[11px] text-[var(--ink-secondary)] mt-1">
                <span>10 pacientes</span>
                <span>60 pacientes</span>
                <span>120+ pacientes</span>
              </div>
            </div>

            {/* Slider 2: Tarifa por consulta */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="fee-slider" className="text-sm font-medium text-[var(--ink)] flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-[var(--success)]" />
                  <span>Tarifa promedio por consulta</span>
                </label>
                <span className="text-sm font-bold text-[var(--success)] bg-[var(--success)]/10 px-3 py-1 rounded-full">
                  ${consultationFee} MXN
                </span>
              </div>
              <input
                id="fee-slider"
                type="range"
                min="300"
                max="2000"
                step="50"
                value={consultationFee}
                onChange={(e) => setConsultationFee(Number(e.target.value))}
                className="w-full h-2 bg-[var(--gray-200)] rounded-lg appearance-none cursor-pointer accent-[var(--success)]"
              />
              <div className="flex justify-between text-[11px] text-[var(--ink-secondary)] mt-1">
                <span>$300 MXN</span>
                <span>$1,000 MXN</span>
                <span>$2,000+ MXN</span>
              </div>
            </div>

            {/* Slider 3: Minutos por plan */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="time-slider" className="text-sm font-medium text-[var(--ink)] flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-[#B45309]" />
                  <span>Tiempo actual armando cada dieta</span>
                </label>
                <span className="text-sm font-bold text-[#B45309] bg-[#B45309]/10 px-3 py-1 rounded-full">
                  {minutesPerPlan} minutos
                </span>
              </div>
              <input
                id="time-slider"
                type="range"
                min="15"
                max="60"
                step="5"
                value={minutesPerPlan}
                onChange={(e) => setMinutesPerPlan(Number(e.target.value))}
                className="w-full h-2 bg-[var(--gray-200)] rounded-lg appearance-none cursor-pointer accent-[#B45309]"
              />
              <div className="flex justify-between text-[11px] text-[var(--ink-secondary)] mt-1">
                <span>15 min</span>
                <span>40 min</span>
                <span>60 min</span>
              </div>
            </div>

            <div className="p-3.5 rounded-[12px] bg-[var(--surface)] border border-[var(--border-soft)] text-xs text-[var(--ink-secondary)] space-y-1">
              <div className="flex items-center gap-1.5 text-[var(--ink)] font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5 text-[var(--success)]" />
                <span>Cálculo basado en métricas de nutriólogos activos</span>
              </div>
              <p>
                Con el constructor visual de NutriPro el tiempo se reduce a <strong>8 minutos</strong> por dieta y los recordatorios automáticos reducen las inasistencias en un <strong>80%</strong>.
              </p>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta de Resultados (5 cols) */}
          <div className="lg:col-span-5 rounded-[16px] bg-[var(--surface)] border border-[var(--accent-border)] p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-5">
              <div className="border-b border-[var(--border-soft)] pb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-secondary)]">Tu Proyección Mensual</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-bold text-[var(--accent)]">
                    +{hoursSavedPerMonth} horas
                  </span>
                  <span className="text-xs text-[var(--ink-secondary)] font-medium">libres al mes</span>
                </div>
              </div>

              {/* Métricas clave desglosadas */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-alt)]">
                  <span className="text-xs font-medium text-[var(--ink-muted)]">Citas rescatadas (SMS/Email):</span>
                  <span className="text-xs font-bold text-[var(--ink)]">+{missedAppointmentsSaved} consultas/mes</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-alt)]">
                  <span className="text-xs font-medium text-[var(--ink-muted)]">Ingreso extra recuperado:</span>
                  <span className="text-sm font-bold text-[var(--success)]">+${recoveredMoneyFromAppointments.toLocaleString()} MXN</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-alt)]">
                  <span className="text-xs font-medium text-[var(--ink-muted)]">Beneficio neto estimado:</span>
                  <span className="text-sm font-bold text-[var(--ink)]">+${netMonthlyBenefit.toLocaleString()} MXN</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--accent-soft)]/50 border border-[var(--accent-border)]/50">
                  <span className="text-xs font-medium text-[var(--accent)]">Retorno sobre Inversión (ROI):</span>
                  <span className="text-sm font-bold text-[var(--accent)]">{roiPercentage}%</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-[var(--border-soft)]">
              <Link
                to="/register"
                onClick={onCtaClick}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] py-3 px-6 text-sm font-semibold text-white shadow-sm hover:bg-[var(--accent-hover)] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Empieza a ahorrar tiempo hoy</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="text-center mt-2 text-[11px] text-[var(--ink-secondary)]">
                Prueba sin compromiso por 14 días
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

RoiCalculator.propTypes = {
  onCtaClick: PropTypes.func,
};
