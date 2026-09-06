import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, CalendarDays } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import PageHeader from '../../design-system/components/PageHeader.jsx';
import Card from '../../design-system/components/Card.jsx';
import StatTile from '../../design-system/components/StatTile.jsx';
import Badge from '../../design-system/components/Badge.jsx';
import Button from '../../design-system/components/Button.jsx';
import { LoadingState, ErrorState } from '../../design-system/components/StateViews.jsx';

export default function AdminNutritionistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminAPI.getNutritionist(id);
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cargar el nutriólogo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const toggleStatus = async () => {
    try {
      const nuevo = !data.nutritionist.isActive;
      await adminAPI.setNutritionistStatus(id, nuevo);
      setData((prev) => ({ ...prev, nutritionist: { ...prev.nutritionist, isActive: nuevo } }));
      toast.success(nuevo ? 'Cuenta reactivada.' : 'Cuenta desactivada.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo cambiar el estado de la cuenta.');
    }
  };

  if (loading) return <LoadingState label="Cargando…" />;
  if (error) return <ErrorState message={error} onRetry={cargar} />;

  const { nutritionist, stats } = data;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/admin/nutriologos')} className="gap-1.5">
        <ArrowLeft size={15} /> Volver
      </Button>

      <PageHeader
        title={nutritionist.name}
        subtitle={nutritionist.email}
        actions={
          <Button variant={nutritionist.isActive ? 'outline' : 'primary'} onClick={toggleStatus}>
            {nutritionist.isActive ? 'Desactivar cuenta' : 'Reactivar cuenta'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Pacientes" value={stats.patientCount} icon={<Users size={16} />} />
        <StatTile label="Citas" value={stats.appointmentCount} icon={<CalendarDays size={16} />} />
        <div className="card p-5">
          <div className="mb-2 text-2xs font-semibold uppercase tracking-wide text-[var(--ink-secondary)]">Estado</div>
          <Badge variant={nutritionist.isActive ? 'success' : 'danger'}>{nutritionist.isActive ? 'Activo' : 'Desactivado'}</Badge>
        </div>
        <div className="card p-5">
          <div className="mb-2 text-2xs font-semibold uppercase tracking-wide text-[var(--ink-secondary)]">Registrado</div>
          <div className="text-sm text-[var(--ink)]">{new Date(nutritionist.createdAt).toLocaleDateString('es-MX')}</div>
        </div>
      </div>

      <Card>
        <h3 className="section-title mb-4 text-base">Datos de contacto</h3>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-[var(--ink-secondary)]">Especialidad</dt>
            <dd className="text-sm text-[var(--ink)]">{nutritionist.specialty || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--ink-secondary)]">Teléfono</dt>
            <dd className="text-sm text-[var(--ink)]">{nutritionist.phone || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--ink-secondary)]">Último inicio de sesión</dt>
            <dd className="text-sm text-[var(--ink)]">
              {nutritionist.lastLoginAt ? new Date(nutritionist.lastLoginAt).toLocaleString('es-MX') : 'Nunca'}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--ink-secondary)]">Preferencias de correo</dt>
            <dd className="flex gap-2 text-sm text-[var(--ink)]">
              <Badge variant={nutritionist.notificationPreferences?.marketingEmails !== false ? 'info' : 'neutral'}>
                Marketing {nutritionist.notificationPreferences?.marketingEmails !== false ? 'activo' : 'desactivado'}
              </Badge>
              <Badge variant={nutritionist.notificationPreferences?.usageReports !== false ? 'info' : 'neutral'}>
                Reportes {nutritionist.notificationPreferences?.usageReports !== false ? 'activo' : 'desactivado'}
              </Badge>
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
