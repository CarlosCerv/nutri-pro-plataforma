import MealPlan from '../models/MealPlan.js';
import Patient from '../models/Patient.js';

// @desc    Get all meal plans for logged-in nutritionist
// @route   GET /api/mealplans
// @access  Private
export const getMealPlans = async (req, res) => {
    try {
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
    } catch (error) {
        console.error('Get meal plans error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching meal plans',
            error: error.message,
        });
    }
};

// @desc    Get single meal plan
// @route   GET /api/mealplans/:id
// @access  Private
export const getMealPlan = async (req, res) => {
    try {
        const mealPlan = await MealPlan.findById(req.params.id)
            .populate('patient', 'firstName lastName');

        if (!mealPlan) {
            return res.status(404).json({
                success: false,
                message: 'Meal plan not found',
            });
        }

        // Make sure user owns this meal plan
        if (mealPlan.nutritionist.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this meal plan',
            });
        }

        res.status(200).json({
            success: true,
            data: mealPlan,
        });
    } catch (error) {
        console.error('Get meal plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching meal plan',
            error: error.message,
        });
    }
};

// @desc    Create new meal plan
// @route   POST /api/mealplans
// @access  Private
export const createMealPlan = async (req, res) => {
    try {
        // If patient is specified, verify they belong to this nutritionist
        if (req.body.patient) {
            const patient = await Patient.findById(req.body.patient);

            if (!patient) {
                return res.status(404).json({
                    success: false,
                    message: 'Patient not found',
                });
            }

            if (patient.nutritionist.toString() !== req.user.id) {
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
    } catch (error) {
        console.error('Create meal plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating meal plan',
            error: error.message,
        });
    }
};

// @desc    Update meal plan
// @route   PUT /api/mealplans/:id
// @access  Private
export const updateMealPlan = async (req, res) => {
    try {
        let mealPlan = await MealPlan.findById(req.params.id);

        if (!mealPlan) {
            return res.status(404).json({
                success: false,
                message: 'Meal plan not found',
            });
        }

        // Make sure user owns this meal plan
        if (mealPlan.nutritionist.toString() !== req.user.id) {
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
    } catch (error) {
        console.error('Update meal plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating meal plan',
            error: error.message,
        });
    }
};

// @desc    Delete meal plan
// @route   DELETE /api/mealplans/:id
// @access  Private
export const deleteMealPlan = async (req, res) => {
    try {
        const mealPlan = await MealPlan.findById(req.params.id);

        if (!mealPlan) {
            return res.status(404).json({
                success: false,
                message: 'Meal plan not found',
            });
        }

        // Make sure user owns this meal plan
        if (mealPlan.nutritionist.toString() !== req.user.id) {
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
    } catch (error) {
        console.error('Delete meal plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting meal plan',
            error: error.message,
        });
    }
};
