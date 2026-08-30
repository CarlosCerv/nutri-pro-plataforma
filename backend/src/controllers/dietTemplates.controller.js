import DietTemplate from '../models/DietTemplate.js';
import MealPlan from '../models/MealPlan.js';
import Patient from '../models/Patient.js';
import asyncHandler from '../utils/asyncHandler.js';
import isOwnedBy from '../utils/ownership.js';

// @desc    Get all diet templates
// @route   GET /api/diet-templates
// @access  Private
export const getAll = asyncHandler(async (req, res) => {
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
}, { message: 'Error al obtener plantillas' });

// @desc    Get single diet template
// @route   GET /api/diet-templates/:id
// @access  Private
export const getOne = asyncHandler(async (req, res) => {
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
}, { message: 'Error al obtener plantilla' });

// @desc    Create new diet template
// @route   POST /api/diet-templates
// @access  Private
export const create = asyncHandler(async (req, res) => {
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
}, { message: 'Error al crear plantilla' });

// @desc    Update diet template
// @route   PUT /api/diet-templates/:id
// @access  Private
export const update = asyncHandler(async (req, res) => {
    const template = await DietTemplate.findById(req.params.id);

    if (!template) {
        return res.status(404).json({
            success: false,
            message: 'Plantilla no encontrada',
        });
    }

    // Prevent modifying system templates
    if (template.isSystemTemplate) {
        return res.status(403).json({
            success: false,
            message: 'No se pueden modificar plantillas del sistema',
        });
    }

    // Only allow updating own templates
    if (!isOwnedBy(template, req.user.id, 'createdBy')) {
        return res.status(403).json({
            success: false,
            message: 'No autorizado para modificar esta plantilla',
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
}, { message: 'Error al actualizar plantilla' });

// @desc    Delete diet template
// @route   DELETE /api/diet-templates/:id
// @access  Private
export const deleteTemplate = asyncHandler(async (req, res) => {
    const template = await DietTemplate.findById(req.params.id);

    if (!template) {
        return res.status(404).json({
            success: false,
            message: 'Plantilla no encontrada',
        });
    }

    // Prevent deleting system templates
    if (template.isSystemTemplate) {
        return res.status(403).json({
            success: false,
            message: 'No se pueden eliminar plantillas del sistema',
        });
    }

    // Only allow deleting own templates
    if (!isOwnedBy(template, req.user.id, 'createdBy')) {
        return res.status(403).json({
            success: false,
            message: 'No autorizado para eliminar esta plantilla',
        });
    }

    await template.deleteOne();

    res.json({
        success: true,
        message: 'Plantilla eliminada exitosamente',
    });
}, { message: 'Error al eliminar plantilla' });

// @desc    Apply template to patient (create meal plan from template)
// @route   POST /api/diet-templates/:id/apply
// @access  Private
export const applyToPatient = asyncHandler(async (req, res) => {
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

        if (!isOwnedBy(patient, req.user.id)) {
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
}, { message: 'Error al aplicar plantilla' });

// @desc    Get template categories
// @route   GET /api/diet-templates/categories
// @access  Private
export const getCategories = asyncHandler(async (req, res) => {
    const categories = [
        { value: 'mediterranean', label: 'Dieta Mediterránea' },
        { value: 'diabetic', label: 'Para Diabéticos' },
        { value: 'hypertensive', label: 'Para Hipertensos' },
        { value: 'weight-loss', label: 'Pérdida de Peso' },
        { value: 'weight-gain', label: 'Ganancia de Peso' },
        { value: 'vegetarian', label: 'Vegetariana' },
        { value: 'vegan', label: 'Vegana' },
        { value: 'low-carb', label: 'Baja en Carbohidratos' },
        { value: 'high-protein', label: 'Alta en Proteína' },
        { value: 'custom', label: 'Personalizada' },
    ];

    res.json({
        success: true,
        data: categories,
    });
}, { message: 'Error al obtener categorías' });
