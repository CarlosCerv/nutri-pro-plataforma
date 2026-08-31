import PropTypes from 'prop-types';
import { Check, X, ShieldAlert, Sparkles } from 'lucide-react';

/**
 * Tabla comparativa responsiva que contrasta NutriPro frente a Hojas de Cálculo (Excel)
 * y Software Tradicional/Antiguo. Diseñada para Mobile-First:
 * - En Desktop: Tabla completa con columna destacada
 * - En Mobile: Tarjetas apiladas de contraste por funcionalidad con indicadores claros
 */
export default function ComparisonTable() {
  const comparisonRows = [
    {
      feature: 'Tiempo promedio para armar una dieta semanal',
      nutripro: '5 a 8 minutos (Drag & Drop interactivo)',
      excel: '45 a 60 minutos (Copia y pega manual)',
      traditional: '20 a 30 minutos (Listas rígidas)',
      highlight: true,
    },
    {
      feature: 'Cálculo instantáneo de Macros y Kcal en vivo',
      nutripro: true,
      excel: 'Fórmulas manuales propensas a error',
      traditional: true,
    },
    {
      feature: 'Catálogo oficial del SMAE integrado con búsqueda',
      nutripro: true,
      excel: false,
      traditional: 'Incompleto o desactualizado',
    },
    {
      feature: 'Antropometría ISAK y Bioimpedancia integrada',
      nutripro: true,
      excel: false,
      traditional: 'Limitado o solo peso/talla',
    },
    {
      feature: 'Recordatorios automáticos de citas por SMS y Email',
      nutripro: true,
      excel: false,
      traditional: 'Requiere plugins o costo extra',
    },
    {
      feature: 'Expediente clínico formal con notas SOAP y Laboratorio',
      nutripro: true,
      excel: 'Disperso en archivos de Word/PDF',
      traditional: 'Formularios lentos y complejos',
    },
    {
      feature: 'Analítica poblacional de pacientes bajo cortes OMS',
      nutripro: true,
      excel: false,
      traditional: false,
    },
    {
      feature: 'Control de cobros y finanzas de la consulta',
      nutripro: true,
      excel: 'Requiere otra hoja separada',
      traditional: false,
    },
    {
      feature: 'Generación y exportación de planes a PDF profesional',
      nutripro: true,
      excel: 'Desalineado y poco estético',
      traditional: 'Plantillas genéricas',
    },
    {
      feature: 'Experiencia visual moderna y fluida',
      nutripro: true,
      excel: false,
      traditional: false,
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
        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-[var(--surface-alt)] text-[#6E6E73]">
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

        {/* ── Vista Móvil: Tarjetas de Contraste Apiladas (< 768px) ── */}
        <div className="md:hidden space-y-4">
          {comparisonRows.map((row, idx) => (
            <div
              key={idx}
              className={`rounded-[16px] border bg-[var(--surface)] p-4 shadow-2xs ${
                row.highlight ? 'border-[#0071E3]/40 ring-1 ring-[#0071E3]/20' : 'border-[var(--border-soft)]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-sm font-bold text-[#1D1D1F]">{row.feature}</span>
                {row.highlight && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#0071E3] text-white px-2 py-0.5 rounded-full shrink-0">
                    Clave
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs">
                {/* NutriPro */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0071E3]/10 border border-[#0071E3]/20">
                  <span className="font-semibold text-[#0071E3] flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>NutriPro</span>
                  </span>
                  <div className="text-right">{renderCellContent(row.nutripro, true)}</div>
                </div>

                {/* Excel */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--surface-alt)]">
                  <span className="text-[#424245] font-medium">Excel / Sheets</span>
                  <div className="text-right">{renderCellContent(row.excel)}</div>
                </div>

                {/* Software Antiguo */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--surface-alt)]">
                  <span className="text-[#424245] font-medium">Software Tradicional</span>
                  <div className="text-right">{renderCellContent(row.traditional)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Vista Tablet/Desktop: Tabla Estructurada (>= 768px) ── */}
        <div className="hidden md:block overflow-x-auto rounded-[18px] border border-[var(--border-soft)] bg-[var(--surface)] shadow-xs">
          <table className="w-full text-left border-collapse min-w-[680px]">
            <thead>
              <tr className="border-b border-[var(--border-soft)] bg-[var(--surface-alt)]">
                <th className="py-5 px-6 text-sm font-bold text-[#1D1D1F] w-2/5">
                  Capacidades & Funcionalidades
                </th>
                <th className="py-5 px-6 text-sm font-bold text-[#0071E3] w-1/4 bg-[var(--accent-soft)]/40 border-x border-[var(--accent-border)]/40 relative">
                  <div className="flex items-center gap-1.5">
                    <span>NutriPro</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-[#0071E3] text-white px-2 py-0.5 rounded-full">
                      Superior
                    </span>
                  </div>
                </th>
                <th className="py-5 px-6 text-sm font-semibold text-[#424245] w-1/6">
                  Excel / Sheets
                </th>
                <th className="py-5 px-6 text-sm font-semibold text-[#424245] w-1/6">
                  Software Antiguo
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
                    {row.feature}
                  </td>
                  <td className="py-4 px-6 bg-[var(--accent-soft)]/20 border-x border-[var(--accent-border)]/40 text-left">
                    {renderCellContent(row.nutripro, true)}
                  </td>
                  <td className="py-4 px-6 text-left">{renderCellContent(row.excel)}</td>
                  <td className="py-4 px-6 text-left">{renderCellContent(row.traditional)}</td>
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
