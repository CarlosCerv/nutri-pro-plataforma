import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import PageHeader from '../../design-system/components/PageHeader.jsx';
import DataTable from '../../design-system/components/DataTable.jsx';
import Badge from '../../design-system/components/Badge.jsx';
import Combobox from '../../design-system/components/Combobox.jsx';
import Button from '../../design-system/components/Button.jsx';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Desactivados' },
];

export default function AdminNutritionists() {
  const navigate = useNavigate();
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');

  const cargar = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminAPI.getNutritionists({ q: q || undefined, status: status || undefined });
      setRows(res.data.data.nutritionists);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cargar la lista de nutriólogos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(cargar, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status]);

  const toggleStatus = async (row) => {
    const nuevo = !row.isActive;
    try {
      await adminAPI.setNutritionistStatus(row._id, nuevo);
      setRows((prev) => prev.map((r) => (r._id === row._id ? { ...r, isActive: nuevo } : r)));
      toast.success(nuevo ? `${row.name} fue reactivado.` : `${row.name} fue desactivado.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo cambiar el estado de la cuenta.');
    }
  };

  const columns = [
    { key: 'name', header: 'Nombre', render: (r) => (
      <div>
        <div className="font-medium text-[var(--ink)]">{r.name}</div>
        <div className="text-xs text-[var(--ink-secondary)]">{r.email}</div>
      </div>
    ) },
    { key: 'specialty', header: 'Especialidad', render: (r) => r.specialty || '—' },
    { key: 'patientCount', header: 'Pacientes', align: 'right' },
    { key: 'appointmentCount', header: 'Citas', align: 'right' },
    { key: 'createdAt', header: 'Registrado', render: (r) => new Date(r.createdAt).toLocaleDateString('es-MX') },
    { key: 'status', header: 'Estado', render: (r) => (
      <Badge variant={r.isActive ? 'success' : 'danger'}>{r.isActive ? 'Activo' : 'Desactivado'}</Badge>
    ) },
    { key: 'actions', header: '', align: 'right', render: (r) => (
      <Button
        size="sm"
        variant={r.isActive ? 'outline' : 'primary'}
        onClick={(e) => { e.stopPropagation(); toggleStatus(r); }}
      >
        {r.isActive ? 'Desactivar' : 'Activar'}
      </Button>
    ) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Nutriólogos" subtitle="Todas las cuentas registradas en NutriPro." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-secondary)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre o correo…"
            className="input w-full pl-9"
          />
        </div>
        <div className="w-full sm:w-48">
          <Combobox options={STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value)} />
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r._id}
        loading={loading}
        error={error}
        onRetry={cargar}
        onRowClick={(r) => navigate(`/admin/nutriologos/${r._id}`)}
        empty={<div className="empty-state"><p className="text-sm text-[var(--ink-muted)]">No hay nutriólogos que coincidan con la búsqueda.</p></div>}
      />
    </div>
  );
}
