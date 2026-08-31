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

`/api/food-exchange` volvió a `routes/`/`controllers/` y se enlazó desde el
botón "Sustitutos sugeridos" de `MenuBuilder.jsx` — ya no vive aquí.
