# NutriPro — Contexto de la plataforma

> Documento de contexto para conversar sobre mejoras. Describe lo que **hay hoy** en el repositorio, no lo que se planeó.
> Generado el 2026-08-31 sobre el commit `d36d8f8`; actualizado el 2026-09-04 sobre el commit `e72a393` (26 commits de diferencia — deploy, funcionalidades públicas/WhatsApp, landing page, mobile y el rediseño del constructor de dietas).

---

## 1. Qué es

SaaS para nutriólogos en consulta privada. Un profesional se registra, da de alta a sus pacientes, les lleva el expediente clínico y antropométrico, agenda consultas, les arma planes de alimentación y registra los cobros.

Es **multi-tenant por propietario**: cada documento de paciente, cita, plan y pago lleva un campo `nutritionist` y todas las consultas del backend filtran por el usuario del token. No hay organizaciones ni equipos — un nutriólogo, sus pacientes.

Idioma de la interfaz: español. Idioma del código: mezclado (los modelos y la API en inglés, las pantallas nuevas en español).

---

## 2. Stack y despliegue

| Capa | Tecnología |
|---|---|
| Front end | React 19, Vite 5, React Router 6, Tailwind 3, PropTypes, recharts, lucide-react, jsPDF + html2canvas |
| Back end | Node (ESM), Express 4, Mongoose 8, JWT, express-validator, multer |
| Base de datos | MongoDB Atlas |
| Integraciones | Cloudinary (documentos del paciente), Nodemailer (correo), Twilio (SMS y WhatsApp Business) |
| Pruebas | Vitest 3, Testing Library, jsdom |
| Despliegue | Vercel — `api/index.js` (con `api/[...path].js` de respaldo) exporta el `app` de Express directo como handler; el front end se sirve como estático |

El monorepo tiene tres `package.json`: raíz (concurrently + dependencias que Vercel necesita en el bundle serverless), `backend/` y `frontend/`.

**El constructor de dietas dejó de usar drag-and-drop.** El diseño con `@dnd-kit` (`DndContext` + `DragOverlay`) que describía la versión anterior de este documento se retiró (`e72a393`); la dependencia ya no está ni en `package.json`. `MenuBuilder` arma el plan con controles directos por fila (`components/MenuBuilder/`: `MealSlotCard`, `FoodRow`, `SubstitutesModal`, `MetaModal`, `StickyMacroBar`), sin arrastrar y soltar.

**La arquitectura de deploy pasó por varias iteraciones antes de estabilizarse.** La versión que describía este documento envolvía el `app` de Express con `serverless-http`; ese wrapper nunca reconocía el `req`/`res` crudos que le pasa una Vercel Node Function (que ya usa la firma `(req, res)` de `http.createServer`, no la de un handler Lambda con `event`/`context`), así que ninguna respuesta llegaba al cliente — ni siquiera en rutas sin lógica como `/api/health` — hasta que Vercel mataba la invocación por tiempo. `api/index.js` y `api/[...path].js` ahora exportan `app` directo. En el camino también se corrigió que la conexión a Mongo no se esperaba antes de atender peticiones (la primera consulta reventaba por "buffering timed out" en frío) y que el motivo real de un fallo de conexión no llegaba más allá de los logs de Vercel — ahora viaja en la respuesta 503, sin credenciales.

**Cron.** `vercel.json` declara una ejecución diaria a las 08:00 (`0 8 * * *`) contra `/api/cron/reminders`. Es un límite del plan Hobby, no una decisión de producto: solo permite una corrida al día. Para compensar, `reminderService.js` busca citas en una ventana de **0 a 36 horas** en vez de las 23–25 h originales, de modo que toda cita recibe su aviso al menos una vez. El flag `reminderSent` del modelo `Appointment` impide el reenvío. La ruta va autenticada con `CRON_SECRET` y falla cerrada (401 sin el header).

---

## 3. Modelo de datos

Diez colecciones en `backend/src/models/` (antes nueve — se sumó `PreConsultationToken`).

### `User` — el nutriólogo
`name`, `email`, `password` (bcrypt), `role`, `specialty`, `phone`, `firstAccess`.
El campo `role` existe y `middleware/auth.js` define `authorize(...roles)`, **pero `authorize` no se aplica en ninguna ruta**. Cualquier control de rol hoy es cosmético.

Se agregó `username` (único, minúsculas, valida formato) y el bloque `publicBooking` (`enabled`, `bio`, `services[]` con duración y precio, `workingHours[]` por día de la semana, `slotDurationMinutes`) para la página pública de agendamiento — ver §4 y §6.

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

### `PreConsultationToken` — token de un solo uso
`patient`, `nutritionist`, `tokenHash` (SHA-256; el valor crudo nunca se guarda, mismo patrón que un reset de contraseña), `expiresAt` (índice TTL — Mongo borra el documento solo al expirar), `usedAt`. Respalda el cuestionario pre-consulta autogestionado (§6).

`Patient` sumó además `portalToken` (único, disperso) para el portal ligero, y `preConsultationCompletedAt`.

---

## 4. La API

Catorce routers montados en `backend/src/app.js` (antes trece — se sumaron `/api/public` y `/api/webhooks`). **Todos exigen JWT salvo `/auth/register`, `/auth/login` y los dos routers públicos.**

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
| `/api/cron` | `GET /reminders` (protegido por `CRON_SECRET`) |
| `/api/public` | `GET|POST /pre-consultation/:token`, `GET /portal/:token`, `GET /portal/:token/sustitutos/:foodId`, `GET /booking/:username`, `GET /booking/:username/availability`, `POST /booking/:username` — **sin JWT** |
| `/api/webhooks` | `POST /twilio/whatsapp` — **sin JWT**, autenticado por la firma `X-Twilio-Signature` dentro del controlador |

**Validación.** `middleware/validators.js` cubre auth, pacientes (alta y edición), citas, pagos, planes y ahora también el cuestionario pre-consulta y el alta de citas por agendamiento público, con `express-validator`. Los operadores de MongoDB en el body (`{"patient": {"$gt": ""}}`) se rechazan con 400.

**Un router sin ningún consumidor, otro que ya se retiró.**

- `/api/food-exchange/*` (`/equivalents`, `/by-category/:category`, `/batch`) sigue montado y sin pantalla propia desde que `FoodExchangeModal.jsx` se borró por huérfano — pero desde entonces **sí tiene un consumidor interno**: `public.controller.js` reutiliza `findEquivalents()` de su controlador para los sustitutos del portal del paciente (`GET /api/public/portal/:token/sustitutos/:foodId`). El router HTTP en sí sigue sin nadie que lo llame desde fuera del backend.
- `/api/calculations/*` + `services/nutritionCalculator.js`, que este documento describía como código completo sin consumidor, **se archivó** (`f097cdf`) a `backend/src/_archive/calculations.controller.js` / `.routes.js` y ya no está montado en `app.js`. La interfaz sigue calculando en cliente con `src/lib/calculations/`.

---

## 5. Navegación

**Landing page.** `/` y `/landing` sirven `features/landing/LandingView.jsx` (fuera de `ProtectedRoute`): hero, `BentoGrid`, `PricingSection`, `ComparisonTable`, `RoiCalculator`, `FaqSection`, `MobileStickyCta`, mobile-first. Antes `/` no tenía landing propia.

**Rutas públicas sin sesión**, montadas junto a `/login` y `/register`: `/consulta/:token` (cuestionario pre-consulta), `/portal/:token` (portal ligero del paciente), `/@:username` (página de agendamiento). Ver §6.

Dentro de la app autenticada: siete destinos, reducidos desde once.

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
Listado con pestañas *Próximas* / *Historial*, alta en `/agenda/nueva`. Cada cita `scheduled` con paciente (no invitado) tiene un botón "Iniciar consulta" que abre la sesión de consulta (ver abajo); el resto lleva al expediente del paciente. Los recordatorios salen del cron diario por correo y SMS, y ahora también por **WhatsApp** (Twilio Business, ver más abajo).

### Sesión de consulta
`/agenda/:appointmentId/consulta` (`pages/ConsultationSession.jsx`). Se llega desde "Iniciar consulta" en la agenda o en el hero "Hoy en Consulta" del dashboard (`ConsultaHoyHero.jsx`). Tres secciones plegables sobre la cita:
1. **Antropometría de hoy** — peso, talla y presión arterial; guarda un `BodyComposition` con `appointment` apuntando a esta cita.
2. **Nota de la consulta (SOAP)** — el mismo formulario S/O/A/P de siempre, ahora con el sistema de diseño en vez de estilos sueltos; guarda un `ClinicalNote` también ligado a la cita. Análisis y Plan son obligatorios, igual que en el modelo.
3. **Plan de alimentación** — resumen del plan activo del paciente con acceso directo a editarlo o crear uno nuevo.

"Finalizar consulta" solo se habilita una vez guardada la nota, y cierra la cita (`status: 'completed'`) con `appointmentsAPI.update()`. "No asistió" y "Cancelar" quedan disponibles en todo momento, cada uno con su confirmación. Una cita ya cerrada abre la misma ruta en modo lectura, con un enlace al expediente.

### Constructor de dietas
`/dietas/nueva`, `/dietas/:id/editar`. Ya **no usa arrastrar y soltar**: el rediseño (`e72a393`) lo reemplazó por controles directos por fila sobre `components/MenuBuilder/` (`MealSlotCard`, `FoodRow`, `SubstitutesModal`, `MetaModal`, `StickyMacroBar`), seis tiempos de comida, catálogo servido por `/api/foods`. Guarda con `navigate()`, sin recargar la SPA.

### Herramientas
- **Calculadoras** — TMB, IMC, composición corporal e IDR sobre `src/lib/calculations/`, funciones puras con respuesta inmediata.
- **Estadísticas** — `GET /api/dashboard/population`: distribución de IMC, prevalencias, evolución de peso.

### Finanzas
Alta de cobro, listado filtrable y KPIs desde `GET /api/payments/summary`. *(Inalcanzable hoy — ver §5.)*

### Cuestionario pre-consulta (público, sin sesión)
El nutriólogo genera un enlace de un solo uso para un paciente (`PreConsultationToken`); el paciente lo abre en `/consulta/:token` (`PreConsultationWizard.jsx`) sin cuenta. `GET /api/public/pre-consultation/:token` valida que el token exista, no esté usado (410 si ya se respondió) y no haya expirado (410 con mensaje de "pide uno nuevo"), y solo entrega el nombre del paciente y del nutriólogo — nunca el expediente. Al enviar, `POST` acepta una **lista blanca explícita** de campos clínicos y de hábitos (antecedentes familiares, alergias, medicamentos, sueño, estrés, preferencias…), nunca `req.body` completo, porque el endpoint no tiene sesión que ate la escritura a un `nutritionist` de confianza. El token se marca `usedAt` y no vuelve a servir.

### Portal ligero del paciente (público, sin sesión)
`/portal/:token` (`PatientPortal.jsx`), identificado por `Patient.portalToken`. Muestra el plan de alimentación activo del paciente y una lista de compras consolidada (`services/shoppingList.js`), y permite consultar sustitutos de un alimento del plan (`GET /api/public/portal/:token/sustitutos/:foodId`, que reutiliza el motor de equivalencias de `/api/food-exchange`). Sin plan activo, responde con la lista vacía en vez de error.

### Página pública de agendamiento (público, sin sesión)
Cada nutriólogo puede activar `publicBooking` en su perfil (`username`, `bio`, `services[]` con duración/precio, `workingHours[]` por día de la semana). `/@:username` (`PublicBooking.jsx`) consulta `GET /api/public/booking/:username` (404 si no existe o no está activada), `GET .../availability` para los horarios libres de un día — calculado contra las citas ya existentes (`Appointment`) excluyendo las canceladas — y `POST /api/public/booking/:username` para crear la cita.

### Recordatorios por WhatsApp
`services/whatsappService.js` usa el canal de WhatsApp Business de Twilio (no SMS) para el recordatorio de cita; normaliza el teléfono a E.164 asumiendo lada de México (`+52`) si no trae una. `POST /api/webhooks/twilio/whatsapp` (`whatsappWebhook.controller.js`) recibe las respuestas del paciente; Twilio firma cada request y el controlador valida esa firma en vez de depender de JWT.

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

**Marca.** Monograma "N" geométrico sobre azulejo `#0071E3`. Dos variantes que no son intercambiables: `brand-icon.svg` con esquinas a 22.5% para interfaz y favicon, y `brand-icon-square.svg` a sangre para los iconos que el sistema operativo enmascara — iOS compone las esquinas transparentes sobre negro. `scripts/build-favicon.mjs` genera los cuatro PNG y el `.ico` desde la fuente correcta; ya **no** corre en `prebuild` — ese hook se quitó (`563cfc5`) porque regeneraba los favicons en cada build de Vercel. Ahora se invoca a mano con `npm run icons:build` cuando la fuente cambia.

**Componentes compartidos** en `src/design-system/components/`: `Badge`, `Button`, `Card`, `Combobox`, `ConfirmDialog`, `DataTable`, `Disclosure`, `FormSection`, `GlobalSearch`, `Input`, `Modal`, `PageHeader`, `SaveBar`, `Sidebar`, `Spinner`, `StatTile`, `StateViews`, `Tabs`, `Topbar`.

`index.css` bajó de 5.876 a 899 líneas; quedan 4 archivos CSS en todo el front end (`index.css`, `NewAppointment.css`, `PDFMealPlan.css`, `BackButton.css`), 1.679 líneas en total.

---

## 8. Calidad

| Comprobación | Estado |
|---|---|
| `npm run lint` | limpio |
| `npm run typecheck` | limpio |
| `npm test` | 171 pruebas en 8 archivos |
| `npm run build` | limpio |

Las pruebas cubren **lógica pura**: cálculos clínicos (21), el hook del planificador (11), los mapeadores de composición corporal (10), la traducción de errores de API (5), el enrutado (33 en `routing.test.jsx`) y, nuevo desde la versión anterior de este documento, `componentesDefinidos.test.js` (82, verifica que cada componente usado en JSX esté definido/importado) y `button.test.jsx` (6). **Las páginas no tienen pruebas de componente** más allá de esas verificaciones estructurales.

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

- **Dos motores de cálculo activos, no tres.** `src/lib/calculations/` lo usan las páginas; `src/utils/calculations.ts` lo usa `useMealPlanner`. Siguen vivos a la vez y pueden divergir entre sí — la fusión prevista no se hizo. (`/api/calculations/*`, el tercero, ya se archivó — ver "Resuelto".)
- **El panel traga los errores.** `DashboardInsights.jsx:73-77` tiene cinco `.catch(() => ({ data: { data: [] } }))`. Un 500 se ve exactamente igual que «todavía no hay datos»: gráfica en blanco, sin aviso. Es el mismo patrón que se eliminó de las seis pestañas del expediente; sobrevivió aquí porque entonces los endpoints no existían y el `.catch` evitaba que la página reventara. Ya existen, así que dejó de ser un parche y pasó a ser una máscara. Sigue así en `e72a393`.
- **`/api/food-exchange` sin pantalla propia**, aunque desde las funcionalidades públicas sí tiene un consumidor interno (el portal del paciente reutiliza `findEquivalents()` — ver §4). El router HTTP en sí sigue sin nadie que lo llame desde fuera.
- **Las cuatro pantallas públicas nuevas no tienen prueba de componente**, igual que el resto de las páginas (§8) — con el agravante de que no requieren sesión: un cambio que rompa la validación de token o de firma de Twilio no lo agarraría ninguna prueba automatizada.
- **`NewAppointment.css`**, 474 líneas, es el CSS por página más grande que sobrevive a la limpieza.
- **`seedGeneratedTemplates.js` no es idempotente ni forma parte de `seed:all`.** Genera 340 plantillas de sistema (17 rangos de calorías × 20 recetas) contra el catálogo de `Food`, pero a diferencia de `seedTemplates.js` no hace `deleteMany({isSystemTemplate:true})` antes de insertar — correrlo dos veces duplica las 340. Tampoco tiene entrada en `backend/package.json` (`seed:templates` sigue apuntando solo al script viejo de 3 plantillas). Quedan además 7 combinaciones (de 1700) con una porción de un solo alimento generosa pero no absurda (350-410g de frijol o pan repartido) en los rangos de más calorías — el propio script las señala en su reporte, no se corrigieron una por una.

### Resuelto

- **Rutas de `/finanzas` y `/perfil`** montadas, y la prueba que debía cubrirlas reescrita para que lea el `<Routes>` real (`3098536`).
- **Tres componentes huérfanos borrados** — `FoodExchangeModal`, `SavePlanModal` y `WeeklyCalendar`, 882 líneas entre JSX y CSS (`d36d8f8`).
- **`/api/calculations/*` archivado** (`f097cdf`) a `backend/src/_archive/`; ya no está montado en `app.js`. Cierra el tema abierto #3 a medias — sigue pendiente fusionar `utils/calculations.ts` con `src/lib/calculations/`.
- **Arquitectura de deploy estabilizada**: de `serverless-http` (que se colgaba en toda invocación, sin excepción) a exportar `app` de Express directo; Mongo se espera antes de atender rutas; el motivo de un fallo de conexión viaja en la respuesta. Varios commits (`2fe4363`, `72bd9a4`, `ad146c3`, `c93ba13`, `563cfc5`) hasta llegar al estado actual.
- **Menú hamburguesa roto y tablas sin adaptar a mobile**, corregidos (`13ea892`, `094cb2c`): tarjetas en vez de tablas con scroll horizontal, botones muertos eliminados.
- **Drag-and-drop del constructor de dietas**, retirado junto con la dependencia `@dnd-kit` (`e72a393`) — ver §2 y §6.
- **Flujo de sesión de consulta.** Existe una pantalla dedicada (`/agenda/:appointmentId/consulta`, `pages/ConsultationSession.jsx`) que reemplaza los cuatro huecos que documentaba esta sección: "Iniciar consulta" (dashboard y agenda) ya no cae en el expediente general; `Appointment.consultation` (el subdocumento muerto) se retiró del modelo; `ClinicalNote` y `BodyComposition` ganaron un campo `appointment` opcional, así que la nota y la medición de una visita quedan ligadas a la cita que las originó; y "Finalizar consulta" es el primer punto del frontend que llama `appointmentsAPI.update()` para cerrar el `status` (`completed`/`no_show`/`cancelled` desde la propia pantalla, y también desde `Appointments.jsx`). Ver §6 para el flujo completo.

### Comportamiento correcto, pero conviene saberlo

Correo, SMS y Cloudinary degradan bien: sin variables de entorno registran un `warn` y devuelven `false` en vez de reventar. El efecto es que **los recordatorios pueden no enviarse nunca sin que nada lo indique en la interfaz** — la señal queda solo en los logs del servidor.

## 10. Temas abiertos para conversar

1. **Unificar la historia clínica** en un solo esquema y migrar los datos existentes.
2. **Resolver la doble captura antropométrica**: `Patient.anthropometry` frente a `BodyComposition`.
3. **Fusionar los dos motores de cálculo del front end**: `utils/calculations.ts` (usa `useMealPlanner`) contra `lib/calculations/` (usan las páginas). `/api/calculations/*` ya se archivó, así que este punto quedó reducido a los dos que siguen vivos en el cliente.
4. **`/api/food-exchange` sigue sin pantalla para el nutriólogo**: ya no está huérfano del todo — el portal público del paciente lo consume internamente para sugerir sustitutos —, pero nadie en la app autenticada puede usarlo directamente. Falta decidir si vale la pena una interfaz para el nutriólogo o si el uso desde el portal es suficiente.
5. **Multi-usuario y roles**: hoy `role` existe sin efecto. ¿Hace falta un consultorio con varios nutriólogos, o asistentes?
6. **Profundizar el portal del paciente**: ya existe (`/portal/:token`) y muestra el plan activo, lista de compras y sustitutos — antes el paciente no tenía ningún acceso y el plan solo se entregaba en PDF. Queda por decidir cuánto más se le expone (historial, próximas citas, seguimiento de peso).
7. **Cobertura de pruebas de página** en las pantallas autenticadas (incluida la nueva sesión de consulta) y en las cuatro pantallas públicas (pre-consulta, portal, agendamiento, webhook de WhatsApp), y verificación de tipos en `.jsx`.
8. **Vercel Pro**: recordatorios horarios en vez de diarios, cambiando solo el `schedule`.
9. **Profundizar la sesión de consulta.** La primera versión (§6) cubre antropometría, nota SOAP y plan de alimentación con cierre de la cita. Queda por decidir: si "Agendar siguiente cita" debe prellenar al paciente en `/agenda/nueva` (hoy solo enlaza, `NewAppointment.jsx` no lee query params); si la valoración inicial completa (pliegues cutáneos, perímetros) debe poder capturarse desde la sesión o sigue exclusiva de la pestaña Evolución; y si vale la pena mostrar en el expediente qué nota/medición salió de qué cita, ahora que `ClinicalNote` y `BodyComposition` tienen el campo `appointment` para hacerlo.
