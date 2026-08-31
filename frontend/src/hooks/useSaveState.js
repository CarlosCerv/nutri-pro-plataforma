import { useCallback, useEffect, useRef, useState } from 'react';
import { getApiErrorMessage } from '../lib/apiError';

const SUCCESS_MS = 2500;

/**
 * Estado de guardado para los formularios del expediente.
 *
 * Existe para que un fallo se vea como fallo. Cada pestaña de paciente repetia
 * la misma forma `catch { setSaved(true) }`, con lo que la interfaz mostraba
 * "Guardado" con palomita verde aunque la peticion nunca hubiera llegado al
 * servidor, y el usuario perdia la captura sin enterarse.
 *
 * Uso:
 *   const { saving, saved, error, save } = useSaveState();
 *   const handleSave = (e) => {
 *     e.preventDefault();
 *     save(async () => {
 *       const res = await api.put(`/api/patients/${id}`, form);
 *       onUpdate?.(res.data.data || res.data);
 *     });
 *   };
 */
export default function useSaveState({ successMs = SUCCESS_MS } = {}) {
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState(null);
    const timer = useRef(null);

    useEffect(() => () => clearTimeout(timer.current), []);

    const save = useCallback(
        async (fn) => {
            clearTimeout(timer.current);
            setSaving(true);
            setSaved(false);
            setError(null);
            try {
                const result = await fn();
                setSaved(true);
                timer.current = setTimeout(() => setSaved(false), successMs);
                return { ok: true, data: result };
            } catch (err) {
                setError(getApiErrorMessage(err, 'No se pudieron guardar los cambios.'));
                return { ok: false, error: err };
            } finally {
                setSaving(false);
            }
        },
        [successMs]
    );

    const dismissError = useCallback(() => setError(null), []);

    return { saving, saved, error, save, dismissError };
}
