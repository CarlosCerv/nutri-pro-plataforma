/**
 * AddFoodPanel reemplaza el Combobox por tiempo de comida (buscaba solo por
 * substring exacto sobre alimentos precargados, siempre agregaba a 100 g) por
 * un panel único: búsqueda contra el servidor, cantidad elegible al agregar,
 * alimentos recientes de este plan, y alta de un alimento nuevo sin salir del
 * flujo. Estas pruebas fijan ese contrato.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { getAll } = vi.hoisted(() => ({ getAll: vi.fn() }));
vi.mock('../services/api', () => ({ foodsAPI: { getAll } }));

import AddFoodPanel from '../components/MenuBuilder/AddFoodPanel.jsx';

const pollo = { _id: 'f1', name: 'Pechuga de Pollo', category: 'proteins', nutrition: { energy: 165, protein: 31, carbohydrates: 0, fat: 3.6 } };
const platano = { _id: 'f2', name: 'Plátano', category: 'fruits', nutrition: { energy: 89, protein: 1.1, carbohydrates: 22.8, fat: 0.3 }, servingSizes: [{ name: 'pieza', grams: 118 }] };

function pintar(props = {}) {
  const onAddFood = vi.fn();
  const onCreateFood = vi.fn();
  const onChangeTargetSlot = vi.fn();
  const onClose = vi.fn();
  const utils = render(
    <AddFoodPanel
      open
      targetSlotKey="breakfast"
      onChangeTargetSlot={onChangeTargetSlot}
      recentFoods={[]}
      onClose={onClose}
      onAddFood={onAddFood}
      onCreateFood={onCreateFood}
      {...props}
    />
  );
  return { ...utils, onAddFood, onCreateFood, onChangeTargetSlot, onClose };
}

beforeEach(() => {
  getAll.mockReset();
  getAll.mockResolvedValue({ data: { data: [] } });
});

describe('AddFoodPanel', () => {
  it('busca contra el servidor y agrega el resultado al tiempo de comida activo', async () => {
    getAll.mockResolvedValue({ data: { data: [pollo] } });
    const { onAddFood } = pintar();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Buscar alimento'), 'pollo');

    await waitFor(() => expect(getAll).toHaveBeenCalledWith(expect.objectContaining({ search: 'pollo' })));
    await screen.findByText('Pechuga de Pollo');

    await user.click(screen.getByRole('button', { name: /agregar/i }));

    expect(onAddFood).toHaveBeenCalledWith('breakfast', pollo, 100, 'g', null);
  });

  it('agrega con la porción común del alimento como cantidad inicial, no siempre 100 g', async () => {
    getAll.mockResolvedValue({ data: { data: [platano] } });
    const { onAddFood } = pintar();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Buscar alimento'), 'plat');
    await screen.findByText('Plátano');

    await user.click(screen.getByRole('button', { name: /agregar/i }));

    // servingSizes[0] = { name: 'pieza', grams: 118 } → 1 pieza = 118 g.
    expect(onAddFood).toHaveBeenCalledWith('breakfast', platano, 118, 'pieza', '1 pieza');
  });

  it('muestra los alimentos recientes del plan cuando la búsqueda está vacía, y los agrega al click', async () => {
    const { onAddFood } = pintar({ recentFoods: [pollo] });
    const user = userEvent.setup();

    const chip = await screen.findByRole('button', { name: /\+ Pechuga de Pollo/ });
    await user.click(chip);

    expect(onAddFood).toHaveBeenCalledWith('breakfast', pollo, 100, 'g', null);
  });

  it('permite crear un alimento nuevo y lo agrega automáticamente', async () => {
    const nuevo = { _id: 'f3', name: 'Mango Ataulfo', category: 'fruits', nutrition: { energy: 60 } };
    const { onCreateFood, onAddFood } = pintar();
    onCreateFood.mockResolvedValue(nuevo);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Buscar alimento'), 'Mango Ataulfo');
    await user.click(screen.getByRole('button', { name: /crea "Mango Ataulfo"/i }));

    // Los campos obligatorios del formulario de alta pintan "Grupo *"/"Kcal /
    // 100g *" (el " *" es un <span> anidado dentro del <label>) — de ahí el
    // match parcial en vez de exigir el texto exacto del label.
    await user.selectOptions(screen.getByLabelText(/^Grupo/), 'fruits');
    await user.type(screen.getByLabelText(/^Kcal \/ 100g/), '60');
    await user.click(screen.getByRole('button', { name: /crear y agregar/i }));

    await waitFor(() =>
      expect(onCreateFood).toHaveBeenCalledWith({
        name: 'Mango Ataulfo',
        category: 'fruits',
        nutrition: { energy: 60, protein: 0, carbohydrates: 0, fat: 0 },
      })
    );
    expect(onAddFood).toHaveBeenCalledWith('breakfast', nuevo, 100, 'g', null);
  });

  it('cambiar el tiempo de comida destino no cierra el panel', async () => {
    const { onChangeTargetSlot, onClose } = pintar();
    const user = userEvent.setup();

    await user.selectOptions(screen.getByLabelText('Agregando a'), 'lunch');

    expect(onChangeTargetSlot).toHaveBeenCalledWith('lunch');
    expect(onClose).not.toHaveBeenCalled();
  });
});
