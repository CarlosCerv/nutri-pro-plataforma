# Scripts

Utilidades de línea de comandos para poblar y auditar la base de datos. No hay un
framework de migraciones (`migrate-mongo`, `umzug`, etc.) porque hasta ahora no ha
hecho falta transformar documentos ya existentes en producción — solo insertar datos
base o generarlos desde cero. El día que aparezca ese caso (por ejemplo, renombrar o
recalcular un campo sobre documentos que ya existen en producción), ahí sí conviene
adoptar uno; no antes.

| Script | npm script | Qué hace | Depende de | Idempotente | Dónde corre |
|---|---|---|---|---|---|
| `seedUsers.js` | `seed:users` | Borra **todos** los usuarios (`deleteMany({})`) y crea 2 de prueba (nutriólogo + admin) | — | Sí (siempre deja el mismo estado) | Solo desarrollo/CLI |
| `seedFoods.js` | `seed:foods` | Puebla el catálogo de alimentos (`Food`) | — | No verificado — revisar antes de correr dos veces en la misma BD | Solo desarrollo/CLI |
| `seedTemplates.js` | `seed:templates` | Crea 3 plantillas de dieta manuales (`DietTemplate`, `isSystemTemplate: true`) | `seed:users` (usa `createdBy`) | No verificado | Solo desarrollo/CLI |
| `seedGeneratedTemplates.js` | `seed:generated-templates` (o `:dry-run`) | Genera 340 plantillas de dieta por álgebra lineal contra el catálogo de `Food` | `seed:foods` (necesita el catálogo) y `seed:users` (necesita `createdBy`) | **Sí** — borra por `generatorTag: 'meal-algebra-v1'` antes de insertar, sin tocar las plantillas manuales de `seedTemplates.js` | Solo desarrollo/CLI |
| `auditPatients.js` | `audit:patients` | Solo lectura: cuenta pacientes sin `nutritionist` y muestra una muestra | — | N/A (no escribe) | Solo desarrollo/CLI |
| `testConnection.js` | `test:connection` | Diagnóstico: prueba la conexión a Mongo y lista colecciones | — | N/A (no escribe) | Solo desarrollo/CLI |
| `testReminders.js` | `test:reminders` | Dispara `reminderService.checkAndSendReminders()` contra la BD real — **envía notificaciones reales** si hay citas que califiquen | — | No — reenvía si `reminderSent` sigue en `false` | Solo desarrollo/CLI |
| `reminderCron.js` | — (no es un script CLI) | Exporta `startReminderCron()`, el cron real de recordatorios horarios | — | N/A | **Producción** — se invoca desde `server.js`/`index.js` al arrancar |

## Orden recomendado para poblar una base de datos vacía

```
npm run seed:all
```

Equivale a `seed:users → seed:foods → seed:templates → seed:generated-templates`, en ese
orden porque cada paso depende de datos del anterior (usuarios antes que `createdBy`,
alimentos antes que las plantillas que los referencian).

## Por qué `console.log` aquí y no el logger de `config/logger.js`

Los scripts de esta carpeta (excepto `reminderCron.js`, que sí usa el logger porque
corre en producción) son herramientas de línea de comandos de un solo uso: su
`console.log` es la salida esperada por quien los ejecuta a mano en una terminal, no
logging de aplicación que alguien vaya a consultar después en Vercel. Migrarlos al
logger estructurado no aportaría nada y complicaría leer su salida en la terminal.
