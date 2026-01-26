
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentsAPI } from '../services/api';
import { Calendar as CalendarIcon, Plus, Clock, User, CheckCircle, XCircle } from 'lucide-react';
import BackButton from '../components/BackButton';
import './Appointments.css';

const Appointments = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'history'

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await appointmentsAPI.getAll();
            setAppointments(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            setLoading(false);
        }
    };

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

        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    };

    const groupAppointments = (appts) => {
        const groups = {};
        appts.forEach(app => {
            // Fix timezone offset for grouping/display if needed, 
            // but relying on string split for day bucket is safer for standard ISO dates
            const dateKey = app.date.split('T')[0];
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(app);
        });

        // Convert to array and sort
        return Object.entries(groups)
            .sort(([dateA], [dateB]) => {
                return activeTab === 'upcoming'
                    ? new Date(dateA) - new Date(dateB) // Ascending for upcoming
                    : new Date(dateB) - new Date(dateA); // Descending for history
            })
            .map(([dateKey, groupAppts]) => ({
                title: getGroupTitle(dateKey),
                date: dateKey,
                appointments: groupAppts.sort((a, b) => a.time.localeCompare(b.time))
            }));
    };

    const filteredAppointments = appointments.filter(app => {
        const appDate = new Date(app.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (activeTab === 'upcoming') {
            // Show today and future, excluding completed/cancelled if desired, 
            // but usually strictly by date is better for "Agenda". 
            // Let's filter out 'completed' from upcoming to make it cleaner? 
            // User asked for "Upcoming", implies future.
            return appDate >= today && app.status !== 'completed' && app.status !== 'cancelled';
        } else {
            // History: Past dates OR completed/cancelled status
            return appDate < today || app.status === 'completed' || app.status === 'cancelled';
        }
    });

    const groupedList = groupAppointments(filteredAppointments);

    if (loading) {
        return (
            <div className="page-loading">
                <div className="spinner-large"></div>
            </div>
        );
    }

    return (
        <div className="appointments-page fade-in">
            <div className="page-header">
                <div>
                    <BackButton to="/dashboard" />
                    <h1>Citas</h1>
                    <p>Gestiona tu agenda de consultas</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/appointments/new')}>
                    <Plus size={20} />
                    Nueva Cita
                </button>
            </div>

            <div className="appointments-tabs">
                <button
                    className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
                    onClick={() => setActiveTab('upcoming')}
                >
                    Próximas
                </button>
                <button
                    className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    Historial
                </button>
            </div>

            <div className="appointments-container">
                {groupedList.length === 0 ? (
                    <div className="empty-state-large">
                        <CalendarIcon size={64} strokeWidth={1} />
                        <h3>No hay citas {activeTab === 'upcoming' ? 'próximas' : 'en el historial'}</h3>
                        {activeTab === 'upcoming' && (
                            <button className="btn btn-primary mt-4" onClick={() => navigate('/appointments/new')}>
                                <Plus size={20} />
                                Agendar Cita
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="appointments-list-grouped">
                        {groupedList.map((group) => (
                            <div key={group.date} className="date-group fade-in">
                                <h3 className="date-group-header">{group.title}</h3>
                                <div className="group-cards">
                                    {group.appointments.map((appointment) => (
                                        <div key={appointment._id} className="appointment-card-new card">
                                            <div className="appt-time-col">
                                                <div className="appt-time">
                                                    <Clock size={16} />
                                                    <span>{appointment.time}</span>
                                                </div>
                                                <span className="appt-duration">{appointment.duration} min</span>
                                            </div>

                                            <div className="appt-info-col">
                                                <div className="appt-patient">
                                                    <User size={18} className="text-secondary" />
                                                    <span className="patient-name">
                                                        {appointment.patient?.firstName} {appointment.patient?.lastName}
                                                    </span>
                                                </div>
                                                <div className="appt-type">
                                                    <span className={`badge badge-${appointment.type === 'initial' ? 'info' : 'success'
                                                        }`}>
                                                        {appointment.type === 'initial' ? 'Primera Vez' :
                                                            appointment.type === 'follow_up' ? 'Seguimiento' : appointment.type}
                                                    </span>
                                                    {appointment.status === 'cancelled' && <span className="badge badge-error">Cancelada</span>}
                                                    {appointment.status === 'completed' && <span className="badge badge-success">Completada</span>}
                                                </div>
                                            </div>

                                            <div className="appt-actions-col">
                                                {/* Future: Add 'Complete' button here */}
                                                <button
                                                    className="btn btn-sm btn-outline"
                                                    onClick={() => navigate(`/patients/${appointment.patient?._id}`)}
                                                >
                                                    Ver Expediente
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Appointments;
