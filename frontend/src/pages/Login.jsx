import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Salad, ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciales incorrectas. Verifica tu email y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex overflow-hidden">
      {/* Left: decorative panel (oculto en mobile) */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] xl:w-1/2 relative overflow-hidden
                      bg-gradient-to-br from-navy-900 to-navy-950 p-12">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald/5 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-gold/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald/3 blur-[100px]" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{backgroundImage: 'linear-gradient(rgba(46,204,142,1) 1px, transparent 1px), linear-gradient(90deg, rgba(46,204,142,1) 1px, transparent 1px)',
              backgroundSize: '60px 60px'}} />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-emerald flex items-center justify-center shadow-emerald-md">
            <Salad size={20} className="text-navy-950" />
          </div>
          <div>
            <div className="font-display font-bold text-xl text-white">NutriPro</div>
            <div className="text-xs text-white/30">v2.0 Premium</div>
          </div>
        </div>

        {/* Main Headline */}
        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald/10 border border-emerald/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
            <span className="text-xs font-semibold text-emerald">Software Clínico Premium</span>
          </div>
          <h1 className="font-display text-4xl xl:text-5xl text-white leading-[1.1] mb-4">
            El software que<br />
            <span className="text-gradient-emerald">tu consulta</span><br />
            merece.
          </h1>
          <p className="text-white/40 text-base leading-relaxed max-w-sm">
            Gestiona pacientes, diseña dietas profesionales y genera PDFs clínicos
            de primer nivel. Todo en un solo lugar.
          </p>

          {/* Feature badges */}
          <div className="mt-8 flex flex-wrap gap-2">
            {['Expediente clínico', 'Dietas drag & drop', 'PDF con branding', 'Calculadoras clínicas', 'Agenda inteligente'].map(f => (
              <span key={f} className="badge badge-neutral text-white/40 border-navy-700">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative card-glass p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-gold flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-navy-950">AM</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Dra. Ana Morales</div>
              <div className="text-xs text-white/30">Nutrióloga · Guadalajara, Jalisco</div>
            </div>
            <div className="ml-auto flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-3 h-3 text-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
          <p className="text-xs text-white/50 leading-relaxed italic">
            "Los PDFs de NutriPro son lo más profesional que he visto. Mis pacientes
            quedan impresionados en cada consulta."
          </p>
        </div>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm animate-fade-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-emerald flex items-center justify-center">
              <Salad size={18} className="text-navy-950" />
            </div>
            <span className="font-display font-bold text-xl text-white">NutriPro</span>
          </div>

          <h2 className="font-display text-2xl text-white mb-1">Bienvenido de vuelta</h2>
          <p className="text-sm text-white/40 mb-8">Ingresa tus credenciales para continuar</p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div className="form-group">
              <label className="label" htmlFor="email-input">Correo electrónico</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="tu@email.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0" htmlFor="password-input">Contraseña</label>
                <Link to="/forgot-password" className="text-xs text-emerald hover:text-emerald-300 transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  id="password-input"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 animate-fade-in">
                <p className="text-xs text-danger font-medium">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              id="login-submit-btn"
              disabled={loading || !email || !password}
              className="btn-primary btn w-full btn-lg mt-2 gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin" />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <span>Iniciar sesión</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-navy-700" />
            <span className="text-xs text-white/20">NutriPro v2.0</span>
            <div className="flex-1 h-px bg-navy-700" />
          </div>

          <p className="text-center text-xs text-white/25">
            ¿Necesitas acceso?{' '}
            <a href="https://nutripro.mx" className="text-emerald hover:text-emerald-300 transition-colors font-semibold">
              Adquiere tu licencia
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
