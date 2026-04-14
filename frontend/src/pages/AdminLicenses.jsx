import { CalendarClock, CreditCard, Mail, ShieldCheck, Users } from 'lucide-react';

const LICENSES = [
  { email: 'andrea@clinicanp.mx', status: 'Activa', plan: 'Anual', expires: '2027-03-30' },
  { email: 'hector@metabolica.mx', status: 'Trial', plan: '14 días', expires: '2026-04-20' },
  { email: 'laura@consultanutri.mx', status: 'Expirada', plan: 'Anual', expires: '2026-03-12' },
  { email: 'sofia@nutrimed.mx', status: 'Activa', plan: 'Anual', expires: '2026-11-08' },
];

const STATUS_CLASS = {
  Activa: 'badge-success',
  Trial: 'badge-warning',
  Expirada: 'badge-danger',
};

export default function AdminLicenses() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-gold mb-2">
            <ShieldCheck size={14} />
            Módulo 12
          </div>
          <h1 className="page-title">Gestión de Licencias</h1>
          <p className="page-subtitle">Panel central para las 100 licencias, renovaciones e ingresos del SaaS NutriPro.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline">
            <Mail size={15} />
            Enviar renovación
          </button>
          <button className="btn btn-primary">
            <CreditCard size={15} />
            Crear licencia
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Licencias activas', '68 / 100', Users, '#2ECC8E'],
          ['Trials vigentes', '9', CalendarClock, '#E8C96A'],
          ['Ingresos anuales', '$82,932 MXN', CreditCard, '#3B82F6'],
          ['Renovaciones próximas', '11', Mail, '#A855F7'],
        ].map(([label, value, icon, color]) => {
          const IconComponent = icon;
          return (
          <div key={label} className="card">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${color}20`, border: `1px solid ${color}35` }}>
              <IconComponent size={18} style={{ color }} />
            </div>
            <div className="font-mono text-2xl" style={{ color }}>{value}</div>
            <div className="text-sm text-white/40 mt-1">{label}</div>
          </div>
        )})}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <section className="card !p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-navy-700/50">
            <h2 className="section-title">Licencias registradas</h2>
          </div>
          <div className="table-wrapper rounded-none border-0">
            <table className="table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Estado</th>
                  <th>Plan</th>
                  <th>Vencimiento</th>
                </tr>
              </thead>
              <tbody>
                {LICENSES.map((license) => (
                  <tr key={license.email}>
                    <td className="font-medium text-white">{license.email}</td>
                    <td><span className={`badge ${STATUS_CLASS[license.status]}`}>{license.status}</span></td>
                    <td>{license.plan}</td>
                    <td className="font-mono">{license.expires}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="card">
            <h2 className="section-title">Mapa de ocupación</h2>
            <div className="grid grid-cols-10 gap-1.5 mt-4">
              {Array.from({ length: 100 }).map((_, index) => (
                <div
                  key={index}
                  className={`aspect-square rounded-md ${index < 68 ? 'bg-emerald/80' : index < 77 ? 'bg-gold/80' : 'bg-navy-700'}`}
                />
              ))}
            </div>
            <div className="text-xs text-white/35 mt-3">68 activas · 9 trial · 23 disponibles</div>
          </section>
          <section className="card">
            <h2 className="section-title">Pendientes backend</h2>
            <p className="text-sm text-white/45 mt-2">
              Falta conectar Stripe, activación/desactivación real y trazabilidad de pagos. La pantalla ya deja resuelta la navegación administrativa del MVP.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
