# NutriPro — Frontend

SPA en React 19 + Vite 5, con Tailwind CSS y un tema unico claro estilo Apple. Ver el [README raiz](../README.md) para instalacion general y variables de entorno. Este documento cubre lo especifico del frontend: estructura, rutas, sistema de diseno y scripts.

## Estructura

```
frontend/
├── src/
│   ├── main.jsx                 # Entry point de React
│   ├── App.jsx                  # Router, layout protegido, rutas
│   ├── index.css                 # Tokens de diseno (variables CSS) + capas Tailwind
│   ├── pages/                    # Una vista por pantalla (Dashboard, Patients, Profile, ...)
│   │   └── patient-tabs/         # Pestañas del detalle de paciente (clinica, mediciones, habitos, ...)
│   ├── components/                # Componentes reutilizables no ligados a una ruta especifica
│   │   └── Dashboard/             # Subcomponentes especificos del dashboard
│   ├── design-system/
│   │   └── components/            # Sidebar/Topbar del layout + Button/Card/Badge/Input/Modal reutilizables
│   ├── contexts/
│   │   └── AuthContext.jsx        # Estado de sesion (usuario, token, login/logout)
│   ├── services/
│   │   ├── api.js                 # Cliente axios base (usa VITE_API_URL)
│   │   ├── advancedApi.js         # Llamadas a endpoints avanzados (calculos, intercambios, etc.)
│   │   └── clinicalNotesService.js
│   ├── hooks/                     # Hooks personalizados
│   ├── lib/calculations/          # Logica de calculo compartida entre paginas
│   ├── types/                     # Definiciones TypeScript usadas por modulos .ts sueltos
│   └── utils/                     # Utilidades varias
├── public/                         # Assets estaticos servidos tal cual
├── scripts/build-favicon.mjs       # Genera el favicon en el prebuild
├── vite.config.js                  # Proxy de /api hacia localhost:5000 en desarrollo
├── tailwind.config.js               # Paleta, tipografia y tokens extendidos de Tailwind
└── vercel.json                      # Rewrite de SPA routing (fallback a index.html)
```

## Rutas

Definidas en `src/App.jsx`. Todas menos `/login` y `/register` estan protegidas por `ProtectedRoute` (exige sesion activa via `AuthContext`; redirige a `/login` si no hay token).

| Ruta | Pagina | Notas |
|---|---|---|
| `/login`, `/register` | `Login`, `Register` | Publicas |
| `/dashboard` | `Dashboard` | Home tras login |
| `/pacientes` | `Patients` | Listado |
| `/pacientes/nuevo`, `/pacientes/:id/editar` | `NewPatient` | Alta y edicion |
| `/pacientes/:id`, `/pacientes/:id/{mediciones,habitos,clinica,laboratorio,actividad,dietas,seguimiento,psiconutricion}` | `PatientDetail` | Detalle con pestañas (`pages/patient-tabs/`) |
| `/agenda`, `/agenda/nueva` | `Appointments`, `NewAppointment` | Citas |
| `/dietas`, `/dietas/nueva`, `/dietas/catalogo`, `/dietas/:id/editar` | `MealPlans`, `MenuBuilder`, `DietTemplates` | Planes de alimentacion |
| `/alimentos`, `/alimentos/nuevo` | `FoodsDatabase` | Catalogo de alimentos |
| `/calculos`, `/calculos/{imc,calorias,deportistas}` | `NutritionCalculator` | Calculadora nutricional |
| `/reportes`, `/reportes/nuevo`, `/reportes/historial` | `ReportsHub` | Reportes clinicos |
| `/reportes-poblacionales` | `PopulationReports` | Reportes agregados |
| `/perfil` | `Profile` | Perfil del usuario autenticado |
| `/finanzas` | `Finance` | Modulo financiero |
| `/admin`, `/admin/licencias`, `/admin/usuarios`, `/admin/ingresos` | `AdminLicenses` | Panel de administracion |

Rutas en ingles antiguas (`/patients`, `/appointments`, `/mealplans`, `/menu-builder`, `/diet-templates`, `/calculator`, `/profile`, `/configuracion`, `/finance`) se conservan como redirecciones (`<Navigate replace>`) hacia su equivalente en español, para no romper enlaces o marcadores existentes.

`/` y cualquier ruta no reconocida redirigen a `/dashboard`.

### Codigo presente pero no enrutado

`src/components/DailyMealPlanner.jsx`, `src/components/MealPlannerExamples.jsx` y `src/pages/MealPlannerPage.jsx` no estan referenciados desde ninguna `<Route>` de `App.jsx`. Usan una paleta de colores generica (rosa/azul) independiente del sistema de diseno actual. Si vas a retomar este componente, decide primero si conviene reescribirlo contra los tokens de `index.css` o retirarlo del repositorio.

`src/components/SavePlanModal.jsx` y `src/components/FoodExchangeModal.jsx` tampoco estan importados desde ninguna pagina activa — quedaron migrados al componente `Modal` compartido (ver abajo) por si se retoman, pero hoy no son alcanzables desde la UI.

## Componentes reutilizables (`design-system/components`)

Ademas de `Sidebar.jsx`/`Topbar.jsx` (layout), la carpeta expone cinco componentes de UI que envuelven las clases `.btn`/`.card`/`.badge`/`.input`/`.modal-*` de `index.css` en una API de props en vez de className armado a mano. Import recomendado: `import { Button, Card, Badge, Input, Select, Modal } from '../design-system/components'`.

| Componente | Props principales | Notas |
|---|---|---|
| `Button` | `variant` (`primary`\|`secondary`\|`outline`\|`ghost`\|`danger`), `size` (`sm`\|`md`\|`lg`), `iconOnly`, `loading`, `fullWidth` | `loading` muestra el spinner con el color correcto segun la variante (mismo patron `border-white/35 border-t-white` ya usado en Login/Register) |
| `Card` | `as`, `kpi`, `hover`, `padded` | `kpi` usa `.card-kpi`; `hover={false}` / `padded={false}` cubren los overrides `!hover:shadow-none` / `!p-0` que ya aparecian sueltos en varias paginas |
| `Badge` | `variant` (`success`\|`warning`\|`danger`\|`info`\|`neutral`\|`gold`) | Alias directo de `.badge-*`; usalo en vez de reconstruir el color con Tailwind suelto |
| `Input` / `Select` | `label`, `error`, `helperText`, `required` | Resuelven `.form-group`/`.label`/`.input`/`.input-error`/`.error-text`/`.helper-text` juntos, con los `id`/`aria-describedby` de accesibilidad generados automaticamente (`useId`) |
| `Modal` | `open`, `onClose`, `title`, `footer`, `size` (`sm`\|`md`\|`lg`), `closeOnOverlayClick` | Renderiza via `createPortal` a `document.body`, cierra con Escape y bloquea el scroll del body mientras esta abierto — comportamiento que los modales escritos a mano (ver `SavePlanModal.jsx`/`FoodExchangeModal.jsx` como ejemplo migrado) no tenian |

Las paginas existentes que siguen usando `className="btn ..."` / `className="badge ..."` a mano (la mayoria) no estan rotas — los componentes nuevos son la forma preferida para trabajo nuevo, pero adoptarlos en el resto de la app es una migracion incremental, no un requisito para tocar una pagina por otro motivo.

**Nota sobre ESLint y props polimorficas (`as`)**: `eslint.config.js` trae `languageOptions.ecmaVersion: 2020` a la vez que `languageOptions.parserOptions.ecmaVersion: 'latest'` (boilerplate por defecto de Vite, sin tocar). Esa combinacion hace que `no-unused-vars` reporte un falso positivo cuando una prop se desestructura y renombra en la firma de la funcion para usarse directo como tag JSX (`{ as: Component = 'div' }` seguido de `<Component>`). `Card.jsx` evita el problema asignando el tag a una variable en una linea aparte (`const Tag = as || 'div'`) en vez de renombrar en la desestructuracion — sigue ese mismo patron si agregas otro componente polimorfico.

## Sistema de diseno

Un solo tema, claro, sin modo oscuro (no hay clase `dark:` en uso ni toggle de tema — no reintroducir ninguno de los dos).

### Tokens (`src/index.css`, bloque `:root`)

| Token | Valor | Uso |
|---|---|---|
| `--font-sans` | `-apple-system, BlinkMacSystemFont, "SF Pro Text/Display", Helvetica, Arial, system-ui` | Tipografia base |
| `--bg-primary` | `#f5f5f7` | Fondo de la aplicacion |
| `--surface` / `--surface-muted` / `--surface-strong` | `#ffffff` / `#f2f2f7` / `#e8e8ed` | Jerarquia de superficies (tarjetas, paneles, estados hover) |
| `--text-primary` / `--text-secondary` / `--text-tertiary` | `#1d1d1f` / `#424245` / `#6e6e73` | Jerarquia tipografica |
| `--border-soft` / `--border` | `#d2d2d7` / `#b0b0b5` | Bordes |
| `--accent` / `--accent-hover` / `--accent-soft` | `#0071e3` / `#0077ed` / `#e8f4ff` | Azul de sistema (enlaces, botones primarios, focus) |
| `--success` / `--warning` / `--danger` / `--info` | `#1b7f3a` / `#b45309` / `#c41e16` / `#0071e3` | Estados semanticos (badges, alertas, validacion) |
| `--shadow-soft` / `--shadow-hover` | ver `index.css` | Los unicos dos niveles de sombra del sistema; expuestos en Tailwind como `shadow-card` / `shadow-card-hover` |
| `--radius-md` a `--radius-2xl` | `8px` (uniforme) | Radio de borde estandar de toda la interfaz |
| `--ease-apple` | `cubic-bezier(0.32, 0.72, 0, 1)` | Curva de aceleracion unica para animaciones de entrada/salida (modal, toast, sidebar, hover de `.btn`/`.card`/`.input`/`.tab-btn`); expuesta en Tailwind como `ease-apple`. No introduzcas otra curva para estos casos — micro-transiciones de color/opacidad sueltas en JSX (`transition-colors` sin mas) pueden seguir usando el `ease` por defecto de Tailwind, no requieren el token. |

### Tailwind (`tailwind.config.js`)

- `fontFamily.sans` / `fontFamily.display` reproducen la pila tipografica de Apple; `fontSize` redefine la escala completa (`xs` a `5xl`) con line-height y letter-spacing calculados al estilo de apple.com, no los valores por defecto de Tailwind.
- `borderRadius` esta fijado globalmente a 8px (con `full` para pildoras/avatares) — no uses valores de radio arbitrarios fuera de esta escala.
- Las paletas `navy` (950–500), `emerald` y `gold` son colores puntuales: `navy` para texto oscuro de encabezados (`text-navy-950`), `emerald`/`gold` son los colores de sistema de iOS reutilizados donde se necesita un verde o amarillo (no son un "tema alterno"). `success`/`warning`/`danger`/`info` en Tailwind son alias de los mismos tokens de `index.css`, no una paleta distinta — usalos en vez de hardcodear hex.
- Al escribir una clase con color, prefiere el token (`bg-[var(--surface-muted)]`, `text-[var(--text-secondary)]`) sobre un hex o un color generico de Tailwind (`bg-gray-100`, `text-white`) para que el className describa honestamente lo que se renderiza y quede alineado si el token cambia.

### Convenciones

- Sin emojis en la interfaz ni en el codigo.
- Sin modo oscuro: no agregues `darkMode` a `tailwind.config.js` ni clases `dark:`.
- Los archivos `.css` por pagina (`Dashboard.css`, `MenuBuilder.css`, etc.) deben usar las variables de `index.css` en vez de valores hex propios — evita que un color quede desincronizado del resto de la app si el tema cambia.

## PWA y comportamiento en dispositivos Apple

- **Manifest**: `public/manifest.webmanifest`, enlazado desde `index.html` (`<link rel="manifest">`). Define nombre, `start_url` (`/dashboard`), `display: standalone`, colores de tema/fondo, y los iconos `pwa-192.png`/`pwa-512.png`/`brand-icon.svg`.
- **Iconos**: `scripts/build-favicon.mjs` genera `favicon.ico`, `apple-touch-icon.png` (180x180), `pwa-192.png` y `pwa-512.png` a partir de `public/brand-icon.svg` usando `sharp`. Corre automaticamente en `prebuild`; si cambias el logo, corre `node scripts/build-favicon.mjs` para regenerar los cuatro archivos antes de commitear.
- **Meta tags en `index.html`**: `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style` (`default`, porque el tema es claro — no uses `black-translucent` sin revisar el contraste de los iconos de la barra de estado), `apple-mobile-web-app-title`, `mobile-web-app-capable` (equivalente no-Apple), y `format-detection=telephone=no` (evita que iOS convierta numeros sueltos del contenido clinico en enlaces de llamada).
- **Safe-area-inset**: `viewport-fit=cover` ya estaba declarado en el `<meta name="viewport">`, lo que habilita `env(safe-area-inset-*)`. Esta aplicado en: `.content-area` y `Topbar` (ya existia), y ahora tambien en `.modal-overlay`/`.modal-content` (padding en las cuatro direcciones), `.toast` (`top`/`right`), y el `Sidebar` (padding superior del header, inferior del footer, e izquierdo del drawer movil `fixed`). Cualquier elemento nuevo con `position: fixed` que toque un borde de la pantalla (no solo overlays centrados) deberia sumar el `env(safe-area-inset-*)` correspondiente con `max(valor-base, env(...))`, siguiendo el mismo patron.
- **Easing**: ver el token `--ease-apple` en la tabla de arriba.

## Scripts (`package.json`)

| Script | Comando | Descripcion |
|---|---|---|
| `npm run dev` | `vite` | Servidor de desarrollo con HMR, proxy de `/api` a `localhost:5000` |
| `npm run build` | `vite build` | Build de produccion en `dist/` (con `prebuild` generando el favicon) |
| `npm run preview` | `vite preview` | Sirve el build de produccion localmente |
| `npm run lint` | `eslint .` | Lint del proyecto |
| `npm run icons:build` | `node scripts/build-favicon.mjs` | Genera el favicon a partir de un asset fuente (con `sharp`/`to-ico`) |
