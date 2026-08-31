import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { paymentsAPI, patientsAPI } from '../services/api';
import { getApiErrorMessage } from '../lib/apiError';
import Button from '../design-system/components/Button.jsx';
import Combobox from '../design-system/components/Combobox.jsx';
import DataTable from '../design-system/components/DataTable.jsx';
import Modal from '../design-system/components/Modal.jsx';
import StatTile from '../design-system/components/StatTile.jsx';
import Badge from '../design-system/components/Badge.jsx';
import SaveBar from '../design-system/components/SaveBar.jsx';
import useSaveState from '../hooks/useSaveState';
import { EmptyState } from '../design-system/components/StateViews.jsx';
import { Input, Textarea } from '../design-system/components';

/**
 * Finanzas de la consulta.
 *
 * La versión anterior mostraba tres cifras inventadas ("$12,450", "$3,200",
 * "$9,250") bajo el rótulo "datos de ejemplo hasta activar cobros", y un
 * bloque de "Próximamente". Nada de eso hacía falta: el modelo `Payment`
 * estaba completo, `/api/payments` expuesto y protegido, y `paymentsAPI`
 * declarado en `services/api.js` sin un solo consumidor.
 */

const MXN = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

const ESTADOS = [
  { value: 'paid', label: 'Cobrado' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'cancelled', label: 'Cancelado' },
];

const METODOS = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'card', label: 'Tarjeta' },
  { value: 'transfer', label: 'Transferencia' },
  { value: 'other', label: 'Otro' },
];

const ETIQUETA_ESTADO = Object.fromEntries(ESTADOS.map((e) => [e.value, e.label]));
const ETIQUETA_METODO = Object.fromEntries(METODOS.map((m) => [m.value, m.label]));
const BADGE_ESTADO = { paid: 'success', pending: 'warning', cancelled: 'neutral' };

const FORM_VACIO = {
  patient: '',
  amount: '',
  date: new Date().toISOString().slice(0, 10),
  status: 'paid',
  method: 'cash',
  notes: '',
};

export default function Finance() {
  const [resumen, setResumen] = useState(null);
  const [cobros, setCobros] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recarga, setRecarga] = useState(0);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState(FORM_VACIO);
  const { saving, saved, error: errorGuardado, save } = useSaveState();

  useEffect(() => {
    let cancelado = false;
    setLoading(true);

    (async () => {
      try {
        const [resSummary, resPagos, resPacientes] = await Promise.all([
          paymentsAPI.getSummary(),
          paymentsAPI.getAll(filtro ? { status: filtro } : undefined),
          patientsAPI.getAll(),
        ]);
        if (cancelado) return;
        setResumen(resSummary.data?.data || null);
        setCobros(resPagos.data?.data || []);
        setPacientes(resPacientes.data?.data || []);
        setError(null);
      } catch (err) {
        if (!cancelado) setError(getApiErrorMessage(err, 'No se pudieron cargar los cobros.'));
      } finally {
        if (!cancelado) setLoading(false);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [filtro, recarga]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const onSelect = (e) => set(e.target.name, e.target.value);

  const registrar = async (e) => {
    e.preventDefault();
    const { ok } = await save(() =>
      paymentsAPI.create({
        patient: form.patient,
        amount: parseFloat(form.amount),
        date: form.date,
        status: form.status,
        method: form.method,
        notes: form.notes || undefined,
      })
    );
    if (ok) {
      setModalAbierto(false);
      setForm(FORM_VACIO);
      setRecarga((n) => n + 1);
    }
  };

  const opcionesPaciente = useMemo(
    () =>
      pacientes.map((p) => ({
        value: p._id,
        label: `${p.firstName} ${p.lastName}`,
        description: p.email || p.phone || undefined,
      })),
    [pacientes]
  );

  const columnas = [
    {
      key: 'patient',
      header: 'Paciente',
      render: (p) => (p.patient ? `${p.patient.firstName} ${p.patient.lastName}` : 'Sin paciente'),
    },
    {
      key: 'date',
      header: 'Fecha',
      render: (p) => new Date(p.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
    { key: 'method', header: 'Método', render: (p) => ETIQUETA_METODO[p.method] || p.method },
    {
      key: 'status',
      header: 'Estado',
      render: (p) => <Badge variant={BADGE_ESTADO[p.status] || 'neutral'}>{ETIQUETA_ESTADO[p.status] || p.status}</Badge>,
    },
    { key: 'amount', header: 'Importe', align: 'right', render: (p) => <span className="font-mono">{MXN.format(p.amount)}</span> },
  ];

  const mes = resumen?.mes;
  const variacion = mes?.variacionVsMesAnterior;

  const reintentar = useCallback(() => setRecarga((n) => n + 1), []);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--ink-muted)]">Cobros de tu consulta, del mes en curso.</p>
        <Button size="sm" className="gap-2" onClick={() => setModalAbierto(true)}>
          <Plus size={16} />
          Registrar cobro
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile
          label="Cobrado este mes"
          value={MXN.format(mes?.cobrado || 0)}
          tone="success"
          icon={<TrendingUp size={14} strokeWidth={1.75} />}
          hint={
            variacion === null || variacion === undefined
              ? `${mes?.cobros || 0} ${mes?.cobros === 1 ? 'cobro' : 'cobros'}`
              : `${variacion >= 0 ? '+' : ''}${variacion}% vs. mes anterior`
          }
        />
        <StatTile
          label="Pendiente de cobro"
          value={MXN.format(mes?.pendiente || 0)}
          tone="warning"
          icon={<TrendingDown size={14} strokeWidth={1.75} />}
          hint={`${mes?.pendientes || 0} ${mes?.pendientes === 1 ? 'cobro' : 'cobros'} sin liquidar`}
        />
        <StatTile
          label="Total facturado"
          value={MXN.format((mes?.cobrado || 0) + (mes?.pendiente || 0))}
          tone="accent"
          icon={<Wallet size={14} strokeWidth={1.75} />}
          hint="Cobrado más pendiente"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className={`tab-btn${filtro === '' ? ' active' : ''}`} onClick={() => setFiltro('')}>
          Todos
        </button>
        {ESTADOS.map((e) => (
          <button
            key={e.value}
            type="button"
            className={`tab-btn${filtro === e.value ? ' active' : ''}`}
            onClick={() => setFiltro(e.value)}
          >
            {e.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columnas}
        rows={cobros}
        loading={loading}
        error={error}
        onRetry={reintentar}
        empty={
          <EmptyState
            icon={<Wallet size={26} strokeWidth={1.5} />}
            title={filtro ? 'Sin cobros con ese estado' : 'Todavía no hay cobros'}
            description={
              filtro
                ? 'Prueba con otro estado o quita el filtro.'
                : 'Registra el primer cobro para empezar a ver el resumen del mes.'
            }
            action={
              filtro ? null : (
                <Button size="sm" className="gap-2" onClick={() => setModalAbierto(true)}>
                  <Plus size={15} />
                  Registrar cobro
                </Button>
              )
            }
          />
        }
      />

      <Modal
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title="Registrar cobro"
        size="md"
      >
        <form onSubmit={registrar} className="space-y-4">
          <Combobox
            name="patient"
            label="Paciente"
            required
            searchable
            options={opcionesPaciente}
            value={form.patient}
            onChange={onSelect}
            placeholder="Seleccionar paciente…"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              id="cobro-importe"
              label="Importe (MXN)"
              required
              type="number" min="0" step="0.01" value={form.amount} onChange={(e) => set('amount', e.target.value)} placeholder="600"
            />
            <Input
              id="cobro-fecha"
              label="Fecha"
              type="date" value={form.date} onChange={(e) => set('date', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Combobox name="status" label="Estado" options={ESTADOS} value={form.status} onChange={onSelect} />
            <Combobox name="method" label="Método" options={METODOS} value={form.method} onChange={onSelect} />
          </div>

          <Textarea
            id="cobro-notas"
            label="Notas"
            rows="2" value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Consulta de seguimiento…"
          />

          <SaveBar
            saving={saving}
            saved={saved}
            error={errorGuardado}
            label="Registrar cobro"
            savedLabel="Registrado"
            disabled={!form.patient || !form.amount}
          />
        </form>
      </Modal>
    </div>
  );
}
