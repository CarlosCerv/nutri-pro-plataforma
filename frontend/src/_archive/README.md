# Código archivado

Pantallas retiradas del release porque su interfaz mostraba datos inventados
y no existe backend que las respalde. No están enrutadas en `App.jsx` ni se
importan desde ningún lado; se conservan para no rehacer el trabajo de
maquetación cuando el backend exista.

## `AdminLicenses.jsx`

Panel de administración de licencias del SaaS. Las cuatro licencias, los
ingresos anuales y las renovaciones próximas eran literales dentro del
archivo.

Para reactivarla hace falta, en el backend:

- un modelo `License` (no existe ninguno en `backend/src/models/`),
- endpoints CRUD y de métricas de ingresos,
- aplicar `authorize('admin')` en esas rutas. El middleware ya está definido
  en `backend/src/middleware/auth.js` pero **no está aplicado en ninguna ruta
  del proyecto**, así que hoy la única barrera del panel es que el ítem del
  menú se oculta en el cliente — cosmético, no seguridad.

Las URLs `/admin`, `/admin/licencias`, `/admin/usuarios` y `/admin/ingresos`
redirigen al panel principal.

## `ReportsHub.jsx`

Catálogo de cuatro tipos de reporte PDF. Tres de los cuatro botones "Generar"
no tenían manejador, ni tampoco "Configurar", "Exportar Excel" ni "Compartir
link temporal"; la vista previa mostraba valores fijos que no correspondían a
ningún paciente.

No se reactivará tal cual: la exportación a PDF ya funciona con
`hooks/usePDFExport.js` dentro de cada plan (`pages/MealPlans.jsx`) y de la
pestaña de dietas del expediente, que es donde el nutriólogo la necesita. Un
hub separado solo agregaba un paso intermedio.
