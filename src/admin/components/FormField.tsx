import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';

interface BaseFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

// Input
interface FormInputProps extends BaseFieldProps, InputHTMLAttributes<HTMLInputElement> {}

export function FormInput({ label, error, hint, required, ...props }: FormInputProps) {
  return (
    <div className="adm-field">
      <label>{label}{required && <span style={{ color: 'var(--adm-red)', marginLeft: 2 }}>*</span>}</label>
      <input className={error ? 'error' : ''} {...props} />
      {hint && <span className="adm-field__hint">{hint}</span>}
      {error && <span className="adm-field__error">{error}</span>}
    </div>
  );
}

// Textarea
interface FormTextareaProps extends BaseFieldProps, TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function FormTextarea({ label, error, hint, required, maxLength, value, ...props }: FormTextareaProps) {
  const currentLength = typeof value === 'string' ? value.length : 0;
  const isNearLimit = maxLength && currentLength >= maxLength;
  
  return (
    <div className="adm-field">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label>{label}{required && <span style={{ color: 'var(--adm-red)', marginLeft: 2 }}>*</span>}</label>
        {maxLength && (
          <span style={{ fontSize: '0.75rem', color: isNearLimit ? 'var(--adm-red)' : '#9ca3af' }}>
            {currentLength} / {maxLength}
          </span>
        )}
      </div>
      <textarea className={error || isNearLimit ? 'error' : ''} value={value} maxLength={maxLength} {...props} />
      {hint && !isNearLimit && <span className="adm-field__hint">{hint}</span>}
      {isNearLimit && <span className="adm-field__error" style={{ display: 'block', marginTop: 4 }}>Limite de caracteres atingido.</span>}
      {error && <span className="adm-field__error">{error}</span>}
    </div>
  );
}

// Select
interface FormSelectProps extends BaseFieldProps, SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
}

export function FormSelect({ label, error, hint, required, children, ...props }: FormSelectProps) {
  return (
    <div className="adm-field">
      <label>{label}{required && <span style={{ color: 'var(--adm-red)', marginLeft: 2 }}>*</span>}</label>
      <select className={error ? 'error' : ''} {...props}>{children}</select>
      {hint && <span className="adm-field__hint">{hint}</span>}
      {error && <span className="adm-field__error">{error}</span>}
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
  const fieldId = id ?? `toggle-${label}`;
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
