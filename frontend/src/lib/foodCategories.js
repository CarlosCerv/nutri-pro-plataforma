/**
 * Categorías del catálogo de alimentos (`Food.category` en el backend).
 * Antes vivían duplicadas dentro de `pages/tools/FoodsTab.jsx`; ahora también
 * las usa `components/MenuBuilder/AddFoodPanel.jsx` para sus chips de filtro.
 */
export const CATEGORIAS = [
    { value: '', label: 'Todos' },
    { value: 'cereals', label: 'Cereales' },
    { value: 'proteins', label: 'Proteínas' },
    { value: 'dairy', label: 'Lácteos' },
    { value: 'fruits', label: 'Frutas' },
    { value: 'vegetables', label: 'Verduras' },
    { value: 'legumes', label: 'Leguminosas' },
    { value: 'fats', label: 'Grasas' },
    { value: 'nuts', label: 'Oleaginosas' },
    { value: 'beverages', label: 'Bebidas' },
    { value: 'other', label: 'Otros' },
];

export const ETIQUETA_CATEGORIA = Object.fromEntries(CATEGORIAS.map((c) => [c.value, c.label]));
