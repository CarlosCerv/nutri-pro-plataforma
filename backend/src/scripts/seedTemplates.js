import mongoose from 'mongoose';
import dotenv from 'dotenv';
import DietTemplate from '../models/DietTemplate.js';
import User from '../models/User.js'; // Import User model
import path from 'path';
import { fileURLToPath } from 'url';

// Configure dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const templates = [
    {
        name: 'Dieta Balanceada 2000 kcal',
        description: 'Plan equilibrado ideal para mantenimiento de peso con distribución 40/30/30.',
        category: 'custom', // Changed from General
        tags: ['balanceada', 'mantenimiento', 'saludable'],
        isSystemTemplate: true, // Mark as system template
        targetCalories: 2000, // Moved to root
        targetMacros: { // Renamed from macros
            protein: 150,
            carbs: 200,
            fats: 66
        },
        defaultMeals: { // Structured as defaultMeals map
            breakfast: {
                time: '08:00',
                foods: [
                    { name: 'Avena Cocida', quantity: '1 taza', quantityGrams: 234, calories: 166, protein: 6, carbohydrates: 28, fats: 3.5 },
                    { name: 'Manzana', quantity: '1 pieza', quantityGrams: 182, calories: 95, protein: 0.5, carbohydrates: 25, fats: 0.3 }
                ]
            },
            lunch: {
                time: '14:00',
                foods: [
                    { name: 'Pechuga de Pollo', quantity: '200g', quantityGrams: 200, calories: 330, protein: 62, carbohydrates: 0, fats: 7 },
                    { name: 'Arroz Blanco Cocido', quantity: '1 taza', quantityGrams: 158, calories: 205, protein: 4, carbohydrates: 45, fats: 0.4 },
                    { name: 'Brócoli', quantity: '1 taza', quantityGrams: 91, calories: 31, protein: 2.5, carbohydrates: 6, fats: 0.4 }
                ]
            },
            dinner: {
                time: '20:00',
                foods: [
                    { name: 'Pan Integral', quantity: '2 rebanadas', quantityGrams: 56, calories: 138, protein: 7, carbohydrates: 23, fats: 2 },
                    { name: 'Aguacate', quantity: '50g', quantityGrams: 50, calories: 80, protein: 1, carbohydrates: 4, fats: 7 },
                    { name: 'Huevo Cocido', quantity: '1 pieza', quantityGrams: 50, calories: 78, protein: 6, carbohydrates: 0.6, fats: 5 }
                ]
            }
        },
        isPublic: true
    },
    {
        name: 'Keto Principiantes',
        description: 'Plan bajo en carbohidratos para iniciar en cetosis. Alto en grasas saludables.',
        category: 'low-carb', // Changed from Keto
        tags: ['keto', 'low-carb', 'grasas'],
        isSystemTemplate: true,
        targetCalories: 1800,
        targetMacros: {
            protein: 120,
            carbs: 30,
            fats: 140
        },
        defaultMeals: {
            breakfast: {
                time: '09:00',
                foods: [
                    { name: 'Huevo Cocido', quantity: '2 piezas', quantityGrams: 100, calories: 156, protein: 12, carbohydrates: 1, fats: 10 },
                    { name: 'Aguacate', quantity: '80g', quantityGrams: 80, calories: 128, protein: 1.6, carbohydrates: 6.8, fats: 11 },
                    { name: 'Café Americano', quantity: '1 taza', quantityGrams: 237, calories: 2, protein: 0.3, carbohydrates: 0, fats: 0 }
                ]
            },
            lunch: {
                time: '15:00',
                foods: [
                    { name: 'Salmón', quantity: '200g', quantityGrams: 200, calories: 416, protein: 40, carbohydrates: 0, fats: 26 },
                    { name: 'Espinaca Cruda', quantity: '2 tazas', quantityGrams: 60, calories: 46, protein: 5.8, carbohydrates: 7.2, fats: 0.8 },
                    { name: 'Aceite de Oliva', quantity: '1 cda', quantityGrams: 14, calories: 124, protein: 0, carbohydrates: 0, fats: 14 }
                ]
            },
            dinner: {
                time: '21:00',
                foods: [
                    { name: 'Almendras', quantity: 'puño', quantityGrams: 30, calories: 170, protein: 6, carbohydrates: 6, fats: 15 },
                    { name: 'Yogurt Griego Natural', quantity: '3/4 taza', quantityGrams: 150, calories: 88, protein: 15, carbohydrates: 5, fats: 0.6 }
                ]
            }
        },
        isPublic: true
    },
    {
        name: 'Vegetariana Alta en Proteína',
        description: 'Plan sin carne pero rico en proteínas vegetales y lácteos.',
        category: 'vegetarian', // Changed from Vegetariana
        tags: ['vegetariana', 'proteina', 'sin-carne'],
        isSystemTemplate: true,
        targetCalories: 1900,
        targetMacros: {
            protein: 110,
            carbs: 220,
            fats: 60
        },
        defaultMeals: {
            breakfast: {
                time: '08:30',
                foods: [
                    { name: 'Yogurt Griego Natural', quantity: '1 taza', quantityGrams: 200, calories: 118, protein: 20, carbohydrates: 7, fats: 0.8 },
                    { name: 'Fresas', quantity: '1 taza', quantityGrams: 150, calories: 48, protein: 1, carbohydrates: 11, fats: 0.4 },
                    { name: 'Almendras', quantity: '20g', quantityGrams: 20, calories: 115, protein: 4, carbohydrates: 4, fats: 10 }
                ]
            },
            lunch: {
                time: '14:30',
                foods: [
                    { name: 'Tofu', quantity: '200g', quantityGrams: 200, calories: 152, protein: 16, carbohydrates: 4, fats: 9 },
                    { name: 'Arroz Blanco Cocido', quantity: '100g', quantityGrams: 100, calories: 130, protein: 2.7, carbohydrates: 28, fats: 0.3 },
                    { name: 'Zanahoria', quantity: '80g', quantityGrams: 80, calories: 32, protein: 0.7, carbohydrates: 7, fats: 0.2 }
                ]
            },
            dinner: {
                time: '20:30',
                foods: [
                    { name: 'Frijoles Negros Cocidos', quantity: '200g', quantityGrams: 200, calories: 264, protein: 17, carbohydrates: 47, fats: 1 },
                    { name: 'Tortilla de Maíz', quantity: '2 piezas', quantityGrams: 60, calories: 128, protein: 2.8, carbohydrates: 27, fats: 1 },
                    { name: 'Nopal Cocido', quantity: '100g', quantityGrams: 100, calories: 15, protein: 1.4, carbohydrates: 3, fats: 0.1 }
                ]
            }
        },
        isPublic: true
    }
];

const seedTemplates = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find a user to assign the templates to
        const adminUser = await User.findOne();
        if (!adminUser) {
            console.error('No users found. Please seed users first.');
            process.exit(1);
        }
        console.log(`Assigning templates to user: ${adminUser.name} (${adminUser._id})`);

        await DietTemplate.deleteMany({ isSystemTemplate: true });
        console.log('Cleared existing system templates');

        // Import Food model dynamically if needed or rely on global if already registered
        // Safe bet: import it
        const Food = (await import('../models/Food.js')).default;

        // Cache all foods for faster lookup
        const allFoods = await Food.find({});
        const foodMap = new Map(allFoods.map(f => [f.name, f]));

        const templatesToInsert = [];

        for (const templateData of templates) {
            const newTemplate = {
                ...templateData,
                createdBy: adminUser._id,
                defaultMeals: {} // Reset to populate correctly
            };

            // Process meals
            for (const [mealKey, mealData] of Object.entries(templateData.defaultMeals)) {
                if (!mealData) continue;

                const mealFoods = [];
                for (const foodItem of mealData.foods) {
                    const foodDoc = foodMap.get(foodItem.name);

                    if (foodDoc) {
                        mealFoods.push({
                            foodRef: foodDoc._id,
                            quantity: foodItem.quantity,
                            quantityGrams: foodItem.quantityGrams,
                            calories: foodItem.calories,
                            protein: foodItem.protein,
                            carbohydrates: foodItem.carbohydrates,
                            fats: foodItem.fats
                        });
                    } else {
                        console.warn(`Warning: Food "${foodItem.name}" not found in database. Skipping in template "${templateData.name}".`);
                        // Fallback: try to find any food in same category? Or just skip.
                        // For this seed script, we'll skip to avoid validation errors.
                    }
                }

                if (mealFoods.length > 0) {
                    newTemplate.defaultMeals[mealKey] = {
                        time: mealData.time,
                        foods: mealFoods
                    };
                }
            }

            templatesToInsert.push(newTemplate);
        }

        if (templatesToInsert.length > 0) {
            await DietTemplate.insertMany(templatesToInsert);
            console.log(`Successfully seeded ${templatesToInsert.length} diet templates.`);
        } else {
            console.warn('No templates prepared for insertion.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding templates:', error);
        process.exit(1);
    }
};

seedTemplates();
