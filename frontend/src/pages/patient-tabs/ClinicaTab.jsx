import { lazy, Suspense } from 'react';
import { Apple, Heart, NotebookPen } from 'lucide-react';
import Disclosure from '../../design-system/components/Disclosure.jsx';
import { LoadingState } from '../../design-system/components/StateViews.jsx';

const ClinicalTab = lazy(() => import('./ClinicalTab'));
const FoodHabitsTab = lazy(() => import('./FoodHabitsTab'));
const ClinicalNotesTab = lazy(() => import('../../components/ClinicalNotesTab'));

/**
 * Valoración clínica, hábitos y notas de consulta.
 *
 * Las tres describen el mismo cuadro: el diagnóstico nutricional se sostiene
 * en lo que el paciente come y en lo que se anotó en la consulta anterior.
 *
 * `ClinicalNotesTab` llevaba tiempo en el repositorio sin estar enlazado
 * desde ninguna ruta ni pestaña, pese a tener su servicio y sus endpoints
 * funcionando: aquí vuelve a ser alcanzable.
 */
export default function ClinicaTab({ patient, onUpdate }) {
  return (
    <div className="space-y-4">
      <Disclosure
        title="Valoración clínica"
        description="Diagnóstico nutricional, patologías, síntomas y objetivos"
        icon={<Heart size={18} strokeWidth={1.75} />}
        defaultOpen
      >
        <Suspense fallback={<LoadingState label="Cargando valoración…" />}>
          <ClinicalTab patient={patient} onUpdate={onUpdate} />
        </Suspense>
      </Disclosure>

      <Disclosure
        title="Hábitos alimentarios"
        description="Recordatorio de 24 horas, horarios, preferencias y frecuencia de consumo"
        icon={<Apple size={18} strokeWidth={1.75} />}
      >
        <Suspense fallback={<LoadingState label="Cargando hábitos…" />}>
          <FoodHabitsTab patient={patient} onUpdate={onUpdate} />
        </Suspense>
      </Disclosure>

      <Disclosure
        title="Notas de consulta"
        description="Registro cronológico de cada sesión"
        icon={<NotebookPen size={18} strokeWidth={1.75} />}
      >
        <Suspense fallback={<LoadingState label="Cargando notas…" />}>
          <ClinicalNotesTab patientId={patient?._id} />
        </Suspense>
      </Disclosure>
    </div>
  );
}
