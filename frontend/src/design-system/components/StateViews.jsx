import PropTypes from 'prop-types';
import { AlertCircle, RefreshCw, Inbox } from 'lucide-react';
import Button from './Button.jsx';
import Spinner from './Spinner.jsx';

/**
 * Los tres estados que toda vista con datos remotos necesita.
 *
 * Antes cada página resolvía el vacío a su manera —o no lo resolvía—, y el
 * error casi nunca se mostraba: varias vistas lo tragaban con un `.catch`
 * que dejaba la lista vacía, indistinguible de "no hay nada todavía".
 */

export function EmptyState({ icon, title, description, action, className = '' }) {
  return (
    <div className={['empty-state', className].filter(Boolean).join(' ')}>
      <div className="empty-state-icon">{icon || <Inbox size={26} strokeWidth={1.5} />}</div>
      <div>
        <p className="text-sm font-semibold text-[var(--ink)]">{title}</p>
        {description ? (
          <p className="mx-auto mt-1 max-w-md text-xs text-[var(--ink-muted)]">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.node.isRequired,
  description: PropTypes.node,
  action: PropTypes.node,
  className: PropTypes.string,
};

export function ErrorState({ message, onRetry, action, className = '' }) {
  return (
    <div role="alert" className={['empty-state', className].filter(Boolean).join(' ')}>
      <div className="empty-state-icon text-[var(--danger)]">
        <AlertCircle size={26} strokeWidth={1.5} />
      </div>
      <p className="max-w-md text-sm text-[var(--ink-muted)]">{message}</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {onRetry ? (
          <Button size="sm" onClick={onRetry} className="gap-2">
            <RefreshCw size={14} />
            Reintentar
          </Button>
        ) : null}
        {action}
      </div>
    </div>
  );
}

ErrorState.propTypes = {
  message: PropTypes.node.isRequired,
  onRetry: PropTypes.func,
  action: PropTypes.node,
  className: PropTypes.string,
};

export function LoadingState({ label = 'Cargando…', className = '' }) {
  return (
    <div className={['flex min-h-[220px] flex-col items-center justify-center gap-3', className].filter(Boolean).join(' ')}>
      <Spinner size="lg" />
      <p className="text-sm text-[var(--ink-secondary)]">{label}</p>
    </div>
  );
}

LoadingState.propTypes = {
  label: PropTypes.string,
  className: PropTypes.string,
};

/** Bloque de esqueleto para cargas que ya conocen la forma del contenido. */
export function Skeleton({ className = '' }) {
  return <div aria-hidden="true" className={['skeleton', className].filter(Boolean).join(' ')} />;
}

Skeleton.propTypes = { className: PropTypes.string };
