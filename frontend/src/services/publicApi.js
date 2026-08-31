import axios from 'axios';
import { API_URL } from './api';

/**
 * Cliente para `/api/public/*`, deliberadamente separado de `services/api.js`.
 *
 * El interceptor de `api` redirige a `/login` en cualquier 401 — correcto
 * para la aplicación del nutriólogo, pero estas pantallas las abre un
 * paciente o un visitante sin cuenta: un token vencido aquí es un mensaje en
 * la propia página ("este enlace expiró"), nunca un salto a un login que no
 * les corresponde. Tampoco manda el `Authorization` de sesión, porque estas
 * rutas no la usan.
 */
const publicApi = axios.create({ baseURL: API_URL });

// Pre-consulta (Cuestionario autogestionado)
export const preConsultationAPI = {
    get: (token) => publicApi.get(`/public/pre-consultation/${token}`),
    submit: (token, data) => publicApi.post(`/public/pre-consultation/${token}`, data),
};

// Portal ligero del paciente
export const portalAPI = {
    get: (token) => publicApi.get(`/public/portal/${token}`),
    getSubstitutes: (token, foodId) => publicApi.get(`/public/portal/${token}/sustitutos/${foodId}`),
};

// Página pública de agendamiento
export const bookingAPI = {
    getProfile: (username) => publicApi.get(`/public/booking/${username}`),
    getAvailability: (username, date, serviceIndex) =>
        publicApi.get(`/public/booking/${username}/availability`, { params: { date, serviceIndex } }),
    create: (username, data) => publicApi.post(`/public/booking/${username}`, data),
};

export default publicApi;
