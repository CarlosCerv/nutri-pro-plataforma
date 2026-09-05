# NutriPro — Manejo de errores y diagnóstico operativo

Runbook de referencia para diagnosticar y corregir errores en producción (Vercel). Está pensado para consultarse en el momento en que alguien reporta "esto no funciona" — no es documentación de arquitectura general (para eso ver `docs/CONTEXTO-PLATAFORMA.md`).

Lo usan: el skill `/fix-operational-error` y el agente `operational-debugger` (ver `.claude/skills/` y `.claude/agents/`), y cualquier sesión de Claude Code que reciba un reporte de error de la plataforma.

## 1. Cómo fluye un error hoy

```
Petición HTTP
  └─ pino-http (backend/src/app.js)         — asigna un req.id, loguea inicio/fin de cada petición
       └─ CORS → express.json → middleware de espera de Mongo (connectDB())
            └─ Ruta (backend/src/routes/*.js)
                 └─ Controlador envuelto en asyncHandler (backend/src/utils/asyncHandler.js)
                      ├─ Éxito → responde normal
                      └─ Excepción → asyncHandler la atrapa, hace logger.error({err}, message)
                                       y responde { success:false, message, error: error.message }
                                       — NO pasa por el middleware de abajo.
       └─ (solo si algo llama a next(err) en vez de tirar dentro de un asyncHandler)
            └─ Error handler centralizado (app.js, último middleware, 4 argumentos)
                 → logger.error({err}, 'Unhandled error')
                 → responde { success:false, message, error } (error completo solo si NODE_ENV=development)
```

**Dos caminos, no uno.** Casi todos los controladores usan `asyncHandler`, así que casi todos los errores se resuelven ahí, no en el middleware de 4 argumentos de `app.js`. Ese middleware solo atrapa lo que un `next(err)` explícito le mande, o un error que ocurra en un middleware que no sea un controlador (p. ej. un fallo dentro de `express.json()` al parsear un body corrupto). Si estás buscando dónde se generó la respuesta de error de una ruta, casi siempre es el `{ message }` que se le pasó a `asyncHandler(fn, { status, message })` al envolver esa ruta — no el mensaje genérico `'Unhandled error'`.

El logger (`backend/src/config/logger.js`, pino) imprime JSON a stdout en producción — eso es lo que Vercel indexa como "Runtime Logs".

## 2. Dónde ver los errores hoy

No hay ningún servicio de error tracking (Sentry, Bugsnag, etc.) ni alertas proactivas — **si nadie va a revisar los logs, nadie se entera de un error hasta que un usuario lo reporta.** El único lugar donde vive la evidencia es:

1. **Vercel → el proyecto → pestaña "Logs" (Runtime Logs)**, filtrable por función, ruta y ventana de tiempo. Cada línea es el JSON que emite pino — busca por `"level":50` (error) o `"level":40` (warn), o por el campo `module` si el error vino de un servicio (`cloudinary`, `sms`, `email`, `whatsapp`, `reminder-service`, `cron`, `auth`, `cors`, `upload`, `whatsapp-webhook`).
2. **Vercel → "Deployments" → el deployment activo → "Build Logs"** — solo relevante si el error ocurre en *todas* las peticiones desde el primer momento del deploy (ver §4, caso 1): eso apunta a un problema de build/dependencias, no de lógica de negocio.
3. **La respuesta HTTP misma** — el body de error (`{ success:false, message, error }`) es lo único que ve el usuario/frontend. En producción (`NODE_ENV=development` es falso) el campo `error` del error handler centralizado se oculta (`{}`), pero el de `asyncHandler` siempre manda `error: error.message` — a veces alcanza para diagnosticar sin tocar Vercel.

### La limitación real: no hay forma de correlacionar un reporte con su log

`pino-http` genera un `req.id` interno y lo incluye en cada línea de log de esa petición. **Desde 2026-09-05 este id también viaja en la respuesta al cliente** como `requestId`, tanto en `asyncHandler` como en el error handler centralizado de `app.js` — si un usuario dice "me dio 500 al hacer login", ese `requestId` de la respuesta es una búsqueda exacta en los Runtime Logs de Vercel, no una ventana de tiempo aproximada. La única excepción es el Caso 6 de §4: si el proceso muere antes de que Express responda, la respuesta es la página genérica de Vercel y no trae `requestId` — ahí no queda otra que acotar por ruta + hora.

## 3. Qué SÍ funciona bien hoy

- El saneo de credenciales de `MONGODB_URI` antes de loguearla o devolverla en una respuesta (`app.js`, regex `.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')`) — nunca se ha filtrado una credencial en un log ni en una respuesta.
- La verificación de ownership (`utils/ownership.js`) devuelve 403/404 consistentes — estos no son "errores" en el sentido de bugs, son respuestas esperadas; no las persigas como si fueran un 500.
- Los 46 tests de backend (`backend/src/__tests__/`) cubren varios de los casos 4xx esperados — si un reporte de "error" resulta ser uno de esos casos, probablemente ya hay un test que documenta el comportamiento correcto.

## 4. Catálogo de fallas conocidas (empieza aquí antes de investigar desde cero)

### Caso 1 — Todas las rutas devuelven 500 desde el primer deploy, sin excepción

**Síntoma:** cualquier endpoint falla, incluido `/api/health`, y falla igual desde la primera petición tras un deploy (no es intermitente).

**Causa casi segura: falta una dependencia en el `package.json` de la raíz.** El bundle serverless de Vercel se arma con las dependencias del `package.json` **raíz**, no las de `backend/package.json` — el `vercel-build` de la raíz solo corre `npm install` dentro de `frontend/`. Si `backend/` importa un paquete nuevo y no se refleja en la raíz, el `import` revienta en el primer cold start (module not found) y tumba toda la función, no solo la ruta que estabas probando.

**Diagnóstico:**
```bash
diff <(node -e "console.log(Object.keys(require('./package.json').dependencies).sort().join('\n'))") \
     <(node -e "console.log(Object.keys(require('./backend/package.json').dependencies).sort().join('\n'))")
```
Cualquier línea que aparezca del lado de `backend/package.json` y no del lado de la raíz es una dependencia faltante en el bundle de Vercel.

**Fix:** agregar la(s) dependencia(s) faltante(s) a `dependencies` en el `package.json` raíz (no a `devDependencies` — esas no hace falta mirrorearlas), correr `npm install` en la raíz para actualizar `package-lock.json`, commitear ambos.

*(Este caso ya ocurrió una vez: `pino`/`pino-http` se agregaron a `backend/package.json` para el logger estructurado, sin reflejarlos en la raíz — tumbó login y cualquier otra ruta hasta que se corrigió. Ver `docs/CONTEXTO-PLATAFORMA.md` §2 y `docs/BITACORA-ERRORES.md`.)*

### Caso 2 — Todo falla con 503 "No se pudo conectar a la base de datos"

**Causa:** `MONGODB_URI` no está configurada en las variables de entorno de Vercel para ese entorno (Production/Preview/Development son independientes en Vercel — es fácil configurar una y olvidar la otra), o el cluster de Atlas no tiene la IP de Vercel en su whitelist (Atlas Network Access — Vercel usa IPs dinámicas, así que el proyecto debería tener `0.0.0.0/0` permitido, o Atlas Private Endpoint si se requiere más seguridad).

**Diagnóstico:** el `reason` que viaja en la respuesta 503 ya trae el mensaje real del driver de Mongo (sin credenciales) — casi siempre alcanza para saber si es una URI mal escrita, una IP bloqueada, o el cluster caído/pausado.

### Caso 3 — Un endpoint específico da 500 con un stack trace de Mongoose (`ValidationError`, `CastError`)

**Causa:** el body de la petición no cumple el schema de Mongoose (campo requerido faltante, tipo incorrecto, `ObjectId` inválido en un parámetro de ruta). Esto normalmente debería ser un 400, no un 500 — si ves esto, es una oportunidad de mejorar el controlador (capturar el error de Mongoose específicamente y responder 400 con un mensaje claro, como ya hace `authController.updateProfile` con el índice único de `username`), no solo parchear el síntoma.

**Diagnóstico:** el mensaje de `asyncHandler` incluye `error.message`, que para estos casos trae el nombre del campo que falló.

### Caso 4 — Los recordatorios (email/SMS/WhatsApp) no se envían y nadie se entera

**No es un bug** — es un comportamiento documentado: si falta configurar `EMAIL_HOST`/`TWILIO_*`, el servicio correspondiente registra un `warn` y devuelve `false` en vez de reventar (ver `docs/CONTEXTO-PLATAFORMA.md`, "Comportamiento correcto, pero conviene saberlo"). Si un usuario reporta "mis pacientes no reciben recordatorios", primero revisa que esas variables de entorno estén configuradas en Vercel antes de asumir que hay un bug en `reminderService.js`.

### Caso 5 — CORS bloquea el frontend (`Blocked origin` en los logs)

**Causa:** el dominio desde el que se sirve el frontend no está en `allowedOrigins` (`app.js`) ni coincide con `FRONTEND_URL`. Los subdominios `*.vercel.app` y `localhost:*` están permitidos por defecto — esto casi siempre pasa con un dominio custom nuevo que no se agregó a `FRONTEND_URL` en las variables de entorno de Vercel.

### Caso 6 — 500 con el JSON genérico de Vercel (`{"error":{"code":"...","message":"A server error has occurred"}}`), no con el `{success:false,...}` de esta API

**Cómo distinguirlo del resto:** todos los demás casos de este catálogo devuelven el formato de esta API (`{success:false, message, error, requestId}` — ver §1). Si en cambio el body de la respuesta trae la forma `{"error":{"code","message"}}`, **el proceso de la función serverless murió antes de que Express pudiera responder** — no es un error de lógica de negocio, es un crash de plataforma. Esto es compatible con login (o cualquier ruta) funcionando perfecto en desarrollo local contra la misma base de datos, y fallando solo en producción de forma intermitente.

**Causa más probable: un `EventEmitter` sin listener para `'error'` en la conexión de Mongoose cacheada entre invocaciones.** `backend/src/config/database.js` cachea la conexión en `global.mongoose` para reusarla entre invocaciones "calientes" de la misma función (evita reconectar en cada request). Si el socket subyacente se cae entre invocaciones — algo normal cuando Vercel congela/descongela la función — Mongoose emite `'error'` en el objeto de conexión que quedó vivo de una petición anterior. Node relanza un `'error'` sin listener como excepción no capturada, lo cual mata el proceso entero: de ahí la página genérica de Vercel en vez de un 500 con nuestro JSON. Corregido agregando `mongoose.connection.on('error', ...)` y `.on('disconnected', ...)` justo después del primer connect exitoso (una sola vez, no en cada llamada a `connectDB()`), invalidando la caché (`cached.conn = null; cached.promise = null`) para forzar una reconexión limpia en la siguiente petición en vez de dejar el proceso muerto o sirviendo una conexión rota.

**Otras causas a descartar primero, más baratas de verificar:**
- Caso 1 de este catálogo (dependencia faltante en el `package.json` raíz) — mismo síntoma si el crash ocurre en el import inicial en vez de a mitad de una conexión ya establecida.
- Una variable de entorno que existe en `.env` local pero no se configuró en Vercel para el entorno correcto (Production/Preview/Development son independientes) — p. ej. `JWT_SECRET` ausente en Vercel Production haría fallar el login solo ahí. Desde `backend/src/controllers/authController.js`, `generateToken()` ahora lanza un mensaje explícito (`'JWT_SECRET no está configurado en este entorno.'`) en vez del genérico de `jsonwebtoken`, pero **ese mensaje solo llega si el proceso no murió antes** — si lo que se ve es el JSON genérico de Vercel, hay que revisar el caso de arriba primero.

**Diagnóstico:** no hay forma de confirmarlo sin ver los Runtime Logs de Vercel del momento exacto del reporte (buscar una línea que corte sin el patrón habitual de `asyncHandler`/error handler, o un stack trace de Node fuera de cualquier request loggeado) — no es reproducible localmente si la base de datos y el código son los mismos, porque localmente cada arranque crea una conexión nueva en vez de reusar una cacheada entre invocaciones frías/congeladas.

## 5. Mejoras recomendadas (no implementadas — quedan como backlog)

Documentado aquí para que quien retome esto no tenga que re-descubrirlo:

1. ~~Incluir el `req.id` de pino-http en el body de toda respuesta de error~~ — hecho el 2026-09-05 (`requestId` en `asyncHandler` y en el error handler centralizado; ver §2 y Caso 6 de §4).
2. **Unificar los dos caminos de error** (`asyncHandler` vs. el middleware de 4 argumentos) para que todo pase por un solo punto con un formato de respuesta y de log verdaderamente consistente.
3. **Distinguir errores esperados (4xx) de inesperados (5xx) en el nivel de log** — hoy varios controladores no diferencian, así que un log a nivel `error` no siempre significa "algo se rompió", a veces es "un usuario mandó datos inválidos".
4. **Considerar un servicio de error tracking** (Sentry tiene tier gratuito e integración directa con Express) si el volumen de errores no reportados por usuarios empieza a ser un problema — hoy la única señal es que alguien se queje.
5. **Un `/api/health/deep`** que verifique conectividad real a Mongo (no solo "el proceso está vivo") — útil para detectar el Caso 2 antes de que un usuario lo reporte.
