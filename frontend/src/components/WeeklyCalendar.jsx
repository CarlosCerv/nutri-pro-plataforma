import { useState, useEffect, useCallback } from 'react';
import { appointmentsAPI } from '../services/api';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import './WeeklyCalendar.css';

const WeeklyCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [weekAppointments, setWeekAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const getWeekDays = (baseDate) => {
        const days = [];
        const startOfWeek = new Date(baseDate);
        // Reset to Monday of the current week (optional, or just start from today)
        // Let's start from Today for a "Next 7 Days" view or standard week view? 
        // Standard week view (Sun-Sat or Mon-Sun) is usually better for calendars.
        // Let's go with "Next 7 Days" starting from the baseDate (which defaults to today)
        // OR standard week view based on currentDate state.

        // Let's stick to a standard week view starting Monday
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        const monday = new Date(startOfWeek.setDate(diff));

        for (let i = 0; i < 7; i++) {
            const nextDay = new Date(monday);
            nextDay.setDate(monday.getDate() + i);
            days.push(nextDay);
        }
        return days;
    };

    const days = getWeekDays(currentDate);

    const fetchWeekAppointments = useCallback(async () => {
        setLoading(true);
        try {
            const startDate = days[0].toISOString().split('T')[0];

            // Adjust endDate to include the full last day
            const endDateTime = new Date(days[6]);
            endDateTime.setHours(23, 59, 59, 999);

            const response = await appointmentsAPI.getAll({
                startDate,
                endDate: endDateTime.toISOString()
            });

            setWeekAppointments(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching week appointments:', error);
            setLoading(false);
        }
    }, [days]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchWeekAppointments();
    }, [fetchWeekAppointments]);

    const nextWeek = () => {
        const next = new Date(currentDate);
        next.setDate(currentDate.getDate() + 7);
        setCurrentDate(next);
    };

    const prevWeek = () => {
        const prev = new Date(currentDate);
        prev.setDate(currentDate.getDate() - 7);
        setCurrentDate(prev);
    };

    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const getAppointmentsForDay = (date) => {
        return weekAppointments.filter(appt => {
            const apptDate = new Date(appt.date);
            return apptDate.getDate() === date.getDate() &&
                apptDate.getMonth() === date.getMonth() &&
                apptDate.getFullYear() === date.getFullYear();
        });
    };

    const weekRange = `${days[0].toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} - ${days[6].toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}`;

    return (
        <div className="card weekly-calendar-card">
            <div className="card-header calendar-header">
                <h3><CalendarIcon size={20} style={{ marginRight: '8px' }} /> Calendario Semanal</h3>
                <div className="calendar-controls">
                    <button className="btn-icon" onClick={prevWeek}><ChevronLeft size={20} /></button>
                    <span className="week-label">{weekRange}</span>
                    <button className="btn-icon" onClick={nextWeek}><ChevronRight size={20} /></button>
                </div>
            </div>

            <div className="calendar-grid">
                {days.map((day, index) => {
                    const dayAppointments = getAppointmentsForDay(day);
                    const isCurrentDay = isToday(day);

                    return (
                        <div key={index} className={`calendar-day ${isCurrentDay ? 'today' : ''}`}>
                            <div className="day-header">
                                <span className="day-name">{day.toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                                <span className="day-number">{day.getDate()}</span>
                            </div>
                            <div className="day-content">
                                {loading ? (
                                    <div className="spinner-small"></div>
                                ) : dayAppointments.length > 0 ? (
                                    dayAppointments.map(appt => (
                                        <div key={appt._id} className={`mini-appointment ${appt.type}`}>
                                            <div className="mini-appt-time">
                                                <Clock size={10} /> {appt.time}
                                            </div>
                                            <div className="mini-appt-name">
                                                {appt.patient?.firstName} {appt.patient?.lastName?.[0]}.
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-appts"></div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WeeklyCalendar;
