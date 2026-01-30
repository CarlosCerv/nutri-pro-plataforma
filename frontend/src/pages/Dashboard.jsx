import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dashboardAPI } from '../services/api';
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
            const { data } = await dashboardAPI.getStats();

            setStatsData(data.data.stats);
            setRecentPatients(data.data.recentPatients);
            setUpcomingAppointments(data.data.upcomingAppointments);

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
        <main className="dashboard-view-root fade-in">
            <div className="dashboard-inner-container">
                <DashboardHeader
                    userName={user?.name?.split(' ')[0]}
                    date={formattedDate}
                    onNewPatient={() => navigate('/patients/new')}
                    onNewAppointment={() => navigate('/appointments/new')}
                />

                <section className="stats-overview-section">
                    <StatCard
                        label="Total Pacientes"
                        value={statsData.totalPatients}
                        trendValue={`${statsData.activePatients} Activos`}
                        icon={Users}
                    />
                    <StatCard
                        label="Citas Hoy"
                        value={statsData.todayAppointments}
                        trendValue={`${statsData.upcomingAppointments} Próximas`}
                        icon={Calendar}
                    />
                    <StatCard
                        label="Consultas Mes"
                        value={statsData.thisMonthAppointments}
                        trend={statsData.monthlyChange >= 0 ? 'positive' : 'negative'}
                        trendValue={`${Math.abs(statsData.monthlyChange)}%`}
                        icon={Activity}
                    />
                    <StatCard
                        label="Tasa de Éxito"
                        value={`${statsData.successRate}%`}
                        trend={statsData.successRateChange >= 0 ? 'positive' : 'negative'}
                        trendValue={`${Math.abs(statsData.successRateChange)}%`}
                        icon={TrendingUp}
                    />
                </section>

                <div className="dashboard-content-splits">
                    <section className="dashboard-main-column">
                        <div className="card-outer calendar-container-card">
                            <div className="card-header-v2">
                                <h2>Calendario Semanal</h2>
                                <button className="btn-v2-link" onClick={() => navigate('/appointments')}>
                                    Ver Agenda <ChevronRight size={16} />
                                </button>
                            </div>
                            <div className="calendar-view-box">
                                <WeeklyCalendar />
                            </div>
                        </div>
                    </section>

                    <aside className="dashboard-side-column">
                        <ActivitySection
                            activeTab={activityTab}
                            setActiveTab={setActivityTab}
                            upcomingAppointments={upcomingAppointments}
                            recentPatients={recentPatients}
                            onViewAll={() => navigate(activityTab === 'appointments' ? '/appointments' : '/patients')}
                            onNavigateToPatient={(id) => navigate(`/patients/${id}`)}
                            onNavigateToAppointments={() => navigate('/appointments')}
                        />
                    </aside>
                </div>
            </div>
        </main>
    );
};

export default Dashboard;
