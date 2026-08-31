import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from './auth/AuthLayout';
import Button from '../design-system/components/Button.jsx';

const MIN_PASSWORD = 6;

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialty: '',
    phone: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const passwordCorta = formData.password.length > 0 && formData.password.length < MIN_PASSWORD;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(formData);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'No pudimos crear la cuenta.');
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Crear cuenta"
      subtitle="Unos datos y empiezas a llevar tu consulta."
      footer={
        <p className="text-center text-[15px] text-[var(--ink-muted)]">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-semibold text-[var(--accent)] underline-offset-4 hover:underline">
            Iniciar sesión
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="form-group">
          <label htmlFor="reg-name" className="label">
            Nombre completo <span className="text-[var(--danger)]">*</span>
          </label>
          <input
            id="reg-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input"
            placeholder="Tu nombre"
            required
            autoFocus
            autoComplete="name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="reg-email" className="label">
            Correo <span className="text-[var(--danger)]">*</span>
          </label>
          <input
            id="reg-email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input"
            placeholder="nombre@clinica.com"
            required
            autoComplete="email"
            autoCapitalize="off"
            spellCheck="false"
          />
        </div>

        <div className="form-group">
          <label htmlFor="reg-password" className="label">
            Contraseña <span className="text-[var(--danger)]">*</span>
          </label>
          <div className="relative">
            <input
              id="reg-password"
              type={showPass ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`input pr-12${passwordCorta ? ' input-error' : ''}`}
              placeholder={`Mínimo ${MIN_PASSWORD} caracteres`}
              required
              minLength={MIN_PASSWORD}
              autoComplete="new-password"
              aria-invalid={passwordCorta || undefined}
              aria-describedby={passwordCorta ? 'reg-password-error' : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center rounded-[var(--radius-s)] px-3.5 text-[var(--ink-secondary)] transition-colors duration-micro hover:text-[var(--ink)]"
              aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={showPass}
            >
              {showPass ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
            </button>
          </div>
          {passwordCorta ? (
            <p id="reg-password-error" className="error-text" role="alert">
              La contraseña debe tener al menos {MIN_PASSWORD} caracteres.
            </p>
          ) : null}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="form-group">
            <label htmlFor="reg-specialty" className="label">
              Especialidad
            </label>
            <input
              id="reg-specialty"
              type="text"
              name="specialty"
              value={formData.specialty}
              onChange={handleChange}
              className="input"
              placeholder="Ej. nutrición clínica"
              autoComplete="organization-title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-phone" className="label">
              Teléfono
            </label>
            <input
              id="reg-phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input"
              placeholder="+52 …"
              autoComplete="tel"
            />
          </div>
        </div>

        {error ? (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-[var(--radius-m)] border border-[rgba(196,30,22,0.28)] bg-[rgba(196,30,22,0.06)] px-4 py-3"
          >
            <AlertCircle size={17} strokeWidth={1.75} className="mt-0.5 shrink-0 text-[var(--danger)]" />
            <p className="text-sm text-[var(--danger)]">{error}</p>
          </div>
        ) : null}

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={loading}
          disabled={!formData.name || !formData.email || formData.password.length < MIN_PASSWORD}
          className="mt-2 gap-2"
        >
          {loading ? 'Creando cuenta…' : 'Crear cuenta'}
          {!loading ? <ArrowRight size={17} strokeWidth={2} aria-hidden="true" /> : null}
        </Button>
      </form>
    </AuthLayout>
  );
}
