import "../styles/SiteLogo.components.css";

interface SiteLogoProps {
    className?: string;
}

/** O único asset do logo é branco; a cor final vem de `--site-logo-color` via máscara CSS. */
export default function SiteLogo({ className = "" }: SiteLogoProps) {
    return <span role="img" aria-label="Viva Ubajara" className={`site-logo ${className}`.trim()} />;
}
