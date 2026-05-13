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

export function FormTextarea({ label, error, hint, required, ...props }: FormTextareaProps) {
  return (
    <div className="adm-field">
      <label>{label}{required && <span style={{ color: 'var(--adm-red)', marginLeft: 2 }}>*</span>}</label>
      <textarea className={error ? 'error' : ''} {...props} />
      {hint && <span className="adm-field__hint">{hint}</span>}
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

// Toggle (checkbox)
interface FormToggleProps extends BaseFieldProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  id?: string;
}

export function FormToggle({ label, checked, onChange, id }: FormToggleProps) {
  const fieldId = id ?? `toggle-${label}`;
  return (
    <div className="adm-field adm-field--toggle">
      <input
        type="checkbox"
        id={fieldId}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label htmlFor={fieldId}>{label}</label>
    </div>
  );
}
