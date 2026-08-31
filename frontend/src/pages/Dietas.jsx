import { Link, Outlet, useLocation } from 'react-router-dom';
import Tabs from '../design-system/components/Tabs.jsx';

/**
 * Contenedor de la sección de dietas.
 *
 * Antes, "Dietas", "Plantillas" y "Alimentos" eran tres destinos de primer
 * nivel del menú. Los dos últimos son material de apoyo para construir un
 * plan, no lugares donde se trabaja: viven aquí como pestañas para que el
 * menú deje de ofrecer tres puertas a la misma tarea.
 */
const TABS = [
  { id: '/dietas', label: 'Planes' },
  { id: '/dietas/plantillas', label: 'Plantillas' },
  { id: '/dietas/alimentos', label: 'Alimentos' },
];

export default function Dietas() {
  const { pathname } = useLocation();
  const active = TABS.slice().reverse().find((t) => pathname.startsWith(t.id))?.id || '/dietas';

  return (
    <div className="space-y-6 animate-fade-up">
      <Tabs
        items={TABS}
        value={active}
        ariaLabel="Secciones de dietas"
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
