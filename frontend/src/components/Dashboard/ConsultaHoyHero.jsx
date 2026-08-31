import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertTriangle, CalendarPlus, ChevronRight, Clock, PlayCircle, Plus } from 'lucide-react';
import { dashboardAPI } from '../../services/api';
import { getApiErrorMessage } from '../../lib/apiError';
import { useAuth } from '../../contexts/AuthContext';
import { Badge, Button, Card } from '../../design-system/components';
import { ErrorState, Skeleton } from '../../design-system/components/StateViews';

const ESTADO_VARIANT = { confirmada: 'success', pendiente: 'warning', cancelada: 'danger' };

const initialesDe = (nombre) =>
  (nombre || '')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const capitalizar = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

/**
 * Hero "Hoy en Consulta": el paciente en turno y un carrusel compacto con
 * las citas que siguen. Es la primera decisión del día — a quién atender y
 * con qué alertas clínicas en la cabeza antes de abrir el expediente.
 */
export default function ConsultaHoyHero() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let cancelado = false;
    setLoading(true);
    (async () => {
      try {
        const res = await dashboardAPI.getTurno();
        if (!cancelado) {
          setData(res.data?.data || null);
          setError(null);
        }
      } catch (err) {
        if (!cancelado) setError(getApiErrorMessage(err, 'No se pudo cargar la consulta de hoy.'));
      } finally {
        if (!cancelado) setLoading(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [recarga]);

  const fecha = capitalizar(format(new Date(), "EEEE d 'de' MMMM 'de' yyyy", { locale: es }));
  const horaActual = new Date().getHours();
  const saludo = horaActual < 12 ? 'Buenos días' : horaActual < 19 ? 'Buenas tardes' : 'Buenas noches';
  const nombreCorto = user?.name?.split(' ')[0] || 'Nutriólogo';

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title font-display text-2xl md:text-3xl">{saludo}, {nombreCorto}</h1>
          <p className="mt-0.5 text-sm text-[var(--ink-secondary)]">{fecha} · Hoy en consulta</p>
        </div>
        <div className="flex gap-2">
          <Button as={Link} variant="outline" size="sm" to="/pacientes/nuevo" className="gap-1.5">
            <Plus size={14} /> Paciente
          </Button>
          <Button as={Link} size="sm" to="/dietas/nueva" className="gap-1.5">
            <Plus size={14} /> Nueva dieta
          </Button>
        </div>
      </div>

      {loading ? (
        <Card style={{ borderRadius: 'var(--radius-l)' }} className="space-y-4">
          <div className="flex gap-4">
            <Skeleton className="h-16 w-16 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48 rounded-lg" />
              <Skeleton className="h-4 w-64 rounded-lg" />
            </div>
          </div>
        </Card>
      ) : error ? (
        <Card style={{ borderRadius: 'var(--radius-l)' }}>
          <ErrorState message={error} onRetry={() => setRecarga((n) => n + 1)} />
        </Card>
      ) : !data?.actual ? (
        <Card style={{ borderRadius: 'var(--radius-l)' }} className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-[var(--ink-muted)]">Sin citas agendadas para hoy.</p>
          <Button as={Link} to="/agenda/nueva" size="sm" className="gap-1.5">
            <CalendarPlus size={14} /> Agendar cita
          </Button>
        </Card>
      ) : (
        <>
          <Card style={{ borderRadius: 'var(--radius-l)' }} className="overflow-hidden">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-semibold text-[var(--ink)]"
                style={{ background: 'var(--surface-alt)' }}
              >
                {data.actual.photoUrl ? (
                  <img src={data.actual.photoUrl} alt="" className="h-full w-full rounded-2xl object-cover" />
                ) : (
                  initialesDe(data.actual.nombre)
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-lg font-semibold text-[var(--ink)]">{data.actual.nombre}</h2>
                  <Badge variant={ESTADO_VARIANT[data.actual.estado] || 'neutral'}>{data.actual.estado}</Badge>
                </div>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-[var(--ink-muted)]">
                  <Clock size={13} strokeWidth={1.75} /> {data.actual.hora} · {data.actual.tipo}
                </p>

                {(data.actual.alergias || data.actual.intolerancias || data.actual.patologias?.length > 0) && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {data.actual.alergias && (
                      <span className="badge badge-danger gap-1">
                        <AlertTriangle size={11} /> Alergia: {data.actual.alergias}
                      </span>
                    )}
                    {data.actual.intolerancias && (
                      <span className="badge badge-warning gap-1">
                        <AlertTriangle size={11} /> Intolerancia: {data.actual.intolerancias}
                      </span>
                    )}
                    {(data.actual.patologias || []).map((p) => (
                      <span key={p} className="badge badge-warning">{p}</span>
                    ))}
                  </div>
                )}
              </div>

              {data.actual.patientId && (
                <Button as={Link} to={`/pacientes/${data.actual.patientId}/evolucion`} className="shrink-0 gap-2">
                  <PlayCircle size={16} /> Iniciar consulta
                </Button>
              )}
            </div>
          </Card>

          {data.siguientes?.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
              {data.siguientes.map((c) => (
                <Link
                  key={c.id}
                  to={c.patientId ? `/pacientes/${c.patientId}` : '/agenda'}
                  className="group flex shrink-0 items-center gap-2.5 rounded-[var(--radius-m)] border border-[var(--border-soft)] bg-[var(--surface)] px-3.5 py-2.5 shadow-card transition-colors hover:border-[var(--accent-border)]"
                >
                  <div className="text-center">
                    <div className="font-mono text-xs font-semibold text-[var(--ink)]">{c.hora}</div>
                  </div>
                  <div className="h-6 w-px bg-[var(--surface-strong)]" />
                  <div className="min-w-0">
                    <div className="max-w-[10rem] truncate text-sm font-medium text-[var(--ink)]">{c.nombre}</div>
                    <div className="text-2xs text-[var(--ink-secondary)]">{c.tipo}</div>
                  </div>
                  <ChevronRight size={14} className="shrink-0 text-[var(--ink-secondary)] transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
