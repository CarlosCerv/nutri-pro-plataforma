import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Repeat, Plus } from 'lucide-react';

const DraggableFoodItem = ({ food, onRemove, onExchange, onUpdate, onQuickAdd }) => {
    // Defensive checks
    if (!food || !food.id || !food.name) {
        console.warn('DraggableFoodItem: Invalid food item', food);
        return null;
    }

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: food.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const [imageError, setImageError] = useState(false);

    // Reset error state if food changes (e.g. reused component)
    useEffect(() => {
        setImageError(false);
    }, [food.id, food.img, food.image]);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`draggable-food-item ${isDragging ? 'dragging' : ''}`}
        >
            <div className="drag-handle desktop-only" {...attributes} {...listeners}>
                <GripVertical size={16} />
            </div>

            <div className="food-content-wrapper">
                <div className="food-image-container">
                    {!imageError && (food.img || food.image) ? (
                        <img
                            src={food.img || food.image}
                            alt={food.name}
                            className="food-image"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="food-image-placeholder">{food.name?.charAt(0) || '?'}</div>
                    )}
                </div>

                <div className="food-info">
                    <div className="food-name">{food.name}</div>
                    <div className="food-details">
                        {onUpdate && food.servingSizes && food.servingSizes.length > 0 ? (
                            <div className="food-quantity-selector" onMouseDown={(e) => e.stopPropagation()}>
                                <select
                                    className="quantity-select"
                                    value={food.quantity || '100g'}
                                    onChange={(e) => {
                                        const selected = food.servingSizes.find(s => s.name === e.target.value);
                                        if (selected) {
                                            onUpdate(food.id, {
                                                quantity: selected.name,
                                                quantityGrams: selected.grams
                                            });
                                        } else if (e.target.value === '100g') {
                                            onUpdate(food.id, {
                                                quantity: '100g',
                                                quantityGrams: 100
                                            });
                                        }
                                    }}
                                >
                                    {food.servingSizes.map(s => (
                                        <option key={s.name} value={s.name}>{s.name} ({s.grams}g)</option>
                                    ))}
                                    <option value="100g">100g</option>
                                </select>
                            </div>
                        ) : (
                            <span>{food.quantity || '100g'}</span>
                        )}
                        <span className="separator">•</span>
                        <span>{Math.round(food.calories || 0)} kcal</span>
                    </div>
                </div>
            </div>

            <div className="food-actions">
                {onQuickAdd && (
                    <button
                        type="button"
                        className="btn-icon-small btn-primary-mobile"
                        onClick={(e) => {
                            e.stopPropagation();
                            onQuickAdd(food);
                        }}
                        title="Agregar al plan"
                    >
                        <Plus size={18} />
                    </button>
                )}
                {onExchange && (
                    <button
                        className="btn-icon-small"
                        onClick={() => onExchange(food)}
                        title="Intercambiar alimento"
                    >
                        <Repeat size={16} />
                    </button>
                )}
                {onRemove && (
                    <button
                        className="btn-icon-small btn-danger"
                        onClick={() => onRemove(food.id)}
                        title="Eliminar"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>
        </div>
    );
};

DraggableFoodItem.propTypes = {
    food: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        quantity: PropTypes.string,
        calories: PropTypes.number,
    }).isRequired,
    onRemove: PropTypes.func,
    onExchange: PropTypes.func,
    onUpdate: PropTypes.func,
};

export default DraggableFoodItem;
