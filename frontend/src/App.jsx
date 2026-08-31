import { Suspense, lazy, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LEGACY_REDIRECTS } from './lib/redirects';

// Design System
import Sidebar from './design-system/components/Sidebar';
import Topbar from './design-system/components/Topbar';

// Lazy pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Patients = lazy(() => import('./pages/Patients'));
const NewPatient = lazy(() => import('./pages/NewPatient'));
const PatientDetail = lazy(() => import('./pages/PatientDetail'));
const Appointments = lazy(() => import('./pages/Appointments'));
const NewAppointment = lazy(() => import('./pages/NewAppointment'));
const MealPlans = lazy(() => import('./pages/MealPlans'));
const DietTemplates = lazy(() => import('./pages/DietTemplates'));
const MenuBuilder = lazy(() => import('./pages/MenuBuilder'));
const Profile = lazy(() => import('./pages/Profile'));
const Finance = lazy(() => import('./pages/Finance'));

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
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
          <span className="text-sm text-[var(--text-secondary)]">Cargando NutriPro…</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PageFallback = ({ fullScreen = false }) => (
  <div
    className={`${fullScreen ? 'min-h-screen' : 'min-h-[40vh]'} bg-[var(--bg-primary)] flex items-center justify-center font-sans`}
  >
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
      <span className="text-sm text-[var(--text-secondary)]">Cargando vista…</span>
    </div>
  </div>
);

// ── Main App Layout ───────────────────────────────────────────────
const AppLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
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

// ── App ───────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageFallback fullScreen />}>
          <Routes>
            {/* ── Public Routes ── */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* ── Protected App Routes ── */}

            <Route path="/dashboard" element={<ProtectedPage element={<Dashboard />} />} />

            {/* Pacientes */}
            <Route path="/pacientes" element={<ProtectedPage element={<Patients />} />} />
            <Route path="/pacientes/nuevo" element={<ProtectedPage element={<NewPatient />} />} />
            <Route path="/pacientes/:id/editar" element={<ProtectedPage element={<NewPatient />} />} />
            <Route path="/pacientes/:id/mediciones" element={<ProtectedPage element={<PatientDetail />} />} />
            <Route path="/pacientes/:id/habitos" element={<ProtectedPage element={<PatientDetail />} />} />
            <Route path="/pacientes/:id/clinica" element={<ProtectedPage element={<PatientDetail />} />} />
            <Route path="/pacientes/:id/laboratorio" element={<ProtectedPage element={<PatientDetail />} />} />
            <Route path="/pacientes/:id/actividad" element={<ProtectedPage element={<PatientDetail />} />} />
            <Route path="/pacientes/:id/dietas" element={<ProtectedPage element={<PatientDetail />} />} />
            <Route
              path="/pacientes/:id/seguimiento"
              element={<ProtectedPage element={<RedirectToPatientTab tab="clinica" />} />}
            />
            <Route
              path="/pacientes/:id/psiconutricion"
              element={<ProtectedPage element={<RedirectToPatientTab tab="habitos" />} />}
            />
            <Route path="/pacientes/:id" element={<ProtectedPage element={<PatientDetail />} />} />

            {/* Agenda */}
            <Route path="/agenda" element={<ProtectedPage element={<Appointments />} />} />
            <Route path="/agenda/nueva" element={<ProtectedPage element={<NewAppointment />} />} />

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

            {/* Redirecciones de URLs heredadas. La tabla vive en
                `lib/redirects.js` para que las pruebas comprueben la misma
                fuente que usa el router, no una copia. */}
            {Object.entries(LEGACY_REDIRECTS).map(([desde, hacia]) => (
              <Route key={desde} path={desde} element={<Navigate to={hacia} replace />} />
            ))}
            <Route path="/patients/:id" element={<Navigate to="/pacientes/:id" replace />} />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
