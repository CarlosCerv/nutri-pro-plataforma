import DietTemplate from '../models/DietTemplate.js';
import MealPlan from '../models/MealPlan.js';
import Patient from '../models/Patient.js';

// @desc    Get all diet templates
// @route   GET /api/diet-templates
// @access  Private
export const getAll = async (req, res) => {
    try {
        const { category, search, isSystemTemplate } = req.query;

        const query = {};

        // Filter by category
        if (category) {
            query.category = category;
        }

        // Filter by system vs user templates
        if (isSystemTemplate !== undefined) {
            query.isSystemTemplate = isSystemTemplate === 'true';
        } else {
            // By default, show system templates and user's own templates
            query.$or = [
                { isSystemTemplate: true },
                { createdBy: req.user.id }
            ];
        }

        // Text search
        if (search) {
            query.$text = { $search: search };
        }

        const templates = await DietTemplate.find(query)
            .populate('createdBy', 'name email')
            .populate('defaultMeals.breakfast.foods.foodRef', 'name category')
            .populate('defaultMeals.morningSnack.foods.foodRef', 'name category')
            .populate('defaultMeals.lunch.foods.foodRef', 'name category')
            .populate('defaultMeals.afternoonSnack.foods.foodRef', 'name category')
            .populate('defaultMeals.dinner.foods.foodRef', 'name category')
            .populate('defaultMeals.eveningSnack.foods.foodRef', 'name category')
            .sort(search ? { score: { $meta: 'textScore' } } : { usageCount: -1, createdAt: -1 });

        res.json({
            success: true,
            count: templates.length,
            data: templates,
        });
    } catch (error) {
        console.error('Error fetching diet templates:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener plantillas',
            error: error.message,
        });
    }
};

// @desc    Get single diet template
// @route   GET /api/diet-templates/:id
// @access  Private
export const getOne = async (req, res) => {
    try {
        const template = await DietTemplate.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('defaultMeals.breakfast.foods.foodRef')
            .populate('defaultMeals.morningSnack.foods.foodRef')
            .populate('defaultMeals.lunch.foods.foodRef')
            .populate('defaultMeals.afternoonSnack.foods.foodRef')
            .populate('defaultMeals.dinner.foods.foodRef')
            .populate('defaultMeals.eveningSnack.foods.foodRef');

        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Plantilla no encontrada',
            });
        }

        res.json({
            success: true,
            data: template,
        });
    } catch (error) {
        console.error('Error fetching diet template:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener plantilla',
            error: error.message,
        });
    }
};

// @desc    Create new diet template
// @route   POST /api/diet-templates
// @access  Private
export const create = async (req, res) => {
    try {
        const template = new DietTemplate({
            ...req.body,
            createdBy: req.user.id,
            isSystemTemplate: false, // User-created templates are never system templates
        });

        await template.save();

        res.status(201).json({
            success: true,
            message: 'Plantilla creada exitosamente',
            data: template,
        });
    } catch (error) {
        console.error('Error creating diet template:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear plantilla',
            error: error.message,
        });
    }
};

// @desc    Update diet template
// @route   PUT /api/diet-templates/:id
// @access  Private
export const update = async (req, res) => {
    try {
        const template = await DietTemplate.findById(req.params.id);

        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Plantilla no encontrada',
            });
        }

        // Only allow updating own templates or if admin
        if (template.createdBy.toString() !== req.user.id && !template.isSystemTemplate) {
            return res.status(403).json({
                success: false,
                message: 'No autorizado para modificar esta plantilla',
            });
        }

        // Prevent modifying system templates
        if (template.isSystemTemplate) {
            return res.status(403).json({
                success: false,
                message: 'No se pueden modificar plantillas del sistema',
            });
        }

        const updatedTemplate = await DietTemplate.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Plantilla actualizada exitosamente',
            data: updatedTemplate,
        });
    } catch (error) {
        console.error('Error updating diet template:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar plantilla',
            error: error.message,
        });
    }
};

// @desc    Delete diet template
// @route   DELETE /api/diet-templates/:id
// @access  Private
export const deleteTemplate = async (req, res) => {
    try {
        const template = await DietTemplate.findById(req.params.id);

        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Plantilla no encontrada',
            });
        }

        // Only allow deleting own templates
        if (template.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'No autorizado para eliminar esta plantilla',
            });
        }

        // Prevent deleting system templates
        if (template.isSystemTemplate) {
            return res.status(403).json({
                success: false,
                message: 'No se pueden eliminar plantillas del sistema',
            });
        }

        await template.deleteOne();

        res.json({
            success: true,
            message: 'Plantilla eliminada exitosamente',
        });
    } catch (error) {
        console.error('Error deleting diet template:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar plantilla',
            error: error.message,
        });
    }
};

// @desc    Apply template to patient (create meal plan from template)
// @route   POST /api/diet-templates/:id/apply
// @access  Private
export const applyToPatient = async (req, res) => {
    try {
        const { patientId, customizations } = req.body;

        // Get template
        const template = await DietTemplate.findById(req.params.id)
            .populate('defaultMeals.breakfast.foods.foodRef')
            .populate('defaultMeals.morningSnack.foods.foodRef')
            .populate('defaultMeals.lunch.foods.foodRef')
            .populate('defaultMeals.afternoonSnack.foods.foodRef')
            .populate('defaultMeals.dinner.foods.foodRef')
            .populate('defaultMeals.eveningSnack.foods.foodRef');

        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Plantilla no encontrada',
            });
        }

        // Verify patient belongs to nutritionist
        let patient = null;
        if (patientId) {
            patient = await Patient.findById(patientId);

            if (!patient) {
                return res.status(404).json({
                    success: false,
                    message: 'Paciente no encontrado',
                });
            }

            if (patient.nutritionist.toString() !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'No autorizado para este paciente',
                });
            }
        }

        // Create meal plan from template
        const mealPlanData = {
            name: customizations?.name || `${template.name} - ${patient ? patient.firstName : 'Plan'}`,
            description: customizations?.description || template.description,
            nutritionist: req.user.id,
            patient: patientId || null,
            isTemplate: !patientId, // If no patient, it's a template
            templateCategory: template.category,
            baseTemplate: template._id,
            meals: template.defaultMeals,
            nutrition: {
                totalCalories: template.targetCalories,
                protein: template.targetMacros?.protein,
                carbohydrates: template.targetMacros?.carbohydrates,
                fats: template.targetMacros?.fats,
            },
            tags: template.tags,
        };

        // Apply patient-specific clinical filters if patient exists
        if (patient) {
            mealPlanData.clinicalFilters = {
                excludedAllergens: patient.medicalHistory?.allergies || [],
                pathologyAdaptations: patient.medicalHistory?.conditions || [],
                intolerances: [],
            };
        } else {
            // Use template's clinical profile
            mealPlanData.clinicalFilters = {
                excludedAllergens: template.clinicalProfile?.excludedAllergens || [],
                pathologyAdaptations: template.clinicalProfile?.suitableFor || [],
                intolerances: [],
                maxSodium: template.clinicalProfile?.maxSodium,
                maxGlycemicIndex: template.clinicalProfile?.maxGlycemicIndex,
            };
        }

        const mealPlan = await MealPlan.create(mealPlanData);

        // Increment template usage count
        template.usageCount += 1;
        await template.save();

        res.status(201).json({
            success: true,
            message: 'Plan creado desde plantilla exitosamente',
            data: mealPlan,
        });
    } catch (error) {
        console.error('Error applying template:', error);
        res.status(500).json({
            success: false,
            message: 'Error al aplicar plantilla',
            error: error.message,
        });
    }
};

// @desc    Get template categories
// @route   GET /api/diet-templates/categories
// @access  Private
export const getCategories = async (req, res) => {
    try {
        const categories = [
            { value: 'mediterranean', label: 'Dieta Mediterránea', icon: '🫒' },
            { value: 'diabetic', label: 'Para Diabéticos', icon: '🩺' },
            { value: 'hypertensive', label: 'Para Hipertensos', icon: '❤️' },
            { value: 'weight-loss', label: 'Pérdida de Peso', icon: '⚖️' },
            { value: 'weight-gain', label: 'Ganancia de Peso', icon: '💪' },
            { value: 'vegetarian', label: 'Vegetariana', icon: '🥗' },
            { value: 'vegan', label: 'Vegana', icon: '🌱' },
            { value: 'low-carb', label: 'Baja en Carbohidratos', icon: '🥑' },
            { value: 'high-protein', label: 'Alta en Proteína', icon: '🍗' },
            { value: 'custom', label: 'Personalizada', icon: '⚙️' },
        ];

        res.json({
            success: true,
            data: categories,
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener categorías',
            error: error.message,
        });
    }
};
