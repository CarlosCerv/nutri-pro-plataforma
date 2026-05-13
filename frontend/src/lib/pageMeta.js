/**
 * Human-readable titles for the top bar and wayfinding (Spanish UI).
 * @param {string} pathname
 * @returns {{ title: string, subtitle?: string, trail?: { label: string, to: string }[] }}
 */
export function getPageMeta(pathname) {
  const path = (pathname || '/').split('?')[0].replace(/\/$/, '') || '/';

  const withTrail = (trail, title, subtitle) => ({ trail, title, subtitle });

  const exact = {
    '/dashboard': { title: 'Panel', subtitle: 'Resumen de tu consulta' },
    '/pacientes': { title: 'Pacientes', subtitle: 'Directorio y expedientes' },
    '/pacientes/nuevo': withTrail([{ label: 'Pacientes', to: '/pacientes' }], 'Nuevo paciente', 'Alta rápida en la plataforma'),
    '/agenda': { title: 'Agenda', subtitle: 'Citas y seguimiento' },
    '/agenda/nueva': withTrail([{ label: 'Agenda', to: '/agenda' }], 'Nueva cita', 'Programación de consulta'),
    '/dietas': { title: 'Dietas', subtitle: 'Planes de alimentación y menús' },
    '/dietas/nueva': withTrail([{ label: 'Dietas', to: '/dietas' }], 'Editor de menú', 'Arrastra alimentos y ajusta porciones'),
    '/dietas/catalogo': withTrail([{ label: 'Dietas', to: '/dietas' }], 'Plantillas', 'Modelos reutilizables'),
    '/alimentos': { title: 'Base de alimentos', subtitle: 'Catálogo clínico' },
    '/alimentos/nuevo': withTrail([{ label: 'Alimentos', to: '/alimentos' }], 'Nuevo alimento', 'Alta en el catálogo'),
    '/calculos': { title: 'Calculadoras', subtitle: 'Energía, IMC y deporte' },
    '/calculos/imc': withTrail([{ label: 'Calculadoras', to: '/calculos' }], 'IMC y composición', null),
    '/calculos/calorias': withTrail([{ label: 'Calculadoras', to: '/calculos' }], 'Gasto energético', null),
    '/calculos/deportistas': withTrail([{ label: 'Calculadoras', to: '/calculos' }], 'Nutrición deportiva', null),
    '/reportes': { title: 'Reportes PDF', subtitle: 'Branding y entregables' },
    '/reportes/nuevo': withTrail([{ label: 'Reportes', to: '/reportes' }], 'Nuevo reporte', null),
    '/reportes/historial': withTrail([{ label: 'Reportes', to: '/reportes' }], 'Historial', null),
    '/perfil': { title: 'Cuenta y ajustes', subtitle: 'Perfil, branding y licencia' },
    '/finanzas': { title: 'Finanzas', subtitle: 'Cobros y movimientos' },
    '/reportes-poblacionales': { title: 'Estadísticas', subtitle: 'Vista agregada de la práctica' },
    '/admin/licencias': { title: 'Administración', subtitle: 'Licencias y accesos' },
    '/admin/usuarios': { title: 'Administración', subtitle: 'Usuarios' },
    '/admin/ingresos': { title: 'Administración', subtitle: 'Ingresos' },
  };

  if (exact[path]) return exact[path];

  const dietEdit = path.match(/^\/dietas\/([^/]+)\/editar$/);
  if (dietEdit) {
    return withTrail([{ label: 'Dietas', to: '/dietas' }], 'Editar menú', 'Ajustes del plan');
  }

  const patientEdit = path.match(/^\/pacientes\/([^/]+)\/editar$/);
  if (patientEdit) {
    return withTrail([{ label: 'Pacientes', to: '/pacientes' }], 'Editar paciente', 'Actualización de ficha');
  }

  const patientTab = path.match(
    /^\/pacientes\/([^/]+)\/(mediciones|habitos|clinica|laboratorio|actividad|dietas|seguimiento|psiconutricion)$/
  );
  if (patientTab) {
    const tabLabels = {
      mediciones: 'Mediciones',
      habitos: 'Hábitos alimentarios',
      clinica: 'Clínica',
      laboratorio: 'Laboratorio',
      actividad: 'Actividad física',
      dietas: 'Dietas del paciente',
      seguimiento: 'Seguimiento',
      psiconutricion: 'Psiconutrición',
    };
    const tab = patientTab[2];
    return withTrail(
      [{ label: 'Pacientes', to: '/pacientes' }],
      tabLabels[tab] || 'Expediente',
      'Sección del expediente'
    );
  }

  if (/^\/pacientes\/[^/]+$/.test(path)) {
    return withTrail([{ label: 'Pacientes', to: '/pacientes' }], 'Expediente clínico', 'Datos y seguimiento');
  }

  return { title: 'NutriPro', subtitle: 'Plataforma clínica' };
}
