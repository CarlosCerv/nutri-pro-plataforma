import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Save, Filter, Search, ArrowLeft } from 'lucide-react';

import { foodsAPI, mealPlansAPI, dietTemplatesAPI } from '../services/api';
import MealSlot from '../components/MealSlot';
import DraggableFoodItem from '../components/DraggableFoodItem';
import ClinicalFilters from '../components/ClinicalFilters';
import FoodExchangeModal from '../components/FoodExchangeModal';
import SavePlanModal from '../components/SavePlanModal';
import BackButton from '../components/BackButton';
import './MenuBuilder.css';

const MenuBuilder = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const templateId = searchParams.get('templateId');
    const planId = searchParams.get('planId');

    // State
    const [loading, setLoading] = useState(!!templateId || !!planId);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [clinicalFilters, setClinicalFilters] = useState({
        excludedAllergens: [],
        pathologyAdaptations: [],
        maxSodium: null,
        maxGlycemicIndex: null,
    });

    // Meal state
    const [meals, setMeals] = useState({
        breakfast: { label: 'Desayuno', time: '08:00', foods: [] },
        morningSnack: { label: 'Colación Matutina', time: '10:30', foods: [] },
        lunch: { label: 'Comida', time: '13:00', foods: [] },
        afternoonSnack: { label: 'Colación Vespertina', time: '16:00', foods: [] },
        dinner: { label: 'Cena', time: '19:00', foods: [] },
        eveningSnack: { label: 'Colación Nocturna', time: '21:00', foods: [] },
    });

    // Exchange modal state
    const [exchangeData, setExchangeData] = useState(null);
    const [activeDragId, setActiveDragId] = useState(null);
    const [activeDragItem, setActiveDragItem] = useState(null);

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Mock Data for Prepared Meal Options
    const PREPARED_MEALS = [
        {
            id: 'meal-oatmeal',
            type: 'prepared_meal',
            name: 'Bowl de Avena y Frutas',
            calories: 345,
            image: null, // Use placeholder or generic icon
            items: [
                { name: 'Avena', quantity: '40g', quantityGrams: 40, calories: 150, protein: 5, carbohydrates: 27, fats: 3 },
                { name: 'Leche Descremada', quantity: '200ml', quantityGrams: 200, calories: 70, protein: 7, carbohydrates: 10, fats: 0 },
                { name: 'Plátano', quantity: '1 pza', quantityGrams: 100, calories: 90, protein: 1, carbohydrates: 23, fats: 0 },
                { name: 'Nueces', quantity: '10g', quantityGrams: 10, calories: 65, protein: 2, carbohydrates: 1, fats: 6 }
            ]
        },
        {
            id: 'meal-toast',
            type: 'prepared_meal',
            name: 'Tostada de Aguacate y Huevo',
            calories: 320,
            image: null,
            items: [
                { name: 'Pan Integral', quantity: '1 reb', quantityGrams: 30, calories: 80, protein: 3, carbohydrates: 15, fats: 1 },
                { name: 'Aguacate', quantity: '1/3 pza', quantityGrams: 50, calories: 80, protein: 1, carbohydrates: 4, fats: 7 },
                { name: 'Huevo Cocido', quantity: '1 pza', quantityGrams: 50, calories: 70, protein: 6, carbohydrates: 0, fats: 5 },
                { name: 'Aceite de Oliva', quantity: '1 cdita', quantityGrams: 5, calories: 45, protein: 0, carbohydrates: 0, fats: 5 }
            ]
        },
        {
            id: 'meal-yogurt',
            type: 'prepared_meal',
            name: 'Yogurt Griego con Berries',
            calories: 210,
            image: null,
            items: [
                { name: 'Yogurt Griego', quantity: '150g', quantityGrams: 150, calories: 90, protein: 15, carbohydrates: 6, fats: 0 },
                { name: 'Fresas', quantity: '1/2 taza', quantityGrams: 75, calories: 25, protein: 0, carbohydrates: 6, fats: 0 },
                { name: 'Granola', quantity: '2 cdtas', quantityGrams: 20, calories: 80, protein: 2, carbohydrates: 12, fats: 3 },
                { name: 'Miel', quantity: '1 cdita', quantityGrams: 7, calories: 20, protein: 0, carbohydrates: 5, fats: 0 }
            ]
        },
        {
            id: 'meal-salad',
            type: 'prepared_meal',
            name: 'Ensalada de Atún Fresca',
            calories: 280,
            image: null,
            items: [
                { name: 'Atún en Agua', quantity: '1 lata', quantityGrams: 100, calories: 100, protein: 22, carbohydrates: 0, fats: 1 },
                { name: 'Lechuga', quantity: '2 tazas', quantityGrams: 100, calories: 15, protein: 1, carbohydrates: 3, fats: 0 },
                { name: 'Tomate', quantity: '1/2 pza', quantityGrams: 60, calories: 15, protein: 1, carbohydrates: 3, fats: 0 },
                { name: 'Mayonesa Light', quantity: '1 cda', quantityGrams: 15, calories: 40, protein: 0, carbohydrates: 1, fats: 4 },
                { name: 'Galletas Saladas', quantity: '4 pzas', quantityGrams: 30, calories: 110, protein: 2, carbohydrates: 20, fats: 3 }
            ]
        }
    ];

    const [activeSidebarTab, setActiveSidebarTab] = useState('search'); // 'search' | 'quick_meals'
    const [activeMobileView, setActiveMobileView] = useState('plan'); // 'search' | 'plan' | 'summary'

    // Load template or plan if provided
    // Load template, plan, or draft
    useEffect(() => {
        if (templateId) {
            loadTemplate(templateId);
        } else if (planId) {
            loadMealPlan(planId);
        } else {
            // Restore draft if exists
            try {
                const savedDraft = localStorage.getItem('menuBuilder_draft');
                if (savedDraft) {
                    const parsedDraft = JSON.parse(savedDraft);
                    if (parsedDraft && parsedDraft.meals) {
                        setMeals(parsedDraft.meals);
                    }
                }
            } catch (error) {
                console.error('Error restoring draft:', error);
            }
            setLoading(false);
        }
    }, [templateId, planId]);

    // Auto-save draft
    useEffect(() => {
        // Only auto-save if we are NOT editing an existing saved plan/template (optional, but safer)
        // AND if there is at least one food item
        const hasContent = Object.values(meals).some(m => m.foods.length > 0);

        if (!templateId && !planId && hasContent) {
            const draft = {
                meals,
                timestamp: Date.now()
            };
            localStorage.setItem('menuBuilder_draft', JSON.stringify(draft));
        }
    }, [meals, templateId, planId]);

    // Search foods
    useEffect(() => {
        const searchFoods = async () => {
            try {
                const params = {
                    search: searchTerm || undefined, // Send undefined if empty to not filter by text
                    limit: 20, // Initial limit
                    // Apply filters to search
                    excludeAllergens: clinicalFilters.excludedAllergens.length > 0 ? clinicalFilters.excludedAllergens.join(',') : undefined,
                    suitableFor: clinicalFilters.pathologyAdaptations.length > 0 ? clinicalFilters.pathologyAdaptations.join(',') : undefined,
                };

                // Clean undefined params
                Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

                const response = await foodsAPI.getAll(params);
                setSearchResults(response.data.data.map(f => ({
                    id: f._id, // Keep original ID for drag source
                    name: f.name,
                    nutrition: f.nutrition, // Store full base nutrition (per 100g)
                    calories: f.nutrition.energy,
                    protein: f.nutrition.protein,
                    carbohydrates: f.nutrition.carbohydrates,
                    fats: f.nutrition.fat,
                    servingSizes: f.servingSizes || [],
                    quantity: f.servingSizes?.[0]?.name || '100g',
                    quantityGrams: f.servingSizes?.[0]?.grams || 100,
                    image: f.image // Ensure typical property name
                })));
            } catch (error) {
                console.error('Error searching foods:', error);
            }
        };

        // Debounce only if there is a search term to avoid flickering on typing
        if (searchTerm) {
            const timeoutId = setTimeout(searchFoods, 300);
            return () => clearTimeout(timeoutId);
        } else {
            searchFoods();
        }
    }, [searchTerm, clinicalFilters]);

    const loadTemplate = async (id) => {
        try {
            const response = await dietTemplatesAPI.getOne(id);
            const template = response.data.data;
            mapDataToState(template.defaultMeals, template.clinicalProfile);
            setLoading(false);
        } catch (error) {
            console.error('Error loading template:', error);
            setLoading(false);
        }
    };

    const loadMealPlan = async (id) => {
        try {
            const response = await mealPlansAPI.getOne(id);
            const plan = response.data.data;
            mapDataToState(plan.meals, plan.clinicalFilters);
            setLoading(false);
        } catch (error) {
            console.error('Error loading plan:', error);
            setLoading(false);
        }
    };

    const mapDataToState = (mealsData, filters) => {
        // Map meals to state format
        const newMeals = { ...meals };
        Object.keys(mealsData).forEach(key => {
            if (newMeals[key]) {
                newMeals[key].time = mealsData[key].time || newMeals[key].time;
                // Handle different potential structures of 'foods' in backend
                const backendFoods = mealsData[key].foods || [];

                newMeals[key].foods = backendFoods.map(f => {
                    const isPopulated = f.foodRef && typeof f.foodRef === 'object' && f.foodRef.name;
                    return {
                        id: `food-${Math.random().toString(36).substr(2, 9)}`,
                        foodRef: isPopulated ? f.foodRef._id : (f.foodRef || f._id),
                        name: isPopulated ? f.foodRef.name : (f.item || 'Alimento'),
                        image: isPopulated ? f.foodRef.image : f.image,
                        nutrition: isPopulated ? f.foodRef.nutrition : (f.nutrition || {}),
                        servingSizes: isPopulated ? f.foodRef.servingSizes : (f.servingSizes || []),
                        calories: f.calories,
                        protein: f.protein,
                        carbohydrates: f.carbohydrates,
                        fats: f.fats,
                        quantity: f.quantity,
                        quantityGrams: f.quantityGrams || 100
                    };
                });
            }
        });
        setMeals(newMeals);

        // Set filters
        if (filters) {
            setClinicalFilters({
                excludedAllergens: filters.excludedAllergens || [],
                pathologyAdaptations: filters.suitableFor || filters.pathologyAdaptations || [],
                maxSodium: filters.maxSodium,
                maxGlycemicIndex: filters.maxGlycemicIndex,
            });
        }
    };

    // Generate menu suggestion based on foods
    const generateMenuSuggestion = (foods) => {
        if (!foods || foods.length === 0) return '';

        // Sort by calories (main dish usually has most calories)
        const sortedFoods = [...foods].sort((a, b) => b.calories - a.calories);
        const mainItem = sortedFoods[0];

        if (foods.length === 1) {
            return `Plato de ${mainItem.name}`;
        }

        const secondaryItem = sortedFoods[1];

        if (foods.length === 2) {
            return `${mainItem.name} con ${secondaryItem.name}`;
        }

        if (foods.length >= 3) {
            return `${mainItem.name} con ${secondaryItem.name} y acompañamientos`;
        }

        return '';
    };

    // calculate totals
    const totals = Object.values(meals).reduce((acc, meal) => {
        meal.foods.forEach(food => {
            acc.calories += food.calories || 0;
            acc.protein += food.protein || 0;
            acc.carbs += food.carbohydrates || 0;
            acc.fats += food.fats || 0;
        });
        return acc;
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

    // Drag handlers
    const handleDragStart = (event) => {
        const { active } = event;
        setActiveDragId(active.id);

        // Check if dragging a Prepared Meal
        const preparedMeal = PREPARED_MEALS.find(m => m.id === active.id);
        if (preparedMeal) {
            setActiveDragItem(preparedMeal);
            return;
        }

        // Check if dragging from search results
        const fromSearch = searchResults.find(f => f.id === active.id);
        if (fromSearch) {
            setActiveDragItem(fromSearch);
            return;
        }

        // Find in meals
        for (const mealKey in meals) {
            const food = meals[mealKey].foods.find(f => f.id === active.id);
            if (food) {
                setActiveDragItem(food);
                return;
            }
        }
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveDragId(null);
        setActiveDragItem(null);

        if (!over) return;

        // Dropping into a meal slot
        let mealKey = Object.keys(meals).find(key => key === over.id);

        // If not a direct match, check if we dropped OVER a food item inside a meal
        if (!mealKey) {
            mealKey = Object.keys(meals).find(key =>
                meals[key].foods.some(f => f.id === over.id)
            );
        }

        if (mealKey) {
            // Case 1: Dragging a Prepared Meal (Multi-item drop)
            const preparedMeal = PREPARED_MEALS.find(m => m.id === active.id);
            if (preparedMeal) {
                const newFoods = preparedMeal.items.map(item => ({
                    id: `food-${Math.random().toString(36).substr(2, 9)}`,
                    foodRef: null, // No DB ref ideally, or generic
                    name: item.name,
                    image: null,
                    nutrition: {}, // Basic info only
                    servingSizes: [],
                    quantity: item.quantity,
                    quantityGrams: item.quantityGrams,
                    calories: item.calories,
                    protein: item.protein,
                    carbohydrates: item.carbohydrates,
                    fats: item.fats
                }));

                setMeals(prev => ({
                    ...prev,
                    [mealKey]: {
                        ...prev[mealKey],
                        foods: [...prev[mealKey].foods, ...newFoods]
                    }
                }));
                return;
            }

            // Case 2: Dragging from search list (single new item)
            // Note: search items have database IDs, meal items have unique UI IDs
            const searchItem = searchResults.find(f => f.id === active.id);
            if (searchItem) {
                const newFood = {
                    ...searchItem,
                    id: `food-${Math.random().toString(36).substr(2, 9)}`,
                    foodRef: searchItem.id, // Store DB ID reference
                    image: searchItem.image || searchItem.img, // Ensure image carries over
                    nutrition: searchItem.nutrition,
                    servingSizes: searchItem.servingSizes,
                    quantity: searchItem.quantity,
                    quantityGrams: searchItem.quantityGrams,
                    // Ensure calories are calculated for the quantity (should be already correct from searchResults map)
                    calories: searchItem.calories,
                    protein: searchItem.protein,
                    carbohydrates: searchItem.carbohydrates,
                    fats: searchItem.fats
                };

                setMeals(prev => ({
                    ...prev,
                    [mealKey]: {
                        ...prev[mealKey],
                        foods: [...prev[mealKey].foods, newFood]
                    }
                }));
                return;
            }

            // Case 3: Dragging from another meal or reordering same meal
            let sourceMealKey;
            let sourceFoodIndex;

            // Find source
            Object.keys(meals).forEach(key => {
                const idx = meals[key].foods.findIndex(f => f.id === active.id);
                if (idx !== -1) {
                    sourceMealKey = key;
                    sourceFoodIndex = idx;
                }
            });

            if (sourceMealKey) {
                const foodItem = meals[sourceMealKey].foods[sourceFoodIndex];

                if (sourceMealKey === mealKey) {
                    // Reorder within same meal
                    // Simplified: just return for now as precise reorder needs more logic
                    return;
                } else {
                    // Move between meals
                    setMeals(prev => ({
                        ...prev,
                        [sourceMealKey]: {
                            ...prev[sourceMealKey],
                            foods: prev[sourceMealKey].foods.filter(f => f.id !== active.id)
                        },
                        [mealKey]: {
                            ...prev[mealKey],
                            foods: [...prev[mealKey].foods, foodItem]
                        }
                    }));
                }
            }
        }
    };

    const handleRemoveFood = (foodId) => {
        setMeals(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(key => {
                next[key] = {
                    ...next[key],
                    foods: next[key].foods.filter(f => f.id !== foodId)
                };
            });
            return next;
        });
    };

    const handleExchangeClick = (food) => {
        setExchangeData(food);
    };

    const handleUpdateFood = (foodId, updates) => {
        setMeals(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(key => {
                const foodIndex = next[key].foods.findIndex(f => f.id === foodId);
                if (foodIndex !== -1) {
                    const currentFood = next[key].foods[foodIndex];
                    let updatedFood = { ...currentFood, ...updates };

                    // If quantity/portion changed, recalculate nutrients
                    if (updates.quantityGrams && currentFood.nutrition) {
                        const ratio = updates.quantityGrams / 100;
                        updatedFood = {
                            ...updatedFood,
                            calories: currentFood.nutrition.energy * ratio,
                            protein: currentFood.nutrition.protein * ratio,
                            carbohydrates: currentFood.nutrition.carbohydrates * ratio,
                            fats: currentFood.nutrition.fat * ratio,
                        };
                    }

                    const newFoods = [...next[key].foods];
                    newFoods[foodIndex] = updatedFood;
                    next[key] = { ...next[key], foods: newFoods };
                }
            });
            return next;
        });
    };

    const handleExchangeComplete = (originalFood, newFood) => {
        setMeals(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(key => {
                const foodIndex = next[key].foods.findIndex(f => f.id === originalFood.id);
                if (foodIndex !== -1) {
                    // Create new food item preserving the UI ID but updating data
                    const updatedFood = {
                        ...next[key].foods[foodIndex],
                        foodRef: newFood.id,
                        name: newFood.name,
                        // Update base info
                        nutrition: newFood.nutrition,
                        servingSizes: newFood.servingSizes || [],

                        // Recalculate based on CURRENT quantity grams if possible, else reset
                        // For simplicity, let's reset to default portion of new food
                        quantity: newFood.servingSizes?.[0]?.name || '100g',
                        quantityGrams: newFood.servingSizes?.[0]?.grams || 100,
                        calories: newFood.nutrition.energy * ((newFood.servingSizes?.[0]?.grams || 100) / 100),
                        protein: newFood.nutrition.protein * ((newFood.servingSizes?.[0]?.grams || 100) / 100),
                        carbohydrates: newFood.nutrition.carbohydrates * ((newFood.servingSizes?.[0]?.grams || 100) / 100),
                        fats: newFood.nutrition.fat * ((newFood.servingSizes?.[0]?.grams || 100) / 100),
                    };

                    const newFoods = [...next[key].foods];
                    newFoods[foodIndex] = updatedFood;
                    next[key] = { ...next[key], foods: newFoods };
                }
            });
            return next;
        });
    };

    const handleTimeChange = (mealKey, time) => {
        setMeals(prev => ({
            ...prev,
            [mealKey]: { ...prev[mealKey], time }
        }));
    };

    const handleSaveClick = () => {
        const totalFoods = Object.values(meals).reduce((acc, meal) => acc + meal.foods.length, 0);
        if (totalFoods === 0) {
            alert('El plan debe tener al menos un alimento antes de guardar.');
            return;
        }
        setShowSaveModal(true);
    };

    const handleSaveConfirm = async (saveData) => {
        try {
            // Prepare meals data for backend
            const formattedMeals = {};
            Object.keys(meals).forEach(key => {
                formattedMeals[key] = {
                    time: meals[key].time,
                    foods: meals[key].foods.map(f => {
                        const potentialRef = f.foodRef || f.id;
                        // Basic ObjectId check: 24 hex characters
                        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(potentialRef);

                        return {
                            foodRef: isValidObjectId ? potentialRef : undefined,
                            item: f.name,
                            quantity: f.quantity || '1 serving',
                            calories: f.calories,
                            protein: f.protein,
                            carbohydrates: f.carbohydrates,
                            fats: f.fats
                        };
                    })
                };
            });

            if (saveData.type === 'template') {
                const templateData = {
                    name: saveData.name,
                    category: saveData.category,
                    targetCalories: Math.round(totals.calories),
                    clinicalProfile: {
                        excludedAllergens: clinicalFilters.excludedAllergens,
                        suitableFor: clinicalFilters.pathologyAdaptations,
                        maxSodium: clinicalFilters.maxSodium,
                        maxGlycemicIndex: clinicalFilters.maxGlycemicIndex
                    },
                    defaultMeals: formattedMeals,
                    isTemplate: true
                };
                await dietTemplatesAPI.create(templateData);
                alert('Plantilla guardada exitosamente');
            } else {
                const planData = {
                    name: saveData.name,
                    patient: saveData.patientId,
                    isTemplate: false,
                    meals: formattedMeals,
                    clinicalFilters: {
                        excludedAllergens: clinicalFilters.excludedAllergens,
                        pathologyAdaptations: clinicalFilters.pathologyAdaptations,
                        maxSodium: clinicalFilters.maxSodium,
                        maxGlycemicIndex: clinicalFilters.maxGlycemicIndex
                    },
                    templateCategory: 'custom',
                    nutrition: {
                        totalCalories: totals.calories,
                        protein: totals.protein,
                        carbohydrates: totals.carbs,
                        fats: totals.fats
                    }
                };

                await mealPlansAPI.create(planData);
                alert('Plan asignado al paciente exitosamente');
            }

            // Clear draft on successful save
            localStorage.removeItem('menuBuilder_draft');

            setShowSaveModal(false);
            navigate('/mealplans');

        } catch (error) {
            console.error('Error saving:', error);
            const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
            alert(`Error al guardar: ${errorMessage}`);
        }
    };


    if (loading) {
        return <div className="page-loading"><div className="spinner-large"></div></div>;
    }

    return (
        <div className="menu-builder-page fade-in">
            <div className="builder-header">
                <BackButton to="/mealplans" className="mr-2" />
                <div className="header-title">
                    <h1>Constructor</h1>
                    <p className="desktop-only text-xs">Arma tu plan profesional</p>
                </div>
                <div className="header-actions">
                    <button
                        className={`btn btn-sm ${showFilters ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setShowFilters(!showFilters)}
                        title="Filtros Clínicos"
                    >
                        <Filter size={16} />
                        <span className="btn-text">Filtros</span>
                    </button>
                    <button className="btn btn-sm btn-success" onClick={handleSaveClick} title="Guardar Plan">
                        <Save size={16} />
                        <span className="btn-text">Guardar</span>
                    </button>
                </div>
            </div>

            <DndContext
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                sensors={sensors}
            >
                <div className={`builder-layout active-view-${activeMobileView}`}>
                    {/* Left Panel: Food Search & Quick Meals */}
                    {activeMobileView === 'search' && (
                        <div className={`foods-panel active-mobile`}>
                            <div className="foods-panel-tabs">
                                <button
                                    className={`panel-tab ${activeSidebarTab === 'search' ? 'active' : ''}`}
                                    onClick={() => setActiveSidebarTab('search')}
                                >
                                    <Search size={16} /> <span className="tab-label">Buscador</span>
                                </button>
                                <button
                                    className={`panel-tab ${activeSidebarTab === 'quick_meals' ? 'active' : ''}`}
                                    onClick={() => setActiveSidebarTab('quick_meals')}
                                >
                                    <div className="icon-meal">🍵</div> <span className="tab-label">Comidas</span>
                                </button>
                            </div>

                            {activeSidebarTab === 'search' ? (
                                <>
                                    <div className="search-bar">
                                        <Search size={18} />
                                        <input
                                            type="text"
                                            placeholder="Buscar..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>

                                    <div className="foods-list">
                                        {searchResults.map(food => (
                                            <DraggableFoodItem key={food.id} food={food} />
                                        ))}
                                        {searchTerm && searchResults.length === 0 && (
                                            <div className="no-results">Sin resultados</div>
                                        )}
                                        {!searchTerm && searchResults.length === 0 && (
                                            <div className="search-hint">Busca alimentos...</div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="foods-list">
                                    {PREPARED_MEALS.map(meal => (
                                        <DraggableFoodItem key={meal.id} food={meal} isMeal={true} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Center Panel: Meal Slots */}
                    {activeMobileView === 'plan' && (
                        <div className={`meals-panel active-mobile`}>
                            {Object.entries(meals).map(([key, meal]) => (
                                <MealSlot
                                    key={key}
                                    mealType={key}
                                    mealLabel={meal.label}
                                    time={meal.time}
                                    foods={meal.foods}
                                    onTimeChange={handleTimeChange}
                                    onRemoveFood={handleRemoveFood}
                                    onExchangeFood={handleExchangeClick}
                                    onUpdateFood={handleUpdateFood}
                                    suggestion={generateMenuSuggestion(meal.foods)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Right Panel: Summary */}
                    {activeMobileView === 'summary' && (
                        <div className={`summary-panel active-mobile`}>
                            {showFilters && (
                                <div className="filters-container-mobile card mb-4">
                                    <ClinicalFilters
                                        filters={clinicalFilters}
                                        onChange={setClinicalFilters}
                                    />
                                </div>
                            )}

                            <div className="nutrition-summary card">
                                <h3>Resumen Diario</h3>
                                <div className="summary-stat">
                                    <span className="label">Calorías Totales</span>
                                    <span className="value large">{Math.round(totals.calories)}</span>
                                    <span className="unit">kcal</span>
                                </div>

                                <div className="macro-bars">
                                    <div className="macro-item">
                                        <div className="macro-header">
                                            <span>Proteínas</span>
                                            <span>{Math.round(totals.protein)}g</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill protein"
                                                style={{ width: `${totals.calories > 0 ? Math.min((totals.protein * 4 / totals.calories) * 100, 100) : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="macro-item">
                                        <div className="macro-header">
                                            <span>Carbohidratos</span>
                                            <span>{Math.round(totals.carbs)}g</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill carbs"
                                                style={{ width: `${totals.calories > 0 ? Math.min((totals.carbs * 4 / totals.calories) * 100, 100) : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="macro-item">
                                        <div className="macro-header">
                                            <span>Grasas</span>
                                            <span>{Math.round(totals.fats)}g</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill fats"
                                                style={{ width: `${totals.calories > 0 ? Math.min((totals.fats * 9 / totals.calories) * 100, 100) : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Navigation */}
                <div className="mobile-builder-nav">
                    <button
                        className={`nav-item ${activeMobileView === 'search' ? 'active' : ''}`}
                        onClick={() => setActiveMobileView('search')}
                    >
                        <Search size={22} />
                        <span>Buscador</span>
                    </button>
                    <button
                        className={`nav-item ${activeMobileView === 'plan' ? 'active' : ''}`}
                        onClick={() => setActiveMobileView('plan')}
                    >
                        <div className="nav-plan-icon">🍽️</div>
                        <span>Plan</span>
                    </button>
                    <button
                        className={`nav-item ${activeMobileView === 'summary' ? 'active' : ''}`}
                        onClick={() => setActiveMobileView('summary')}
                    >
                        <Filter size={22} />
                        <span>Resumen</span>
                    </button>
                </div>
                <DragOverlay>
                    {activeDragItem ? (
                        <div className={activeDragItem.id && activeDragItem.id.toString().startsWith('food-') ? "drag-preview-item" : "drag-preview"}>
                            {activeDragItem.name}
                            {activeDragItem.id && activeDragItem.id.toString().startsWith('food-') ? ` (${activeDragItem.calories} kcal)` : ''}
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {exchangeData && (
                <FoodExchangeModal
                    food={exchangeData}
                    patientFilters={clinicalFilters}
                    onExchange={handleExchangeComplete}
                    onClose={() => setExchangeData(null)}
                />
            )}

            {showSaveModal && (
                <SavePlanModal
                    onClose={() => setShowSaveModal(false)}
                    onSave={handleSaveConfirm}
                    totals={totals}
                />
            )}
        </div>
    );
};

export default MenuBuilder;
