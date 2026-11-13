import Icon from "./Icon";

interface SearchFieldProps {
    value: string;
    onChange: (value: string) => void;
    onClear: () => void;
    placeholder?: string;
    ariaLabel?: string;
    compact?: boolean;
    className?: string;
}

export default function SearchField({
    value,
    onChange,
    onClear,
    placeholder = "Buscar…",
    ariaLabel = "Buscar",
    compact = false,
    className = "",
}: SearchFieldProps) {
    return (
        <div className={`ui-search${compact ? " ui-search--compact" : ""} ${className}`.trim()}>
            <Icon name="search" className="ui-search__icon" />
            <input
                type="search"
                className="ui-search__input"
                value={value}
                placeholder={placeholder}
                aria-label={ariaLabel}
                onChange={(e) => onChange(e.target.value)}
            />
            {value && (
                <button type="button" className="ui-search__clear" aria-label="Limpar busca" onClick={onClear}>
                    <Icon name="close" />
                </button>
            )}
        </div>
    );
}
