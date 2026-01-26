import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['cereals', 'proteins', 'dairy', 'fruits', 'vegetables', 'fats', 'legumes', 'nuts', 'beverages', 'other'],
        required: true,
        index: true
    },
    image: {
        type: String,
        required: false
    },
    // Información nutricional por 100g
    nutrition: {
        energy: { type: Number, required: true }, // kcal
        protein: { type: Number, default: 0 }, // g
        carbohydrates: { type: Number, default: 0 }, // g
        fiber: { type: Number, default: 0 }, // g
        sugars: { type: Number, default: 0 }, // g
        fat: { type: Number, default: 0 }, // g
        saturatedFat: { type: Number, default: 0 }, // g
        monounsaturatedFat: { type: Number, default: 0 }, // g
        polyunsaturatedFat: { type: Number, default: 0 }, // g
        cholesterol: { type: Number, default: 0 }, // mg
        sodium: { type: Number, default: 0 }, // mg
        potassium: { type: Number, default: 0 }, // mg
        calcium: { type: Number, default: 0 }, // mg
        iron: { type: Number, default: 0 }, // mg
        vitaminA: { type: Number, default: 0 }, // μg
        vitaminC: { type: Number, default: 0 }, // mg
        vitaminD: { type: Number, default: 0 }, // μg
        vitaminE: { type: Number, default: 0 }, // mg
        vitaminB12: { type: Number, default: 0 }, // μg
        folate: { type: Number, default: 0 }, // μg
    },
    // Restricciones y características
    allergens: [{
        type: String,
        enum: ['gluten', 'lactose', 'nuts', 'soy', 'eggs', 'fish', 'shellfish', 'peanuts']
    }],
    suitableFor: [{
        type: String,
        enum: ['vegan', 'vegetarian', 'diabetic', 'hypertensive', 'celiac', 'lactose-intolerant', 'low-sodium', 'low-fat']
    }],
    glycemicIndex: {
        type: Number,
        min: 0,
        max: 100
    },
    // Porciones comunes
    servingSizes: [{
        name: { type: String, required: true }, // 'taza', 'pieza', 'cucharada'
        grams: { type: Number, required: true }
    }],
    // Metadata
    source: {
        type: String,
        default: 'Manual'
    },
    verified: {
        type: Boolean,
        default: false
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Índice de texto para búsqueda
foodSchema.index({ name: 'text', category: 'text' });

// Índice para filtros comunes
foodSchema.index({ category: 1, verified: 1 });

export default mongoose.model('Food', foodSchema);
