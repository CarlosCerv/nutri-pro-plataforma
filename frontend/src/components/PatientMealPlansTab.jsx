import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { mealPlansAPI } from '../services/api';
import { UtensilsCrossed, Download, Loader, Eye } from 'lucide-react';
import PDFMealPlan from './PDFMealPlan';
import usePDFExport from '../hooks/usePDFExport';
import { useAuth } from '../contexts/AuthContext';

const PatientMealPlansTab = ({ patientId, patient }) => {
    const [mealPlans, setMealPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const { user } = useAuth();
    const { pdfRef, isGenerating, generatePDF } = usePDFExport();

    const fetchMealPlans = useCallback(async () => {
        try {
            const response = await mealPlansAPI.getAll({ patientId, isTemplate: 'false' });
            setMealPlans(response.data?.data || []);
        } catch (error) {
            console.error('Error fetching patient meal plans:', error);
        } finally {
            setLoading(false);
        }
    }, [patientId]);

    useEffect(() => {
        fetchMealPlans();
    }, [fetchMealPlans]);

    const handleExportPDF = async (plan) => {
        // Set the selected plan for PDF rendering
        setSelectedPlan(plan);

        // Wait for render
        await new Promise(resolve => setTimeout(resolve, 100));

        // Generate PDF
        const result = await generatePDF(plan, patient);

        if (result?.success) {
            // Clear selection after successful export
            setTimeout(() => setSelectedPlan(null), 500);
        }
    };

    if (loading) {
        return (
            <div className="tab-loading">
                <Loader className="spinner" size={32} />
                <p>Cargando planes nutricionales...</p>
            </div>
        );
    }

    return (
        <div className="patient-meal-plans-tab">
            {mealPlans.length === 0 ? (
                <div className="empty-state">
                    <UtensilsCrossed size={64} strokeWidth={1} />
                    <h3>No hay planes asignados</h3>
                    <p>Este paciente aún no tiene planes nutricionales asignados.</p>
                </div>
            ) : (
                <div className="meal-plans-list">
                    {mealPlans.map((plan) => (
                        <div key={plan._id} className="meal-plan-card card">
                            <div className="meal-plan-header">
                                <h3>{plan.name || 'Plan Sin Nombre'}</h3>
                                <span className="badge badge-success">Asignado</span>
                            </div>

                            {plan.description && (
                                <p className="meal-plan-description">{plan.description}</p>
                            )}

                            {plan.nutrition && (
                                <div className="nutrition-quick-stats">
                                    <div className="stat">
                                        <span className="stat-value">{Math.round(plan.nutrition.totalCalories || 0)}</span>
                                        <span className="stat-label">kcal</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-value">{Math.round(plan.nutrition.protein || 0)}g</span>
                                        <span className="stat-label">Proteínas</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-value">{Math.round(plan.nutrition.carbohydrates || 0)}g</span>
                                        <span className="stat-label">Carbos</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-value">{Math.round(plan.nutrition.fats || 0)}g</span>
                                        <span className="stat-label">Grasas</span>
                                    </div>
                                </div>
                            )}

                            <div className="meal-plan-actions">
                                <button
                                    className="btn btn-outline"
                                    onClick={() => window.open(`/menu-builder?planId=${plan._id}`, '_blank')}
                                >
                                    <Eye size={18} />
                                    Ver Detalles
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleExportPDF(plan)}
                                    disabled={isGenerating}
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader className="spinner" size={18} />
                                            Generando...
                                        </>
                                    ) : (
                                        <>
                                            <Download size={18} />
                                            Exportar PDF
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="meal-plan-meta">
                                <small>
                                    Creado: {new Date(plan.createdAt).toLocaleDateString('es-MX')}
                                </small>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Hidden PDF rendering component */}
            {selectedPlan && (
                <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                    <PDFMealPlan
                        ref={pdfRef}
                        mealPlan={selectedPlan}
                        patient={patient}
                        nutritionist={user}
                    />
                </div>
            )}
        </div>
    );
};

PatientMealPlansTab.propTypes = {
    patientId: PropTypes.string.isRequired,
    patient: PropTypes.object.isRequired,
};

export default PatientMealPlansTab;
