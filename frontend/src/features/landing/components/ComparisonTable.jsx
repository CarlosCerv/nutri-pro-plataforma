import PropTypes from 'prop-types';
import { Check, X, Sparkles, AlertCircle } from 'lucide-react';

/**
 * Tabla comparativa responsiva que contrasta NutriPro frente a Hojas de Cálculo (Excel)
 * y Software Tradicional. Diseñada para Mobile-First:
 * - En Desktop (>= md): Tabla completa con columna destacada
 * - En Mobile (< md): Tarjetas apiladas de contraste (Card-Stack) con acento #0071E3
 */
export default function ComparisonTable() {
  const comparisonRows = [
    {
      feature: 'Velocidad para armar una dieta semanal',
      nutripro: '5 a 8 minutos con Drag & Drop',
      excel: '45 a 60 minutos (Copia y pega manual)',
      traditional: '20 a 30 minutos (Listas rígidas)',
      highlight: true,
      badge: 'Ahorro 85% de tiempo',
    },
    {
      feature: 'Cálculo de Kcal, Macros y SMAE en vivo',
      nutripro: 'Instantáneo y 100% automático',
      excel: 'Fórmulas manuales propensas a error',
      traditional: 'Limitado o desactualizado',
      highlight: true,
      badge: 'Cero errores de cálculo',
    },
    {
      feature: 'Catálogo oficial SMAE 100% integrado',
      nutripro: 'Catálogo oficial completo + USDA',
      excel: 'Requiere digitar cada ingrediente',
      traditional: 'Base genérica incompleta',
      highlight: false,
    },
    {
      feature: 'Antropometría ISAK y Bioimpedancia',
      nutripro: 'Pliegues, perímetros y bioimpedancia',
      excel: 'No disponible',
      traditional: 'Solo peso y talla básica',
      highlight: false,
    },
    {
      feature: 'Recordatorios automáticos de citas',
      nutripro: 'SMS y correos automáticos 36h antes',
      excel: 'No disponible',
      traditional: 'Requiere plugins o costo extra',
      highlight: true,
      badge: '-80% ausentismo',
    },
    {
      feature: 'Expediente clínico SOAP y Laboratorio',
      nutripro: 'Notas SOAP, analitos y recetas en la nube',
      excel: 'Disperso en archivos sueltos',
      traditional: 'Formularios lentos y complejos',
      highlight: false,
    },
    {
      feature: 'Entrega de planes al paciente',
      nutripro: 'Portal interactivo PWA + PDF estético',
      excel: 'Archivos PDF desalineados',
      traditional: 'Plantillas genéricas poco claras',
      highlight: true,
      badge: 'Mayor adherencia',
    },
    {
      feature: 'Control financiero y cobros de consulta',
      nutripro: 'Integrado con reportes y balance mensual',
      excel: 'Requiere otra hoja separada',
      traditional: 'No disponible',
      highlight: false,
    },
  ];

  const renderCellContent = (val, isNutripro = false) => {
    if (val === true) {
      return (
        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-[#0071E3] text-white shadow-2xs">
          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
        </span>
      );
    }
    if (val === false) {
      return (
        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-neutral-200 text-[#6E6E73]">
          <X className="h-3.5 w-3.5" />
        </span>
      );
    }
    return (
      <span
        className={`text-xs sm:text-sm font-medium ${
          isNutripro ? 'text-[#0071E3] font-semibold' : 'text-[#424245]'
        }`}
      >
        {val}
      </span>
    );
  };

  return (
    <section id="comparativa" className="py-16 md:py-24 lg:py-28 bg-[var(--surface-cool)] border-y border-[var(--border-soft)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1D1D1F] leading-tight text-balance">
            Por qué los mejores nutriólogos eligen NutriPro.
          </h2>
          <p className="mt-4 text-sm sm:text-base lg:text-lg text-[#424245] leading-relaxed font-normal">
            Compara la eficiencia clínica, automatización y el ahorro de tiempo frente a hojas de cálculo y software obsoleto.
          </p>
        </div>

        {/* ── Vista Móvil: Tarjetas Apiladas de Contraste (Card-Stack < md) ── */}
        <div className="md:hidden space-y-4">
          {comparisonRows.map((row, idx) => (
            <div
              key={idx}
              className={`rounded-[18px] border bg-[var(--surface)] p-4 sm:p-5 shadow-xs transition-all ${
                row.highlight ? 'border-[#0071E3]/40 ring-1 ring-[#0071E3]/20' : 'border-[var(--border-soft)]'
              }`}
            >
              {/* Título de la Característica */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-sm font-bold text-[#1D1D1F] leading-snug">{row.feature}</span>
                {row.badge && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#0071E3] text-white px-2.5 py-0.5 rounded-full shrink-0">
                    {row.badge}
                  </span>
                )}
              </div>

              {/* Contraste NutriPro vs Métodos Tradicionales */}
              <div className="space-y-2 text-xs">
                {/* NutriPro (Destacado) */}
                <div className="p-3 rounded-[12px] bg-[#0071E3]/10 border border-[#0071E3]/25 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0071E3] text-white shrink-0">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                    <span className="font-bold text-[#0071E3] shrink-0">NutriPro:</span>
                    <span className="font-semibold text-[#1D1D1F] truncate">{row.nutripro}</span>
                  </div>
                </div>

                {/* Software Tradicional */}
                <div className="p-2.5 rounded-[10px] bg-[var(--surface-alt)] flex items-center justify-between gap-2 text-[#6E6E73]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-200 text-[#6E6E73] shrink-0">
                      <X className="h-2.5 w-2.5" />
                    </span>
                    <span className="font-medium text-[#424245] shrink-0">Software Antiguo:</span>
                    <span className="truncate">{row.traditional}</span>
                  </div>
                </div>

                {/* Excel / Sheets */}
                <div className="p-2.5 rounded-[10px] bg-[var(--surface-alt)] flex items-center justify-between gap-2 text-[#6E6E73]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-200 text-[#6E6E73] shrink-0">
                      <X className="h-2.5 w-2.5" />
                    </span>
                    <span className="font-medium text-[#424245] shrink-0">Excel:</span>
                    <span className="truncate">{row.excel}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Vista Tablet/Desktop: Tabla Estructurada (>= md) ── */}
        <div className="hidden md:block overflow-x-auto rounded-[18px] border border-[var(--border-soft)] bg-[var(--surface)] shadow-xs">
          <table className="w-full text-left border-collapse min-w-[680px]">
            <thead>
              <tr className="border-b border-[var(--border-soft)] bg-[var(--surface-alt)]">
                <th className="py-5 px-6 text-sm font-bold text-[#1D1D1F] w-2/5">
                  Capacidades & Funcionalidades
                </th>
                <th className="py-5 px-6 text-sm font-bold text-[#0071E3] w-1/4 bg-[var(--accent-soft)]/40 border-x border-[var(--accent-border)]/40 relative">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" />
                    <span>NutriPro</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-[#0071E3] text-white px-2 py-0.5 rounded-full">
                      Superior
                    </span>
                  </div>
                </th>
                <th className="py-5 px-6 text-sm font-semibold text-[#424245] w-1/6">
                  Software Antiguo
                </th>
                <th className="py-5 px-6 text-sm font-semibold text-[#424245] w-1/6">
                  Excel / Sheets
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-soft)]">
              {comparisonRows.map((row, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-[var(--surface-cool)] transition-colors ${
                    row.highlight ? 'bg-[var(--surface-alt)]/30' : ''
                  }`}
                >
                  <td className="py-4 px-6 text-xs sm:text-sm font-medium text-[#1D1D1F]">
                    <div className="flex items-center gap-2">
                      <span>{row.feature}</span>
                      {row.badge && (
                        <span className="hidden lg:inline-block text-[10px] font-bold bg-[#0071E3]/10 text-[#0071E3] px-2 py-0.5 rounded-full">
                          {row.badge}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 bg-[var(--accent-soft)]/20 border-x border-[var(--accent-border)]/40 text-left">
                    {renderCellContent(row.nutripro, true)}
                  </td>
                  <td className="py-4 px-6 text-left">{renderCellContent(row.traditional)}</td>
                  <td className="py-4 px-6 text-left">{renderCellContent(row.excel)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

ComparisonTable.propTypes = {};
