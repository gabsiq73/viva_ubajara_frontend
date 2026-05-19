import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { restaurantsService } from "../admin/services/restaurantsService";
import { hostPointsService } from "../admin/services/hostPointsService";
import type { RestaurantResponse, HostPointResponse, HostType } from "../admin/types";
import heroFallback from "../assets/images/foto-capa-parque-ubajara.png";
import "./style/Estabelecimento.css";

const HOST_TYPE_LABELS: Record<HostType, string> = {
    HOTEL: "Hotel",
    ROOST: "Pousada",
    HOSTEL: "Hostel",
};

type ApiType = "restaurant" | "hostpoint";

interface EstabData {
    id: string;
    name: string;
    description: string;
    address: string;
    phone?: string;
    email?: string;
    webUrl?: string;
    openingHours?: string;
    avgPrice?: number;
    typeLabel: string;
    features: string[];
    heroImg: string;
    mapsUrl: string;
    bookingUrl?: string;
}

function mapRestaurant(r: RestaurantResponse): EstabData {
    const features: string[] = [];
    if (r.cuisineType) features.push(r.cuisineType);
    if (r.acceptsReservation) features.push("Aceita Reservas");
    if (r.openingHours) features.push(r.openingHours);
    return {
        id: r.id,
        name: r.name,
        description: r.description,
        address: r.address,
        phone: r.phone,
        email: r.email,
        webUrl: r.webUrl,
        openingHours: r.openingHours,
        avgPrice: r.avgPrice,
        typeLabel: "Restaurante",
        features,
        heroImg: r.photos?.[0]?.url ?? heroFallback,
        mapsUrl: r.mapsUrl || `https://maps.google.com/maps?q=${encodeURIComponent(r.address)}`,
    };
}

function mapHostPoint(h: HostPointResponse): EstabData {
    const typeLabel = HOST_TYPE_LABELS[h.hostType] ?? "Hospedagem";
    const features: string[] = [typeLabel];
    if (h.numOfRooms) features.push(`${h.numOfRooms} quartos`);
    if (h.bookingUrl) features.push("Reserva Online");
    return {
        id: h.id,
        name: h.name,
        description: h.description,
        address: h.address,
        phone: h.phone,
        email: h.email,
        webUrl: h.bookingUrl ?? h.webUrl,
        avgPrice: h.avgPrice,
        typeLabel,
        features,
        heroImg: h.photos?.[0]?.url ?? heroFallback,
        mapsUrl: h.mapsUrl || `https://maps.google.com/maps?q=${encodeURIComponent(h.address)}`,
        bookingUrl: h.bookingUrl,
    };
}

interface RelatedItem {
    id: string;
    name: string;
    description: string;
    address: string;
    heroImg: string;
    typeLabel: string;
    apiType: ApiType;
}

function RelatedCard({ item }: { item: RelatedItem }) {
    return (
        <Link to={`/estabelecimentos/${item.id}?apiType=${item.apiType}`} className="estd-rel-card">
            <div className="estd-rel-card__img-wrap">
                <img src={item.heroImg} alt={item.name} className="estd-rel-card__img" loading="lazy" />
                <span className="estd-rel-card__type" data-type={item.typeLabel}>{item.typeLabel}</span>
            </div>
            <div className="estd-rel-card__body">
                <h3 className="estd-rel-card__name">{item.name}</h3>
                <p className="estd-rel-card__city">
                    <span className="material-symbols-outlined" aria-hidden="true">location_on</span>
                    {item.address}
                </p>
                <p className="estd-rel-card__desc">{item.description}</p>
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
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const apiType = (searchParams.get("apiType") ?? "restaurant") as ApiType;

    const [estab, setEstab] = useState<EstabData | null>(null);
    const [related, setRelated] = useState<RelatedItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) { navigate("/estabelecimentos"); return; }

        const fetchDetail = apiType === "restaurant"
            ? restaurantsService.getById(id)
            : hostPointsService.getById(id);

        const fetchRelated = apiType === "restaurant"
            ? restaurantsService.getAll(0, 10)
            : hostPointsService.getAll(0, 10);

        Promise.allSettled([fetchDetail, fetchRelated]).then(([detailResult, allResult]) => {
            if (detailResult.status === "fulfilled") {
                const mapped = apiType === "restaurant"
                    ? mapRestaurant(detailResult.value as RestaurantResponse)
                    : mapHostPoint(detailResult.value as HostPointResponse);
                setEstab(mapped);

                if (allResult.status === "fulfilled") {
                    const others = (allResult.value.content as (RestaurantResponse | HostPointResponse)[])
                        .filter(item => item.id !== id)
                        .slice(0, 3)
                        .map(item => {
                            if (apiType === "restaurant") {
                                const r = item as RestaurantResponse;
                                return { id: r.id, name: r.name, description: r.description, address: r.address, heroImg: r.photos?.[0]?.url ?? heroFallback, typeLabel: "Restaurante", apiType: "restaurant" as ApiType };
                            } else {
                                const h = item as HostPointResponse;
                                return { id: h.id, name: h.name, description: h.description, address: h.address, heroImg: h.photos?.[0]?.url ?? heroFallback, typeLabel: HOST_TYPE_LABELS[h.hostType] ?? "Hospedagem", apiType: "hostpoint" as ApiType };
                            }
                        });
                    setRelated(others);
                }
            } else {
                navigate("/estabelecimentos");
            }
        }).finally(() => setLoading(false));
    }, [id, apiType]);

    if (loading) {
        return (
            <div className="estd-page">
                <Header />
                <main className="estd-main" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
                    <span className="adm-spinner adm-spinner--lg" />
                </main>
                <Footer />
            </div>
        );
    }

    if (!estab) return null;

    return (
        <div className="estd-page">
            <Header />
            <main className="estd-main">

                {/* ── Hero ── */}
                <section className="estd-hero" aria-labelledby="estd-hero-title">
                    <img src={estab.heroImg} alt={estab.name} className="estd-hero__bg" fetchPriority="high" decoding="async" />
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
                            <span className={`estd-hero__type estd-hero__type--${estab.typeLabel}`}>
                                {estab.typeLabel}
                            </span>
                            <h1 id="estd-hero-title" className="estd-hero__title">{estab.name}</h1>
                            {estab.avgPrice != null && (
                                <div className="estd-hero__rating-row">
                                    <span className="estd-hero__price-pill">
                                        R$ {estab.avgPrice.toFixed(0)} / pessoa
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="estd-hero__infobar">
                        <div className="estd-hero__infobar-inner">
                            <span className="estd-info-item">
                                <span className="material-symbols-outlined" aria-hidden="true">location_on</span>
                                {estab.address}
                            </span>
                            {estab.openingHours && (
                                <>
                                    <span className="estd-info-sep" aria-hidden="true">|</span>
                                    <span className="estd-info-item">
                                        <span className="material-symbols-outlined" aria-hidden="true">schedule</span>
                                        {estab.openingHours}
                                    </span>
                                </>
                            )}
                            {estab.phone && (
                                <>
                                    <span className="estd-info-sep" aria-hidden="true">|</span>
                                    <span className="estd-info-item">
                                        <span className="material-symbols-outlined" aria-hidden="true">call</span>
                                        {estab.phone}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* ── Content + Info card ── */}
                <section className="estd-content">
                    <div className="estd-content__inner">

                        <div className="estd-content__left">
                            <span className="estd-content__kicker">SOBRE O ESTABELECIMENTO</span>
                            <h2 className="estd-content__title">Conheça o {estab.name}</h2>
                            <p className="estd-content__desc">{estab.description}</p>
                            <p className="estd-content__desc">
                                Localizado em {estab.address}, o estabelecimento oferece uma
                                experiência autêntica da Serra da Ibiapaba, com atendimento de
                                qualidade e ambiente acolhedor para visitantes de todo o Brasil.
                            </p>

                            {estab.features.length > 0 && (
                                <>
                                    <h3 className="estd-features-title">Comodidades e Facilidades</h3>
                                    <div className="estd-features">
                                        {estab.features.map((f) => (
                                            <span key={f} className="estd-feature">
                                                <span
                                                    className="material-symbols-outlined"
                                                    aria-hidden="true"
                                                    style={{ fontVariationSettings: '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 20' }}
                                                >
                                                    check_circle
                                                </span>
                                                {f}
                                            </span>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <aside className="estd-info-card" aria-label="Informações">
                            <div className="estd-info-card__header">
                                <h3 className="estd-info-card__title">Informações</h3>
                            </div>
                            <div className="estd-info-card__body">
                                <ul className="estd-info-list">
                                    <li className="estd-info-list__item">
                                        <span className="material-symbols-outlined estd-info-list__icon" aria-hidden="true">location_on</span>
                                        <div>
                                            <span className="estd-info-list__label">Endereço</span>
                                            <span className="estd-info-list__value">{estab.address}</span>
                                        </div>
                                    </li>
                                    {estab.openingHours && (
                                        <li className="estd-info-list__item">
                                            <span className="material-symbols-outlined estd-info-list__icon" aria-hidden="true">schedule</span>
                                            <div>
                                                <span className="estd-info-list__label">Horário</span>
                                                <span className="estd-info-list__value">{estab.openingHours}</span>
                                            </div>
                                        </li>
                                    )}
                                    {estab.phone && (
                                        <li className="estd-info-list__item">
                                            <span className="material-symbols-outlined estd-info-list__icon" aria-hidden="true">call</span>
                                            <div>
                                                <span className="estd-info-list__label">Telefone</span>
                                                <span className="estd-info-list__value">{estab.phone}</span>
                                            </div>
                                        </li>
                                    )}
                                    {estab.avgPrice != null && (
                                        <li className="estd-info-list__item">
                                            <span className="material-symbols-outlined estd-info-list__icon" aria-hidden="true">payments</span>
                                            <div>
                                                <span className="estd-info-list__label">Preço Médio</span>
                                                <span className="estd-info-list__value">R$ {estab.avgPrice.toFixed(0)} / pessoa</span>
                                            </div>
                                        </li>
                                    )}
                                    {estab.email && (
                                        <li className="estd-info-list__item">
                                            <span className="material-symbols-outlined estd-info-list__icon" aria-hidden="true">mail</span>
                                            <div>
                                                <span className="estd-info-list__label">E-mail</span>
                                                <a href={`mailto:${estab.email}`} className="estd-info-list__value" style={{ color: "var(--adm-green)" }}>{estab.email}</a>
                                            </div>
                                        </li>
                                    )}
                                </ul>
                                {estab.bookingUrl ? (
                                    <a href={estab.bookingUrl} target="_blank" rel="noopener noreferrer" className="estd-info-card__maps-btn">
                                        <span className="material-symbols-outlined" aria-hidden="true">open_in_new</span>
                                        Fazer Reserva
                                    </a>
                                ) : estab.webUrl ? (
                                    <a href={estab.webUrl} target="_blank" rel="noopener noreferrer" className="estd-info-card__maps-btn">
                                        <span className="material-symbols-outlined" aria-hidden="true">language</span>
                                        Site Oficial
                                    </a>
                                ) : (
                                    <a href={estab.mapsUrl} target="_blank" rel="noopener noreferrer" className="estd-info-card__maps-btn">
                                        <span className="material-symbols-outlined" aria-hidden="true">map</span>
                                        Abrir no Google Maps
                                    </a>
                                )}
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
                                    <h2 id="estd-related-title" className="estd-related__title">Estabelecimentos Recomendados</h2>
                                    <p className="estd-related__subtitle">Outros lugares para visitar na Serra da Ibiapaba</p>
                                </div>
                                <Link to="/estabelecimentos" className="estd-related__all">
                                    Ver todos
                                    <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                                </Link>
                            </div>
                            <div className="estd-related__grid">
                                {related.map((item) => (
                                    <RelatedCard key={item.id} item={item} />
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
