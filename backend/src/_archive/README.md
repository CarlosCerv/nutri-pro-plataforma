# Código archivado

Routers que estaban montados en `app.js` y desplegados en producción sin que
ningún cliente los llamara. Se retiran del arranque pero se conservan aquí
porque los dos responden a necesidades reales que pueden volver.

Sus rutas devuelven ahora 404. Los `import` relativos siguen siendo válidos
desde esta carpeta —está al mismo nivel que `routes/` y `controllers/`— salvo
los que apuntaban entre ellos, que pasaron a ser relativos a `_archive/`.

## `/api/calculations`

`calculations.routes.js` y `calculations.controller.js`. Exponía
`POST /bmr`, `/tdee`, `/macros`, `/nutrition-plan` y `/body-composition`.

Nunca tuvo consumidor: la interfaz calcula en el cliente con
`frontend/src/lib/calculations/` (`tmb.js`, `imc.js`, `bodyFat.js`, `idr.js`),
que da respuesta inmediata mientras el nutriólogo captura y está cubierto por
21 pruebas. Mantener las dos implementaciones garantizaba que divergieran sin
que nadie se enterara, porque solo una se ejecutaba.

**`services/nutritionCalculator.js` NO está archivado.** Aunque este
controlador era su único consumidor *vía HTTP*, `bodyComposition.controller.js`
lo usa de verdad —`calculateBodyFat3Site`, `calculateBodyFat7Site` y
`calculateBodyComposition`— al guardar un registro de composición corporal.
Ese servicio sigue vivo y en su sitio.

Para revivir el router: devolver los dos archivos a `routes/` y
`controllers/`, restaurar el `import` y el `app.use('/api/calculations', …)`
en `app.js`, y decidir qué implementación manda. Si el objetivo es exponer la
API a terceros, la del servidor; si es alimentar la interfaz, no hace falta.

## `/api/food-exchange`

`foodExchange.routes.js` y `foodExchange.controller.js`. Exponía
`POST /equivalents`, `GET /by-category/:category` y `POST /batch` sobre el
catálogo de `Food`.

Su única pantalla era `FoodExchangeModal.jsx`, que llevaba tiempo en el
repositorio sin que nadie la importara y se borró en `d36d8f8`. El código
del modal está en el historial de git si se quiere recuperar como punto de
partida.

**Este es el más probable de los dos que vuelva.** El intercambio de
alimentos es funcionalidad clínica corriente: permite sustituir un alimento
por otro equivalente en aportes al armar un plan. Lo que falta no es backend
—está hecho— sino enlazarlo desde el constructor de dietas (`MenuBuilder.jsx`).

Para revivirlo: devolver los dos archivos, restaurar el `import` y el
`app.use('/api/food-exchange', …)`, volver a declarar `foodExchangeAPI` en
`frontend/src/services/api.js`, y construir la interfaz que lo consuma.
