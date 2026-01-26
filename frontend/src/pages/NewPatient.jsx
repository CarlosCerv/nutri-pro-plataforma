import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { patientsAPI } from '../services/api';
import { Save, Loader } from 'lucide-react';
import BackButton from '../components/BackButton';
import PremiumSelect from '../components/PremiumSelect';
import './NewPatient.css';

const NewPatient = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(!!id);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', gender: '',
        weight: '', height: '', nutritionalGoal: '', activityLevel: '',
        notes: '', conditions: '', familyHistory: '', eatingHabits: '',
        fatPercentage: '', muscleMass: '', waterPercentage: '', visceralFat: '', boneMass: '', metabolicAge: '',
        skinfolds_tricipital: '', skinfolds_bicipital: '', skinfolds_subscapular: '', skinfolds_suprailiac: '', skinfolds_abdominal: '', skinfolds_thigh: '', skinfolds_calf: '',
        perimeters_arm: '', perimeters_armFlexed: '', perimeters_waist: '', perimeters_hip: '', perimeters_thigh: '', perimeters_calf: '',
        diameters_humerus: '', diameters_femur: '', diameters_wrist: ''
    });

    useEffect(() => { if (isEditMode) fetchPatientData(); }, [id]);

    const fetchPatientData = async () => {
        try {
            const response = await patientsAPI.getOne(id);
            const p = response.data.data;
            setFormData({
                firstName: p.firstName || '', lastName: p.lastName || '', email: p.email || '', phone: p.phone || '',
                dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '', gender: p.gender || '',
                weight: p.anthropometry?.weight || '', height: p.anthropometry?.height || '',
                nutritionalGoal: p.nutritionalGoals?.primaryGoal || '', activityLevel: p.lifestyle?.activityLevel || '',
                notes: p.notes || '', conditions: p.medicalHistory?.conditions?.join(', ') || '',
                familyHistory: p.medicalHistory?.familyHistory || '', eatingHabits: p.eatingHabits || '',
                fatPercentage: p.anthropometry?.bioimpedance?.fatPercentage || '',
                muscleMass: p.anthropometry?.bioimpedance?.muscleMass || '',
                waterPercentage: p.anthropometry?.bioimpedance?.waterPercentage || '',
                visceralFat: p.anthropometry?.bioimpedance?.visceralFat || '',
                boneMass: p.anthropometry?.bioimpedance?.boneMass || '',
                metabolicAge: p.anthropometry?.bioimpedance?.metabolicAge || '',
                skinfolds_tricipital: p.anthropometry?.skinfolds?.tricipital || '',
                skinfolds_bicipital: p.anthropometry?.skinfolds?.bicipital || '',
                skinfolds_subscapular: p.anthropometry?.skinfolds?.subscapular || '',
                skinfolds_suprailiac: p.anthropometry?.skinfolds?.suprailiac || '',
                skinfolds_abdominal: p.anthropometry?.skinfolds?.abdominal || '',
                skinfolds_thigh: p.anthropometry?.skinfolds?.thigh || '',
                skinfolds_calf: p.anthropometry?.skinfolds?.calf || '',
                perimeters_arm: p.anthropometry?.perimeters?.arm || '',
                perimeters_armFlexed: p.anthropometry?.perimeters?.armFlexed || '',
                perimeters_waist: p.anthropometry?.perimeters?.waist || '',
                perimeters_hip: p.anthropometry?.perimeters?.hip || '',
                perimeters_thigh: p.anthropometry?.perimeters?.thigh || '',
                perimeters_calf: p.anthropometry?.perimeters?.calf || '',
                diameters_humerus: p.anthropometry?.diameters?.humerus || '',
                diameters_femur: p.anthropometry?.diameters?.femur || '',
                diameters_wrist: p.anthropometry?.diameters?.wrist || '',
            });
            setInitialLoading(false);
        } catch (err) { setError('Error al cargar datos'); setInitialLoading(false); }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const patientData = {
                firstName: formData.firstName, lastName: formData.lastName,
                email: formData.email || undefined, phone: formData.phone || undefined,
                dateOfBirth: formData.dateOfBirth || undefined, gender: formData.gender || undefined,
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
                nutritionalGoals: { primaryGoal: formData.nutritionalGoal || undefined },
                lifestyle: { activityLevel: formData.activityLevel || undefined },
                medicalHistory: {
                    conditions: formData.conditions ? formData.conditions.split(',').map(c => c.trim()).filter(Boolean) : [],
                    familyHistory: formData.familyHistory || undefined
                },
                notes: formData.notes || undefined,
                eatingHabits: formData.eatingHabits || undefined
            };
            if (isEditMode) await patientsAPI.update(id, patientData);
            else await patientsAPI.create(patientData);
            navigate('/patients');
        } catch (err) { setError(err.response?.data?.message || 'Error al guardar'); setLoading(false); }
    };

    if (initialLoading) return <div className="page-loading"><div className="spinner-large"></div></div>;

    const genderOptions = [
        { value: 'male', label: 'Masculino' },
        { value: 'female', label: 'Femenino' },
        { value: 'other', label: 'Otro' }
    ];

    const goalOptions = [
        { value: 'weight_loss', label: 'Pérdida de peso' },
        { value: 'weight_gain', label: 'Ganancia de peso' },
        { value: 'muscle_gain', label: 'Ganancia muscular' },
        { value: 'maintenance', label: 'Mantenimiento' },
        { value: 'health_improvement', label: 'Mejora de salud' },
        { value: 'other', label: 'Otro' }
    ];

    const activityOptions = [
        { value: 'sedentary', label: 'Sedentario' },
        { value: 'lightly_active', label: 'Ligeramente activo' },
        { value: 'moderately_active', label: 'Moderadamente activo' },
        { value: 'very_active', label: 'Muy activo' },
        { value: 'extremely_active', label: 'Extremadamente activo' }
    ];

    return (
        <div className="new-patient-page fade-in">
            <div className="page-header">
                <BackButton to="/patients" />
                <div>
                    <h1>{isEditMode ? 'Editar Paciente' : 'Nuevo Paciente'}</h1>
                    <p>{isEditMode ? 'Modifica la información del paciente' : 'Completa la información del paciente'}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="patient-form card-form">
                {error && <div className="error-banner">{error}</div>}

                <div className="form-layout-stack">
                    {/* section 1: personal info */}
                    <div className="form-card-section">
                        <h3>Información Personal</h3>
                        <div className="form-fields-grid">
                            <div className="form-field">
                                <label className="field-label" htmlFor="firstName">Nombre <span className="req">*</span></label>
                                <input type="text" id="firstName" name="firstName" className="field-input" value={formData.firstName} onChange={handleChange} required disabled={loading} placeholder="Ej. Carlos" />
                            </div>
                            <div className="form-field">
                                <label className="field-label" htmlFor="lastName">Apellido <span className="req">*</span></label>
                                <input type="text" id="lastName" name="lastName" className="field-input" value={formData.lastName} onChange={handleChange} required disabled={loading} placeholder="Ej. Eduardo" />
                            </div>
                            <div className="form-field">
                                <label className="field-label" htmlFor="email">Email</label>
                                <input type="email" id="email" name="email" className="field-input" value={formData.email} onChange={handleChange} disabled={loading} placeholder="carlos@ejemplo.com" />
                            </div>
                            <div className="form-field">
                                <label className="field-label" htmlFor="phone">Teléfono</label>
                                <input type="tel" id="phone" name="phone" className="field-input" value={formData.phone} onChange={handleChange} disabled={loading} placeholder="+52 ..." />
                            </div>
                            <div className="form-field">
                                <label className="field-label" htmlFor="dateOfBirth">Fecha de Nacimiento</label>
                                <input type="date" id="dateOfBirth" name="dateOfBirth" className="field-input" value={formData.dateOfBirth} onChange={handleChange} disabled={loading} />
                            </div>
                            <div className="form-field">
                                <label className="field-label">Género</label>
                                <PremiumSelect name="gender" options={genderOptions} value={formData.gender} onChange={handleChange} placeholder="Seleccionar género..." disabled={loading} />
                            </div>
                        </div>
                    </div>

                    {/* section 2: clinical history */}
                    <div className="form-card-section bg-alt-faint">
                        <h3>Historia Clínica</h3>
                        <div className="form-fields-grid">
                            <div className="form-field full-width">
                                <label className="field-label" htmlFor="conditions">Antecedentes Patológicos</label>
                                <textarea id="conditions" name="conditions" className="field-input field-textarea" rows="2" value={formData.conditions} onChange={handleChange} disabled={loading} placeholder="Enfermedades crónicas, cirugías, alergias..." />
                            </div>
                            <div className="form-field full-width">
                                <label className="field-label" htmlFor="familyHistory">Historial Genealógico</label>
                                <textarea id="familyHistory" name="familyHistory" className="field-input field-textarea" rows="2" value={formData.familyHistory} onChange={handleChange} disabled={loading} placeholder="Diabetes, hipertensión, cáncer en familia..." />
                            </div>
                        </div>
                    </div>

                    {/* section 3: anthropometry */}
                    <div className="form-card-section">
                        <h3>Datos Antropométricos</h3>
                        <div className="form-fields-grid mb-gutter">
                            <div className="form-field">
                                <label className="field-label" htmlFor="weight">Peso (kg)</label>
                                <input type="number" step="0.1" id="weight" name="weight" className="field-input" value={formData.weight} onChange={handleChange} disabled={loading} placeholder="70.5" />
                            </div>
                            <div className="form-field">
                                <label className="field-label" htmlFor="height">Altura (cm)</label>
                                <input type="number" step="0.1" id="height" name="height" className="field-input" value={formData.height} onChange={handleChange} disabled={loading} placeholder="175" />
                            </div>
                        </div>

                        <h4 className="section-title-compact">Bioimpedancia</h4>
                        <div className="form-fields-grid-triple">
                            <div className="form-field">
                                <label className="field-label">Grasa (%)</label>
                                <input type="number" step="0.1" name="fatPercentage" className="field-input" value={formData.fatPercentage} onChange={handleChange} disabled={loading} />
                            </div>
                            <div className="form-field">
                                <label className="field-label">Muscular (kg)</label>
                                <input type="number" step="0.1" name="muscleMass" className="field-input" value={formData.muscleMass} onChange={handleChange} disabled={loading} />
                            </div>
                            <div className="form-field">
                                <label className="field-label">Agua (%)</label>
                                <input type="number" step="0.1" name="waterPercentage" className="field-input" value={formData.waterPercentage} onChange={handleChange} disabled={loading} />
                            </div>
                            <div className="form-field">
                                <label className="field-label">Visceral</label>
                                <input type="number" step="0.1" name="visceralFat" className="field-input" value={formData.visceralFat} onChange={handleChange} disabled={loading} />
                            </div>
                            <div className="form-field">
                                <label className="field-label">Ósea (kg)</label>
                                <input type="number" step="0.1" name="boneMass" className="field-input" value={formData.boneMass} onChange={handleChange} disabled={loading} />
                            </div>
                            <div className="form-field">
                                <label className="field-label">Edad Metab.</label>
                                <input type="number" step="1" name="metabolicAge" className="field-input" value={formData.metabolicAge} onChange={handleChange} disabled={loading} />
                            </div>
                        </div>
                    </div>

                    {/* section 4: goals & lifestyle */}
                    <div className="form-card-section bg-alt-faint">
                        <h3>Objetivos y Estilo de Vida</h3>
                        <div className="form-fields-grid">
                            <div className="form-field">
                                <label className="field-label">Objetivo Nutricional</label>
                                <PremiumSelect name="nutritionalGoal" options={goalOptions} value={formData.nutritionalGoal} onChange={handleChange} placeholder="Seleccionar objetivo..." disabled={loading} />
                            </div>
                            <div className="form-field">
                                <label className="field-label">Nivel de Actividad</label>
                                <PremiumSelect name="activityLevel" options={activityOptions} value={formData.activityLevel} onChange={handleChange} placeholder="Seleccionar nivel..." disabled={loading} />
                            </div>
                            <div className="form-field full-width">
                                <label className="field-label" htmlFor="notes">Notas adicionales</label>
                                <textarea id="notes" name="notes" className="field-input field-textarea" rows="2" value={formData.notes} onChange={handleChange} disabled={loading} placeholder="Observaciones generales..." />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-footer-actions">
                    <button type="button" className="btn-v2-secondary" onClick={() => navigate('/patients')} disabled={loading}> Cancelar </button>
                    <button type="submit" className="btn-v2-primary" disabled={loading}>
                        {loading ? <><Loader className="spinner" size={20} /><span>Guardando...</span></> : <><Save size={20} /><span>{isEditMode ? 'Actualizar Paciente' : 'Guardar Paciente'}</span></>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewPatient;
