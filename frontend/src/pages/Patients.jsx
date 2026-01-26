import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientsAPI } from '../services/api';
import { Plus, Search, User } from 'lucide-react';
import './Patients.css';

const Patients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const response = await patientsAPI.getAll();
            setPatients(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching patients:', error);
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(patient =>
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="page-loading">
                <div className="spinner-large"></div>
            </div>
        );
    }

    return (
        <div className="patients-page fade-in">
            <div className="page-header">
                <div>
                    <h1>Pacientes</h1>
                    <p>Gestiona los expedientes de tus pacientes</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/patients/new')}>
                    <Plus size={20} />
                    Nuevo Paciente
                </button>
            </div>

            <div className="search-bar">
                <Search size={20} />
                <input
                    type="text"
                    placeholder="Buscar por nombre, email o teléfono..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="patients-container card">
                {filteredPatients.length === 0 ? (
                    <div className="empty-state-large">
                        <User size={64} strokeWidth={1} />
                        <h3>No se encontraron pacientes</h3>
                        <p>{searchTerm ? 'Intenta con otra búsqueda' : 'Comienza agregando tu primer paciente'}</p>
                        {!searchTerm && (
                            <button className="btn btn-primary" onClick={() => navigate('/patients/new')}>
                                <Plus size={20} />
                                Agregar Paciente
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="patients-list">
                        <div className="patients-list-header">
                            <span>Paciente</span>
                            <span>Contacto</span>
                            <span>Estado</span>
                            <span>Acciones</span>
                        </div>
                        {filteredPatients.map((patient) => (
                            <div key={patient._id} className="patient-row" onClick={() => navigate(`/patients/${patient._id}`)}>
                                <div className="patient-cell-profile">
                                    <div className="patient-avatar-sm">
                                        {patient.firstName[0]}{patient.lastName[0]}
                                    </div>
                                    <div className="patient-name-box">
                                        <span className="name">{patient.firstName} {patient.lastName}</span>
                                        <span className="meta-text">{patient.gender === 'Masculino' ? 'H' : patient.gender === 'Femenino' ? 'M' : ''} {patient.dateOfBirth && `, ${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} años`}</span>
                                    </div>
                                </div>

                                <div className="patient-cell-contact">
                                    {patient.email && <div className="contact-item">{patient.email}</div>}
                                    {patient.phone && <div className="contact-item text-secondary">{patient.phone}</div>}
                                </div>

                                <div className="patient-cell-status">
                                    <span className={`badge badge-${patient.status === 'active' ? 'success' : 'warning'}`}>
                                        {patient.status === 'active' ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>

                                <div className="patient-cell-actions">
                                    <button className="btn btn-sm btn-outline">
                                        Ver Expediente
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Patients;
