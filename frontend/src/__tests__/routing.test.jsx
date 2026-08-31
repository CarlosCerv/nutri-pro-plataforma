/**
 * Humo del enrutado y de las redirecciones.
 *
 * La reestructuración del menú movió cinco secciones y convirtió ocho URLs en
 * redirecciones. Un enlace guardado que ahora apunta a `Navigate` mal escrito
 * no rompe el build ni el lint: falla solo en el navegador. Estas pruebas son
 * la red para eso.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cwd } from 'node:process';

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

/**
 * Rutas realmente declaradas en `App.jsx`.
 *
 * Se leen del archivo fuente en vez de reconstruir el árbol: las pruebas de
 * arriba montan una copia del router hecha a partir de la tabla de
 * redirecciones, así que nunca tocan el `<Routes>` de verdad. Ese hueco dejó
 * pasar `/finanzas` y `/perfil`, que se importaban como página pero no se
 * montaban como ruta: caían en el comodín `*` y rebotaban al panel.
 */
const FUENTE_APP = readFileSync(resolve(cwd(), 'src/App.jsx'), 'utf-8');
const RUTAS_DECLARADAS = [...FUENTE_APP.matchAll(/path="([^"]+)"/g)].map((m) => m[1]);

describe('Menú lateral', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  const destinos = async () => {
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

    return Array.from(document.querySelectorAll('a[href]'))
      .map((a) => a.getAttribute('href'))
      .filter((h) => h && h.startsWith('/'));
  };

  it('cada destino está declarado como ruta en App.jsx', async () => {
    const delMenu = await destinos();
    expect(delMenu.length).toBeGreaterThan(0);

    for (const href of delMenu) {
      expect(RUTAS_DECLARADAS, `"${href}" está en el menú pero no tiene <Route> en App.jsx`).toContain(href);
    }
  });

  it('ningún destino es una redirección', async () => {
    for (const href of await destinos()) {
      expect(REDIRECCIONES[href]).toBeUndefined();
    }
  });
});

describe('Tabla de rutas de App.jsx', () => {
  it('no declara dos veces la misma ruta', () => {
    const vistas = new Set();
    const repetidas = RUTAS_DECLARADAS.filter((r) => (vistas.has(r) ? true : (vistas.add(r), false)));
    expect(repetidas).toEqual([]);
  });

  it('toda página importada se monta como ruta', () => {
    const importadas = [...FUENTE_APP.matchAll(/const (\w+) = lazy\(/g)].map((m) => m[1]);
    const usadas = new Set([...FUENTE_APP.matchAll(/<(\w+)\s*\/>/g)].map((m) => m[1]));

    const huerfanas = importadas.filter((nombre) => !usadas.has(nombre));
    expect(huerfanas, `importadas en App.jsx pero nunca renderizadas: ${huerfanas.join(', ')}`).toEqual([]);
  });
});
