# 🍽️ DailyMealPlanner - Componente Interactivo NutriPro

## Descripción General

El **DailyMealPlanner** es un componente React moderno y completo para la creación de menús diarios con seguimiento detallado de macronutrientes. Diseñado específicamente para la plataforma NutriPro, permite a nutricionistas y pacientes planificar comidas de forma intuitiva.

### Características principales

✅ **Gestión de Tiempos de Comida**: Desayuno, Comida, Cena y más (editables)  
✅ **Catálogo de Alimentos**: Base de datos con valores nutricionales  
✅ **Cálculo Automático de Macronutrientes**: Realtime reactivity  
✅ **Tabla de Resumen Diario**: Visualización global de calorías, proteínas, carbos y grasas  
✅ **Modal de Selección de Alimentos**: Búsqueda y previsualizaciones  
✅ **Edición de Porciones**: Adjust quantities on-the-fly  
✅ **Diseño Responsivo**: Tailwind CSS + Mobile-first  
✅ **Componentes Reutilizables**: Arquitectura modular y escalable  

---

## Instalación

### 1. Copiar archivos al proyecto

Los archivos deben estar en la estructura siguiente dentro de `frontend/src/`:

```
src/
├── types/
│   └── nutrition.ts           # Interfaces y tipos
├── utils/
│   └── calculations.ts        # Funciones de cálculo
├── hooks/
│   └── useMealPlanner.ts      # Hook personalizado
├── components/
│   └── DailyMealPlanner.jsx   # Componente principal
└── pages/
    └── MealPlannerPage.jsx    # Página de ejemplo
```

### 2. Verificar dependencias

El componente utiliza `lucide-react` para iconos. Asegurate de que esté instalado:

```bash
npm install lucide-react
```

**Nota:** Lucide-react ya debe estar en tu `frontend/package.json` según el análisis del proyecto.

---

## Uso

### Importar en tu aplicación

```jsx
import DailyMealPlanner from '@/components/DailyMealPlanner';

function App() {
  return <DailyMealPlanner />;
}
```

### O usar la página completa

```jsx
import MealPlannerPage from '@/pages/MealPlannerPage';

// En tu router:
<Route path="/meal-planner" element={<MealPlannerPage />} />
```

---

## Arquitectura

### 1. **Tipos (`nutrition.ts`)**

Define la estructura de datos del sistema:

```typescript
- MacroNutrients: { calories, protein, carbs, fat }
- FoodItem: { id, name, basePortionSize, macroPerPortion }
- AddedFood: { id, foodId, foodName, portions, totalMacro, ... }
- MealTime: { id, name, foods, totalMacro, order }
- DailyMealPlan: { id, date, mealTimes, dailyTotalMacro, ... }
```

### 2. **Utilidades de Cálculo (`calculations.ts`)**

Funciones puras para reactividad:

```typescript
calculateFoodNutrients(baseNutrients, portions)
  → Multiplica macros base por porciones

calculateMealTimeTotals(foods)
  → Suma los macros de todos los alimentos de un tiempo

calculateDailyTotals(mealTimes)
  → Suma los macros de todos los tiempos de comida

calculateMacroPercentages(nutrients)
  → Calcula el % de cada macro sobre calorías totales

roundNutrients(nutrients)
  → Redondea a 2 decimales
```

### 3. **Hook Personalizado (`useMealPlanner.ts`)**

Estado centralizado y lógica de negocio:

```typescript
const {
  mealTimes,           // Array de tiempos de comida
  dailyTotal,          // Total diario (recomputable con useMemo)
  addFood,             // (mealTimeId, food, portions) → void
  removeFood,          // (mealTimeId, foodId) → void
  editFood,            // (mealTimeId, foodId, newPortions) → void
  updateMealTimeName,  // (mealTimeId, newName) → void
  addMealTime,         // (name) → void
  removeMealTime,      // (mealTimeId) → void
  clearAllFoods,       // () → void
} = useMealPlanner();
```

### 4. **Componentes (`DailyMealPlanner.jsx`)**

Componentes reutilizables:

- **`AddFoodModal`**: Modal para búsqueda y selección de alimentos
- **`FoodItemCard`**: Tarjeta de alimento con porciones editables
- **`MealTimeCard`**: Sección de cada tiempo de comida
- **`MacroSummaryTable`**: Tabla resumen diario con gráficas de barras

---

## Flujo del Usuario

```
┌─────────────────────────────────────────────────────────┐
│         DailyMealPlanner (Componente Principal)        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. MacroSummaryTable (Resumen Diario)                 │
│     ├─ Calorías Totales                                │
│     ├─ Proteínas (g) + % del total                     │
│     ├─ Carbohidratos (g) + % del total                 │
│     └─ Grasas (g) + % del total                        │
│                                                         │
│  2. Array de MealTimeCard (Desayuno, Comida, Cena)    │
│     └─ Cada tarjeta contiene:                          │
│        ├─ Nombre editable                              │
│        ├─ Lista de FoodItemCard (alimentos añadidos)   │
│        ├─ Totales del tiempo de comida                 │
│        └─ Botón "Añadir Alimento"                      │
│           └─ Abre AddFoodModal                         │
│              ├─ Búsqueda de alimentos                  │
│              ├─ Selector de porciones                  │
│              └─ Vista previa de macros                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Lógica de Cálculos (Reactividad)

### Ejemplo de Flujo:

1. **Usuario selecciona**: Pollo (100g) con 1.5 porciones
   - Base: 165 kcal, 31g proteína, 0g carbs, 3.6g grasa
   - Resultado: 247.5 kcal, 46.5g proteína, 0g carbs, 5.4g grasa

2. **Hook actualiza el estado**:
   - `mealTimes[0].foods.push(newFood)` con `totalMacro` calculado
   - `mealTimes[0].totalMacro` recalcula sumando todos los alimentos
   - `dailyTotal` recalcula sumando todos los tiempos de comida (useMemo)

3. **Componentes se renderizan automáticamente**:
   - MacroSummaryTable refleja el nuevo total diario
   - MealTimeCard muestra el nuevo total del tiempo de comida
   - FoodItemCard muestra el alimento con sus macros

---

## Personalización

### Cambiar el Catálogo de Alimentos

En `DailyMealPlanner.jsx`, reemplaza `DEMO_FOOD_CATALOG`:

```jsx
const DEMO_FOOD_CATALOG = [
  {
    id: 'my-food-1',
    name: 'Mi Alimento',
    basePortionSize: '100g',
    macroPerPortion: { calories: 100, protein: 20, carbs: 5, fat: 2 },
  },
  // ... más alimentos
];
```

**O cargarlo desde una API**:

```jsx
useEffect(() => {
  const fetchFoods = async () => {
    const response = await fetch('/api/foods');
    setFoodCatalog(await response.json());
  };
  fetchFoods();
}, []);
```

### Integración con Backend NutriPro

Para usar datos reales de pacientes y planes:

```jsx
// En MealPlannerPage.jsx
const { patientId } = useParams();

useEffect(() => {
  // Cargar plan existente
  fetch(`/api/mealplans/${patientId}`)
    .then(res => res.json())
    .then(data => setMealPlan(data));
}, [patientId]);

// Guardar cambios
const handleSave = async () => {
  await fetch(`/api/mealplans/${patientId}`, {
    method: 'PUT',
    body: JSON.stringify({ mealTimes, dailyTotal }),
  });
};
```

---

## Estilos

El componente utiliza **Tailwind CSS** para estilos. Colores principales:

- **Primario**: Pink (#db2777) - para botones y acentos
- **Secundario**: Blue (#3b82f6) - para información y resumen
- **Neutrales**: Escala de grises

### Personalizar colores

Busca en `DailyMealPlanner.jsx` y reemplaza:
- `bg-pink-600` → tu color primario
- `bg-blue-500` → tu color secundario

---

## Testing

### Ejemplo de test con Jest + React Testing Library

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import DailyMealPlanner from './DailyMealPlanner';

describe('DailyMealPlanner', () => {
  it('renders meal planner', () => {
    render(<DailyMealPlanner />);
    expect(screen.getByText(/Planificador de Comidas/i)).toBeInTheDocument();
  });

  it('adds food to meal time', async () => {
    render(<DailyMealPlanner />);
    fireEvent.click(screen.getByText('Añadir Alimento'));
    // ... test logic
  });
});
```

---

## Performance

- **useMemo**: `dailyTotal` solo recalcula cuando `mealTimes` cambia
- **useCallback**: Funciones de cambio memorizadas para evitar re-renders innecesarios
- **Lazy rendering**: Modal solo renderiza cuando está abierto

---

## Compatibilidad

- ✅ React 18+
- ✅ React 19+
- ✅ Tailwind CSS 3+
- ✅ Node.js 16+

---

## API de Ejemplo para Backend

Endpoints sugeridos para integración con NutriPro:

```
GET  /api/foods
POST /api/foods

GET  /api/mealplans/:patientId
POST /api/mealplans/:patientId
PUT  /api/mealplans/:patientId
DELETE /api/mealplans/:id

GET  /api/patients/:patientId/nutrition-summary
```

---

## Próximas Mejoras

📋 Persistencia en base de datos  
📅 Calendarios con múltiples días  
🎯 Objetivos de macronutrientes configurables  
📊 Gráficas históricas de consumo  
🔄 Copiar plan de días anteriores  
⚙️ Configuración de porciones por tipo de usuario  
🌐 Internacionalización (i18n)  

---

## Licencia

Este componente es parte de **NutriPro** y se distribuye bajo licencia MIT.

---

## Soporte

Para reportar bugs o sugerencias, abre una issue en el repositorio de NutriPro.
