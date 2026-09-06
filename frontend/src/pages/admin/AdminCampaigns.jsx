import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { adminAPI } from '../../services/api';
import PageHeader from '../../design-system/components/PageHeader.jsx';
import DataTable from '../../design-system/components/DataTable.jsx';
import Badge from '../../design-system/components/Badge.jsx';
import Button from '../../design-system/components/Button.jsx';

const SEGMENT_LABEL = { all: 'Todos', active: 'Activos', inactive: 'Inactivos', custom: 'Personalizado' };

export default function AdminCampaigns() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminAPI.getCampaigns();
      setRows(res.data.data.campaigns);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cargar el historial de campañas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const columns = [
    { key: 'subject', header: 'Asunto' },
    { key: 'segment', header: 'Segmento', render: (r) => SEGMENT_LABEL[r.segment?.type] || r.segment?.type },
    { key: 'stats', header: 'Resultados', render: (r) => (
      <div className="flex gap-1.5">
        <Badge variant="success">{r.stats?.sent || 0} enviados</Badge>
        {r.stats?.failed ? <Badge variant="danger">{r.stats.failed} fallidos</Badge> : null}
        {r.stats?.skipped ? <Badge variant="neutral">{r.stats.skipped} omitidos</Badge> : null}
      </div>
    ) },
    { key: 'sentAt', header: 'Enviada', render: (r) => (r.sentAt ? new Date(r.sentAt).toLocaleString('es-MX') : '—') },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campañas"
        subtitle="Correos de marketing enviados a los nutriólogos registrados."
        actions={
          <Button onClick={() => navigate('/admin/campanas/nueva')} className="gap-2">
            <Plus size={16} /> Nueva campaña
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r._id}
        loading={loading}
        error={error}
        onRetry={cargar}
        onRowClick={(r) => navigate(`/admin/campanas/${r._id}`)}
        empty={<div className="empty-state"><p className="text-sm text-[var(--ink-muted)]">Todavía no se ha enviado ninguna campaña.</p></div>}
      />
    </div>
  );
}
