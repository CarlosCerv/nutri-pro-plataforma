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
