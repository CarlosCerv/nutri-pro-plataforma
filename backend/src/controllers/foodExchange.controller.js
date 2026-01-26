import Food from '../models/Food.js';

// @desc    Get nutritionally equivalent foods
// @route   POST /api/food-exchange/equivalents
// @access  Private
export const getEquivalents = async (req, res) => {
    try {
        const { foodId, patientFilters } = req.body;

        // Get the original food
        const originalFood = await Food.findById(foodId);

        if (!originalFood) {
            return res.status(404).json({
                success: false,
                message: 'Alimento no encontrado',
            });
        }

        // Define tolerance ranges for equivalence
        const CALORIE_TOLERANCE = 0.10; // ±10%
        const MACRO_TOLERANCE = 0.15; // ±15%

        const targetCalories = originalFood.nutrition.energy;
        const targetProtein = originalFood.nutrition.protein;
        const targetCarbs = originalFood.nutrition.carbohydrates;
        const targetFats = originalFood.nutrition.fat;

        // Build query for equivalent foods
        const query = {
            _id: { $ne: foodId }, // Exclude the original food
            'nutrition.energy': {
                $gte: targetCalories * (1 - CALORIE_TOLERANCE),
                $lte: targetCalories * (1 + CALORIE_TOLERANCE),
            },
        };

        // Apply patient-specific filters if provided
        if (patientFilters) {
            // Exclude allergens
            if (patientFilters.excludedAllergens && patientFilters.excludedAllergens.length > 0) {
                query.allergens = { $nin: patientFilters.excludedAllergens };
            }

            // Filter by pathology adaptations
            if (patientFilters.pathologyAdaptations && patientFilters.pathologyAdaptations.length > 0) {
                query.suitableFor = { $in: patientFilters.pathologyAdaptations };
            }

            // Max sodium filter
            if (patientFilters.maxSodium) {
                query['nutrition.sodium'] = { $lte: patientFilters.maxSodium };
            }

            // Max glycemic index filter
            if (patientFilters.maxGlycemicIndex) {
                query.glycemicIndex = { $lte: patientFilters.maxGlycemicIndex };
            }
        }

        // Find potential equivalents
        let equivalents = await Food.find(query).limit(20);

        // Calculate similarity scores and filter by macros
        equivalents = equivalents.map(food => {
            // Calculate macro differences
            const proteinDiff = Math.abs(food.nutrition.protein - targetProtein) / targetProtein;
            const carbsDiff = Math.abs(food.nutrition.carbohydrates - targetCarbs) / (targetCarbs || 1);
            const fatsDiff = Math.abs(food.nutrition.fat - targetFats) / (targetFats || 1);

            // Calculate overall similarity score (0-100, higher is better)
            const calorieSimilarity = 100 * (1 - Math.abs(food.nutrition.energy - targetCalories) / targetCalories);
            const macroSimilarity = 100 * (1 - (proteinDiff + carbsDiff + fatsDiff) / 3);
            const categorySimilarity = food.category === originalFood.category ? 100 : 50;

            const overallScore = (calorieSimilarity * 0.4 + macroSimilarity * 0.4 + categorySimilarity * 0.2);

            return {
                food,
                score: overallScore,
                differences: {
                    calories: food.nutrition.energy - targetCalories,
                    protein: food.nutrition.protein - targetProtein,
                    carbohydrates: food.nutrition.carbohydrates - targetCarbs,
                    fats: food.nutrition.fat - targetFats,
                },
                macroMatch: proteinDiff <= MACRO_TOLERANCE && carbsDiff <= MACRO_TOLERANCE && fatsDiff <= MACRO_TOLERANCE,
            };
        });

        // Filter by macro tolerance and sort by score
        equivalents = equivalents
            .filter(item => item.macroMatch)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10); // Return top 10 matches

        res.json({
            success: true,
            originalFood: {
                id: originalFood._id,
                name: originalFood.name,
                category: originalFood.category,
                nutrition: originalFood.nutrition,
            },
            equivalents: equivalents.map(item => ({
                id: item.food._id,
                name: item.food.name,
                category: item.food.category,
                nutrition: item.food.nutrition,
                score: Math.round(item.score),
                differences: item.differences,
                suitableFor: item.food.suitableFor,
                allergens: item.food.allergens,
            })),
            count: equivalents.length,
        });
    } catch (error) {
        console.error('Error finding food equivalents:', error);
        res.status(500).json({
            success: false,
            message: 'Error al buscar alimentos equivalentes',
            error: error.message,
        });
    }
};

// @desc    Get exchange suggestions by category
// @route   GET /api/food-exchange/by-category/:category
// @access  Private
export const getByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { excludeAllergens, suitableFor, limit = 20 } = req.query;

        const query = { category };

        // Apply filters
        if (excludeAllergens) {
            const allergens = excludeAllergens.split(',');
            query.allergens = { $nin: allergens };
        }

        if (suitableFor) {
            const conditions = suitableFor.split(',');
            query.suitableFor = { $in: conditions };
        }

        const foods = await Food.find(query)
            .sort({ verified: -1, name: 1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            category,
            count: foods.length,
            data: foods,
        });
    } catch (error) {
        console.error('Error fetching foods by category:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener alimentos por categoría',
            error: error.message,
        });
    }
};

// @desc    Batch exchange - find equivalents for multiple foods
// @route   POST /api/food-exchange/batch
// @access  Private
export const batchExchange = async (req, res) => {
    try {
        const { foodIds, patientFilters } = req.body;

        if (!foodIds || !Array.isArray(foodIds) || foodIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere un array de IDs de alimentos',
            });
        }

        const results = [];

        for (const foodId of foodIds) {
            try {
                const originalFood = await Food.findById(foodId);

                if (!originalFood) {
                    results.push({
                        foodId,
                        success: false,
                        message: 'Alimento no encontrado',
                    });
                    continue;
                }

                // Use the same logic as getEquivalents
                const CALORIE_TOLERANCE = 0.10;
                const MACRO_TOLERANCE = 0.15;

                const targetCalories = originalFood.nutrition.energy;
                const targetProtein = originalFood.nutrition.protein;
                const targetCarbs = originalFood.nutrition.carbohydrates;
                const targetFats = originalFood.nutrition.fat;

                const query = {
                    _id: { $ne: foodId },
                    'nutrition.energy': {
                        $gte: targetCalories * (1 - CALORIE_TOLERANCE),
                        $lte: targetCalories * (1 + CALORIE_TOLERANCE),
                    },
                };

                if (patientFilters?.excludedAllergens?.length > 0) {
                    query.allergens = { $nin: patientFilters.excludedAllergens };
                }

                let equivalents = await Food.find(query).limit(5);

                equivalents = equivalents
                    .map(food => {
                        const proteinDiff = Math.abs(food.nutrition.protein - targetProtein) / targetProtein;
                        const carbsDiff = Math.abs(food.nutrition.carbohydrates - targetCarbs) / (targetCarbs || 1);
                        const fatsDiff = Math.abs(food.nutrition.fat - targetFats) / (targetFats || 1);

                        const macroMatch = proteinDiff <= MACRO_TOLERANCE && carbsDiff <= MACRO_TOLERANCE && fatsDiff <= MACRO_TOLERANCE;

                        return { food, macroMatch };
                    })
                    .filter(item => item.macroMatch)
                    .slice(0, 3);

                results.push({
                    foodId,
                    success: true,
                    originalFood: {
                        id: originalFood._id,
                        name: originalFood.name,
                    },
                    equivalents: equivalents.map(item => ({
                        id: item.food._id,
                        name: item.food.name,
                        category: item.food.category,
                    })),
                });
            } catch (error) {
                results.push({
                    foodId,
                    success: false,
                    message: error.message,
                });
            }
        }

        res.json({
            success: true,
            results,
        });
    } catch (error) {
        console.error('Error in batch exchange:', error);
        res.status(500).json({
            success: false,
            message: 'Error en intercambio por lote',
            error: error.message,
        });
    }
};
