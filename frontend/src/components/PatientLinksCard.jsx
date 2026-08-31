import { useState } from 'react';
import PropTypes from 'prop-types';
import { ClipboardList, Link2, Loader } from 'lucide-react';
import { patientsAPI } from '../services/api';
import { getApiErrorMessage } from '../lib/apiError';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../design-system/components';

/**
 * Enlaces autogestionados para el paciente: cuestionario pre-consulta
 * (expira en 7 días, un solo uso) y portal ligero (permanente, se puede
 * regenerar). Cada botón genera el enlace, lo copia al portapapeles y avisa
 * por toast — el nutriólogo lo pega directo en WhatsApp o el correo.
 */
export default function PatientLinksCard({ patientId }) {
  const toast = useToast();
  const [generando, setGenerando] = useState(null); // 'cuestionario' | 'portal' | null

  const copiarEnlace = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Enlace copiado al portapapeles.');
    } catch {
      toast.info(url);
    }
  };

  const generarCuestionario = async () => {
    setGenerando('cuestionario');
    try {
      const res = await patientsAPI.generatePreConsultationLink(patientId);
      await copiarEnlace(res.data?.data?.url);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'No se pudo generar el enlace.'));
    } finally {
      setGenerando(null);
    }
  };

  const generarPortal = async () => {
    setGenerando('portal');
    try {
      const res = await patientsAPI.generatePortalLink(patientId);
      await copiarEnlace(res.data?.data?.url);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'No se pudo generar el enlace.'));
    } finally {
      setGenerando(null);
    }
  };

  return (
    <Card as="aside" aria-label="Enlaces para el paciente" className="space-y-2">
      <h2 className="section-title">Enlaces para el paciente</h2>
      <button
        type="button"
        onClick={generarCuestionario}
        disabled={generando !== null}
        className="btn btn-outline btn-sm w-full justify-start gap-2 disabled:opacity-60"
      >
        {generando === 'cuestionario' ? <Loader size={14} className="animate-spin" /> : <ClipboardList size={14} />}
        Cuestionario pre-consulta
      </button>
      <button
        type="button"
        onClick={generarPortal}
        disabled={generando !== null}
        className="btn btn-outline btn-sm w-full justify-start gap-2 disabled:opacity-60"
      >
        {generando === 'portal' ? <Loader size={14} className="animate-spin" /> : <Link2 size={14} />}
        Portal del paciente
      </button>
    </Card>
  );
}

PatientLinksCard.propTypes = {
  patientId: PropTypes.string.isRequired,
};
