import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Food from '../models/Food.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const foods = [
    // --- CEREALES Y TUBERCULOS ---
    {
        name: 'Tortilla de Maíz',
        category: 'cereals',
        image: 'https://images.unsplash.com/photo-1624806957116-b220d5854e7d?auto=format&fit=crop&w=200&q=80',
        nutrition: { energy: 64, protein: 1.4, carbohydrates: 13.6, fat: 0.5, fiber: 1.5, calcium: 40 },
        servingSizes: [{ name: 'pieza', grams: 30 }],
        glycemicIndex: 52,
        suitableFor: ['vegan', 'vegetarian', 'low-fat', 'celiac']
    },
    {
        name: 'Arroz Blanco Cocido',
        category: 'cereals',
        image: 'https://images.unsplash.com/photo-1579631542720-3a87824fff86?auto=format&fit=crop&w=200&q=80',
        nutrition: { energy: 130, protein: 2.7, carbohydrates: 28, fat: 0.3, fiber: 0.4 },
        servingSizes: [{ name: 'taza', grams: 158 }],
        glycemicIndex: 73,
        suitableFor: ['vegan', 'vegetarian', 'low-fat', 'celiac']
    },
    {
        name: 'Avena Cocida',
        category: 'cereals',
        image: 'https://images.unsplash.com/photo-1542283944-71649d212260?auto=format&fit=crop&w=200&q=80',
        nutrition: { energy: 71, protein: 2.5, carbohydrates: 12, fat: 1.5, fiber: 1.7 },
        servingSizes: [{ name: 'taza', grams: 234 }],
        glycemicIndex: 55,
        suitableFor: ['vegan', 'vegetarian', 'low-sodium']
    },
    {
        name: 'Pan Integral',
        category: 'cereals',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=200&q=80',
        nutrition: { energy: 69, protein: 3.6, carbohydrates: 11.6, fat: 1.1, fiber: 1.9 },
        servingSizes: [{ name: 'rebanada', grams: 28 }],
        glycemicIndex: 51,
        allergens: ['gluten'],
        suitableFor: ['vegan', 'vegetarian']
    },
    {
        name: 'Papa Cocida',
        category: 'cereals',
        image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=200&q=80',
        nutrition: { energy: 87, protein: 1.9, carbohydrates: 20.1, fat: 0.1, fiber: 1.8, potassium: 379 },
        servingSizes: [{ name: 'media taza', grams: 78 }],
        glycemicIndex: 78,
        suitableFor: ['vegan', 'vegetarian', 'celiac', 'low-fat']
    },

    // --- PROTEINAS ---
    {
        name: 'Pechuga de Pollo',
        category: 'proteins',
        image: 'https://images.unsplash.com/photo-1623653387945-2fd25214f8fc?auto=format&fit=crop&w=200&q=80',
        nutrition: { energy: 165, protein: 31, carbohydrates: 0, fat: 3.6 },
        servingSizes: [{ name: 'filete mediano', grams: 100 }],
        glycemicIndex: 0,
        suitableFor: ['diabetic']
    },
    {
        name: 'Huevo Cocido',
        category: 'proteins',
        image: 'https://images.unsplash.com/photo-1620052737525-24e528b17478?auto=format&fit=crop&w=200&q=80',
        nutrition: { energy: 155, protein: 12.6, carbohydrates: 1.1, fat: 10.6, cholesterol: 373 },
        servingSizes: [{ name: 'pieza grande', grams: 50 }],
        allergens: ['eggs'],
        glycemicIndex: 0,
        suitableFor: ['vegetarian', 'diabetic']
    },
    {
        name: 'Salmón',
        category: 'proteins',
        image: 'https://images.unsplash.com/photo-1628173429272-a7d0cb13c6f4?auto=format&fit=crop&w=200&q=80',
        nutrition: { energy: 208, protein: 20, carbohydrates: 0, fat: 13, omega3: 2.5 },
        servingSizes: [{ name: 'filete', grams: 100 }],
        allergens: ['fish'],
        glycemicIndex: 0,
        suitableFor: ['diabetic']
    },
    {
        name: 'Frijoles Negros Cocidos',
        category: 'legumes',
        image: 'https://images.unsplash.com/photo-1563205041-86641e7bad89?auto=format&fit=crop&w=200&q=80',
        nutrition: { energy: 132, protein: 8.9, carbohydrates: 23.7, fat: 0.5, fiber: 8.7 },
        servingSizes: [{ name: 'taza', grams: 172 }],
        glycemicIndex: 30,
        suitableFor: ['vegan', 'vegetarian', 'diabetic', 'celiac']
    },
    {
        name: 'Tofu',
        category: 'proteins',
        image: 'https://images.unsplash.com/photo-1616422203774-845772b21213?auto=format&fit=crop&w=200&q=80',
        nutrition: { energy: 76, protein: 8, carbohydrates: 1.9, fat: 4.8 },
        servingSizes: [{ name: 'bloque', grams: 100 }],
        allergens: ['soy'],
        glycemicIndex: 15,
        suitableFor: ['vegan', 'vegetarian', 'diabetic', 'celiac']
    },

    // --- FRUTAS ---
    {
        name: 'Manzana',
        category: 'fruits',
        image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=200&q=80',
        nutrition: { energy: 52, protein: 0.3, carbohydrates: 14, fat: 0.2, fiber: 2.4 },
        servingSizes: [{ name: 'pieza mediana', grams: 182 }],
        glycemicIndex: 36,
        suitableFor: ['vegan', 'vegetarian', 'low-fat', 'celiac']
    },
    {
        name: 'Plátano',
        category: 'fruits',
        image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=200&q=80',
        nutrition: { energy: 89, protein: 1.1, carbohydrates: 22.8, fat: 0.3, fiber: 2.6, potassium: 358 },
        servingSizes: [{ name: 'pieza mediana', grams: 118 }],
        glycemicIndex: 51,
        suitableFor: ['vegan', 'vegetarian', 'celiac']
    },
    {
        name: 'Naranja',
        category: 'fruits',
        image: 'https://images.unsplash.com/photo-1580052614034-c55d20bfee8b?auto=format&fit=crop&w=200&q=80',
        nutrition: { energy: 47, protein: 0.9, carbohydrates: 11.8, fat: 0.1, fiber: 2.4, vitaminC: 53.2 },
        servingSizes: [{ name: 'pieza', grams: 131 }],
        glycemicIndex: 43,
        suitableFor: ['vegan', 'vegetarian', 'low-fat', 'celiac']
    },
    {
        name: 'Fresas',
        category: 'fruits',
        image: 'https://images.unsplash.com/photo-1464965911861-746a04b4b0a6?auto=format&fit=crop&w=200&q=80',
        nutrition: { energy: 32, protein: 0.7, carbohydrates: 7.7, fat: 0.3, fiber: 2, vitaminC: 58.8 },
        servingSizes: [{ name: 'taza', grams: 152 }],
        glycemicIndex: 40,
        suitableFor: ['vegan', 'vegetarian', 'diabetic', 'low-fat']
    },

    // --- VERDURAS ---
    {
        name: 'Espinaca Cruda',
        category: 'vegetables',
        image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=200&q=80',
        nutrition: { energy: 23, protein: 2.9, carbohydrates: 3.6, fat: 0.4, fiber: 2.2, iron: 2.7 },
        servingSizes: [{ name: 'taza', grams: 30 }],
        glycemicIndex: 15,
        suitableFor: ['vegan', 'vegetarian', 'diabetic']
    },
    {
        name: 'Zanahoria',
        category: 'vegetables',
        image: 'https://images.unsplash.com/photo-1447175008436-8123782ca61d?auto=format&fit=crop&w=200&q=80',
        nutrition: { energy: 41, protein: 0.9, carbohydrates: 9.6, fat: 0.2, fiber: 2.8, vitaminA: 835 },
        servingSizes: [{ name: 'pieza mediana', grams: 61 }],
        glycemicIndex: 39,
        suitableFor: ['vegan', 'vegetarian', 'celiac']
    },
    {
        name: 'Brócoli',
        category: 'vegetables',
        image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=200&q=80',
        nutrition: { energy: 34, protein: 2.8, carbohydrates: 6.6, fat: 0.4, fiber: 2.6, vitaminC: 89.2 },
        servingSizes: [{ name: 'taza picado', grams: 91 }],
        glycemicIndex: 15,
        suitableFor: ['vegan', 'vegetarian', 'diabetic']
    },
    {
        name: 'Nopal Cocido',
        category: 'vegetables',
        image: 'https://images.unsplash.com/photo-1596489392231-64e7c72f1025?auto=format&fit=crop&w=200&q=80',
        nutrition: { energy: 15, protein: 1.4, carbohydrates: 3, fat: 0.1, fiber: 2 },
        servingSizes: [{ name: 'taza', grams: 150 }],
        glycemicIndex: 7,
        suitableFor: ['vegan', 'vegetarian', 'diabetic']
    },

    // --- GRASAS ---
    {
        name: 'Aguacate',
        category: 'fats',
        image: 'https://images.unsplash.com/photo-1523049673856-3824553d105b?auto=format&fit=crop&w=200&q=80',
        nutrition: { energy: 160, protein: 2, carbohydrates: 8.5, fat: 14.7, fiber: 6.7 },
        servingSizes: [{ name: 'tercio de pieza', grams: 50 }],
        glycemicIndex: 15,
        suitableFor: ['vegan', 'vegetarian', 'diabetic']
    },
    {
        name: 'Almendras',
        category: 'nuts',
        image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=200&q=80',
        nutrition: { energy: 579, protein: 21, carbohydrates: 21.6, fat: 49.9, fiber: 12.5 },
        servingSizes: [{ name: 'puño (ca. 23 piezas)', grams: 28 }],
        allergens: ['nuts'],
        glycemicIndex: 0,
        suitableFor: ['vegan', 'vegetarian', 'diabetic']
    },
    {
        name: 'Aceite de Oliva',
        category: 'fats',
        image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcdbf41?auto=format&fit=crop&w=200&q=80',
        nutrition: { energy: 884, protein: 0, carbohydrates: 0, fat: 100 },
        servingSizes: [{ name: 'cucharada', grams: 14 }],
        glycemicIndex: 0,
        suitableFor: ['vegan', 'vegetarian']
    },

    // --- LACTEOS ---
    {
        name: 'Leche Entera',
        category: 'dairy',
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=200&q=80',
        nutrition: { energy: 61, protein: 3.2, carbohydrates: 4.8, fat: 3.3, calcium: 113 },
        servingSizes: [{ name: 'vaso', grams: 244 }],
        allergens: ['lactose'],
        glycemicIndex: 31,
        suitableFor: ['vegetarian', 'celiac']
    },
    {
        name: 'Yogurt Griego Natural',
        category: 'dairy',
        image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=200&q=80',
        nutrition: { energy: 59, protein: 10, carbohydrates: 3.6, fat: 0.4 },
        servingSizes: [{ name: 'taza', grams: 170 }],
        allergens: ['lactose'],
        glycemicIndex: 12,
        suitableFor: ['vegetarian', 'diabetic']
    },

    // --- BEBIDAS ---
    {
        name: 'Café Americano',
        category: 'beverages',
        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=200&q=80',
        nutrition: { energy: 2, protein: 0.3, carbohydrates: 0, fat: 0 },
        servingSizes: [{ name: 'taza', grams: 237 }],
        glycemicIndex: 0,
        suitableFor: ['vegan', 'vegetarian']
    },
    // --- NUEVOS ITEMS AGREGADOS (Base de Datos Extendida) ---
    {
        name: 'Quinoa Cocida',
        category: 'cereals',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=200&q=80',
        nutrition: { energy: 120, protein: 4.4, carbohydrates: 21.3, fat: 1.9, fiber: 2.8 },
        servingSizes: [{ name: 'taza', grams: 185 }],
        glycemicIndex: 53,
        suitableFor: ['vegan', 'vegetarian', 'celiac', 'low-sodium']
    },
    {
        name: 'Camote Cocido',
        category: 'cereals',
        image: 'https://images.unsplash.com/photo-1596097635121-14b63b7f7815?auto=format&fit=crop&w=200&q=80',
        nutrition: { energy: 86, protein: 1.6, carbohydrates: 20.1, fat: 0.1, fiber: 3, vitaminA: 709 },
        servingSizes: [{ name: 'pieza mediana', grams: 114 }],
        glycemicIndex: 63,
        suitableFor: ['vegan', 'vegetarian', 'celiac']
    },
    {
        name: 'Atún en Agua',
        category: 'proteins',
        image: 'https://images.unsplash.com/photo-1544302333-6f8d8edcb538?auto=format&fit=crop&w=200&q=80',
        nutrition: { energy: 116, protein: 26, carbohydrates: 0, fat: 1, selenium: 80.4 },
        servingSizes: [{ name: 'lata drenada', grams: 100 }],
        allergens: ['fish'],
        glycemicIndex: 0,
        suitableFor: ['diabetic', 'low-fat']
    },
    {
        name: 'Lentejas Cocidas',
        category: 'legumes',
        image: 'https://images.unsplash.com/photo-1505253549704-37053e192ff9?auto=format&fit=crop&w=200&q=80',
        nutrition: { energy: 116, protein: 9, carbohydrates: 20, fat: 0.4, fiber: 7.9, iron: 3.3 },
        servingSizes: [{ name: 'taza', grams: 198 }],
        glycemicIndex: 29,
        suitableFor: ['vegan', 'vegetarian', 'diabetic', 'low-fat']
    },
    {
        name: 'Queso Panela',
        category: 'dairy',
        image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=200&q=80',
        nutrition: { energy: 146, protein: 18, carbohydrates: 2, fat: 9, calcium: 500 },
        servingSizes: [{ name: 'rebanada', grams: 40 }],
        allergens: ['lactose'],
        glycemicIndex: 0,
        suitableFor: ['vegetarian', 'celiac']
    },
    {
        name: 'Espinacas Cocidas',
        category: 'vegetables',
        image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=200&q=80',
        nutrition: { energy: 23, protein: 3, carbohydrates: 3.8, fat: 0.3, fiber: 2.4, iron: 3.6 },
        servingSizes: [{ name: 'taza', grams: 180 }],
        glycemicIndex: 15,
        suitableFor: ['vegan', 'vegetarian', 'diabetic']
    },
    {
        name: 'Champiñones Salteados',
        category: 'vegetables',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=200&q=80',
        nutrition: { energy: 28, protein: 2.2, carbohydrates: 5.3, fat: 0.5, fiber: 2.2, vitaminD: 0.1 },
        servingSizes: [{ name: 'taza', grams: 96 }],
        glycemicIndex: 10,
        suitableFor: ['vegan', 'vegetarian', 'diabetic']
    },
    {
        name: 'Nueces',
        category: 'nuts',
        image: 'https://images.unsplash.com/photo-1543161358-38600c6d36e2?auto=format&fit=crop&w=200&q=80',
        nutrition: { energy: 654, protein: 15, carbohydrates: 14, fat: 65, fiber: 7, omega3: 9 },
        servingSizes: [{ name: 'mitades', grams: 28 }],
        allergens: ['nuts'],
        glycemicIndex: 15,
        suitableFor: ['vegan', 'vegetarian', 'diabetic']
    },
    {
        name: 'Semillas de Chía',
        category: 'nuts',
        image: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?auto=format&fit=crop&w=200&q=80',
        nutrition: { energy: 486, protein: 17, carbohydrates: 42, fat: 31, fiber: 34, calcium: 631 },
        servingSizes: [{ name: 'cucharada', grams: 10 }],
        glycemicIndex: 1,
        suitableFor: ['vegan', 'vegetarian', 'celiac']
    },
    {
        name: 'Leche de Almendras (Sin azúcar)',
        category: 'dairy',
        image: 'https://images.unsplash.com/photo-1600788886242-ebc02168b994?auto=format&fit=crop&w=200&q=80',
        nutrition: { energy: 15, protein: 0.5, carbohydrates: 0, fat: 1.2, calcium: 184 },
        servingSizes: [{ name: 'taza', grams: 240 }],
        allergens: ['nuts'],
        glycemicIndex: 30,
        suitableFor: ['vegan', 'vegetarian', 'lactose-intolerant', 'celiac']
    }
];

const seedFoods = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        await Food.deleteMany({}); // Optional: clear existing foods
        console.log('Cleared existing foods');

        await Food.insertMany(foods);
        console.log('Foods seeded successfully');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding foods:', error);
        process.exit(1);
    }
};

seedFoods();
