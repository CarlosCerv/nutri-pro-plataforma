import api from './api';

/**
 * Notas clínicas de un paciente.
 *
 * Usa la instancia compartida de `services/api.js` a propósito: antes creaba su
 * propio cliente de axios que leía el token solo de `localStorage`, así que un
 * usuario que iniciaba sesión sin marcar "recordarme" (token en
 * `sessionStorage`) recibía 401 en todas estas llamadas estando autenticado.
 * La instancia compartida además centraliza el manejo del 401.
 */
const clinicalNotesService = {
    getPatientNotes: async (patientId) => {
        const response = await api.get(`/clinical-notes/patient/${patientId}`);
        return response.data;
    },

    createNote: async (patientId, noteData) => {
        const response = await api.post(`/clinical-notes/patient/${patientId}`, noteData);
        return response.data;
    },

    updateNote: async (noteId, noteData) => {
        const response = await api.put(`/clinical-notes/${noteId}`, noteData);
        return response.data;
    },

    deleteNote: async (noteId) => {
        const response = await api.delete(`/clinical-notes/${noteId}`);
        return response.data;
    },
};

export default clinicalNotesService;
