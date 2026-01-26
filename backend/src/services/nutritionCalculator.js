/**
 * Nutrition Calculator Service
 * Provides calculations for BMR, TDEE, macros, body composition, and ideal weight
 */

class NutritionCalculator {

    /**
     * Calculate Basal Metabolic Rate (BMR)
     * @param {number} weight - Weight in kg
     * @param {number} height - Height in cm
     * @param {number} age - Age in years
     * @param {string} gender - 'male' or 'female'
     * @param {string} formula - 'mifflin' or 'harris'
     * @returns {number} BMR in kcal/day
     */
    static calculateBMR(weight, height, age, gender, formula = 'mifflin') {
        if (formula === 'mifflin') {
            // Mifflin-St Jeor Equation (more accurate)
            const bmr = gender === 'male'
                ? (10 * weight) + (6.25 * height) - (5 * age) + 5
                : (10 * weight) + (6.25 * height) - (5 * age) - 161;
            return Math.round(bmr);
        } else if (formula === 'harris') {
            // Harris-Benedict Equation
            const bmr = gender === 'male'
                ? 66.5 + (13.75 * weight) + (5.003 * height) - (6.75 * age)
                : 655.1 + (9.563 * weight) + (1.850 * height) - (4.676 * age);
            return Math.round(bmr);
        }
        throw new Error('Invalid formula. Use "mifflin" or "harris"');
    }

    /**
     * Calculate Total Daily Energy Expenditure (TDEE)
     * @param {number} bmr - Basal Metabolic Rate
     * @param {string} activityLevel - Activity level
     * @returns {number} TDEE in kcal/day
     */
    static calculateTDEE(bmr, activityLevel) {
        const activityFactors = {
            sedentary: 1.2,              // Little or no exercise
            lightly_active: 1.375,       // Light exercise 1-3 days/week
            moderately_active: 1.55,     // Moderate exercise 3-5 days/week
            very_active: 1.725,          // Hard exercise 6-7 days/week
            extremely_active: 1.9        // Very hard exercise & physical job
        };

        const factor = activityFactors[activityLevel] || 1.2;
        return Math.round(bmr * factor);
    }

    /**
     * Calculate macronutrient distribution
     * @param {number} calories - Total daily calories
     * @param {string} distribution - Distribution type
     * @returns {object} Macros in grams and calories
     */
    static calculateMacros(calories, distribution = 'balanced') {
        const distributions = {
            balanced: { protein: 0.30, carbs: 0.40, fat: 0.30 },
            low_carb: { protein: 0.35, carbs: 0.25, fat: 0.40 },
            high_protein: { protein: 0.40, carbs: 0.35, fat: 0.25 },
            keto: { protein: 0.25, carbs: 0.05, fat: 0.70 },
            zone: { protein: 0.30, carbs: 0.40, fat: 0.30 }
        };

        const dist = distributions[distribution] || distributions.balanced;

        return {
            protein: {
                grams: Math.round((calories * dist.protein) / 4),
                calories: Math.round(calories * dist.protein),
                percentage: Math.round(dist.protein * 100)
            },
            carbs: {
                grams: Math.round((calories * dist.carbs) / 4),
                calories: Math.round(calories * dist.carbs),
                percentage: Math.round(dist.carbs * 100)
            },
            fat: {
                grams: Math.round((calories * dist.fat) / 9),
                calories: Math.round(calories * dist.fat),
                percentage: Math.round(dist.fat * 100)
            }
        };
    }

    /**
     * Calculate body fat percentage using Jackson-Pollock 3-site formula
     * @param {object} skinfolds - Skinfold measurements
     * @param {number} age - Age in years
     * @param {string} gender - 'male' or 'female'
     * @returns {number} Body fat percentage
     */
    static calculateBodyFat3Site(skinfolds, age, gender) {
        if (gender === 'male') {
            // Male: chest, abdominal, thigh
            const sum = (skinfolds.chest || 0) + (skinfolds.abdominal || 0) + (skinfolds.thigh || 0);
            const density = 1.10938 - (0.0008267 * sum) + (0.0000016 * sum * sum) - (0.0002574 * age);
            const bodyFat = ((4.95 / density) - 4.50) * 100;
            return Math.round(bodyFat * 10) / 10;
        } else {
            // Female: triceps, suprailiac, thigh
            const sum = (skinfolds.triceps || 0) + (skinfolds.suprailiac || 0) + (skinfolds.thigh || 0);
            const density = 1.0994921 - (0.0009929 * sum) + (0.0000023 * sum * sum) - (0.0001392 * age);
            const bodyFat = ((4.95 / density) - 4.50) * 100;
            return Math.round(bodyFat * 10) / 10;
        }
    }

    /**
     * Calculate body fat percentage using Jackson-Pollock 7-site formula
     * @param {object} skinfolds - All 7 skinfold measurements
     * @param {number} age - Age in years
     * @param {string} gender - 'male' or 'female'
     * @returns {number} Body fat percentage
     */
    static calculateBodyFat7Site(skinfolds, age, gender) {
        const sum = (skinfolds.chest || 0) + (skinfolds.abdominal || 0) + (skinfolds.thigh || 0) +
            (skinfolds.triceps || 0) + (skinfolds.subscapular || 0) +
            (skinfolds.suprailiac || 0) + (skinfolds.calf || 0);

        if (gender === 'male') {
            const density = 1.112 - (0.00043499 * sum) + (0.00000055 * sum * sum) - (0.00028826 * age);
            const bodyFat = ((4.95 / density) - 4.50) * 100;
            return Math.round(bodyFat * 10) / 10;
        } else {
            const density = 1.097 - (0.00046971 * sum) + (0.00000056 * sum * sum) - (0.00012828 * age);
            const bodyFat = ((4.95 / density) - 4.50) * 100;
            return Math.round(bodyFat * 10) / 10;
        }
    }

    /**
     * Calculate body composition from body fat percentage
     * @param {number} weight - Total weight in kg
     * @param {number} bodyFatPercentage - Body fat percentage
     * @returns {object} Body composition breakdown
     */
    static calculateBodyComposition(weight, bodyFatPercentage) {
        const fatMass = (weight * bodyFatPercentage) / 100;
        const leanMass = weight - fatMass;

        return {
            fatMass: Math.round(fatMass * 10) / 10,
            leanMass: Math.round(leanMass * 10) / 10,
            muscleMass: Math.round(leanMass * 0.45 * 10) / 10, // Aproximación
            boneMass: Math.round(leanMass * 0.15 * 10) / 10    // Aproximación
        };
    }

    /**
     * Calculate ideal weight using Devine formula
     * @param {number} height - Height in cm
     * @param {string} gender - 'male' or 'female'
     * @returns {number} Ideal weight in kg
     */
    static calculateIdealWeight(height, gender) {
        const heightInInches = height / 2.54;
        if (gender === 'male') {
            return Math.round(50 + 2.3 * (heightInInches - 60));
        } else {
            return Math.round(45.5 + 2.3 * (heightInInches - 60));
        }
    }

    /**
     * Calculate waist-to-hip ratio
     * @param {number} waist - Waist circumference in cm
     * @param {number} hip - Hip circumference in cm
     * @returns {object} WHR and health risk
     */
    static calculateWHR(waist, hip) {
        const whr = waist / hip;
        const rounded = Math.round(whr * 100) / 100;

        // Health risk assessment
        let risk = 'low';
        if (whr > 0.90 || whr > 0.85) { // male > 0.90, female > 0.85
            risk = 'high';
        } else if (whr > 0.85 || whr > 0.80) {
            risk = 'moderate';
        }

        return {
            ratio: rounded,
            risk: risk
        };
    }

    /**
     * Calculate BMI
     * @param {number} weight - Weight in kg
     * @param {number} height - Height in cm
     * @returns {object} BMI value and category
     */
    static calculateBMI(weight, height) {
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        const rounded = Math.round(bmi * 10) / 10;

        let category = 'normal';
        if (rounded < 18.5) category = 'underweight';
        else if (rounded >= 25 && rounded < 30) category = 'overweight';
        else if (rounded >= 30) category = 'obese';

        return {
            value: rounded,
            category: category
        };
    }
}

export default NutritionCalculator;
