import Food from '../models/Food.js';
import asyncHandler from '../utils/asyncHandler.js';

// Escapa caracteres especiales de regex antes de usar un query param
// dentro de un $regex — sin esto, un valor como "(a+)+" llega directo a
// MongoDB y puede causar backtracking catastrofico (ReDoS).
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Get all foods with optional filters
export const getAll = asyncHandler(async (req, res) => {
    const {
        category,
        search,
        suitableFor,
        excludeAllergens,
        verified,
        page = 1,
        limit = 50
    } = req.query;

    const query = {};

    // Category filter
    if (category) {
        query.category = category;
    }

    // Verified filter
    if (verified !== undefined) {
        query.verified = verified === 'true';
    }

    // Suitable for filter (vegan, diabetic, etc.)
    if (suitableFor) {
        query.suitableFor = { $in: suitableFor.split(',') };
    }

    // Exclude allergens
    if (excludeAllergens) {
        const allergens = excludeAllergens.split(',');
        query.allergens = { $nin: allergens };
    }

    // Text search - using regex for partial, case-insensitive matches
    if (search) {
        query.name = { $regex: escapeRegex(search), $options: 'i' };
    }

    const foods = await Food.find(query)
        .sort({ name: 1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Food.countDocuments(query);

    res.json({
        success: true,
        data: foods,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    });
}, { message: 'Error al obtener alimentos' });

// Get single food
export const getOne = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const food = await Food.findById(id);

    if (!food) {
        return res.status(404).json({
            success: false,
            message: 'Alimento no encontrado'
        });
    }

    res.json({
        success: true,
        data: food
    });
}, { message: 'Error al obtener alimento' });

// Create new food (admin/nutritionist)
export const create = asyncHandler(async (req, res) => {
    const food = new Food({
        ...req.body,
        addedBy: req.user._id
    });

    await food.save();

    res.status(201).json({
        success: true,
        data: food
    });
}, { message: 'Error al crear alimento' });

// Update food
export const update = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const food = await Food.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!food) {
        return res.status(404).json({
            success: false,
            message: 'Alimento no encontrado'
        });
    }

    res.json({
        success: true,
        data: food
    });
}, { message: 'Error al actualizar alimento' });

// Delete food
export const deleteFood = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const food = await Food.findByIdAndDelete(id);

    if (!food) {
        return res.status(404).json({
            success: false,
            message: 'Alimento no encontrado'
        });
    }

    res.json({
        success: true,
        message: 'Alimento eliminado exitosamente'
    });
}, { message: 'Error al eliminar alimento' });

// Get food categories
export const getCategories = asyncHandler(async (req, res) => {
    const categories = await Food.distinct('category');

    res.json({
        success: true,
        data: categories
    });
}, { message: 'Error al obtener categorías' });
