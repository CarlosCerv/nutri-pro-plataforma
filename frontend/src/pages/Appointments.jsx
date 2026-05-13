import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentsAPI } from '../services/api';
import { Calendar as CalendarIcon, Plus, Clock, User } from 'lucide-react';

const Appointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  const fetchAppointments = useCallback(async () => {
    try {
      const response = await appointmentsAPI.getAll();
      const list = response?.data?.data;
      setAppointments(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const getGroupTitle = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isSameDay = (d1, d2) =>
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();

    if (isSameDay(date, today)) return 'Hoy';
    if (isSameDay(date, tomorrow)) return 'Mañana';

    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const groupAppointments = (appts) => {
    const groups = {};
    appts.forEach((app) => {
      const dateKey = app.date?.split('T')[0] || '';
      if (!dateKey) return;
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(app);
    });

    return Object.entries(groups)
      .sort(([dateA], [dateB]) =>
        activeTab === 'upcoming'
          ? new Date(dateA) - new Date(dateB)
          : new Date(dateB) - new Date(dateA)
      )
      .map(([dateKey, groupAppts]) => ({
        title: getGroupTitle(dateKey),
        date: dateKey,
        appointments: groupAppts.sort((a, b) => (a.time || '').localeCompare(b.time || '')),
      }));
  };

  const filteredAppointments = appointments.filter((app) => {
    const appDate = new Date(app.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (activeTab === 'upcoming') {
      return appDate >= today && app.status !== 'completed' && app.status !== 'cancelled';
    }
    return appDate < today || app.status === 'completed' || app.status === 'cancelled';
  });

  const groupedList = groupAppointments(filteredAppointments);

  const patientLabel = (appointment) => {
    const p = appointment.patient;
    if (!p) return 'Paciente';
    const n = `${p.firstName || ''} ${p.lastName || ''}`.trim();
    return n || 'Paciente';
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 animate-fade-up">
        <div className="h-9 w-9 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
        <p className="text-sm text-[var(--text-secondary)]">Cargando agenda…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--text-secondary)]">
          {appointments.length}{' '}
          {appointments.length === 1 ? 'cita en total' : 'citas en total'}
        </p>
        <button type="button" className="btn btn-primary gap-2 self-start sm:self-auto" onClick={() => navigate('/agenda/nueva')}>
          <Plus size={16} />
          Nueva cita
        </button>
      </div>

      <div className="tabs-nav w-full max-w-md shrink-0 overflow-x-auto no-scrollbar sm:w-auto">
        <button
          type="button"
          className={`tab-btn whitespace-nowrap ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Próximas
        </button>
        <button
          type="button"
          className={`tab-btn whitespace-nowrap ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Historial
        </button>
      </div>

      {groupedList.length === 0 ? (
        <div className="empty-state rounded-xl border border-dashed border-[var(--border-soft)] bg-[var(--surface-muted)]/50">
          <div className="empty-state-icon">
            <CalendarIcon size={28} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              No hay citas {activeTab === 'upcoming' ? 'próximas' : 'en el historial'}
            </p>
            {activeTab === 'upcoming' && (
              <p className="mt-1 text-xs text-[var(--text-secondary)] max-w-xs mx-auto">
                Programa consultas desde aquí.
              </p>
            )}
          </div>
          {activeTab === 'upcoming' && (
            <button type="button" className="btn btn-primary btn-sm gap-1.5 mt-2" onClick={() => navigate('/agenda/nueva')}>
              <Plus size={14} />
              Agendar cita
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {groupedList.map((group) => (
            <section key={group.date} className="space-y-3">
              <h2 className="border-l-[3px] border-[var(--accent)] pl-3 text-sm font-semibold capitalize text-[var(--text-primary)] tracking-tight">
                {group.title}
              </h2>
              <ul className="flex flex-col gap-3">
                {group.appointments.map((appointment) => (
                  <li
                    key={appointment._id}
                    className="overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-hover)]"
                  >
                    <div className="grid gap-4 p-4 md:grid-cols-[minmax(0,5.5rem)_1fr_auto] md:items-center md:gap-5">
                      <div className="flex flex-row items-center gap-3 border-b border-[var(--border-soft)] pb-3 md:flex-col md:border-b-0 md:border-r md:pb-0 md:pr-5 md:text-center">
                        <div className="flex items-center gap-1.5 font-semibold tabular-nums text-[var(--text-primary)] md:flex-col md:gap-0">
                          <Clock size={15} className="text-[var(--text-tertiary)] md:hidden" strokeWidth={1.75} />
                          <span className="text-lg leading-none">{appointment.time}</span>
                        </div>
                        <span className="text-2xs font-medium text-[var(--text-tertiary)] md:mt-1">
                          {appointment.duration} min
                        </span>
                      </div>

                      <div className="min-w-0 space-y-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <User size={16} className="shrink-0 text-[var(--text-tertiary)]" strokeWidth={1.75} />
                          <span className="truncate text-base font-semibold text-[var(--text-primary)]">
                            {patientLabel(appointment)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`badge text-xs ${
                              appointment.type === 'initial' ? 'badge-info' : 'badge-success'
                            }`}
                          >
                            {appointment.type === 'initial'
                              ? 'Primera vez'
                              : appointment.type === 'follow_up'
                                ? 'Seguimiento'
                                : appointment.type || 'Consulta'}
                          </span>
                          {appointment.status === 'cancelled' && (
                            <span className="badge badge-danger text-xs">Cancelada</span>
                          )}
                          {appointment.status === 'completed' && (
                            <span className="badge badge-success text-xs">Completada</span>
                          )}
                        </div>
                      </div>

                      <div className="flex md:justify-end">
                        <button
                          type="button"
                          className="btn btn-outline btn-sm w-full md:w-auto"
                          disabled={!appointment.patient?._id}
                          onClick={() => appointment.patient?._id && navigate(`/pacientes/${appointment.patient._id}`)}
                        >
                          Ver expediente
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default Appointments;
