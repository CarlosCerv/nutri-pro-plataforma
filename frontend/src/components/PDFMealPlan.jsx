import React from 'react';
import PropTypes from 'prop-types';
import './PDFMealPlan.css';

const PDFMealPlan = React.forwardRef(({ mealPlan, patient, nutritionist }, ref) => {
    const mealLabels = {
        breakfast: 'Desayuno',
        morningSnack: 'Colación Matutina',
        lunch: 'Comida',
        afternoonSnack: 'Colación Vespertina',
        dinner: 'Cena',
        eveningSnack: 'Colación Nocturna'
    };

    const totals = mealPlan.nutrition || {
        totalCalories: 0,
        protein: 0,
        carbohydrates: 0,
        fats: 0
    };

    return (
        <div ref={ref} className="pdf-meal-plan">
            {/* Header */}
            <div className="pdf-header">
                <div className="pdf-branding">
                    <h1>NutriPlan</h1>
                    <p className="pdf-subtitle">Plan Nutricional Personalizado</p>
                    {nutritionist?.name && (
                        <p className="pdf-nutritionist-header">Nutriólogo: {nutritionist.name}</p>
                    )}
                </div>
                <div className="pdf-date">
                    <p>{new Date().toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}</p>
                </div>
            </div>

            {/* Patient Info */}
            <div className="pdf-section pdf-patient-info">
                <h2>Información del Paciente</h2>
                <div className="pdf-info-grid">
                    <div className="pdf-info-item">
                        <span className="pdf-label">Nombre:</span>
                        <span className="pdf-value">{patient?.firstName} {patient?.lastName}</span>
                    </div>
                    {patient?.email && (
                        <div className="pdf-info-item">
                            <span className="pdf-label">Email:</span>
                            <span className="pdf-value">{patient.email}</span>
                        </div>
                    )}
                    {patient?.phone && (
                        <div className="pdf-info-item">
                            <span className="pdf-label">Teléfono:</span>
                            <span className="pdf-value">{patient.phone}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Plan Info */}
            <div className="pdf-section pdf-plan-info">
                <h2>{mealPlan.name || 'Plan Nutricional'}</h2>
                {mealPlan.description && (
                    <p className="pdf-description">{mealPlan.description}</p>
                )}
            </div>

            {/* Nutrition Summary */}
            <div className="pdf-section pdf-nutrition-summary">
                <h3>Resumen Nutricional Diario</h3>
                <div className="pdf-nutrition-grid">
                    <div className="pdf-nutrition-box">
                        <div className="pdf-nutrition-value">{Math.round(totals.totalCalories || 0)}</div>
                        <div className="pdf-nutrition-label">kcal</div>
                    </div>
                    <div className="pdf-nutrition-box">
                        <div className="pdf-nutrition-value">{Math.round(totals.protein || 0)}g</div>
                        <div className="pdf-nutrition-label">Proteínas</div>
                    </div>
                    <div className="pdf-nutrition-box">
                        <div className="pdf-nutrition-value">{Math.round(totals.carbohydrates || 0)}g</div>
                        <div className="pdf-nutrition-label">Carbohidratos</div>
                    </div>
                    <div className="pdf-nutrition-box">
                        <div className="pdf-nutrition-value">{Math.round(totals.fats || 0)}g</div>
                        <div className="pdf-nutrition-label">Grasas</div>
                    </div>
                </div>
            </div>

            {/* Meals */}
            <div className="pdf-section pdf-meals">
                <h3>Plan de Alimentación</h3>
                {Object.entries(mealPlan.meals || {}).map(([mealKey, meal]) => {
                    if (!meal.foods || meal.foods.length === 0) return null;

                    return (
                        <div key={mealKey} className="pdf-meal">
                            <div className="pdf-meal-header">
                                <h4>{mealLabels[mealKey] || mealKey}</h4>
                                <span className="pdf-meal-time">{meal.time || ''}</span>
                            </div>
                            <table className="pdf-meal-table">
                                <thead>
                                    <tr>
                                        <th>Alimento</th>
                                        <th>Cantidad</th>
                                        <th>Calorías</th>
                                        <th>Proteínas</th>
                                        <th>Carbos</th>
                                        <th>Grasas</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {meal.foods.map((food, index) => (
                                        <tr key={index}>
                                            <td>{food.foodRef?.name || food.item || 'Alimento'}</td>
                                            <td>{food.quantity || '1 porción'}</td>
                                            <td>{Math.round(food.calories || 0)}</td>
                                            <td>{Math.round(food.protein || 0)}g</td>
                                            <td>{Math.round(food.carbohydrates || 0)}g</td>
                                            <td>{Math.round(food.fats || 0)}g</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {meal.notes && (
                                <p className="pdf-meal-notes"><strong>Notas:</strong> {meal.notes}</p>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="pdf-footer">
                <div className="pdf-footer-line"></div>
                <div className="pdf-footer-content">
                    <div>
                        <strong>Nutriólogo:</strong> {nutritionist?.name || 'No especificado'}
                    </div>
                    {nutritionist?.email && (
                        <div>
                            <strong>Contacto:</strong> {nutritionist.email}
                        </div>
                    )}
                    {nutritionist?.phone && (
                        <div>
                            <strong>Tel:</strong> {nutritionist.phone}
                        </div>
                    )}
                </div>
                <p className="pdf-footer-disclaimer">
                    Este plan nutricional ha sido elaborado específicamente para {patient?.firstName} {patient?.lastName}.
                    No debe ser compartido ni utilizado por otras personas sin consulta previa.
                </p>
            </div>
        </div>
    );
});

PDFMealPlan.displayName = 'PDFMealPlan';

PDFMealPlan.propTypes = {
    mealPlan: PropTypes.shape({
        name: PropTypes.string,
        description: PropTypes.string,
        meals: PropTypes.object,
        nutrition: PropTypes.object,
    }).isRequired,
    patient: PropTypes.shape({
        firstName: PropTypes.string,
        lastName: PropTypes.string,
        email: PropTypes.string,
        phone: PropTypes.string,
    }),
    nutritionist: PropTypes.shape({
        name: PropTypes.string,
        email: PropTypes.string,
        phone: PropTypes.string,
    }),
};

export default PDFMealPlan;
