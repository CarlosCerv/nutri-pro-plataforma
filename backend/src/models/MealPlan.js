import mongoose from 'mongoose';

const mealPlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide meal plan name'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    nutritionist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // Optional: assign to specific patient
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
    },
    isTemplate: {
        type: Boolean,
        default: true, // true for templates, false for patient-specific plans
    },

    // Template category for quick identification
    templateCategory: {
        type: String,
        enum: ['mediterranean', 'diabetic', 'hypertensive', 'weight-loss', 'weight-gain', 'vegetarian', 'vegan', 'low-carb', 'high-protein', 'custom', ''],
        default: 'custom',
    },

    // Clinical filters applied to this plan
    clinicalFilters: {
        excludedAllergens: [{
            type: String,
            enum: ['gluten', 'lactose', 'nuts', 'soy', 'eggs', 'fish', 'shellfish', 'peanuts']
        }],
        pathologyAdaptations: [{
            type: String,
            enum: ['diabetic', 'hypertensive', 'celiac', 'lactose-intolerant', 'low-sodium', 'low-fat', 'low-glycemic', 'renal', 'cardiac']
        }],
        intolerances: [{ type: String }],
        maxSodium: { type: Number }, // mg per day
        maxGlycemicIndex: { type: Number }, // max GI value
    },

    // Reference to base template if created from one
    baseTemplate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MealPlan',
    },

    // Meal structure - enhanced to support both legacy string format and Food references
    meals: {
        breakfast: {
            time: String,
            foods: [{
                // Support both legacy string format and new Food reference
                item: String, // Legacy: food name as string
                foodRef: { // New: reference to Food document
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Food'
                },
                quantity: String,
                quantityGrams: Number,
                calories: Number,
                protein: Number,
                carbohydrates: Number,
                fats: Number,
            }],
            notes: String,
        },
        morningSnack: {
            time: String,
            foods: [{
                item: String,
                foodRef: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Food'
                },
                quantity: String,
                quantityGrams: Number,
                calories: Number,
                protein: Number,
                carbohydrates: Number,
                fats: Number,
            }],
            notes: String,
        },
        lunch: {
            time: String,
            foods: [{
                item: String,
                foodRef: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Food'
                },
                quantity: String,
                quantityGrams: Number,
                calories: Number,
                protein: Number,
                carbohydrates: Number,
                fats: Number,
            }],
            notes: String,
        },
        afternoonSnack: {
            time: String,
            foods: [{
                item: String,
                foodRef: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Food'
                },
                quantity: String,
                quantityGrams: Number,
                calories: Number,
                protein: Number,
                carbohydrates: Number,
                fats: Number,
            }],
            notes: String,
        },
        dinner: {
            time: String,
            foods: [{
                item: String,
                foodRef: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Food'
                },
                quantity: String,
                quantityGrams: Number,
                calories: Number,
                protein: Number,
                carbohydrates: Number,
                fats: Number,
            }],
            notes: String,
        },
        eveningSnack: {
            time: String,
            foods: [{
                item: String,
                foodRef: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Food'
                },
                quantity: String,
                quantityGrams: Number,
                calories: Number,
                protein: Number,
                carbohydrates: Number,
                fats: Number,
            }],
            notes: String,
        },
    },

    // Nutritional information
    nutrition: {
        totalCalories: { type: Number },
        protein: { type: Number }, // grams
        carbohydrates: { type: Number }, // grams
        fats: { type: Number }, // grams
        fiber: { type: Number }, // grams
    },

    // Additional info
    duration: {
        type: String, // "1 week", "2 weeks", etc.
    },
    tags: [{ type: String }], // "vegetarian", "low-carb", "high-protein", etc.

    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Update the updatedAt timestamp before saving
mealPlanSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const MealPlan = mongoose.model('MealPlan', mealPlanSchema);

export default MealPlan;
