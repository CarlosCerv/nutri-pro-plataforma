import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CalendarCheck, CheckCircle2, Clock, Loader, User } from 'lucide-react';
import { bookingAPI } from '../../services/publicApi';
import { getApiErrorMessage } from '../../lib/apiError';
import { Button, Input } from '../../design-system/components';
import { EmptyState, ErrorState, LoadingState } from '../../design-system/components/StateViews';
import PublicPageShell from './PublicPageShell';

const hoyISO = () => new Date().toISOString().slice(0, 10);

/**
 * Página pública de agendamiento (nutripro.app/@usuario).
 *
 * El flujo es: elegir servicio → elegir fecha → cargar horarios libres de
 * ese día (`/availability`) → elegir hora → identificarse → confirmar. La
 * disponibilidad se vuelve a pedir en cada cambio de fecha o servicio
 * porque la duración del servicio cambia cuántos huecos caben en el día.
 */
export default function PublicBooking() {
  const { username } = useParams();
  const [estado, setEstado] = useState('cargando');
  const [errorMsg, setErrorMsg] = useState('');
  const [perfil, setPerfil] = useState(null);

  const [servicioIdx, setServicioIdx] = useState(0);
  const [fecha, setFecha] = useState(hoyISO());
  const [horarios, setHorarios] = useState([]);
  const [horariosLoading, setHorariosLoading] = useState(false);
  const [hora, setHora] = useState('');

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [enviando, setEnviando] = useState(false);
  const [enviarError, setEnviarError] = useState('');
  const [confirmacion, setConfirmacion] = useState(null);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const res = await bookingAPI.getProfile(username);
        if (!cancelado) {
          setPerfil(res.data?.data || null);
          setEstado('listo');
        }
      } catch (err) {
        if (!cancelado) {
          setErrorMsg(getApiErrorMessage(err, 'Esta página no está disponible.'));
          setEstado('error');
        }
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [username]);

  useEffect(() => {
    if (estado !== 'listo' || !fecha) return undefined;
    let cancelado = false;
    setHorariosLoading(true);
    setHora('');
    (async () => {
      try {
        const res = await bookingAPI.getAvailability(username, fecha, servicioIdx);
        if (!cancelado) setHorarios(res.data?.data || []);
      } catch {
        if (!cancelado) setHorarios([]);
      } finally {
        if (!cancelado) setHorariosLoading(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [estado, username, fecha, servicioIdx]);

  const servicioSeleccionado = perfil?.services?.[servicioIdx];

  const puedeConfirmar = useMemo(
    () => hora && form.firstName.trim() && form.lastName.trim() && (form.email.trim() || form.phone.trim()),
    [hora, form]
  );

  const confirmar = async (e) => {
    e.preventDefault();
    if (!puedeConfirmar) return;
    setEnviando(true);
    setEnviarError('');
    try {
      await bookingAPI.create(username, {
        ...form,
        date: fecha,
        time: hora,
        serviceIndex: servicioIdx,
      });
      setConfirmacion({ fecha, hora, nombre: perfil.name });
    } catch (err) {
      setEnviarError(getApiErrorMessage(err, 'No se pudo agendar la cita. Intenta con otro horario.'));
    } finally {
      setEnviando(false);
    }
  };

  if (estado === 'cargando') {
    return (
      <PublicPageShell eyebrow="Agendar cita">
        <LoadingState label="Cargando…" />
      </PublicPageShell>
    );
  }

  if (estado === 'error') {
    return (
      <PublicPageShell eyebrow="Agendar cita">
        <div className="card p-8" style={{ borderRadius: 'var(--radius-l)' }}>
          <ErrorState message={errorMsg} />
        </div>
      </PublicPageShell>
    );
  }

  if (confirmacion) {
    return (
      <PublicPageShell eyebrow="Agendar cita">
        <div className="card flex flex-col items-center gap-3 p-10 text-center" style={{ borderRadius: 'var(--radius-l)' }}>
          <CheckCircle2 size={40} className="text-[var(--success)]" />
          <h1 className="text-xl font-semibold text-[var(--ink)]">¡Cita confirmada!</h1>
          <p className="max-w-sm text-sm text-[var(--ink-muted)]">
            Quedaste agendado con {confirmacion.nombre} el{' '}
            {new Date(`${confirmacion.fecha}T00:00:00`).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
            {' '}a las {confirmacion.hora}.
          </p>
        </div>
      </PublicPageShell>
    );
  }

  return (
    <PublicPageShell eyebrow="Agendar cita" maxWidth="max-w-2xl">
      <div className="mb-6 card p-6" style={{ borderRadius: 'var(--radius-l)' }}>
        <h1 className="text-xl font-semibold text-[var(--ink)]">{perfil.name}</h1>
        {perfil.specialty ? <p className="text-sm text-[var(--accent)]">{perfil.specialty}</p> : null}
        {perfil.bio ? <p className="mt-3 text-sm text-[var(--ink-muted)]">{perfil.bio}</p> : null}
      </div>

      {!perfil.services || perfil.services.length === 0 ? (
        <div className="card p-8" style={{ borderRadius: 'var(--radius-l)' }}>
          <EmptyState icon={<CalendarCheck size={24} strokeWidth={1.5} />} title="Sin servicios configurados" description="Este nutriólogo todavía no publicó servicios para agendar en línea." />
        </div>
      ) : (
        <form onSubmit={confirmar} className="card space-y-6 p-6" style={{ borderRadius: 'var(--radius-l)' }}>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--ink-secondary)]">Servicio</label>
            <div className="flex flex-wrap gap-2">
              {perfil.services.map((s, i) => (
                <button
                  key={s.name + i}
                  type="button"
                  onClick={() => setServicioIdx(i)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-micro ${
                    servicioIdx === i
                      ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                      : 'border-[var(--border-soft)] text-[var(--ink-muted)] hover:border-[var(--accent-border)]'
                  }`}
                >
                  {s.name} · {s.durationMinutes} min{s.price ? ` · $${s.price}` : ''}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="fecha-cita" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--ink-secondary)]">Fecha</label>
            <input
              id="fecha-cita"
              type="date"
              className="input w-full sm:w-64"
              min={hoyISO()}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--ink-secondary)]">
              <Clock size={13} /> Horarios disponibles
            </label>
            {horariosLoading ? (
              <div className="flex items-center gap-2 py-4 text-sm text-[var(--ink-muted)]">
                <Loader className="animate-spin" size={16} /> Buscando horarios…
              </div>
            ) : horarios.length === 0 ? (
              <p className="py-4 text-sm text-[var(--ink-secondary)]">Sin horarios libres ese día. Prueba con otra fecha.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {horarios.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHora(h)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-micro ${
                      hora === h
                        ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                        : 'border-[var(--border-soft)] text-[var(--ink-muted)] hover:border-[var(--accent-border)]'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            )}
          </div>

          {hora ? (
            <div className="space-y-4 border-t border-[var(--border-soft)] pt-6">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--ink-secondary)]">
                <User size={13} /> Tus datos
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Nombre" required value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
                <Input label="Apellido" required value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
                <Input label="Correo" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                <Input label="Teléfono" type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} helperText="Correo o teléfono: al menos uno." />
              </div>

              {enviarError ? <p role="alert" className="text-sm text-[var(--danger)]">{enviarError}</p> : null}

              <Button type="submit" disabled={!puedeConfirmar || enviando} fullWidth className="gap-2">
                {enviando ? <Loader className="animate-spin" size={16} /> : <CalendarCheck size={16} />}
                Confirmar cita{servicioSeleccionado ? ` de ${servicioSeleccionado.name}` : ''}
              </Button>
            </div>
          ) : null}
        </form>
      )}
    </PublicPageShell>
  );
}
