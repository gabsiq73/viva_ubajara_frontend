import type { ReactNode } from "react";

interface ToggleProps {
    label: ReactNode;
    checked: boolean;
    onChange: (checked: boolean) => void;
    large?: boolean;
}

export default function Toggle({ label, checked, onChange, large = false }: ToggleProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            className={`ui-switch${large ? " ui-switch--lg" : ""}`}
            onClick={() => onChange(!checked)}
        >
            <span className="ui-switch__label">{label}</span>
            <span className="ui-switch__track" aria-hidden="true">
                <span className="ui-switch__knob" />
            </span>
        </button>
    );
}
