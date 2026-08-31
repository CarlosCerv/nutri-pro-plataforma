import { useState } from 'react';
import PropTypes from 'prop-types';
import { Menu, X, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Barra de navegación superior fija para la Landing Page de NutriPro.
 * Aplica el efecto de vidrio esmerilado (glassmorphism), con
 * navegación anclada suave y botones de acción tipo píldora.
 */
export default function LandingNavbar({ onCtaClick }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Características', href: '#caracteristicas' },
    { label: 'Comparativa', href: '#comparativa' },
    { label: 'Calculadora ROI', href: '#calculadora-roi' },
    { label: 'Precios', href: '#precios' },
    { label: 'Preguntas', href: '#faq' },
  ];

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      const navHeight = 64;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-soft)]/60 bg-[rgba(255,255,255,0.82)] backdrop-blur-xl transition-all duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Marca / Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 transition-transform duration-200 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-lg p-1"
          aria-label="NutriPro Inicio"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--accent)] shadow-sm">
            <svg
              viewBox="0 0 128 128"
              className="h-5 w-5 text-white fill-none stroke-current"
              style={{ strokeWidth: 13, strokeLinecap: 'round', strokeLinejoin: 'round' }}
            >
              <path d="M 42 90 L 42 38 L 86 90 L 86 38" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-[var(--ink)]">
            <span className="text-[var(--accent)]">Nutri</span>Pro
          </span>
        </Link>

        {/* Enlaces de Navegación de Escritorio */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Navegación principal">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="text-[14px] font-medium text-[var(--ink-secondary)] hover:text-[var(--ink)] transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTAs de Escritorio */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="text-[14px] font-medium text-[var(--ink-muted)] hover:text-[var(--ink)] px-4 py-2 rounded-full transition-colors duration-200"
          >
            Iniciar Sesión
          </Link>
          <Link
            to="/register"
            onClick={onCtaClick}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-5 py-2.5 text-[14px] font-semibold text-white shadow-sm hover:bg-[var(--accent-hover)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>Prueba Gratis 14 Días</span>
          </Link>
        </div>

        {/* Botón Menú Móvil */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center p-2 rounded-full text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-alt)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Menú Desplegable Móvil */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[var(--border-soft)] bg-[var(--surface)] px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="px-3 py-2.5 rounded-lg text-[15px] font-medium text-[var(--ink)] hover:bg-[var(--surface-alt)] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-3 border-t border-[var(--border-soft)] flex flex-col gap-2.5">
            <Link
              to="/login"
              className="w-full text-center py-2.5 text-[15px] font-medium text-[var(--ink-muted)] rounded-full hover:bg-[var(--surface-alt)]"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/register"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onCtaClick) onCtaClick();
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] py-3 text-[15px] font-semibold text-white shadow-sm hover:bg-[var(--accent-hover)]"
            >
              <span>Comenzar Prueba Gratis</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

LandingNavbar.propTypes = {
  onCtaClick: PropTypes.func,
};
