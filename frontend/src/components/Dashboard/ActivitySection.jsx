import React from 'react';
import { Calendar, Users, ChevronRight } from 'lucide-react';

const ActivitySection = ({
    activeTab,
    setActiveTab,
    upcomingAppointments,
    recentPatients,
    onViewAll,
    onNavigateToPatient,
    onNavigateToAppointments
}) => {
    return (
        <div className="dashboard-activity-section card">
            <div className="activity-tabs">
                <button
                    className={`activity-tab ${activeTab === 'appointments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('appointments')}
                >
                    Próximas Citas
                </button>
                <button
                    className={`activity-tab ${activeTab === 'patients' ? 'active' : ''}`}
                    onClick={() => setActiveTab('patients')}
                >
                    Pacientes Recientes
                </button>
            </div>

            <div className="activity-list-container">
                {activeTab === 'appointments' ? (
                    <div className="activity-list fade-in">
                        {upcomingAppointments.length === 0 ? (
                            <div className="empty-activity">
                                <Calendar size={32} className="text-secondary-pink" />
                                <p>No tienes citas próximas</p>
                            </div>
                        ) : (
                            upcomingAppointments.map(appt => (
                                <div key={appt._id} className="activity-item" onClick={onNavigateToAppointments}>
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
                                    <ChevronRight size={16} className="text-secondary-pink" />
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="activity-list fade-in">
                        {recentPatients.length === 0 ? (
                            <div className="empty-activity">
                                <Users size={32} className="text-secondary-pink" />
                                <p>No hay pacientes recientes</p>
                            </div>
                        ) : (
                            recentPatients.map(patient => (
                                <div key={patient._id} className="activity-item" onClick={() => onNavigateToPatient(patient._id)}>
                                    <div className="activity-avatar">
                                        {patient.firstName[0]}{patient.lastName[0]}
                                    </div>
                                    <div className="activity-details">
                                        <h4>{patient.firstName} {patient.lastName}</h4>
                                        <p className="text-sm text-gray-500">{patient.email}</p>
                                    </div>
                                    <ChevronRight size={16} className="text-secondary-pink" />
                                </div>
                            ))
                        )}
                    </div>
                )}

                <div className="activity-footer">
                    <button className="btn-full-width" onClick={onViewAll}>
                        Ver Todos
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActivitySection;
