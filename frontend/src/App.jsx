import { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

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
const NutritionCalculator = lazy(() => import('./pages/NutritionCalculator'));
const Profile = lazy(() => import('./pages/Profile'));
const Finance = lazy(() => import('./pages/Finance'));
const FoodsDatabase = lazy(() => import('./pages/FoodsDatabase'));
const ReportsHub = lazy(() => import('./pages/ReportsHub'));
const PopulationReports = lazy(() => import('./pages/PopulationReports'));
const AdminLicenses = lazy(() => import('./pages/AdminLicenses'));

import './index.css';

function RedirectToPatientTab({ tab }) {
  const { id } = useParams();
  return <Navigate to={`/pacientes/${id}/${tab}`} replace />;
}

const THEME_KEY = 'nutripro-theme-v3';
const THEME_META_SELECTOR = 'meta[name="theme-color"]';

const applyTheme = () => {
  const root = document.documentElement;
  root.classList.remove('dark', 'light');
  root.classList.add('light');
  root.style.colorScheme = 'light';
  localStorage.setItem(THEME_KEY, 'light');
  document.querySelector(THEME_META_SELECTOR)?.setAttribute('content', '#FBFBFD');
};

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

  useEffect(() => {
    applyTheme();
  }, []);

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

            {/* Dietas (legacy aliases mantenidos) */}
            <Route path="/dietas" element={<ProtectedPage element={<MealPlans />} />} />
            <Route path="/dietas/nueva" element={<ProtectedPage element={<MenuBuilder />} />} />
            <Route path="/dietas/catalogo" element={<ProtectedPage element={<DietTemplates />} />} />
            <Route path="/dietas/:id/editar" element={<ProtectedPage element={<MenuBuilder />} />} />

            {/* Legacy routes for backward compat */}
            <Route path="/mealplans" element={<Navigate to="/dietas" replace />} />
            <Route path="/menu-builder" element={<Navigate to="/dietas/nueva" replace />} />
            <Route path="/diet-templates" element={<Navigate to="/dietas/catalogo" replace />} />
            <Route path="/appointments" element={<Navigate to="/agenda" replace />} />
            <Route path="/appointments/new" element={<Navigate to="/agenda/nueva" replace />} />
            <Route path="/patients" element={<Navigate to="/pacientes" replace />} />
            <Route path="/patients/new" element={<Navigate to="/pacientes/nuevo" replace />} />
            <Route path="/patients/:id" element={<Navigate to="/pacientes/:id" replace />} />

            {/* Alimentos */}
            <Route path="/alimentos" element={<ProtectedPage element={<FoodsDatabase />} />} />
            <Route path="/alimentos/nuevo" element={<ProtectedPage element={<FoodsDatabase />} />} />

            {/* Calculadoras */}
            <Route path="/calculos" element={<ProtectedPage element={<NutritionCalculator />} />} />
            <Route path="/calculos/imc" element={<ProtectedPage element={<NutritionCalculator />} />} />
            <Route path="/calculos/calorias" element={<ProtectedPage element={<NutritionCalculator />} />} />
            <Route path="/calculos/deportistas" element={<ProtectedPage element={<NutritionCalculator />} />} />
            <Route path="/calculator" element={<Navigate to="/calculos" replace />} />

            {/* Reportes PDF */}
            <Route path="/reportes" element={<ProtectedPage element={<ReportsHub />} />} />
            <Route path="/reportes/nuevo" element={<ProtectedPage element={<ReportsHub />} />} />
            <Route path="/reportes/historial" element={<ProtectedPage element={<ReportsHub />} />} />

            {/* Perfil y configuración */}
            <Route path="/perfil" element={<ProtectedPage element={<Profile />} />} />
            <Route path="/profile" element={<Navigate to="/perfil" replace />} />
            <Route path="/configuracion" element={<Navigate to="/perfil" replace />} />

            {/* Finanzas */}
            <Route path="/finanzas" element={<ProtectedPage element={<Finance />} />} />
            <Route path="/finance" element={<Navigate to="/finanzas" replace />} />

            {/* Analytics y Admin */}
            <Route path="/reportes-poblacionales" element={<ProtectedPage element={<PopulationReports />} />} />
            <Route path="/admin" element={<Navigate to="/admin/licencias" replace />} />
            <Route path="/admin/licencias" element={<ProtectedPage element={<AdminLicenses />} />} />
            <Route path="/admin/usuarios" element={<ProtectedPage element={<AdminLicenses />} />} />
            <Route path="/admin/ingresos" element={<ProtectedPage element={<AdminLicenses />} />} />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
