import { useId, useState, type ReactNode } from "react";
import { usePresence } from "../../utils/usePresence";
import Icon from "./Icon";
import "./field.css";

export interface FieldControlProps {
    id: string;
    "aria-invalid"?: true;
    "aria-describedby"?: string;
    "aria-required"?: true;
}

interface FieldProps {
    label: ReactNode;
    hint?: ReactNode;
    error?: string;
    required?: boolean;
    optional?: boolean;
    counter?: { current: number; max: number };
    className?: string;
    children: (control: FieldControlProps) => ReactNode;
}

/** Rótulo, ajuda, contador e erro de um campo; o controle recebe id e aria-* prontos. */
export default function Field({ label, hint, error, required, optional, counter, className = "", children }: FieldProps) {
    const uid = useId();
    const id = `${uid}-control`;
    const hintId = `${uid}-hint`;
    const errorId = `${uid}-error`;
    const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ");
    const [lastError, setLastError] = useState(error);
    if (error && error !== lastError) setLastError(error);
    const presence = usePresence(!!error, 160);
    const counterState = counter ? (counter.current >= counter.max ? "full" : counter.current >= counter.max * 0.9 ? "near" : "") : "";

    const control: FieldControlProps = { id };
    if (error) control["aria-invalid"] = true;
    if (required) control["aria-required"] = true;
    if (describedBy) control["aria-describedby"] = describedBy;

    return (
        <div className={`ui-field${error ? " ui-field--invalid" : ""} ${className}`.trim()}>
            <div className="ui-field__head">
                <label htmlFor={id} className="ui-field__label">
                    {label}
                    {required && (
                        <span className="ui-field__req" aria-hidden="true">
                            {" "}
                            *
                        </span>
                    )}
                    {optional && <span className="ui-field__opt"> (opcional)</span>}
                </label>
                {counter && (
                    <span className={`ui-field__counter${counterState ? ` ui-field__counter--${counterState}` : ""}`} aria-hidden="true">
                        {counter.current}/{counter.max}
                    </span>
                )}
            </div>
            {children(control)}
            {hint && (
                <p id={hintId} className="ui-field__hint">
                    {hint}
                </p>
            )}
            <div className="ui-field__error-slot">
                {presence.mounted && (
                    <p id={error ? errorId : undefined} className="ui-field__error" data-state={presence.state}>
                        <Icon name="error" filled />
                        <span>{error ?? lastError}</span>
                    </p>
                )}
            </div>
        </div>
    );
}
