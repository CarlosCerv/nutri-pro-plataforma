import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { adminAPI } from '../../services/api';
import PageHeader from '../../design-system/components/PageHeader.jsx';
import Card from '../../design-system/components/Card.jsx';
import StatTile from '../../design-system/components/StatTile.jsx';
import Badge from '../../design-system/components/Badge.jsx';
import Button from '../../design-system/components/Button.jsx';
import DataTable from '../../design-system/components/DataTable.jsx';
import { LoadingState, ErrorState } from '../../design-system/components/StateViews.jsx';

const STATUS_VARIANT = { sent: 'success', failed: 'danger', skipped_optout: 'neutral', pending: 'warning' };
const STATUS_LABEL = { sent: 'Enviado', failed: 'Falló', skipped_optout: 'Omitido (opt-out)', pending: 'Pendiente' };

export default function AdminCampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminAPI.getCampaign(id);
      setCampaign(res.data.data.campaign);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cargar la campaña.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <LoadingState label="Cargando…" />;
  if (error) return <ErrorState message={error} onRetry={cargar} />;

  const columns = [
    { key: 'email', header: 'Destinatario' },
    { key: 'status', header: 'Estado', render: (r) => (
      <Badge variant={STATUS_VARIANT[r.status] || 'neutral'}>{STATUS_LABEL[r.status] || r.status}</Badge>
    ) },
    { key: 'error', header: 'Detalle', render: (r) => r.error || '—' },
    { key: 'sentAt', header: 'Enviado', render: (r) => (r.sentAt ? new Date(r.sentAt).toLocaleString('es-MX') : '—') },
  ];

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/admin/campanas')} className="gap-1.5">
        <ArrowLeft size={15} /> Volver
      </Button>

      <PageHeader title={campaign.subject} subtitle={`Enviada el ${new Date(campaign.sentAt).toLocaleString('es-MX')}`} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Enviados" value={campaign.stats.sent} tone="success" />
        <StatTile label="Fallidos" value={campaign.stats.failed} tone={campaign.stats.failed ? 'danger' : 'neutral'} />
        <StatTile label="Omitidos" value={campaign.stats.skipped} />
      </div>

      <Card>
        <h3 className="section-title mb-4 text-base">Contenido enviado</h3>
        <div
          className="rounded-[var(--radius-m)] border border-[var(--border-soft)] bg-[var(--surface-alt)] p-4 text-sm"
          dangerouslySetInnerHTML={{ __html: campaign.bodyHtml }}
        />
      </Card>

      <div>
        <h3 className="section-title mb-3 text-base">Resultado por destinatario</h3>
        <DataTable columns={columns} rows={campaign.recipients} rowKey={(r) => r.email} />
      </div>
    </div>
  );
}
