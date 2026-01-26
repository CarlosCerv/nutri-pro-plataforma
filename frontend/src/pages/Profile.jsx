import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, patientsAPI } from '../services/api';
import { User, Mail, Phone, Stethoscope, Save, Loader, Shield, Database } from 'lucide-react';
import './Profile.css';

const Profile = () => {
    const { user, setUser } = useAuth(); // Assuming setUser updates context state
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        specialty: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                specialty: user.specialty || '',
                phone: user.phone || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (formData.password && formData.password !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
            return;
        }

        setLoading(true);

        try {
            const updateData = {
                name: formData.name,
                email: formData.email,
                specialty: formData.specialty,
                phone: formData.phone
            };

            if (formData.password) {
                updateData.password = formData.password;
            }

            const response = await authAPI.updateProfile(updateData);

            // If AuthContext has a way to update local user state, do it here
            // Otherwise, we might rely on the page reload or context refresh
            // For now, let's assume we can notify the user
            setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });

        } catch (error) {
            console.error('Update error:', error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Error al actualizar perfil' });
        } finally {
            setLoading(false);
        }
    };

    const handleExportPatients = async () => {
        setMessage('');
        setExportLoading(true);

        try {
            const response = await patientsAPI.exportAll();
            const exportData = response.data;

            // Create JSON blob
            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Generate filename with current date
            const today = new Date().toISOString().split('T')[0];
            link.download = `patients-backup-${today}.json`;

            // Trigger download
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            setMessage({
                type: 'success',
                text: `Respaldo completado: ${exportData.count} paciente${exportData.count !== 1 ? 's' : ''} exportado${exportData.count !== 1 ? 's' : ''}`
            });
        } catch (error) {
            console.error('Export error:', error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Error al exportar pacientes' });
        } finally {
            setExportLoading(false);
        }
    };

    return (
        <div className="profile-page fade-in">
            <div className="page-header">
                <div>
                    <h1>Mi Cuenta</h1>
                    <p>Gestiona tu información personal y de seguridad</p>
                </div>
            </div>

            <div className="profile-grid">
                <div className="profile-card card">
                    <div className="profile-header">
                        <div className="profile-avatar-large">
                            {formData.name.charAt(0) || 'U'}
                        </div>
                        <div className="profile-info">
                            <h2>{formData.name}</h2>
                            <span className="badge badge-info">{formData.specialty || 'Nutricionista'}</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="profile-form">
                        {message && (
                            <div className={`alert alert-${message.type}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="form-section-title">
                            <User size={18} /> Información Personal
                        </div>

                        <div className="form-group">
                            <label className="label">Nombre Completo</label>
                            <input
                                type="text"
                                name="name"
                                className="input"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="label">Especialidad</label>
                            <div className="input-group">
                                <Stethoscope size={18} className="input-icon" />
                                <input
                                    type="text"
                                    name="specialty"
                                    className="input input-with-icon"
                                    value={formData.specialty}
                                    onChange={handleChange}
                                    placeholder="Ej. Nutrición Deportiva"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="label">Teléfono</label>
                            <div className="input-group">
                                <Phone size={18} className="input-icon" />
                                <input
                                    type="tel"
                                    name="phone"
                                    className="input input-with-icon"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+52..."
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="label">Email</label>
                            <div className="input-group">
                                <Mail size={18} className="input-icon" />
                                <input
                                    type="email"
                                    name="email"
                                    className="input input-with-icon"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-section-title mt-xl">
                            <Shield size={18} /> Seguridad
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="label">Nueva Contraseña</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="input"
                                    placeholder="Dejar vacía para mantener actual"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label className="label">Confirmar Contraseña</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    className="input"
                                    placeholder="Confirmar nueva contraseña"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader className="spinner" size={18} /> Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} /> Guardar Cambios
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="form-section-title mt-xl">
                        <Database size={18} /> Respaldo de Datos
                    </div>

                    <div className="backup-section">
                        <p className="backup-description">
                            Exporta todos tus pacientes con su información completa en formato JSON.
                            Esto incluye datos personales, antropométricos, historial médico, objetivos nutricionales y más.
                        </p>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleExportPatients}
                            disabled={exportLoading}
                        >
                            {exportLoading ? (
                                <>
                                    <Loader className="spinner" size={18} /> Exportando...
                                </>
                            ) : (
                                <>
                                    <Database size={18} /> Respaldar Todos los Pacientes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
