/**
 * components/DailyMealPlanner.jsx
 * Componente principal para el planificador de comidas diarias en NutriPro
 */

import React, { useState } from 'react';
import { Trash2, Plus, X, Search, ChevronDown } from 'lucide-react';
import { useMealPlanner } from '../hooks/useMealPlanner';
import { calculateMacroPercentages } from '../utils/calculations';
import type { FoodItem, MealTime, AddedFood } from '../types/nutrition';

// Catálogo de alimentos de demostración
const DEMO_FOOD_CATALOG: FoodItem[] = [
  {
    id: 'chicken-100g',
    name: 'Pollo (pechuga)',
    basePortionSize: '100g',
    macroPerPortion: { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  },
  {
    id: 'rice-1cup',
    name: 'Arroz blanco cocido',
    basePortionSize: '1 taza',
    macroPerPortion: { calories: 206, protein: 4.3, carbs: 45, fat: 0.3 },
  },
  {
    id: 'broccoli-1cup',
    name: 'Brócoli cocido',
    basePortionSize: '1 taza',
    macroPerPortion: { calories: 55, protein: 3.7, carbs: 11, fat: 0.6 },
  },
  {
    id: 'egg-1',
    name: 'Huevo (entero)',
    basePortionSize: '1 unidad',
    macroPerPortion: { calories: 78, protein: 6, carbs: 0.6, fat: 5.3 },
  },
  {
    id: 'banana-medium',
    name: 'Plátano (mediano)',
    basePortionSize: '1 unidad',
    macroPerPortion: { calories: 105, protein: 1.3, carbs: 27, fat: 0.3 },
  },
  {
    id: 'almonds-28g',
    name: 'Almendras',
    basePortionSize: '28g (23 almendras)',
    macroPerPortion: { calories: 161, protein: 6, carbs: 6, fat: 14 },
  },
  {
    id: 'salmon-100g',
    name: 'Salmón cocido',
    basePortionSize: '100g',
    macroPerPortion: { calories: 280, protein: 25, carbs: 0, fat: 20 },
  },
  {
    id: 'sweet-potato-medium',
    name: 'Batata (mediana)',
    basePortionSize: '1 unidad',
    macroPerPortion: { calories: 103, protein: 2.3, carbs: 23, fat: 0.2 },
  },
  {
    id: 'greek-yogurt-1cup',
    name: 'Yogur Griego (bajo en grasa)',
    basePortionSize: '1 taza',
    macroPerPortion: { calories: 130, protein: 23, carbs: 9, fat: 0 },
  },
  {
    id: 'oats-1cup',
    name: 'Avena (cocinada)',
    basePortionSize: '1 taza',
    macroPerPortion: { calories: 150, protein: 5, carbs: 27, fat: 3 },
  },
];

// Componente: Modal para añadir alimentos
const AddFoodModal = ({ isOpen, onClose, onAddFood, mealTimeName }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [portions, setPortions] = useState(1);

  const filteredFoods = DEMO_FOOD_CATALOG.filter((food) =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddFood = () => {
    if (selectedFood && portions > 0) {
      onAddFood(selectedFood, portions);
      setSearchTerm('');
      setSelectedFood(null);
      setPortions(1);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Añadir alimento a {mealTimeName}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Buscador */}
        <div className="mb-4 relative">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar alimento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        {/* Lista de alimentos */}
        <div className="max-h-64 overflow-y-auto mb-4 border border-gray-200 rounded-lg">
          {filteredFoods.length > 0 ? (
            filteredFoods.map((food) => (
              <button
                key={food.id}
                onClick={() => setSelectedFood(food)}
                className={`w-full text-left p-3 border-b hover:bg-pink-50 transition ${
                  selectedFood?.id === food.id ? 'bg-pink-100 border-l-4 border-pink-500' : ''
                }`}
              >
                <div className="font-medium text-gray-800">{food.name}</div>
                <div className="text-sm text-gray-600">{food.basePortionSize}</div>
                <div className="text-xs text-gray-500">
                  {food.macroPerPortion.calories} kcal
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">No hay alimentos que coincidan</div>
          )}
        </div>

        {/* Información del alimento seleccionado */}
        {selectedFood && (
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Alimento seleccionado:</p>
            <p className="text-lg font-bold text-gray-800 mb-3">{selectedFood.name}</p>

            {/* Selector de porciones */}
            <div className="flex items-center gap-2">
              <label htmlFor="portions" className="text-sm font-medium text-gray-700">
                Porciones:
              </label>
              <input
                id="portions"
                type="number"
                min="0.1"
                step="0.1"
                value={portions}
                onChange={(e) => setPortions(parseFloat(e.target.value) || 1)}
                className="w-20 px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-600">× {selectedFood.basePortionSize}</span>
            </div>

            {/* Vista previa de macronutrientes */}
            <div className="mt-3 pt-3 border-t border-blue-200 grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-xs text-gray-600">Calorías</p>
                <p className="font-bold text-gray-800">
                  {Math.round(selectedFood.macroPerPortion.calories * portions)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Proteína</p>
                <p className="font-bold text-gray-800">
                  {(selectedFood.macroPerPortion.protein * portions).toFixed(1)}g
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Carbos</p>
                <p className="font-bold text-gray-800">
                  {(selectedFood.macroPerPortion.carbs * portions).toFixed(1)}g
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Grasas</p>
                <p className="font-bold text-gray-800">
                  {(selectedFood.macroPerPortion.fat * portions).toFixed(1)}g
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleAddFood}
            disabled={!selectedFood || portions <= 0}
            className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Añadir Alimento
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente: Tarjeta de alimento añadido
const FoodItemCard = ({ food, onRemove, onEditPortions }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newPortions, setNewPortions] = useState(food.portions);

  const handleSavePortions = () => {
    if (newPortions > 0) {
      onEditPortions(newPortions);
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 mb-2 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800">{food.foodName}</h4>
          <p className="text-xs text-gray-500">{food.basePortionSize}</p>
        </div>
        <button
          onClick={onRemove}
          className="text-red-500 hover:text-red-700 transition ml-2"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Porciones */}
      <div className="flex items-center gap-2 mb-2 text-sm">
        <span className="text-gray-600">Porciones:</span>
        {isEditing ? (
          <>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={newPortions}
              onChange={(e) => setNewPortions(parseFloat(e.target.value) || 1)}
              className="w-16 px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <button
              onClick={handleSavePortions}
              className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition"
            >
              OK
            </button>
            <button
              onClick={() => {
                setNewPortions(food.portions);
                setIsEditing(false);
              }}
              className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400 transition"
            >
              Cancelar
            </button>
          </>
        ) : (
          <>
            <span className="font-medium text-gray-800">{food.portions}</span>
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-blue-500 hover:text-blue-700 underline"
            >
              Editar
            </button>
          </>
        )}
      </div>

      {/* Macronutrientes */}
      <div className="grid grid-cols-4 gap-1 text-center bg-gray-50 p-2 rounded text-xs">
        <div>
          <p className="text-gray-600">Cal</p>
          <p className="font-bold text-gray-800">{Math.round(food.totalMacro.calories)}</p>
        </div>
        <div>
          <p className="text-gray-600">Pro</p>
          <p className="font-bold text-gray-800">{food.totalMacro.protein.toFixed(1)}g</p>
        </div>
        <div>
          <p className="text-gray-600">Carb</p>
          <p className="font-bold text-gray-800">{food.totalMacro.carbs.toFixed(1)}g</p>
        </div>
        <div>
          <p className="text-gray-600">Grasa</p>
          <p className="font-bold text-gray-800">{food.totalMacro.fat.toFixed(1)}g</p>
        </div>
      </div>
    </div>
  );
};

// Componente: Tarjeta de tiempo de comida
const MealTimeCard = ({ mealTime, onAddFood, onRemoveFood, onEditFood, onUpdateName }) => {
  const [isAddingFood, setIsAddingFood] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(mealTime.name);

  const handleSaveName = () => {
    if (newName.trim()) {
      onUpdateName(newName);
      setIsEditingName(false);
    }
  };

  return (
    <div className="bg-white border-l-4 border-pink-600 rounded-lg shadow-md p-5 mb-4">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-4">
        {isEditingName ? (
          <div className="flex gap-2 flex-1 mr-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <button
              onClick={handleSaveName}
              className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition"
            >
              OK
            </button>
            <button
              onClick={() => {
                setNewName(mealTime.name);
                setIsEditingName(false);
              }}
              className="bg-gray-300 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-400 transition"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <>
            <h3
              onClick={() => setIsEditingName(true)}
              className="text-2xl font-bold text-gray-800 cursor-pointer hover:text-pink-600 transition"
            >
              {mealTime.name}
            </h3>
          </>
        )}
      </div>

      {/* Alimentos añadidos */}
      <div className="mb-4">
        {mealTime.foods.length > 0 ? (
          mealTime.foods.map((food) => (
            <FoodItemCard
              key={food.id}
              food={food}
              onRemove={() => onRemoveFood(food.id)}
              onEditPortions={(newPortions) => onEditFood(food.id, newPortions)}
            />
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">Sin alimentos añadidos</p>
        )}
      </div>

      {/* Totales del tiempo de comida */}
      <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg p-3 mb-4">
        <p className="text-xs text-gray-600 mb-2">Totales de {mealTime.name}:</p>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-xs text-gray-700">Calorías</p>
            <p className="text-xl font-bold text-pink-600">
              {Math.round(mealTime.totalMacro.calories)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-700">Proteína</p>
            <p className="text-xl font-bold text-pink-600">
              {mealTime.totalMacro.protein.toFixed(1)}g
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-700">Carbos</p>
            <p className="text-xl font-bold text-pink-600">
              {mealTime.totalMacro.carbs.toFixed(1)}g
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-700">Grasas</p>
            <p className="text-xl font-bold text-pink-600">
              {mealTime.totalMacro.fat.toFixed(1)}g
            </p>
          </div>
        </div>
      </div>

      {/* Botón para añadir alimento */}
      <button
        onClick={() => setIsAddingFood(true)}
        className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
      >
        <Plus size={20} />
        Añadir Alimento
      </button>

      {/* Modal de añadir alimento */}
      <AddFoodModal
        isOpen={isAddingFood}
        onClose={() => setIsAddingFood(false)}
        onAddFood={(food, portions) => onAddFood(food, portions)}
        mealTimeName={mealTime.name}
      />
    </div>
  );
};

// Componente: Tabla de resumen de macronutrientes diarios
const MacroSummaryTable = ({ dailyTotal }) => {
  const percentages = calculateMacroPercentages(dailyTotal);

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">Resumen Diario de Macronutrientes</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Columna izquierda: Macros en valores absolutos */}
        <div className="space-y-3">
          <div className="bg-white bg-opacity-10 rounded-lg p-3">
            <p className="text-sm opacity-90">Calorías Totales</p>
            <p className="text-4xl font-bold">{Math.round(dailyTotal.calories)}</p>
            <p className="text-xs opacity-75 mt-1">kcal</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white bg-opacity-10 rounded-lg p-3 text-center">
              <p className="text-sm opacity-90">Proteínas</p>
              <p className="text-2xl font-bold">{dailyTotal.protein.toFixed(1)}</p>
              <p className="text-xs opacity-75">g</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-3 text-center">
              <p className="text-sm opacity-90">Carbohidratos</p>
              <p className="text-2xl font-bold">{dailyTotal.carbs.toFixed(1)}</p>
              <p className="text-xs opacity-75">g</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-3 text-center">
              <p className="text-sm opacity-90">Grasas</p>
              <p className="text-2xl font-bold">{dailyTotal.fat.toFixed(1)}</p>
              <p className="text-xs opacity-75">g</p>
            </div>
          </div>
        </div>

        {/* Columna derecha: Gráfico de barras de porcentajes */}
        <div className="flex flex-col justify-center space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm opacity-90">Proteínas</span>
              <span className="text-sm font-bold">{percentages.protein}%</span>
            </div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
              <div
                className="bg-red-400 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(percentages.protein, 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm opacity-90">Carbohidratos</span>
              <span className="text-sm font-bold">{percentages.carbs}%</span>
            </div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
              <div
                className="bg-yellow-400 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(percentages.carbs, 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm opacity-90">Grasas</span>
              <span className="text-sm font-bold">{percentages.fat}%</span>
            </div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
              <div
                className="bg-orange-400 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(percentages.fat, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Principal
export const DailyMealPlanner = () => {
  const { mealTimes, dailyTotal, addFood, removeFood, editFood, updateMealTimeName, clearAllFoods } =
    useMealPlanner();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📋 Planificador de Comidas NutriPro</h1>
          <p className="text-gray-600">
            Crea y personaliza tu plan de alimentación diario con seguimiento detallado de macronutrientes
          </p>
        </div>

        {/* Tabla de resumen */}
        <MacroSummaryTable dailyTotal={dailyTotal} />

        {/* Botón para limpiar todo */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={clearAllFoods}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center gap-2"
          >
            <Trash2 size={18} />
            Limpiar Todo
          </button>
        </div>

        {/* Tarjetas de tiempos de comida */}
        <div className="space-y-4">
          {mealTimes.map((mealTime) => (
            <MealTimeCard
              key={mealTime.id}
              mealTime={mealTime}
              onAddFood={(food, portions) => addFood(mealTime.id, food, portions)}
              onRemoveFood={(foodId) => removeFood(mealTime.id, foodId)}
              onEditFood={(foodId, newPortions) => editFood(mealTime.id, foodId, newPortions)}
              onUpdateName={(newName) => updateMealTimeName(mealTime.id, newName)}
            />
          ))}
        </div>

        {/* Pie de página */}
        <div className="mt-12 p-6 bg-white rounded-lg border border-gray-200 text-center">
          <p className="text-gray-600">
            💡 <strong>Tip:</strong> Haz clic en el nombre del tiempo de comida para editarlo. Usa el modal
            para añadir alimentos y ajusta las porciones según tus necesidades.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DailyMealPlanner;
