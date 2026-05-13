import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { mealPlansAPI } from '../services/api';
import { UtensilsCrossed, Download, Loader, Eye } from 'lucide-react';
import PDFMealPlan from './PDFMealPlan';
import usePDFExport from '../hooks/usePDFExport';
import { useAuth } from '../contexts/AuthContext';

const PatientMealPlansTab = ({ patientId, patient }) => {
  const navigate = useNavigate();
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [planForPdf, setPlanForPdf] = useState(null);
  const [pdfErr, setPdfErr] = useState('');
  const { user } = useAuth();
  const { pdfRef, isGenerating, error, generatePDF } = usePDFExport();

  const fetchMealPlans = useCallback(async () => {
    try {
      const response = await mealPlansAPI.getAll({ patientId, isTemplate: 'false' });
      setMealPlans(response.data?.data || []);
    } catch (err) {
      console.error('Error fetching patient meal plans:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchMealPlans();
  }, [fetchMealPlans]);

  useEffect(() => {
    if (!planForPdf) return;
    let cancelled = false;

    const run = async () => {
      setPdfErr('');
      for (let i = 0; i < 20; i += 1) {
        if (cancelled) return;
        if (pdfRef.current) break;
        await new Promise((r) => requestAnimationFrame(r));
      }
      if (cancelled || !pdfRef.current) {
        setPdfErr('No se pudo preparar la vista del PDF. Intenta de nuevo.');
        setPlanForPdf(null);
        return;
      }
      await new Promise((r) => setTimeout(r, 150));
      if (cancelled) return;
      const result = await generatePDF(planForPdf, patient);
      if (!cancelled) setPlanForPdf(null);
      if (result && !result.success) {
        setPdfErr(result.error || 'Error al generar el PDF');
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [planForPdf, patient, generatePDF]);

  const handleExportPDF = (plan) => {
    setPdfErr('');
    setPlanForPdf(plan);
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
      {(error || pdfErr) && (
        <div className="mb-4 rounded-xl border border-[rgba(255,59,48,0.25)] bg-[rgba(255,59,48,0.06)] px-4 py-3 text-sm text-[var(--danger)]">
          {error || pdfErr}
        </div>
      )}

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
                <h3>{plan.name || 'Plan sin nombre'}</h3>
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
                  type="button"
                  className="btn btn-outline"
                  onClick={() => navigate(`/dietas/${plan._id}/editar`)}
                >
                  <Eye size={18} />
                  Editar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleExportPDF(plan)}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader className="spinner" size={18} />
                      Generando…
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
                  Creado: {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString('es-MX') : '—'}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}

      {planForPdf && (
        <div
          aria-hidden
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: 'min(794px, 100vw)',
            maxHeight: '90vh',
            overflow: 'auto',
            zIndex: 2147483000,
            opacity: 0.02,
            pointerEvents: 'none',
          }}
        >
          <PDFMealPlan
            ref={pdfRef}
            mealPlan={planForPdf}
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
