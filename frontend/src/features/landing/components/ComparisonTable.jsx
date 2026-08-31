import PropTypes from 'prop-types';
import { Check, X, Sparkles } from 'lucide-react';

/**
 * Tabla comparativa que contrasta NutriPro frente a Hojas de Cálculo (Excel)
 * y Software Tradicional, destacando las ventajas competitivas clínicas.
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
      feature: 'Experiencia visual moderna y fluida estilo Apple',
      nutripro: true,
      excel: false,
      traditional: false,
    },
  ];

  const renderCellContent = (val, isNutripro = false) => {
    if (val === true) {
      return (
        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-[var(--accent)] text-white shadow-2xs">
          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
        </span>
      );
    }
    if (val === false) {
      return (
        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-[var(--surface-alt)] text-[var(--ink-secondary)]">
          <X className="h-3.5 w-3.5" />
        </span>
      );
    }
    return (
      <span className={`text-xs sm:text-sm font-medium ${isNutripro ? 'text-[var(--accent)] font-semibold' : 'text-[var(--ink-muted)]'}`}>
        {val}
      </span>
    );
  };

  return (
    <section id="comparativa" className="py-20 md:py-28 bg-[var(--surface-cool)] border-y border-[var(--border-soft)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-3.5 py-1 text-xs font-semibold text-[var(--accent)] mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Comparativa Objetiva</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[var(--ink)] leading-tight text-balance">
            Por qué los mejores nutriólogos eligen NutriPro.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[var(--ink-secondary)] leading-relaxed font-normal">
            Compara la eficiencia clínica y el ahorro de tiempo frente a métodos tradicionales.
          </p>
        </div>

        {/* Contenedor de la Tabla */}
        <div className="overflow-x-auto rounded-[18px] border border-[var(--border-soft)] bg-[var(--surface)] shadow-xs">
          <table className="w-full text-left border-collapse min-w-[680px]">
            <thead>
              <tr className="border-b border-[var(--border-soft)] bg-[var(--surface-alt)]">
                <th className="py-5 px-6 text-sm font-semibold text-[var(--ink)] w-2/5">
                  Capacidades & Funcionalidades
                </th>
                <th className="py-5 px-6 text-sm font-semibold text-[var(--accent)] w-1/4 bg-[var(--accent-soft)]/40 border-x border-[var(--accent-border)]/40 relative">
                  <div className="flex items-center gap-1.5">
                    <span>NutriPro</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-[var(--accent)] text-white px-2 py-0.5 rounded-full">
                      Superior
                    </span>
                  </div>
                </th>
                <th className="py-5 px-6 text-sm font-semibold text-[var(--ink-secondary)] w-1/6">
                  Excel / Sheets
                </th>
                <th className="py-5 px-6 text-sm font-semibold text-[var(--ink-secondary)] w-1/6">
                  Software Antiguo
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-soft)]">
              {comparisonRows.map((row, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-[var(--surface-cool)] transition-colors ${row.highlight ? 'bg-[var(--surface-alt)]/30' : ''}`}
                >
                  <td className="py-4 px-6 text-xs sm:text-sm font-medium text-[var(--ink)]">
                    {row.feature}
                  </td>
                  <td className="py-4 px-6 bg-[var(--accent-soft)]/20 border-x border-[var(--accent-border)]/40 text-center sm:text-left">
                    {renderCellContent(row.nutripro, true)}
                  </td>
                  <td className="py-4 px-6 text-center sm:text-left">
                    {renderCellContent(row.excel)}
                  </td>
                  <td className="py-4 px-6 text-center sm:text-left">
                    {renderCellContent(row.traditional)}
                  </td>
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
