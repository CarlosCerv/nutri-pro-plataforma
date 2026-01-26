import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import NewPatient from './pages/NewPatient';
import PatientDetail from './pages/PatientDetail';
import Appointments from './pages/Appointments';
import NewAppointment from './pages/NewAppointment';
import MealPlans from './pages/MealPlans';
import DietTemplates from './pages/DietTemplates';
import MenuBuilder from './pages/MenuBuilder';
import NutritionCalculator from './pages/NutritionCalculator';
import Profile from './pages/Profile';
import Finance from './pages/Finance';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner-large"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Layout Component
const Layout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <div className="main-content">
        <Navbar onMenuToggle={setMobileMenuOpen} />
        <main className="content-area">{children}</main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients"
            element={
              <ProtectedRoute>
                <Layout>
                  <Patients />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/new"
            element={
              <ProtectedRoute>
                <Layout>
                  <NewPatient />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <PatientDetail />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/:id/edit"
            element={
              <ProtectedRoute>
                <Layout>
                  <NewPatient />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <ProtectedRoute>
                <Layout>
                  <Appointments />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments/new"
            element={
              <ProtectedRoute>
                <Layout>
                  <NewAppointment />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mealplans"
            element={
              <ProtectedRoute>
                <Layout>
                  <MealPlans />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/calculator"
            element={
              <ProtectedRoute>
                <Layout>
                  <NutritionCalculator />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/diet-templates"
            element={
              <ProtectedRoute>
                <Layout>
                  <DietTemplates />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu-builder"
            element={
              <ProtectedRoute>
                <Layout>
                  <MenuBuilder />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance"
            element={
              <ProtectedRoute>
                <Layout>
                  <Finance />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
