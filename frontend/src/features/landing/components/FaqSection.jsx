import { useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Sección de Preguntas Frecuentes (FAQ) enfocada en derribar
 * las principales objeciones de compra frente a software tradicional.
 */
export default function FaqSection({ onCtaClick }) {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const faqs = [
    {
      question: '¿Puedo migrar mis pacientes desde Nutrimind o Excel?',
      answer: 'Sí. Disponemos de un importador asistido que te permite transferir tu listado de pacientes, teléfonos y notas clínicas anteriores en minutos. Además, nuestro equipo de soporte te acompaña en la migración para que no pierdas ningún expediente.',
    },
    {
      question: '¿Mis pacientes deben descargar una app obligatoria?',
      answer: 'No. Tus pacientes reciben un portal web interactivo (PWA) rápido y ligero desde el navegador de su teléfono (iOS o Android). Pueden consultar su plan alimenticio, lista de compras y evolución sin ocupar almacenamiento ni lidiar con descargas de tiendas de apps.',
    },
    {
      question: '¿Incluye el catálogo oficial del SMAE?',
      answer: 'Sí. NutriPro integra la base oficial del Sistema Mexicano de Alimentos Equivalentes (SMAE) y bases internacionales de referencia (USDA). Al arrastrar y soltar alimentos, el sistema calcula automáticamente los grupos de equivalentes, Kcal y distribución de macronutrientes en vivo.',
    },
    {
      question: '¿Qué pasa al finalizar la prueba de 14 días?',
      answer: 'Toda tu información, pacientes y plantillas se conservan 100% seguros e intactos. No se realiza ningún cargo automático porque no solicitamos tarjeta de crédito para iniciar. Al terminar los 14 días podrás elegir el plan que mejor se adapte al crecimiento de tu consulta.',
    },
  ];

  return (
    <section id="faq" className="py-20 md:py-28 bg-[var(--surface)] border-t border-[var(--border-soft)]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--ink)] leading-tight text-balance">
            Preguntas Frecuentes
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[var(--ink-secondary)] max-w-2xl mx-auto leading-relaxed">
            Resolvemos tus dudas sobre migración, compatibilidad clínica y la prueba gratuita de NutriPro.
          </p>
        </div>

        {/* Acordeón de Preguntas */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;

            return (
              <div
                key={idx}
                className="rounded-[16px] border border-[var(--border-soft)] bg-[var(--surface-cool)] overflow-hidden transition-all duration-200 hover:border-[var(--accent-border)]"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left text-base sm:text-lg font-semibold text-[var(--ink)] hover:text-[var(--accent)] transition-colors focus:outline-none min-h-[48px] cursor-pointer"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                  id={`faq-question-${idx}`}
                >
                  <span className="pr-4">{faq.question}</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface)] border border-[var(--border-soft)] shrink-0">
                    <ChevronDown
                      className={`h-4 w-4 text-[var(--ink-secondary)] transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[var(--accent)]' : ''
                      }`}
                    />
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={`faq-answer-${idx}`}
                    role="region"
                    aria-labelledby={`faq-question-${idx}`}
                    className="px-5 pb-5 sm:px-6 sm:pb-6 text-sm sm:text-base text-[var(--ink-muted)] leading-relaxed border-t border-[var(--border-soft)]/60 pt-4 bg-[var(--surface)] animate-in fade-in-50 duration-200"
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Banner de Contacto adicional */}
        <div className="mt-12 text-center p-6 sm:p-8 rounded-[18px] bg-[var(--surface-alt)] border border-[var(--border-soft)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h3 className="text-base sm:text-lg font-semibold text-[var(--ink)]">
              ¿Tienes alguna duda específica para tu consultorio?
            </h3>
            <p className="text-xs sm:text-sm text-[var(--ink-secondary)] mt-0.5">
              Nuestro equipo clínico te orienta en menos de 15 minutos.
            </p>
          </div>
          <Link
            to="/register"
            onClick={onCtaClick}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0071E3] hover:bg-[#0077ED] active:scale-[0.98] px-6 py-3 text-sm font-semibold text-white shadow-sm min-h-[44px] shrink-0 transition-all"
          >
            <span>Iniciar 14 días gratis</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

FaqSection.propTypes = {
  onCtaClick: PropTypes.func,
};
