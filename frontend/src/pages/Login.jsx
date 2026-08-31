import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from './auth/AuthLayout';
import Button from '../design-system/components/Button.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recordarme, setRecordarme] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // El tercer parámetro decide si la sesión va a localStorage o a
    // sessionStorage. Existía en AuthContext desde el principio y ninguna
    // pantalla lo exponía, así que siempre viajaba en `false`: todo el mundo
    // perdía la sesión al cerrar el navegador, sin manera de evitarlo.
    const result = await login(email, password, recordarme);
    if (result?.success) {
      navigate('/dashboard');
    } else {
      setError(result?.message || 'No pudimos iniciar sesión. Revisa tus datos.');
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Iniciar sesión"
      subtitle="Accede a tus expedientes, tu agenda y tus planes de alimentación."
      footer={
        <p className="text-center text-[15px] text-[var(--ink-muted)]">
          ¿Todavía no tienes cuenta?{' '}
          <Link to="/register" className="font-semibold text-[var(--accent)] underline-offset-4 hover:underline">
            Crear cuenta
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="form-group">
          <label htmlFor="login-email" className="label">
            Correo
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="nombre@clinica.com"
            required
            autoFocus
            autoComplete="email"
            autoCapitalize="off"
            spellCheck="false"
          />
        </div>

        <div className="form-group">
          <label htmlFor="login-password" className="label">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pr-12"
              placeholder="Tu contraseña"
              required
              autoComplete="current-password"
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
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 text-[15px] text-[var(--ink-muted)]">
          <input
            type="checkbox"
            checked={recordarme}
            onChange={(e) => setRecordarme(e.target.checked)}
            className="h-4 w-4 shrink-0 rounded-[4px] accent-[var(--accent)]"
          />
          Mantener la sesión abierta en este equipo
        </label>

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
          disabled={!email || !password}
          className="mt-2 gap-2"
        >
          {loading ? 'Entrando…' : 'Continuar'}
          {!loading ? <ArrowRight size={17} strokeWidth={2} aria-hidden="true" /> : null}
        </Button>
      </form>
    </AuthLayout>
  );
}
