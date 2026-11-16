import { useRef, useState, type KeyboardEvent, type Ref } from "react";
import "./star-rating.css";

export type StarValue = 1 | 2 | 3 | 4 | 5;

export const STAR_PATH = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

export function Stars({ value, size = 18 }: { value: number; size?: number }) {
  return (
    <span className="ui-stars" role="img" aria-label={`${value} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={s <= value ? "#FFB527" : "#e5e7eb"}
          aria-hidden="true"
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
    </span>
  );
}

interface StarPickerProps {
  value: number;
  onChange: (v: StarValue) => void;
  labelledBy: string;
  describedBy?: string;
  invalid?: boolean;
  disabled?: boolean;
  groupRef?: Ref<HTMLDivElement>;
}

export function StarPicker({ value, onChange, labelledBy, describedBy, invalid, disabled, groupRef }: StarPickerProps) {
  const [hovered, setHovered] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const active = hovered || value;

  const select = (next: number) => {
    const clamped = Math.min(5, Math.max(1, next)) as StarValue;
    onChange(clamped);
    buttons.current[clamped - 1]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = value || 0;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        event.preventDefault();
        select(current + 1);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        event.preventDefault();
        select(current === 0 ? 1 : current - 1);
        break;
      case "Home":
        event.preventDefault();
        select(1);
        break;
      case "End":
        event.preventDefault();
        select(5);
        break;
    }
  };

  return (
    <div
      ref={groupRef}
      className="ui-star-picker"
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      onKeyDown={handleKeyDown}
    >
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          ref={(el) => { buttons.current[s - 1] = el; }}
          type="button"
          role="radio"
          aria-checked={value === s}
          tabIndex={value === s || (value === 0 && s === 1) ? 0 : -1}
          className={`ui-star-picker__btn${active >= s ? " filled" : ""}`}
          onClick={() => onChange(s as StarValue)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          disabled={disabled}
          aria-label={`${s} estrela${s > 1 ? "s" : ""}`}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d={STAR_PATH} />
          </svg>
        </button>
      ))}
    </div>
  );
}
