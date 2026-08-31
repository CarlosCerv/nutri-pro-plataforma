/* eslint-disable react-refresh/only-export-components -- mismo patrón que AuthContext.jsx: el hook vive junto al provider que lo alimenta. */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

/**
 * Avisos efímeros de la aplicación.
 *
 * Crear un paciente o una cita redirigía en silencio: el único indicio de
 * éxito era que el formulario desaparecía, lo que se parece demasiado a que
 * la aplicación se perdió. Las clases `.toast` ya existían en index.css sin
 * ningún componente que las usara.
 *
 * Los avisos se anuncian en una región `aria-live` para que también los
 * reciba quien navega con lector de pantalla.
 */

const ToastContext = createContext(null);

const ICONOS = {
  success: CheckCircle2,
  danger: AlertCircle,
  warning: AlertCircle,
  info: Info,
};

const DURACION_MS = 4000;

export function ToastProvider({ children }) {
  const [avisos, setAvisos] = useState([]);
  const temporizadores = useRef(new Map());

  useEffect(() => {
    const actuales = temporizadores.current;
    return () => {
      actuales.forEach(clearTimeout);
      actuales.clear();
    };
  }, []);

  const cerrar = useCallback((id) => {
    setAvisos((lista) => lista.filter((a) => a.id !== id));
    const t = temporizadores.current.get(id);
    if (t) {
      clearTimeout(t);
      temporizadores.current.delete(id);
    }
  }, []);

  const mostrar = useCallback(
    (mensaje, variante = 'success') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setAvisos((lista) => [...lista, { id, mensaje, variante }]);
      temporizadores.current.set(
        id,
        setTimeout(() => cerrar(id), DURACION_MS)
      );
      return id;
    },
    [cerrar]
  );

  const valor = useMemo(
    () => ({
      toast: mostrar,
      success: (m) => mostrar(m, 'success'),
      error: (m) => mostrar(m, 'danger'),
      info: (m) => mostrar(m, 'info'),
    }),
    [mostrar]
  );

  return (
    <ToastContext.Provider value={valor}>
      {children}
      <div aria-live="polite" aria-atomic="false" className="pointer-events-none">
        {avisos.map((aviso, i) => {
          const Icono = ICONOS[aviso.variante] || ICONOS.info;
          return (
            <div
              key={aviso.id}
              role="status"
              className={`toast toast-${aviso.variante} pointer-events-auto`}
              style={{ top: `calc(max(1rem, env(safe-area-inset-top)) + ${i * 4.5}rem)` }}
            >
              <Icono size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--accent)]" />
              <p className="min-w-0 flex-1 text-sm text-[var(--ink)]">{aviso.mensaje}</p>
              <button
                type="button"
                onClick={() => cerrar(aviso.id)}
                aria-label="Cerrar aviso"
                className="-mr-1 -mt-1 shrink-0 rounded p-1 text-[var(--ink-secondary)] transition-colors duration-micro hover:text-[var(--ink)]"
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
}
