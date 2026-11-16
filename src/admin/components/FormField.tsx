import { useId } from 'react';
import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';

interface BaseFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

function describedBy(id: string, hasHint: boolean, hasError: boolean, extra?: string) {
  const ids = [extra, hasHint ? `${id}-hint` : '', hasError ? `${id}-error` : ''].filter(Boolean);
  return ids.length ? ids.join(' ') : undefined;
}

// Input
interface FormInputProps extends BaseFieldProps, InputHTMLAttributes<HTMLInputElement> {}

export function FormInput({ label, error, hint, required, id: idProp, 'aria-describedby': extraDescribedBy, ...props }: FormInputProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  return (
    <div className="adm-field">
      <label htmlFor={id}>{label}{required && <span className="adm-required" aria-hidden="true">*</span>}</label>
      <input
        id={id}
        className={error ? 'error' : ''}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, !!hint, !!error, extraDescribedBy)}
        {...props}
      />
      {hint && <span id={`${id}-hint`} className="adm-field__hint">{hint}</span>}
      {error && <span id={`${id}-error`} className="adm-field__error">{error}</span>}
    </div>
  );
}

// Textarea
interface FormTextareaProps extends BaseFieldProps, TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function FormTextarea({ label, error, hint, required, maxLength, value, id: idProp, 'aria-describedby': extraDescribedBy, ...props }: FormTextareaProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const currentLength = typeof value === 'string' ? value.length : 0;
  const isNearLimit = maxLength && currentLength >= maxLength;

  return (
    <div className="adm-field">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label htmlFor={id}>{label}{required && <span className="adm-required" aria-hidden="true">*</span>}</label>
        {maxLength && (
          <span style={{ fontSize: '0.75rem', color: isNearLimit ? 'var(--adm-red)' : '#9ca3af' }}>
            {currentLength} / {maxLength}
          </span>
        )}
      </div>
      <textarea
        id={id}
        className={error || isNearLimit ? 'error' : ''}
        value={value}
        maxLength={maxLength}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, !!hint && !isNearLimit, !!error, extraDescribedBy)}
        {...props}
      />
      {hint && !isNearLimit && <span id={`${id}-hint`} className="adm-field__hint">{hint}</span>}
      {isNearLimit && <span className="adm-field__error" style={{ display: 'block', marginTop: 4 }}>Limite de caracteres atingido.</span>}
      {error && <span id={`${id}-error`} className="adm-field__error">{error}</span>}
    </div>
  );
}

// Select
interface FormSelectProps extends BaseFieldProps, SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
}

export function FormSelect({ label, error, hint, required, children, id: idProp, 'aria-describedby': extraDescribedBy, ...props }: FormSelectProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  return (
    <div className="adm-field">
      <label htmlFor={id}>{label}{required && <span className="adm-required" aria-hidden="true">*</span>}</label>
      <select
        id={id}
        className={error ? 'error' : ''}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, !!hint, !!error, extraDescribedBy)}
        {...props}
      >
        {children}
      </select>
      {hint && <span id={`${id}-hint`} className="adm-field__hint">{hint}</span>}
      {error && <span id={`${id}-error`} className="adm-field__error">{error}</span>}
    </div>
  );
}

// Toggle (slider)
interface FormToggleProps extends BaseFieldProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  id?: string;
}

export function FormToggle({ label, checked, onChange, id }: FormToggleProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <label className="adm-toggle" htmlFor={fieldId}>
      <input
        type="checkbox"
        id={fieldId}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="adm-toggle__track">
        <span className="adm-toggle__thumb" />
      </span>
      <span className="adm-toggle__label">{label}</span>
    </label>
  );
}
