import { Suspense, lazy, useCallback, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { LEGACY_REDIRECTS } from './lib/redirects';

// Design System
import Sidebar from './design-system/components/Sidebar';
import Topbar from './design-system/components/Topbar';
import AdminLayout from './pages/admin/AdminLayout';

// Lazy pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const LandingView = lazy(() => import('./features/landing/LandingView'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Patients = lazy(() => import('./pages/Patients'));
const NewPatient = lazy(() => import('./pages/NewPatient'));
const PatientDetail = lazy(() => import('./pages/PatientDetail'));
const Appointments = lazy(() => import('./pages/Appointments'));
const NewAppointment = lazy(() => import('./pages/NewAppointment'));
const ConsultationSession = lazy(() => import('./pages/ConsultationSession'));
const MealPlans = lazy(() => import('./pages/MealPlans'));
const DietTemplates = lazy(() => import('./pages/DietTemplates'));
const MenuBuilder = lazy(() => import('./pages/MenuBuilder'));
const Profile = lazy(() => import('./pages/Profile'));
const Finance = lazy(() => import('./pages/Finance'));

// Panel de administrador: mismo login/JWT, distinto rol y layout (ver
// pages/admin/AdminLayout.jsx) — nunca lo ve un nutriólogo normal.
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminNutritionists = lazy(() => import('./pages/admin/AdminNutritionists'));
const AdminNutritionistDetail = lazy(() => import('./pages/admin/AdminNutritionistDetail'));
const AdminCampaigns = lazy(() => import('./pages/admin/AdminCampaigns'));
const AdminCampaignNew = lazy(() => import('./pages/admin/AdminCampaignNew'));
const AdminCampaignDetail = lazy(() => import('./pages/admin/AdminCampaignDetail'));

// Públicas: las abre un paciente o un visitante sin cuenta, nunca dentro de
// AppLayout (ver pages/public/PublicPageShell.jsx).
const PreConsultationWizard = lazy(() => import('./pages/public/PreConsultationWizard'));
const PatientPortal = lazy(() => import('./pages/public/PatientPortal'));
const PublicBooking = lazy(() => import('./pages/public/PublicBooking'));

// Contenedores con pestañas. "Alimentos", "Plantillas", "Calculadoras",
// "Reportes PDF" y "Estadísticas" eran cinco destinos de primer nivel; ahora
// son pestañas dentro de las dos secciones donde realmente se usan.
const Dietas = lazy(() => import('./pages/Dietas'));
const Herramientas = lazy(() => import('./pages/Herramientas'));
const FoodsTab = lazy(() => import('./pages/tools/FoodsTab'));
const CalculatorTab = lazy(() => import('./pages/tools/CalculatorTab'));
const PopulationReports = lazy(() => import('./pages/PopulationReports'));

import './index.css';

function RedirectToPatientTab({ tab }) {
  const { id } = useParams();
  return <Navigate to={`/pacientes/${id}/${tab}`} replace />;
}

// ── Protected Route ───────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--surface-alt)] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
          <span className="text-sm text-[var(--ink-muted)]">Cargando NutriPro…</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// ── Admin Protected Route ─────────────────────────────────────────
// Igual que ProtectedRoute, pero exige además role:'admin' — un nutriólogo
// normal autenticado que navegue a /admin rebota a su propio dashboard, no
// a /login (sí está autenticado, solo no tiene el rol).
const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--surface-alt)] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
          <span className="text-sm text-[var(--ink-muted)]">Cargando NutriPro…</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return children;
};

const PageFallback = ({ fullScreen = false }) => (
  <div
    className={`${fullScreen ? 'min-h-screen' : 'min-h-[40vh]'} bg-[var(--surface-alt)] flex items-center justify-center font-sans`}
  >
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
      <span className="text-sm text-[var(--ink-muted)]">Cargando vista…</span>
    </div>
  </div>
);

// ── Main App Layout ───────────────────────────────────────────────
const AppLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  // Referencia estable a propósito: Sidebar la mete en las dependencias de un
  // efecto que cierra el drawer al cambiar de ruta. Una arrow function nueva
  // en cada render de AppLayout (como antes) hacía que ese efecto se
  // disparara en CADA render, no solo al navegar — así que el drawer se
  // cerraba solo un instante después de abrirse, y el botón de hamburguesa
  // parecía no hacer nada.
  const closeMobileMenu = useCallback(() => setMobileOpen(false), []);

  return (
    <div className="app-layout">
      <Sidebar mobileOpen={mobileOpen} onClose={closeMobileMenu} />
      <div className="main-content">
        <Topbar onMenuToggle={setMobileOpen} />
        <main className="content-area" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

// ── Route factory helper ──────────────────────────────────────────
const ProtectedPage = ({ element }) => (
  <ProtectedRoute>
    <AppLayout>
      <Suspense fallback={<PageFallback />}>{element}</Suspense>
    </AppLayout>
  </ProtectedRoute>
);

const AdminProtectedPage = ({ element }) => (
  <AdminProtectedRoute>
    <AdminLayout>
      <Suspense fallback={<PageFallback />}>{element}</Suspense>
    </AdminLayout>
  </AdminProtectedRoute>
);

// ── App ───────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <ToastProvider>
      <BrowserRouter>
        <Suspense fallback={<PageFallback fullScreen />}>
          <Routes>
            {/* ── Public Routes ── */}
            <Route path="/" element={<LandingView />} />
            <Route path="/landing" element={<LandingView />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Públicas: cuestionario pre-consulta, portal del paciente y
                agendamiento — cada una valida su propio token/username en el
                servidor, no llevan ProtectedPage ni AppLayout. */}
            <Route path="/consulta/:token" element={<PreConsultationWizard />} />
            <Route path="/portal/:token" element={<PatientPortal />} />
            <Route path="/@:username" element={<PublicBooking />} />

            {/* ── Protected App Routes ── */}

            <Route path="/dashboard" element={<ProtectedPage element={<Dashboard />} />} />

            {/* Pacientes */}
            <Route path="/pacientes" element={<ProtectedPage element={<Patients />} />} />
            <Route path="/pacientes/nuevo" element={<ProtectedPage element={<NewPatient />} />} />
            <Route path="/pacientes/:id/editar" element={<ProtectedPage element={<NewPatient />} />} />
            <Route path="/pacientes/:id/evolucion" element={<ProtectedPage element={<PatientDetail />} />} />
            <Route path="/pacientes/:id/clinica" element={<ProtectedPage element={<PatientDetail />} />} />
            <Route path="/pacientes/:id/dietas" element={<ProtectedPage element={<PatientDetail />} />} />

            {/* Pestañas fusionadas: mediciones, laboratorio y actividad viven
                ahora en "Evolución"; hábitos vive en "Clínica". Se redirigen
                para no romper enlaces al expediente de un paciente. */}
            {[
              ['mediciones', 'evolucion'],
              ['laboratorio', 'evolucion'],
              ['actividad', 'evolucion'],
              ['seguimiento', 'evolucion'],
              ['habitos', 'clinica'],
              ['psiconutricion', 'clinica'],
            ].map(([vieja, nueva]) => (
              <Route
                key={vieja}
                path={`/pacientes/:id/${vieja}`}
                element={<ProtectedPage element={<RedirectToPatientTab tab={nueva} />} />}
              />
            ))}
            <Route path="/pacientes/:id" element={<ProtectedPage element={<PatientDetail />} />} />

            {/* Agenda */}
            <Route path="/agenda" element={<ProtectedPage element={<Appointments />} />} />
            <Route path="/agenda/nueva" element={<ProtectedPage element={<NewAppointment />} />} />
            <Route path="/agenda/:appointmentId/consulta" element={<ProtectedPage element={<ConsultationSession />} />} />

            {/* Dietas: planes, plantillas y catálogo de alimentos */}
            <Route path="/dietas/nueva" element={<ProtectedPage element={<MenuBuilder />} />} />
            <Route path="/dietas/:id/editar" element={<ProtectedPage element={<MenuBuilder />} />} />
            <Route path="/dietas" element={<ProtectedPage element={<Dietas />} />}>
              <Route index element={<MealPlans />} />
              <Route path="plantillas" element={<DietTemplates />} />
              <Route path="alimentos" element={<FoodsTab />} />
            </Route>

            {/* Herramientas: calculadoras y estadísticas de la consulta */}
            <Route path="/herramientas" element={<ProtectedPage element={<Herramientas />} />}>
              <Route index element={<CalculatorTab />} />
              <Route path="estadisticas" element={<PopulationReports />} />
            </Route>

            {/* Cuenta */}
            <Route path="/finanzas" element={<ProtectedPage element={<Finance />} />} />
            <Route path="/perfil" element={<ProtectedPage element={<Profile />} />} />

            {/* Panel de administrador: solo role:'admin', ver AdminProtectedRoute */}
            <Route path="/admin" element={<AdminProtectedPage element={<AdminDashboard />} />} />
            <Route path="/admin/nutriologos" element={<AdminProtectedPage element={<AdminNutritionists />} />} />
            <Route path="/admin/nutriologos/:id" element={<AdminProtectedPage element={<AdminNutritionistDetail />} />} />
            <Route path="/admin/campanas" element={<AdminProtectedPage element={<AdminCampaigns />} />} />
            <Route path="/admin/campanas/nueva" element={<AdminProtectedPage element={<AdminCampaignNew />} />} />
            <Route path="/admin/campanas/:id" element={<AdminProtectedPage element={<AdminCampaignDetail />} />} />

            {/* Redirecciones de URLs heredadas. La tabla vive en
                `lib/redirects.js` para que las pruebas comprueben la misma
                fuente que usa el router, no una copia. */}
            {Object.entries(LEGACY_REDIRECTS).map(([desde, hacia]) => (
              <Route key={desde} path={desde} element={<Navigate to={hacia} replace />} />
            ))}
            <Route path="/patients/:id" element={<Navigate to="/pacientes/:id" replace />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
