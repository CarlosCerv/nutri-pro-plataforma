import { lazy, Suspense } from 'react';
import { Activity, Dumbbell, FlaskConical } from 'lucide-react';
import Disclosure from '../../design-system/components/Disclosure.jsx';
import { LoadingState } from '../../design-system/components/StateViews.jsx';

const MeasurementsTab = lazy(() => import('./MeasurementsTab'));
const LaboratoryTab = lazy(() => import('./LaboratoryTab'));
const PhysicalActivityTab = lazy(() => import('./PhysicalActivityTab'));

/**
 * Todo lo que evoluciona consulta a consulta, en una sola pestaña.
 *
 * Antes eran tres pestañas separadas —Mediciones, Laboratorio y Actividad
 * física— que el nutriólogo recorre en la misma cita y comparando entre sí:
 * el peso no se interpreta sin la glucosa ni sin el gasto por actividad.
 * Tenerlas en pestañas distintas obligaba a saltar de una a otra y a perder
 * lo capturado si se cambiaba de pestaña sin guardar.
 *
 * Mediciones abre por defecto porque es lo primero de toda consulta.
 */
export default function EvolucionTab({ patient, onUpdate }) {
  return (
    <div className="space-y-4">
      <Disclosure
        title="Mediciones y composición corporal"
        description="Peso, talla, pliegues, perímetros y porcentaje de grasa"
        icon={<Activity size={18} strokeWidth={1.75} />}
        defaultOpen
      >
        <Suspense fallback={<LoadingState label="Cargando mediciones…" />}>
          <MeasurementsTab patient={patient} onUpdate={onUpdate} />
        </Suspense>
      </Disclosure>

      <Disclosure
        title="Laboratorio"
        description="Química sanguínea, perfil lipídico y signos vitales"
        icon={<FlaskConical size={18} strokeWidth={1.75} />}
      >
        <Suspense fallback={<LoadingState label="Cargando laboratorio…" />}>
          <LaboratoryTab patient={patient} onUpdate={onUpdate} />
        </Suspense>
      </Disclosure>

      <Disclosure
        title="Actividad física"
        description="Nivel de actividad, registro de ejercicio y prescripción"
        icon={<Dumbbell size={18} strokeWidth={1.75} />}
      >
        <Suspense fallback={<LoadingState label="Cargando actividad…" />}>
          <PhysicalActivityTab patient={patient} onUpdate={onUpdate} />
        </Suspense>
      </Disclosure>
    </div>
  );
}
