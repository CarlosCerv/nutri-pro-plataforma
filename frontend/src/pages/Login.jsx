import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (result?.success) {
      navigate('/dashboard');
    } else {
      setError(result?.message || 'No pudimos iniciar sesión. Revisa tus datos.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[var(--bg-primary)] px-5 py-16 sm:py-20 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-[400px]">
        <header className="mb-10 text-center">
          <div className="mb-8 flex justify-center">
            <Logo size="md" />
          </div>
          <h1 className="text-[1.65rem] font-semibold leading-tight tracking-[-0.02em] text-[var(--text-primary)]">
            Iniciar sesión
          </h1>
          <p className="mt-2 text-[15px] leading-snug text-[var(--text-secondary)]">
            NutriPro
          </p>
        </header>

        <div
          className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] px-7 py-8 sm:px-8 sm:py-9"
          style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.06)' }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-group">
              <label htmlFor="login-email" className="label">
                Correo
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full rounded-xl py-3"
                placeholder="nombre@clinica.com"
                required
                autoComplete="email"
                autoCapitalize="off"
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
                  className="input w-full rounded-xl py-3 pr-12"
                  placeholder="Contraseña"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-primary)]"
                  aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPass ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-[rgba(255,59,48,0.22)] bg-[rgba(255,59,48,0.06)] px-4 py-3">
                <p className="text-sm font-medium text-[var(--danger)]">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="btn btn-primary btn-lg mt-2 w-full gap-2 rounded-xl py-3.5 font-semibold disabled:cursor-not-allowed disabled:opacity-45"
            >
              {loading ? (
                <>
                  <span className="h-5 w-5 rounded-full border-2 border-white/35 border-t-white animate-spin" />
                  <span>Entrando…</span>
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
            ¿Sin cuenta?{' '}
            <Link
              to="/register"
              className="font-semibold text-[var(--accent)] underline-offset-4 hover:underline"
            >
              Crear cuenta
            </Link>
          </p>
        </div>

        <p className="mt-10 text-center text-xs text-[var(--text-tertiary)]">
          © NutriPro
        </p>
      </div>
    </div>
  );
}
