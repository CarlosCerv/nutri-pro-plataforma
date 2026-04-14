import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Save, User, Image as ImageIcon, Shield, CreditCard, Palette, Camera } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('perfil');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Mock Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Carlos Cervantes',
    email: user?.email || 'carlos.nutri@ejemplo.com',
    cedula: '12345678',
    universidad: 'Universidad de Guadalajara',
    telefono: '3310001122',
  });

  const [brandingData, setBrandingData] = useState({
    colorPrimario: '#2ECC8E',
    colorSecundario: '#1A2E50',
    logo: null,
    slogan: 'Tu mejor versión, todos los días.',
    mostrarRedes: true,
    instagram: '@carlos.nutricion',
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="page-header">
        <h1 className="page-title">Configuración</h1>
        <p className="page-subtitle">Gestiona tu perfil profesional, branding y facturación</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Nav Tabs Lateral */}
        <div className="w-full lg:w-64 flex-shrink-0 card !p-2 space-y-1">
          <button onClick={() => setActiveTab('perfil')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'perfil' ? 'bg-emerald/10 text-emerald' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}>
            <User size={18} /> Datos Profesionales
          </button>
          <button onClick={() => setActiveTab('branding')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'branding' ? 'bg-gold/10 text-gold' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}>
            <Palette size={18} /> Branding (PDFs)
          </button>
          <button onClick={() => setActiveTab('seguridad')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'seguridad' ? 'bg-blue-500/10 text-blue-500' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}>
            <Shield size={18} /> Contraseña y Acceso
          </button>
          <hr className="border-navy-700/50 my-2 mx-2" />
          <button onClick={() => setActiveTab('licencia')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'licencia' ? 'bg-purple-500/10 text-purple-400' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}>
            <CreditCard size={18} /> Mi Licencia SaaS
          </button>
        </div>

        {/* Contenido (Forms) */}
        <div className="flex-1 w-full card">
          <form onSubmit={handleSave}>
            {activeTab === 'perfil' && (
              <div className="space-y-5 animate-fade-in">
                <h2 className="text-xl font-display text-white mb-4">Datos Profesionales</h2>
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-emerald flex items-center justify-center text-2xl font-bold text-navy-950 font-display">
                    {profileData.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <button type="button" className="btn btn-outline btn-sm gap-2"><Camera size={14} /> Cambiar Foto</button>
                  <p className="text-xs text-white/30 hidden sm:block">Esta foto aparece en el sidebar y portal de pacientes.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="label">Nombre completo con título</label>
                    <input className="input" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="label">Correo principal (Login)</label>
                    <input className="input" type="email" value={profileData.email} disabled />
                    <p className="text-2xs text-emerald mt-1">Verificado</p>
                  </div>
                  <div className="form-group">
                    <label className="label">Cédula Profesional</label>
                    <input className="input font-mono" value={profileData.cedula} onChange={e => setProfileData({...profileData, cedula: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="label">Institución/Universidad</label>
                    <input className="input" value={profileData.universidad} onChange={e => setProfileData({...profileData, universidad: e.target.value})} />
                  </div>
                  <div className="form-group md:col-span-2">
                    <label className="label">Teléfono de contacto (Consultorio)</label>
                    <input className="input md:w-1/2" value={profileData.telefono} onChange={e => setProfileData({...profileData, telefono: e.target.value})} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'branding' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-display text-white">Diseño de PDFs y Reportes</h2>
                  <span className="badge badge-gold bg-gold/10 text-gold border-gold/30">Premium Feature</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="form-group">
                      <label className="label">Slogan o Frase destacada</label>
                      <input className="input" value={brandingData.slogan} onChange={e => setBrandingData({...brandingData, slogan: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="label flex justify-between">Color Primario <span className="text-white/40 font-mono">{brandingData.colorPrimario}</span></label>
                      <div className="flex items-center gap-3">
                        <input type="color" className="w-10 h-10 rounded cursor-pointer border-none bg-transparent" value={brandingData.colorPrimario} onChange={e => setBrandingData({...brandingData, colorPrimario: e.target.value})} />
                        <span className="text-xs text-white/50">Aplica a botones y encabezados en PDF</span>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="label flex justify-between">Color Secundario <span className="text-white/40 font-mono">{brandingData.colorSecundario}</span></label>
                      <div className="flex items-center gap-3">
                        <input type="color" className="w-10 h-10 rounded cursor-pointer border-none bg-transparent" value={brandingData.colorSecundario} onChange={e => setBrandingData({...brandingData, colorSecundario: e.target.value})} />
                        <span className="text-xs text-white/50">Aplica a fondos de tablas y pies de página</span>
                      </div>
                    </div>
                    
                    <hr className="border-navy-700 my-4" />
                    
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 accent-emerald" checked={brandingData.mostrarRedes} onChange={e => setBrandingData({...brandingData, mostrarRedes: e.target.checked})} />
                      <span className="text-sm text-white/80">Mostrar redes sociales en el pie de página</span>
                    </label>
                    
                    {brandingData.mostrarRedes && (
                      <div className="form-group animate-slide-in-up">
                        <label className="label">Usuario de Instagram / Facebook</label>
                        <input className="input" value={brandingData.instagram} onChange={e => setBrandingData({...brandingData, instagram: e.target.value})} />
                      </div>
                    )}
                  </div>
                  
                  {/* Vista previa mock (visual solo) */}
                  <div className="border border-navy-600 bg-white rounded-xl p-4 flex flex-col pointer-events-none select-none relative overflow-hidden h-[340px]">
                    <div className="absolute top-0 inset-x-0 h-4" style={{ backgroundColor: brandingData.colorPrimario }}></div>
                    <div className="mt-6 flex justify-between items-start">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                        <ImageIcon size={20} />
                      </div>
                      <div className="text-right text-gray-800">
                        <div className="font-bold text-sm" style={{ color: brandingData.colorPrimario }}>{profileData.name}</div>
                        <div className="text-[10px] text-gray-500">Cédula: {profileData.cedula}</div>
                        <div className="text-[9px] text-gray-400 italic mt-1">{brandingData.slogan}</div>
                      </div>
                    </div>
                    <div className="mt-8">
                      <div className="mx-auto w-1/3 h-2 rounded bg-gray-200 mb-2"></div>
                      <div className="mx-auto w-1/2 h-2 rounded bg-gray-200"></div>
                    </div>
                    <div className="mt-auto pt-3 border-t border-gray-200 text-center text-[9px] text-gray-500">
                      {brandingData.mostrarRedes ? `Sígueme en redes: ${brandingData.instagram}` : 'NutriPro Software Genérico'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'seguridad' && (
              <div className="space-y-4 animate-fade-in text-center py-10 text-white/40">
                <Shield size={32} className="mx-auto mb-3 text-white/20" />
                <p>Gestión de contraseñas y doble factor de autenticación estarián aquí.</p>
              </div>
            )}

            {activeTab === 'licencia' && (
              <div className="space-y-4 animate-fade-in text-center py-10 text-white/40">
                <CreditCard size={32} className="mx-auto mb-3 text-white/20" />
                <p>Estado de la licencia, límites de pacientes y facturación.</p>
              </div>
            )}

            <div className="mt-8 pt-5 border-t border-navy-700/50 flex justify-end">
              <button type="submit" disabled={saving || activeTab === 'seguridad' || activeTab === 'licencia'} className="btn btn-primary gap-2 w-full sm:w-auto">
                {saving ? (
                  <><div className="w-4 h-4 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin" /> Guardando...</>
                ) : saved ? (
                  <>✓ Guardado</>
                ) : (
                  <><Save size={16} /> Guardar Configuración</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
