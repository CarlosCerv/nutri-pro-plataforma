import PropTypes from 'prop-types';
import Logo from '../../components/Logo';

/**
 * Marco compartido de las tres pantallas públicas (cuestionario pre-consulta,
 * portal del paciente, agendamiento): las abre un paciente o un visitante sin
 * cuenta, nunca dentro de `AppLayout` (sin `Sidebar`/`Topbar` de la app).
 *
 * La barra superior es el único glassmorphism con el que se topa alguien que
 * nunca ve `Topbar.jsx` — mismo `blur(20px)` y superficie translúcida que la
 * skill define, para que el enlace que le llega por WhatsApp se sienta parte
 * de NutriPro y no una página suelta.
 */
export default function PublicPageShell({ eyebrow, children, maxWidth = 'max-w-xl' }) {
  return (
    <div className="min-h-[100dvh] bg-[var(--surface-alt)] font-sans">
      <header className="sticky top-0 z-10 border-b border-[var(--border-soft)] bg-[rgba(255,255,255,0.82)] px-4 py-3 backdrop-blur-[20px] backdrop-saturate-[180%] sm:px-6">
        <div className={`mx-auto flex items-center justify-between ${maxWidth}`}>
          <Logo size="sm" subtitle={eyebrow || null} />
        </div>
      </header>

      <main className={`mx-auto ${maxWidth} px-4 py-8 sm:px-6 sm:py-12`}>{children}</main>
    </div>
  );
}

PublicPageShell.propTypes = {
  eyebrow: PropTypes.string,
  children: PropTypes.node,
  maxWidth: PropTypes.string,
};
