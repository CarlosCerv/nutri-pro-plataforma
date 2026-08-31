import { useEffect } from 'react';
import PropTypes from 'prop-types';
import LandingNavbar from './components/LandingNavbar';
import LandingHero from './components/LandingHero';
import BentoGrid from './components/BentoGrid';
import ComparisonTable from './components/ComparisonTable';
import RoiCalculator from './components/RoiCalculator';
import PricingSection from './components/PricingSection';
import LandingFooter from './components/LandingFooter';

/**
 * Componente principal de la Landing Page Oficial de NutriPro.
 * Estructurado de forma 100% autocontenida y aislada en `src/features/landing/`,
 * cumpliendo con el sistema de diseño estricto `apple-style-frontend`.
 */
export default function LandingView({ onCtaClick }) {
  useEffect(() => {
    // Título de la página optimizado para la experiencia de la Landing
    const previousTitle = document.title;
    document.title = 'NutriPro — Software Clínico para Nutriólogos y Nutricionistas';

    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--ink)] font-sans antialiased selection:bg-[var(--accent-soft)] selection:text-[var(--accent)]">
      {/* Barra de navegación fija */}
      <LandingNavbar onCtaClick={onCtaClick} />

      {/* Contenido principal */}
      <main id="main-landing-content">
        <LandingHero onPrimaryCtaClick={onCtaClick} />
        <BentoGrid />
        <ComparisonTable />
        <RoiCalculator onCtaClick={onCtaClick} />
        <PricingSection onPlanSelect={onCtaClick} />
      </main>

      {/* Pie de página */}
      <LandingFooter />
    </div>
  );
}

LandingView.propTypes = {
  onCtaClick: PropTypes.func,
};
