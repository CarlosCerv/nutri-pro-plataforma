import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CalendarClock, Pill, Salad } from 'lucide-react';
import { appointmentsAPI } from '../services/api';

/**
 * Panel de datos críticos del paciente, visible en todas las pestañas.
 *
 * Sigue la regla de jerarquía de datos densos del sistema de diseño: lo que
 * puede cambiar una decisión clínica —alergias, patologías, medicamentos— va
 * en tinta primaria y peso 600; el resto queda en secundaria. Antes esta
 * información estaba enterrada dentro de dos pestañas distintas, así que
 * había que acordarse de ir a buscarla.
 */

const Bloque = ({ icon, title, children, tone = 'neutral' }) => (
  <div
    className={[
      'rounded-[var(--radius-m)] border p-3',
      tone === 'danger'
        ? 'border-[rgba(196,30,22,0.3)] bg-[rgba(196,30,22,0.05)]'
        : 'border-[var(--border-soft)] bg-[var(--surface-alt)]',
    ].join(' ')}
  >
    <div
      className={[
        'mb-1.5 flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide',
        tone === 'danger' ? 'text-[var(--danger)]' : 'text-[var(--ink-secondary)]',
      ].join(' ')}
    >
      {icon}
      {title}
    </div>
    {children}
  </div>
);

export default function PatientAlertPanel({ patient }) {
  const [proxima, setProxima] = useState(null);

  useEffect(() => {
    if (!patient?._id) return undefined;
    let cancelado = false;

    (async () => {
      try {
        const res = await appointmentsAPI.getAll({ patientId: patient._id });
        if (cancelado) return;
        const futuras = (res.data?.data || [])
          .filter((c) => c.status === 'scheduled' && new Date(c.date) >= new Date())
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        setProxima(futuras[0] || null);
      } catch {
        // La próxima cita es contexto, no el contenido de la página: si falla,
        // el panel simplemente no la muestra.
        if (!cancelado) setProxima(null);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [patient?._id]);

  const alergias = patient?.alergias?.trim();
  const intolerancias = patient?.intolerancias?.trim();
  const medicamentos = patient?.medicamentos?.trim();
  const patologias = patient?.patologias || [];
  const objetivo = patient?.objetivoAlim?.trim() || patient?.objective?.trim();

  const sinDatos = !alergias && !intolerancias && !medicamentos && patologias.length === 0;

  return (
    <aside className="card space-y-3" aria-label="Datos críticos del paciente">
      <h2 className="section-title">En la consulta</h2>

      {alergias || intolerancias ? (
        <Bloque icon={<AlertTriangle size={12} />} title="Alergias e intolerancias" tone="danger">
          {alergias ? <p className="text-sm font-semibold text-[var(--ink)]">{alergias}</p> : null}
          {intolerancias ? (
            <p className="mt-0.5 text-sm text-[var(--ink-muted)]">Intolerancias: {intolerancias}</p>
          ) : null}
        </Bloque>
      ) : null}

      {patologias.length > 0 ? (
        <Bloque icon={<AlertTriangle size={12} />} title="Patologías">
          <div className="flex flex-wrap gap-1.5">
            {patologias.map((p) => (
              <span key={p} className="badge badge-warning">
                {p}
              </span>
            ))}
          </div>
        </Bloque>
      ) : null}

      {medicamentos ? (
        <Bloque icon={<Pill size={12} />} title="Medicamentos">
          <p className="text-sm font-semibold text-[var(--ink)]">{medicamentos}</p>
        </Bloque>
      ) : null}

      {objetivo ? (
        <Bloque icon={<Salad size={12} />} title="Objetivo">
          <p className="text-sm text-[var(--ink-muted)]">{objetivo}</p>
        </Bloque>
      ) : null}

      <Bloque icon={<CalendarClock size={12} />} title="Próxima cita">
        {proxima ? (
          <>
            <p className="text-sm font-semibold text-[var(--ink)]">
              {new Date(proxima.date).toLocaleDateString('es-MX', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
            <p className="text-xs text-[var(--ink-secondary)]">
              {proxima.time || ''} {proxima.type ? `· ${proxima.type}` : ''}
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-[var(--ink-secondary)]">Sin cita programada</p>
            <Link to="/agenda/nueva" className="mt-1.5 inline-block text-xs font-semibold text-[var(--accent)]">
              Agendar
            </Link>
          </>
        )}
      </Bloque>

      {sinDatos ? (
        <p className="text-xs text-[var(--ink-secondary)]">
          Sin alergias, patologías ni medicamentos registrados. Se capturan en la pestaña Clínica.
        </p>
      ) : null}
    </aside>
  );
}
