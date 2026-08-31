import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Logo from '../../components/Logo';

/**
 * Marco de las pantallas de acceso: panel de marca a la izquierda, formulario
 * a la derecha.
 *
 * Login y registro eran dos tarjetas centradas casi idénticas, cada una con
 * su propia sombra escrita a mano en un `style` inline —dos sombras que el
 * sistema no define— y con el mismo marcado duplicado. Aquí comparten marco,
 * así que dejan de poder divergir.
 *
 * El panel oscuro usa `--surface-dark`, que es un token del sistema, no un
 * modo oscuro: es la misma decisión que toma apple.com al alternar secciones
 * claras y oscuras dentro de una página clara.
 *
 * En móvil el panel se reduce a una cabecera con la marca; el formulario
 * ocupa la pantalla, que es lo único que importa en ese tamaño.
 */

const PUNTOS = [
  'Expedientes clínicos completos, con evolución y laboratorio',
  'Planes de alimentación con el catálogo SMAE',
  'Agenda con recordatorios automáticos por correo',
];

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-[100dvh] w-full bg-[var(--surface)] font-sans lg:grid lg:grid-cols-[minmax(0,44%)_minmax(0,56%)]">
      {/* Panel de marca */}
      <aside className="relative flex flex-col justify-between overflow-hidden bg-[var(--surface-dark)] px-6 py-8 sm:px-10 lg:px-12 lg:py-14">
        {/* Halo del acento. Decorativo y muy tenue: la marca la carga la
            tipografía, no un degradado de fondo. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full opacity-[0.16] blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }}
        />

        <div className="relative">
          <Link to="/login" className="inline-block rounded-[var(--radius-s)]">
            <Logo size="lg" tone="onDark" subtitle={null} />
          </Link>
        </div>

        <div className="relative mt-10 hidden lg:block">
          <h2
            className="max-w-[15ch] text-white"
            style={{ fontSize: '34px', lineHeight: '42px', fontWeight: 600, letterSpacing: '-0.374px' }}
          >
            La consulta de nutrición, ordenada.
          </h2>

          <ul className="mt-8 space-y-4">
            {PUNTOS.map((punto) => (
              <li key={punto} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"
                />
                <span
                  className="text-white/70"
                  style={{ fontSize: '17px', lineHeight: '25px', letterSpacing: '-0.374px' }}
                >
                  {punto}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative mt-8 hidden text-xs text-white/40 lg:block">
          © {new Date().getFullYear()} NutriPro
        </p>
      </aside>

      {/* Formulario */}
      <main className="flex items-center justify-center px-5 py-12 sm:px-8 lg:px-12 lg:py-14">
        <div className="w-full max-w-[420px] animate-fade-up">
          <header className="mb-8">
            <h1
              className="text-[var(--ink)]"
              style={{ fontSize: '34px', lineHeight: '42px', fontWeight: 600, letterSpacing: '-0.374px' }}
            >
              {title}
            </h1>
            {subtitle ? (
              <p
                className="mt-2 text-[var(--ink-muted)]"
                style={{ fontSize: '17px', lineHeight: '25px', letterSpacing: '-0.374px' }}
              >
                {subtitle}
              </p>
            ) : null}
          </header>

          {children}

          {footer ? <div className="mt-8">{footer}</div> : null}

          <p className="mt-12 text-xs text-[var(--ink-secondary)] lg:hidden">
            © {new Date().getFullYear()} NutriPro
          </p>
        </div>
      </main>
    </div>
  );
}

AuthLayout.propTypes = {
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.node,
  children: PropTypes.node,
  footer: PropTypes.node,
};
