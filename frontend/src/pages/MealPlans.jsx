import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mealPlansAPI, patientsAPI } from '../services/api';
import { UtensilsCrossed, Plus, Download, Loader, Edit2 } from 'lucide-react';
import PDFMealPlan from '../components/PDFMealPlan';
import usePDFExport from '../hooks/usePDFExport';
import { useAuth } from '../contexts/AuthContext';
import './MealPlans.css';

const MealPlans = () => {
    const [mealPlans, setMealPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'templates', 'assigned'
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();
    const { pdfRef, isGenerating, generatePDF } = usePDFExport();

    useEffect(() => {
        fetchMealPlans();
    }, [filter]);

    const fetchMealPlans = async () => {
        try {
            const params = filter === 'templates' ? { isTemplate: 'true' } :
                filter === 'assigned' ? { isTemplate: 'false' } : {};
            const response = await mealPlansAPI.getAll(params);
            const plans = response.data?.data || [];

            // Populate with patient data if needed
            const plansWithPatients = await Promise.all(
                plans.map(async (plan) => {
                    if (plan.patient && typeof plan.patient === 'string') {
                        try {
                            const patientResponse = await patientsAPI.getOne(plan.patient);
                            return { ...plan, patient: patientResponse.data.data };
                        } catch (err) {
                            console.error('Error fetching patient:', err);
                            return plan;
                        }
                    }
                    return plan;
                })
            );

            setMealPlans(plansWithPatients);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching meal plans:', error);
            setLoading(false);
        }
    };

    const handleCreatePlan = () => {
        navigate('/menu-builder');
    };

    const handleViewDetails = (planId, isTemplate) => {
        if (isTemplate) {
            navigate(`/menu-builder?templateId=${planId}`);
        } else {
            navigate(`/menu-builder?planId=${planId}`);
        }
    };

    const handleExportPDF = async (plan) => {
        if (!plan.patient) {
            alert('No se puede exportar: Este plan no está asignado a un paciente.');
            return;
        }

        setSelectedPlan(plan);
        setSelectedPatient(plan.patient);

        await new Promise(resolve => setTimeout(resolve, 100));

        const result = await generatePDF(plan, plan.patient);

        if (result?.success) {
            setTimeout(() => {
                setSelectedPlan(null);
                setSelectedPatient(null);
            }, 500);
        }
    };

    if (loading) {
        return (
            <div className="page-loading">
                <div className="spinner-large"></div>
            </div>
        );
    }

    return (
        <div className="mealplans-page fade-in">
            <div className="page-header">
                <div>
                    <h1>Planes de Alimentación</h1>
                    <p>Crea y gestiona plantillas de planes nutricionales</p>
                </div>
                <button className="btn btn-primary" onClick={handleCreatePlan}>
                    <Plus size={18} />
                    <span>Nuevo Plan</span>
                </button>
            </div>

            <div className="filter-tabs">
                <button
                    className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    Todos
                </button>
                <button
                    className={`filter-tab ${filter === 'templates' ? 'active' : ''}`}
                    onClick={() => setFilter('templates')}
                >
                    Plantillas
                </button>
                <button
                    className={`filter-tab ${filter === 'assigned' ? 'active' : ''}`}
                    onClick={() => setFilter('assigned')}
                >
                    Asignados
                </button>
            </div>

            <div className="mealplans-grid">
                {!mealPlans || mealPlans.length === 0 ? (
                    <div className="empty-state-large">
                        <UtensilsCrossed size={64} strokeWidth={1} />
                        <h3>No hay planes de alimentación</h3>
                        <p>Comienza creando tu primera plantilla</p>
                        <button className="btn btn-primary" onClick={handleCreatePlan}>
                            <Plus size={18} />
                            <span>Crear Plan</span>
                        </button>
                    </div>
                ) : (
                    mealPlans.filter(p => p && p._id).map((plan) => (
                        <div key={plan._id} className="mealplan-card card">
                            <div className="mealplan-header">
                                <h3>{plan.name || 'Sin Nombre'}</h3>
                                {plan.isTemplate ? (
                                    <span className="badge badge-info">Plantilla</span>
                                ) : (
                                    <span className="badge badge-success">Asignado</span>
                                )}
                            </div>

                            {plan?.description && (
                                <p className="mealplan-description">{plan.description}</p>
                            )}

                            {plan?.patient && (
                                <div className="mealplan-patient">
                                    <strong>Paciente:</strong> {plan.patient.firstName || ''} {plan.patient.lastName || ''}
                                </div>
                            )}

                            {plan?.nutrition && (
                                <div className="nutrition-info">
                                    <div className="nutrition-item">
                                        <span className="nutrition-label">Calorías</span>
                                        <span className="nutrition-value">{plan.nutrition.totalCalories || 0} kcal</span>
                                    </div>
                                    <div className="nutrition-item">
                                        <span className="nutrition-label">Proteínas</span>
                                        <span className="nutrition-value">{plan.nutrition.protein || 0}g</span>
                                    </div>
                                    <div className="nutrition-item">
                                        <span className="nutrition-label">Carbos</span>
                                        <span className="nutrition-value">{plan.nutrition.carbohydrates || 0}g</span>
                                    </div>
                                    <div className="nutrition-item">
                                        <span className="nutrition-label">Grasas</span>
                                        <span className="nutrition-value">{plan.nutrition.fats || 0}g</span>
                                    </div>
                                </div>
                            )}

                            {plan?.tags && plan.tags.length > 0 && (
                                <div className="mealplan-tags">
                                    {plan.tags.map((tag, index) => (
                                        <span key={index} className="tag">{tag}</span>
                                    ))}
                                </div>
                            )}

                            <div className="mealplan-footer">
                                <button
                                    className="btn btn-outline"
                                    onClick={() => handleViewDetails(plan._id, plan.isTemplate)}
                                >
                                    <Edit2 size={18} />
                                    {plan.isTemplate ? 'Editar' : 'Ver Detalles'}
                                </button>
                                {!plan.isTemplate && plan.patient && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleExportPDF(plan)}
                                        disabled={isGenerating}
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader className="spinner" size={18} />
                                                Exportando...
                                            </>
                                        ) : (
                                            <>
                                                <Download size={18} />
                                                Exportar PDF
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Hidden PDF rendering component */}
            {selectedPlan && selectedPatient && (
                <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                    <PDFMealPlan
                        ref={pdfRef}
                        mealPlan={selectedPlan}
                        patient={selectedPatient}
                        nutritionist={user}
                    />
                </div>
            )}
        </div>
    );
};

export default MealPlans;
