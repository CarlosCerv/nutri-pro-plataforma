import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import DietTemplate from '../models/DietTemplate.js';
import Food from '../models/Food.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const DRY_RUN = process.argv.includes('--dry-run');

/**
 * Genera plantillas de sistema (DietTemplate) a partir del catálogo real de
 * `Food`, no texto libre. Para 20 recetas × 17 rangos de 100 kcal
 * (1300-1400 ... 2900-3000) resuelve los gramos de cada alimento con álgebra
 * lineal contra los macros de esa receta, en vez de estimarlos a mano — con
 * 340 menús a mano el error de redondeo humano sería mayor que el margen de
 * la distribución objetivo.
 */

// Distribución de macronutrientes objetivo del DÍA (estándar, dentro de 50-55/15-20/25-30).
const MACROS = { carbP: 0.52, protP: 0.18, fatP: 0.30 };

// Objetivo que se resuelve exacto en desayuno/comida/cena (80% del día). Las
// colaciones (solveSnack) no se fuerzan al macro exacto y en la práctica
// salen más grasas que el objetivo general — su "ancla de grasa" (fruto seco,
// aceite) es, proporcionalmente, más concentrada que en una comida grande.
// Se compensa aquí: bajar el objetivo de grasa de las comidas grandes para
// que el promedio ponderado del día completo (80% comidas + 20% colaciones)
// termine cerca de MACROS.
const MACROS_MAIN = { carbP: 0.53, protP: 0.18, fatP: 0.29 };

// Reparto de calorías del día entre tiempos de comida.
const MEAL_SPLIT = {
    breakfast: 0.25,
    morningSnack: 0.10,
    lunch: 0.30,
    afternoonSnack: 0.10,
    dinner: 0.25,
};

// 17 rangos de 100 kcal: 1300-1400 ... 2900-3000. El objetivo se fija 60% del
// rango hacia arriba (no en el punto medio): el redondeo a gramos enteros de
// ~15 alimentos por menú resta unas pocas kcal en el agregado, y un objetivo
// justo a la mitad del rango deja muy poco margen antes de cruzar el límite
// inferior declarado.
const BANDS = [];
for (let lo = 1300; lo < 3000; lo += 100) {
    BANDS.push({ lo, hi: lo + 100, mid: lo + 75 });
}

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

// ── Álgebra ─────────────────────────────────────────────────────────

function det3(m) {
    return (
        m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
        m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
        m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
    );
}

function solve3x3(A, b) {
    const D = det3(A);
    if (Math.abs(D) < 1e-9) return null;
    const replCol = (col) => A.map((row, i) => row.map((v, j) => (j === col ? b[i] : v)));
    return [det3(replCol(0)) / D, det3(replCol(1)) / D, det3(replCol(2)) / D];
}

const per100 = (food) => ({
    e: food.nutrition.energy || 0,
    p: food.nutrition.protein || 0,
    c: food.nutrition.carbohydrates || 0,
    f: food.nutrition.fat || 0,
});

function contrib(food, grams) {
    const n = per100(food);
    const k = grams / 100;
    return { calories: n.e * k, protein: n.p * k, carbohydrates: n.c * k, fats: n.f * k };
}

/**
 * Resuelve un alimento (nombre) o una pareja (`[nombreA, nombreB]`) como un
 * único "ancla virtual" cuyo per-100g es el promedio de ambos. Repartir el
 * carbohidrato de una comida grande entre dos alimentos evita que, a 3000
 * kcal, un solo pan o una sola tortilla tengan que cargar con los ~100g de
 * carbohidrato del día completo — 500g de un mismo alimento en una sola
 * comida no es una porción real, aunque la cuenta de calorías sí cierre.
 */
function resolveAnchor(foodMap, nameOrPair) {
    const names = Array.isArray(nameOrPair) ? nameOrPair : [nameOrPair];
    const foods = names.map((n) => {
        const food = foodMap.get(n);
        if (!food) throw new Error(`Alimento no encontrado en el catálogo: ${n}`);
        return food;
    });
    const avg = (key) => foods.reduce((s, f) => s + (f.nutrition[key] || 0), 0) / foods.length;
    return {
        foods,
        per100: { e: avg('energy'), p: avg('protein'), c: avg('carbohydrates'), f: avg('fat') },
    };
}

/** Resuelve gramos de [carb, protein, fat] para llegar exacto al macro objetivo de `targetKcal`, tras descontar `extra` (porción fija). */
function solveMainMeal(foodMap, spec, targetKcal) {
    const carbAnchor = resolveAnchor(foodMap, spec.carb);
    const proteinFood = foodMap.get(spec.protein);
    const fatFood = foodMap.get(spec.fat);
    const extraFood = spec.extra ? foodMap.get(spec.extra) : null;
    if (!proteinFood || !fatFood || (spec.extra && !extraFood)) {
        throw new Error(`Alimento no encontrado en el catálogo: ${JSON.stringify(spec)}`);
    }

    const extraGrams = extraFood ? extraFood.servingSizes[0].grams : 0;
    const extra = extraFood ? contrib(extraFood, extraGrams) : { calories: 0, protein: 0, carbohydrates: 0, fats: 0 };

    const targetCarbsG = (targetKcal * MACROS_MAIN.carbP) / 4;
    const targetProteinG = (targetKcal * MACROS_MAIN.protP) / 4;
    const targetFatG = (targetKcal * MACROS_MAIN.fatP) / 9;

    const nc = carbAnchor.per100;
    const np = per100(proteinFood);
    const nf = per100(fatFood);

    const A = [
        [nc.c / 100, np.c / 100, nf.c / 100],
        [nc.p / 100, np.p / 100, nf.p / 100],
        [nc.f / 100, np.f / 100, nf.f / 100],
    ];
    const b = [targetCarbsG - extra.carbohydrates, targetProteinG - extra.protein, targetFatG - extra.fats];
    const sol = solve3x3(A, b);
    if (!sol) throw new Error(`Sistema singular para receta con ${spec.carb}/${spec.protein}/${spec.fat}`);
    const [gCarbTotal, gProt, gFat] = sol;

    const items = [];
    if (extraFood) items.push({ food: extraFood, grams: extraGrams });
    for (const carbFood of carbAnchor.foods) {
        items.push({ food: carbFood, grams: gCarbTotal / carbAnchor.foods.length });
    }
    items.push({ food: proteinFood, grams: gProt }, { food: fatFood, grams: gFat });
    return items;
}

const SNACK_KEYS = new Set(['morningSnack', 'afternoonSnack']);

/**
 * Escala proporcionalmente el trío carb/protein/fat de una colación hasta
 * llegar a `targetKcal`, en sus porciones habituales relativas entre sí.
 *
 * No se le exige el macro exacto como a las comidas grandes: con solo ~10%
 * de las calorías del día, el "ancla de proteína" (yogurt, queso, hummus)
 * ya trae de por sí algo de grasa — a veces más que el presupuesto de grasa
 * completo de la colación —, así que el álgebra exacta que sí funciona bien
 * en desayuno/comida/cena pide aquí gramos negativos para compensarlo.
 */
function solveSnack(foodMap, spec, targetKcal) {
    // La porción de grasa se toma a un tercio de su ración habitual: un puño
    // entero de almendras o una cucharada completa de aceite ya son, por sí
    // solos, más de lo que le corresponde a una colación de ~10% del día.
    const roles = [
        [spec.carb, 1],
        [spec.protein, 1],
        [spec.fat, 1 / 3],
    ];
    const items = roles.map(([name, portion]) => {
        const food = foodMap.get(name);
        if (!food) throw new Error(`Alimento no encontrado: ${name}`);
        return { food, baseGrams: food.servingSizes[0].grams * portion };
    });
    const baseKcal = items.reduce((sum, it) => sum + contrib(it.food, it.baseGrams).calories, 0);
    const scale = targetKcal / baseKcal;
    return items.map((it) => ({ food: it.food, grams: it.baseGrams * scale }));
}

function buildMeal(foodMap, mealKey, spec, targetKcal, time) {
    const rawItems = SNACK_KEYS.has(mealKey) ? solveSnack(foodMap, spec, targetKcal) : solveMainMeal(foodMap, spec, targetKcal);

    // -0.5g de margen: el álgebra de punto flotante a veces deja un residuo
    // negativo minúsculo (p.ej. -0.02) donde el valor real es esencialmente
    // cero, no un ancla mal elegida.
    const negatives = rawItems.filter((it) => it.grams < -0.5);
    if (negatives.length > 0) {
        throw new Error(
            `Gramos inválidos en ${mealKey} (${negatives.map((n) => `${n.food.name}: ${n.grams.toFixed(1)}g`).join(', ')}) — receta necesita otro alimento ancla.`
        );
    }
    // Un resultado entre 0 y 2g es válido (el resto de la comida ya cubrió casi
    // todo ese macro) pero no es una porción real — se sube a un mínimo de
    // "una pizca" en vez de mostrar "0.6 g de aceite" en el menú.
    const MIN_GRAMS = 2;
    const items = rawItems.map((it) => (it.grams < MIN_GRAMS ? { ...it, grams: MIN_GRAMS } : it));

    const foods = items.map((it) => {
        const grams = Math.round(it.grams);
        const c = contrib(it.food, grams);
        const serving = it.food.servingSizes?.[0];
        return {
            foodRef: it.food._id,
            quantity: serving ? describeQuantity(grams, serving) : `${grams} g`,
            quantityGrams: grams,
            calories: Math.round(c.calories),
            protein: Math.round(c.protein * 10) / 10,
            carbohydrates: Math.round(c.carbohydrates * 10) / 10,
            fats: Math.round(c.fats * 10) / 10,
        };
    });

    return { time, foods };
}

/** "1.5 taza", "80 g" — múltiplo de la porción común del alimento cuando es razonable, gramos si no. */
function describeQuantity(grams, serving) {
    const multiple = grams / serving.grams;
    if (multiple >= 0.25 && multiple <= 6) {
        const rounded = Math.round(multiple * 4) / 4; // cuartos
        return `${rounded} ${serving.name}`;
    }
    return `${grams} g`;
}

const MEAL_TIMES = {
    breakfast: '08:00',
    morningSnack: '11:00',
    lunch: '14:00',
    afternoonSnack: '17:30',
    dinner: '20:30',
};

function buildTemplate(foodMap, recipe, band) {
    const dayKcal = band.mid;
    const defaultMeals = {};
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    for (const [mealKey, split] of Object.entries(MEAL_SPLIT)) {
        const mealTargetKcal = dayKcal * split;
        const meal = buildMeal(foodMap, mealKey, recipe.meals[mealKey], mealTargetKcal, MEAL_TIMES[mealKey]);
        defaultMeals[mealKey] = meal;
        for (const f of meal.foods) {
            totalCalories += f.calories;
            totalProtein += f.protein;
            totalCarbs += f.carbohydrates;
            totalFats += f.fats;
        }
    }

    return {
        name: `${recipe.name} · ${band.lo}-${band.hi} kcal`,
        description: `Menú de ${band.lo} a ${band.hi} kcal con desayuno, colación matutina, comida, colación vespertina y cena. Distribución 52% carbohidratos / 18% proteína / 30% grasa.`,
        category: recipe.category,
        tags: [...recipe.tags, `${band.lo}-${band.hi}kcal`],
        targetCalories: Math.round(totalCalories),
        targetMacros: {
            protein: Math.round(totalProtein),
            carbohydrates: Math.round(totalCarbs),
            fats: Math.round(totalFats),
        },
        defaultMeals,
        isSystemTemplate: true,
        isPublic: true,
        _band: band,
        _achieved: {
            calories: totalCalories,
            carbP: (totalCarbs * 4) / totalCalories,
            protP: (totalProtein * 4) / totalCalories,
            fatP: (totalFats * 9) / totalCalories,
        },
    };
}

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

    const toInsert = templates.map(({ _band, _achieved, ...t }) => ({ ...t, createdBy: adminUser._id }));
    await DietTemplate.insertMany(toInsert);
    console.log(`\n✅ Insertadas ${toInsert.length} plantillas nuevas (createdBy: ${adminUser.name}).`);
    process.exit(0);
}

run().catch((err) => {
    console.error('Error generando plantillas:', err);
    process.exit(1);
});
