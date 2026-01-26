import { useState, useEffect } from 'react';
import clinicalNotesService from '../services/clinicalNotesService';
import { Plus, Save, X, ChevronDown, ChevronUp, FileText } from 'lucide-react';

const ClinicalNotesTab = ({ patientId }) => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [expandedNoteId, setExpandedNoteId] = useState(null);
    const [newNote, setNewNote] = useState({
        subjective: '',
        objective: '',
        analysis: '',
        plan: ''
    });

    useEffect(() => {
        fetchNotes();
    }, [patientId]);

    const fetchNotes = async () => {
        try {
            setLoading(true);
            const response = await clinicalNotesService.getPatientNotes(patientId);
            setNotes(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching notes:', error);
            setLoading(false);
        }
    };

    const handleCreateNote = async (e) => {
        e.preventDefault();
        try {
            await clinicalNotesService.createNote(patientId, newNote);
            setNewNote({ subjective: '', objective: '', analysis: '', plan: '' });
            setIsAdding(false);
            fetchNotes(); // Refresh list
        } catch (error) {
            console.error('Error creating note:', error);
            alert('Error al guardar la nota');
        }
    };

    const toggleNote = (id) => {
        setExpandedNoteId(expandedNoteId === id ? null : id);
    };

    return (
        <div className="clinical-notes-tab">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3>Historial Clínico (SOAP)</h3>
                {!isAdding && (
                    <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
                        <Plus size={18} /> Nueva Nota
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="card note-form-card" style={{ marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
                    <form onSubmit={handleCreateNote}>
                        <div className="form-group">
                            <label><strong>S</strong> - Subjetivo (Síntomas, reporte del paciente)</label>
                            <textarea
                                className="form-control"
                                value={newNote.subjective}
                                onChange={(e) => setNewNote({ ...newNote, subjective: e.target.value })}
                                rows="3"
                                placeholder="El paciente reporta..."
                            />
                        </div>
                        <div className="form-group">
                            <label><strong>O</strong> - Objetivo (Datos medibles, antropometría)</label>
                            <textarea
                                className="form-control"
                                value={newNote.objective}
                                onChange={(e) => setNewNote({ ...newNote, objective: e.target.value })}
                                rows="3"
                                placeholder="Peso: 70kg, IMC: 24..."
                            />
                        </div>
                        <div className="form-group">
                            <label><strong>A</strong> - Análisis (Diagnóstico, evolución)</label>
                            <textarea
                                className="form-control"
                                value={newNote.analysis}
                                onChange={(e) => setNewNote({ ...newNote, analysis: e.target.value })}
                                rows="3"
                                required
                                placeholder="Mejora en hábitos..."
                            />
                        </div>
                        <div className="form-group">
                            <label><strong>P</strong> - Plan (Tratamiento, metas)</label>
                            <textarea
                                className="form-control"
                                value={newNote.plan}
                                onChange={(e) => setNewNote({ ...newNote, plan: e.target.value })}
                                rows="3"
                                required
                                placeholder="Dieta hipocalórica, ejercicio..."
                            />
                        </div>
                        <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="submit" className="btn btn-success">
                                <Save size={18} /> Guardar Nota
                            </button>
                            <button type="button" className="btn btn-outline" onClick={() => setIsAdding(false)}>
                                <X size={18} /> Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="notes-list">
                {loading ? (
                    <p>Cargando notas...</p>
                ) : notes.length === 0 ? (
                    <div className="empty-state" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        <FileText size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                        <p>No hay notas clínicas registradas.</p>
                    </div>
                ) : (
                    notes.map(note => (
                        <div key={note._id} className="card note-card" style={{ marginBottom: '1rem', cursor: 'pointer' }} onClick={() => toggleNote(note._id)}>
                            <div className="note-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ margin: 0, color: '#0f172a' }}>
                                        Consulta del {new Date(note.date).toLocaleDateString()}
                                    </h4>
                                    <small style={{ color: '#64748b' }}>
                                        Por: {note.nutritionist?.name || 'Nutricionista'}
                                    </small>
                                </div>
                                {expandedNoteId === note._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>

                            {expandedNoteId === note._id && (
                                <div className="note-content" style={{ marginTop: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                                    <div className="soap-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        <div className="soap-section">
                                            <h5 style={{ color: '#059669', marginBottom: '0.5rem' }}>Subjetivo</h5>
                                            <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>{note.subjective || '-'}</p>
                                        </div>
                                        <div className="soap-section">
                                            <h5 style={{ color: '#059669', marginBottom: '0.5rem' }}>Objetivo</h5>
                                            <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>{note.objective || '-'}</p>
                                        </div>
                                        <div className="soap-section">
                                            <h5 style={{ color: '#059669', marginBottom: '0.5rem' }}>Análisis</h5>
                                            <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>{note.analysis}</p>
                                        </div>
                                        <div className="soap-section">
                                            <h5 style={{ color: '#059669', marginBottom: '0.5rem' }}>Plan</h5>
                                            <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>{note.plan}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ClinicalNotesTab;
