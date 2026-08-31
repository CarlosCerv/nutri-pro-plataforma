/**
 * Humo del enrutado y de las redirecciones.
 *
 * La reestructuración del menú movió cinco secciones y convirtió ocho URLs en
 * redirecciones. Un enlace guardado que ahora apunta a `Navigate` mal escrito
 * no rompe el build ni el lint: falla solo en el navegador. Estas pruebas son
 * la red para eso.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { LEGACY_REDIRECTS } from '../lib/redirects';

// Se prueba la tabla real que consume `App.jsx`, no una copia: un test que
// repite la lista de rutas solo comprueba lo que su autor creía que decía el
// router. `/` y `*` se añaden aquí porque en App.jsx son rutas sueltas.
const REDIRECCIONES = { ...LEGACY_REDIRECTS, '/': '/dashboard' };

const Sonda = () => {
  const { pathname } = useLocation();
  return <div data-testid="ruta">{pathname}</div>;
};

const Arbol = ({ inicial }) => (
  <MemoryRouter initialEntries={[inicial]}>
    <Routes>
      {Object.entries(REDIRECCIONES).map(([desde, hacia]) => (
        <Route key={desde} path={desde} element={<Navigate to={hacia} replace />} />
      ))}
      <Route path="*" element={<Sonda />} />
    </Routes>
  </MemoryRouter>
);

describe('Redirecciones de rutas heredadas', () => {
  it.each(Object.entries(REDIRECCIONES))('%s lleva a %s', (desde, hacia) => {
    render(<Arbol inicial={desde} />);
    expect(screen.getByTestId('ruta')).toHaveTextContent(hacia);
  });

  it('ninguna redirección apunta a una ruta retirada', () => {
    const retiradas = ['/alimentos', '/calculos', '/reportes', '/admin', '/dietas/catalogo', '/reportes-poblacionales'];
    for (const destino of Object.values(REDIRECCIONES)) {
      expect(retiradas).not.toContain(destino);
    }
  });

  it('ninguna redirección es circular', () => {
    for (const [desde, hacia] of Object.entries(REDIRECCIONES)) {
      expect(hacia).not.toBe(desde);
      expect(REDIRECCIONES[hacia]).toBeUndefined();
    }
  });
});

describe('Menú lateral', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('todos sus destinos son rutas vivas, no redirecciones', async () => {
    vi.doMock('../contexts/AuthContext', () => ({
      useAuth: () => ({ user: { name: 'Test', email: 't@t.mx', role: 'nutritionist' }, logout: vi.fn() }),
    }));

    const { default: Sidebar } = await import('../design-system/components/Sidebar.jsx');
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Sidebar mobileOpen={false} onClose={vi.fn()} />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Panel')).toBeInTheDocument());

    const destinos = Array.from(document.querySelectorAll('a[href]')).map((a) => a.getAttribute('href'));
    const delMenu = destinos.filter((h) => h && h.startsWith('/'));

    expect(delMenu.length).toBeGreaterThan(0);
    for (const href of delMenu) {
      expect(REDIRECCIONES[href]).toBeUndefined();
    }
  });
});
