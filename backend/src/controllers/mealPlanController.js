import MealPlan from '../models/MealPlan.js';
import Patient from '../models/Patient.js';
import asyncHandler from '../utils/asyncHandler.js';
import isOwnedBy from '../utils/ownership.js';

// @desc    Get all meal plans for logged-in nutritionist
// @route   GET /api/mealplans
// @access  Private
export const getMealPlans = asyncHandler(async (req, res) => {
    const { isTemplate, patientId } = req.query;

    let query = { nutritionist: req.user.id };

    // Filter by template status if provided
    if (isTemplate !== undefined) {
        query.isTemplate = isTemplate === 'true';
    }

    // Filter by patient if provided
    if (patientId) {
        query.patient = patientId;
    }

    const mealPlans = await MealPlan.find(query)
        .populate('patient', 'firstName lastName')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: mealPlans.length,
        data: mealPlans,
    });
}, { message: 'Error fetching meal plans' });

// @desc    Get single meal plan
// @route   GET /api/mealplans/:id
// @access  Private
export const getMealPlan = asyncHandler(async (req, res) => {
    const mealPlan = await MealPlan.findById(req.params.id)
        .populate('patient', 'firstName lastName');

    if (!mealPlan) {
        return res.status(404).json({
            success: false,
            message: 'Meal plan not found',
        });
    }

    // Make sure user owns this meal plan
    if (!isOwnedBy(mealPlan, req.user.id)) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to access this meal plan',
        });
    }

    res.status(200).json({
        success: true,
        data: mealPlan,
    });
}, { message: 'Error fetching meal plan' });

// @desc    Create new meal plan
// @route   POST /api/mealplans
// @access  Private
export const createMealPlan = asyncHandler(async (req, res) => {
    // If patient is specified, verify they belong to this nutritionist
    if (req.body.patient) {
        const patient = await Patient.findById(req.body.patient);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found',
            });
        }

        if (!isOwnedBy(patient, req.user.id)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to create meal plan for this patient',
            });
        }

        // If assigned to patient, it's not a template
        req.body.isTemplate = false;
    }

    // Add nutritionist to request body
    req.body.nutritionist = req.user.id;

    const mealPlan = await MealPlan.create(req.body);

    // Populate patient data if exists
    await mealPlan.populate('patient', 'firstName lastName');

    res.status(201).json({
        success: true,
        message: 'Meal plan created successfully',
        data: mealPlan,
    });
}, { message: 'Error creating meal plan' });

// @desc    Update meal plan
// @route   PUT /api/mealplans/:id
// @access  Private
export const updateMealPlan = asyncHandler(async (req, res) => {
    let mealPlan = await MealPlan.findById(req.params.id);

    if (!mealPlan) {
        return res.status(404).json({
            success: false,
            message: 'Meal plan not found',
        });
    }

    // Make sure user owns this meal plan
    if (!isOwnedBy(mealPlan, req.user.id)) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update this meal plan',
        });
    }

    mealPlan = await MealPlan.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    }).populate('patient', 'firstName lastName');

    res.status(200).json({
        success: true,
        message: 'Meal plan updated successfully',
        data: mealPlan,
    });
}, { message: 'Error updating meal plan' });

// @desc    Delete meal plan
// @route   DELETE /api/mealplans/:id
// @access  Private
export const deleteMealPlan = asyncHandler(async (req, res) => {
    const mealPlan = await MealPlan.findById(req.params.id);

    if (!mealPlan) {
        return res.status(404).json({
            success: false,
            message: 'Meal plan not found',
        });
    }

    // Make sure user owns this meal plan
    if (!isOwnedBy(mealPlan, req.user.id)) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to delete this meal plan',
        });
    }

    await mealPlan.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Meal plan deleted successfully',
        data: {},
    });
}, { message: 'Error deleting meal plan' });
