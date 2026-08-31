import { useState } from 'react';
import { User, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import Tabs from '../design-system/components/Tabs.jsx';
import FormSection from '../design-system/components/FormSection.jsx';
import SaveBar from '../design-system/components/SaveBar.jsx';
import useSaveState from '../hooks/useSaveState';
import { Card, Input } from '../design-system/components';

/**
 * Cuenta y ajustes.
 *
 * La versión anterior no guardaba nada: `handleSave` era un `setTimeout` de
 * 800 ms que ponía "Guardado" y descartaba los datos, y el formulario venía
 * precargado con un nombre y una cédula inventados. Además tenía pestañas de
 * branding de PDF y de licencia SaaS que ningún endpoint respalda.
 *
 * Ahora persiste contra `PUT /api/auth/profile`, que es lo que el backend
 * expone: nombre, correo, especialidad, teléfono y contraseña.
 */

const TABS = [
  { id: 'perfil', label: 'Datos profesionales', icon: <User size={15} /> },
  { id: 'seguridad', label: 'Contraseña', icon: <Shield size={15} /> },
];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('perfil');

  const [perfil, setPerfil] = useState({
    name: user?.name || '',
    email: user?.email || '',
    specialty: user?.specialty || '',
    phone: user?.phone || '',
  });
  const [password, setPassword] = useState({ nueva: '', confirmar: '' });

  const guardadoPerfil = useSaveState();
  const guardadoPassword = useSaveState();

  const setCampo = (k, v) => setPerfil((p) => ({ ...p, [k]: v }));

  const guardarPerfil = async (e) => {
    e.preventDefault();
    await guardadoPerfil.save(async () => {
      const res = await authAPI.updateProfile(perfil);
      const actualizado = res.data?.data?.user;
      if (actualizado) updateUser({ ...user, ...actualizado });
    });
  };

  const noCoincide = password.nueva.length > 0 && password.nueva !== password.confirmar;

  const guardarPassword = async (e) => {
    e.preventDefault();
    if (noCoincide) return;
    const { ok } = await guardadoPassword.save(() => authAPI.updateProfile({ password: password.nueva }));
    if (ok) setPassword({ nueva: '', confirmar: '' });
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <Tabs items={TABS} value={tab} onChange={setTab} ariaLabel="Secciones de la cuenta" />

      {tab === 'perfil' ? (
        <Card as="form" onSubmit={guardarPerfil} className="space-y-6">
          <FormSection title="Datos profesionales" description="Aparecen en los reportes que exportas a PDF.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="perfil-nombre"
                label="Nombre completo"
                required
                value={perfil.name} onChange={(e) => setCampo('name', e.target.value)}
              />
              <Input
                id="perfil-email"
                label="Correo"
                required
                type="email" value={perfil.email} onChange={(e) => setCampo('email', e.target.value)}
              />
              <Input
                id="perfil-especialidad"
                label="Especialidad"
                value={perfil.specialty} onChange={(e) => setCampo('specialty', e.target.value)} placeholder="Ej. nutrición clínica"
              />
              <Input
                id="perfil-telefono"
                label="Teléfono"
                type="tel" value={perfil.phone} onChange={(e) => setCampo('phone', e.target.value)} placeholder="+52 …"
              />
            </div>
          </FormSection>

          <SaveBar
            saving={guardadoPerfil.saving}
            saved={guardadoPerfil.saved}
            error={guardadoPerfil.error}
            label="Guardar cambios"
          />
        </Card>
      ) : (
        <Card as="form" onSubmit={guardarPassword} className="space-y-6">
          <FormSection title="Cambiar contraseña" description="Mínimo 6 caracteres. Cerrarás sesión en otros dispositivos la próxima vez que expire su token.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="pass-nueva"
                label="Nueva contraseña"
                type="password" minLength={6} autoComplete="new-password" value={password.nueva} onChange={(e) => setPassword((p) => ({ ...p, nueva: e.target.value }))}
              />
              <div className="form-group">
                <label className="label" htmlFor="pass-confirmar">
                  Confirmar contraseña
                </label>
                <input
                  id="pass-confirmar"
                  type="password"
                  minLength={6}
                  className={`input${noCoincide ? ' input-error' : ''}`}
                  autoComplete="new-password"
                  aria-invalid={noCoincide || undefined}
                  value={password.confirmar}
                  onChange={(e) => setPassword((p) => ({ ...p, confirmar: e.target.value }))}
                />
                {noCoincide ? (
                  <p className="error-text" role="alert">
                    Las contraseñas no coinciden.
                  </p>
                ) : null}
              </div>
            </div>
          </FormSection>

          <SaveBar
            saving={guardadoPassword.saving}
            saved={guardadoPassword.saved}
            error={guardadoPassword.error}
            label="Cambiar contraseña"
            savedLabel="Contraseña actualizada"
            disabled={password.nueva.length < 6 || noCoincide}
          />
        </Card>
      )}
    </div>
  );
}
