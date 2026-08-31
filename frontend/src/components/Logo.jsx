import PropTypes from 'prop-types';

const MARK_SIZE = { sm: 28, md: 34, lg: 44 };

/**
 * Marca NutriPro.
 *
 * El wordmark sigue la regla de marca de la skill: peso 700, tracking
 * -0.4px, "Nutri" en el acento y "Pro" en la tinta. Antes iba entero en un
 * solo color y con peso 600, que es el del cuerpo de texto: la marca no se
 * distinguia de un titulo cualquiera.
 *
 * `tone="onDark"` invierte la tinta para el panel oscuro de la pantalla de
 * acceso. En ese fondo el acento queda en 3.6:1 —suficiente para texto grande
 * pero no para texto normal—, asi que ahi el wordmark va entero en blanco.
 */
const Logo = ({ size = 'md', showText = true, tone = 'default', subtitle = 'Plataforma clínica', className = '' }) => {
  const px = MARK_SIZE[size] ?? MARK_SIZE.md;
  const onDark = tone === 'onDark';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src="/brand-icon.svg?v=6"
        width={px}
        height={px}
        alt=""
        className="rounded-[22.5%] ring-1 ring-black/[0.06]"
        decoding="async"
      />
      {showText && (
        <div className="min-w-0 text-left">
          <div
            className="font-display text-[1.05rem] font-bold leading-none"
            style={{ letterSpacing: '-0.4px' }}
          >
            <span className={onDark ? 'text-white' : 'text-[var(--accent)]'}>Nutri</span>
            <span className={onDark ? 'text-white' : 'text-[var(--ink)]'}>Pro</span>
          </div>
          {subtitle ? (
            <div
              className={`mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.08em] ${
                onDark ? 'text-white/55' : 'text-[var(--ink-secondary)]'
              }`}
            >
              {subtitle}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

Logo.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showText: PropTypes.bool,
  tone: PropTypes.oneOf(['default', 'onDark']),
  subtitle: PropTypes.node,
  className: PropTypes.string,
};

export default Logo;
