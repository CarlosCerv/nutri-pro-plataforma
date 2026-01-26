import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, Save, User, FileText } from 'lucide-react';
import { patientsAPI } from '../services/api';
import './SavePlanModal.css';

const SavePlanModal = ({ onClose, onSave }) => {
    const [saveType, setSaveType] = useState('template'); // 'template' or 'patient'
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [selectedPatient, setSelectedPatient] = useState('');
    const [patients, setPatients] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Hardcoded categories that match the MealPlan schema
    const MEAL_PLAN_CATEGORIES = [
        'mediterranean',
        'diabetic',
        'hypertensive',
        'weight-loss',
        'weight-gain',
        'vegetarian',
        'vegan',
        'low-carb',
        'high-protein',
        'custom'
    ];

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            // Set hardcoded categories immediately
            setCategories(MEAL_PLAN_CATEGORIES);

            // Fetch patients
            const patientsRes = await patientsAPI.getAll();
            setPatients(patientsRes.data?.data || []);
        } catch (err) {
            console.error('Error loading patients:', err);
            // Set categories anyway so the modal is functional
            setCategories(MEAL_PLAN_CATEGORIES);
            setPatients([]);
            // Don't show error to prevent crashes, just log it
            console.warn('Could not load patients, but categories are available');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!name) {
            setError('El nombre es obligatorio');
            return;
        }

        if (saveType === 'template' && !category) {
            setError('La categoría es obligatoria para plantillas');
            return;
        }

        if (saveType === 'patient' && !selectedPatient) {
            setError('Debes seleccionar un paciente');
            return;
        }

        const data = {
            name,
            type: saveType,
            ...(saveType === 'template' ? { category } : { patientId: selectedPatient })
        };

        onSave(data);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content save-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Guardar Plan de Alimentación</h3>
                    <button className="btn-icon" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="save-type-selector">
                    <button
                        className={`type-option ${saveType === 'template' ? 'active' : ''}`}
                        onClick={() => setSaveType('template')}
                    >
                        <FileText size={24} />
                        <span>Guardar como Plantilla</span>
                    </button>
                    <button
                        className={`type-option ${saveType === 'patient' ? 'active' : ''}`}
                        onClick={() => setSaveType('patient')}
                    >
                        <User size={24} />
                        <span>Asignar a Paciente</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="save-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label>Nombre del Plan <span className="required">*</span></label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Dieta Mediterránea 1800kcal"
                            className={`input ${!name && 'input-error'}`}
                        />
                    </div>

                    {saveType === 'template' ? (
                        <div className="form-group">
                            <label>Categoría <span className="required">*</span></label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className={`input ${!category && 'input-error'}`}
                            >
                                <option value="">Selecciona una categoría</option>
                                <option value="mediterranean">Mediterránea</option>
                                <option value="diabetic">Diabéticos</option>
                                <option value="hypertensive">Hipertensos</option>
                                <option value="weight-loss">Pérdida de Peso</option>
                                <option value="weight-gain">Ganancia de Peso</option>
                                <option value="vegetarian">Vegetariana</option>
                                <option value="vegan">Vegana</option>
                                <option value="low-carb">Baja en Carbohidratos</option>
                                <option value="high-protein">Alta en Proteína</option>
                                <option value="custom">Personalizada</option>
                            </select>
                        </div>
                    ) : (
                        <div className="form-group">
                            <label>Paciente <span className="required">*</span></label>
                            <select
                                value={selectedPatient}
                                onChange={(e) => setSelectedPatient(e.target.value)}
                                className={`input ${!selectedPatient && 'input-error'}`}
                            >
                                <option value="">Selecciona un paciente</option>
                                {patients.map(p => (
                                    <option key={p._id} value={p._id}>
                                        {p.firstName} {p.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="btn btn-outline" onClick={onClose}>
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || !name || (saveType === 'template' ? !category : !selectedPatient)}
                            title={(!name || (saveType === 'template' ? !category : !selectedPatient)) ? "Completa los campos obligatorios" : ""}
                        >
                            <Save size={18} />
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

SavePlanModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired
};

export default SavePlanModal;
