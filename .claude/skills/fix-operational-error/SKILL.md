---
name: fix-operational-error
description: Usa esta skill cuando el usuario reporte un error operativo de NutriPro (nutri-pro-plataforma) en producción o desarrollo — un endpoint que responde 500/503, login u otra ruta rota, un deploy que dejó de funcionar, CORS bloqueando el frontend, recordatorios que no salen. Actívala en cuanto describan el síntoma (URL, código de estado, captura de la pestaña de red, "esto ya no funciona"), en vez de investigar el error desde cero cada vez.
---

# fix-operational-error

Flujo para diagnosticar y corregir errores operativos de NutriPro con continuidad entre sesiones. No reinventes el diagnóstico: este proyecto ya tiene un playbook y un historial — úsalos primero.

## Paso 0 — Reúne el reporte

Antes de investigar, confirma (pregunta si falta algo crítico, no asumas):
- Endpoint o pantalla exacta donde ocurrió.
- Código de estado HTTP si se ve en la pestaña de red (500, 503, 401, 403...).
- Momento aproximado (ayuda a acotar los logs de Vercel).
- Si es reproducible siempre o intermitente, y si pasa en producción, en desarrollo local, o en ambos.

## Paso 1 — Revisa el contexto acumulado antes de investigar desde cero

1. Lee `docs/BITACORA-ERRORES.md`. Si ya hay una entrada para este mismo síntoma (aunque sea de otra sesión), continúa desde ahí — no repitas el diagnóstico.
2. Lee el catálogo de fallas conocidas en `docs/MANEJO-DE-ERRORES.md` §4. Los síntomas de "todo falla igual desde el primer deploy" o "todo falla con 503 de base de datos" tienen causa casi segura documentada ahí — descártalas primero, son las más baratas de verificar:
   ```bash
   diff <(node -e "console.log(Object.keys(require('./package.json').dependencies).sort().join('\n'))") \
        <(node -e "console.log(Object.keys(require('./backend/package.json').dependencies).sort().join('\n'))")
   ```

## Paso 2 — Decide profundidad: fix directo vs. delegar

- **Si el síntoma coincide con un caso ya catalogado** (§4 de `docs/MANEJO-DE-ERRORES.md`) y el fix es acotado a 1-2 archivos: corrígelo tú mismo, directo en esta conversación. Es más rápido que delegar.
- **Si requiere investigación multi-paso** (leer varios controladores, reproducir localmente, revisar varios servicios, no coincide con nada catalogado): lanza el agente `operational-debugger` con el Agent tool (`subagent_type: "operational-debugger"`), dándole en el prompt el reporte completo del Paso 0 y cualquier pista que ya hayas descartado en el Paso 1 (para que no la repita). Deja que la conversación principal siga libre mientras el agente investiga.

## Paso 3 — Verifica antes de dar por resuelto

- Corre `cd backend && npm test` si tocaste backend; `cd frontend && npm test && npm run typecheck` si tocaste frontend.
- Si es viable, reproduce el escenario real (por ejemplo, simular el bundle de Vercel localmente para bugs de dependencias — ver Caso 1 del playbook) en vez de confiar solo en que "el código se ve bien".

## Paso 4 — Cierra el ciclo (esto es la parte que da continuidad)

1. Actualiza `docs/BITACORA-ERRORES.md`: completa o crea la entrada (causa, fix, verificación, estado). Esto es obligatorio incluso si el fix parece trivial — es lo que evita que la próxima persona repita tu investigación.
2. Si el hallazgo cambia algo de `docs/CONTEXTO-PLATAFORMA.md` (una deuda técnica que se resolvió, una nueva que se detectó, un dato de arquitectura que quedó desactualizado), actualízalo ahí también.
3. No hagas commit ni push salvo que te lo pidan explícitamente.
4. Resume al usuario en pocas frases: qué estaba roto, la causa raíz (no el síntoma), qué cambiaste, y cómo lo verificaste.
