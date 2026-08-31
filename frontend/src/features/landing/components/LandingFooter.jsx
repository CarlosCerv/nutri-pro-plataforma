import PropTypes from 'prop-types';
import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Pie de página minimalista para la Landing Page de NutriPro.
 * Sigue la jerarquía de texto y márgenes del sistema de diseño Apple.
 */
export default function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border-soft)] bg-[var(--surface)] text-[var(--ink-secondary)] py-14 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[var(--border-soft)]/70">
          {/* Columna 1: Marca y Misión */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 inline-flex" aria-label="NutriPro">
              <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[var(--accent)] text-white shadow-xs">
                <svg
                  viewBox="0 0 128 128"
                  className="h-4 w-4 text-white fill-none stroke-current"
                  style={{ strokeWidth: 13, strokeLinecap: 'round', strokeLinejoin: 'round' }}
                >
                  <path d="M 42 90 L 42 38 L 86 90 L 86 38" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-[var(--ink)]">
                <span className="text-[var(--accent)]">Nutri</span>Pro
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-[var(--ink-secondary)]">
              La plataforma SaaS clínica diseñada para transformar y escalar la práctica privada de nutricionistas en toda Iberoamérica.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-[var(--success)] font-medium">
              <ShieldCheck className="h-4 w-4" />
              <span>Cifrado SSL y Datos Médicos Protegidos</span>
            </div>
          </div>

          {/* Columna 2: Producto */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--ink)] mb-3.5">
              Producto
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#caracteristicas" className="hover:text-[var(--ink)] transition-colors">
                  Constructor de Dietas Drag & Drop
                </a>
              </li>
              <li>
                <a href="#caracteristicas" className="hover:text-[var(--ink)] transition-colors">
                  Antropometría y Protocolo ISAK
                </a>
              </li>
              <li>
                <a href="#caracteristicas" className="hover:text-[var(--ink)] transition-colors">
                  Recordatorios por SMS y Email
                </a>
              </li>
              <li>
                <a href="#caracteristicas" className="hover:text-[var(--ink)] transition-colors">
                  Notas de Evolución SOAP
                </a>
              </li>
              <li>
                <a href="#precios" className="hover:text-[var(--ink)] transition-colors">
                  Planes y Precios
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 3: Herramientas Clínicas */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--ink)] mb-3.5">
              Herramientas
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#calculadora-roi" className="hover:text-[var(--ink)] transition-colors">
                  Calculadora ROI para Consultorios
                </a>
              </li>
              <li>
                <Link to="/login" className="hover:text-[var(--ink)] transition-colors">
                  Calculadoras TMB / Harris-Benedict
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-[var(--ink)] transition-colors">
                  Estadísticas Poblacionales OMS
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-[var(--ink)] transition-colors">
                  Catálogo de Equivalentes SMAE
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Accesos */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--ink)] mb-3.5">
              Acceso a la Plataforma
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/login" className="hover:text-[var(--ink)] transition-colors font-medium text-[var(--accent)]">
                  Iniciar Sesión
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-[var(--ink)] transition-colors">
                  Registro de Nutriólogo
                </Link>
              </li>
              <li>
                <a href="#faq" className="hover:text-[var(--ink)] transition-colors">
                  Centro de Ayuda / FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Barra Inferior */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[var(--ink-secondary)]">
          <div>
            © {currentYear} NutriPro Technologies. Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-[var(--ink)] cursor-pointer transition-colors">Privacidad</span>
            <span className="hover:text-[var(--ink)] cursor-pointer transition-colors">Términos</span>
            <span className="hover:text-[var(--ink)] cursor-pointer transition-colors">Seguridad Clínica</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

LandingFooter.propTypes = {};
