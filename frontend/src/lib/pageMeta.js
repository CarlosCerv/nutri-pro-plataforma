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
    '/dietas': { title: 'Dietas' },
    '/dietas/nueva': withTrail([{ label: 'Dietas', to: '/dietas' }], 'Nueva dieta', null),
    '/dietas/catalogo': withTrail([{ label: 'Dietas', to: '/dietas' }], 'Plantillas', null),
    '/alimentos': { title: 'Alimentos' },
    '/alimentos/nuevo': withTrail([{ label: 'Alimentos', to: '/alimentos' }], 'Nuevo alimento', null),
    '/calculos': { title: 'Calculadoras' },
    '/calculos/imc': withTrail([{ label: 'Calculadoras', to: '/calculos' }], 'IMC y composición', null),
    '/calculos/calorias': withTrail([{ label: 'Calculadoras', to: '/calculos' }], 'Gasto energético', null),
    '/calculos/deportistas': withTrail([{ label: 'Calculadoras', to: '/calculos' }], 'Nutrición deportiva', null),
    '/reportes': { title: 'Reportes PDF' },
    '/reportes/nuevo': withTrail([{ label: 'Reportes', to: '/reportes' }], 'Nuevo reporte', null),
    '/reportes/historial': withTrail([{ label: 'Reportes', to: '/reportes' }], 'Historial', null),
    '/perfil': { title: 'Cuenta' },
    '/finanzas': { title: 'Finanzas' },
    '/reportes-poblacionales': { title: 'Estadísticas' },
    '/admin/licencias': { title: 'Administración' },
    '/admin/usuarios': { title: 'Administración' },
    '/admin/ingresos': { title: 'Administración' },
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
