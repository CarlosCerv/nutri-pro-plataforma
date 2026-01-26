import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentsAPI, patientsAPI } from '../services/api';
import { ArrowLeft, Save, Loader } from 'lucide-react';
import BackButton from '../components/BackButton';
import { useEffect } from 'react';
import PremiumSelect from '../components/PremiumSelect';
import SearchableSelect from '../components/SearchableSelect';
import './NewAppointment.css';

const NewAppointment = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState([]);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        patient: '',
        date: '',
        time: '',
        duration: '60',
        type: 'follow_up',
        notes: '',
        isGuest: false,
        guestFirstName: '',
        guestLastName: '',
        guestEmail: '',
        guestPhone: ''
    });

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const response = await patientsAPI.getAll();
            setPatients(response.data.data.filter(p => p.status === 'active'));
        } catch (err) {
            console.error('Error fetching patients:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const appointmentData = {
                date: formData.date,
                time: formData.time,
                duration: formData.duration,
                type: formData.type,
                notes: formData.notes,
                isGuest: formData.isGuest
            };

            if (formData.isGuest) {
                appointmentData.guestDetails = {
                    firstName: formData.guestFirstName,
                    lastName: formData.guestLastName,
                    email: formData.guestEmail,
                    phone: formData.guestPhone
                };
            } else {
                appointmentData.patient = formData.patient;
            }

            await appointmentsAPI.create(appointmentData);
            navigate('/appointments');
        } catch (err) {
            console.error('Error creating appointment:', err);
            setError(err.response?.data?.message || 'Error al crear la cita');
            setLoading(false);
        }
    };

    return (
        <div className="new-appointment-page fade-in">
            <div className="page-header">
                <BackButton to="/appointments" />
                <div>
                    <h1>Nueva Cita</h1>
                    <p>Programa una consulta con tu paciente</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="appointment-form card-form">
                {error && (
                    <div className="error-banner">
                        {error}
                    </div>
                )}

                <div className="form-layout-stack">
                    {/* section 1: patient selection */}
                    <div className="form-card-section">
                        <div className="section-header-compact">
                            <h3>Información del Paciente</h3>
                            <div className="toggle-switch-wrapper">
                                <span className="toggle-label-text">¿Paciente No Registrado?</span>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        name="isGuest"
                                        checked={formData.isGuest}
                                        onChange={handleChange}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                        </div>

                        <div className="form-fields-grid">
                            {!formData.isGuest ? (
                                <div className="form-field full-width">
                                    <label className="field-label" htmlFor="patient">
                                        Seleccionar Paciente <span className="req">*</span>
                                    </label>
                                    <SearchableSelect
                                        options={patients}
                                        value={formData.patient}
                                        onChange={handleChange}
                                        placeholder="Buscar por nombre o apellido..."
                                        disabled={loading}
                                    />
                                </div>
                            ) : (
                                <div className="guest-fields-container animate-fade-in">
                                    <div className="form-field">
                                        <label className="field-label" htmlFor="guestFirstName">Nombre <span className="req">*</span></label>
                                        <input type="text" id="guestFirstName" name="guestFirstName" className="field-input" value={formData.guestFirstName} onChange={handleChange} required={formData.isGuest} disabled={loading} placeholder="Ej. Juan" />
                                    </div>
                                    <div className="form-field">
                                        <label className="field-label" htmlFor="guestLastName">Apellido <span className="req">*</span></label>
                                        <input type="text" id="guestLastName" name="guestLastName" className="field-input" value={formData.guestLastName} onChange={handleChange} required={formData.isGuest} disabled={loading} placeholder="Ej. Pérez" />
                                    </div>
                                    <div className="form-field">
                                        <label className="field-label" htmlFor="guestEmail">Email</label>
                                        <input type="email" id="guestEmail" name="guestEmail" className="field-input" value={formData.guestEmail} onChange={handleChange} disabled={loading} placeholder="juan@ejemplo.com" />
                                    </div>
                                    <div className="form-field">
                                        <label className="field-label" htmlFor="guestPhone">Teléfono</label>
                                        <input type="tel" id="guestPhone" name="guestPhone" className="field-input" value={formData.guestPhone} onChange={handleChange} disabled={loading} placeholder="+52 ..." />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* section 2: appointment details */}
                    <div className="form-card-section bg-alt-faint">
                        <h3 className="section-title-simple">Detalles de la Cita</h3>
                        <div className="form-fields-grid">
                            <div className="form-field">
                                <label className="field-label">Tipo de Consulta <span className="req">*</span></label>
                                <PremiumSelect
                                    name="type"
                                    options={[
                                        { value: 'initial', label: 'Primera Vez (Inicial)' },
                                        { value: 'follow_up', label: 'Seguimiento' },
                                        { value: 'check_in', label: 'Check-in rápido' },
                                        { value: 'final', label: 'Consulta Final' }
                                    ]}
                                    value={formData.type}
                                    onChange={handleChange}
                                    placeholder="Seleccionar tipo..."
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-field">
                                <label className="field-label" htmlFor="date">Fecha <span className="req">*</span></label>
                                <input type="date" id="date" name="date" className="field-input" value={formData.date} onChange={handleChange} required disabled={loading} />
                            </div>

                            <div className="form-field">
                                <label className="field-label" htmlFor="time">Hora <span className="req">*</span></label>
                                <input type="time" id="time" name="time" className="field-input" value={formData.time} onChange={handleChange} required disabled={loading} />
                            </div>

                            <div className="form-field">
                                <label className="field-label" htmlFor="duration">Duración (min) <span className="req">*</span></label>
                                <input type="number" id="duration" name="duration" className="field-input" value={formData.duration} onChange={handleChange} required disabled={loading} min="15" step="15" />
                            </div>
                        </div>
                    </div>

                    <div className="form-card-section no-border">
                        <div className="form-field full-width">
                            <label className="field-label" htmlFor="notes">Notas adicionales</label>
                            <textarea
                                id="notes"
                                name="notes"
                                className="field-input field-textarea"
                                rows="3"
                                value={formData.notes}
                                onChange={handleChange}
                                disabled={loading}
                                placeholder="Escribe aquí cualquier observación importante sobre la cita..."
                            />
                        </div>
                    </div>
                </div>

                <div className="form-footer-actions">
                    <button
                        type="button"
                        className="btn-v2-secondary"
                        onClick={() => navigate('/appointments')}
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="btn-v2-primary"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader className="spinner" size={20} />
                                <span>Guardando...</span>
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                <span>Guardar Cita</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewAppointment;
