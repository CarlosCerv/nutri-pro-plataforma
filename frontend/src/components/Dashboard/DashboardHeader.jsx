import React from 'react';
import { Plus } from 'lucide-react';

const DashboardHeader = ({ userName, date, onNewPatient, onNewAppointment }) => {
    return (
        <div className="dashboard-header-container">
            <div className="header-meta">
                <p className="current-date">{date}</p>
                <h1 className="welcome-text">Buenos días, <span className="highlight-name">{userName}</span></h1>
            </div>
            <div className="header-actions">
                <button className="btn btn-action-secondary" onClick={onNewPatient}>
                    <Plus size={18} /> Nuevo Paciente
                </button>
                <button className="btn btn-primary" onClick={onNewAppointment}>
                    <Plus size={18} /> Nueva Cita
                </button>
            </div>
        </div>
    );
};

export default DashboardHeader;
