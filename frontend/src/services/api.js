import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
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

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
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

// Food Exchange API
export const foodExchangeAPI = {
    getEquivalents: (data) => api.post('/food-exchange/equivalents', data),
    getByCategory: (category, params) => api.get(`/food-exchange/by-category/${category}`, { params }),
    batchExchange: (data) => api.post('/food-exchange/batch', data),
};

// Payments API
export const paymentsAPI = {
    getAll: (params) => api.get('/payments', { params }),
    create: (data) => api.post('/payments', data),
    update: (id, data) => api.put(`/payments/${id}`, data),
    delete: (id) => api.delete(`/payments/${id}`),
};

// Dashboard API
export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
};

export default api;
