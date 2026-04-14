import { useState, useRef } from 'react';
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
  ChevronDown, ChevronUp, Clock, Eye,
} from 'lucide-react';
import { calcularTodosTMB, calcularGET, calcularVET, calcularMacros, ACTIVITY_FACTORS, MACRO_PRESETS, GOAL_ADJUSTMENTS } from '../lib/calculations/tmb';
import api from '../services/api';

// ── Alimentos mock (base inicial) ────────────────────────────────
const ALIMENTOS_MOCK = [
  { _id: '1', nombre: 'Huevo entero', grupo: 'AOA', cal: 155, prot: 13, carbs: 1.1, fat: 11, fibra: 0, porcion: 100 },
  { _id: '2', nombre: 'Pechuga de pollo', grupo: 'AOA', cal: 165, prot: 31, carbs: 0, fat: 3.6, fibra: 0, porcion: 100 },
  { _id: '3', nombre: 'Arroz blanco cocido', grupo: 'Cereales', cal: 130, prot: 2.7, carbs: 28, fat: 0.3, fibra: 0.4, porcion: 100 },
  { _id: '4', nombre: 'Pan integral', grupo: 'Cereales', cal: 265, prot: 9, carbs: 49, fat: 3.5, fibra: 7, porcion: 100 },
  { _id: '5', nombre: 'Frijoles negros cocidos', grupo: 'Leguminosas', cal: 132, prot: 8.9, carbs: 24, fat: 0.5, fibra: 8.7, porcion: 100 },
  { _id: '6', nombre: 'Brócoli cocido', grupo: 'Verduras', cal: 35, prot: 2.4, carbs: 7.2, fat: 0.4, fibra: 3.3, porcion: 100 },
  { _id: '7', nombre: 'Manzana', grupo: 'Frutas', cal: 52, prot: 0.3, carbs: 14, fat: 0.2, fibra: 2.4, porcion: 100 },
  { _id: '8', nombre: 'Leche descremada', grupo: 'Lácteos', cal: 35, prot: 3.4, carbs: 5, fat: 0.1, fibra: 0, porcion: 100 },
  { _id: '9', nombre: 'Aceite de oliva', grupo: 'Aceites', cal: 884, prot: 0, carbs: 0, fat: 100, fibra: 0, porcion: 15 },
  { _id: '10', nombre: 'Avena (seca)', grupo: 'Cereales', cal: 389, prot: 17, carbs: 66, fat: 7, fibra: 11, porcion: 40 },
  { _id: '11', nombre: 'Plátano', grupo: 'Frutas', cal: 89, prot: 1.1, carbs: 23, fat: 0.3, fibra: 2.6, porcion: 120 },
  { _id: '12', nombre: 'Yogurt griego natural', grupo: 'Lácteos', cal: 59, prot: 10, carbs: 3.6, fat: 0.4, fibra: 0, porcion: 100 },
  { _id: '13', nombre: 'Salmón al horno', grupo: 'AOA', cal: 208, prot: 20, carbs: 0, fat: 13, fibra: 0, porcion: 100 },
  { _id: '14', nombre: 'Almendras', grupo: 'Aceites/Grasas', cal: 579, prot: 21, carbs: 22, fat: 50, fibra: 12.5, porcion: 30 },
  { _id: '15', nombre: 'Tortilla de maíz', grupo: 'Cereales', cal: 218, prot: 5.7, carbs: 46, fat: 2.5, fibra: 3.3, porcion: 30 },
  { _id: '16', nombre: 'Nopal cocido', grupo: 'Verduras', cal: 22, prot: 1.6, carbs: 4.6, fat: 0.1, fibra: 3.7, porcion: 100 },
  { _id: '17', nombre: 'Atún en agua', grupo: 'AOA', cal: 116, prot: 26, carbs: 0, fat: 1, fibra: 0, porcion: 100 },
  { _id: '18', nombre: 'Queso panela', grupo: 'Lácteos', cal: 290, prot: 20, carbs: 3, fat: 22, fibra: 0, porcion: 30 },
];

const GRUPOS_ALIMENTO = ['Todos', 'AOA', 'Cereales', 'Leguminosas', 'Verduras', 'Frutas', 'Lácteos', 'Aceites'];

// ── Componente de alimento en el slot (sortable) ─────────────────
function SortableAliment({ item, onRemove, onQtyChange }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.uid });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  const kcal = Math.round((item.alimento.cal * item.cantidad) / item.alimento.porcion);

  return (
    <div ref={setNodeRef} style={style}
      className="flex items-center gap-2 p-2 rounded-xl bg-navy-800/60 border border-navy-700/40 group hover:border-navy-600 transition-all">
      <button {...attributes} {...listeners} type="button"
        className="text-white/20 hover:text-white/50 cursor-grab active:cursor-grabbing flex-shrink-0">
        <GripVertical size={14} />
      </button>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-white/80 truncate">{item.alimento.nombre}</div>
        <div className="text-2xs text-white/30 mt-0.5">
          P: {Math.round(item.alimento.prot * item.cantidad / item.alimento.porcion)}g ·
          C: {Math.round(item.alimento.carbs * item.cantidad / item.alimento.porcion)}g ·
          G: {Math.round(item.alimento.fat * item.cantidad / item.alimento.porcion)}g
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <input
          type="number" min="1" max="1000" step="1"
          className="input !w-16 !py-1 text-center font-mono text-xs"
          value={item.cantidad}
          onChange={e => onQtyChange(item.uid, Number(e.target.value))}
        />
        <span className="text-2xs text-white/30">g</span>
        <span className="font-mono text-xs text-emerald w-14 text-right">{kcal} kcal</span>
        <button type="button" onClick={() => onRemove(item.uid)}
          className="text-white/20 hover:text-danger transition-colors ml-1">
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

// ── Slot de tiempo de comida ─────────────────────────────────────
function MealSlot({ slot, index, alimentos, onAddAlimento, onRemoveAlimento, onQtyChange, onUpdateSlot, onRemoveSlot }) {
  const [open, setOpen] = useState(true);
  const [searchLocal, setSearchLocal] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const ref = useRef();

  const totalKcal = slot.items.reduce((acc, i) =>
    acc + Math.round((i.alimento.cal * i.cantidad) / i.alimento.porcion), 0);

  const filteredFoods = alimentos.filter(a =>
    a.nombre.toLowerCase().includes(searchLocal.toLowerCase()) && searchLocal.length > 0
  ).slice(0, 8);

  return (
    <div className="card !p-0 overflow-hidden">
      {/* Slot header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-navy-800/50 border-b border-navy-700/50">
        <div className="w-7 h-7 rounded-lg bg-emerald/15 flex items-center justify-center text-xs font-bold text-emerald flex-shrink-0">
          {index + 1}
        </div>
        <input
          className="flex-1 bg-transparent text-sm font-semibold text-white border-none outline-none placeholder:text-white/30"
          value={slot.nombre}
          onChange={e => onUpdateSlot(slot.id, 'nombre', e.target.value)}
          placeholder="Nombre del tiempo..."
        />
        <div className="flex items-center gap-2 flex-shrink-0">
          <Clock size={12} className="text-white/30" />
          <input type="time" className="input !w-auto !py-0.5 !px-2 text-xs font-mono bg-navy-900/50"
            value={slot.hora}
            onChange={e => onUpdateSlot(slot.id, 'hora', e.target.value)} />
          <span className="font-mono text-xs text-emerald">{totalKcal} kcal</span>
          <button type="button" onClick={() => setOpen(v => !v)} className="text-white/30 hover:text-white/60 transition-colors">
            {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
          <button type="button" onClick={() => onRemoveSlot(slot.id)} className="text-white/20 hover:text-danger transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {open && (
        <div className="p-3 space-y-2">
          {/* Alimentos del slot */}
          <SortableContext items={slot.items.map(i => i.uid)} strategy={verticalListSortingStrategy}>
            {slot.items.length === 0 ? (
              <div className="text-center py-4 text-xs text-white/20 border border-dashed border-navy-700 rounded-xl">
                Arrastra o busca alimentos para agregar
              </div>
            ) : (
              slot.items.map(item => (
                <SortableAliment key={item.uid} item={item}
                  onRemove={uid => onRemoveAlimento(slot.id, uid)}
                  onQtyChange={(uid, qty) => onQtyChange(slot.id, uid, qty)} />
              ))
            )}
          </SortableContext>

          {/* Search para agregar alimento */}
          <div className="relative mt-2" ref={ref}>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  placeholder="Buscar alimento..."
                  className="input !py-1.5 pl-8 text-xs"
                  value={searchLocal}
                  onChange={e => setSearchLocal(e.target.value)}
                  onFocus={() => setShowSearch(true)}
                />
              </div>
            </div>
            {showSearch && filteredFoods.length > 0 && (
              <div className="absolute top-9 left-0 right-0 z-30 bg-navy-800 border border-navy-600 rounded-xl shadow-navy-lg overflow-hidden">
                {filteredFoods.map(a => (
                  <button key={a._id} type="button"
                    onClick={() => { onAddAlimento(slot.id, a); setSearchLocal(''); setShowSearch(false); }}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 transition-colors text-left">
                    <div>
                      <div className="text-xs text-white/80 font-medium">{a.nombre}</div>
                      <div className="text-2xs text-white/30">{a.grupo} · {a.porcion}g</div>
                    </div>
                    <div className="text-2xs font-mono text-emerald">{a.cal} kcal/100g</div>
                  </button>
                ))}
              </div>
            )}
            {showSearch && searchLocal && filteredFoods.length === 0 && (
              <div className="absolute top-9 left-0 right-0 z-30 bg-navy-800 border border-navy-600 rounded-xl px-4 py-3 text-xs text-white/30 shadow-navy-lg">
                Sin resultados para "{searchLocal}"
              </div>
            )}
          </div>
          {showSearch && <div className="fixed inset-0 z-20" onClick={() => setShowSearch(false)} />}
        </div>
      )}
    </div>
  );
}

// ── Panel de cómputo nutricional ─────────────────────────────────
function NutritionPanel({ slots, vet, macrosObjetivo, sexo = 'F' }) {
  const totales = slots.reduce((acc, slot) => {
    slot.items.forEach(item => {
      const factor = item.cantidad / item.alimento.porcion;
      acc.cal   += item.alimento.cal   * factor;
      acc.prot  += item.alimento.prot  * factor;
      acc.carbs += item.alimento.carbs * factor;
      acc.fat   += item.alimento.fat   * factor;
      acc.fibra += (item.alimento.fibra || 0) * factor;
    });
    return acc;
  }, { cal: 0, prot: 0, carbs: 0, fat: 0, fibra: 0 });

  const pctVET = vet > 0 ? Math.min((totales.cal / vet) * 100, 200) : 0;
  const vetColor = pctVET < 85 ? '#3B82F6' : pctVET < 115 ? '#2ECC8E' : '#EF4444';

  const macros = [
    { label: 'Proteínas',     val: totales.prot,  obj: macrosObjetivo?.proteinas_g,  unit: 'g', color: '#2ECC8E' },
    { label: 'Carbohidratos', val: totales.carbs, obj: macrosObjetivo?.carbos_g,     unit: 'g', color: '#3B82F6' },
    { label: 'Lípidos',       val: totales.fat,   obj: macrosObjetivo?.lipidos_g,    unit: 'g', color: '#E8C96A' },
    { label: 'Fibra',         val: totales.fibra, obj: sexo === 'M' ? 38 : 25,       unit: 'g', color: '#A855F7' },
  ];

  return (
    <div className="space-y-5 sticky top-4">
      {/* Calorías vs VET */}
      <div className="card !p-4">
        <div className="text-xs font-bold text-white/40 uppercase tracking-wide mb-3">Cómputo Calórico</div>
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="font-mono text-3xl font-medium" style={{ color: vetColor }}>
              {Math.round(totales.cal)}
            </div>
            <div className="text-xs text-white/30">kcal del plan</div>
          </div>
          {vet > 0 && (
            <div className="text-right">
              <div className="font-mono text-sm text-white/50">{vet}</div>
              <div className="text-xs text-white/25">VET objetivo</div>
            </div>
          )}
        </div>
        {vet > 0 && (
          <>
            <div className="h-2 bg-navy-700 rounded-full overflow-hidden mb-1.5">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(pctVET, 100)}%`, background: vetColor }} />
            </div>
            <div className="flex justify-between text-2xs">
              <span className="text-white/25">0%</span>
              <span style={{ color: vetColor }} className="font-semibold">{Math.round(pctVET)}% del VET</span>
              <span className="text-white/25">100%</span>
            </div>
          </>
        )}
      </div>

      {/* Macros */}
      <div className="card !p-4 space-y-3">
        <div className="text-xs font-bold text-white/40 uppercase tracking-wide mb-1">Macronutrimentos</div>
        {macros.map(m => {
          const pct = m.obj > 0 ? Math.min((m.val / m.obj) * 100, 200) : 0;
          return (
            <div key={m.label}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-white/60">{m.label}</span>
                <span className="font-mono text-xs" style={{ color: m.color }}>
                  {Math.round(m.val)}{m.unit} {m.obj > 0 && <span className="text-white/25">/ {m.obj}{m.unit}</span>}
                </span>
              </div>
              <div className="h-1.5 bg-navy-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(pct, 100)}%`, background: m.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumen por tiempos */}
      <div className="card !p-4">
        <div className="text-xs font-bold text-white/40 uppercase tracking-wide mb-3">Distribución por Tiempos</div>
        <div className="space-y-1.5">
          {slots.map(slot => {
            const kcal = slot.items.reduce((acc, i) =>
              acc + Math.round((i.alimento.cal * i.cantidad) / i.alimento.porcion), 0);
            const pct  = totales.cal > 0 ? (kcal / totales.cal) * 100 : 0;
            return (
              <div key={slot.id} className="flex items-center gap-2">
                <div className="text-xs text-white/50 w-24 truncate">{slot.nombre}</div>
                <div className="flex-1 h-1.5 bg-navy-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald/60 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="font-mono text-2xs text-white/40 w-14 text-right">{kcal} kcal</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Page principal: Diet Builder ──────────────────────────────────
export default function MenuBuilder() {
  const [searchParams] = useSearchParams();
  const pacienteId = searchParams.get('paciente');

  const [slots, setSlots] = useState([
    { id: 'slot-1', nombre: 'Desayuno',    hora: '08:00', items: [] },
    { id: 'slot-2', nombre: 'Colación AM', hora: '10:30', items: [] },
    { id: 'slot-3', nombre: 'Comida',      hora: '14:00', items: [] },
    { id: 'slot-4', nombre: 'Merienda',    hora: '17:30', items: [] },
    { id: 'slot-5', nombre: 'Cena',        hora: '20:00', items: [] },
  ]);

  const [alimentos] = useState(ALIMENTOS_MOCK);

  // Calculadora de requerimientos
  const [pacData, setPacData] = useState({ peso: 70, talla: 165, edad: 30, sexo: 'F' });
  const [formula, setFormula] = useState('mifflinStJeor');
  const [actFactor, setActFactor] = useState('moderado');
  const [objetivo, setObjetivo]   = useState('bajar_peso');
  const [macroPreset, setMacroPreset] = useState('estandar');
  const [customMacros, setCustomMacros] = useState({ prot: 0.20, carbs: 0.50, fat: 0.30 });
  const [showCalc, setShowCalc] = useState(true);

  const [planNombre, setPlanNombre] = useState('Plan alimentario');
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  // Calcular TMB y VET
  const tmbs = calcularTodosTMB({ weight: pacData.peso, height: pacData.talla, age: pacData.edad, sex: pacData.sexo });
  const tmb  = tmbs[formula] || tmbs.mifflinStJeor;
  const get  = calcularGET(tmb, actFactor);
  const vet  = calcularVET(get, objetivo);
  const macrosObj = calcularMacros(vet, customMacros.prot, customMacros.carbs, customMacros.fat);

  // Sensores DnD
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setSlots(prev => prev.map(slot => {
      const ids = slot.items.map(i => i.uid);
      if (ids.includes(active.id) && ids.includes(over.id)) {
        const oldIdx = ids.indexOf(active.id);
        const newIdx = ids.indexOf(over.id);
        return { ...slot, items: arrayMove(slot.items, oldIdx, newIdx) };
      }
      return slot;
    }));
  };

  const addSlot = () => setSlots(prev => [...prev, {
    id: `slot-${Date.now()}`, nombre: `Tiempo ${prev.length + 1}`, hora: '12:00', items: [],
  }]);

  const removeSlot = (id) => setSlots(prev => prev.filter(s => s.id !== id));

  const updateSlot = (id, k, v) => setSlots(prev => prev.map(s => s.id === id ? { ...s, [k]: v } : s));

  const addAlimento = (slotId, alimento) => {
    setSlots(prev => prev.map(s => s.id !== slotId ? s : {
      ...s,
      items: [...s.items, { uid: `item-${Date.now()}`, alimento, cantidad: alimento.porcion }],
    }));
  };

  const removeAlimento = (slotId, uid) =>
    setSlots(prev => prev.map(s => s.id !== slotId ? s : {
      ...s, items: s.items.filter(i => i.uid !== uid),
    }));

  const updateQty = (slotId, uid, qty) =>
    setSlots(prev => prev.map(s => s.id !== slotId ? s : {
      ...s, items: s.items.map(i => i.uid === uid ? { ...i, cantidad: qty } : i),
    }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { nombre: planNombre, pacienteId, slots, vet, macrosObjetivo: macrosObj };
      await api.post('/api/mealplans', payload);
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}>
      <div className="space-y-5 animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <input
              className="bg-transparent text-2xl font-display font-bold text-white border-none outline-none w-full sm:w-auto"
              value={planNombre}
              onChange={e => setPlanNombre(e.target.value)}
              placeholder="Nombre del plan..."
            />
            <p className="text-sm text-white/30 mt-0.5">Constructor de Dietas</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button className="btn btn-ghost btn-sm gap-1.5"><Eye size={13} /> Vista previa</button>
            <button className="btn btn-secondary btn-sm gap-1.5"><Download size={13} /> PDF</button>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-sm gap-1.5">
              {saving ? <div className="w-3.5 h-3.5 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin" />
                : saved ? '✓' : <Save size={13} />}
              {saved ? 'Guardado' : 'Guardar plan'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-5">
          {/* ── Columna izquierda: Calculadora + Slots ── */}
          <div className="space-y-5">
            {/* Calculadora de requerimientos */}
            <div className="card !p-0 overflow-hidden">
              <button type="button" onClick={() => setShowCalc(v => !v)}
                className="flex items-center justify-between w-full px-5 py-4 text-left hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-gold" />
                  <span className="font-semibold text-white">Calculadora de Requerimientos</span>
                  {vet > 0 && (
                    <span className="badge badge-gold">VET: {vet} kcal</span>
                  )}
                </div>
                {showCalc ? <ChevronUp size={15} className="text-white/30" /> : <ChevronDown size={15} className="text-white/30" />}
              </button>

              {showCalc && (
                <div className="px-5 pb-5 space-y-5 border-t border-navy-700/50">
                  {/* Datos del paciente */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                    {[
                      { k: 'peso',  label: 'Peso',   unit: 'kg', ph: '70' },
                      { k: 'talla', label: 'Talla',  unit: 'cm', ph: '165' },
                      { k: 'edad',  label: 'Edad',   unit: 'años', ph: '30' },
                    ].map(f => (
                      <div key={f.k} className="form-group">
                        <label className="label">{f.label} <span className="text-white/30 normal-case">({f.unit})</span></label>
                        <input type="number" className="input text-center font-mono"
                          value={pacData[f.k]} onChange={e => setPacData(p => ({ ...p, [f.k]: e.target.value }))}
                          placeholder={f.ph} />
                      </div>
                    ))}
                    <div className="form-group">
                      <label className="label">Sexo biológico</label>
                      <select className="select" value={pacData.sexo} onChange={e => setPacData(p => ({ ...p, sexo: e.target.value }))}>
                        <option value="F">Femenino</option>
                        <option value="M">Masculino</option>
                      </select>
                    </div>
                  </div>

                  {/* TMB resultados */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { key: 'mifflinStJeor',  label: 'Mifflin-St Jeor' },
                      { key: 'harrisBenedict',  label: 'Harris-Benedict' },
                      { key: 'faoOms',          label: 'FAO/OMS'         },
                      { key: 'owen',            label: 'Owen'            },
                    ].map(f => (
                      <button key={f.key} type="button" onClick={() => setFormula(f.key)}
                        className={`p-3 rounded-xl border text-center transition-all
                          ${formula === f.key ? 'bg-emerald/10 border-emerald/30' : 'bg-navy-800/40 border-navy-700/40 hover:border-navy-600'}`}>
                        <div className="font-mono text-lg font-medium text-white">{tmbs[f.key] || '—'}</div>
                        <div className={`text-2xs mt-0.5 ${formula === f.key ? 'text-emerald' : 'text-white/30'}`}>{f.label}</div>
                      </button>
                    ))}
                  </div>

                  {/* Factor actividad + objetivo + GET/VET */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="form-group">
                      <label className="label">Factor de actividad</label>
                      <select className="select" value={actFactor} onChange={e => setActFactor(e.target.value)}>
                        {Object.entries(ACTIVITY_FACTORS).map(([k, v]) => (
                          <option key={k} value={k}>{v.label} (×{v.value})</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="label">Objetivo del tratamiento</label>
                      <select className="select" value={objetivo} onChange={e => setObjetivo(e.target.value)}>
                        {Object.entries(GOAL_ADJUSTMENTS).map(([k, v]) => (
                          <option key={k} value={k}>{k.replace(/_/g, ' ')} ({v > 0 ? '+' : ''}{v} kcal)</option>
                        ))}
                      </select>
                    </div>
                    <div className="p-3 rounded-xl bg-navy-800/60 border border-navy-700/40 flex flex-col justify-center">
                      <div className="flex justify-between text-xs text-white/30 mb-1">
                        <span>GET: <span className="font-mono text-white/60">{Math.round(get)} kcal</span></span>
                        <span>TMB: <span className="font-mono text-white/60">{tmb} kcal</span></span>
                      </div>
                      <div className="font-mono text-2xl font-medium text-gold">{vet}</div>
                      <div className="text-2xs text-white/30">VET objetivo (kcal/día)</div>
                    </div>
                  </div>

                  {/* Distribución de macros */}
                  <div>
                    <label className="label mb-2">Distribución de macronutrimentos</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {Object.entries(MACRO_PRESETS).map(([k, v]) => (
                        <button key={k} type="button" onClick={() => { setMacroPreset(k); setCustomMacros(v); }}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all
                            ${macroPreset === k ? 'bg-emerald text-navy-950' : 'bg-navy-700 text-white/50 hover:text-white'}`}>
                          {k.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { k: 'prot', label: 'Proteínas %', color: '#2ECC8E' },
                        { k: 'carbs', label: 'Carbohidratos %', color: '#3B82F6' },
                        { k: 'fat', label: 'Lípidos %', color: '#E8C96A' },
                      ].map(m => (
                        <div key={m.k} className="form-group">
                          <label className="label text-2xs" style={{ color: m.color }}>{m.label}</label>
                          <div className="relative">
                            <input type="number" min="5" max="70" className="input text-center font-mono pr-6"
                              value={Math.round(customMacros[m.k] * 100)}
                              onChange={e => setCustomMacros(p => ({ ...p, [m.k]: Number(e.target.value) / 100 }))} />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-xs">%</span>
                          </div>
                          <div className="text-2xs text-white/30 mt-1 text-center font-mono">
                            = {m.k === 'prot' ? macrosObj.proteinas_g : m.k === 'carbs' ? macrosObj.carbos_g : macrosObj.lipidos_g}g
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Slots de tiempos de comida */}
            <div className="space-y-3">
              {slots.map((slot, i) => (
                <MealSlot
                  key={slot.id} slot={slot} index={i}
                  alimentos={alimentos}
                  onAddAlimento={addAlimento}
                  onRemoveAlimento={removeAlimento}
                  onQtyChange={updateQty}
                  onUpdateSlot={updateSlot}
                  onRemoveSlot={removeSlot}
                />
              ))}

              <button type="button" onClick={addSlot}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-navy-700 text-sm text-white/30
                           hover:text-emerald hover:border-emerald/40 transition-all duration-200">
                <Plus size={15} /> Agregar tiempo de comida
              </button>
            </div>
          </div>

          {/* ── Columna derecha: Cómputo nutricional ── */}
          <NutritionPanel slots={slots} vet={vet} macrosObjetivo={macrosObj} sexo={pacData.sexo} />
        </div>
      </div>
    </DndContext>
  );
}
