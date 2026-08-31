import PropTypes from 'prop-types';
import { Check, Save, AlertCircle } from 'lucide-react';
import Button from './Button.jsx';

/**
 * Pie de formulario con el boton de guardar y el estado del ultimo intento.
 *
 * Reemplaza el bloque que estaba copiado en las seis pestañas del expediente,
 * donde ademas el estado de error no existia: el boton solo sabia decir
 * "Guardando..." o "Guardado". Aqui un fallo se muestra junto al boton, con
 * `role="alert"` para que tambien lo anuncien los lectores de pantalla.
 *
 * Se usa junto con `useSaveState()`, que provee `saving`/`saved`/`error`.
 */
export default function SaveBar({
    saving = false,
    saved = false,
    error = null,
    label = 'Guardar cambios',
    savedLabel = 'Guardado',
    id,
    disabled = false,
}) {
    return (
        <div className="flex flex-col items-stretch gap-3 border-t border-[var(--border-soft)] pt-4 sm:flex-row sm:items-center sm:justify-end">
            {error ? (
                <p
                    role="alert"
                    className="flex items-start gap-2 text-sm text-[var(--danger)] sm:mr-auto sm:max-w-md"
                >
                    <AlertCircle size={16} strokeWidth={1.75} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <span>{error}</span>
                </p>
            ) : null}

            <Button type="submit" id={id} loading={saving} disabled={disabled} className="gap-2">
                {saving ? (
                    'Guardando…'
                ) : saved ? (
                    <>
                        <Check size={15} strokeWidth={2.5} aria-hidden="true" />
                        {savedLabel}
                    </>
                ) : (
                    <>
                        <Save size={15} aria-hidden="true" />
                        {label}
                    </>
                )}
            </Button>
        </div>
    );
}

SaveBar.propTypes = {
    saving: PropTypes.bool,
    saved: PropTypes.bool,
    error: PropTypes.string,
    label: PropTypes.string,
    savedLabel: PropTypes.string,
    id: PropTypes.string,
    disabled: PropTypes.bool,
};
