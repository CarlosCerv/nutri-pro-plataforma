/**
 * Human-readable titles for the top bar and wayfinding (Spanish UI).
 * @param {string} pathname
 * @returns {{ title: string, subtitle?: string, trail?: { label: string, to: string }[] }}
 */
export function getPageMeta(pathname) {
  const path = (pathname || '/').split('?')[0].replace(/\/$/, '') || '/';

  const withTrail = (trail, title, subtitle) => ({ trail, title, subtitle });

  const exact = {
    '/dashboard': { title: 'Panel' },
    '/pacientes': { title: 'Pacientes' },
    '/pacientes/nuevo': withTrail([{ label: 'Pacientes', to: '/pacientes' }], 'Nuevo paciente', null),
    '/agenda': { title: 'Agenda' },
    '/agenda/nueva': withTrail([{ label: 'Agenda', to: '/agenda' }], 'Nueva cita', null),
    '/dietas': { title: 'Dietas', subtitle: 'Planes de alimentación, plantillas y catálogo de alimentos' },
    '/dietas/plantillas': { title: 'Dietas', subtitle: 'Planes de alimentación, plantillas y catálogo de alimentos' },
    '/dietas/alimentos': { title: 'Dietas', subtitle: 'Planes de alimentación, plantillas y catálogo de alimentos' },
    '/dietas/nueva': withTrail([{ label: 'Dietas', to: '/dietas' }], 'Nueva dieta', null),
    '/herramientas': { title: 'Herramientas', subtitle: 'Calculadoras clínicas y estadísticas de tu consulta' },
    '/herramientas/estadisticas': { title: 'Herramientas', subtitle: 'Calculadoras clínicas y estadísticas de tu consulta' },
    '/perfil': { title: 'Cuenta' },
    '/finanzas': { title: 'Finanzas' },
  };

  if (exact[path]) return exact[path];

  const dietEdit = path.match(/^\/dietas\/([^/]+)\/editar$/);
  if (dietEdit) {
    return withTrail([{ label: 'Dietas', to: '/dietas' }], 'Editar menú', null);
  }

  const patientEdit = path.match(/^\/pacientes\/([^/]+)\/editar$/);
  if (patientEdit) {
    return withTrail([{ label: 'Pacientes', to: '/pacientes' }], 'Editar paciente', null);
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
      null
    );
  }

  if (/^\/pacientes\/[^/]+$/.test(path)) {
    return withTrail([{ label: 'Pacientes', to: '/pacientes' }], 'Expediente', null);
  }

  return { title: 'NutriPro' };
}
