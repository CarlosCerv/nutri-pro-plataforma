# NutriPro — Frontend

SPA en React 19 + Vite 5, con Tailwind CSS y un tema unico claro estilo Apple. Ver el [README raiz](../README.md) para instalacion general y variables de entorno. Este documento cubre lo especifico del frontend: estructura, rutas, sistema de diseno y scripts.

## Estructura

```
frontend/
├── src/
│   ├── main.jsx                  # Entry point de React
│   ├── App.jsx                   # Router, layout protegido, rutas
│   ├── index.css                 # Tokens de diseno + capas Tailwind
│   ├── pages/                    # Una vista por pantalla
│   │   ├── patient-tabs/         # Pestañas del expediente
│   │   └── tools/                # Pestañas de /herramientas y /dietas
│   ├── components/               # Componentes no ligados a una ruta
│   │   └── Dashboard/            # Subcomponentes del panel
│   ├── design-system/
│   │   └── components/           # Sidebar/Topbar + componentes reutilizables
│   ├── contexts/
│   │   ├── AuthContext.jsx       # Sesion (usuario, token, login/logout)
│   │   └── ToastContext.jsx      # Avisos efimeros
│   ├── services/
│   │   ├── api.js                # Cliente axios base + wrappers por recurso
│   │   └── clinicalNotesService.js
│   ├── hooks/                    # useSaveState, useMealPlanner, usePDFExport
│   ├── lib/                      # Logica compartida (ver abajo)
│   │   └── calculations/         # Formulas clinicas puras
│   ├── types/                    # Tipos TypeScript del dominio
│   ├── utils/                    # Utilidades varias
│   ├── __tests__/                # Suite de Vitest
│   └── _archive/                 # Codigo retirado del release (ver su README)
├── public/                       # Assets estaticos
├── scripts/build-favicon.mjs     # Genera el favicon en el prebuild
├── vite.config.js                # Proxy de /api y configuracion de Vitest
├── tsconfig.json                 # Tipado acotado a la logica pura
└── tailwind.config.js            # Tokens extendidos de Tailwind
```

### Modulos de `src/lib/`

| Archivo | Que resuelve |
|---|---|
| `apiError.js` | Traduce un error de axios al mensaje que ve el usuario. Distingue el caso critico: la peticion que **nunca llego al servidor**, que antes se confundia con un guardado exitoso. |
| `bodyComposition.js` | Traduce el formulario de mediciones (campos planos en español) al esquema anidado en ingles de `BodyComposition`. Sin esta capa, Mongoose descartaba los pliegues en silencio. |
| `redirects.js` | Tabla de redirecciones de URLs heredadas. La consumen `App.jsx` y las pruebas: un test que duplica la lista de rutas no comprueba nada. |
| `pageMeta.js` | Titulo y subtitulo de cada ruta para la barra superior. |
| `calculations/` | `imc.js`, `tmb.js`, `bodyFat.js`, `idr.js`. Funciones puras, la fuente unica de calculo de la interfaz. |

## Rutas

Definidas en `src/App.jsx`. Todas menos `/login` y `/register` exigen sesion (`ProtectedRoute`).

| Ruta | Pagina | Notas |
|---|---|---|
| `/login`, `/register` | `Login`, `Register` | Publicas |
| `/dashboard` | `Dashboard` | Home tras login |
| `/pacientes` | `Patients` | Listado con filtros |
| `/pacientes/nuevo`, `/pacientes/:id/editar` | `NewPatient` | Alta en dos pasos; edicion en una sola pantalla |
| `/pacientes/:id` | `PatientDetail` | Expediente: Resumen · Evolucion · Clinica · Dietas |
| `/agenda`, `/agenda/nueva` | `Appointments`, `NewAppointment` | Citas |
| `/dietas` | `Dietas` | Contenedor con pestañas: Planes · Plantillas · Alimentos |
| `/dietas/nueva`, `/dietas/:id/editar` | `MenuBuilder` | Constructor con drag & drop |
| `/herramientas` | `Herramientas` | Contenedor con pestañas: Calculadoras · Estadisticas |
| `/finanzas` | `Finance` | Cobros y resumen del mes |
| `/perfil` | `Profile` | Datos profesionales y contraseña |

### Redirecciones

`src/lib/redirects.js` mantiene 26 redirecciones. Cubren dos grupos: los alias en ingles de la primera version (`/patients`, `/mealplans`…) y las URLs que **prometian una subpantalla y renderizaban la misma vista que su ruta padre** (`/calculos/imc`, `/reportes/nuevo`, `/alimentos/nuevo`, `/admin/usuarios`…). Las seis rutas de pestaña del expediente redirigen a la pestaña que las absorbio.

Si agregas o quitas una redireccion, editas esa tabla y las pruebas de `__tests__/routing.test.jsx` la verifican sola.

## Componentes del sistema de diseno

`src/design-system/components/`, todos exportados desde su `index.js`.

| Componente | Para que |
|---|---|
| `Button` | Boton con variantes, tamaños y spinner de carga integrado |
| `Card`, `Badge`, `Modal` | Contenedor, etiqueta de estado y dialogo (portal, Escape, bloqueo de scroll) |
| `Input`, `Select` | Campo con label, error y ayuda, con los `id`/`aria-describedby` resueltos |
| `Combobox` | Selector desplegable con busqueda opcional. **Sustituye** a `PremiumSelect` y `SearchableSelect`, que eran `div` con `onClick`: sin teclado, sin ARIA y con su CSS en el archivo de una pagina |
| `PageHeader` | Titulo, subtitulo y acciones. Estaba repetido en doce paginas |
| `Spinner` | Indicador de carga. Habia cuatro variantes copiadas a mano |
| `Tabs` | Barra de pestañas, con `role="tab"` y estado anunciado |
| `Disclosure` | Seccion plegable. La usa el expediente para fundir siete pestañas en cuatro |
| `DataTable` | Tabla con carga, vacio y error resueltos como parte del contrato |
| `StatTile` | Indicador numerico. Estaba reimplementado en cuatro paginas con hex literales |
| `FormSection` | Bloque titulado de formulario |
| `SaveBar` | Pie de formulario con boton de guardar y **el error del ultimo intento**. Se usa con `useSaveState()` |
| `EmptyState`, `ErrorState`, `LoadingState`, `Skeleton` | Los tres estados que toda vista con datos remotos necesita |
| `GlobalSearch` | Busqueda de pacientes de la barra superior |

**Regla al escribir codigo nuevo**: usa estos componentes en vez de reconstruir `className="btn …"` a mano. Las paginas que todavia lo hacen no estan rotas, pero son la migracion pendiente.

## Sistema de diseno

La fuente de verdad es [`.claude/skills/apple-style-frontend/SKILL.md`](../.claude/skills/apple-style-frontend/SKILL.md). No agregues tokens sin actualizar antes ese archivo.

### Tokens canonicos (`src/index.css`, bloque `:root`)

| Token | Valor | Uso |
|---|---|---|
| `--font-family` | `-apple-system, BlinkMacSystemFont, "SF Pro Display/Text"…` | Tipografia base. Cuatro pesos: 300/400/600/700 |
| `--ink` / `--ink-muted` / `--ink-secondary` | `#1d1d1f` / `#424245` / `#6e6e73` | Jerarquia tipografica |
| `--surface` / `--surface-cool` / `--surface-alt` / `--surface-strong` / `--surface-dark` | `#ffffff` / `#fafafc` / `#f5f5f7` / `#e8e8ed` / `#1d1d1f` | Jerarquia de superficies |
| `--border-soft` / `--border` | `#d2d2d7` / `#b0b0b5` | Bordes |
| `--accent` / `--accent-hover` / `--accent-soft` | `#0071e3` / `#0077ed` / `#e8f4ff` | Acento **unico** |
| `--success` / `--warning` / `--danger` / `--info` | `#1b7f3a` / `#b45309` / `#c41e16` / `#0071e3` | Estados semanticos, no acentos alternos |
| `--radius-s` / `--radius-m` / `--radius-l` / `--radius-pill` | `6px` / `11px` / `18px` / `980px` | La pildora es para **todo boton de accion**; los contenedores de datos nunca |
| `--shadow-1` | `0 3px 30px rgba(0,0,0,0.22)` | La unica sombra del sistema |
| `--ease` + `--duration-micro` / `--duration-layout` | `cubic-bezier(0.4,0,0.6,1)` + `0.24s` / `0.32s` | La unica curva |
| `--space-1` … `--space-5` | `4` / `8` / `16` / `32` / `64` px | Espaciado |
| `--chart-*` | ver `index.css` | Paleta de graficas. Recharts no acepta `currentColor`, asi que las series necesitan valores explicitos |

`--ink-muted` es una **adicion** al set de la skill: la aplicacion ya usaba tres niveles de texto y colapsarlos a los dos de la skill perdia jerarquia en las tablas clinicas, que son densas por naturaleza.

### Alias heredados

El mismo `:root` mantiene un bloque marcado como obsoleto (`--text-primary`, `--surface-muted`, `--radius-md`, `--shadow-soft`, `--ease-apple`, `--space-lg`…) que apunta a los canonicos. Existe para que la migracion de las paginas se haga por partes en vez de en un commit que toque las veinte pantallas. **No lo uses en codigo nuevo.** Se borra cuando `grep -r "var(--text-primary" src` no devuelva nada.

Lo mismo aplica a las paletas `emerald`, `gold` y `navy` de `tailwind.config.js`: eran una segunda y tercera identidad de marca contra la regla de un solo acento, y ya apuntan al acento y a los estados semanticos. Los nombres siguen ahi solo porque unas 60 clases del codigo los usan y borrarlos los volveria invisibles en silencio.

### Convenciones

- Sin emojis en la interfaz ni en el codigo.
- Sin modo oscuro: no agregues `darkMode` a `tailwind.config.js` ni clases `dark:`.
- Prefiere el token (`bg-[var(--surface-alt)]`) sobre un hex o un color generico de Tailwind, para que el `className` describa honestamente lo que se renderiza.
- Todo elemento con `position: fixed` que toque un borde de la pantalla suma el `env(safe-area-inset-*)` correspondiente con `max(valor-base, env(...))`.

**Nota sobre ESLint y props polimorficas (`as`)**: la combinacion de `ecmaVersion` en `eslint.config.js` produce un falso positivo de `no-unused-vars` cuando una prop se desestructura y renombra para usarse como tag JSX. `Card.jsx` lo evita asignando el tag a una variable aparte (`const Tag = as || 'div'`); sigue ese patron si agregas otro componente polimorfico.

## PWA y comportamiento en dispositivos Apple

- **Manifest**: `public/manifest.webmanifest`, enlazado desde `index.html`. `start_url` `/dashboard`, `display: standalone`.
- **Iconos**: `scripts/build-favicon.mjs` genera `favicon.ico`, `apple-touch-icon.png` (180x180), `pwa-192.png` y `pwa-512.png` desde `public/brand-icon.svg` con `sharp` y `png-to-ico`. Corre en `prebuild`; si cambias el logo, ejecuta `npm run icons:build` antes de commitear.
- **Meta tags**: `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style` (`default`, porque el tema es claro), `apple-mobile-web-app-title`, `mobile-web-app-capable` y `format-detection=telephone=no` (evita que iOS convierta numeros del contenido clinico en enlaces de llamada).
- **Safe-area-inset**: aplicado en `.content-area`, `Topbar`, `.modal-overlay`/`.modal-content`, `.toast` y el `Sidebar`.

## Pruebas

```bash
npm test          # vitest run
npm run test:watch
npm run typecheck # tsc --noEmit sobre lib/, hooks/, types/, utils/
```

`tsconfig.json` es estricto pero acotado a la logica pura, con `checkJs` apagado: las paginas siguen en `.jsx` con PropTypes, y encender `checkJs` convertiria el tipado en una migracion de cuarenta pantallas.

Las 77 pruebas cubren los calculos clinicos, los mapeadores de `lib/`, el hook del planificador y la tabla de redirecciones.

## Scripts

| Script | Comando | Descripcion |
|---|---|---|
| `npm run dev` | `vite` | Servidor de desarrollo, proxy de `/api` a `localhost:5000` |
| `npm run build` | `vite build` | Build de produccion en `dist/` (con `prebuild` generando el favicon) |
| `npm run preview` | `vite preview` | Sirve el build localmente |
| `npm run lint` | `eslint .` | Lint del proyecto |
| `npm test` | `vitest run` | Suite de pruebas |
| `npm run typecheck` | `tsc --noEmit` | Verificacion de tipos de la logica pura |
| `npm run icons:build` | `node scripts/build-favicon.mjs` | Regenera favicon e iconos PWA |
