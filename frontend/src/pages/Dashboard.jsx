import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { patientsAPI, appointmentsAPI } from '../services/api';
import { Users, Calendar, TrendingUp, Activity, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WeeklyCalendar from '../components/WeeklyCalendar';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import StatCard from '../components/Dashboard/StatCard';
import ActivitySection from '../components/Dashboard/ActivitySection';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [statsData, setStatsData] = useState({
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
    const [activityTab, setActivityTab] = useState('appointments');

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

            // Stats calculation logic
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
            const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

            const thisMonthAppts = appointments.filter(a => {
                const apptDate = new Date(a.date);
                return apptDate >= firstDayOfMonth && apptDate <= lastDayOfMonth;
            }).length;

            const lastMonthAppts = appointments.filter(a => {
                const apptDate = new Date(a.date);
                return apptDate >= firstDayLastMonth && apptDate <= lastDayLastMonth;
            }).length;

            const monthlyChange = lastMonthAppts > 0
                ? Math.round(((thisMonthAppts - lastMonthAppts) / lastMonthAppts) * 100)
                : 0;

            const completedAppts = appointments.filter(a => a.status === 'completed').length;
            const totalAppts = appointments.length;
            const successRate = totalAppts > 0 ? Math.round((completedAppts / totalAppts) * 100) : 0;

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

            setStatsData({
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
            setUpcomingAppointments(appointments
                .filter(a => new Date(a.date) >= new Date() && a.status === 'scheduled')
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(0, 5));

            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    const formattedDate = useMemo(() => {
        return new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    }, []);

    if (loading) {
        return <div className="dashboard-loading"><div className="spinner-large"></div></div>;
    }

    return (
        <div className="dashboard-container fade-in">
            <DashboardHeader
                userName={user?.name?.split(' ')[0]}
                date={formattedDate}
                onNewPatient={() => navigate('/patients/new')}
                onNewAppointment={() => navigate('/appointments/new')}
            />

            <div className="stats-section-grid">
                <StatCard
                    label="Total Pacientes"
                    value={statsData.totalPatients}
                    trendValue={`${statsData.activePatients} Activos`}
                    icon={Users}
                    colorClass="blue-tint"
                />
                <StatCard
                    label="Citas Hoy"
                    value={statsData.todayAppointments}
                    trendValue={`${statsData.upcomingAppointments} Próximas`}
                    icon={Calendar}
                    colorClass="purple-tint"
                />
                <StatCard
                    label="Consultas Mes"
                    value={statsData.thisMonthAppointments}
                    trend={statsData.monthlyChange >= 0 ? 'positive' : 'negative'}
                    trendValue={`${Math.abs(statsData.monthlyChange)}%`}
                    icon={Activity}
                    colorClass="green-tint"
                />
                <StatCard
                    label="Tasa de Éxito"
                    value={`${statsData.successRate}%`}
                    trend={statsData.successRateChange >= 0 ? 'positive' : 'negative'}
                    trendValue={`${Math.abs(statsData.successRateChange)}%`}
                    icon={TrendingUp}
                    colorClass="orange-tint"
                />
            </div>

            <div className="dashboard-layout-main">
                <section className="calendar-main card">
                    <div className="card-header-flex">
                        <h2>Calendario Semanal</h2>
                        <button className="btn-text-link" onClick={() => navigate('/appointments')}>
                            Ver Agenda <ChevronRight size={16} />
                        </button>
                    </div>
                    <div className="calendar-wrapper-inner">
                        <WeeklyCalendar />
                    </div>
                </section>

                <ActivitySection
                    activeTab={activityTab}
                    setActiveTab={setActivityTab}
                    upcomingAppointments={upcomingAppointments}
                    recentPatients={recentPatients}
                    onViewAll={() => navigate(activityTab === 'appointments' ? '/appointments' : '/patients')}
                    onNavigateToPatient={(id) => navigate(`/patients/${id}`)}
                    onNavigateToAppointments={() => navigate('/appointments')}
                />
            </div>
        </div>
    );
};

export default Dashboard;
