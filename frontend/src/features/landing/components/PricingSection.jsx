import { useState } from 'react';
import PropTypes from 'prop-types';
import { Check, Sparkles, ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Sección de Precios y FAQ para la Landing Page de NutriPro.
 * Incluye conmutador mensual/anual reactivo, tarjetas de precios
 * transparentes y acordeón interactivo de preguntas frecuentes.
 */
export default function PricingSection({ onPlanSelect }) {
  const [annualBilling, setAnnualBilling] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

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
        'Cálculo de Kcal y Macros en tiempo real',
        'Expediente clínico y notas SOAP',
        'Exportación de planes a PDF',
        'Acceso multidispositivo Web y PWA',
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
      badge: 'Más Popular',
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

  const faqs = [
    {
      question: '¿Necesito ingresar mi tarjeta de crédito para la prueba gratis?',
      answer: 'No. Puedes crear tu cuenta y usar NutriPro con todas las funciones del Plan Profesional durante 14 días sin ingresar ningún método de pago. Al finalizar el período decides si deseas suscribirte.',
    },
    {
      question: '¿Cómo funcionan los recordatorios automáticos de citas?',
      answer: 'NutriPro cuenta con un servicio inteligente en la nube que busca las citas programadas en las próximas 36 horas y despacha un correo electrónico y un mensaje de texto (SMS) al paciente. Esto reduce el ausentismo en más del 80% sin que tengas que enviar mensajes manuales.',
    },
    {
      question: '¿Mis datos clínicos y los de mis pacientes están seguros?',
      answer: 'Absolutamente. Todas las conexiones están protegidas con cifrado TLS/SSL, las contraseñas se almacenan con hashing bcrypt y cada nutricionista cuenta con un entorno aislado (multi-tenant) donde ningún otro usuario puede acceder a sus pacientes.',
    },
    {
      question: '¿Puedo cancelar o cambiar de plan en cualquier momento?',
      answer: 'Sí. Puedes subir, bajar de plan o cancelar tu suscripción en cualquier momento desde tu panel de ajustes sin penalizaciones ni contratos forzosos.',
    },
    {
      question: '¿Puedo exportar los datos de mis pacientes si decido no continuar?',
      answer: 'Sí. NutriPro te permite exportar tus listados de pacientes y expedientes en formatos estándar para que nunca pierdas tu historial clínico.',
    },
  ];

  return (
    <section id="precios" className="py-20 md:py-28 bg-[var(--surface-cool)] border-t border-[var(--border-soft)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-3.5 py-1 text-xs font-semibold text-[var(--accent)] mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Precios Transparentes</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[var(--ink)] leading-tight text-balance">
            Planes a la medida de tu consulta.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[var(--ink-secondary)] leading-relaxed font-normal">
            Todos los planes incluyen 14 días de prueba completa. Cancela cuando quieras.
          </p>

          {/* Selector Mensual / Anual */}
          <div className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-full bg-[var(--surface)] border border-[var(--border-soft)] shadow-2xs">
            <button
              type="button"
              onClick={() => setAnnualBilling(false)}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${!annualBilling ? 'bg-[var(--accent)] text-white shadow-xs' : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'}`}
            >
              Pago Mensual
            </button>
            <button
              type="button"
              onClick={() => setAnnualBilling(true)}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all ${annualBilling ? 'bg-[var(--accent)] text-white shadow-xs' : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'}`}
            >
              <span>Pago Anual</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${annualBilling ? 'bg-white text-[var(--accent)]' : 'bg-[var(--accent-soft)] text-[var(--accent)]'}`}>
                -20% Descuento
              </span>
            </button>
          </div>
        </div>

        {/* Tarjetas de Precios (Grid 3 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20 items-stretch">
          {plans.map((plan, idx) => {
            const price = annualBilling ? plan.annualMonthlyPrice : plan.monthlyPrice;

            return (
              <div
                key={idx}
                className={`relative rounded-[18px] p-8 flex flex-col justify-between transition-all duration-300 ${
                  plan.popular
                    ? 'bg-[var(--surface)] border-2 border-[var(--accent)] shadow-md lg:-translate-y-2'
                    : 'bg-[var(--surface)] border border-[var(--border-soft)] shadow-2xs hover:border-[var(--accent-border)]'
                }`}
              >
                {/* Badge Superior para Plan Popular */}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[var(--accent)] text-white text-[11px] font-bold tracking-wider uppercase px-3.5 py-1 rounded-full shadow-xs">
                    {plan.badge}
                  </div>
                )}

                <div>
                  {/* Encabezado del Plan */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-[var(--ink)]">{plan.name}</h3>
                    <p className="text-xs text-[var(--ink-secondary)] mt-1.5 min-h-[36px]">{plan.target}</p>
                  </div>

                  {/* Precio */}
                  <div className="mb-6 pb-6 border-b border-[var(--border-soft)]">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl sm:text-5xl font-extrabold text-[var(--ink)]">${price}</span>
                      <span className="text-xs font-medium text-[var(--ink-secondary)]">MXN / mes</span>
                    </div>
                    <div className="text-[11px] text-[var(--ink-secondary)] mt-1">
                      {annualBilling ? 'Facturado anualmente (ahorras 2 meses)' : 'Facturación mensual recurrente'}
                    </div>
                  </div>

                  {/* Lista de Características */}
                  <div className="space-y-3 mb-8">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)] block">Incluye:</span>
                    {plan.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--ink-muted)]">
                        <Check className="h-4 w-4 text-[var(--accent)] shrink-0 mt-0.5" />
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
                    className={`w-full inline-flex items-center justify-center gap-2 rounded-full py-3.5 px-6 text-sm font-semibold transition-all ${
                      plan.popular
                        ? 'bg-[var(--accent)] text-white shadow-sm hover:bg-[var(--accent-hover)] hover:scale-[1.02]'
                        : 'border border-[var(--border-soft)] bg-[var(--surface-alt)] text-[var(--ink)] hover:bg-[var(--surface-strong)] hover:border-[var(--border)]'
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

        {/* Sección FAQ (Preguntas Frecuentes) */}
        <div id="faq" className="max-w-3xl mx-auto pt-10 border-t border-[var(--border-soft)]">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] mb-2">
              <HelpCircle className="h-4 w-4" />
              <span>Dudas Habituales</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-semibold text-[var(--ink)]">
              Preguntas Frecuentes
            </h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;

              return (
                <div
                  key={idx}
                  className="rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface)] overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-semibold text-[var(--ink)] hover:text-[var(--accent)] transition-colors focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`h-5 w-5 text-[var(--ink-secondary)] transition-transform duration-200 ${isOpen ? 'rotate-180 text-[var(--accent)]' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-[var(--ink-secondary)] leading-relaxed border-t border-[var(--border-soft)]/50 pt-3 animate-in fade-in-50 duration-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

PricingSection.propTypes = {
  onPlanSelect: PropTypes.func,
};
