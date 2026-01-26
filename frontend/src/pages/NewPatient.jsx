import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { patientsAPI } from '../services/api';
import { ArrowLeft, Save, Loader } from 'lucide-react';
import BackButton from '../components/BackButton';
import './NewPatient.css';

const NewPatient = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Get ID if in edit mode
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(!!id);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        weight: '',
        height: '',
        nutritionalGoal: '',
        activityLevel: '',
        notes: '',
        conditions: '', // Start as string for textarea
        familyHistory: '',

        eatingHabits: '',

        // Bioimpedance
        fatPercentage: '',
        muscleMass: '',
        waterPercentage: '',
        visceralFat: '',
        boneMass: '',
        metabolicAge: '',

        // Skinfolds
        skinfolds_tricipital: '',
        skinfolds_bicipital: '',
        skinfolds_subscapular: '',
        skinfolds_suprailiac: '',
        skinfolds_abdominal: '',
        skinfolds_thigh: '',
        skinfolds_calf: '',

        // Perimeters
        perimeters_arm: '',
        perimeters_armFlexed: '',
        perimeters_waist: '',
        perimeters_hip: '',
        perimeters_thigh: '',
        perimeters_calf: '',

        // Diameters
        diameters_humerus: '',
        diameters_femur: '',
        diameters_wrist: ''
    });

    useEffect(() => {
        if (isEditMode) {
            fetchPatientData();
        }
    }, [id]);

    const fetchPatientData = async () => {
        try {
            const response = await patientsAPI.getOne(id);
            const p = response.data.data;
            setFormData({
                firstName: p.firstName || '',
                lastName: p.lastName || '',
                email: p.email || '',
                phone: p.phone || '',
                dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '',
                gender: p.gender || '',
                weight: p.anthropometry?.weight || '',
                height: p.anthropometry?.height || '',
                nutritionalGoal: p.nutritionalGoals?.primaryGoal || '',
                activityLevel: p.lifestyle?.activityLevel || '',
                notes: p.notes || '',
                conditions: p.medicalHistory?.conditions?.join(', ') || '',
                familyHistory: p.medicalHistory?.familyHistory || '',
                eatingHabits: p.eatingHabits || '',

                // Bioimpedance
                fatPercentage: p.anthropometry?.bioimpedance?.fatPercentage || '',
                muscleMass: p.anthropometry?.bioimpedance?.muscleMass || '',
                waterPercentage: p.anthropometry?.bioimpedance?.waterPercentage || '',
                visceralFat: p.anthropometry?.bioimpedance?.visceralFat || '',
                boneMass: p.anthropometry?.bioimpedance?.boneMass || '',
                metabolicAge: p.anthropometry?.bioimpedance?.metabolicAge || '',

                // Skinfolds
                skinfolds_tricipital: p.anthropometry?.skinfolds?.tricipital || '',
                skinfolds_bicipital: p.anthropometry?.skinfolds?.bicipital || '',
                skinfolds_subscapular: p.anthropometry?.skinfolds?.subscapular || '',
                skinfolds_suprailiac: p.anthropometry?.skinfolds?.suprailiac || '',
                skinfolds_abdominal: p.anthropometry?.skinfolds?.abdominal || '',
                skinfolds_thigh: p.anthropometry?.skinfolds?.thigh || '',
                skinfolds_calf: p.anthropometry?.skinfolds?.calf || '',

                // Perimeters
                perimeters_arm: p.anthropometry?.perimeters?.arm || '',
                perimeters_armFlexed: p.anthropometry?.perimeters?.armFlexed || '',
                perimeters_waist: p.anthropometry?.perimeters?.waist || '',
                perimeters_hip: p.anthropometry?.perimeters?.hip || '',
                perimeters_thigh: p.anthropometry?.perimeters?.thigh || '',
                perimeters_calf: p.anthropometry?.perimeters?.calf || '',

                // Diameters
                diameters_humerus: p.anthropometry?.diameters?.humerus || '',
                diameters_femur: p.anthropometry?.diameters?.femur || '',
                diameters_wrist: p.anthropometry?.diameters?.wrist || '',
            });
            setInitialLoading(false);
        } catch (err) {
            console.error('Error fetching patient:', err);
            setError('Error al cargar datos del paciente');
            setInitialLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const patientData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email || undefined,
                phone: formData.phone || undefined,
                dateOfBirth: formData.dateOfBirth || undefined,
                gender: formData.gender || undefined,
                eatingHabits: formData.eatingHabits || undefined,

                anthropometry: {
                    weight: formData.weight ? parseFloat(formData.weight) : undefined,
                    height: formData.height ? parseFloat(formData.height) : undefined,
                    bioimpedance: {
                        fatPercentage: formData.fatPercentage ? parseFloat(formData.fatPercentage) : undefined,
                        muscleMass: formData.muscleMass ? parseFloat(formData.muscleMass) : undefined,
                        waterPercentage: formData.waterPercentage ? parseFloat(formData.waterPercentage) : undefined,
                        visceralFat: formData.visceralFat ? parseFloat(formData.visceralFat) : undefined,
                        boneMass: formData.boneMass ? parseFloat(formData.boneMass) : undefined,
                        metabolicAge: formData.metabolicAge ? parseFloat(formData.metabolicAge) : undefined,
                    },
                    skinfolds: {
                        tricipital: formData.skinfolds_tricipital ? parseFloat(formData.skinfolds_tricipital) : undefined,
                        bicipital: formData.skinfolds_bicipital ? parseFloat(formData.skinfolds_bicipital) : undefined,
                        subscapular: formData.skinfolds_subscapular ? parseFloat(formData.skinfolds_subscapular) : undefined,
                        suprailiac: formData.skinfolds_suprailiac ? parseFloat(formData.skinfolds_suprailiac) : undefined,
                        abdominal: formData.skinfolds_abdominal ? parseFloat(formData.skinfolds_abdominal) : undefined,
                        thigh: formData.skinfolds_thigh ? parseFloat(formData.skinfolds_thigh) : undefined,
                        calf: formData.skinfolds_calf ? parseFloat(formData.skinfolds_calf) : undefined,
                    },
                    perimeters: {
                        arm: formData.perimeters_arm ? parseFloat(formData.perimeters_arm) : undefined,
                        armFlexed: formData.perimeters_armFlexed ? parseFloat(formData.perimeters_armFlexed) : undefined,
                        waist: formData.perimeters_waist ? parseFloat(formData.perimeters_waist) : undefined,
                        hip: formData.perimeters_hip ? parseFloat(formData.perimeters_hip) : undefined,
                        thigh: formData.perimeters_thigh ? parseFloat(formData.perimeters_thigh) : undefined,
                        calf: formData.perimeters_calf ? parseFloat(formData.perimeters_calf) : undefined,
                    },
                    diameters: {
                        humerus: formData.diameters_humerus ? parseFloat(formData.diameters_humerus) : undefined,
                        femur: formData.diameters_femur ? parseFloat(formData.diameters_femur) : undefined,
                        wrist: formData.diameters_wrist ? parseFloat(formData.diameters_wrist) : undefined,
                    }
                },
                nutritionalGoals: {
                    primaryGoal: formData.nutritionalGoal || undefined,
                },
                lifestyle: {
                    activityLevel: formData.activityLevel || undefined,
                },
                medicalHistory: {
                    conditions: formData.conditions
                        ? formData.conditions.split(',').map(c => c.trim()).filter(Boolean)
                        : [],
                    familyHistory: formData.familyHistory || undefined
                },
                notes: formData.notes || undefined,
            };

            if (isEditMode) {
                await patientsAPI.update(id, patientData);
            } else {
                await patientsAPI.create(patientData);
            }
            navigate('/patients');
        } catch (err) {
            console.error('Error saving patient:', err);
            setError(err.response?.data?.message || 'Error al guardar el paciente');
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <div className="page-loading"><div className="spinner-large"></div></div>;
    }

    return (
        <div className="new-patient-page fade-in">
            <div className="page-header">
                <BackButton to="/patients" />
                <div>
                    <h1>{isEditMode ? 'Editar Paciente' : 'Nuevo Paciente'}</h1>
                    <p>{isEditMode ? 'Modifica la información del paciente' : 'Completa la información del paciente'}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="patient-form card">
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <p className="form-legend"><span className="required">*</span> Campos requeridos</p>

                {/* Información Personal */}
                <div className="form-section">
                    <h3>Información Personal</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="label" htmlFor="firstName">
                                Nombre <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                className="input"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label className="label" htmlFor="lastName">
                                Apellido <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                className="input"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label className="label" htmlFor="email">
                                Correo Electrónico
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="input"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label className="label" htmlFor="phone">
                                Teléfono
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                className="input"
                                value={formData.phone}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label className="label" htmlFor="dateOfBirth">
                                Fecha de Nacimiento
                            </label>
                            <input
                                type="date"
                                id="dateOfBirth"
                                name="dateOfBirth"
                                className="input"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label className="label" htmlFor="gender">
                                Género
                            </label>
                            <select
                                id="gender"
                                name="gender"
                                className="input"
                                value={formData.gender}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                <option value="">Seleccionar...</option>
                                <option value="male">Masculino</option>
                                <option value="female">Femenino</option>
                                <option value="other">Otro</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Datos Antropométricos */}
                <div className="form-section">
                    <h3>Historia Clínica</h3>
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label className="label" htmlFor="conditions">
                                Antecedentes Patológicos
                            </label>
                            <textarea
                                id="conditions"
                                name="conditions"
                                className="input textarea"
                                rows="3"
                                value={formData.conditions}
                                onChange={handleChange}
                                placeholder="Enfermedades crónicas, cirugías previas, alergias (separar por comas)..."
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group full-width">
                            <label className="label" htmlFor="familyHistory">
                                Historial Genealógico (Heredofamiliar)
                            </label>
                            <textarea
                                id="familyHistory"
                                name="familyHistory"
                                className="input textarea"
                                rows="3"
                                value={formData.familyHistory}
                                onChange={handleChange}
                                placeholder="Antecedentes familiares de diabetes, hipertensión, cáncer, etc..."
                                disabled={loading}
                            />
                        </div>
                    </div>
                </div>

                {/* Datos Antropométricos */}
                <div className="form-section">
                    <h3>Datos Antropométricos</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="label" htmlFor="weight">
                                Peso (kg)
                            </label>
                            <input
                                type="number"
                                id="weight"
                                name="weight"
                                className="input"
                                step="0.1"
                                value={formData.weight}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label className="label" htmlFor="height">
                                Altura (cm)
                            </label>
                            <input
                                type="number"
                                id="height"
                                name="height"
                                className="input"
                                step="0.1"
                                value={formData.height}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>
                    </div>


                    <h4 className="section-subtitle">Bioimpedancia</h4>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="label" htmlFor="fatPercentage">Grasa Corporal (%)</label>
                            <input type="number" step="0.1" id="fatPercentage" name="fatPercentage" className="input" value={formData.fatPercentage} onChange={handleChange} disabled={loading} />
                        </div>
                        <div className="form-group">
                            <label className="label" htmlFor="muscleMass">Masa Muscular (kg)</label>
                            <input type="number" step="0.1" id="muscleMass" name="muscleMass" className="input" value={formData.muscleMass} onChange={handleChange} disabled={loading} />
                        </div>
                        <div className="form-group">
                            <label className="label" htmlFor="waterPercentage">Agua Corporal (%)</label>
                            <input type="number" step="0.1" id="waterPercentage" name="waterPercentage" className="input" value={formData.waterPercentage} onChange={handleChange} disabled={loading} />
                        </div>
                        <div className="form-group">
                            <label className="label" htmlFor="visceralFat">Grasa Visceral</label>
                            <input type="number" step="0.1" id="visceralFat" name="visceralFat" className="input" value={formData.visceralFat} onChange={handleChange} disabled={loading} />
                        </div>
                        <div className="form-group">
                            <label className="label" htmlFor="boneMass">Masa Ósea (kg)</label>
                            <input type="number" step="0.1" id="boneMass" name="boneMass" className="input" value={formData.boneMass} onChange={handleChange} disabled={loading} />
                        </div>
                        <div className="form-group">
                            <label className="label" htmlFor="metabolicAge">Edad Metabólica</label>
                            <input type="number" step="1" id="metabolicAge" name="metabolicAge" className="input" value={formData.metabolicAge} onChange={handleChange} disabled={loading} />
                        </div>
                    </div>

                    <h4 className="section-subtitle">Pliegues Cutáneos (mm)</h4>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="label" htmlFor="skinfolds_tricipital">Tricipital</label>
                            <input type="number" step="0.1" id="skinfolds_tricipital" name="skinfolds_tricipital" className="input" value={formData.skinfolds_tricipital} onChange={handleChange} disabled={loading} />
                        </div>
                        <div className="form-group">
                            <label className="label" htmlFor="skinfolds_bicipital">Bicipital</label>
                            <input type="number" step="0.1" id="skinfolds_bicipital" name="skinfolds_bicipital" className="input" value={formData.skinfolds_bicipital} onChange={handleChange} disabled={loading} />
                        </div>
                        <div className="form-group">
                            <label className="label" htmlFor="skinfolds_subscapular">Subescapular</label>
                            <input type="number" step="0.1" id="skinfolds_subscapular" name="skinfolds_subscapular" className="input" value={formData.skinfolds_subscapular} onChange={handleChange} disabled={loading} />
                        </div>
                        <div className="form-group">
                            <label className="label" htmlFor="skinfolds_suprailiac">Suprailiaco</label>
                            <input type="number" step="0.1" id="skinfolds_suprailiac" name="skinfolds_suprailiac" className="input" value={formData.skinfolds_suprailiac} onChange={handleChange} disabled={loading} />
                        </div>
                        <div className="form-group">
                            <label className="label" htmlFor="skinfolds_abdominal">Abdominal</label>
                            <input type="number" step="0.1" id="skinfolds_abdominal" name="skinfolds_abdominal" className="input" value={formData.skinfolds_abdominal} onChange={handleChange} disabled={loading} />
                        </div>
                        <div className="form-group">
                            <label className="label" htmlFor="skinfolds_thigh">Muslo</label>
                            <input type="number" step="0.1" id="skinfolds_thigh" name="skinfolds_thigh" className="input" value={formData.skinfolds_thigh} onChange={handleChange} disabled={loading} />
                        </div>
                        <div className="form-group">
                            <label className="label" htmlFor="skinfolds_calf">Pantorrilla</label>
                            <input type="number" step="0.1" id="skinfolds_calf" name="skinfolds_calf" className="input" value={formData.skinfolds_calf} onChange={handleChange} disabled={loading} />
                        </div>
                    </div>
                </div>


                {/* Perímetros y Diámetros */}
                <div className="form-section">
                    <h3>Perímetros y Diámetros</h3>

                    <h4 className="section-subtitle">Perímetros (cm)</h4>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="label" htmlFor="perimeters_arm">Brazo Relajado</label>
                            <input type="number" step="0.1" id="perimeters_arm" name="perimeters_arm" className="input" value={formData.perimeters_arm} onChange={handleChange} disabled={loading} />
                        </div>
                        <div className="form-group">
                            <label className="label" htmlFor="perimeters_armFlexed">Brazo Flexionado</label>
                            <input type="number" step="0.1" id="perimeters_armFlexed" name="perimeters_armFlexed" className="input" value={formData.perimeters_armFlexed} onChange={handleChange} disabled={loading} />
                        </div>
                        <div className="form-group">
                            <label className="label" htmlFor="perimeters_waist">Cintura</label>
                            <input type="number" step="0.1" id="perimeters_waist" name="perimeters_waist" className="input" value={formData.perimeters_waist} onChange={handleChange} disabled={loading} />
                        </div>
                        <div className="form-group">
                            <label className="label" htmlFor="perimeters_hip">Cadera</label>
                            <input type="number" step="0.1" id="perimeters_hip" name="perimeters_hip" className="input" value={formData.perimeters_hip} onChange={handleChange} disabled={loading} />
                        </div>
                        <div className="form-group">
                            <label className="label" htmlFor="perimeters_thigh">Muslo</label>
                            <input type="number" step="0.1" id="perimeters_thigh" name="perimeters_thigh" className="input" value={formData.perimeters_thigh} onChange={handleChange} disabled={loading} />
                        </div>
                        <div className="form-group">
                            <label className="label" htmlFor="perimeters_calf">Pantorrilla</label>
                            <input type="number" step="0.1" id="perimeters_calf" name="perimeters_calf" className="input" value={formData.perimeters_calf} onChange={handleChange} disabled={loading} />
                        </div>
                    </div>

                    <h4 className="section-subtitle">Diámetros Óseos (cm)</h4>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="label" htmlFor="diameters_humerus">Húmero</label>
                            <input type="number" step="0.1" id="diameters_humerus" name="diameters_humerus" className="input" value={formData.diameters_humerus} onChange={handleChange} disabled={loading} />
                        </div>
                        <div className="form-group">
                            <label className="label" htmlFor="diameters_femur">Fémur</label>
                            <input type="number" step="0.1" id="diameters_femur" name="diameters_femur" className="input" value={formData.diameters_femur} onChange={handleChange} disabled={loading} />
                        </div>
                        <div className="form-group">
                            <label className="label" htmlFor="diameters_wrist">Muñeca</label>
                            <input type="number" step="0.1" id="diameters_wrist" name="diameters_wrist" className="input" value={formData.diameters_wrist} onChange={handleChange} disabled={loading} />
                        </div>
                    </div>
                </div>

                {/* Objetivos y Estilo de Vida */}
                <div className="form-section">
                    <h3>Objetivos y Estilo de Vida</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="label" htmlFor="nutritionalGoal">
                                Objetivo Nutricional
                            </label>
                            <select
                                id="nutritionalGoal"
                                name="nutritionalGoal"
                                className="input"
                                value={formData.nutritionalGoal}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                <option value="">Seleccionar...</option>
                                <option value="weight_loss">Pérdida de peso</option>
                                <option value="weight_gain">Ganancia de peso</option>
                                <option value="muscle_gain">Ganancia muscular</option>
                                <option value="maintenance">Mantenimiento</option>
                                <option value="health_improvement">Mejora de salud</option>
                                <option value="other">Otro</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="label" htmlFor="activityLevel">
                                Nivel de Actividad
                            </label>
                            <select
                                id="activityLevel"
                                name="activityLevel"
                                className="input"
                                value={formData.activityLevel}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                <option value="">Seleccionar...</option>
                                <option value="sedentary">Sedentario</option>
                                <option value="lightly_active">Ligeramente activo</option>
                                <option value="moderately_active">Moderadamente activo</option>
                                <option value="very_active">Muy activo</option>
                                <option value="extremely_active">Extremadamente activo</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Notas */}
                <div className="form-section">
                    <h3>Notas Adicionales</h3>
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
                            placeholder="Información adicional sobre el paciente..."
                        />
                    </div>
                </div>

                {/* Botones de Acción */}
                <div className="form-actions">
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => navigate('/patients')}
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
                                {isEditMode ? 'Actualizar Paciente' : 'Guardar Paciente'}
                            </>
                        )}
                    </button>
                </div>
            </form >
        </div >
    );
};

export default NewPatient;
