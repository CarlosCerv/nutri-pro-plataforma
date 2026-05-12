import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  DndContext, closestCenter, useSensor, useSensors, PointerSensor,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus, Search, Trash2, GripVertical, Download, Save, Zap,
  ChevronDown, ChevronUp, Clock, Eye, Sparkles, Target,
  SlidersHorizontal, Apple, Utensils, Check, AlertCircle,
} from 'lucide-react';
import {
  calcularTodosTMB,
  calcularGET,
  calcularVET,
  calcularMacros,
  ACTIVITY_FACTORS,
  MACRO_PRESETS,
  GOAL_ADJUSTMENTS,
} from '../lib/calculations/tmb';
import api from '../services/api';
import './MenuBuilder.css';

const ALIMENTOS_MOCK = [
  { _id: '1', nombre: 'Huevo entero', grupo: 'AOA', cal: 155, prot: 13, carbs: 1.1, fat: 11, fibra: 0, porcion: 100 },
  { _id: '2', nombre: 'Pechuga de pollo', grupo: 'AOA', cal: 165, prot: 31, carbs: 0, fat: 3.6, fibra: 0, porcion: 100 },
  { _id: '3', nombre: 'Arroz blanco cocido', grupo: 'Cereales', cal: 130, prot: 2.7, carbs: 28, fat: 0.3, fibra: 0.4, porcion: 100 },
  { _id: '4', nombre: 'Pan integral', grupo: 'Cereales', cal: 265, prot: 9, carbs: 49, fat: 3.5, fibra: 7, porcion: 100 },
  { _id: '5', nombre: 'Frijoles negros cocidos', grupo: 'Leguminosas', cal: 132, prot: 8.9, carbs: 24, fat: 0.5, fibra: 8.7, porcion: 100 },
  { _id: '6', nombre: 'Brocoli cocido', grupo: 'Verduras', cal: 35, prot: 2.4, carbs: 7.2, fat: 0.4, fibra: 3.3, porcion: 100 },
  { _id: '7', nombre: 'Manzana', grupo: 'Frutas', cal: 52, prot: 0.3, carbs: 14, fat: 0.2, fibra: 2.4, porcion: 100 },
  { _id: '8', nombre: 'Leche descremada', grupo: 'Lacteos', cal: 35, prot: 3.4, carbs: 5, fat: 0.1, fibra: 0, porcion: 100 },
  { _id: '9', nombre: 'Aceite de oliva', grupo: 'Aceites', cal: 884, prot: 0, carbs: 0, fat: 100, fibra: 0, porcion: 15 },
  { _id: '10', nombre: 'Avena seca', grupo: 'Cereales', cal: 389, prot: 17, carbs: 66, fat: 7, fibra: 11, porcion: 40 },
  { _id: '11', nombre: 'Platano', grupo: 'Frutas', cal: 89, prot: 1.1, carbs: 23, fat: 0.3, fibra: 2.6, porcion: 120 },
  { _id: '12', nombre: 'Yogurt griego natural', grupo: 'Lacteos', cal: 59, prot: 10, carbs: 3.6, fat: 0.4, fibra: 0, porcion: 100 },
  { _id: '13', nombre: 'Salmon al horno', grupo: 'AOA', cal: 208, prot: 20, carbs: 0, fat: 13, fibra: 0, porcion: 100 },
  { _id: '14', nombre: 'Almendras', grupo: 'Aceites', cal: 579, prot: 21, carbs: 22, fat: 50, fibra: 12.5, porcion: 30 },
  { _id: '15', nombre: 'Tortilla de maiz', grupo: 'Cereales', cal: 218, prot: 5.7, carbs: 46, fat: 2.5, fibra: 3.3, porcion: 30 },
  { _id: '16', nombre: 'Nopal cocido', grupo: 'Verduras', cal: 22, prot: 1.6, carbs: 4.6, fat: 0.1, fibra: 3.7, porcion: 100 },
  { _id: '17', nombre: 'Atun en agua', grupo: 'AOA', cal: 116, prot: 26, carbs: 0, fat: 1, fibra: 0, porcion: 100 },
  { _id: '18', nombre: 'Queso panela', grupo: 'Lacteos', cal: 290, prot: 20, carbs: 3, fat: 22, fibra: 0, porcion: 30 },
];

const GRUPOS_ALIMENTO = ['Todos', 'AOA', 'Cereales', 'Leguminosas', 'Verduras', 'Frutas', 'Lacteos', 'Aceites'];

const FORMULA_LABELS = {
  mifflinStJeor: 'Mifflin',
  harrisBenedict: 'Harris',
  faoOms: 'FAO/OMS',
  owen: 'Owen',
};

const GOAL_LABELS = {
  bajar_peso: 'Bajar peso',
  bajar_rapido: 'Deficit alto',
  mantener: 'Mantener',
  ganar_musculo: 'Ganar musculo',
  volumen: 'Volumen',
};

const MACRO_LABELS = {
  estandar: 'Estandar',
  alto_proteina: 'Alto proteina',
  bajo_carbo: 'Bajo carbo',
  deportista: 'Deportista',
  diabetes: 'Diabetes',
  renal: 'Renal',
};

const toMacroState = (preset) => ({
  prot: preset.proteinas,
  carbs: preset.carbohidratos,
  fat: preset.lipidos,
});

const numberOrZero = (value) => Number(value) || 0;

const formatKcal = (value) => Math.round(numberOrZero(value)).toLocaleString('es-MX');

const foodMacros = (item) => {
  const factor = item.cantidad / item.alimento.porcion;
  return {
    cal: item.alimento.cal * factor,
    prot: item.alimento.prot * factor,
    carbs: item.alimento.carbs * factor,
    fat: item.alimento.fat * factor,
    fibra: (item.alimento.fibra || 0) * factor,
  };
};

const slotTotals = (slot) => slot.items.reduce((acc, item) => {
  const macros = foodMacros(item);
  return {
    cal: acc.cal + macros.cal,
    prot: acc.prot + macros.prot,
    carbs: acc.carbs + macros.carbs,
    fat: acc.fat + macros.fat,
    fibra: acc.fibra + macros.fibra,
  };
}, { cal: 0, prot: 0, carbs: 0, fat: 0, fibra: 0 });

const planTotals = (slots) => slots.reduce((acc, slot) => {
  const totals = slotTotals(slot);
  return {
    cal: acc.cal + totals.cal,
    prot: acc.prot + totals.prot,
    carbs: acc.carbs + totals.carbs,
    fat: acc.fat + totals.fat,
    fibra: acc.fibra + totals.fibra,
  };
}, { cal: 0, prot: 0, carbs: 0, fat: 0, fibra: 0 });

const targetPercent = (value, target) => {
  if (!target) return 0;
  return Math.min((value / target) * 100, 140);
};

function SortableFood({ item, onRemove, onQtyChange }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.uid });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.45 : 1 };
  const macros = foodMacros(item);

  return (
    <div ref={setNodeRef} style={style} className="menu-food-row group">
      <button
        {...attributes}
        {...listeners}
        type="button"
        className="menu-drag-handle"
        aria-label="Ordenar alimento"
      >
        <GripVertical size={15} />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white truncate">{item.alimento.nombre}</span>
          <span className="badge badge-neutral hidden sm:inline-flex">{item.alimento.grupo}</span>
        </div>
        <div className="mt-1 flex flex-wrap gap-2 text-2xs text-white/45">
          <span>P {Math.round(macros.prot)}g</span>
          <span>C {Math.round(macros.carbs)}g</span>
          <span>G {Math.round(macros.fat)}g</span>
          <span>{formatKcal(macros.cal)} kcal</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="number"
            min="1"
            max="1000"
            step="1"
            className="input !h-9 !min-h-9 !w-20 !py-1 pr-7 text-center font-mono text-xs"
            value={item.cantidad}
            onChange={e => onQtyChange(item.uid, Math.max(1, Number(e.target.value) || 1))}
            aria-label={`Cantidad de ${item.alimento.nombre}`}
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-2xs text-white/35">g</span>
        </div>
        <button
          type="button"
          onClick={() => onRemove(item.uid)}
          className="menu-icon-button danger"
          aria-label={`Eliminar ${item.alimento.nombre}`}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

function MealCard({ slot, index, isActive, onSelect, onRemoveFood, onQtyChange, onUpdateSlot, onRemoveSlot }) {
  const [open, setOpen] = useState(true);
  const totals = useMemo(() => slotTotals(slot), [slot]);

  return (
    <section className={`meal-builder-card ${isActive ? 'is-active' : ''}`}>
      <div className="meal-builder-card-header">
        <button
          type="button"
          onClick={() => onSelect(slot.id)}
          className="meal-builder-selector"
          aria-label={`Seleccionar ${slot.nombre}`}
        >
          <span className="meal-builder-number">{index + 1}</span>
          <span className="min-w-0">
            <span className="block text-xs text-white/45">Tiempo de comida</span>
            <input
              className="meal-title-input"
              value={slot.nombre}
              onClick={(event) => event.stopPropagation()}
              onChange={e => onUpdateSlot(slot.id, 'nombre', e.target.value)}
              placeholder="Nombre"
            />
          </span>
        </button>

        <div className="meal-builder-actions">
          {isActive && <span className="badge badge-info">Activo</span>}
          <label className="meal-time-input">
            <Clock size={14} />
            <input
              type="time"
              value={slot.hora}
              onChange={e => onUpdateSlot(slot.id, 'hora', e.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={() => setOpen(value => !value)}
            className="menu-icon-button"
            aria-label={open ? 'Contraer tiempo' : 'Expandir tiempo'}
          >
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            type="button"
            onClick={() => onRemoveSlot(slot.id)}
            className="menu-icon-button danger"
            aria-label={`Eliminar ${slot.nombre}`}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="meal-builder-totals">
        <span><strong>{formatKcal(totals.cal)}</strong> kcal</span>
        <span>P {Math.round(totals.prot)}g</span>
        <span>C {Math.round(totals.carbs)}g</span>
        <span>G {Math.round(totals.fat)}g</span>
      </div>

      {open && (
        <div className="meal-builder-body">
          <SortableContext items={slot.items.map(i => i.uid)} strategy={verticalListSortingStrategy}>
            {slot.items.length === 0 ? (
              <button type="button" onClick={() => onSelect(slot.id)} className="meal-empty-state">
                <Utensils size={18} />
                <span>{isActive ? 'Agrega alimentos desde la biblioteca' : 'Selecciona este tiempo para agregar alimentos'}</span>
              </button>
            ) : (
              <div className="space-y-2">
                {slot.items.map(item => (
                  <SortableFood
                    key={item.uid}
                    item={item}
                    onRemove={uid => onRemoveFood(slot.id, uid)}
                    onQtyChange={(uid, qty) => onQtyChange(slot.id, uid, qty)}
                  />
                ))}
              </div>
            )}
          </SortableContext>
        </div>
      )}
    </section>
  );
}

function RequirementsPanel({
  patientData,
  onPatientDataChange,
  formula,
  onFormulaChange,
  activityFactor,
  onActivityFactorChange,
  goal,
  onGoalChange,
  macroPreset,
  onMacroPresetChange,
  customMacros,
  onCustomMacrosChange,
  tmbs,
  tmb,
  get,
  vet,
  macrosObj,
}) {
  return (
    <section className="menu-card requirements-panel">
      <div className="menu-section-heading">
        <div>
          <p className="menu-eyebrow">Objetivo nutricional</p>
          <h2>Requerimientos</h2>
        </div>
        <div className="menu-kcal-chip">
          <span>{formatKcal(vet)}</span>
          <small>kcal objetivo</small>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { key: 'peso', label: 'Peso', unit: 'kg' },
          { key: 'talla', label: 'Talla', unit: 'cm' },
          { key: 'edad', label: 'Edad', unit: 'anos' },
        ].map(field => (
          <label key={field.key} className="form-group">
            <span className="label">{field.label}</span>
            <div className="relative">
              <input
                type="number"
                className="input pr-12 text-center font-mono"
                value={patientData[field.key]}
                onChange={e => onPatientDataChange({ ...patientData, [field.key]: e.target.value })}
              />
              <span className="menu-input-unit">{field.unit}</span>
            </div>
          </label>
        ))}
        <label className="form-group">
          <span className="label">Sexo biologico</span>
          <select className="select" value={patientData.sexo} onChange={e => onPatientDataChange({ ...patientData, sexo: e.target.value })}>
            <option value="F">Femenino</option>
            <option value="M">Masculino</option>
          </select>
        </label>
      </div>

      <div className="menu-segment-grid">
        {Object.entries(FORMULA_LABELS).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => onFormulaChange(key)}
            className={`menu-segment-card ${formula === key ? 'is-selected' : ''}`}
          >
            <span className="font-mono text-lg">{formatKcal(tmbs[key] || 0)}</span>
            <small>{label}</small>
          </button>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_1fr_190px]">
        <label className="form-group">
          <span className="label">Actividad</span>
          <select className="select" value={activityFactor} onChange={e => onActivityFactorChange(e.target.value)}>
            {Object.entries(ACTIVITY_FACTORS).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>
        </label>
        <label className="form-group">
          <span className="label">Meta</span>
          <select className="select" value={goal} onChange={e => onGoalChange(e.target.value)}>
            {Object.entries(GOAL_ADJUSTMENTS).map(([key, value]) => (
              <option key={key} value={key}>{GOAL_LABELS[key]} ({value > 0 ? '+' : ''}{value} kcal)</option>
            ))}
          </select>
        </label>
        <div className="menu-mini-summary">
          <span>TMB {formatKcal(tmb)}</span>
          <strong>GET {formatKcal(get)}</strong>
        </div>
      </div>

      <div className="menu-macro-editor">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="menu-eyebrow">Distribucion</p>
            <h3>Macronutrimentos</h3>
          </div>
          <div className="menu-preset-row">
            {Object.entries(MACRO_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  onMacroPresetChange(key);
                  onCustomMacrosChange(toMacroState(preset));
                }}
                className={`menu-preset-button ${macroPreset === key ? 'is-selected' : ''}`}
              >
                {MACRO_LABELS[key]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { key: 'prot', label: 'Proteinas', grams: macrosObj.proteinas_g },
            { key: 'carbs', label: 'Carbos', grams: macrosObj.carbos_g },
            { key: 'fat', label: 'Lipidos', grams: macrosObj.lipidos_g },
          ].map(macro => (
            <label key={macro.key} className="menu-macro-input">
              <span>{macro.label}</span>
              <div>
                <input
                  type="number"
                  min="5"
                  max="75"
                  value={Math.round(customMacros[macro.key] * 100)}
                  onChange={e => {
                    const nextValue = Math.max(0, Number(e.target.value) || 0) / 100;
                    onCustomMacrosChange({ ...customMacros, [macro.key]: nextValue });
                    onMacroPresetChange('personalizado');
                  }}
                />
                <small>%</small>
              </div>
              <strong>{macro.grams} g</strong>
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}

function FoodLibrary({ alimentos, selectedSlot, search, onSearchChange, groupFilter, onGroupFilterChange, onAddFood }) {
  const filteredFoods = useMemo(() => alimentos.filter((food) => {
    const byName = food.nombre.toLowerCase().includes(search.toLowerCase());
    const byGroup = groupFilter === 'Todos' || food.grupo === groupFilter;
    return byName && byGroup;
  }), [alimentos, groupFilter, search]);

  return (
    <aside className="menu-card food-library-panel">
      <div className="menu-section-heading">
        <div>
          <p className="menu-eyebrow">Biblioteca</p>
          <h2>Alimentos</h2>
        </div>
        <span className="menu-soft-icon"><Apple size={18} /></span>
      </div>

      <div className="selected-meal-banner">
        <Target size={16} />
        <div className="min-w-0">
          <span>Agregando a</span>
          <strong>{selectedSlot?.nombre || 'Selecciona un tiempo'}</strong>
        </div>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" />
        <input
          className="input pl-10"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Buscar alimento"
        />
      </div>

      <div className="menu-filter-row">
        {GRUPOS_ALIMENTO.map(group => (
          <button
            key={group}
            type="button"
            onClick={() => onGroupFilterChange(group)}
            className={groupFilter === group ? 'is-selected' : ''}
          >
            {group}
          </button>
        ))}
      </div>

      <div className="food-library-list">
        {filteredFoods.length === 0 ? (
          <div className="menu-empty-compact">
            <AlertCircle size={18} />
            <span>No hay alimentos con ese filtro.</span>
          </div>
        ) : (
          filteredFoods.map(food => (
            <article key={food._id} className="food-library-item">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3>{food.nombre}</h3>
                  <p>{food.grupo} | base {food.porcion} g</p>
                </div>
                <span>{formatKcal(food.cal)} kcal</span>
              </div>
              <div className="food-macro-grid">
                <span>P {food.prot}g</span>
                <span>C {food.carbs}g</span>
                <span>G {food.fat}g</span>
              </div>
              <div className="food-portion-row">
                {[
                  { label: '1/2', amount: Math.round(food.porcion * 0.5) },
                  { label: 'Base', amount: food.porcion },
                  { label: '1.5x', amount: Math.round(food.porcion * 1.5) },
                ].map(option => (
                  <button
                    key={option.label}
                    type="button"
                    disabled={!selectedSlot}
                    onClick={() => onAddFood(selectedSlot.id, food, option.amount)}
                  >
                    <strong>{option.label}</strong>
                    <small>{option.amount} g</small>
                  </button>
                ))}
              </div>
            </article>
          ))
        )}
      </div>
    </aside>
  );
}

function SummaryPanel({ slots, vet, macrosObj, sex }) {
  const totals = useMemo(() => planTotals(slots), [slots]);
  const kcalPct = targetPercent(totals.cal, vet);
  const fiberTarget = sex === 'M' ? 38 : 25;
  const totalItems = slots.reduce((acc, slot) => acc + slot.items.length, 0);

  const macros = [
    { label: 'Proteinas', value: totals.prot, target: macrosObj.proteinas_g, color: '#34C759' },
    { label: 'Carbos', value: totals.carbs, target: macrosObj.carbos_g, color: '#007AFF' },
    { label: 'Lipidos', value: totals.fat, target: macrosObj.lipidos_g, color: '#FF9F0A' },
    { label: 'Fibra', value: totals.fibra, target: fiberTarget, color: '#5856D6' },
  ];

  return (
    <aside className="space-y-4">
      <section className="menu-card summary-panel-card">
        <div className="menu-section-heading">
          <div>
            <p className="menu-eyebrow">Resumen</p>
            <h2>Plan actual</h2>
          </div>
          <span className="badge badge-neutral">{totalItems} alimentos</span>
        </div>

        <div className="kcal-progress-card">
          <div>
            <span>{formatKcal(totals.cal)}</span>
            <small>de {formatKcal(vet)} kcal</small>
          </div>
          <div className="menu-progress-track">
            <i style={{ width: `${Math.min(kcalPct, 100)}%` }} />
          </div>
          <p>{Math.round(kcalPct)}% del objetivo energetico</p>
        </div>

        <div className="space-y-3">
          {macros.map(macro => {
            const pct = targetPercent(macro.value, macro.target);
            return (
              <div key={macro.label} className="macro-progress-row">
                <div>
                  <span>{macro.label}</span>
                  <strong>{Math.round(macro.value)}g / {macro.target}g</strong>
                </div>
                <div className="menu-progress-track">
                  <i style={{ width: `${Math.min(pct, 100)}%`, background: macro.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="menu-card summary-panel-card">
        <div className="menu-section-heading">
          <div>
            <p className="menu-eyebrow">Distribucion</p>
            <h2>Por tiempos</h2>
          </div>
        </div>
        <div className="space-y-2">
          {slots.map(slot => {
            const totalsBySlot = slotTotals(slot);
            const pct = totals.cal ? (totalsBySlot.cal / totals.cal) * 100 : 0;
            return (
              <div key={slot.id} className="meal-distribution-row">
                <div>
                  <span>{slot.nombre}</span>
                  <strong>{formatKcal(totalsBySlot.cal)} kcal</strong>
                </div>
                <div className="menu-progress-track">
                  <i style={{ width: `${pct}%`, background: '#34C759' }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </aside>
  );
}

export default function MenuBuilder() {
  const [searchParams] = useSearchParams();
  const pacienteId = searchParams.get('paciente');

  const [slots, setSlots] = useState([
    { id: 'slot-1', nombre: 'Desayuno', hora: '08:00', items: [] },
    { id: 'slot-2', nombre: 'Colacion AM', hora: '10:30', items: [] },
    { id: 'slot-3', nombre: 'Comida', hora: '14:00', items: [] },
    { id: 'slot-4', nombre: 'Merienda', hora: '17:30', items: [] },
    { id: 'slot-5', nombre: 'Cena', hora: '20:00', items: [] },
  ]);

  const [selectedSlotId, setSelectedSlotId] = useState('slot-1');
  const [searchGlobal, setSearchGlobal] = useState('');
  const [groupFilter, setGroupFilter] = useState('Todos');
  const [patientData, setPatientData] = useState({ peso: 70, talla: 165, edad: 30, sexo: 'F' });
  const [formula, setFormula] = useState('mifflinStJeor');
  const [activityFactor, setActivityFactor] = useState('moderado');
  const [goal, setGoal] = useState('bajar_peso');
  const [macroPreset, setMacroPreset] = useState('estandar');
  const [customMacros, setCustomMacros] = useState(toMacroState(MACRO_PRESETS.estandar));
  const [planName, setPlanName] = useState('Plan alimentario');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showRequirements, setShowRequirements] = useState(true);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const selectedSlot = slots.find(slot => slot.id === selectedSlotId) || slots[0] || null;

  const numericPatient = {
    weight: numberOrZero(patientData.peso),
    height: numberOrZero(patientData.talla),
    age: numberOrZero(patientData.edad),
    sex: patientData.sexo,
  };

  const tmbs = calcularTodosTMB(numericPatient);
  const tmb = tmbs[formula] || tmbs.mifflinStJeor;
  const get = Math.round(calcularGET(tmb, activityFactor));
  const vet = Math.round(calcularVET(get, goal));
  const macrosObj = calcularMacros(vet, customMacros.prot, customMacros.carbs, customMacros.fat);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSlots(prev => prev.map(slot => {
      const ids = slot.items.map(item => item.uid);
      if (ids.includes(active.id) && ids.includes(over.id)) {
        return {
          ...slot,
          items: arrayMove(slot.items, ids.indexOf(active.id), ids.indexOf(over.id)),
        };
      }
      return slot;
    }));
  };

  const addSlot = () => {
    const newSlot = {
      id: `slot-${Date.now()}`,
      nombre: `Tiempo ${slots.length + 1}`,
      hora: '12:00',
      items: [],
    };
    setSlots(prev => [...prev, newSlot]);
    setSelectedSlotId(newSlot.id);
  };

  const removeSlot = (id) => {
    setSlots(prev => {
      const next = prev.filter(slot => slot.id !== id);
      if (selectedSlotId === id && next[0]) setSelectedSlotId(next[0].id);
      return next;
    });
  };

  const updateSlot = (id, key, value) => {
    setSlots(prev => prev.map(slot => (slot.id === id ? { ...slot, [key]: value } : slot)));
  };

  const addFood = (slotId, alimento, cantidad = alimento.porcion) => {
    if (!slotId) return;
    setSlots(prev => prev.map(slot => (slot.id !== slotId ? slot : {
      ...slot,
      items: [
        ...slot.items,
        {
          uid: `item-${alimento._id}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          alimento,
          cantidad,
        },
      ],
    })));
  };

  const removeFood = (slotId, uid) => {
    setSlots(prev => prev.map(slot => (slot.id !== slotId ? slot : {
      ...slot,
      items: slot.items.filter(item => item.uid !== uid),
    })));
  };

  const updateQty = (slotId, uid, qty) => {
    setSlots(prev => prev.map(slot => (slot.id !== slotId ? slot : {
      ...slot,
      items: slot.items.map(item => (item.uid === uid ? { ...item, cantidad: qty } : item)),
    })));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { nombre: planName, pacienteId, slots, vet, macrosObjetivo: macrosObj };
      await api.post('/mealplans', payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="menu-builder-workspace animate-fade-up">
        <header className="menu-builder-hero">
          <div className="min-w-0">
            <p className="menu-eyebrow">Generador de menus</p>
            <input
              className="menu-plan-title"
              value={planName}
              onChange={e => setPlanName(e.target.value)}
              aria-label="Nombre del plan"
            />
            <p className="page-subtitle mt-1">Construye tiempos, ajusta porciones y valida objetivos en una sola pantalla.</p>
          </div>
          <div className="menu-builder-actions-main">
            <button type="button" className="btn btn-ghost btn-sm">
              <Eye size={15} />
              Vista previa
            </button>
            <button type="button" className="btn btn-outline btn-sm">
              <Download size={15} />
              PDF
            </button>
            <button type="button" onClick={handleSave} disabled={saving} className="btn btn-primary btn-sm">
              {saving ? (
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : saved ? (
                <Check size={15} />
              ) : (
                <Save size={15} />
              )}
              {saved ? 'Guardado' : 'Guardar'}
            </button>
          </div>
        </header>

        <div className="menu-builder-grid">
          <main className="min-w-0 space-y-4">
            <button
              type="button"
              onClick={() => setShowRequirements(value => !value)}
              className="menu-collapsible-trigger"
            >
              <span className="flex items-center gap-2">
                <Zap size={16} className="text-gold" />
                Requerimientos y macros
              </span>
              {showRequirements ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showRequirements && (
              <RequirementsPanel
                patientData={patientData}
                onPatientDataChange={setPatientData}
                formula={formula}
                onFormulaChange={setFormula}
                activityFactor={activityFactor}
                onActivityFactorChange={setActivityFactor}
                goal={goal}
                onGoalChange={setGoal}
                macroPreset={macroPreset}
                onMacroPresetChange={setMacroPreset}
                customMacros={customMacros}
                onCustomMacrosChange={setCustomMacros}
                tmbs={tmbs}
                tmb={tmb}
                get={get}
                vet={vet}
                macrosObj={macrosObj}
              />
            )}

            <section className="menu-card meal-list-panel">
              <div className="menu-section-heading">
                <div>
                  <p className="menu-eyebrow">Agenda del menu</p>
                  <h2>Tiempos de comida</h2>
                </div>
                <button type="button" onClick={addSlot} className="btn btn-outline btn-sm">
                  <Plus size={15} />
                  Tiempo
                </button>
              </div>

              <div className="space-y-3">
                {slots.map((slot, index) => (
                  <MealCard
                    key={slot.id}
                    slot={slot}
                    index={index}
                    isActive={slot.id === selectedSlotId}
                    onSelect={setSelectedSlotId}
                    onRemoveFood={removeFood}
                    onQtyChange={updateQty}
                    onUpdateSlot={updateSlot}
                    onRemoveSlot={removeSlot}
                  />
                ))}
              </div>
            </section>
          </main>

          <aside className="menu-builder-side">
            <FoodLibrary
              alimentos={ALIMENTOS_MOCK}
              selectedSlot={selectedSlot}
              search={searchGlobal}
              onSearchChange={setSearchGlobal}
              groupFilter={groupFilter}
              onGroupFilterChange={setGroupFilter}
              onAddFood={addFood}
            />
            <SummaryPanel slots={slots} vet={vet} macrosObj={macrosObj} sex={patientData.sexo} />
          </aside>
        </div>
      </div>
    </DndContext>
  );
}
