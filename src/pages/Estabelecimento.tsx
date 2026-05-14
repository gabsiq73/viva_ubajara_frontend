import { useParams, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ESTABLISHMENTS } from "../data/establishments";
import type { Establishment } from "../data/establishments";
import "./style/Estabelecimento.css";

const FEATURE_ICONS: Record<string, string> = {
    "Wi-Fi": "wifi",
    "Estacionamento": "local_parking",
    "Reservas": "event_available",
    "Acessível": "accessible",
    "Café da Manhã": "free_breakfast",
    "Piscina": "pool",
    "Trilhas": "hiking",
    "Entregas": "local_shipping",
    "Restaurante": "restaurant",
};

const PRICE_LABELS: Record<string, string> = {
    "$": "Econômico ($)",
    "$$": "Moderado ($$)",
    "$$$": "Premium ($$$)",
};

function StarRow({ count, size = "medium" }: { count: number; size?: "small" | "medium" | "large" }) {
    return (
        <span className={`estd-stars estd-stars--${size}`} aria-label={`${count} de 5 estrelas`}>
            {[1, 2, 3, 4, 5].map((i) => (
                <span
                    key={i}
                    className="material-symbols-outlined estd-star"
                    aria-hidden="true"
                    style={{
                        fontVariationSettings: `"FILL" ${i <= count ? 1 : 0}, "wght" 400, "GRAD" 0, "opsz" 20`,
                    }}
                >
                    star
                </span>
            ))}
        </span>
    );
}

function RelatedCard({ e }: { e: Establishment }) {
    return (
        <Link to={`/estabelecimentos/${e.id}`} className="estd-rel-card">
            <div className="estd-rel-card__img-wrap">
                <img src={e.img} alt={e.alt} className="estd-rel-card__img" loading="lazy" />
                <span className="estd-rel-card__type" data-type={e.type}>{e.type}</span>
                <span className="estd-rel-card__price">{e.priceLevel}</span>
            </div>
            <div className="estd-rel-card__body">
                <div className="estd-rel-card__rating-row">
                    <StarRow count={e.stars} size="small" />
                    <span className="estd-rel-card__stars-label">{e.stars}.0</span>
                </div>
                <h3 className="estd-rel-card__name">{e.name}</h3>
                <p className="estd-rel-card__city">
                    <span className="material-symbols-outlined" aria-hidden="true">location_on</span>
                    {e.city}, CE
                </p>
                <p className="estd-rel-card__desc">{e.desc}</p>
                <span className="estd-rel-card__cta" aria-hidden="true">
                    Ver Detalhes
                    <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                </span>
            </div>
        </Link>
    );
}

export default function Estabelecimento() {
    const { id } = useParams<{ id: string }>();
    const estab = ESTABLISHMENTS.find((e) => e.id === Number(id)) ?? ESTABLISHMENTS[0];

    const sameType = ESTABLISHMENTS.filter((e) => e.id !== estab.id && e.type === estab.type);
    const related =
        sameType.length >= 3
            ? sameType.slice(0, 3)
            : [
                  ...sameType,
                  ...ESTABLISHMENTS.filter((e) => e.id !== estab.id && e.type !== estab.type),
              ].slice(0, 3);

    return (
        <div className="estd-page">
            <Header />
            <main className="estd-main">

                {/* ── Hero ── */}
                <section className="estd-hero" aria-labelledby="estd-hero-title">
                    <img src={estab.img} alt={estab.alt} className="estd-hero__bg" />
                    <div className="estd-hero__overlay" aria-hidden="true" />

                    <nav className="estd-breadcrumb" aria-label="Navegação">
                        <div className="estd-breadcrumb__inner">
                            <Link to="/" className="estd-breadcrumb__link">Início</Link>
                            <span className="estd-breadcrumb__sep" aria-hidden="true">›</span>
                            <Link to="/estabelecimentos" className="estd-breadcrumb__link">Estabelecimentos</Link>
                            <span className="estd-breadcrumb__sep" aria-hidden="true">›</span>
                            <span className="estd-breadcrumb__current">{estab.name}</span>
                        </div>
                    </nav>

                    <div className="estd-hero__content">
                        <div className="estd-hero__inner">
                            <span className={`estd-hero__type estd-hero__type--${estab.type}`}>
                                {estab.type}
                            </span>
                            <h1 id="estd-hero-title" className="estd-hero__title">{estab.name}</h1>
                            <div className="estd-hero__rating-row">
                                <StarRow count={estab.stars} size="large" />
                                <span className="estd-hero__stars-label">{estab.stars}.0</span>
                                <span className="estd-hero__price-pill">{estab.priceLevel}</span>
                            </div>
                        </div>
                    </div>

                    <div className="estd-hero__infobar">
                        <div className="estd-hero__infobar-inner">
                            <span className="estd-info-item">
                                <span className="material-symbols-outlined" aria-hidden="true">location_on</span>
                                {estab.city}, CE
                            </span>
                            <span className="estd-info-sep" aria-hidden="true">|</span>
                            <span className="estd-info-item">
                                <span className="material-symbols-outlined" aria-hidden="true">schedule</span>
                                {estab.hours}
                            </span>
                            <span className="estd-info-sep" aria-hidden="true">|</span>
                            <span className="estd-info-item">
                                <span className="material-symbols-outlined" aria-hidden="true">call</span>
                                {estab.phone}
                            </span>
                        </div>
                    </div>
                </section>

                {/* ── Content + Info card ── */}
                <section className="estd-content">
                    <div className="estd-content__inner">

                        <div className="estd-content__left">
                            <span className="estd-content__kicker">SOBRE O ESTABELECIMENTO</span>
                            <h2 className="estd-content__title">Conheça o {estab.name}</h2>
                            <p className="estd-content__desc">{estab.desc}</p>
                            <p className="estd-content__desc">
                                Localizado em {estab.city}, CE, o estabelecimento oferece uma
                                experiência autêntica da Serra da Ibiapaba, com atendimento de
                                qualidade e ambiente acolhedor para visitantes de todo o Brasil.
                            </p>

                            <h3 className="estd-features-title">Comodidades e Facilidades</h3>
                            <div className="estd-features">
                                {estab.features.map((f) => (
                                    <span key={f} className="estd-feature">
                                        <span
                                            className="material-symbols-outlined"
                                            aria-hidden="true"
                                            style={{
                                                fontVariationSettings:
                                                    '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 20',
                                            }}
                                        >
                                            {FEATURE_ICONS[f] ?? "check_circle"}
                                        </span>
                                        {f}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <aside className="estd-info-card" aria-label="Informações">
                            <div className="estd-info-card__header">
                                <h3 className="estd-info-card__title">Informações</h3>
                            </div>
                            <div className="estd-info-card__body">
                                <ul className="estd-info-list">
                                    <li className="estd-info-list__item">
                                        <span
                                            className="material-symbols-outlined estd-info-list__icon"
                                            aria-hidden="true"
                                        >
                                            location_on
                                        </span>
                                        <div>
                                            <span className="estd-info-list__label">Endereço</span>
                                            <span className="estd-info-list__value">{estab.address}</span>
                                        </div>
                                    </li>
                                    <li className="estd-info-list__item">
                                        <span
                                            className="material-symbols-outlined estd-info-list__icon"
                                            aria-hidden="true"
                                        >
                                            schedule
                                        </span>
                                        <div>
                                            <span className="estd-info-list__label">Horário</span>
                                            <span className="estd-info-list__value">{estab.hours}</span>
                                        </div>
                                    </li>
                                    <li className="estd-info-list__item">
                                        <span
                                            className="material-symbols-outlined estd-info-list__icon"
                                            aria-hidden="true"
                                        >
                                            call
                                        </span>
                                        <div>
                                            <span className="estd-info-list__label">Telefone</span>
                                            <span className="estd-info-list__value">{estab.phone}</span>
                                        </div>
                                    </li>
                                    <li className="estd-info-list__item">
                                        <span
                                            className="material-symbols-outlined estd-info-list__icon"
                                            aria-hidden="true"
                                        >
                                            payments
                                        </span>
                                        <div>
                                            <span className="estd-info-list__label">Faixa de Preço</span>
                                            <span className="estd-info-list__value">
                                                {PRICE_LABELS[estab.priceLevel]}
                                            </span>
                                        </div>
                                    </li>
                                </ul>
                                <a
                                    href="https://maps.google.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="estd-info-card__maps-btn"
                                >
                                    <span className="material-symbols-outlined" aria-hidden="true">map</span>
                                    Abrir no Google Maps
                                </a>
                            </div>
                        </aside>

                    </div>
                </section>

                {/* ── Recomendados ── */}
                {related.length > 0 && (
                    <section className="estd-related" aria-labelledby="estd-related-title">
                        <div className="estd-related__inner">
                            <div className="estd-related__header">
                                <div>
                                    <h2 id="estd-related-title" className="estd-related__title">
                                        Estabelecimentos Recomendados
                                    </h2>
                                    <p className="estd-related__subtitle">
                                        Outros lugares para visitar na Serra da Ibiapaba
                                    </p>
                                </div>
                                <Link to="/estabelecimentos" className="estd-related__all">
                                    Ver todos
                                    <span className="material-symbols-outlined" aria-hidden="true">
                                        arrow_forward
                                    </span>
                                </Link>
                            </div>
                            <div className="estd-related__grid">
                                {related.map((e) => (
                                    <RelatedCard key={e.id} e={e} />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

            </main>
            <Footer />
        </div>
    );
}
