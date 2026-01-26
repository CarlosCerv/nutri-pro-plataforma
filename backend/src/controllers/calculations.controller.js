import NutritionCalculator from '../services/nutritionCalculator.js';
import Patient from '../models/Patient.js';

// Calculate BMR
export const calculateBMR = async (req, res) => {
    try {
        const { weight, height, age, gender, formula = 'mifflin' } = req.body;

        if (!weight || !height || !age || !gender) {
            return res.status(400).json({
                success: false,
                message: 'Faltan parámetros requeridos: weight, height, age, gender'
            });
        }

        const bmr = NutritionCalculator.calculateBMR(weight, height, age, gender, formula);

        res.json({
            success: true,
            data: {
                bmr,
                formula,
                unit: 'kcal/day'
            }
        });
    } catch (error) {
        console.error('Error calculating BMR:', error);
        res.status(500).json({
            success: false,
            message: 'Error al calcular TMB',
            error: error.message
        });
    }
};

// Calculate TDEE
export const calculateTDEE = async (req, res) => {
    try {
        const { weight, height, age, gender, activityLevel, formula = 'mifflin' } = req.body;

        if (!weight || !height || !age || !gender || !activityLevel) {
            return res.status(400).json({
                success: false,
                message: 'Faltan parámetros requeridos'
            });
        }

        const bmr = NutritionCalculator.calculateBMR(weight, height, age, gender, formula);
        const tdee = NutritionCalculator.calculateTDEE(bmr, activityLevel);

        res.json({
            success: true,
            data: {
                bmr,
                tdee,
                activityLevel,
                unit: 'kcal/day'
            }
        });
    } catch (error) {
        console.error('Error calculating TDEE:', error);
        res.status(500).json({
            success: false,
            message: 'Error al calcular GET',
            error: error.message
        });
    }
};

// Calculate macros
export const calculateMacros = async (req, res) => {
    try {
        const { calories, distribution = 'balanced' } = req.body;

        if (!calories) {
            return res.status(400).json({
                success: false,
                message: 'Parámetro requerido: calories'
            });
        }

        const macros = NutritionCalculator.calculateMacros(calories, distribution);

        res.json({
            success: true,
            data: {
                totalCalories: calories,
                distribution,
                macros
            }
        });
    } catch (error) {
        console.error('Error calculating macros:', error);
        res.status(500).json({
            success: false,
            message: 'Error al calcular macronutrientes',
            error: error.message
        });
    }
};

// Calculate complete nutrition plan for patient
export const calculateNutritionPlan = async (req, res) => {
    try {
        const { patientId, goal, distribution = 'balanced' } = req.body;

        // Get patient data
        const patient = await Patient.findOne({
            _id: patientId,
            nutritionist: req.user._id
        });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Paciente no encontrado'
            });
        }

        const weight = patient.anthropometry?.weight;
        const height = patient.anthropometry?.height;
        const age = patient.dateOfBirth
            ? Math.floor((Date.now() - new Date(patient.dateOfBirth)) / 31557600000)
            : null;
        const gender = patient.gender;
        const activityLevel = patient.lifestyle?.activityLevel || 'sedentary';

        if (!weight || !height || !age || !gender) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos del paciente (peso, altura, edad, género)'
            });
        }

        // Calculate BMR and TDEE
        const bmr = NutritionCalculator.calculateBMR(weight, height, age, gender);
        const tdee = NutritionCalculator.calculateTDEE(bmr, activityLevel);

        // Adjust calories based on goal
        let targetCalories = tdee;
        if (goal === 'weight_loss') {
            targetCalories = Math.round(tdee * 0.85); // 15% deficit
        } else if (goal === 'weight_gain') {
            targetCalories = Math.round(tdee * 1.15); // 15% surplus
        } else if (goal === 'muscle_gain') {
            targetCalories = Math.round(tdee * 1.10); // 10% surplus
        }

        // Calculate macros
        const macros = NutritionCalculator.calculateMacros(targetCalories, distribution);

        // Calculate ideal weight
        const idealWeight = NutritionCalculator.calculateIdealWeight(height, gender);

        // Calculate BMI
        const bmi = NutritionCalculator.calculateBMI(weight, height);

        res.json({
            success: true,
            data: {
                patient: {
                    name: `${patient.firstName} ${patient.lastName}`,
                    currentWeight: weight,
                    idealWeight,
                    bmi
                },
                energyRequirements: {
                    bmr,
                    tdee,
                    targetCalories,
                    goal
                },
                macronutrients: macros,
                recommendations: {
                    waterIntake: Math.round(weight * 35), // ml per day
                    meals: 5, // Recommended number of meals
                    proteinPerKg: Math.round(macros.protein.grams / weight * 10) / 10
                }
            }
        });
    } catch (error) {
        console.error('Error calculating nutrition plan:', error);
        res.status(500).json({
            success: false,
            message: 'Error al calcular plan nutricional',
            error: error.message
        });
    }
};

// Calculate body composition
export const calculateBodyComposition = async (req, res) => {
    try {
        const { weight, bodyFatPercentage } = req.body;

        if (!weight || !bodyFatPercentage) {
            return res.status(400).json({
                success: false,
                message: 'Parámetros requeridos: weight, bodyFatPercentage'
            });
        }

        const composition = NutritionCalculator.calculateBodyComposition(weight, bodyFatPercentage);

        res.json({
            success: true,
            data: {
                totalWeight: weight,
                bodyFatPercentage,
                ...composition
            }
        });
    } catch (error) {
        console.error('Error calculating body composition:', error);
        res.status(500).json({
            success: false,
            message: 'Error al calcular composición corporal',
            error: error.message
        });
    }
};
