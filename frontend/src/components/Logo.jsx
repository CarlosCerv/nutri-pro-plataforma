const MARK_SIZE = { sm: 28, md: 32, lg: 40 };

/**
 * Marca NutriPro alineada al icono en /public/brand-icon.svg
 * @param {{ size?: 'sm'|'md'|'lg', showText?: boolean, className?: string }} props
 */
const Logo = ({ size = 'md', showText = true, className = '' }) => {
  const px = MARK_SIZE[size] ?? MARK_SIZE.md;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src="/brand-icon.svg?v=6"
        width={px}
        height={px}
        alt=""
        className="rounded-[10px] shadow-sm ring-1 ring-black/[0.06]"
        decoding="async"
      />
      {showText && (
        <div className="text-left min-w-0">
          <div className="font-display font-semibold text-[var(--text-primary)] leading-none tracking-apple-tight text-[0.95rem] sm:text-base">
            NutriPro
          </div>
          <div className="mt-0.5 text-[0.62rem] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
            Plataforma clínica
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo;
