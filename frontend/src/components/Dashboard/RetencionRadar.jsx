import { useCallback, useEffect, useState } from 'react';
import { MessageCircle, RadioTower } from 'lucide-react';
import { dashboardAPI } from '../../services/api';
import { getApiErrorMessage } from '../../lib/apiError';
import { Skeleton } from '../../design-system/components/StateViews';

/** wa.me exige el número con lada de país; México asume 52 si vienen 10 dígitos locales. */
function waLink(telefono) {
  const digitos = (telefono || '').replace(/\D/g, '');
  if (!digitos) return null;
  const conLada = digitos.length === 10 ? `52${digitos}` : digitos;
  return `https://wa.me/${conLada}`;
}

/**
 * Radar de retención: pacientes activos sin cita en más de 30 días.
 *
 * Vive junto a los otros dos KPI del consultorio pero no cabe en `StatTile`
 * (necesita una lista con acción, no solo una cifra), así que replica su
 * tarjeta a mano en vez de forzar el componente a un uso que no cubre.
 */
export default function RetencionRadar() {
  const [pacientes, setPacientes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(() => {
    let cancelado = false;
    setLoading(true);
    (async () => {
      try {
        const res = await dashboardAPI.getRetention();
        if (!cancelado) {
          setPacientes(res.data?.data || []);
          setError(null);
        }
      } catch (err) {
        if (!cancelado) setError(getApiErrorMessage(err, 'No se pudo cargar el radar de retención.'));
      } finally {
        if (!cancelado) setLoading(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => cargar(), [cargar]);

  return (
    <div className="card p-5">
      <div className="mb-2 flex items-center gap-2 text-2xs font-semibold uppercase tracking-wide text-[var(--ink-secondary)]">
        <span aria-hidden="true" className="text-[var(--warning)]">
          <RadioTower size={14} strokeWidth={1.75} />
        </span>
        Radar de retención
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-3 w-32 rounded" />
        </div>
      ) : error ? (
        <p className="text-xs text-[var(--danger)]">{error}</p>
      ) : (
        <>
          <div className="font-mono text-2xl font-medium text-[var(--warning)] sm:text-3xl">
            {pacientes.length}
            <span className="ml-1 text-sm font-normal text-[var(--ink-secondary)]">
              {pacientes.length === 1 ? 'paciente' : 'pacientes'}
            </span>
          </div>
          <div className="mt-1 text-xs text-[var(--ink-secondary)]">Sin cita hace más de 30 días</div>

          {pacientes.length > 0 && (
            <ul className="mt-3 max-h-40 space-y-1.5 overflow-y-auto pr-1">
              {pacientes.map((p) => {
                const link = waLink(p.telefono);
                return (
                  <li key={p.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-[var(--ink-muted)]">{p.nombre}</p>
                      <p className="text-2xs text-[var(--ink-secondary)]">{p.diasSinCita} días</p>
                    </div>
                    {link ? (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-sm shrink-0 gap-1 !px-3"
                        aria-label={`Contactar a ${p.nombre} por WhatsApp`}
                      >
                        <MessageCircle size={13} /> Contactar
                      </a>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
