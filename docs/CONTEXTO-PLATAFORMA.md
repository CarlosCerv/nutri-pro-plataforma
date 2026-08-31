# NutriPro — Contexto de la plataforma

> Documento de contexto para conversar sobre mejoras. Describe lo que **hay hoy** en el repositorio, no lo que se planeó.
> Generado el 2026-08-31 sobre el commit `3098536`.

---

## 1. Qué es

SaaS para nutriólogos en consulta privada. Un profesional se registra, da de alta a sus pacientes, les lleva el expediente clínico y antropométrico, agenda consultas, les arma planes de alimentación y registra los cobros.

Es **multi-tenant por propietario**: cada documento de paciente, cita, plan y pago lleva un campo `nutritionist` y todas las consultas del backend filtran por el usuario del token. No hay organizaciones ni equipos — un nutriólogo, sus pacientes.

Idioma de la interfaz: español. Idioma del código: mezclado (los modelos y la API en inglés, las pantallas nuevas en español).

---

## 2. Stack y despliegue

| Capa | Tecnología |
|---|---|
| Front end | React 19, Vite 5, React Router 6, Tailwind 3, PropTypes, recharts, @dnd-kit, jsPDF + html2canvas |
| Back end | Node (ESM), Express 4, Mongoose 8, JWT, express-validator, multer |
| Base de datos | MongoDB Atlas |
| Integraciones | Cloudinary (documentos del paciente), Nodemailer (correo), Twilio (SMS) |
| Pruebas | Vitest 3, Testing Library, jsdom |
| Despliegue | Vercel — `api/[...path].js` envuelve el app de Express con `serverless-http`; el front end se sirve como estático |

El monorepo tiene tres `package.json`: raíz (concurrently + dependencias que Vercel necesita en el bundle serverless), `backend/` y `frontend/`.

**Cron.** `vercel.json` declara una ejecución diaria a las 08:00 (`0 8 * * *`) contra `/api/cron/reminders`. Es un límite del plan Hobby, no una decisión de producto: solo permite una corrida al día. Para compensar, `reminderService.js` busca citas en una ventana de **0 a 36 horas** en vez de las 23–25 h originales, de modo que toda cita recibe su aviso al menos una vez. El flag `reminderSent` del modelo `Appointment` impide el reenvío. La ruta va autenticada con `CRON_SECRET` y falla cerrada (401 sin el header).

---

## 3. Modelo de datos

Nueve colecciones en `backend/src/models/`.

### `User` — el nutriólogo
`name`, `email`, `password` (bcrypt), `role`, `specialty`, `phone`, `firstAccess`.
El campo `role` existe y `middleware/auth.js` define `authorize(...roles)`, **pero `authorize` no se aplica en ninguna ruta**. Cualquier control de rol hoy es cosmético.

### `Patient` — el expediente (292 líneas, la colección más pesada)
Tres capas superpuestas por historia del proyecto:
- **Identificación**: `firstName`, `lastName`, `email`, `phone`, `dateOfBirth`/`dob`, `gender`/`sex`, `curp`, `address`.
- **Clínica en español, en la raíz**: `antFamDM`, `antFamHTA`, `antFamObesidad`, `antFamCancer`, `antPersonales`, `cirugiasPrevias`, `alergias`, `intolerancias`, `medicamentos`, `patologias[]`, `sintomasGI[]`, `diagnosticoNutricional`, `notasClinicas`, `objetivos[]`.
- **Estilo de vida y hábitos**: `horasSueno`, `nivelEstres`, `ocupacion`, `horasLaboral`, `tabaquismo`, `alcoholismo`, `preferencias`, `disgustos`, `objetivoAlim`, `frecuencias` (Map), `horariosComida[]`, `recordatorio24h`, `nivelActividad`, `actividadesRegistradas[]`, `prescripcion`.
- **Subdocumentos**: `anthropometry` + `anthropometryHistory[]`, `labResults[]` (con `values` como Map de números y `vitals`), `medicalFiles[]`, `images[]`, `eatingHabits`.

> Esta es la fuente principal de fricción del producto. La historia clínica se captura en tres esquemas distintos que no se leen entre sí, y la antropometría vive a la vez aquí y en `BodyComposition`.

### `BodyComposition` — mediciones seriadas
`patient`, `date`, `measurements{weight,height,bmi,waistHipRatio}`, `bloodPressure`, `skinfolds{triceps,biceps,subscapular,suprailiac,abdominal,thigh,calf,chest,midaxillary}`, `circumferences`, `boneDiameters`, `composition`, `calculationMethod`.

### `Appointment` — cita
`patient` (o `isGuest` + `guestDetails`), `date`, `time`, `duration`, `status`, `type`, `notes`, `consultation`, y el bloque de recordatorio (`reminderSent`, `reminderSentAt`, `reminderEmail`, `reminderSMS`).

### `MealPlan` / `DietTemplate` — planes y plantillas
Comparten forma: `meals`, `nutrition`, `tags`, `clinicalFilters`. `MealPlan` puede ser instancia de paciente o plantilla (`isTemplate`); `DietTemplate` añade `isSystemTemplate` y `usageCount`.

### `Food` — catálogo
`name`, `category`, `nutrition`, `allergens[]`, `suitableFor[]`, `glycemicIndex`, `servingSizes[]`, `source`, `verified`.

### `ClinicalNote` — nota SOAP
`subjective`, `objective`, `analysis`, `plan`, `followUpDate`, `attachments[]`.

### `Payment` — cobro
`patient`, `appointment`, `amount`, `date`, `status`, `method`. Índice `{nutritionist:1, date:-1}`.

---

## 4. La API

Trece routers montados en `backend/src/app.js`. **Todos exigen JWT salvo `/auth/register` y `/auth/login`.**

| Router | Endpoints |
|---|---|
| `/api/auth` | `POST /register`, `POST /login`, `GET /me`, `PUT /profile` |
| `/api/patients` | `GET /`, `POST /`, `GET /export`, `GET|PUT|DELETE /:id`, `POST /:id/upload`, `GET|POST /:id/lab` |
| `/api/appointments` | `GET /`, `POST /`, `GET /today`, `GET|PUT|DELETE /:id` |
| `/api/mealplans` | `GET /`, `POST /`, `GET|PUT|DELETE /:id` |
| `/api/body-composition` | `POST /`, `GET /patient/:patientId`, `GET|PUT|DELETE /:id` |
| `/api/foods` | `GET /`, `GET /categories`, `POST /`, `GET|PUT|DELETE /:id` |
| `/api/diet-templates` | `GET /categories`, `GET /`, `POST /`, `GET|PUT|DELETE /:id`, `POST /:id/apply` |
| `/api/food-exchange` | `POST /equivalents`, `GET /by-category/:category`, `POST /batch` |
| `/api/clinical-notes` | `GET|POST /patient/:patientId`, `PUT|DELETE /:noteId` |
| `/api/payments` | `GET /summary`, `GET /`, `POST /`, `PUT|DELETE /:id` |
| `/api/dashboard` | `GET /stats`, `/weight-data`, `/pathology-data`, `/macro-data`, `/activity`, `/population` |
| `/api/calculations` | `POST /bmr`, `/tdee`, `/macros`, `/nutrition-plan`, `/body-composition` |
| `/api/cron` | `GET /reminders` (protegido por `CRON_SECRET`) |

**Validación.** `middleware/validators.js` cubre auth, pacientes (alta y edición), citas, pagos y planes con `express-validator`. Los operadores de MongoDB en el body (`{"patient": {"$gt": ""}}`) se rechazan con 400.

**Dos routers sin ningún consumidor.**

- `/api/calculations/*` + `services/nutritionCalculator.js` están completos y **nadie los llama**: la interfaz calcula en cliente con `src/lib/calculations/`. Se mantuvieron por si alguna vez se expone la API a terceros.
- `/api/food-exchange/*` (`/equivalents`, `/by-category/:category`, `/batch`) tampoco tiene consumidor. Su única pantalla, `FoodExchangeModal.jsx`, quedó huérfana. El intercambio de alimentos es funcionalidad clínica real que está a un `import` de distancia de funcionar.

---

## 5. Navegación

Siete destinos, reducidos desde once.

```
Principal   Panel · Pacientes · Agenda · Dietas · Herramientas
Cuenta      Finanzas · Cuenta y ajustes
```

`Dietas` y `Herramientas` son contenedores con pestañas, no páginas:

| Ruta | Contenido |
|---|---|
| `/dietas` | Planes del nutriólogo |
| `/dietas/plantillas` | Plantillas reutilizables |
| `/dietas/alimentos` | Catálogo de alimentos |
| `/dietas/nueva`, `/dietas/:id/editar` | Constructor (fuera del contenedor, pantalla completa) |
| `/herramientas` | Calculadoras clínicas |
| `/herramientas/estadisticas` | Estadísticas poblacionales |

`lib/redirects.js` mantiene **26 redirecciones** de URLs heredadas: los alias en inglés de la primera versión (`/patients`, `/appointments`, `/mealplans`…), las subrutas que renderizaban exactamente la misma vista que su padre (`/calculos/imc`, `/reportes/nuevo`, `/alimentos/nuevo`), y `/admin/*`, que se retiró del release. Vive en su propio módulo para que el router y las pruebas lean la misma tabla en vez de una copia.

### Las dos rutas que faltaban

`App.jsx` importaba `Finance` y `Profile` como *lazy* pero **nunca los montaba**. Las dos entradas del menú «Cuenta» caían en el comodín `*` y rebotaban al panel. Las páginas estaban completas y conectadas a la API; solo faltaban los dos `<Route>`. Corregido en `3098536`.

Lo que permitió que pasara importa más que el defecto:

- ESLint no marca el import sin usar con la configuración actual.
- La prueba se llamaba «todos sus destinos son rutas vivas, no redirecciones» y lo único que comprobaba era que el destino no estuviera en la tabla de redirecciones — nunca que resolviera a una ruta real.
- Las pruebas de redirección montan **una copia** del router construida a partir de esa tabla, así que ninguna llegaba a mirar el `<Routes>` de `App.jsx`.

Ahora la prueba lee el archivo fuente y verifica dos propiedades independientes: que cada destino del menú aparezca como `path` declarado, y que ninguna página importada con `lazy()` quede sin renderizar. Retirando los dos `<Route>` a mano, ambas fallan nombrando lo que falta.

## 6. Flujos

### Acceso
Pantalla partida: panel oscuro de marca a la izquierda, formulario a la derecha. Casilla "Mantener la sesión abierta en este equipo" (activa por omisión) que decide entre `localStorage` y `sessionStorage`. Al montar, `AuthContext` **verifica el token contra `GET /api/auth/me`** en vez de confiar en lo que haya guardado; un token caducado ya no deja la aplicación en un estado a medias.

### Alta de paciente — dos pasos
1. **Identificación** (4 campos) — guarda y ya existe el paciente.
2. **Datos clínicos iniciales** — saltable.

Antes eran 31 campos en un solo envío, todo o nada. Al terminar aparece un aviso de confirmación (`ToastContext`).

### Expediente — cuatro pestañas y un panel
`/pacientes/:id` con `Resumen` · `Evolución` · `Clínica` · `Dietas`.

- **Resumen** — datos generales, KPIs de peso/talla/IMC.
- **Evolución** — fusiona mediciones, laboratorio y actividad física. Gráficas contra `/api/body-composition/patient/:id`.
- **Clínica** — fusiona clínica, hábitos y las notas SOAP.
- **Dietas** — planes del paciente, con exportación a PDF.

Un **panel lateral persistente** (`PatientAlertPanel`) muestra alergias, alertas y próxima cita en cualquier pestaña. Las seis rutas de pestaña anteriores redirigen a la nueva que corresponde.

### Agenda
Listado con pestañas *Próximas* / *Historial*, alta en `/agenda/nueva`, y clic en una cita lleva al expediente del paciente. Los recordatorios salen del cron diario por correo y SMS.

### Constructor de dietas
`/dietas/nueva`. Arrastrar y soltar real con `@dnd-kit` (`DndContext` + `DragOverlay`), seis tiempos de comida, catálogo servido por `/api/foods`. Guarda con `navigate()`, sin recargar la SPA.

### Herramientas
- **Calculadoras** — TMB, IMC, composición corporal e IDR sobre `src/lib/calculations/`, funciones puras con respuesta inmediata.
- **Estadísticas** — `GET /api/dashboard/population`: distribución de IMC, prevalencias, evolución de peso.

### Finanzas
Alta de cobro, listado filtrable y KPIs desde `GET /api/payments/summary`. *(Inalcanzable hoy — ver §5.)*

---

## 7. Sistema de diseño

La fuente de verdad es la skill del proyecto, `.claude/skills/apple-style-frontend/SKILL.md`, no el CSS. Nueve reglas no negociables:

1. Un solo acento: `--accent: #0071E3`. Los estados semánticos van aparte.
2. Botones de acción siempre pastilla (`980px`). Contenedores de datos: 6 / 11 / 18px.
3. Tipografía del sistema únicamente. Ninguna fuente web para UI.
4. Cuatro pesos: 300, 400, 600, 700.
5. Una curva de easing, `cubic-bezier(0.4,0,0.6,1)`, en 0.24s o 0.32s.
6. Barras fijas con vidrio esmerilado, no color plano.
7. Una sola sombra: `0 3px 30px rgba(0,0,0,0.22)`.
8. Íconos SVG inline monocromáticos.
9. Contraste AA y foco de teclado visible antes de shippear.

**Marca.** Monograma "N" geométrico sobre azulejo `#0071E3`. Dos variantes que no son intercambiables: `brand-icon.svg` con esquinas a 22.5% para interfaz y favicon, y `brand-icon-square.svg` a sangre para los iconos que el sistema operativo enmascara — iOS compone las esquinas transparentes sobre negro. `scripts/build-favicon.mjs` genera los cuatro PNG y el `.ico` desde la fuente correcta y corre en `prebuild`.

**Componentes compartidos** en `src/design-system/components/`: `Badge`, `Button`, `Card`, `Combobox`, `ConfirmDialog`, `DataTable`, `Disclosure`, `FormSection`, `GlobalSearch`, `Input`, `Modal`, `PageHeader`, `SaveBar`, `Sidebar`, `Spinner`, `StatTile`, `StateViews`, `Tabs`, `Topbar`.

`index.css` bajó de 5.876 a 953 líneas; quedan 7 archivos CSS en todo el front end.

---

## 8. Calidad

| Comprobación | Estado |
|---|---|
| `npm run lint` | limpio |
| `npm run typecheck` | limpio |
| `npm test` | 80 pruebas en 5 archivos |
| `npm run build` | limpio |

Las pruebas cubren **lógica pura**: cálculos clínicos (21), el hook del planificador (11), los mapeadores de composición corporal (10), la traducción de errores de API (5) y el enrutado (33). **Las páginas no tienen pruebas de componente.**

`tsconfig.json` está acotado a `src/lib`, `src/hooks`, `src/types` y `src/utils` con `checkJs` apagado: la lógica se verifica, las páginas `.jsx` no.

**No queda mock data.** Una búsqueda de literales, marcadores `mock`/`demo`/`fake`, arrays de objetos quemados y `catch` que sustituyan datos falsos no devuelve nada. Los tres catálogos de alimentos hardcodeados, el paciente ficticio de respaldo y los KPIs inventados de estadísticas ya no existen. Los `const` en mayúsculas que aparecen en las pantallas son catálogos de dominio legítimos — la tabla MET de actividades, los paneles de laboratorio, los métodos de pago, las fórmulas de grasa corporal — no datos de relleno.

### Lo que ya se corrigió (contexto útil)
Una revisión anterior encontró una clase de fallo invisible desde fuera: las seis pestañas del expediente mostraban "Guardado" con palomita verde aunque la petición fallara; el esquema `Patient` no declaraba ninguno de los campos clínicos que esas pestañas enviaban, así que Mongoose los descartaba en silencio y el PUT devolvía 200; el expediente sustituía la respuesta fallida por un paciente inventado; el laboratorio guardaba contra una ruta inexistente; y los pliegues cutáneos se enviaban con una forma que el modelo tiraba.

De ahí salieron tres piezas que conviene conocer: `lib/apiError.js` (traduce el error de axios, incluido el caso en que la petición nunca llegó al servidor), `hooks/useSaveState.js` y `design-system/components/SaveBar.jsx`.

---

## 9. Deuda técnica conocida

### Registrada

- **`vite` y `react-router-dom` en `npm audit`.** El de `vite` afecta al servidor de desarrollo, no al build; subir de la 5 a la 8 arrastra un major en cadena con `@vitejs/plugin-react`. El de `react-router-dom` exige migrar a la v7. El resto del árbol está limpio y sin vulnerabilidades críticas.
- **Alias de tokens heredados.** `index.css` mantiene un bloque (`--text-primary`, `--surface-muted`, `--radius-md`…) que apunta a los tokens canónicos, para migrar por partes. Se borra cuando `grep -r "var(--text-primary" src` no devuelva nada. Igual con las paletas `emerald`/`gold`/`navy` de `tailwind.config.js`.
- **Hex literales sueltos.** Quedan colores a mano fuera del sistema de tokens: `Patients.jsx` usa `#E8C96A` y `#EF4444` en las tarjetas de resumen, y `CHART_PALETTE` en `DashboardInsights.jsx` son seis hex a pesar de que `--chart-*` ya existe en `index.css`.
- **`authorize` sin aplicar.** Definido en `middleware/auth.js`, no usado en ninguna ruta.
- **Módulo de licencias archivado** en `src/_archive/` junto con `ReportsHub.jsx`. Reactivarlo exige un modelo `License`, sus endpoints y `authorize('admin')` en servidor.
- **Doble captura antropométrica.** Peso, talla y pliegues viven a la vez en `Patient.anthropometry` y en la colección `BodyComposition`.

### Detectada en la última auditoría

- **Tres componentes huérfanos, 882 líneas.** Están completos y funcionan; nadie los monta.

  | Componente | JSX | CSS |
  |---|---:|---:|
  | `FoodExchangeModal` | 139 | 200 |
  | `SavePlanModal` | 169 | 43 |
  | `WeeklyCalendar` | 140 | 191 |

- **Tres motores de cálculo, no dos.** `src/lib/calculations/` lo usan las páginas; `src/utils/calculations.ts` lo usa `useMealPlanner`; `/api/calculations/*` no lo usa nadie. Los dos primeros están vivos a la vez y pueden divergir entre sí — la fusión prevista no se hizo.
- **El panel traga los errores.** `DashboardInsights.jsx:73-77` tiene cinco `.catch(() => ({ data: { data: [] } }))`. Un 500 se ve exactamente igual que «todavía no hay datos»: gráfica en blanco, sin aviso. Es el mismo patrón que se eliminó de las seis pestañas del expediente; sobrevivió aquí porque entonces los endpoints no existían y el `.catch` evitaba que la página reventara. Ya existen, así que dejó de ser un parche y pasó a ser una máscara.
- **`/api/food-exchange` sin consumidor** (ver §4), consecuencia directa del modal huérfano.
- **`NewAppointment.css`**, 474 líneas, es el CSS por página más grande que sobrevive a la limpieza.

### Comportamiento correcto, pero conviene saberlo

Correo, SMS y Cloudinary degradan bien: sin variables de entorno registran un `warn` y devuelven `false` en vez de reventar. El efecto es que **los recordatorios pueden no enviarse nunca sin que nada lo indique en la interfaz** — la señal queda solo en los logs del servidor.

## 10. Temas abiertos para conversar

1. **Unificar la historia clínica** en un solo esquema y migrar los datos existentes.
2. **Resolver la doble captura antropométrica**: `Patient.anthropometry` frente a `BodyComposition`.
3. **Decidir sobre los motores de cálculo**: fusionar `utils/calculations.ts` en `lib/calculations/`, y exponer o retirar `/api/calculations/*`.
4. **Rescatar o borrar el intercambio de alimentos**: el backend está hecho y la pantalla también; solo falta enlazarla.
5. **Multi-usuario y roles**: hoy `role` existe sin efecto. ¿Hace falta un consultorio con varios nutriólogos, o asistentes?
6. **Portal del paciente**: hoy el paciente no tiene acceso a nada. El plan se le entrega en PDF.
7. **Cobertura de pruebas de página** y verificación de tipos en `.jsx`.
8. **Vercel Pro**: recordatorios horarios en vez de diarios, cambiando solo el `schedule`.
