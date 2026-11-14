import { useState } from "react";
import type { FormEvent, Ref } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../ui/Icon";

interface SiteSearchFormProps {
    variant: "panel" | "menu";
    inputRef?: Ref<HTMLInputElement>;
}

export default function SiteSearchForm({ variant, inputRef }: SiteSearchFormProps) {
    const navigate = useNavigate();
    const [value, setValue] = useState("");

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const query = value.trim();
        if (!query) return;
        setValue("");
        navigate(`/estabelecimentos?q=${encodeURIComponent(query)}`);
    };

    return (
        <form className={`site-search site-search--${variant}`} role="search" onSubmit={handleSubmit}>
            <label className="site-search__field">
                <Icon name="search" className="site-search__icon" />
                <input
                    ref={inputRef}
                    type="search"
                    className="site-search__input"
                    placeholder="Buscar restaurantes e pousadas…"
                    aria-label="Buscar restaurantes e pousadas"
                    enterKeyHint="search"
                    autoComplete="off"
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                />
            </label>
            {variant === "panel" && (
                <button type="submit" className="site-search__submit">Buscar</button>
            )}
        </form>
    );
}
