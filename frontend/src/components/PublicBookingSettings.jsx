import { useState } from 'react';
import PropTypes from 'prop-types';
import { Copy, Plus, Trash2 } from 'lucide-react';
import { authAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import useSaveState from '../hooks/useSaveState';
import { Card, Input, Textarea } from '../design-system/components';
import FormSection from '../design-system/components/FormSection.jsx';
import SaveBar from '../design-system/components/SaveBar.jsx';

const DIAS = [
  { day: 1, label: 'Lunes' },
  { day: 2, label: 'Martes' },
  { day: 3, label: 'Miércoles' },
  { day: 4, label: 'Jueves' },
  { day: 5, label: 'Viernes' },
  { day: 6, label: 'Sábado' },
  { day: 0, label: 'Domingo' },
];

const servicioVacio = () => ({ name: '', durationMinutes: 60, price: '' });

/** Un bloque de horario por día (0-6, igual que Date#getDay()); un solo bloque diario alcanza para el caso común de consulta. */
function horariosADias(workingHours) {
  const porDia = new Map((workingHours || []).map((h) => [h.day, h]));
  return DIAS.map((d) => ({
    day: d.day,
    label: d.label,
    activo: porDia.has(d.day),
    start: porDia.get(d.day)?.start || '09:00',
    end: porDia.get(d.day)?.end || '18:00',
  }));
}

export default function PublicBookingSettings({ user, onSaved }) {
  const toast = useToast();
  const guardado = useSaveState();

  const [username, setUsername] = useState(user?.username || '');
  const [enabled, setEnabled] = useState(user?.publicBooking?.enabled || false);
  const [bio, setBio] = useState(user?.publicBooking?.bio || '');
  const [servicios, setServicios] = useState(
    user?.publicBooking?.services?.length ? user.publicBooking.services : [servicioVacio()]
  );
  const [dias, setDias] = useState(horariosADias(user?.publicBooking?.workingHours));

  const setServicio = (i, campo, valor) =>
    setServicios((prev) => prev.map((s, idx) => (idx === i ? { ...s, [campo]: valor } : s)));
  const agregarServicio = () => setServicios((prev) => [...prev, servicioVacio()]);
  const quitarServicio = (i) => setServicios((prev) => prev.filter((_, idx) => idx !== i));

  const setDia = (day, campo, valor) =>
    setDias((prev) => prev.map((d) => (d.day === day ? { ...d, [campo]: valor } : d)));

  const enlace = username ? `${window.location.origin}/@${username}` : '';

  const copiarEnlace = async () => {
    try {
      await navigator.clipboard.writeText(enlace);
      toast.success('Enlace copiado.');
    } catch {
      toast.info(enlace);
    }
  };

  const guardar = async (e) => {
    e.preventDefault();
    const { ok, data } = await guardado.save(async () => {
      const res = await authAPI.updateProfile({
        username: username.trim() || undefined,
        publicBooking: {
          enabled,
          bio: bio.trim(),
          slotDurationMinutes: 60,
          services: servicios
            .filter((s) => s.name.trim())
            .map((s) => ({
              name: s.name.trim(),
              durationMinutes: Number(s.durationMinutes) || 60,
              price: s.price === '' ? undefined : Number(s.price),
            })),
          workingHours: dias.filter((d) => d.activo).map((d) => ({ day: d.day, start: d.start, end: d.end })),
        },
      });
      return res.data?.data?.user;
    });
    if (ok && data) onSaved?.(data);
  };

  return (
    <Card as="form" onSubmit={guardar} className="space-y-6">
      <FormSection title="Tu página de agendamiento" description="El enlace que compartes en redes o bio para que agenden solos.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="pb-username"
            label="Usuario"
            placeholder="tu-nombre"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            helperText={enlace || 'nutripro.app/@tu-usuario'}
          />
          <div className="flex items-end">
            <label className="flex cursor-pointer items-center gap-2.5 pb-2.5">
              <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
              <span className="text-sm text-[var(--ink-muted)]">Página activa (visible al público)</span>
            </label>
          </div>
        </div>
        {enlace ? (
          <button type="button" onClick={copiarEnlace} className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)]">
            <Copy size={13} /> Copiar enlace
          </button>
        ) : null}
        <Textarea
          label="Presentación"
          placeholder="Cuéntale al paciente quién eres antes de que agende…"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="mt-4"
        />
      </FormSection>

      <FormSection title="Servicios" description="Lo que un visitante puede elegir al agendar.">
        <div className="space-y-3">
          {servicios.map((s, i) => (
            <div key={i} className="flex flex-wrap items-end gap-3 rounded-[var(--radius-m)] border border-[var(--border-soft)] p-3">
              <Input label="Nombre" containerClassName="flex-1 min-w-[10rem]" value={s.name} onChange={(e) => setServicio(i, 'name', e.target.value)} placeholder="Ej. Primera consulta" />
              <Input label="Minutos" type="number" min={5} containerClassName="w-24" value={s.durationMinutes} onChange={(e) => setServicio(i, 'durationMinutes', e.target.value)} />
              <Input label="Precio" type="number" min={0} containerClassName="w-28" value={s.price} onChange={(e) => setServicio(i, 'price', e.target.value)} />
              <button type="button" onClick={() => quitarServicio(i)} className="mb-1 rounded-lg p-2 text-[var(--ink-secondary)] hover:bg-[rgba(196,30,22,0.08)] hover:text-[var(--danger)]" aria-label="Quitar servicio">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button type="button" onClick={agregarServicio} className="btn btn-outline btn-sm gap-1.5">
            <Plus size={14} /> Agregar servicio
          </button>
        </div>
      </FormSection>

      <FormSection title="Horario de atención" description="Los días y horas en que un visitante puede tomar un lugar.">
        <div className="space-y-2">
          {dias.map((d) => (
            <div key={d.day} className="flex flex-wrap items-center gap-3">
              <label className="flex w-32 shrink-0 cursor-pointer items-center gap-2.5">
                <input type="checkbox" checked={d.activo} onChange={(e) => setDia(d.day, 'activo', e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
                <span className="text-sm text-[var(--ink-muted)]">{d.label}</span>
              </label>
              {d.activo && (
                <div className="flex items-center gap-2">
                  <input type="time" className="input py-1.5" value={d.start} onChange={(e) => setDia(d.day, 'start', e.target.value)} />
                  <span className="text-xs text-[var(--ink-secondary)]">a</span>
                  <input type="time" className="input py-1.5" value={d.end} onChange={(e) => setDia(d.day, 'end', e.target.value)} />
                </div>
              )}
            </div>
          ))}
        </div>
      </FormSection>

      <SaveBar saving={guardado.saving} saved={guardado.saved} error={guardado.error} label="Guardar página pública" />
    </Card>
  );
}

PublicBookingSettings.propTypes = {
  user: PropTypes.object,
  onSaved: PropTypes.func,
};
