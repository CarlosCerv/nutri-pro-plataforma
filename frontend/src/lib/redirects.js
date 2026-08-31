/**
 * Redirecciones de URLs heredadas.
 *
 * Vive en su propio módulo para que `App.jsx` y las pruebas usen exactamente
 * la misma tabla: un test que copia la lista de rutas no comprueba nada, solo
 * repite lo que el autor creía que decía el router.
 *
 * Contiene dos grupos:
 *
 * 1. Los alias en inglés de la primera versión de la aplicación.
 * 2. Las URLs que prometían una subpantalla y renderizaban exactamente la
 *    misma vista que su ruta padre (las tres de `/calculos`, las dos de
 *    `/reportes`, `/alimentos/nuevo` y las tres de `/admin`), más las
 *    secciones que pasaron a ser pestañas al reorganizar el menú.
 */
export const LEGACY_REDIRECTS = {
  // Alias en inglés
  '/mealplans': '/dietas',
  '/menu-builder': '/dietas/nueva',
  '/diet-templates': '/dietas/plantillas',
  '/appointments': '/agenda',
  '/appointments/new': '/agenda/nueva',
  '/patients': '/pacientes',
  '/patients/new': '/pacientes/nuevo',
  '/calculator': '/herramientas',
  '/profile': '/perfil',
  '/configuracion': '/perfil',
  '/finance': '/finanzas',

  // Secciones que ahora son pestañas
  '/dietas/catalogo': '/dietas/plantillas',
  '/alimentos': '/dietas/alimentos',
  '/alimentos/nuevo': '/dietas/alimentos',
  '/calculos': '/herramientas',
  '/calculos/imc': '/herramientas',
  '/calculos/calorias': '/herramientas',
  '/calculos/deportistas': '/herramientas',
  '/reportes': '/dietas',
  '/reportes/nuevo': '/dietas',
  '/reportes/historial': '/dietas',
  '/reportes-poblacionales': '/herramientas/estadisticas',

  // Módulo de licencias, retirado del release (ver src/_archive/README.md)
  '/admin': '/dashboard',
  '/admin/licencias': '/dashboard',
  '/admin/usuarios': '/dashboard',
  '/admin/ingresos': '/dashboard',
};
