import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { patientsAPI, appointmentsAPI } from '../services/api';
import { Users, Calendar, TrendingUp, Activity, Plus, Clock, ChevronRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WeeklyCalendar from '../components/WeeklyCalendar';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalPatients: 0,
        activePatients: 0,
        upcomingAppointments: 0,
        todayAppointments: 0,
        successRate: 0,
        successRateChange: 0,
        thisMonthAppointments: 0,
        monthlyChange: 0
    });
    const [recentPatients, setRecentPatients] = useState([]);
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activityTab, setActivityTab] = useState('appointments'); // 'appointments' | 'patients'

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [patientsRes, appointmentsRes] = await Promise.all([
                patientsAPI.getAll(),
                appointmentsAPI.getAll(),
            ]);

            const patients = patientsRes.data.data;
            const appointments = appointmentsRes.data.data;

            // Calculate stats (keeping existing logic)
            const activePatients = patients.filter(p => p.status === 'active').length;
            const today = new Date().toISOString().split('T')[0];
            const todayAppts = appointments.filter(a =>
                a.date.split('T')[0] === today && a.status === 'scheduled'
            ).length;
            const upcomingAppts = appointments.filter(a =>
                new Date(a.date) >= new Date() && a.status === 'scheduled'
            ).length;

            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            const thisMonthAppts = appointments.filter(a => {
                const apptDate = new Date(a.date);
                return apptDate >= firstDayOfMonth && apptDate <= lastDayOfMonth;
            }).length;

            const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

            const lastMonthAppts = appointments.filter(a => {
                const apptDate = new Date(a.date);
                return apptDate >= firstDayLastMonth && apptDate <= lastDayLastMonth;
            }).length;

            const monthlyChange = lastMonthAppts > 0
                ? Math.round(((thisMonthAppts - lastMonthAppts) / lastMonthAppts) * 100)
                : 0;

            const completedAppts = appointments.filter(a => a.status === 'completed').length;
            const totalAppts = appointments.length;
            const successRate = totalAppts > 0
                ? Math.round((completedAppts / totalAppts) * 100)
                : 0;

            const thisMonthCompleted = appointments.filter(a => {
                const apptDate = new Date(a.date);
                return apptDate >= firstDayOfMonth && apptDate <= lastDayOfMonth && a.status === 'completed';
            }).length;

            const thisMonthTotal = appointments.filter(a => {
                const apptDate = new Date(a.date);
                return apptDate >= firstDayOfMonth && apptDate <= lastDayOfMonth;
            }).length;

            const lastMonthCompleted = appointments.filter(a => {
                const apptDate = new Date(a.date);
                return apptDate >= firstDayLastMonth && apptDate <= lastDayLastMonth && a.status === 'completed';
            }).length;

            const thisMonthRate = thisMonthTotal > 0 ? (thisMonthCompleted / thisMonthTotal) * 100 : 0;
            const lastMonthRate = lastMonthAppts > 0 ? (lastMonthCompleted / lastMonthAppts) * 100 : 0;
            const successRateChange = Math.round(thisMonthRate - lastMonthRate);

            setStats({
                totalPatients: patients.length,
                activePatients,
                upcomingAppointments: upcomingAppts,
                todayAppointments: todayAppts,
                successRate,
                successRateChange,
                thisMonthAppointments: thisMonthAppts,
                monthlyChange
            });

            setRecentPatients(patients.slice(0, 5));

            const upcoming = appointments
                .filter(a => new Date(a.date) >= new Date() && a.status === 'scheduled')
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(0, 5);
            setUpcomingAppointments(upcoming);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    const getFormattedDate = () => {
        return new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner-large"></div>
            </div>
        );
    }

    return (
        <div className="dashboard fade-in">
            {/* Header Section */}
            <div className="dashboard-header-modern">
                <div className="header-left">
                    <p className="current-date">{getFormattedDate()}</p>
                    <h1>Buenos días, {user?.name?.split(' ')[0]} 👋</h1>
                </div>
                <div className="header-actions">
                    <button className="btn btn-outline" onClick={() => navigate('/patients/new')}>
                        <Plus size={18} /> Nuevo Paciente
                    </button>
                    <button className="btn btn-primary" onClick={() => navigate('/appointments/new')}>
                        <Plus size={18} /> Nueva Cita
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="stats-grid-modern">
                <div className="stat-card-modern">
                    <div className="stat-icon-wrapper bg-blue-100 text-blue-600">
                        <Users size={20} />
                    </div>
                    <div className="stat-info">
                        <p className="stat-label">Total Pacientes</p>
                        <div className="stat-number-row">
                            <h3>{stats.totalPatients}</h3>
                            <span className="trend-badge positive">
                                {stats.activePatients} Activos
                            </span>
                        </div>
                    </div>
                </div>

                <div className="stat-card-modern">
                    <div className="stat-icon-wrapper bg-purple-100 text-purple-600">
                        <Calendar size={20} />
                    </div>
                    <div className="stat-info">
                        <p className="stat-label">Citas Hoy</p>
                        <div className="stat-number-row">
                            <h3>{stats.todayAppointments}</h3>
                            <span className="trend-badge neutral">
                                {stats.upcomingAppointments} Próximas
                            </span>
                        </div>
                    </div>
                </div>

                <div className="stat-card-modern">
                    <div className="stat-icon-wrapper bg-green-100 text-green-600">
                        <Activity size={20} />
                    </div>
                    <div className="stat-info">
                        <p className="stat-label">Consultas Mes</p>
                        <div className="stat-number-row">
                            <h3>{stats.thisMonthAppointments}</h3>
                            <span className={`trend-badge ${stats.monthlyChange >= 0 ? 'positive' : 'negative'}`}>
                                {stats.monthlyChange >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {Math.abs(stats.monthlyChange)}%
                            </span>
                        </div>
                    </div>
                </div>

                <div className="stat-card-modern">
                    <div className="stat-icon-wrapper bg-orange-100 text-orange-600">
                        <TrendingUp size={20} />
                    </div>
                    <div className="stat-info">
                        <p className="stat-label">Tasa de Éxito</p>
                        <div className="stat-number-row">
                            <h3>{stats.successRate}%</h3>
                            <span className={`trend-badge ${stats.successRateChange >= 0 ? 'positive' : 'negative'}`}>
                                {stats.successRateChange >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {Math.abs(stats.successRateChange)}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="dashboard-main-grid">
                {/* Left Column: Calendar */}
                <div className="dashboard-calendar-section card">
                    <div className="section-header">
                        <h2>Calendario Semanal</h2>
                        <button className="btn-link" onClick={() => navigate('/appointments')}>
                            Ver Agenda Completa <ChevronRight size={16} />
                        </button>
                    </div>
                    <WeeklyCalendar />
                </div>

                {/* Right Column: Activity Feed */}
                <div className="dashboard-activity-section card">
                    <div className="activity-tabs">
                        <button
                            className={`activity-tab ${activityTab === 'appointments' ? 'active' : ''}`}
                            onClick={() => setActivityTab('appointments')}
                        >
                            Próximas Citas
                        </button>
                        <button
                            className={`activity-tab ${activityTab === 'patients' ? 'active' : ''}`}
                            onClick={() => setActivityTab('patients')}
                        >
                            Pacientes Recientes
                        </button>
                    </div>

                    <div className="activity-list-container">
                        {activityTab === 'appointments' ? (
                            <div className="activity-list fade-in">
                                {upcomingAppointments.length === 0 ? (
                                    <div className="empty-activity">
                                        <Calendar size={32} />
                                        <p>No tienes citas próximas</p>
                                    </div>
                                ) : (
                                    upcomingAppointments.map(appt => (
                                        <div key={appt._id} className="activity-item" onClick={() => navigate('/appointments')}>
                                            <div className="activity-time-box">
                                                <span className="act-time">{appt.time}</span>
                                                <span className="act-date">
                                                    {new Date(appt.date).getDate()}/
                                                    {new Date(appt.date).getMonth() + 1}
                                                </span>
                                            </div>
                                            <div className="activity-details">
                                                <h4>{appt.patient?.firstName} {appt.patient?.lastName}</h4>
                                                <span className={`badge-mini badge-${appt.type === 'initial' ? 'info' : 'success'}`}>
                                                    {appt.type === 'initial' ? '1ª Vez' : 'Seguimiento'}
                                                </span>
                                            </div>
                                            <ChevronRight size={16} className="text-gray-400" />
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <div className="activity-list fade-in">
                                {recentPatients.length === 0 ? (
                                    <div className="empty-activity">
                                        <Users size={32} />
                                        <p>No hay pacientes recientes</p>
                                    </div>
                                ) : (
                                    recentPatients.map(patient => (
                                        <div key={patient._id} className="activity-item" onClick={() => navigate(`/patients/${patient._id}`)}>
                                            <div className="activity-avatar">
                                                {patient.firstName[0]}{patient.lastName[0]}
                                            </div>
                                            <div className="activity-details">
                                                <h4>{patient.firstName} {patient.lastName}</h4>
                                                <p className="text-sm text-gray-500">{patient.email}</p>
                                            </div>
                                            <ChevronRight size={16} className="text-gray-400" />
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        <div className="activity-footer">
                            <button className="btn-full-width" onClick={() => navigate(activityTab === 'appointments' ? '/appointments' : '/patients')}>
                                Ver Todos
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
