import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientsAPI } from '../services/api';
import { ArrowLeft, Edit, Trash2, User, Mail, Phone, Calendar, Activity } from 'lucide-react';
import './PatientDetail.css';

import ClinicalNotesTab from '../components/ClinicalNotesTab';
import PatientMealPlansTab from '../components/PatientMealPlansTab';
import BackButton from '../components/BackButton';

const PatientDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        fetchPatient();
    }, [id]);

    const fetchPatient = async () => {
        try {
            const response = await patientsAPI.getOne(id);
            setPatient(response.data.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching patient:', err);
            setError('Error al cargar el paciente');
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('¿Estás seguro de eliminar este paciente?')) {
            try {
                await patientsAPI.delete(id);
                navigate('/patients');
            } catch (err) {
                console.error('Error deleting patient:', err);
                alert('Error al eliminar el paciente');
            }
        }
    };

    const handleToggleStatus = async () => {
        try {
            const newStatus = !patient.isActive;
            // Optimistic update
            setPatient(prev => ({ ...prev, isActive: newStatus, status: newStatus ? 'active' : 'inactive' }));

            await patientsAPI.update(id, { isActive: newStatus });
        } catch (err) {
            console.error('Error updating status:', err);
            // Revert on error
            fetchPatient();
            alert('Error al actualizar estado');
        }
    };

    if (loading) {
        return (
            <div className="page-loading">
                <div className="spinner-large"></div>
            </div>
        );
    }

    if (error || !patient) {
        return (
            <div className="patient-detail-page">
                <div className="error-state">
                    <h2>Error</h2>
                    <p>{error || 'Paciente no encontrado'}</p>
                    <button className="btn btn-primary" onClick={() => navigate('/patients')}>
                        Volver a Pacientes
                    </button>
                </div>
            </div>
        );
    }

    return (

        <div className="patient-detail-page fade-in">
            <div className="page-header simple-header">
                <BackButton to="/patients" />
            </div>

            <div className="detail-layout">
                {/* Sidebar Profile */}
                <div className="profile-sidebar card">
                    <div className="profile-header-center">
                        <div className="patient-avatar-xl">
                            {patient.firstName[0]}{patient.lastName[0]}
                        </div>
                        <h2>{patient.firstName} {patient.lastName}</h2>
                        <div className="status-badge-container" onClick={handleToggleStatus} style={{ cursor: 'pointer' }}>
                            <span className={`badge badge-${patient.isActive ? 'success' : 'secondary'}`}>
                                {patient.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                            <small className="text-xs text-muted block mt-1">(Click para cambiar)</small>
                        </div>
                    </div>

                    <div className="profile-actions">
                        <button className="btn btn-outline btn-sm w-full" onClick={() => navigate(`/patients/${id}/edit`)}>
                            <Edit size={16} /> Editar Perfil
                        </button>
                    </div>

                    <div className="profile-info-list">
                        <div className="info-row">
                            <Mail size={16} className="text-secondary" />
                            <span>{patient.email || 'Sin email'}</span>
                        </div>
                        <div className="info-row">
                            <Phone size={16} className="text-secondary" />
                            <span>{patient.phone || 'Sin teléfono'}</span>
                        </div>
                        <div className="info-row">
                            <User size={16} className="text-secondary" />
                            <span>{patient.gender || 'N/A'}, {patient.dateOfBirth ? `${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} años` : ''}</span>
                        </div>
                    </div>

                    <div className="profile-danger-zone">
                        <button className="btn-link-danger" onClick={handleDelete}>
                            <Trash2 size={16} /> Eliminar Paciente
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="detail-main-content">
                    {/* Tabs Navigation */}
                    <div className="tabs-nav-modern">
                        <button
                            className={`tab-btn-modern ${activeTab === 'general' ? 'active' : ''}`}
                            onClick={() => setActiveTab('general')}
                        >
                            General
                        </button>
                        <button
                            className={`tab-btn-modern ${activeTab === 'notes' ? 'active' : ''}`}
                            onClick={() => setActiveTab('notes')}
                        >
                            Notas Clínicas
                        </button>
                        <button
                            className={`tab-btn-modern ${activeTab === 'mealplans' ? 'active' : ''}`}
                            onClick={() => setActiveTab('mealplans')}
                        >
                            Planes Nutricionales
                        </button>
                        <button
                            className={`tab-btn-modern ${activeTab === 'gallery' ? 'active' : ''}`}
                            onClick={() => setActiveTab('gallery')}
                        >
                            Galería
                        </button>
                    </div>

                    <div className="tab-content-area">
                        {activeTab === 'general' ? (
                            <div className="fade-in">
                                {/* Anthropometry Cards */}
                                {patient.anthropometry && (
                                    <div className="section-block">
                                        <h3>Antropometría Actual</h3>
                                        <div className="stats-grid-modern">
                                            <div className="stat-card-mini card">
                                                <span className="stat-label">Peso Current</span>
                                                <span className="stat-number">{patient.anthropometry.weight || '-'} <small>kg</small></span>
                                            </div>
                                            <div className="stat-card-mini card">
                                                <span className="stat-label">Altura</span>
                                                <span className="stat-number">{patient.anthropometry.height || '-'} <small>cm</small></span>
                                            </div>
                                            <div className="stat-card-mini card">
                                                <span className="stat-label">IMC</span>
                                                <span className="stat-number">{patient.anthropometry.bmi || '-'}</span>
                                            </div>
                                            <div className="stat-card-mini card">
                                                <span className="stat-label">% Grasa</span>
                                                <span className="stat-number">{patient.anthropometry.bodyFatPercentage || '-'} <small>%</small></span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Goals */}
                                {patient.nutritionalGoals && (
                                    <div className="section-block mt-6">
                                        <h3>Objetivos</h3>
                                        <div className="card padding-lg">
                                            <div className="goals-grid">
                                                <div className="goal-item">
                                                    <Activity size={20} className="text-primary" />
                                                    <div>
                                                        <label>Meta Principal</label>
                                                        <p>{patient.nutritionalGoals.primaryGoal || 'No definido'}</p>
                                                    </div>
                                                </div>
                                                {patient.nutritionalGoals.targetWeight && (
                                                    <div className="goal-item">
                                                        <Activity size={20} className="text-primary" />
                                                        <div>
                                                            <label>Peso Objetivo</label>
                                                            <p>{patient.nutritionalGoals.targetWeight} kg</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : activeTab === 'notes' ? (
                            <div className="fade-in">
                                <ClinicalNotesTab patientId={id} />
                            </div>
                        ) : activeTab === 'mealplans' ? (
                            <div className="fade-in">
                                <PatientMealPlansTab patientId={id} patient={patient} />
                            </div>
                        ) : activeTab === 'mealplans' ? (
                            <div className="fade-in">
                                <PatientMealPlansTab patientId={id} patient={patient} />
                            </div>
                        ) : activeTab === 'gallery' ? (
                            <div className="fade-in">
                                <div className="gallery-section section-block">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3>Galería de Progreso</h3>
                                        <label className="btn btn-primary btn-sm cursor-pointer">
                                            Subir Foto
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files[0];
                                                    if (!file) return;

                                                    const formData = new FormData();
                                                    formData.append('file', file);
                                                    formData.append('type', 'other'); // Default type for now

                                                    try {
                                                        const token = localStorage.getItem('token');
                                                        // Direct fetch or use api helper if modified to support FormData
                                                        // Using fetch for quick FormData support
                                                        const res = await fetch(`http://localhost:5000/api/patients/${id}/upload`, {
                                                            method: 'POST',
                                                            headers: {
                                                                'Authorization': `Bearer ${token}`
                                                            },
                                                            body: formData
                                                        });

                                                        if (res.ok) {
                                                            fetchPatient(); // Refresh
                                                        } else {
                                                            alert('Error al subir imagen');
                                                        }
                                                    } catch (err) {
                                                        console.error(err);
                                                        alert('Error de conexión');
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>

                                    {patient.images && patient.images.length > 0 ? (
                                        <div className="gallery-grid">
                                            {patient.images.map((img, idx) => (
                                                <div key={idx} className="gallery-item card">
                                                    <img src={img.url} alt={img.type} className="gallery-img" />
                                                    <div className="gallery-caption capitalize">{img.type} - {new Date(img.date).toLocaleDateString()}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="empty-state card p-8 text-center text-muted">
                                            <p>No hay imágenes cargadas.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDetail;
