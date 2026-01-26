import { useState, useEffect } from 'react';
import { paymentsAPI, patientsAPI, appointmentsAPI } from '../services/api';
import { Plus, DollarSign, Calendar, Search, Filter, Trash2, Edit2, CheckCircle, Clock } from 'lucide-react';
import './Finance.css';

const Finance = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalIncome: 0, pendingIncome: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);

    // Modal Form State
    const [formData, setFormData] = useState({
        patient: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        method: 'cash',
        status: 'paid',
        notes: ''
    });

    // Data for dropdowns
    const [patients, setPatients] = useState([]);

    useEffect(() => {
        fetchPayments();
        fetchPatients();
    }, []);

    const fetchPayments = async () => {
        try {
            const response = await paymentsAPI.getAll();
            setPayments(response.data.data);
            setStats(response.data.stats);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching payments:', error);
            setLoading(false);
        }
    };

    const fetchPatients = async () => {
        try {
            const response = await patientsAPI.getAll();
            setPatients(response.data.data);
        } catch (error) {
            console.error('Error fetching patients:', error);
        }
    };

    const handleCreatePayment = async (e) => {
        e.preventDefault();
        try {
            await paymentsAPI.create(formData);
            setShowModal(false);
            fetchPayments();
            // Reset form
            setFormData({
                patient: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                method: 'cash',
                status: 'paid',
                notes: ''
            });
        } catch (error) {
            console.error('Error creating payment:', error);
            alert('Error al registrar el pago');
        }
    };

    const handleDeletePayment = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este registro?')) {
            try {
                await paymentsAPI.delete(id);
                fetchPayments();
            } catch (error) {
                console.error('Error deleting payment:', error);
            }
        }
    };

    const filteredPayments = payments.filter(p =>
        p.patient?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.patient?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="page-loading"><div className="spinner-large"></div></div>;

    return (
        <div className="finance-page fade-in">
            <div className="page-header">
                <div>
                    <h1>Finanzas</h1>
                    <p>Gestiona los ingresos y pagos de tus consultas</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={20} />
                    Registrar Pago
                </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card card">
                    <div className="stat-icon income-icon">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <span className="stat-label">Ingresos Totales</span>
                        <h3 className="stat-value">${stats.totalIncome.toLocaleString()}</h3>
                    </div>
                </div>
                <div className="stat-card card">
                    <div className="stat-icon pending-icon">
                        <Clock size={24} />
                    </div>
                    <div>
                        <span className="stat-label">Pendiente de Cobro</span>
                        <h3 className="stat-value">${stats.pendingIncome.toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="search-bar">
                <Search size={20} />
                <input
                    type="text"
                    placeholder="Buscar por paciente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            {/* Payments List */}
            <div className="payments-container card">
                {filteredPayments.length === 0 ? (
                    <div className="empty-state-large">
                        <DollarSign size={64} strokeWidth={1} />
                        <h3>No hay registros</h3>
                        <p>Comienza registrando los pagos de tus citas</p>
                    </div>
                ) : (
                    <div className="payments-list">
                        <div className="payments-header">
                            <span>Paciente</span>
                            <span>Fecha</span>
                            <span>Método</span>
                            <span>Estado</span>
                            <span>Monto</span>
                            <span></span>
                        </div>
                        {filteredPayments.map(payment => (
                            <div key={payment._id} className="payment-row">
                                <div className="payment-cell-patient">
                                    <span className="patient-name">
                                        {payment.patient?.firstName} {payment.patient?.lastName}
                                    </span>
                                    {payment.appointment && (
                                        <span className="appointment-ref">Cita del {new Date(payment.appointment.date).toLocaleDateString()}</span>
                                    )}
                                </div>
                                <div className="payment-cell-date">
                                    {new Date(payment.date).toLocaleDateString()}
                                </div>
                                <div className="payment-cell-method">
                                    <span className="badge badge-info">{payment.method}</span>
                                </div>
                                <div className="payment-cell-status">
                                    <span className={`badge badge-${payment.status === 'paid' ? 'success' : 'warning'}`}>
                                        {payment.status === 'paid' ? 'Pagado' : 'Pendiente'}
                                    </span>
                                </div>
                                <div className="payment-cell-amount">
                                    ${payment.amount.toLocaleString()}
                                </div>
                                <div className="payment-cell-actions">
                                    <button
                                        className="btn-icon-small btn-danger"
                                        onClick={() => handleDeletePayment(payment._id)}
                                        title="Eliminar registro"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Payment Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Registrar Nuevo Pago</h3>
                            <button className="btn-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleCreatePayment}>
                            <div className="form-group">
                                <label className="label">Paciente <span className="required">*</span></label>
                                <select
                                    className="input"
                                    value={formData.patient}
                                    onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
                                    required
                                >
                                    <option value="">Seleccionar paciente</option>
                                    {patients.map(p => (
                                        <option key={p._id} value={p._id}>
                                            {p.firstName} {p.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="label">Monto <span className="required">*</span></label>
                                    <div className="input-with-icon">
                                        <span className="input-icon">$</span>
                                        <input
                                            type="number"
                                            className="input"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            required
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="label">Fecha</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="label">Método</label>
                                    <select
                                        className="input"
                                        value={formData.method}
                                        onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                                    >
                                        <option value="cash">Efectivo</option>
                                        <option value="card">Tarjeta</option>
                                        <option value="transfer">Transferencia</option>
                                        <option value="other">Otro</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="label">Estado</label>
                                    <select
                                        className="input"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="paid">Pagado</option>
                                        <option value="pending">Pendiente</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="label">Notas</label>
                                <textarea
                                    className="input"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows="3"
                                ></textarea>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Guardar Registro
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Finance;
