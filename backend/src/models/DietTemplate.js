import mongoose from 'mongoose';

const dietTemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide template name'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    category: {
        type: String,
        enum: ['mediterranean', 'diabetic', 'hypertensive', 'weight-loss', 'weight-gain', 'vegetarian', 'vegan', 'low-carb', 'high-protein', 'custom'],
        required: true,
    },

    // Target nutritional goals
    targetCalories: {
        type: Number,
        required: true,
    },
    targetMacros: {
        protein: { type: Number }, // grams
        carbohydrates: { type: Number }, // grams
        fats: { type: Number }, // grams
    },

    // Clinical profile this template is designed for
    clinicalProfile: {
        suitableFor: [{
            type: String,
            enum: ['diabetic', 'hypertensive', 'celiac', 'lactose-intolerant', 'low-sodium', 'low-fat', 'low-glycemic', 'renal', 'cardiac', 'general']
        }],
        excludedAllergens: [{
            type: String,
            enum: ['gluten', 'lactose', 'nuts', 'soy', 'eggs', 'fish', 'shellfish', 'peanuts']
        }],
        maxSodium: { type: Number }, // mg per day
        maxGlycemicIndex: { type: Number }, // max GI value
    },

    // Default meal structure for this template
    defaultMeals: {
        breakfast: {
            time: { type: String, default: '08:00' },
            foods: [{
                foodRef: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Food',
                    required: true,
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
            time: { type: String, default: '10:30' },
            foods: [{
                foodRef: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Food',
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
            time: { type: String, default: '13:00' },
            foods: [{
                foodRef: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Food',
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
            time: { type: String, default: '16:00' },
            foods: [{
                foodRef: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Food',
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
            time: { type: String, default: '19:00' },
            foods: [{
                foodRef: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Food',
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
            time: { type: String, default: '21:00' },
            foods: [{
                foodRef: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Food',
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

    // Tags for searching and filtering
    tags: [{ type: String }],

    // Creator
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    // System template vs user-created
    isSystemTemplate: {
        type: Boolean,
        default: false,
    },

    // Usage tracking
    usageCount: {
        type: Number,
        default: 0,
    },

}, {
    timestamps: true,
});

// Index for searching
dietTemplateSchema.index({ name: 'text', description: 'text' });
dietTemplateSchema.index({ category: 1, isSystemTemplate: 1 });

const DietTemplate = mongoose.model('DietTemplate', dietTemplateSchema);

export default DietTemplate;
