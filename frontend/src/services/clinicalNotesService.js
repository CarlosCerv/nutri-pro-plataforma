import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

const clinicalNotesService = {
    // Get all notes for a patient
    getPatientNotes: async (patientId) => {
        const response = await axios.get(`${API_URL}/clinical-notes/patient/${patientId}`, getHeaders());
        return response.data;
    },

    // Create a new note
    createNote: async (patientId, noteData) => {
        const response = await axios.post(`${API_URL}/clinical-notes/patient/${patientId}`, noteData, getHeaders());
        return response.data;
    },

    // Update a note
    updateNote: async (noteId, noteData) => {
        const response = await axios.put(`${API_URL}/clinical-notes/${noteId}`, noteData, getHeaders());
        return response.data;
    },

    // Delete a note
    deleteNote: async (noteId) => {
        const response = await axios.delete(`${API_URL}/clinical-notes/${noteId}`, getHeaders());
        return response.data;
    }
};

export default clinicalNotesService;
