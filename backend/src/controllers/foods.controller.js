import Food from '../models/Food.js';

// Get all foods with optional filters
export const getAll = async (req, res) => {
    try {
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
            query.name = { $regex: search, $options: 'i' };
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
    } catch (error) {
        console.error('Error fetching foods:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener alimentos',
            error: error.message
        });
    }
};

// Get single food
export const getOne = async (req, res) => {
    try {
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
    } catch (error) {
        console.error('Error fetching food:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener alimento',
            error: error.message
        });
    }
};

// Create new food (admin/nutritionist)
export const create = async (req, res) => {
    try {
        const food = new Food({
            ...req.body,
            addedBy: req.user._id
        });

        await food.save();

        res.status(201).json({
            success: true,
            data: food
        });
    } catch (error) {
        console.error('Error creating food:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear alimento',
            error: error.message
        });
    }
};

// Update food
export const update = async (req, res) => {
    try {
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
    } catch (error) {
        console.error('Error updating food:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar alimento',
            error: error.message
        });
    }
};

// Delete food
export const deleteFood = async (req, res) => {
    try {
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
    } catch (error) {
        console.error('Error deleting food:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar alimento',
            error: error.message
        });
    }
};

// Get food categories
export const getCategories = async (req, res) => {
    try {
        const categories = await Food.distinct('category');

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener categorías',
            error: error.message
        });
    }
};
