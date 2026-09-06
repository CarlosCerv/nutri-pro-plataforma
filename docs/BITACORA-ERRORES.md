# Bitácora de errores operativos

Registro cronológico de errores reportados en producción, para que retomar uno no dependa de la memoria de quien lo vio la primera vez. Cada entrada nueva va **arriba**. El skill `/fix-operational-error` y el agente `operational-debugger` leen y actualizan este archivo — ver `docs/MANEJO-DE-ERRORES.md` para el playbook de diagnóstico y `docs/CONTEXTO-PLATAFORMA.md` para el estado curado de la deuda técnica (esta bitácora es el registro crudo, esa es el resumen).

## Plantilla para una entrada nueva

```
### AAAA-MM-DD — <resumen corto del síntoma>

- **Estado:** reportado / en diagnóstico / corregido, pendiente de deploy / corregido y verificado en producción
- **Reportado por:** cómo llegó el reporte (URL, código de estado, captura, "un usuario dijo que...")
- **Síntoma:** qué se observó exactamente
- **Causa:** (llenar al diagnosticar)
- **Fix:** archivos tocados / commit
- **Verificación:** cómo se confirmó que quedó resuelto
```

---

### 2026-09-05 — Login exitoso (200) pero no redirige al dashboard, sin error visible

- **Estado:** corregido y verificado contra producción (endpoints reales), pendiente de deploy.
- **Reportado por:** el usuario, justo después de que el 500 de login (entrada de abajo) dejó de reproducirse — "ahora logeándome no me redirecciona al dashboard principal". Confirmó: en producción, se queda en `/login` sin ningún mensaje de error visible.
- **Síntoma:** el formulario de login termina de cargar y la pantalla se queda en `/login`. No hay banner rojo de error, lo que descarta que `authAPI.login` haya devuelto un 4xx/5xx manejado por `Login.jsx`.
- **Diagnóstico:** se reprodujo el flujo completo contra la API real de producción con una cuenta de prueba desechable (creada y borrada en la misma sesión): `POST /api/auth/register` → `POST /api/auth/login` → `GET /api/auth/me`, `GET /api/dashboard/stats`, `GET /api/payments/summary` con el token recién emitido — los cinco devolvieron 200 con JSON correcto. Esto descartó cualquier causa de backend (el Caso 6 de abajo, JWT_SECRET, CORS, etc.) para este síntoma en particular.
- **Causa:** bug de frontend en `frontend/src/contexts/AuthContext.jsx`. `login()` guardaba el token nuevo en `localStorage` (si "recordarme" está tildado) o en `sessionStorage` (si no), pero nunca limpiaba el otro almacén. El interceptor de peticiones de `frontend/src/services/api.js` arma el header `Authorization` leyendo `localStorage.getItem('token') || sessionStorage.getItem('token')` — `localStorage` siempre gana. Si quedó un token viejo/expirado en `localStorage` de una sesión anterior (p. ej. probar primero con "recordarme" tildado y después destildado, algo muy probable durante las pruebas repetidas de la entrada de abajo) y el login actual escribe el token fresco en `sessionStorage`, la primera petición autenticada tras el login manda el token viejo, recibe 401, y el interceptor de respuesta de `services/api.js` limpia todo el almacenamiento y fuerza `window.location.href = '/login'` — una recarga completa, sin pasar por el estado de error de `Login.jsx`. De ahí "se queda en login sin error visible".
- **Fix:** `frontend/src/contexts/AuthContext.jsx` — tanto `login()` como `register()` ahora limpian explícitamente el almacén que NO usan (`sessionStorage.removeItem(...)` cuando se guarda en `localStorage`, y viceversa), para que nunca convivan dos tokens de sesiones distintas.
- **Verificación:** los 172 tests de `frontend/` siguen en verde. No se pudo forzar el escenario exacto (token viejo en el otro almacén) porque requeriría automatizar un navegador real, que no está disponible en esta sesión — la corrección es directa por inspección de código y consistente con el síntoma reportado. Si vuelve a pasar tras el deploy, lo primero a revisar en el navegador del usuario es `localStorage` y `sessionStorage` (pestaña Almacenamiento en las herramientas de desarrollo) por un `token` residual en el almacén contrario al que se está usando.

---

### 2026-09-05 — 500 en login con el JSON genérico de Vercel (`{"error":{"code":"500","message":"A server error has occurred"}}`), no con el formato de esta API

- **Estado:** corregido (mitigación de causa raíz + mejoras de diagnóstico), pendiente de confirmación del usuario tras el deploy — no se pudo confirmar la causa exacta porque no hay acceso a los Runtime Logs de Vercel desde esta sesión.
- **Reportado por:** el usuario, pegando el body exacto de la respuesta de error.
- **Síntoma:** el body de la respuesta no tenía la forma `{success:false, message, error}` que produce esta API (`asyncHandler` / error handler de `app.js`), sino `{"error":{"code","message"}}` — la página genérica que sirve la plataforma de Vercel cuando una función serverless muere antes de poder responder. Login funcionaba sin problema en local contra la misma base de datos de Atlas (probado con credenciales inválidas → 401 correcto, y con body vacío → 400 de validación correcto), lo que descarta un bug de lógica en `authController.js`. Se documentó como Caso 6 nuevo en `docs/MANEJO-DE-ERRORES.md` §4 porque no hay forma de reproducirlo localmente (requiere una conexión de Mongoose cacheada entre invocaciones "frías" de Vercel, algo que no existe en un proceso local de un solo arranque).
- **Causa:** la más probable — no confirmada en logs — es que `mongoose.connect()` en `backend/src/config/database.js` cacheaba la conexión en `global.mongoose` para reusarla entre invocaciones, pero nunca registraba un listener para el evento `'error'` de esa conexión. Si el socket se cae entre invocaciones (Vercel congela/descongela la función), Mongoose emite `'error'` sin nadie escuchando → Node lo relanza como excepción no capturada → el proceso entero muere → Vercel devuelve su página de error genérica en vez de un 500 de nuestra API. Se revisó también la posibilidad de que faltara `JWT_SECRET` en las variables de entorno de Vercel Production (funcionaría en local por tener `.env` propio y fallar solo en producción), pero ese caso produciría el JSON normal de `asyncHandler`, no el genérico de Vercel — queda como hipótesis secundaria documentada en el Caso 6, no descartada del todo.
- **Fix:**
  - `backend/src/config/database.js`: se agregaron listeners `mongoose.connection.on('error', ...)` y `.on('disconnected', ...)` justo después del primer connect exitoso (una sola vez, con la bandera `cached.listenersAttached`), que invalidan la caché (`cached.conn = null; cached.promise = null`) para forzar una reconexión limpia en la siguiente petición en vez de dejar el proceso en un estado que vuelve a crashear.
  - `backend/src/utils/asyncHandler.js` y `backend/src/app.js`: toda respuesta de error de esta API ahora incluye `requestId` (el `req.id` que ya asigna `pino-http`), y se loguea junto con el error — implementa la mejora #1 que ya estaba en el backlog de `docs/MANEJO-DE-ERRORES.md` §5. Esto no habría evitado este incidente puntual (el proceso muere antes de llegar a estos handlers), pero cierra la brecha para cualquier otro 500 que sí pase por la API.
  - `backend/src/controllers/authController.js`: `generateToken()` ahora lanza un mensaje explícito si falta `JWT_SECRET` en vez del genérico de `jsonwebtoken`, para que ese caso específico (si ocurre) sea diagnosticable desde la respuesta sin tener que ir a Vercel.
  - `docs/MANEJO-DE-ERRORES.md`: nuevo Caso 6 en el catálogo (§4), y se cerró la mejora #1 del backlog (§5).
- **Verificación:** los 46 tests de `backend/` siguen en verde. Se corrió el backend localmente contra la base de datos real de Atlas (misma `MONGODB_URI` de `.env`) y se probó `/api/auth/login` con credenciales inválidas (401 correcto) y body vacío (400 de validación correcto) — la lógica de login en sí no tiene el bug. **No se pudo verificar la causa raíz exacta** porque esta sesión no tiene acceso al CLI de Vercel ni a sus Runtime Logs — falta confirmar en el dashboard de Vercel, para el momento exacto del reporte, si la línea de log corresponde a un crash de proceso (sin el patrón de `asyncHandler`) o a algo distinto (revisar también que `MONGODB_URI` y `JWT_SECRET` estén configuradas en Vercel → Settings → Environment Variables, para el entorno **Production** específicamente, no solo Preview/Development).

---

### 2026-09-05 — 500 en `/api/auth/login`, no se podía iniciar sesión con un usuario de prueba

- **Estado:** corregido y verificado en producción
- **Reportado por:** el usuario, con la URL exacta (`https://nutri-pro-plataforma-five.vercel.app/api/auth/login`), estado 500, vía las herramientas de red del navegador.
- **Síntoma:** login fallaba con 500. No era exclusivo de login — cualquier ruta habría fallado igual, porque el problema estaba en el arranque del módulo, no en la lógica de autenticación.
- **Causa:** `pino`/`pino-http` se habían agregado a `backend/package.json` (para el logger estructurado) pero no al `package.json` de la raíz, que es el que Vercel usa para instalar las dependencias del bundle serverless (`vercel-build` solo instala `frontend/`). El `import` de `pino` en `config/logger.js` (cargado desde el arranque por `app.js`) no resolvía en producción → la función serverless completa tumbaba en el primer cold start. Ver Caso 1 en `docs/MANEJO-DE-ERRORES.md`.
- **Fix:**
  - `package.json` (raíz): se agregaron `pino` y `pino-http` a `dependencies`, y se regeneró `package-lock.json`.
  - `backend/src/config/logger.js`: se hizo el `transport` de `pino-pretty` defensivo (`require.resolve` antes de usarlo) para que una dependencia de logging faltante caiga a JSON plano en vez de tumbar el logger entero — así esta clase de error no vuelve a producir un 500 total si se repite con otro paquete.
  - `README.md` y `docs/CONTEXTO-PLATAFORMA.md`: se documentó la regla de mantener `dependencies` en sync entre `backend/package.json` y el `package.json` raíz.
- **Verificación:** se simuló el escenario de Vercel localmente (moviendo `backend/node_modules` fuera del camino y corriendo `node -e "import('./api/index.js')"` con `NODE_ENV=production`) antes y después del fix — reproducía el fallo exacto (`Cannot find module`) y luego cargaba limpio. Los 46 tests de `backend/` siguen en verde. Pendiente de confirmación del usuario tras el deploy a Vercel.
