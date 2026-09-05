import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import DietTemplate from '../models/DietTemplate.js';
import Food from '../models/Food.js';
import User from '../models/User.js';
import { BANDS, buildTemplate } from '../services/mealTemplateAlgebra.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const DRY_RUN = process.argv.includes('--dry-run');

// Marca las 340 plantillas de esta corrida para poder reemplazarlas sin
// tocar las plantillas manuales de `seedTemplates.js` (que también usan
// `isSystemTemplate: true`, pero no ponen `generatorTag`).
const GENERATOR_TAG = 'meal-algebra-v1';

/**
 * Genera plantillas de sistema (DietTemplate) a partir del catálogo real de
 * `Food`, no texto libre. Para 20 recetas × 17 rangos de 100 kcal
 * (1300-1400 ... 2900-3000) resuelve los gramos de cada alimento con álgebra
 * lineal contra los macros de esa receta, en vez de estimarlos a mano — con
 * 340 menús a mano el error de redondeo humano sería mayor que el margen de
 * la distribución objetivo. El álgebra en sí (pura, sin BD) vive en
 * `services/mealTemplateAlgebra.js`; este script solo aporta el catálogo de
 * recetas y el I/O contra Mongo.
 */

// ── 20 recetas ──────────────────────────────────────────────────────
// breakfast/lunch/dinner: {carb, protein, fat, extra} — 3 alimentos que se
// resuelven por álgebra + 1 alimento fijo (fruta/verdura, porción estándar,
// no escala con las calorías: una porción de verdura es igual de grande en
// una dieta de 1300 que en una de 3000).
// morningSnack/afternoonSnack: {items:[{food, baseGrams}]} — combo de
// proporción fija que se escala completo para llegar a la caloría objetivo;
// no se le exige el macro exacto porque cada colación es ~10% del día.
const RECIPES = [
    {
        name: 'Tradicional Mexicano',
        category: 'custom',
        tags: ['mexicano', 'huevo', 'frijol'],
        meals: {
            breakfast: { carb: ['Tortilla de Maíz', 'Arroz Blanco Cocido'], protein: 'Huevo Cocido', fat: 'Aguacate', extra: 'Naranja' },
            morningSnack: { carb: 'Plátano', protein: 'Yogurt Griego Natural', fat: 'Almendras' },
            lunch: { protein: 'Pechuga de Pollo', carb: ['Arroz Blanco Cocido', 'Tortilla de Maíz'], fat: 'Aceite de Oliva', extra: 'Nopal Cocido' },
            afternoonSnack: { carb: 'Fresas', protein: 'Queso Cottage', fat: 'Nueces' },
            dinner: { protein: 'Frijoles Negros Cocidos', carb: ['Tortilla de Maíz', 'Arroz Blanco Cocido'], fat: 'Aguacate', extra: 'Espinacas Cocidas' },
        },
    },
    {
        name: 'Mediterráneo con Salmón',
        category: 'mediterranean',
        tags: ['mediterraneo', 'pescado', 'aceite de oliva'],
        meals: {
            breakfast: { carb: ['Avena Cocida', 'Quinoa Cocida'], protein: 'Yogurt Griego Natural', fat: 'Almendras', extra: 'Arándanos' },
            morningSnack: { carb: 'Manzana', protein: 'Queso Cottage', fat: 'Nueces' },
            lunch: { protein: 'Salmón', carb: ['Quinoa Cocida', 'Arroz Integral Cocido'], fat: 'Aceite de Oliva', extra: 'Espárragos' },
            afternoonSnack: { carb: 'Zanahoria', protein: 'Hummus de Garbanzo', fat: 'Aceite de Oliva' },
            dinner: { protein: 'Atún Sellado', carb: ['Camote Cocido', 'Papa Cocida'], fat: 'Aceite de Oliva', extra: 'Berenjena Asada' },
        },
    },
    {
        name: 'Tazón Vegetariano de Tofu',
        category: 'vegetarian',
        tags: ['vegetariano', 'tofu', 'sin-carne'],
        meals: {
            breakfast: { carb: ['Pan Integral', 'Avena Cocida'], protein: 'Queso Panela', fat: 'Mantequilla de Almendra', extra: 'Plátano' },
            morningSnack: { carb: 'Arándanos', protein: 'Yogurt Natural (Sin azúcar)', fat: 'Almendras' },
            lunch: { protein: 'Tofu', carb: ['Arroz Integral Cocido', 'Quinoa Cocida'], fat: 'Aceite de Oliva', extra: 'Brócoli al Vapor' },
            afternoonSnack: { carb: 'Manzana', protein: 'Queso Cottage', fat: 'Nueces' },
            dinner: { protein: 'Tofu Ahumado', carb: ['Couscous Cocido', 'Quinoa Cocida'], fat: 'Aguacate', extra: 'Champiñones Salteados' },
        },
    },
    {
        name: 'Vegano con Lentejas y Quinoa',
        category: 'vegan',
        tags: ['vegano', 'legumbres', 'sin-animal'],
        meals: {
            breakfast: { carb: ['Avena Cocida', 'Quinoa Cocida'], protein: 'Soya Texturizada Precocida', fat: 'Semillas de Chía', extra: 'Fresas' },
            morningSnack: { carb: 'Naranja', protein: 'Hummus de Garbanzo', fat: 'Almendras' },
            lunch: { protein: 'Lentejas Cocidas', carb: ['Arroz Integral Cocido', 'Quinoa Cocida'], fat: 'Aceite de Oliva', extra: 'Espinacas Cocidas' },
            afternoonSnack: { carb: 'Pan de Pita', protein: 'Soya Texturizada Precocida', fat: 'Semillas de Chía' },
            // Fat anchor cambiado de Aguacate a Aceite de Oliva: el aguacate aporta
            // carbohidrato propio y, sumado al de los garbanzos (anchor de proteína,
            // igual de carbohidratado), el sistema pedía carbohidrato negativo del
            // camote para no rebasar el objetivo — Aceite de Oliva es carbohidrato
            // puro cero, así que no compite con esa cuenta.
            dinner: { protein: 'Tofu', carb: ['Camote Cocido', 'Papa Cocida'], fat: 'Aceite de Oliva', extra: 'Calabacita' },
        },
    },
    {
        name: 'Pollo con Quinoa y Espárragos',
        category: 'custom',
        tags: ['pollo', 'quinoa'],
        meals: {
            breakfast: { carb: ['Pan Integral', 'Avena Cocida'], protein: 'Huevo Cocido', fat: 'Aguacate', extra: 'Kiwi' },
            morningSnack: { carb: 'Arándanos', protein: 'Queso Cottage', fat: 'Almendras' },
            lunch: { protein: 'Pechuga de Pollo', carb: ['Quinoa Cocida', 'Arroz Integral Cocido'], fat: 'Aceite de Oliva', extra: 'Espárragos' },
            afternoonSnack: { carb: 'Pan de Pita', protein: 'Atún en Agua', fat: 'Aceite de Oliva' },
            dinner: { protein: 'Pechuga de Pavo', carb: ['Papa Cocida', 'Camote Cocido'], fat: 'Aceite de Oliva', extra: 'Brócoli' },
        },
    },
    {
        name: 'Atún Mediterráneo',
        category: 'mediterranean',
        tags: ['atun', 'mediterraneo'],
        meals: {
            breakfast: { carb: ['Avena Cocida', 'Quinoa Cocida'], protein: 'Huevo Cocido', fat: 'Almendras', extra: 'Fresas' },
            morningSnack: { carb: 'Naranja', protein: 'Yogurt Natural (Sin azúcar)', fat: 'Nueces' },
            lunch: { protein: 'Atún en Agua', carb: ['Couscous Cocido', 'Quinoa Cocida'], fat: 'Aceite de Oliva', extra: 'Tomate Bola' },
            afternoonSnack: { carb: 'Mango', protein: 'Queso Cottage', fat: 'Nueces' },
            dinner: { protein: 'Salmón', carb: ['Arroz Integral Cocido', 'Quinoa Cocida'], fat: 'Aceite de Oliva', extra: 'Calabacita' },
        },
    },
    {
        name: 'Camote y Pavo',
        category: 'custom',
        tags: ['pavo', 'camote'],
        meals: {
            breakfast: { carb: ['Camote Cocido', 'Papa Cocida'], protein: 'Huevo Cocido', fat: 'Aguacate', extra: 'Plátano' },
            morningSnack: { carb: 'Manzana', protein: 'Queso Panela', fat: 'Almendras' },
            lunch: { protein: 'Pechuga de Pavo', carb: ['Camote Cocido', 'Papa Cocida'], fat: 'Aceite de Oliva', extra: 'Espinaca Cruda' },
            afternoonSnack: { carb: 'Naranja', protein: 'Queso Panela', fat: 'Nueces' },
            dinner: { protein: 'Lomo de Cerdo', carb: ['Arroz Blanco Cocido', 'Tortilla de Maíz'], fat: 'Aceite de Oliva', extra: 'Berenjena' },
        },
    },
    {
        name: 'Garbanzos y Arroz Integral',
        category: 'vegetarian',
        tags: ['legumbres', 'vegetariano'],
        meals: {
            breakfast: { carb: ['Pan Integral', 'Avena Cocida'], protein: 'Yogurt Griego Natural', fat: 'Mantequilla de Almendra', extra: 'Mango' },
            morningSnack: { carb: 'Kiwi', protein: 'Yogurt Griego Natural', fat: 'Nueces' },
            // Anchor de proteína cambiado de Garbanzos en Conserva (23g carb/100g,
            // demasiado carbohidratado para ser "el ancla de proteína") a Queso
            // Panela: mismo perfil vegetariano, mucho menos carbohidrato, deja de
            // competir con el Arroz Integral por el presupuesto de carbohidrato.
            lunch: { protein: 'Queso Panela', carb: ['Arroz Integral Cocido', 'Quinoa Cocida'], fat: 'Aceite de Oliva', extra: 'Zanahoria' },
            afternoonSnack: { carb: 'Arándanos', protein: 'Yogurt Griego Natural', fat: 'Almendras' },
            dinner: { protein: 'Huevo Cocido', carb: ['Papa Cocida', 'Camote Cocido'], fat: 'Aguacate', extra: 'Champiñones Salteados' },
        },
    },
    {
        name: 'Avena y Frutos Rojos',
        category: 'custom',
        tags: ['avena', 'desayuno-fuerte'],
        meals: {
            breakfast: { carb: ['Avena Cocida', 'Quinoa Cocida'], protein: 'Yogurt Griego Natural', fat: 'Semillas de Chía', extra: 'Arándanos' },
            morningSnack: { carb: 'Fresas', protein: 'Queso Cottage', fat: 'Almendras' },
            lunch: { protein: 'Pechuga de Pollo', carb: ['Arroz Integral Cocido', 'Quinoa Cocida'], fat: 'Aceite de Oliva', extra: 'Champiñones Salteados' },
            afternoonSnack: { carb: 'Sandía', protein: 'Queso Cottage', fat: 'Nueces' },
            dinner: { protein: 'Atún Sellado', carb: ['Quinoa Cocida', 'Arroz Integral Cocido'], fat: 'Aguacate', extra: 'Espárragos' },
        },
    },
    {
        name: 'Salmón y Camote',
        category: 'custom',
        tags: ['salmon', 'omega3'],
        meals: {
            breakfast: { carb: ['Pan Integral', 'Avena Cocida'], protein: 'Huevo Cocido', fat: 'Aguacate', extra: 'Melón Chino' },
            morningSnack: { carb: 'Plátano', protein: 'Yogurt Natural (Sin azúcar)', fat: 'Nueces' },
            lunch: { protein: 'Salmón', carb: ['Camote Cocido', 'Papa Cocida'], fat: 'Aceite de Oliva', extra: 'Brócoli' },
            afternoonSnack: { carb: 'Fresas', protein: 'Yogurt Natural (Sin azúcar)', fat: 'Almendras' },
            dinner: { protein: 'Tofu', carb: ['Arroz Blanco Cocido', 'Tortilla de Maíz'], fat: 'Aceite de Oliva', extra: 'Espinaca Cruda' },
        },
    },
    {
        name: 'Tofu Ahumado y Couscous',
        category: 'vegan',
        tags: ['tofu', 'couscous', 'vegano'],
        meals: {
            // Anchor de proteína cambiado de Semillas de Chía a Soya Texturizada
            // Precocida, y el de grasa a Aceite de Oliva: Chía y Mantequilla de
            // Almendra tienen una proporción carbohidrato/proteína/grasa casi
            // idéntica entre sí, así que el sistema de ecuaciones quedaba casi
            // singular y el gramaje resuelto se disparaba a miles de gramos.
            breakfast: { carb: ['Avena Cocida', 'Quinoa Cocida'], protein: 'Soya Texturizada Precocida', fat: 'Aceite de Oliva', extra: 'Mango Ataulfo' },
            morningSnack: { carb: 'Naranja', protein: 'Hummus de Garbanzo', fat: 'Semillas de Girasol' },
            lunch: { protein: 'Tofu Ahumado', carb: ['Couscous Cocido', 'Quinoa Cocida'], fat: 'Aceite de Oliva', extra: 'Berenjena Asada' },
            afternoonSnack: { carb: 'Zanahoria', protein: 'Hummus de Garbanzo', fat: 'Aceite de Oliva' },
            dinner: { protein: 'Tofu', carb: ['Quinoa Cocida', 'Arroz Integral Cocido'], fat: 'Aguacate', extra: 'Calabaza de Castilla' },
        },
    },
    {
        name: 'Frijoles y Nopales',
        category: 'vegetarian',
        tags: ['mexicano', 'vegetariano', 'frijol'],
        meals: {
            breakfast: { carb: ['Tortilla de Maíz', 'Arroz Blanco Cocido'], protein: 'Huevo Cocido', fat: 'Aguacate', extra: 'Fresas' },
            morningSnack: { carb: 'Plátano', protein: 'Queso Panela', fat: 'Almendras' },
            lunch: { protein: 'Frijoles Negros Cocidos', carb: ['Arroz Blanco Cocido', 'Tortilla de Maíz'], fat: 'Aceite de Oliva', extra: 'Nopal Cocido' },
            afternoonSnack: { carb: 'Manzana', protein: 'Queso Panela', fat: 'Nueces' },
            dinner: { protein: 'Queso Cottage', carb: ['Tortilla de Maíz', 'Arroz Blanco Cocido'], fat: 'Aguacate', extra: 'Tomate Bola' },
        },
    },
    {
        name: 'Pechuga y Papa',
        category: 'custom',
        tags: ['pollo', 'papa'],
        meals: {
            breakfast: { carb: ['Papa Cocida', 'Camote Cocido'], protein: 'Huevo Cocido', fat: 'Aceite de Oliva', extra: 'Naranja' },
            morningSnack: { carb: 'Manzana', protein: 'Yogurt Griego Natural', fat: 'Almendras' },
            lunch: { protein: 'Pechuga de Pollo', carb: ['Papa Cocida', 'Camote Cocido'], fat: 'Aceite de Oliva', extra: 'Brócoli' },
            afternoonSnack: { carb: 'Mango', protein: 'Yogurt Griego Natural', fat: 'Nueces' },
            dinner: { protein: 'Atún en Agua', carb: ['Arroz Blanco Cocido', 'Tortilla de Maíz'], fat: 'Aguacate', extra: 'Calabacita' },
        },
    },
    {
        name: 'Quinoa y Garbanzo',
        category: 'vegan',
        tags: ['quinoa', 'garbanzo', 'vegano'],
        meals: {
            breakfast: { carb: ['Avena Cocida', 'Quinoa Cocida'], protein: 'Soya Texturizada Precocida', fat: 'Almendras', extra: 'Kiwi' },
            morningSnack: { carb: 'Sandía', protein: 'Hummus de Garbanzo', fat: 'Semillas de Girasol' },
            // Igual que en "Garbanzos y Arroz Integral": Garbanzos en Conserva es
            // demasiado carbohidratado para anclar la proteína cuando ya hay otro
            // carbohidrato (Quinoa) en la misma comida — a partir de ~2000 kcal el
            // sistema pedía Quinoa negativa. Tofu es vegano, bajo en carbohidrato.
            lunch: { protein: 'Tofu', carb: ['Quinoa Cocida', 'Arroz Integral Cocido'], fat: 'Aceite de Oliva', extra: 'Espinacas Cocidas' },
            afternoonSnack: { carb: 'Pan de Pita', protein: 'Hummus de Garbanzo', fat: 'Aceite de Oliva' },
            dinner: { protein: 'Lentejas Cocidas', carb: ['Camote Cocido', 'Papa Cocida'], fat: 'Aguacate', extra: 'Berenjena' },
        },
    },
    {
        name: 'Pavo y Arroz Integral',
        category: 'custom',
        tags: ['pavo', 'arroz-integral'],
        meals: {
            breakfast: { carb: ['Pan de Pita', 'Couscous Cocido'], protein: 'Queso Panela', fat: 'Aguacate', extra: 'Melón Chino' },
            morningSnack: { carb: 'Naranja', protein: 'Queso Cottage', fat: 'Nueces' },
            lunch: { protein: 'Pechuga de Pavo', carb: ['Arroz Integral Cocido', 'Quinoa Cocida'], fat: 'Aceite de Oliva', extra: 'Espárragos' },
            afternoonSnack: { carb: 'Fresas', protein: 'Queso Cottage', fat: 'Almendras' },
            dinner: { protein: 'Pechuga de Pollo', carb: ['Couscous Cocido', 'Quinoa Cocida'], fat: 'Aceite de Oliva', extra: 'Champiñones Salteados' },
        },
    },
    {
        name: 'Yogurt y Frutos Secos',
        category: 'custom',
        tags: ['yogurt', 'frutos-secos'],
        meals: {
            breakfast: { carb: ['Avena Cocida', 'Quinoa Cocida'], protein: 'Yogurt Griego Natural', fat: 'Nueces', extra: 'Plátano' },
            morningSnack: { carb: 'Manzana', protein: 'Yogurt Griego Natural', fat: 'Nueces' },
            lunch: { protein: 'Salmón', carb: ['Arroz Blanco Cocido', 'Tortilla de Maíz'], fat: 'Aceite de Oliva', extra: 'Espinaca Cruda' },
            afternoonSnack: { carb: 'Arándanos', protein: 'Yogurt Natural (Sin azúcar)', fat: 'Almendras' },
            dinner: { protein: 'Huevo Cocido', carb: ['Camote Cocido', 'Papa Cocida'], fat: 'Aguacate', extra: 'Brócoli al Vapor' },
        },
    },
    {
        name: 'Lomo de Cerdo y Camote',
        category: 'custom',
        tags: ['cerdo', 'camote'],
        meals: {
            breakfast: { carb: ['Tortilla de Maíz', 'Arroz Blanco Cocido'], protein: 'Huevo Cocido', fat: 'Aguacate', extra: 'Sandía' },
            morningSnack: { carb: 'Plátano', protein: 'Queso Panela', fat: 'Almendras' },
            lunch: { protein: 'Lomo de Cerdo', carb: ['Camote Cocido', 'Papa Cocida'], fat: 'Aceite de Oliva', extra: 'Calabacita' },
            afternoonSnack: { carb: 'Mango', protein: 'Queso Panela', fat: 'Nueces' },
            dinner: { protein: 'Atún Sellado', carb: ['Papa Cocida', 'Camote Cocido'], fat: 'Aguacate', extra: 'Tomate Bola' },
        },
    },
    {
        name: 'Atún y Quinoa',
        category: 'custom',
        tags: ['atun', 'quinoa'],
        meals: {
            breakfast: { carb: ['Avena Cocida', 'Quinoa Cocida'], protein: 'Huevo Cocido', fat: 'Semillas de Chía', extra: 'Naranja' },
            morningSnack: { carb: 'Kiwi', protein: 'Yogurt Griego Natural', fat: 'Nueces' },
            lunch: { protein: 'Atún en Agua', carb: ['Quinoa Cocida', 'Arroz Integral Cocido'], fat: 'Aceite de Oliva', extra: 'Berenjena' },
            afternoonSnack: { carb: 'Mango Ataulfo', protein: 'Yogurt Griego Natural', fat: 'Almendras' },
            dinner: { protein: 'Pechuga de Pollo', carb: ['Arroz Integral Cocido', 'Quinoa Cocida'], fat: 'Aguacate', extra: 'Espárragos' },
        },
    },
    {
        name: 'Lentejas Rojas y Arroz',
        category: 'vegetarian',
        tags: ['lentejas', 'vegetariano'],
        meals: {
            breakfast: { carb: ['Pan Integral', 'Avena Cocida'], protein: 'Queso Cottage', fat: 'Mantequilla de Almendra', extra: 'Fresas' },
            morningSnack: { carb: 'Naranja', protein: 'Yogurt Natural (Sin azúcar)', fat: 'Almendras' },
            lunch: { protein: 'Lentejas Rojas', carb: ['Arroz Blanco Cocido', 'Tortilla de Maíz'], fat: 'Aceite de Oliva', extra: 'Zanahoria' },
            afternoonSnack: { carb: 'Arándanos', protein: 'Yogurt Natural (Sin azúcar)', fat: 'Nueces' },
            dinner: { protein: 'Huevo Cocido', carb: ['Couscous Cocido', 'Quinoa Cocida'], fat: 'Aguacate', extra: 'Calabaza de Castilla' },
        },
    },
    {
        name: 'Huevo y Aguacate Clásico',
        category: 'vegetarian',
        tags: ['huevo', 'aguacate', 'clasico'],
        meals: {
            breakfast: { carb: ['Pan Integral', 'Avena Cocida'], protein: 'Huevo Cocido', fat: 'Aguacate', extra: 'Manzana' },
            morningSnack: { carb: 'Fresas', protein: 'Yogurt Griego Natural', fat: 'Almendras' },
            lunch: { protein: 'Queso Panela', carb: ['Arroz Blanco Cocido', 'Tortilla de Maíz'], fat: 'Aceite de Oliva', extra: 'Brócoli' },
            afternoonSnack: { carb: 'Naranja', protein: 'Queso Cottage', fat: 'Almendras' },
            dinner: { protein: 'Huevo Cocido', carb: ['Papa Cocida', 'Camote Cocido'], fat: 'Aguacate', extra: 'Espinacas Cocidas' },
        },
    },
];

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Conectado a MongoDB');

    const allFoods = await Food.find({});
    const foodMap = new Map(allFoods.map((f) => [f.name, f]));
    console.log(`Catálogo cargado: ${allFoods.length} alimentos`);

    const templates = [];
    const errors = [];
    for (const recipe of RECIPES) {
        for (const band of BANDS) {
            try {
                templates.push(buildTemplate(foodMap, recipe, band));
            } catch (err) {
                errors.push(`${recipe.name} · ${band.lo}-${band.hi}: ${err.message}`);
            }
        }
    }

    console.log(`\nGenerados: ${templates.length} / ${RECIPES.length * BANDS.length} esperados`);
    if (errors.length > 0) {
        console.log(`\n❌ ${errors.length} error(es):`);
        errors.forEach((e) => console.log(`  - ${e}`));
    }

    // Reporte de validación: calorías/macros logrados vs. rango declarado.
    const fueraDeRango = templates.filter((t) => t._achieved.calories < t._band.lo || t._achieved.calories >= t._band.hi);
    const macroFueraDeRango = templates.filter((t) => {
        const { carbP, protP, fatP } = t._achieved;
        return carbP < 0.49 || carbP > 0.56 || protP < 0.14 || protP > 0.21 || fatP < 0.24 || fatP > 0.31;
    });

    const avg = (key) => templates.reduce((s, t) => s + t._achieved[key], 0) / templates.length;
    console.log(
        `\nPromedio de los ${templates.length} menús: C${(avg('carbP') * 100).toFixed(1)}% P${(avg('protP') * 100).toFixed(1)}% F${(avg('fatP') * 100).toFixed(1)}%`
    );

    console.log(`\nCalorías fuera de su rango declarado: ${fueraDeRango.length}`);
    fueraDeRango.forEach((t) => console.log(`  - ${t.name}: ${t._achieved.calories.toFixed(0)} kcal`));

    // Aviso, no bloquea: un solo alimento de baja densidad calórica (pan,
    // tortilla) cubriendo todo el carbohidrato de una comida grande en las
    // bandas más altas puede pedir una porción del tamaño de una bolsa entera.
    const porcionesGrandes = [];
    for (const t of templates) {
        for (const [mealKey, meal] of Object.entries(t.defaultMeals)) {
            for (const f of meal.foods) {
                if (f.quantityGrams > 350) {
                    const foodName = allFoods.find((af) => String(af._id) === String(f.foodRef)).name;
                    porcionesGrandes.push(`${t.name} · ${mealKey}: ${f.quantityGrams}g de ${foodName}`);
                }
            }
        }
    }
    console.log(`\nPorciones de un solo alimento por revisar (>350g): ${porcionesGrandes.length}`);
    porcionesGrandes.slice(0, 20).forEach((p) => console.log(`  - ${p}`));
    if (porcionesGrandes.length > 20) console.log(`  ... y ${porcionesGrandes.length - 20} más.`);

    console.log(`Distribución de macros fuera de 49-56% / 14-21% / 24-31%: ${macroFueraDeRango.length}`);
    macroFueraDeRango.forEach((t) =>
        console.log(
            `  - ${t.name}: C${(t._achieved.carbP * 100).toFixed(1)}% P${(t._achieved.protP * 100).toFixed(1)}% F${(t._achieved.fatP * 100).toFixed(1)}%`
        )
    );

    // Muestra de 3 menús completos para inspección manual.
    console.log('\n── Muestra ──');
    for (const t of [templates[0], templates[Math.floor(templates.length / 2)], templates[templates.length - 1]]) {
        if (!t) continue;
        console.log(`\n${t.name} — ${t.targetCalories} kcal (P${t.targetMacros.protein}g C${t.targetMacros.carbohydrates}g F${t.targetMacros.fats}g)`);
        for (const [mealKey, meal] of Object.entries(t.defaultMeals)) {
            const desc = meal.foods.map((f) => `${f.quantity} de ${allFoods.find((af) => String(af._id) === String(f.foodRef)).name} (${f.calories} kcal)`).join(', ');
            console.log(`  ${mealKey} (${meal.time}): ${desc}`);
        }
    }

    if (errors.length > 0) {
        console.log('\n❌ Hay errores — no se insertó nada. Corrige las recetas señaladas y vuelve a correr.');
        process.exit(1);
    }

    if (DRY_RUN) {
        console.log('\n✅ Dry-run limpio. Corre sin --dry-run para insertar en la base de datos.');
        process.exit(0);
    }

    const adminUser = await User.findOne();
    if (!adminUser) {
        console.error('No hay usuarios — corre seed:users primero.');
        process.exit(1);
    }

    const toInsert = templates.map(({ _band, _achieved, ...t }) => ({
        ...t,
        createdBy: adminUser._id,
        generatorTag: GENERATOR_TAG,
    }));

    // Idempotente: solo reemplaza las plantillas de esta misma corrida
    // (identificadas por `generatorTag`), no las 3 plantillas manuales de
    // `seedTemplates.js` — ambas usan `isSystemTemplate: true`, pero solo
    // estas traen el tag.
    const { deletedCount } = await DietTemplate.deleteMany({ generatorTag: GENERATOR_TAG });
    if (deletedCount > 0) {
        console.log(`\n🗑️  Borradas ${deletedCount} plantillas generadas de una corrida anterior.`);
    }

    await DietTemplate.insertMany(toInsert);
    console.log(`\n✅ Insertadas ${toInsert.length} plantillas nuevas (createdBy: ${adminUser.name}).`);
    process.exit(0);
}

run().catch((err) => {
    console.error('Error generando plantillas:', err);
    process.exit(1);
});
