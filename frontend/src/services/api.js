import axios from 'axios';

/** URL base del API (VITE_API_URL o, en prod en el navegador, mismo host que el frontend → /api en Vercel). */
function resolveRawApiBase() {
    const explicit = import.meta.env.VITE_API_URL;
    if (explicit && String(explicit).trim()) return String(explicit).trim();
    if (import.meta.env.PROD && typeof window !== 'undefined' && window.location?.origin) {
        return `${window.location.origin}/api`;
    }
    return 'http://localhost:5000/api';
}

/** Origen del backend sin duplicar /api (VITE puede ser ...5000 o ...5000/api). */
const RAW_BASE = resolveRawApiBase();
const API_ORIGIN = String(RAW_BASE).trim().replace(/\/api\/?$/i, '').replace(/\/+$/, '') || 'http://localhost:5000';
export const API_URL = `${API_ORIGIN}/api/`;

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: token + normalizar rutas (/api/foo o /foo → foo) para que combine con base .../api/
api.interceptors.request.use(
    (config) => {
        if (typeof config.url === 'string' && config.url.length > 0) {
            let u = config.url.replace(/^\/+/, '');
            if (u.startsWith('api/')) u = u.slice(4);
            config.url = u;
        }
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Rutas de entrada de auth: un 401 aquí es "credenciales inválidas", el
// resultado normal y esperado de un login/registro fallido — no "la sesión
// expiró". El interceptor de abajo no debe tratarlas igual que un 401 de
// cualquier otra ruta protegida.
const AUTH_ENTRY_POINTS = new Set(['auth/login', 'auth/register']);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthEntryPoint = AUTH_ENTRY_POINTS.has(error.config?.url);
        if (error.response?.status === 401 && !isAuthEntryPoint) {
            // Un 401 en cualquier otra ruta sí significa sesión inválida/expirada:
            // se limpia el storage y se fuerza recarga a /login. Antes esto
            // también corría para el propio POST /auth/login: la recarga completa
            // (window.location.href, no un navigate de React Router) interrumpía
            // la promesa antes de que AuthContext.login() pudiera mostrar el
            // "Invalid credentials" — el usuario solo veía la pantalla de login
            // parpadear sin ningún mensaje, como si el login estuviera roto.
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
};

// Patients API
export const patientsAPI = {
    getAll: () => api.get('/patients'),
    getOne: (id) => api.get(`/patients/${id}`),
    create: (data) => api.post('/patients', data),
    update: (id, data) => api.put(`/patients/${id}`, data),
    delete: (id) => api.delete(`/patients/${id}`),
    uploadDocument: (id, formData) => api.post(`/patients/${id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    exportAll: () => api.get('/patients/export'),
    generatePreConsultationLink: (id) => api.post(`/patients/${id}/pre-consultation-link`),
    generatePortalLink: (id) => api.post(`/patients/${id}/portal-link`),
};

// Appointments API
export const appointmentsAPI = {
    getAll: (params) => api.get('/appointments', { params }),
    getOne: (id) => api.get(`/appointments/${id}`),
    create: (data) => api.post('/appointments', data),
    update: (id, data) => api.put(`/appointments/${id}`, data),
    delete: (id) => api.delete(`/appointments/${id}`),
};

// Meal Plans API
export const mealPlansAPI = {
    getAll: (params) => api.get('/mealplans', { params }),
    getOne: (id) => api.get(`/mealplans/${id}`),
    create: (data) => api.post('/mealplans', data),
    update: (id, data) => api.put(`/mealplans/${id}`, data),
    delete: (id) => api.delete(`/mealplans/${id}`),
};

// Diet Templates API
export const dietTemplatesAPI = {
    getAll: (params) => api.get('/diet-templates', { params }),
    getOne: (id) => api.get(`/diet-templates/${id}`),
    create: (data) => api.post('/diet-templates', data),
    update: (id, data) => api.put(`/diet-templates/${id}`, data),
    delete: (id) => api.delete(`/diet-templates/${id}`),
    applyToPatient: (id, data) => api.post(`/diet-templates/${id}/apply`, data),
    getCategories: () => api.get('/diet-templates/categories'),
};

// Foods API
export const foodsAPI = {
    getAll: (params) => api.get('/foods', { params }),
    getOne: (id) => api.get(`/foods/${id}`),
    create: (data) => api.post('/foods', data),
    update: (id, data) => api.put(`/foods/${id}`, data),
    delete: (id) => api.delete(`/foods/${id}`),
    getCategories: () => api.get('/foods/categories'),
};

// Payments API
export const paymentsAPI = {
    getAll: (params) => api.get('/payments', { params }),
    getSummary: (params) => api.get('/payments/summary', { params }),
    create: (data) => api.post('/payments', data),
    update: (id, data) => api.put(`/payments/${id}`, data),
    delete: (id) => api.delete(`/payments/${id}`),
};

// Dashboard API
export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
    getPopulation: () => api.get('/dashboard/population'),
    getTurno: () => api.get('/dashboard/turno'),
    getRetention: () => api.get('/dashboard/retention'),
};

// Food Exchange API (sustitutos sugeridos por equivalencia nutricional)
export const foodExchangeAPI = {
    getEquivalents: (foodId, patientFilters) => api.post('/food-exchange/equivalents', { foodId, patientFilters }),
};

// Admin API (panel de administrador — solo accesible con role:'admin')
export const adminAPI = {
    getDashboard: () => api.get('/admin/dashboard'),
    getNutritionists: (params) => api.get('/admin/nutritionists', { params }),
    getNutritionist: (id) => api.get(`/admin/nutritionists/${id}`),
    setNutritionistStatus: (id, isActive) => api.patch(`/admin/nutritionists/${id}/status`, { isActive }),
    getCampaigns: () => api.get('/admin/campaigns'),
    getCampaign: (id) => api.get(`/admin/campaigns/${id}`),
    createCampaign: (data) => api.post('/admin/campaigns', data),
};

export default api;
