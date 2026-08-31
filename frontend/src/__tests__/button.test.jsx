/**
 * `Button` como enlace.
 *
 * Buena parte de los botones de la aplicacion son navegacion («Nuevo
 * paciente», «Agendar cita»), y hasta ahora se escribian como
 * `<Link className="btn btn-primary">` a mano porque el componente solo sabia
 * emitir `<button>`. Estas pruebas fijan que el ancla siga siendo un ancla:
 * lo que se pierde al convertirla en boton —abrir en pestaña nueva, copiar la
 * direccion, el anuncio del lector de pantalla— no se ve en la pantalla.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Button from '../design-system/components/Button.jsx';

const conRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('Button', () => {
  it('por omision es un boton de tipo button', () => {
    render(<Button>Guardar</Button>);
    const b = screen.getByRole('button', { name: 'Guardar' });
    expect(b.tagName).toBe('BUTTON');
    expect(b).toHaveAttribute('type', 'button');
  });

  it('con as={Link} es un enlace navegable, no un boton', () => {
    conRouter(
      <Button as={Link} to="/pacientes/nuevo">
        Nuevo paciente
      </Button>
    );

    const enlace = screen.getByRole('link', { name: 'Nuevo paciente' });
    expect(enlace.tagName).toBe('A');
    expect(enlace).toHaveAttribute('href', '/pacientes/nuevo');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('conserva las clases de variante y tamaño al ser enlace', () => {
    conRouter(
      <Button as={Link} to="/agenda" variant="outline" size="sm" className="gap-2">
        Ver agenda
      </Button>
    );

    const enlace = screen.getByRole('link', { name: 'Ver agenda' });
    expect(enlace.className).toContain('btn');
    expect(enlace.className).toContain('btn-outline');
    expect(enlace.className).toContain('btn-sm');
    expect(enlace.className).toContain('gap-2');
  });

  it('un enlace no emite type ni disabled, que no son validos en un ancla', () => {
    conRouter(
      <Button as={Link} to="/x" disabled>
        Ir
      </Button>
    );

    const enlace = screen.getByRole('link', { name: 'Ir' });
    expect(enlace).not.toHaveAttribute('type');
    expect(enlace).not.toHaveAttribute('disabled');
    expect(enlace).toHaveAttribute('aria-disabled', 'true');
  });

  it('el boton deshabilitado si usa disabled', () => {
    render(<Button disabled>Guardar</Button>);
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled();
  });

  it('loading deshabilita y marca aria-busy', () => {
    render(<Button loading>Guardar</Button>);
    const b = screen.getByRole('button', { name: 'Guardar' });
    expect(b).toBeDisabled();
    expect(b).toHaveAttribute('aria-busy', 'true');
  });
});
