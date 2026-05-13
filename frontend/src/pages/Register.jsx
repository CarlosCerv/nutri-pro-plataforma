import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, User, Mail, Lock, Phone, Stethoscope } from 'lucide-react';
import Logo from '../components/Logo';

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
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] tracking-apple-tight mb-2">
            Crear cuenta
          </h1>
          <p className="text-[var(--text-secondary)] text-base">Únete a la plataforma para nutricionistas</p>
        </div>

        <div className="card p-8 sm:p-9">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-group">
              <label htmlFor="reg-name" className="label">
                Nombre completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User size={18} className="text-[var(--text-tertiary)]" strokeWidth={1.75} />
                </div>
                <input
                  id="reg-name"
                  type="text"
                  name="name"
                  className="input pl-11"
                  placeholder="María Pérez"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-email" className="label">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail size={18} className="text-[var(--text-tertiary)]" strokeWidth={1.75} />
                </div>
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  className="input pl-11"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-password" className="label">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock size={18} className="text-[var(--text-tertiary)]" strokeWidth={1.75} />
                </div>
                <input
                  id="reg-password"
                  type="password"
                  name="password"
                  className="input pl-11"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-specialty" className="label">
                Especialidad <span className="text-[var(--text-tertiary)] font-normal">(opcional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Stethoscope size={18} className="text-[var(--text-tertiary)]" strokeWidth={1.75} />
                </div>
                <input
                  id="reg-specialty"
                  type="text"
                  name="specialty"
                  className="input pl-11"
                  placeholder="Nutrición deportiva"
                  value={formData.specialty}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-phone" className="label">
                Teléfono <span className="text-[var(--text-tertiary)] font-normal">(opcional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Phone size={18} className="text-[var(--text-tertiary)]" strokeWidth={1.75} />
                </div>
                <input
                  id="reg-phone"
                  type="tel"
                  name="phone"
                  className="input pl-11"
                  placeholder="+52 123 456 7890"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-[rgba(255,59,48,0.25)] bg-[rgba(255,59,48,0.06)] p-4">
                <p className="text-sm text-[var(--danger)] font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creando cuenta…</span>
                </>
              ) : (
                <>
                  <span>Crear cuenta</span>
                  <ArrowRight size={18} strokeWidth={1.75} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-[var(--text-secondary)] text-sm">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-semibold text-[var(--accent)] hover:opacity-90 transition-opacity">
              Inicia sesión aquí
            </Link>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-[var(--text-tertiary)]">NutriPro · plataforma clínica</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
