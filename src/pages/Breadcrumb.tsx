import { Link } from "react-router-dom";

interface Crumb {
    label: string;
    to?: string;
}

/** Trilha dos heros de detalhe; `prefix` escolhe o conjunto de classes (evd = evento, pt = atrativo/local). */
export default function Breadcrumb({ prefix, items }: { prefix: "evd" | "pt"; items: Crumb[] }) {
    return (
        <nav className={`${prefix}-breadcrumb`} aria-label="Você está em">
            <ol className={`${prefix}-breadcrumb__inner`}>
                {items.map((item, index) => (
                    <li key={item.label} className={`${prefix}-breadcrumb__item`}>
                        {item.to ? (
                            <Link to={item.to} className={`${prefix}-breadcrumb__link`}>
                                {item.label}
                            </Link>
                        ) : (
                            <span className={`${prefix}-breadcrumb__current`} aria-current="page" title={item.label}>
                                {item.label}
                            </span>
                        )}
                        {index < items.length - 1 && (
                            <span className={`${prefix}-breadcrumb__sep`} aria-hidden="true">
                                ›
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
