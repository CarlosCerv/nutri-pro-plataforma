import { useState } from 'react';
import { calculationsAPI } from '../services/advancedApi';
import { Calculator, Activity, TrendingUp, Zap } from 'lucide-react';
import './NutritionCalculator.css';

const NutritionCalculator = () => {
    const [activeTab, setActiveTab] = useState('bmr');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        weight: '',
        height: '',
        age: '',
        gender: 'male',
        activityLevel: 'moderately_active',
        formula: 'mifflin',
        calories: '',
        distribution: 'balanced'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const calculateBMR = async () => {
        setLoading(true);
        try {
            const response = await calculationsAPI.calculateBMR({
                weight: parseFloat(formData.weight),
                height: parseFloat(formData.height),
                age: parseInt(formData.age),
                gender: formData.gender,
                formula: formData.formula
            });
            setResults(response.data.data);
        } catch (error) {
            console.error('Error calculating BMR:', error);
            alert('Error al calcular TMB');
        }
        setLoading(false);
    };

    const calculateTDEE = async () => {
        setLoading(true);
        try {
            const response = await calculationsAPI.calculateTDEE({
                weight: parseFloat(formData.weight),
                height: parseFloat(formData.height),
                age: parseInt(formData.age),
                gender: formData.gender,
                activityLevel: formData.activityLevel,
                formula: formData.formula
            });
            setResults(response.data.data);
        } catch (error) {
            console.error('Error calculating TDEE:', error);
            alert('Error al calcular GET');
        }
        setLoading(false);
    };

    const calculateMacros = async () => {
        setLoading(true);
        try {
            const response = await calculationsAPI.calculateMacros({
                calories: parseInt(formData.calories),
                distribution: formData.distribution
            });
            setResults(response.data.data);
        } catch (error) {
            console.error('Error calculating macros:', error);
            alert('Error al calcular macronutrientes');
        }
        setLoading(false);
    };

    return (
        <div className="nutrition-calculator-page fade-in">
            <div className="page-header">
                <div>
                    <h1>Calculadora Nutricional</h1>
                    <p>Herramientas profesionales de cálculo</p>
                </div>
            </div>

            <div className="calculator-tabs">
                <button
                    className={`tab ${activeTab === 'bmr' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('bmr'); setResults(null); }}
                >
                    <Zap size={20} />
                    TMB
                </button>
                <button
                    className={`tab ${activeTab === 'tdee' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('tdee'); setResults(null); }}
                >
                    <Activity size={20} />
                    GET
                </button>
                <button
                    className={`tab ${activeTab === 'macros' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('macros'); setResults(null); }}
                >
                    <TrendingUp size={20} />
                    Macros
                </button>
            </div>

            <div className="calculator-content">
                {/* BMR Calculator */}
                {activeTab === 'bmr' && (
                    <div className="calculator-card card">
                        <h3>Tasa Metabólica Basal (TMB)</h3>
                        <p className="description">Calorías que tu cuerpo quema en reposo</p>

                        <div className="form-grid">
                            <div className="form-group">
                                <label className="label">Peso (kg)</label>
                                <input
                                    type="number"
                                    name="weight"
                                    className="input"
                                    value={formData.weight}
                                    onChange={handleChange}
                                    placeholder="70"
                                />
                            </div>

                            <div className="form-group">
                                <label className="label">Altura (cm)</label>
                                <input
                                    type="number"
                                    name="height"
                                    className="input"
                                    value={formData.height}
                                    onChange={handleChange}
                                    placeholder="175"
                                />
                            </div>

                            <div className="form-group">
                                <label className="label">Edad (años)</label>
                                <input
                                    type="number"
                                    name="age"
                                    className="input"
                                    value={formData.age}
                                    onChange={handleChange}
                                    placeholder="30"
                                />
                            </div>

                            <div className="form-group">
                                <label className="label">Género</label>
                                <select
                                    name="gender"
                                    className="input"
                                    value={formData.gender}
                                    onChange={handleChange}
                                >
                                    <option value="male">Masculino</option>
                                    <option value="female">Femenino</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="label">Fórmula</label>
                                <select
                                    name="formula"
                                    className="input"
                                    value={formData.formula}
                                    onChange={handleChange}
                                >
                                    <option value="mifflin">Mifflin-St Jeor (Recomendada)</option>
                                    <option value="harris">Harris-Benedict</option>
                                </select>
                            </div>
                        </div>

                        <button
                            className="btn btn-primary"
                            onClick={calculateBMR}
                            disabled={loading || !formData.weight || !formData.height || !formData.age}
                        >
                            <Calculator size={20} />
                            {loading ? 'Calculando...' : 'Calcular TMB'}
                        </button>

                        {results && results.bmr && (
                            <div className="results-card">
                                <h4>Resultado</h4>
                                <div className="result-value">
                                    <span className="value">{results.bmr}</span>
                                    <span className="unit">kcal/día</span>
                                </div>
                                <p className="result-description">
                                    Tu cuerpo quema {results.bmr} calorías en reposo absoluto
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* TDEE Calculator */}
                {activeTab === 'tdee' && (
                    <div className="calculator-card card">
                        <h3>Gasto Energético Total (GET)</h3>
                        <p className="description">Calorías totales que quemas al día</p>

                        <div className="form-grid">
                            <div className="form-group">
                                <label className="label">Peso (kg)</label>
                                <input
                                    type="number"
                                    name="weight"
                                    className="input"
                                    value={formData.weight}
                                    onChange={handleChange}
                                    placeholder="70"
                                />
                            </div>

                            <div className="form-group">
                                <label className="label">Altura (cm)</label>
                                <input
                                    type="number"
                                    name="height"
                                    className="input"
                                    value={formData.height}
                                    onChange={handleChange}
                                    placeholder="175"
                                />
                            </div>

                            <div className="form-group">
                                <label className="label">Edad (años)</label>
                                <input
                                    type="number"
                                    name="age"
                                    className="input"
                                    value={formData.age}
                                    onChange={handleChange}
                                    placeholder="30"
                                />
                            </div>

                            <div className="form-group">
                                <label className="label">Género</label>
                                <select
                                    name="gender"
                                    className="input"
                                    value={formData.gender}
                                    onChange={handleChange}
                                >
                                    <option value="male">Masculino</option>
                                    <option value="female">Femenino</option>
                                </select>
                            </div>

                            <div className="form-group full-width">
                                <label className="label">Nivel de Actividad</label>
                                <select
                                    name="activityLevel"
                                    className="input"
                                    value={formData.activityLevel}
                                    onChange={handleChange}
                                >
                                    <option value="sedentary">Sedentario (poco o ningún ejercicio)</option>
                                    <option value="lightly_active">Ligeramente activo (1-3 días/semana)</option>
                                    <option value="moderately_active">Moderadamente activo (3-5 días/semana)</option>
                                    <option value="very_active">Muy activo (6-7 días/semana)</option>
                                    <option value="extremely_active">Extremadamente activo (ejercicio intenso diario)</option>
                                </select>
                            </div>
                        </div>

                        <button
                            className="btn btn-primary"
                            onClick={calculateTDEE}
                            disabled={loading || !formData.weight || !formData.height || !formData.age}
                        >
                            <Calculator size={20} />
                            {loading ? 'Calculando...' : 'Calcular GET'}
                        </button>

                        {results && results.tdee && (
                            <div className="results-card">
                                <h4>Resultados</h4>
                                <div className="result-breakdown">
                                    <div className="result-item">
                                        <span className="label">TMB</span>
                                        <span className="value">{results.bmr} kcal/día</span>
                                    </div>
                                    <div className="result-item primary">
                                        <span className="label">GET Total</span>
                                        <span className="value">{results.tdee} kcal/día</span>
                                    </div>
                                </div>
                                <p className="result-description">
                                    Necesitas {results.tdee} calorías diarias para mantener tu peso actual
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Macros Calculator */}
                {activeTab === 'macros' && (
                    <div className="calculator-card card">
                        <h3>Distribución de Macronutrientes</h3>
                        <p className="description">Calcula la distribución de proteínas, carbohidratos y grasas</p>

                        <div className="form-grid">
                            <div className="form-group">
                                <label className="label">Calorías Totales</label>
                                <input
                                    type="number"
                                    name="calories"
                                    className="input"
                                    value={formData.calories}
                                    onChange={handleChange}
                                    placeholder="2000"
                                />
                            </div>

                            <div className="form-group">
                                <label className="label">Tipo de Distribución</label>
                                <select
                                    name="distribution"
                                    className="input"
                                    value={formData.distribution}
                                    onChange={handleChange}
                                >
                                    <option value="balanced">Balanceada (30/40/30)</option>
                                    <option value="low_carb">Baja en Carbos (35/25/40)</option>
                                    <option value="high_protein">Alta en Proteína (40/35/25)</option>
                                    <option value="keto">Keto (25/5/70)</option>
                                    <option value="zone">Zona (30/40/30)</option>
                                </select>
                            </div>
                        </div>

                        <button
                            className="btn btn-primary"
                            onClick={calculateMacros}
                            disabled={loading || !formData.calories}
                        >
                            <Calculator size={20} />
                            {loading ? 'Calculando...' : 'Calcular Macros'}
                        </button>

                        {results && results.macros && (
                            <div className="results-card">
                                <h4>Distribución de Macronutrientes</h4>
                                <div className="macros-grid">
                                    <div className="macro-card protein">
                                        <div className="macro-header">
                                            <span className="macro-name">Proteínas</span>
                                            <span className="macro-percentage">{results.macros.protein.percentage}%</span>
                                        </div>
                                        <div className="macro-values">
                                            <span className="grams">{results.macros.protein.grams}g</span>
                                            <span className="calories">{results.macros.protein.calories} kcal</span>
                                        </div>
                                    </div>

                                    <div className="macro-card carbs">
                                        <div className="macro-header">
                                            <span className="macro-name">Carbohidratos</span>
                                            <span className="macro-percentage">{results.macros.carbs.percentage}%</span>
                                        </div>
                                        <div className="macro-values">
                                            <span className="grams">{results.macros.carbs.grams}g</span>
                                            <span className="calories">{results.macros.carbs.calories} kcal</span>
                                        </div>
                                    </div>

                                    <div className="macro-card fats">
                                        <div className="macro-header">
                                            <span className="macro-name">Grasas</span>
                                            <span className="macro-percentage">{results.macros.fat.percentage}%</span>
                                        </div>
                                        <div className="macro-values">
                                            <span className="grams">{results.macros.fat.grams}g</span>
                                            <span className="calories">{results.macros.fat.calories} kcal</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NutritionCalculator;
