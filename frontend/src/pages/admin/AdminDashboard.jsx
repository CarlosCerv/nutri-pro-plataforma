import { useEffect, useState } from 'react';
import { Users, UserCheck, UserX, ClipboardList, Mail, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { adminAPI } from '../../services/api';
import PageHeader from '../../design-system/components/PageHeader.jsx';
import StatTile from '../../design-system/components/StatTile.jsx';
import Card from '../../design-system/components/Card.jsx';
import { LoadingState, ErrorState } from '../../design-system/components/StateViews.jsx';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminAPI.getDashboard();
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cargar el dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Vista global de todos los nutriólogos registrados en NutriPro." />

      {loading ? (
        <LoadingState label="Cargando estadísticas…" />
      ) : error ? (
        <ErrorState message={error} onRetry={cargar} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatTile label="Nutriólogos registrados" value={data.totalNutritionists} icon={<Users size={16} />} />
            <StatTile label="Cuentas activas" value={data.activeNutritionists} icon={<UserCheck size={16} />} tone="success" />
            <StatTile label="Cuentas desactivadas" value={data.inactiveNutritionists} icon={<UserX size={16} />} tone={data.inactiveNutritionists > 0 ? 'warning' : 'neutral'} />
            <StatTile label="Altas este mes" value={data.newThisMonth} icon={<TrendingUp size={16} />} tone="accent" />
            <StatTile label="Pacientes en la plataforma" value={data.totalPatients} icon={<ClipboardList size={16} />} />
            <StatTile label="Campañas enviadas" value={data.campaignsSent} icon={<Mail size={16} />} />
          </div>

          <Card>
            <h3 className="section-title mb-4 text-base">Nuevos nutriólogos por mes</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.growthSeries}>
                  <defs>
                    <linearGradient id="adminGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--ink-secondary)" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="var(--ink-secondary)" width={30} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" name="Nuevos nutriólogos" stroke="var(--accent)" fill="url(#adminGrowth)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
