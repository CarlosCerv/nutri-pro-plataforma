import { Link, Outlet, useLocation } from 'react-router-dom';
import Tabs from '../design-system/components/Tabs.jsx';

/**
 * Contenedor de herramientas de apoyo clínico.
 *
 * Reemplaza tres entradas del menú: "Calculadoras", "Reportes PDF" y
 * "Estadísticas". La primera no calculaba nada (mostraba una segunda tabla de
 * alimentos), y la de reportes solo duplicaba una exportación a PDF que ya
 * funciona donde de verdad se usa, dentro de cada plan y de cada expediente.
 */
const TABS = [
  { id: '/herramientas', label: 'Calculadoras' },
  { id: '/herramientas/estadisticas', label: 'Estadísticas' },
];

export default function Herramientas() {
  const { pathname } = useLocation();
  const active = TABS.slice().reverse().find((t) => pathname.startsWith(t.id))?.id || '/herramientas';

  return (
    <div className="space-y-6 animate-fade-up">
      <Tabs
        items={TABS}
        value={active}
        ariaLabel="Herramientas"
        renderItem={({ item, className, content }) => (
          <Link key={item.id} to={item.id} className={className} role="tab" aria-selected={item.id === active}>
            {content}
          </Link>
        )}
      />
      <Outlet />
    </div>
  );
}
