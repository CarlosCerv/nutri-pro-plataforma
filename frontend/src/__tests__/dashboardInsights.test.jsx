/**
 * El panel distingue "fallo" de "sin datos".
 *
 * Las cuatro secciones se pedian con `.catch(() => ({ data: { data: [] } }))`,
 * asi que un 500 se pintaba igual que una consulta recien creada sin
 * pacientes: grafica en blanco y ninguna señal. Estas pruebas fijan esa
 * diferencia, que es justo la que no se ve mirando la pantalla.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// `vi.hoisted` es necesario: `vi.mock` se iza por encima de las declaraciones
// del modulo, asi que una fabrica que capture un `const` normal se evaluaria
// antes de que ese `const` exista.
const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('../services/api', () => ({ default: { get } }));

import DashboardInsights from '../components/Dashboard/DashboardInsights.jsx';

const SECCIONES = 4;
const pintar = () =>
  render(
    <MemoryRouter>
      <DashboardInsights />
    </MemoryRouter>
  );

describe('Panel: fallo frente a vacio', () => {
  it('una respuesta vacia NO es un error', async () => {
    get.mockResolvedValue({ data: { data: [] } });
    pintar();

    await waitFor(() => expect(screen.getByText('No hay datos de peso disponibles')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /reintentar/i })).not.toBeInTheDocument();
  });

  it('el servidor sin responder muestra error, no una grafica vacia', async () => {
    // Sin `response`: la peticion nunca llego al servidor.
    get.mockRejectedValue(Object.assign(new Error('Network Error'), { isAxiosError: true }));
    pintar();

    await waitFor(() =>
      expect(screen.getAllByText(/No se pudo conectar con el servidor/i)).toHaveLength(SECCIONES)
    );
    expect(screen.queryByText('No hay datos de peso disponibles')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /reintentar/i })).toHaveLength(SECCIONES);
  });

  it('un 500 muestra error', async () => {
    get.mockRejectedValue({ isAxiosError: true, response: { status: 500, data: {} } });
    pintar();

    await waitFor(() =>
      expect(screen.getAllByText(/El servidor tuvo un problema/i)).toHaveLength(SECCIONES)
    );
  });

  it('una seccion caida no tumba a las demas', async () => {
    get.mockImplementation((url) =>
      url.includes('weight-data')
        ? Promise.reject({ isAxiosError: true, response: { status: 500, data: {} } })
        : Promise.resolve({
            data: { data: url.includes('macro-data') ? [{ name: 'Proteína', valor: 30 }] : [] },
          })
    );
    pintar();

    // La seccion rota avisa...
    await waitFor(() => expect(screen.getAllByText(/El servidor tuvo un problema/i)).toHaveLength(1));
    // ...y la que respondio bien sigue pintando sus datos.
    expect(screen.getByText('Proteína')).toBeInTheDocument();
  });
});
