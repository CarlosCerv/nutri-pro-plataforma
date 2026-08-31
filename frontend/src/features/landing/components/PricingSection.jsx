import { useState } from 'react';
import PropTypes from 'prop-types';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Sección de Precios para la Landing Page de NutriPro.
 * Incluye conmutador reactivo mensual/anual con -20% de ahorro
 * y tarjetas de precios transparentes con touch targets de 44px+.
 */
export default function PricingSection({ onPlanSelect }) {
  const [annualBilling, setAnnualBilling] = useState(true);

  const plans = [
    {
      name: 'Inicial',
      target: 'Ideal para nutriólogos que inician su consulta privada.',
      monthlyPrice: 399,
      annualMonthlyPrice: 319,
      popular: false,
      features: [
        'Pacientes ilimitados',
        'Constructor de dietas Drag & Drop',
        'Catálogo oficial SMAE y USDA',
        'Cálculo de Kcal y Macros en tiempo real',
        'Expediente clínico y notas SOAP',
        'Exportación de planes a PDF',
        'Portal web PWA para pacientes',
        'Soporte estándar por correo',
      ],
      ctaText: 'Comenzar 14 días gratis',
    },
    {
      name: 'Profesional Pro',
      target: 'Para nutricionistas clínicos con alta demanda de pacientes.',
      monthlyPrice: 599,
      annualMonthlyPrice: 479,
      popular: true,
      badge: 'Más Elegido',
      features: [
        'Todo lo del Plan Inicial, más:',
        'Recordatorios automáticos por SMS y Email',
        'Antropometría ISAK completa (pliegues y bioimpedancia)',
        'Historial de laboratorio y subida de estudios',
        'Analítica poblacional bajo estándares OMS',
        'Módulo de finanzas y control de cobros',
        'Biblioteca de plantillas de dieta preconfiguradas',
        'Soporte prioritario directo',
      ],
      ctaText: 'Probar Profesional Gratis',
    },
    {
      name: 'Clínicas & Equipos',
      target: 'Para consultorios grupales y centros de nutrición.',
      monthlyPrice: 1199,
      annualMonthlyPrice: 959,
      popular: false,
      features: [
        'Todo lo del Plan Profesional, más:',
        'Múltiples cuentas de especialistas',
        'Branding y logotipo personalizado en PDFs',
        'Exportación masiva de datos clínicos',
        'Auditoría y control de permisos',
        'Migración asistida de pacientes existentes',
        'Capacitación inicial personalizada',
      ],
      ctaText: 'Contactar a Ventas',
    },
  ];

  return (
    <section id="precios" className="py-16 md:py-24 lg:py-28 bg-[var(--surface-cool)] border-t border-[var(--border-soft)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1D1D1F] leading-tight text-balance">
            Planes a la medida de tu consulta.
          </h2>
          <p className="mt-4 text-sm sm:text-base lg:text-lg text-[#424245] leading-relaxed font-normal">
            Todos los planes incluyen 14 días de prueba completa. Sin tarjeta de crédito requerida y cancela cuando quieras.
          </p>

          {/* Selector Mensual / Anual con Touch Target >= 44px */}
          <div className="mt-8 inline-flex items-center gap-2 p-1.5 rounded-full bg-[var(--surface)] border border-[var(--border-soft)] shadow-2xs">
            <button
              type="button"
              onClick={() => setAnnualBilling(false)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold min-h-[44px] cursor-pointer transition-all ${
                !annualBilling
                  ? 'bg-[#0071E3] text-white shadow-xs'
                  : 'text-[#424245] hover:text-[#1D1D1F]'
              }`}
            >
              Pago Mensual
            </button>
            <button
              type="button"
              onClick={() => setAnnualBilling(true)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold min-h-[44px] cursor-pointer flex items-center gap-2 transition-all ${
                annualBilling
                  ? 'bg-[#0071E3] text-white shadow-xs'
                  : 'text-[#424245] hover:text-[#1D1D1F]'
              }`}
            >
              <span>Pago Anual</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  annualBilling ? 'bg-white text-[#0071E3]' : 'bg-[#0071E3]/10 text-[#0071E3]'
                }`}
              >
                -20% Ahorro
              </span>
            </button>
          </div>
        </div>

        {/* Tarjetas de Precios (Grid 3 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto items-stretch">
          {plans.map((plan, idx) => {
            const price = annualBilling ? plan.annualMonthlyPrice : plan.monthlyPrice;

            return (
              <div
                key={idx}
                className={`relative rounded-[20px] p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                  plan.popular
                    ? 'bg-[var(--surface)] border-2 border-[#0071E3] shadow-md lg:-translate-y-2'
                    : 'bg-[var(--surface)] border border-[var(--border-soft)] shadow-2xs hover:border-[var(--accent-border)]'
                }`}
              >
                {/* Badge Superior para Plan Popular */}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0071E3] text-white text-[11px] font-bold tracking-wider uppercase px-4 py-1 rounded-full shadow-xs flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    <span>{plan.badge}</span>
                  </div>
                )}

                <div>
                  {/* Encabezado del Plan */}
                  <div className="mb-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-[#1D1D1F]">{plan.name}</h3>
                    <p className="text-xs sm:text-sm text-[#424245] mt-1.5 min-h-[38px] leading-relaxed">
                      {plan.target}
                    </p>
                  </div>

                  {/* Precio */}
                  <div className="mb-6 pb-6 border-b border-[var(--border-soft)]">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl sm:text-5xl font-extrabold text-[#1D1D1F]">${price}</span>
                      <span className="text-xs font-semibold text-[#6E6E73]">MXN / mes</span>
                    </div>
                    <div className="text-[11px] text-[#6E6E73] mt-1 font-medium">
                      {annualBilling ? 'Facturado anualmente (ahorras 2 meses)' : 'Facturación mensual recurrente'}
                    </div>
                  </div>

                  {/* Lista de Características */}
                  <div className="space-y-3 mb-8">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1D1D1F] block">
                      Incluye:
                    </span>
                    {plan.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#424245]">
                        <Check className="h-4 w-4 text-[#0071E3] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botón CTA */}
                <div>
                  <Link
                    to="/register"
                    onClick={() => onPlanSelect && onPlanSelect(plan.name)}
                    className={`w-full inline-flex items-center justify-center gap-2 rounded-full py-3.5 px-6 text-sm sm:text-base font-semibold min-h-[48px] transition-all ${
                      plan.popular
                        ? 'bg-[#0071E3] text-white shadow-sm hover:bg-[#0077ED] hover:scale-[1.02] active:scale-[0.98]'
                        : 'border border-[var(--border-soft)] bg-[var(--surface-alt)] text-[#1D1D1F] hover:bg-[var(--surface-strong)] hover:border-[var(--border)]'
                    }`}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

PricingSection.propTypes = {
  onPlanSelect: PropTypes.func,
};
