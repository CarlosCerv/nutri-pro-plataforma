import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight } from 'lucide-react';
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
    <div className="min-h-[100dvh] w-full bg-[var(--bg-primary)] px-5 py-12 sm:py-16 flex flex-col items-center font-sans">
      <div className="w-full max-w-[440px] pb-8">
        <header className="mb-8 text-center sm:mb-10">
          <div className="mb-7 flex justify-center sm:mb-8">
            <Logo size="md" />
          </div>
          <h1 className="text-[1.65rem] font-semibold leading-tight tracking-[-0.02em] text-[var(--text-primary)]">
            Crear cuenta
          </h1>
          <p className="mt-2 text-[15px] leading-snug text-[var(--text-secondary)]">
            Unos datos y empiezas
          </p>
        </header>

        <div
          className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] px-7 py-8 sm:px-8 sm:py-9"
          style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.06)' }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label htmlFor="reg-name" className="label">
                Nombre completo
              </label>
              <input
                id="reg-name"
                type="text"
                name="name"
                className="input w-full rounded-xl py-3"
                placeholder="Tu nombre"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-email" className="label">
                Correo
              </label>
              <input
                id="reg-email"
                type="email"
                name="email"
                className="input w-full rounded-xl py-3"
                placeholder="nombre@clinica.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-password" className="label">
                Contraseña
              </label>
              <input
                id="reg-password"
                type="password"
                name="password"
                className="input w-full rounded-xl py-3"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                disabled={loading}
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-specialty" className="label">
                Especialidad <span className="font-normal text-[var(--text-tertiary)]">opcional</span>
              </label>
              <input
                id="reg-specialty"
                type="text"
                name="specialty"
                className="input w-full rounded-xl py-3"
                placeholder="Ej. nutrición clínica"
                value={formData.specialty}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-phone" className="label">
                Teléfono <span className="font-normal text-[var(--text-tertiary)]">opcional</span>
              </label>
              <input
                id="reg-phone"
                type="tel"
                name="phone"
                className="input w-full rounded-xl py-3"
                placeholder="+52 …"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
                autoComplete="tel"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-[rgba(255,59,48,0.22)] bg-[rgba(255,59,48,0.06)] px-4 py-3">
                <p className="text-sm font-medium text-[var(--danger)]">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg mt-1 w-full gap-2 rounded-xl py-3.5 font-semibold disabled:cursor-not-allowed disabled:opacity-45"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="h-5 w-5 rounded-full border-2 border-white/35 border-t-white animate-spin" />
                  <span>Creando cuenta…</span>
                </>
              ) : (
                <>
                  <span>Continuar</span>
                  <ArrowRight size={18} strokeWidth={1.75} />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-[15px] text-[var(--text-secondary)]">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-semibold text-[var(--accent)] underline-offset-4 hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </div>

        <p className="mt-8 text-center text-xs text-[var(--text-tertiary)] sm:mt-10">
          © NutriPro
        </p>
      </div>
    </div>
  );
};

export default Register;
