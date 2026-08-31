import PropTypes from 'prop-types';
import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Pie de página minimalista para la Landing Page de NutriPro.
 * Incluye soporte para safe-area-inset-bottom y espacio adicional
 * para no solaparse con la barra flotante móvil (MobileStickyCta).
 */
export default function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border-soft)] bg-[var(--surface)] text-[#6E6E73] pt-14 pb-[max(5rem,calc(env(safe-area-inset-bottom)+3.5rem))] px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 pb-12 border-b border-[var(--border-soft)]/70">
          {/* Columna 1: Marca & Misión */}
          <div className="space-y-4 sm:col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 inline-block">
              <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#0071E3] shadow-xs">
                <svg
                  viewBox="0 0 128 128"
                  className="h-4 w-4 text-white fill-none stroke-current"
                  style={{ strokeWidth: 13, strokeLinecap: 'round', strokeLinejoin: 'round' }}
                >
                  <path d="M 42 90 L 42 38 L 86 90 L 86 38" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-[#1D1D1F]">
                <span className="text-[#0071E3]">Nutri</span>Pro
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-[#6E6E73]">
              El software clínico todo-en-uno que moderniza la práctica de nutricionistas y dietistas en México y Latinoamérica.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#1B7F3A] font-semibold bg-[#1B7F3A]/10 px-3 py-1.5 rounded-full w-fit">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>Normativa Clínica y Datos Cifrados</span>
            </div>
          </div>

          {/* Columna 2: Producto */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1D1D1F] block mb-4">
              Producto
            </span>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#caracteristicas" className="hover:text-[#1D1D1F] transition-colors py-1 inline-block">
                  Constructor de Dietas SMAE
                </a>
              </li>
              <li>
                <a href="#caracteristicas" className="hover:text-[#1D1D1F] transition-colors py-1 inline-block">
                  Antropometría ISAK
                </a>
              </li>
              <li>
                <a href="#caracteristicas" className="hover:text-[#1D1D1F] transition-colors py-1 inline-block">
                  Recordatorios por SMS y Email
                </a>
              </li>
              <li>
                <a href="#caracteristicas" className="hover:text-[#1D1D1F] transition-colors py-1 inline-block">
                  Expediente Clínico SOAP
                </a>
              </li>
              <li>
                <a href="#precios" className="hover:text-[#1D1D1F] transition-colors py-1 inline-block">
                  Planes y Precios
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 3: Herramientas Clínicas */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1D1D1F] block mb-4">
              Recursos
            </span>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#calculadora-roi" className="hover:text-[#1D1D1F] transition-colors py-1 inline-block">
                  Calculadora ROI para Consultorios
                </a>
              </li>
              <li>
                <a href="#comparativa" className="hover:text-[#1D1D1F] transition-colors py-1 inline-block">
                  NutriPro vs. Métodos Tradicionales
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-[#1D1D1F] transition-colors py-1 inline-block">
                  Preguntas Frecuentes
                </a>
              </li>
              <li>
                <Link to="/register" className="text-[#0071E3] font-semibold hover:underline py-1 inline-block">
                  Prueba Gratuita de 14 Días
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Accesos Rápidos */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1D1D1F] block mb-4">
              Acceso a la Plataforma
            </span>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/login" className="hover:text-[#1D1D1F] transition-colors py-1 inline-block">
                  Iniciar Sesión
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-[#1D1D1F] transition-colors py-1 inline-block">
                  Registrar Consultorio
                </Link>
              </li>
              <li>
                <span className="text-[#6E6E73] block mt-4">
                  Soporte clínico:{' '}
                  <a href="mailto:soporte@nutripro.lat" className="text-[#0071E3] hover:underline">
                    soporte@nutripro.lat
                  </a>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Barra Inferior */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6E6E73]">
          <div>
            &copy; {currentYear} NutriPro Technologies. Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-[#1D1D1F] transition-colors cursor-pointer">
              Privacidad y Seguridad
            </span>
            <span className="hover:text-[#1D1D1F] transition-colors cursor-pointer">
              Términos del Servicio
            </span>
            <span className="hover:text-[#1D1D1F] transition-colors cursor-pointer">
              Cumplimiento NOM-004
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

LandingFooter.propTypes = {};
