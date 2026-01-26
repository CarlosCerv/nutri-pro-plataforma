import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, ArrowRight, Check } from 'lucide-react';
import { foodExchangeAPI } from '../services/api';
import './FoodExchangeModal.css';

const FoodExchangeModal = ({ food, patientFilters, onExchange, onClose }) => {
    const [equivalents, setEquivalents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchEquivalents();
    }, [food]);

    const fetchEquivalents = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await foodExchangeAPI.getEquivalents({
                foodId: food.foodRef || food.id,
                patientFilters,
            });
            setEquivalents(response.data.equivalents || []);
        } catch (err) {
            console.error('Error fetching equivalents:', err);
            setError('Error al buscar alimentos equivalentes');
        } finally {
            setLoading(false);
        }
    };

    const handleExchange = (equivalent) => {
        onExchange(food, equivalent);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content exchange-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Intercambiar Alimento</h3>
                    <button className="btn-icon" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="original-food">
                        <h4>Alimento Original</h4>
                        <div className="food-card">
                            <div className="food-name">{food.name}</div>
                            <div className="food-nutrition">
                                <span>{food.calories} kcal</span>
                                <span>P: {food.protein || 0}g</span>
                                <span>C: {food.carbohydrates || 0}g</span>
                                <span>G: {food.fats || 0}g</span>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Buscando alimentos equivalentes...</p>
                        </div>
                    ) : error ? (
                        <div className="error-state">
                            <p>{error}</p>
                            <button className="btn btn-primary" onClick={fetchEquivalents}>
                                Reintentar
                            </button>
                        </div>
                    ) : equivalents.length === 0 ? (
                        <div className="empty-state">
                            <p>No se encontraron alimentos equivalentes con los filtros aplicados</p>
                        </div>
                    ) : (
                        <div className="equivalents-list">
                            <h4>Opciones de Intercambio ({equivalents.length})</h4>
                            {equivalents.map((equiv) => (
                                <div key={equiv.id} className="equivalent-card">
                                    <div className="equivalent-info">
                                        <div className="equivalent-header">
                                            <span className="equivalent-name">{equiv.name}</span>
                                            <span className="similarity-score">
                                                {equiv.score}% similar
                                            </span>
                                        </div>
                                        <div className="equivalent-category">
                                            {equiv.category}
                                        </div>
                                        <div className="equivalent-nutrition">
                                            <div className="nutrition-item">
                                                <span className="label">Calorías:</span>
                                                <span className={equiv.differences.calories > 0 ? 'higher' : equiv.differences.calories < 0 ? 'lower' : ''}>
                                                    {equiv.nutrition.energy} kcal
                                                    {equiv.differences.calories !== 0 && (
                                                        <span className="diff">
                                                            ({equiv.differences.calories > 0 ? '+' : ''}{Math.round(equiv.differences.calories)})
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                            <div className="nutrition-item">
                                                <span className="label">Proteína:</span>
                                                <span>{equiv.nutrition.protein}g</span>
                                            </div>
                                            <div className="nutrition-item">
                                                <span className="label">Carbos:</span>
                                                <span>{equiv.nutrition.carbohydrates}g</span>
                                            </div>
                                            <div className="nutrition-item">
                                                <span className="label">Grasas:</span>
                                                <span>{equiv.nutrition.fat}g</span>
                                            </div>
                                        </div>
                                        {equiv.suitableFor && equiv.suitableFor.length > 0 && (
                                            <div className="suitable-tags">
                                                {equiv.suitableFor.map((tag, idx) => (
                                                    <span key={idx} className="tag tag-success">
                                                        <Check size={12} />
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        className="btn btn-primary btn-exchange"
                                        onClick={() => handleExchange(equiv)}
                                    >
                                        <ArrowRight size={16} />
                                        Intercambiar
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

FoodExchangeModal.propTypes = {
    food: PropTypes.object.isRequired,
    patientFilters: PropTypes.object,
    onExchange: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default FoodExchangeModal;
