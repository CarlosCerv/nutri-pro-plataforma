import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentsAPI, patientsAPI } from '../services/api';
import { ArrowLeft, Save, Loader } from 'lucide-react';
import BackButton from '../components/BackButton';
import { useEffect } from 'react';
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

            <form onSubmit={handleSubmit} className="appointment-form card">
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <div className="form-section">
                    <div className="form-grid">
                        <div className="form-group form-toggle-group">
                            <label className="toggle-label">
                                <input
                                    type="checkbox"
                                    name="isGuest"
                                    checked={formData.isGuest}
                                    onChange={handleChange}
                                />
                                <span>Paciente Nuevo / Invitado (No registrado)</span>
                            </label>
                        </div>

                        {!formData.isGuest ? (
                            <div className="form-group">
                                <label className="label" htmlFor="patient">
                                    Paciente <span className="required">*</span>
                                </label>
                                <select
                                    id="patient"
                                    name="patient"
                                    className="input"
                                    value={formData.patient}
                                    onChange={handleChange}
                                    required={!formData.isGuest}
                                    disabled={loading}
                                >
                                    <option value="">Seleccionar paciente...</option>
                                    {patients.map(patient => (
                                        <option key={patient._id} value={patient._id}>
                                            {patient.firstName} {patient.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <>
                                <div className="form-group">
                                    <label className="label" htmlFor="guestFirstName">
                                        Nombre <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="guestFirstName"
                                        name="guestFirstName"
                                        className="input"
                                        value={formData.guestFirstName}
                                        onChange={handleChange}
                                        required={formData.isGuest}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label" htmlFor="guestLastName">
                                        Apellido <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="guestLastName"
                                        name="guestLastName"
                                        className="input"
                                        value={formData.guestLastName}
                                        onChange={handleChange}
                                        required={formData.isGuest}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label" htmlFor="guestEmail">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="guestEmail"
                                        name="guestEmail"
                                        className="input"
                                        value={formData.guestEmail}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label" htmlFor="guestPhone">
                                        Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        id="guestPhone"
                                        name="guestPhone"
                                        className="input"
                                        value={formData.guestPhone}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </div>
                            </>
                        )}

                        <div className="form-group">
                            <label className="label" htmlFor="type">
                                Tipo de Consulta <span className="required">*</span>
                            </label>
                            <select
                                id="type"
                                name="type"
                                className="input"
                                value={formData.type}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            >
                                <option value="initial">Inicial</option>
                                <option value="follow_up">Seguimiento</option>
                                <option value="check_in">Check-in</option>
                                <option value="final">Final</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="label" htmlFor="date">
                                Fecha <span className="required">*</span>
                            </label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                className="input"
                                value={formData.date}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label className="label" htmlFor="time">
                                Hora <span className="required">*</span>
                            </label>
                            <input
                                type="time"
                                id="time"
                                name="time"
                                className="input"
                                value={formData.time}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label className="label" htmlFor="duration">
                                Duración (minutos) <span className="required">*</span>
                            </label>
                            <input
                                type="number"
                                id="duration"
                                name="duration"
                                className="input"
                                value={formData.duration}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                min="15"
                                step="15"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <div className="form-group">
                        <label className="label" htmlFor="notes">
                            Notas
                        </label>
                        <textarea
                            id="notes"
                            name="notes"
                            className="input textarea"
                            rows="4"
                            value={formData.notes}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder="Notas sobre la cita..."
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => navigate('/appointments')}
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader className="spinner" size={20} />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                Guardar Cita
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewAppointment;
