import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Save, User, FileText } from 'lucide-react';
import { patientsAPI } from '../services/api';
import Modal from '../design-system/components/Modal.jsx';
import Button from '../design-system/components/Button.jsx';
import Input, { Select } from '../design-system/components/Input.jsx';
import './SavePlanModal.css';

const SavePlanModal = ({ onClose, onSave }) => {
    const [saveType, setSaveType] = useState('template'); // 'template' or 'patient'
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [selectedPatient, setSelectedPatient] = useState('');
    const [patients, setPatients] = useState([]);
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

    const fetchInitialData = useCallback(async () => {
        try {
            const patientsRes = await patientsAPI.getAll();
            setPatients(patientsRes.data?.data || []);
        } catch (err) {
            console.error('Error loading patients:', err);
            setPatients([]);
            console.warn('Could not load patients, but categories are available');
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchInitialData();
    }, [fetchInitialData]);

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

    const missingRequired = !name || (saveType === 'template' ? !category : !selectedPatient);

    return (
        <Modal onClose={onClose} title="Guardar Plan de Alimentación" className="save-modal">
            <div className="save-type-selector">
                <button
                    type="button"
                    className={`type-option ${saveType === 'template' ? 'active' : ''}`}
                    onClick={() => setSaveType('template')}
                >
                    <FileText size={24} />
                    <span>Guardar como Plantilla</span>
                </button>
                <button
                    type="button"
                    className={`type-option ${saveType === 'patient' ? 'active' : ''}`}
                    onClick={() => setSaveType('patient')}
                >
                    <User size={24} />
                    <span>Asignar a Paciente</span>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="save-form">
                <Input
                    label="Nombre del Plan"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Dieta Mediterránea 1800kcal"
                    error={!name && error ? 'El nombre es obligatorio' : undefined}
                />

                {saveType === 'template' ? (
                    <Select
                        label="Categoría"
                        required
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        error={!category && error ? 'La categoría es obligatoria' : undefined}
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
                    </Select>
                ) : (
                    <Select
                        label="Paciente"
                        required
                        value={selectedPatient}
                        onChange={(e) => setSelectedPatient(e.target.value)}
                        error={!selectedPatient && error ? 'Debes seleccionar un paciente' : undefined}
                    >
                        <option value="">Selecciona un paciente</option>
                        {patients.map((p) => (
                            <option key={p._id} value={p._id}>
                                {p.firstName} {p.lastName}
                            </option>
                        ))}
                    </Select>
                )}

                <div className="modal-actions">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={missingRequired}
                        title={missingRequired ? 'Completa los campos obligatorios' : ''}
                    >
                        <Save size={18} />
                        Guardar
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

SavePlanModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired
};

export default SavePlanModal;
