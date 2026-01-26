import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Get auth token from localStorage
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Body Composition API
export const bodyCompositionAPI = {
    create: (data) => axios.post(`${API_URL}/body-composition`, data, {
        headers: getAuthHeader()
    }),

    getByPatient: (patientId) => axios.get(`${API_URL}/body-composition/patient/${patientId}`, {
        headers: getAuthHeader()
    }),

    getOne: (id) => axios.get(`${API_URL}/body-composition/${id}`, {
        headers: getAuthHeader()
    }),

    update: (id, data) => axios.put(`${API_URL}/body-composition/${id}`, data, {
        headers: getAuthHeader()
    }),

    delete: (id) => axios.delete(`${API_URL}/body-composition/${id}`, {
        headers: getAuthHeader()
    })
};

// Foods API
export const foodsAPI = {
    getAll: (params) => axios.get(`${API_URL}/foods`, {
        params,
        headers: getAuthHeader()
    }),

    getCategories: () => axios.get(`${API_URL}/foods/categories`, {
        headers: getAuthHeader()
    }),

    getOne: (id) => axios.get(`${API_URL}/foods/${id}`, {
        headers: getAuthHeader()
    }),

    create: (data) => axios.post(`${API_URL}/foods`, data, {
        headers: getAuthHeader()
    }),

    update: (id, data) => axios.put(`${API_URL}/foods/${id}`, data, {
        headers: getAuthHeader()
    }),

    delete: (id) => axios.delete(`${API_URL}/foods/${id}`, {
        headers: getAuthHeader()
    })
};

// Calculations API
export const calculationsAPI = {
    calculateBMR: (data) => axios.post(`${API_URL}/calculations/bmr`, data, {
        headers: getAuthHeader()
    }),

    calculateTDEE: (data) => axios.post(`${API_URL}/calculations/tdee`, data, {
        headers: getAuthHeader()
    }),

    calculateMacros: (data) => axios.post(`${API_URL}/calculations/macros`, data, {
        headers: getAuthHeader()
    }),

    calculateNutritionPlan: (data) => axios.post(`${API_URL}/calculations/nutrition-plan`, data, {
        headers: getAuthHeader()
    }),

    calculateBodyComposition: (data) => axios.post(`${API_URL}/calculations/body-composition`, data, {
        headers: getAuthHeader()
    })
};
