import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Heart, Loader } from 'lucide-react';
import Logo from '../components/Logo';
import './Login.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        specialty: '',
        phone: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await register(formData);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    return (
        <div className="login-container">
            <div className="login-background">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
            </div>

            <div className="login-card card-glass fade-in">
                <div className="login-header">
                    <Logo size={42} color="black" />
                    <h1>Crear Cuenta</h1>
                    <p>Únete a la plataforma líder en nutrición</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="label" htmlFor="name">
                            Nombre Completo
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className="input"
                            placeholder="Juan Pérez"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label className="label" htmlFor="email">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="input"
                            placeholder="tu@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label className="label" htmlFor="password">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="input"
                            placeholder="Mínimo 6 caracteres"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label className="label" htmlFor="specialty">
                            Especialidad (Opcional)
                        </label>
                        <input
                            type="text"
                            id="specialty"
                            name="specialty"
                            className="input"
                            placeholder="Nutrición Deportiva"
                            value={formData.specialty}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label className="label" htmlFor="phone">
                            Teléfono (Opcional)
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            className="input"
                            placeholder="+52 123 456 7890"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader className="spinner" size={20} />
                                Creando cuenta...
                            </>
                        ) : (
                            'Crear Cuenta'
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p>
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login" className="link">
                            Inicia sesión aquí
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
