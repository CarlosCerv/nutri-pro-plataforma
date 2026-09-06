# NutriPro — índice de contexto para Claude Code

Plataforma SaaS para nutriólogos (gestión de pacientes, citas, planes de alimentación, cálculos clínicos, portal del paciente). Backend Node/Express/Mongoose (ESM), frontend React/Vite, desplegada como una sola app serverless en Vercel. Este archivo es el mapa rápido: qué documento leer y qué archivo tocar según el componente del que se trate — no repite el contenido, apunta a él.

## Documentación del proyecto — cuándo leer cada una

| Documento | Léelo cuando... |
|---|---|
| `docs/CONTEXTO-PLATAFORMA.md` | Necesites entender arquitectura, modelo de datos, flujos de negocio, sistema de diseño, o el estado curado de la deuda técnica y temas abiertos. Es la fuente de verdad general — **léelo primero** ante cualquier tarea que no sea trivial. |
| `docs/MANEJO-DE-ERRORES.md` | El usuario reporte un error operativo (500, 503, login roto, CORS, deploy que dejó de servir). Playbook de diagnóstico + catálogo de fallas ya conocidas. |
| `docs/BITACORA-ERRORES.md` | Antes de investigar un error desde cero — puede que ya esté diagnosticado o corregido. Regla: toda corrección de un error operativo termina con una entrada nueva o actualizada aquí. |
| `backend/README.md` | Vayas a tocar el backend por primera vez en la sesión: variables de entorno, scripts npm, estructura de carpetas. |
| `backend/src/scripts/README.md` | Vayas a correr o modificar un seed/script de `backend/src/scripts/` — qué depende de qué, cuáles son idempotentes, cuáles corren en producción. |
| `README.md` (raíz) | Instalación local, despliegue en Vercel, variables de entorno completas. |
| `.claude/skills/apple-style-frontend/SKILL.md` | Vayas a escribir o revisar CSS/estilos/componentes visuales — sistema de diseño obligatorio del proyecto (se autoactiva, pero puedes leerlo directo). |

## Regla no negociable: paridad de dependencias raíz ↔ backend

**Toda dependencia de runtime nueva en `backend/package.json` debe agregarse también a `dependencies` en el `package.json` de la raíz**, y correr `npm install` ahí para actualizar su `package-lock.json`. El build de Vercel (`vercel-build` en la raíz) solo instala `frontend/` — el bundle serverless se arma con las dependencias de la raíz, no las de `backend/`. Olvidar esto tumba **toda** la API con 500 desde el primer cold start (ya pasó una vez, con `pino`/`pino-http` — ver `docs/BITACORA-ERRORES.md`, entrada 2026-09-05). `devDependencies` del backend (como `pino-pretty`) no hace falta mirrorearlas.

## Índice de componentes

| Área | Backend | Frontend | Doc relevante |
|---|---|---|---|
| Autenticación | `controllers/authController.js`, `middleware/auth.js`, `routes/auth.js`, modelo `User.js` | `pages/Login.jsx`, `pages/Register.jsx`, `pages/auth/AuthLayout.jsx` | CONTEXTO §4 (API), MANEJO-DE-ERRORES Caso 1 (si falla *todo*, no solo login) |
| Pacientes / expediente | `controllers/patientController.js`, modelo `Patient.js` | `pages/Patients.jsx`, `pages/NewPatient.jsx`, `pages/PatientDetail.jsx`, `pages/patient-tabs/*` (General, Clínico, Antropometría, Laboratorio, Actividad Física, Hábitos, Evolución) | CONTEXTO §3 (modelo de datos), §9 (doble captura antropométrica: `Patient.anthropometry` vs `BodyComposition`) |
| Composición corporal | `controllers/bodyComposition.controller.js`, modelo `BodyComposition.js`, `services/nutritionCalculator.js` (BMR/TDEE/% grasa/IMC) | `pages/patient-tabs/MeasurementsTab.jsx`, `lib/calculations/{imc,tmb,bodyFat,idr}.js` | CONTEXTO §9 (posible redundancia `nutritionCalculator.js` ↔ `lib/calculations/bodyFat.js`, sin resolver) |
| Notas clínicas | `controllers/clinicalNotes.controller.js`, modelo `ClinicalNote.js` | `components/ClinicalNotesTab.jsx` | — |
| Citas / agenda | `controllers/appointmentController.js`, modelo `Appointment.js`, `services/reminderService.js`, `{email,sms,whatsapp}Service.js`, `scripts/reminderCron.js` (cron real de producción) | `pages/Appointments.jsx`, `pages/NewAppointment.jsx`, `pages/ConsultationSession.jsx` | CONTEXTO §6 (flujo de sesión de consulta), MANEJO-DE-ERRORES Caso 4 (recordatorios silenciosos) |
| Planes de alimentación | `controllers/mealPlanController.js`, `dietTemplates.controller.js`, `foods.controller.js`, `foodExchange.controller.js`, modelos `MealPlan.js`/`DietTemplate.js`/`Food.js`, `services/mealTemplateAlgebra.js` (álgebra de plantillas generadas) | `pages/MealPlans.jsx`, `pages/DietTemplates.jsx`, `pages/Dietas.jsx`, `pages/MenuBuilder.jsx` + `components/MenuBuilder/*`, `hooks/useMealPlanner.ts`, `lib/calculations/mealPlan.ts` | CONTEXTO §9 (motores de cálculo, ya resuelto — ver "Resuelto") |
| Cálculos clínicos (frontend) | — | `lib/calculations/{imc,tmb,bodyFat,idr,mealPlan}.js/.ts`, `pages/tools/CalculatorTab.jsx` | CONTEXTO §9 |
| Portal del paciente / público | `controllers/public.controller.js`, `whatsappWebhook.controller.js`, `routes/public.routes.js`, `routes/webhooks.routes.js`, modelo `PreConsultationToken.js` | `pages/public/{PatientPortal,PreConsultationWizard,PublicBooking,PublicPageShell}.jsx` | CONTEXTO §6, §9 (sin tests de estas pantallas) |
| Pagos | `controllers/paymentController.js`, `routes/paymentRoutes.js`, modelo `Payment.js` | `pages/Finance.jsx` | — |
| Dashboard | `controllers/dashboardController.js`, `routes/dashboard.routes.js` | `pages/Dashboard.jsx`, `components/Dashboard/*` (`ConsultaHoyHero`, `DashboardInsights`, `RadarEpidemiologico`, `RetencionRadar`) | CONTEXTO §9 (`DashboardInsights.jsx` traga errores de red como "sin datos") |
| Cron / recordatorios | `controllers/cron.controller.js`, `routes/cron.routes.js`, `scripts/reminderCron.js` | — | MANEJO-DE-ERRORES Caso 4, CONTEXTO §2 (límite de Vercel Hobby: cron diario) |
| Panel de administrador | `controllers/adminController.js`, `routes/admin.routes.js`, modelo `EmailCampaign.js`, `authorize('admin')` en `middleware/auth.js`, `scripts/promoteAdmin.js` | `pages/admin/*` (`AdminLayout`, `AdminDashboard`, `AdminNutritionists[Detail]`, `AdminCampaigns[New\|Detail]`) | CONTEXTO §6 ("Panel de administrador", "Correo a nutriólogos") |
| Correo a nutriólogos (bienvenida/reportes/campañas) | `services/emailService.js` (Resend), `services/usageReportService.js`, cron `GET /api/cron/usage-reports` | — | CONTEXTO §6, `backend/README.md` §"Correo a nutriólogos" |
| Logging / errores | `config/logger.js` (pino), `utils/asyncHandler.js`, error handler en `app.js` | `lib/apiError.js` | `docs/MANEJO-DE-ERRORES.md` completo |
| Subida de archivos | `services/cloudinaryService.js`, `middleware/uploadMiddleware.js` | — | README raíz (Cloudinary) |
| Frontend — API client | — | `services/api.js`, `services/publicApi.js`, `lib/apiError.js` | — |
| Sistema de diseño | — | todo `components/`, `index.css`, `tailwind.config.js` | `.claude/skills/apple-style-frontend/SKILL.md` |

## Testing — referencia rápida

```bash
cd backend && npm test          # Vitest + Supertest + mongodb-memory-server (56 tests)
cd frontend && npm test         # Vitest + Testing Library (175 tests)
cd frontend && npm run typecheck  # tsc --noEmit
```

Nota: `mongodb-memory-server` en esta máquina (macOS 13.7.8, Intel) necesita fijar una versión de MongoDB compatible (`7.0.14` en `backend/src/test/setup.js`) — la versión por defecto del paquete exige macOS 14+.

## Errores operativos en producción

Usa el skill `/fix-operational-error` o el agente `operational-debugger` (`.claude/agents/operational-debugger.md`) en vez de investigar un reporte de error desde cero — ambos conocen el playbook de `docs/MANEJO-DE-ERRORES.md` y el historial de `docs/BITACORA-ERRORES.md`.
