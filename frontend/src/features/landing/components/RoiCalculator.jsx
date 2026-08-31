import { useState } from 'react';
import PropTypes from 'prop-types';
import { Clock, DollarSign, Users, ArrowRight, CheckCircle2, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Calculadora interactiva de Retorno de Inversión (ROI) y ahorro de tiempo.
 * Optimizada para Mobile-First:
 * - Sliders con touch targets accesibles
 * - Resumen táctil de impacto financiero
 * - CTA directo de alta conversión
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
  const estimatedSubscriptionCost = 479; // Precio mensual de referencia plan Pro
  const netMonthlyBenefit = recoveredMoneyFromAppointments - estimatedSubscriptionCost;
  const roiPercentage = Math.round((recoveredMoneyFromAppointments / estimatedSubscriptionCost) * 100);

  return (
    <section id="calculadora-roi" className="py-16 md:py-24 lg:py-28 bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1D1D1F] leading-tight text-balance">
            Calcula el Retorno de Inversión en tu consulta.
          </h2>
          <p className="mt-4 text-sm sm:text-base lg:text-lg text-[#424245] leading-relaxed font-normal">
            Ajusta los valores de tu práctica privada para estimar las horas semanales liberadas y el dinero recuperado por reducción de inasistencias.
          </p>
        </div>

        {/* Tarjeta Principal de la Calculadora */}
        <div className="mx-auto max-w-5xl rounded-[18px] border border-[var(--border-soft)] bg-[var(--surface-cool)] p-5 sm:p-8 lg:p-10 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Columna Izquierda: Deslizadores Táctiles (7 cols) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7">
            <h3 className="text-lg font-bold text-[#1D1D1F] flex items-center gap-2">
              <span>Parámetros de tu consulta</span>
            </h3>

            {/* Slider 1: Pacientes al mes */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="patients-slider" className="text-sm font-semibold text-[#1D1D1F] flex items-center gap-1.5 cursor-pointer">
                  <Users className="h-4 w-4 text-[#0071E3]" />
                  <span>Pacientes activos por mes</span>
                </label>
                <span className="text-xs sm:text-sm font-bold text-[#0071E3] bg-[#0071E3]/10 px-3 py-1 rounded-full">
                  {patientsCount} pacientes
                </span>
              </div>
              <div className="py-2">
                <input
                  id="patients-slider"
                  type="range"
                  min="10"
                  max="120"
                  step="5"
                  value={patientsCount}
                  onChange={(e) => setPatientsCount(Number(e.target.value))}
                  className="w-full h-2.5 bg-[var(--gray-200)] rounded-lg appearance-none cursor-pointer accent-[#0071E3] min-h-[44px]"
                />
              </div>
              <div className="flex justify-between text-[11px] text-[#6E6E73]">
                <span>10 pacientes</span>
                <span>60 pacientes</span>
                <span>120+ pacientes</span>
              </div>
            </div>

            {/* Slider 2: Tarifa por consulta */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="fee-slider" className="text-sm font-semibold text-[#1D1D1F] flex items-center gap-1.5 cursor-pointer">
                  <DollarSign className="h-4 w-4 text-[#1B7F3A]" />
                  <span>Tarifa promedio por consulta</span>
                </label>
                <span className="text-xs sm:text-sm font-bold text-[#1B7F3A] bg-[#1B7F3A]/10 px-3 py-1 rounded-full">
                  ${consultationFee} MXN
                </span>
              </div>
              <div className="py-2">
                <input
                  id="fee-slider"
                  type="range"
                  min="300"
                  max="2000"
                  step="50"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(Number(e.target.value))}
                  className="w-full h-2.5 bg-[var(--gray-200)] rounded-lg appearance-none cursor-pointer accent-[#1B7F3A] min-h-[44px]"
                />
              </div>
              <div className="flex justify-between text-[11px] text-[#6E6E73]">
                <span>$300 MXN</span>
                <span>$1,000 MXN</span>
                <span>$2,000+ MXN</span>
              </div>
            </div>

            {/* Slider 3: Minutos por plan */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="time-slider" className="text-sm font-semibold text-[#1D1D1F] flex items-center gap-1.5 cursor-pointer">
                  <Clock className="h-4 w-4 text-[#B45309]" />
                  <span>Tiempo actual armando cada dieta</span>
                </label>
                <span className="text-xs sm:text-sm font-bold text-[#B45309] bg-[#B45309]/10 px-3 py-1 rounded-full">
                  {minutesPerPlan} minutos
                </span>
              </div>
              <div className="py-2">
                <input
                  id="time-slider"
                  type="range"
                  min="15"
                  max="60"
                  step="5"
                  value={minutesPerPlan}
                  onChange={(e) => setMinutesPerPlan(Number(e.target.value))}
                  className="w-full h-2.5 bg-[var(--gray-200)] rounded-lg appearance-none cursor-pointer accent-[#B45309] min-h-[44px]"
                />
              </div>
              <div className="flex justify-between text-[11px] text-[#6E6E73]">
                <span>15 min</span>
                <span>40 min</span>
                <span>60 min</span>
              </div>
            </div>

            <div className="p-4 rounded-[14px] bg-[var(--surface)] border border-[var(--border-soft)] text-xs text-[#424245] space-y-1">
              <div className="flex items-center gap-1.5 text-[#1D1D1F] font-bold">
                <CheckCircle2 className="h-4 w-4 text-[#1B7F3A] shrink-0" />
                <span>Cálculo basado en métricas reales</span>
              </div>
              <p className="leading-relaxed">
                Con el constructor de dietas NutriPro reduces el tiempo a <strong>8 minutos</strong> por plan y los recordatorios automáticos evitan el <strong>80% del ausentismo</strong>.
              </p>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta de Resultados (5 cols) */}
          <div className="lg:col-span-5 rounded-[18px] bg-[var(--surface)] border-2 border-[#0071E3]/30 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-5">
              <div className="border-b border-[var(--border-soft)] pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6E6E73]">Tu Proyección Mensual</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#0071E3]">
                    +{hoursSavedPerMonth} horas
                  </span>
                  <span className="text-xs text-[#424245] font-semibold">ahorradas/mes</span>
                </div>
              </div>

              {/* Métricas clave desglosadas */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-alt)]">
                  <span className="text-xs font-medium text-[#424245]">Citas no perdidas (SMS/Email):</span>
                  <span className="text-xs font-bold text-[#1D1D1F]">+{missedAppointmentsSaved} consultas/mes</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-alt)]">
                  <span className="text-xs font-medium text-[#424245]">Ingreso extra recuperado:</span>
                  <span className="text-sm font-bold text-[#1B7F3A]">+${recoveredMoneyFromAppointments.toLocaleString()} MXN</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-alt)]">
                  <span className="text-xs font-medium text-[#424245]">Beneficio neto estimado:</span>
                  <span className="text-sm font-bold text-[#1D1D1F]">+${netMonthlyBenefit.toLocaleString()} MXN</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0071E3]/10 border border-[#0071E3]/20">
                  <span className="text-xs font-bold text-[#0071E3]">Retorno de Inversión (ROI):</span>
                  <span className="text-sm font-extrabold text-[#0071E3] flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>{roiPercentage}%</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-[var(--border-soft)]">
              <Link
                to="/register"
                onClick={onCtaClick}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#0071E3] hover:bg-[#0077ED] active:scale-[0.98] py-3.5 px-6 text-sm sm:text-base font-semibold text-white shadow-sm transition-all min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]"
              >
                <span>Quiero ahorrar este tiempo</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="text-center mt-2 text-[11px] text-[#6E6E73]">
                14 días gratis • Sin tarjeta requerida
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
