import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, FileBadge2, ImagePlus, Palette, Sparkles, UserRound, Loader, 
  ArrowRight, ArrowLeft, Users, Calendar, Salad, FileText 
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const STEPS = [
  {
    number: 1,
    icon: UserRound,
    title: 'Identidad profesional',
    description: 'Nombre completo, especialidad, cédula y ciudad de consulta.',
    color: '#007AFF',
  },
  {
    number: 2,
    icon: ImagePlus,
    title: 'Branding clínico',
    description: 'Logo, foto profesional, acento premium y pie de PDF.',
    color: '#E8C96A',
  },
  {
    number: 3,
    icon: FileBadge2,
    title: 'Formato de reportes',
    description: 'Define qué datos verán tus pacientes en planes y expedientes.',
    color: '#34C759',
  },
];

const QUICK_START_ITEMS = [
  { icon: Users, label: 'Agregar Pacientes', to: '/pacientes/nuevo', color: '#007AFF' },
  { icon: Calendar, label: 'Agendar Citas', to: '/agenda/nueva', color: '#34C759' },
  { icon: Salad, label: 'Crear Dietas', to: '/dietas/nueva', color: '#FF9F0A' },
  { icon: FileText, label: 'Ver Reportes', to: '/reportes', color: '#5856D6' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    specialty: '',
    phone: '',
    clinicName: '',
    professionalCertificate: '',
    pdfHighlight: '',
    accentColor: '#2ECC8E',
    secondaryColor: '#E8C96A',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/auth/complete-onboarding', {
        specialty: formData.specialty,
        phone: formData.phone,
        clinicName: formData.clinicName,
        professionalCertificate: formData.professionalCertificate,
        pdfHighlight: formData.pdfHighlight,
        accentColor: formData.accentColor,
      });

      // Update user in context with firstAccess: false
      if (response.data.data.user) {
        const updatedUser = response.data.data.user;
        setUser(updatedUser);
        
        // Also update localStorage/sessionStorage
        if (localStorage.getItem('user')) {
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        if (sessionStorage.getItem('user')) {
          sessionStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }

      // Redirect to dashboard
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Error completando el onboarding');
      console.error('Onboarding error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isStepValid = () => {
    if (currentStep === 1) {
      return formData.clinicName && formData.specialty && formData.professionalCertificate && formData.phone;
    }
    if (currentStep === 2) {
      return formData.accentColor && formData.secondaryColor;
    }
    return true;
  };

  return (
    <div className="space-y-8 animate-fade-up pb-12">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 text-emerald text-xs font-semibold uppercase tracking-[0.24em] mb-4">
          <Sparkles size={14} />
          Primer acceso
        </div>
        <h1 className="page-title text-3xl md:text-4xl max-w-3xl mx-auto">
          Bienvenido a NutriPro
        </h1>
        <p className="page-subtitle max-w-2xl mx-auto mt-3">
          Configura tu perfil profesional para acceder a todas las herramientas clínicas.
        </p>
      </div>

      {/* Stepper */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((step, idx) => (
            <div key={step.number} className="flex items-center flex-1">
              <div
                className={`
                  w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg
                  transition-all duration-300 cursor-pointer
                  ${currentStep >= step.number
                    ? 'bg-emerald text-white shadow-lg shadow-emerald/30'
                    : 'bg-navy-800 text-white/50 border border-navy-700'
                  }
                `}
                onClick={() => currentStep >= step.number && setCurrentStep(step.number)}
              >
                {currentStep > step.number ? <Check size={20} /> : step.number}
              </div>
              
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-1 mx-3 rounded-full transition-all duration-300 ${
                  currentStep > step.number ? 'bg-emerald' : 'bg-navy-700'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step indicators */}
        <div className="flex justify-between text-center mb-8">
          {STEPS.map((step, idx) => (
            <div key={step.number} className="flex-1 px-2">
              <div className={`text-xs font-semibold transition-colors ${
                currentStep >= step.number ? 'text-white' : 'text-white/40'
              }`}>
                {step.title}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto grid lg:grid-cols-[1fr_0.8fr] gap-8">
        <div className="card p-8">
          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Professional Identity */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-up">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <UserRound size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Identidad Profesional</h2>
                    <p className="text-sm text-white/40">Completa tu perfil clínico</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="form-group">
                    <label className="label">Nombre profesional *</label>
                    <input
                      className="input"
                      placeholder="Ej: Dra. Andrea López, NC"
                      name="clinicName"
                      value={formData.clinicName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Especialidad *</label>
                    <input
                      className="input"
                      placeholder="Ej: Nutrición clínica y metabólica"
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Cédula profesional *</label>
                    <input
                      className="input font-mono"
                      placeholder="Ej: 12345678"
                      name="professionalCertificate"
                      value={formData.professionalCertificate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Teléfono consultorio *</label>
                    <input
                      className="input"
                      placeholder="Ej: +52 33 1000 1122"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Branding */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-up">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/15 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
                    <Palette size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Branding Clínico</h2>
                    <p className="text-sm text-white/40">Personaliza la identidad de tu clínica</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="form-group">
                    <label className="label">Texto destacado del PDF</label>
                    <input
                      className="input"
                      placeholder="Ej: Nutrición basada en ciencia, adherencia y resultados sostenibles."
                      name="pdfHighlight"
                      value={formData.pdfHighlight}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Color principal (Esmeralda)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        className="h-12 w-16 rounded-xl bg-transparent cursor-pointer border border-navy-700"
                        name="accentColor"
                        value={formData.accentColor}
                        onChange={handleInputChange}
                      />
                      <div className="text-sm text-white/50">
                        <div className="font-semibold text-white">{formData.accentColor}</div>
                        <div className="text-xs">Aplicado a botones y encabezados</div>
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="label">Color secundario (Premium)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        className="h-12 w-16 rounded-xl bg-transparent cursor-pointer border border-navy-700"
                        name="secondaryColor"
                        value={formData.secondaryColor}
                        onChange={handleInputChange}
                      />
                      <div className="text-sm text-white/50">
                        <div className="font-semibold text-white">{formData.secondaryColor}</div>
                        <div className="text-xs">Acentos de planes y QR</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Summary */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-up">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-green-500/15 border border-green-500/20 flex items-center justify-center text-green-400">
                    <Check size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">¡Casi listo!</h2>
                    <p className="text-sm text-white/40">Revisa tu información antes de finalizar</p>
                  </div>
                </div>

                <div className="space-y-4 bg-navy-900/50 rounded-2xl p-4 border border-navy-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-white/40 font-semibold">Nombre</div>
                      <div className="text-sm text-white mt-1">{formData.clinicName}</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/40 font-semibold">Especialidad</div>
                      <div className="text-sm text-white mt-1">{formData.specialty}</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/40 font-semibold">Cédula</div>
                      <div className="text-sm text-white mt-1">{formData.professionalCertificate}</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/40 font-semibold">Teléfono</div>
                      <div className="text-sm text-white mt-1">{formData.phone}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl" style={{ backgroundColor: formData.accentColor }} />
                  <div className="w-12 h-12 rounded-xl" style={{ backgroundColor: formData.secondaryColor }} />
                  <div className="text-sm text-white/50">
                    Tus colores corporativos se aplicarán en todos los PDFs y documentos clínicos.
                  </div>
                </div>

                <div className="rounded-2xl border-2 border-dashed border-emerald/30 bg-emerald/5 p-4">
                  <div className="flex items-center gap-2 text-emerald mb-2">
                    <Sparkles size={16} />
                    <span className="text-sm font-semibold">Próximos pasos</span>
                  </div>
                  <ul className="text-sm text-white/60 space-y-1">
                    <li>✓ Acceso completo al dashboard</li>
                    <li>✓ Módulo de pacientes y citas</li>
                    <li>✓ Generador de dietas y reportes</li>
                    <li>✓ Calculadoras nutricionales</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-navy-700">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 1 || loading}
                className="btn btn-outline gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={16} />
                Atrás
              </button>

              {currentStep < STEPS.length ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStepValid() || loading}
                  className="btn btn-primary gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!isStepValid() || loading}
                  className="btn btn-primary gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Completando...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Finalizar Onboarding
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Preview Sidebar */}
        <aside className="space-y-4 hidden lg:block">
          <div className="card sticky top-6">
            <div className="flex items-center gap-2 text-gold mb-4">
              <Palette size={16} />
              <span className="text-sm font-semibold">Vista previa PDF</span>
            </div>
            <div className="rounded-2xl bg-white text-slate-900 p-4 shadow-navy-md overflow-hidden">
              <div
                className="h-5 rounded-t-xl mb-4"
                style={{ backgroundColor: formData.accentColor }}
              />
              <div className="space-y-3">
                <div>
                  <div className="font-serif text-lg font-bold text-slate-900">{formData.clinicName || 'Tu Clínica'}</div>
                  <div className="text-xs text-slate-500">
                    {formData.specialty && formData.professionalCertificate
                      ? `${formData.specialty.split(' ')[0]} · Cédula ${formData.professionalCertificate}`
                      : 'Especialidad · Cédula'}
                  </div>
                </div>
                <div className="h-px bg-slate-200" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-slate-100 p-2">
                    <div className="text-[10px] uppercase tracking-widest text-slate-400">Requerimientos</div>
                    <div className="mt-1 font-mono text-xs">1650 kcal</div>
                  </div>
                  <div className="rounded-lg bg-slate-100 p-2">
                    <div className="text-[10px] uppercase tracking-widest text-slate-400">Macros</div>
                    <div className="mt-1 font-mono text-xs">30 / 45 / 25</div>
                  </div>
                </div>
                {formData.pdfHighlight && (
                  <div className="rounded-lg border border-dashed border-slate-300 p-2 bg-slate-50">
                    <div className="text-xs font-semibold text-slate-900">{formData.pdfHighlight}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Start */}
          <div className="card">
            <h3 className="text-sm font-semibold text-white mb-3">Inicio rápido</h3>
            <div className="space-y-2">
              {QUICK_START_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.to}
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentStep === STEPS.length && !loading) {
                      handleNext();
                    }
                  }}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors text-xs text-white/60 hover:text-white"
                >
                  <item.icon size={14} style={{ color: item.color }} />
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
