import PropTypes from 'prop-types';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import DraggableFoodItem from './DraggableFoodItem';
import { Clock } from 'lucide-react';

const MealSlot = ({ mealType, mealLabel, time, foods, onTimeChange, onRemoveFood, onExchangeFood, onUpdateFood, suggestion }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: mealType,
    });

    // Calculate meal totals
    const totals = foods.reduce((acc, food) => ({
        calories: acc.calories + (food.calories || 0),
        protein: acc.protein + (food.protein || 0),
        carbs: acc.carbs + (food.carbohydrates || 0),
        fats: acc.fats + (food.fats || 0),
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

    return (
        <div className={`meal-slot ${isOver ? 'drag-over' : ''}`}>
            <div className="meal-slot-header">
                <div className="header-top-row">
                    <h4>{mealLabel}</h4>
                    <div className="meal-time-badge">
                        <Clock size={14} />
                        <input
                            type="time"
                            value={time || ''}
                            onChange={(e) => onTimeChange(mealType, e.target.value)}
                            className="time-input-styled"
                        />
                    </div>
                </div>
                {suggestion && (
                    <div className="menu-suggestion-subtle">
                        <span className="suggestion-text">{suggestion}</span>
                    </div>
                )}
            </div>

            <div
                ref={setNodeRef}
                className={`meal-foods-list ${foods.length === 0 ? 'empty' : ''}`}
            >
                {foods.length === 0 ? (
                    <div className="drop-zone-placeholder">
                        <p>Arrastra alimentos aquí</p>
                    </div>
                ) : (
                    <SortableContext
                        items={foods.map(f => f.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="foods-stack">
                            {foods.map(food => (
                                <DraggableFoodItem
                                    key={food.id}
                                    food={food}
                                    onRemove={onRemoveFood}
                                    onExchange={onExchangeFood}
                                    onUpdate={onUpdateFood}
                                />
                            ))}
                        </div>
                    </SortableContext>
                )}
            </div>

            {foods.length > 0 && (
                <div className="meal-footer">
                    <div className="macro-pill">
                        <span className="label">Calorías</span>
                        <span className="value">{Math.round(totals.calories)}</span>
                    </div>
                    <div className="macro-pill-group">
                        <span title="Proteína">P: {Math.round(totals.protein)}g</span>
                        <span title="Carbohidratos">C: {Math.round(totals.carbs)}g</span>
                        <span title="Grasas">G: {Math.round(totals.fats)}g</span>
                    </div>
                </div>
            )}
        </div>
    );
};

MealSlot.propTypes = {
    mealType: PropTypes.string.isRequired,
    mealLabel: PropTypes.string.isRequired,
    time: PropTypes.string,
    foods: PropTypes.array.isRequired,
    onTimeChange: PropTypes.func.isRequired,
    onRemoveFood: PropTypes.func.isRequired,
    onExchangeFood: PropTypes.func,
    suggestion: PropTypes.string,
};

export default MealSlot;
