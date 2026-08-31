import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Barra flotante inferior fija para dispositivos móviles (< 768px).
 * Aparece suavemente al hacer scroll más allá del Hero para mantener
 * una conversión de alta intención con fricción cero.
 */
export default function MobileStickyCta({ onCtaClick }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Mostrar la barra después de desplazarse 360px (aproximadamente el Hero)
      const currentScrollY = window.scrollY;
      if (currentScrollY > 360) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Acción rápida de registro"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-[var(--border-soft)]/70 bg-[rgba(255,255,255,0.88)] backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 animate-in slide-in-from-bottom-5 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto flex items-center justify-between gap-3 max-w-md">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-[var(--ink)] flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
            <span>NutriPro Clínico</span>
          </span>
          <span className="text-[11px] text-[var(--ink-secondary)]">Prueba 14 días gratis</span>
        </div>

        <Link
          to="/register"
          onClick={onCtaClick}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0071E3] hover:bg-[#0077ED] active:scale-[0.98] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm min-h-[44px] shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2 transition-all"
        >
          <span>Probar gratis</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </aside>
  );
}

MobileStickyCta.propTypes = {
  onCtaClick: PropTypes.func,
};
