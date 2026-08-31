import { forwardRef, useId } from 'react';
import PropTypes from 'prop-types';

const fieldClasses = (base, error, className) =>
  [base, error ? 'input-error' : '', className].filter(Boolean).join(' ');

/**
 * Campo de formulario del sistema de diseno: agrupa label, control y
 * texto de ayuda/error bajo .form-group (index.css), con los ids de
 * accesibilidad (`htmlFor`, `aria-describedby`) resueltos automaticamente.
 */
const FormField = forwardRef(function FormField(
  { as: as_ = 'input', label, error, helperText, id, required, className = '', containerClassName = '', children, ...rest },
  ref
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const describedBy = error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined;
  const Component = as_;

  return (
    <div className={['form-group', containerClassName].filter(Boolean).join(' ')}>
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
          {required && <span className="text-[var(--danger)]"> *</span>}
        </label>
      )}
      <Component
        ref={ref}
        id={inputId}
        className={fieldClasses(Component === 'select' ? 'select' : 'input', error, className)}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      >
        {children}
      </Component>
      {error ? (
        <p id={`${inputId}-error`} className="error-text">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${inputId}-helper`} className="helper-text">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

const fieldPropTypes = {
  label: PropTypes.node,
  error: PropTypes.node,
  helperText: PropTypes.node,
  id: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
  containerClassName: PropTypes.string,
};

FormField.propTypes = { as: PropTypes.string, children: PropTypes.node, ...fieldPropTypes };

export const Select = forwardRef(function Select(props, ref) {
  return <FormField ref={ref} as="select" {...props} />;
});
Select.propTypes = { ...fieldPropTypes, children: PropTypes.node };

export const Textarea = forwardRef(function Textarea({ rows = 3, ...props }, ref) {
  return <FormField ref={ref} as="textarea" rows={rows} {...props} />;
});
Textarea.propTypes = { ...fieldPropTypes, rows: PropTypes.oneOfType([PropTypes.number, PropTypes.string]) };

const Input = forwardRef(function Input(props, ref) {
  return <FormField ref={ref} as="input" {...props} />;
});
Input.propTypes = fieldPropTypes;

export default Input;
