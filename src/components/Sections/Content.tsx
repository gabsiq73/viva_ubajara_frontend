import "./style/Content.components.css"
import "./style/Arrival.css"
import "./style/Gastronomy.css"
import { AgendaItem, AgendaSkeleton } from "./AgendaItem";
import { Link } from "react-router-dom"
import { useEffect, useState, useMemo, useRef, type KeyboardEvent, type ReactNode } from "react"
import paper from "./../../assets/images/paper.webp"
import park from "./../../assets/images/parque.webp";
import food from "./../../assets/images/food.webp";
import cachoeiraAvatar from "./../../assets/images/cachoeira-avatar.webp";
import farm from "./../../assets/images/fazenda.webp";
import fazendaAvatar from "./../../assets/images/fazenda-avatar.webp";
import mercado from "./../../assets/images/mercado.webp";
import mercadoAvatar from "./../../assets/images/mercado-avatar.webp";
import museum from "./../../assets/images/museu.webp";
import { GastronomyShowcase, type GastronomySlide } from "./GastronomyShowcase";
import { gastronomyItemsService } from "../../admin/services/gastronomyItemsService";
import { attractionsService } from "../../admin/services/attractionsService";
import { eventsService } from "../../admin/services/eventsService";
import { restaurantsService } from "../../admin/services/restaurantsService";
import { hostPointsService } from "../../admin/services/hostPointsService";
import { tourGuidesService } from "../../admin/services/tourGuidesService";
import { testimonialsService } from "../../admin/services/testimonialsService";
import type {
    AttractionResponse,
    EventResponse,
    TourGuideResponse,
    TestimonialResponse,
} from "../../admin/types";
import { ArrowRight } from "lucide-react";
import EstablishmentCard from "../ui/EstablishmentCard";
import { Button } from "../ui/Button";
import TornDivider from "../ui/TornDivider";
import { FilterChip } from "../ui/Chip";
import StateBlock from "../ui/StateBlock";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import PointsShowcase from "./PointsShowcase";
import { Skeleton, EstablishmentCardSkeleton } from "../ui/Skeleton";
import {
    ESTABLISHMENT_TYPES,
    TYPE_ICONS,
    mapHostPoint,
    mapRestaurant,
    toFavoriteItem,
    type Establishment,
    type EstablishmentType,
} from "../../utils/establishments";
import { loadFavorites, toggleFavorite } from "../../utils/favorites";
import "../ui/ui.css";

// ── Static icons ───────────────────────────────────────────────
const IconFazer = () => (
    <svg width="26" height="32" viewBox="0 0 22 33" fill="white" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M3.74062 32.25L8.35312 8.925C8.50312 8.2 8.84063 7.65625 9.36563 7.29375C9.89062 6.93125 10.4406 6.75 11.0156 6.75C11.5906 6.75 12.1219 6.875 12.6094 7.125C13.0969 7.375 13.4906 7.75 13.7906 8.25L15.2906 10.65C15.7406 11.375 16.3219 12.0312 17.0344 12.6187C17.7469 13.2062 18.5656 13.6375 19.4906 13.9125V11.25H21.7406V32.25H19.4906V17.025C18.2906 16.75 17.1781 16.3125 16.1531 15.7125C15.1281 15.1125 14.2406 14.375 13.4906 13.5L12.5906 18L15.7406 21V32.25H12.7406V23.25L9.59062 20.25L6.89062 32.25H3.74062ZM4.37813 17.4375L1.19062 16.8375C0.790625 16.7625 0.478125 16.5562 0.253125 16.2188C0.028125 15.8813 -0.046875 15.5 0.028125 15.075L1.15313 9.1875C1.30313 8.3875 1.72812 7.75625 2.42812 7.29375C3.12812 6.83125 3.87812 6.675 4.67812 6.825L6.40312 7.1625L4.37813 17.4375ZM13.4906 6C12.6656 6 11.9594 5.70625 11.3719 5.11875C10.7844 4.53125 10.4906 3.825 10.4906 3C10.4906 2.175 10.7844 1.46875 11.3719 0.88125C11.9594 0.29375 12.6656 0 13.4906 0C14.3156 0 15.0219 0.29375 15.6094 0.88125C16.1969 1.46875 16.4906 2.175 16.4906 3C16.4906 3.825 16.1969 4.53125 15.6094 5.11875C15.0219 5.70625 14.3156 6 13.4906 6Z" />
    </svg>
);
const IconComer = () => (
    <svg width="26" height="30" viewBox="0 0 23 30" fill="white" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M4.5 30V16.275C3.225 15.925 2.15625 15.225 1.29375 14.175C0.43125 13.125 0 11.9 0 10.5V0H3V10.5H4.5V0H7.5V10.5H9V0H12V10.5C12 11.9 11.5688 13.125 10.7063 14.175C9.84375 15.225 8.775 15.925 7.5 16.275V30H4.5ZM19.5 30V18H15V7.5C15 5.425 15.7313 3.65625 17.1938 2.19375C18.6562 0.73125 20.425 0 22.5 0V30H19.5Z" />
    </svg>
);
const IconDormir = () => (
    <svg width="34" height="24" viewBox="0 0 41 28" fill="white" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M0 28V0H3.72727V18.6667H18.6364V3.73333H33.5455C35.5955 3.73333 37.3504 4.46444 38.8102 5.92667C40.2701 7.38889 41 9.14667 41 11.2V28H37.2727V22.4H3.72727V28H0ZM11.1818 16.8C9.62879 16.8 8.30871 16.2556 7.22159 15.1667C6.13447 14.0778 5.59091 12.7556 5.59091 11.2C5.59091 9.64444 6.13447 8.32222 7.22159 7.23333C8.30871 6.14444 9.62879 5.6 11.1818 5.6C12.7348 5.6 14.0549 6.14444 15.142 7.23333C16.2292 8.32222 16.7727 9.64444 16.7727 11.2C16.7727 12.7556 16.2292 14.0778 15.142 15.1667C14.0549 16.2556 12.7348 16.8 11.1818 16.8ZM22.3636 18.6667H37.2727V11.2C37.2727 10.1733 36.9078 9.29445 36.1778 8.56333C35.4479 7.83222 34.5705 7.46667 33.5455 7.46667H22.3636V18.6667ZM11.1818 13.0667C11.7098 13.0667 12.1525 12.8878 12.5097 12.53C12.8669 12.1722 13.0455 11.7289 13.0455 11.2C13.0455 10.6711 12.8669 10.2278 12.5097 9.87C12.1525 9.51222 11.7098 9.33333 11.1818 9.33333C10.6538 9.33333 10.2112 9.51222 9.85398 9.87C9.49678 10.2278 9.31818 10.6711 9.31818 11.2C9.31818 11.7289 9.49678 12.1722 9.85398 12.53C10.2112 12.8878 10.6538 13.0667 11.1818 13.0667Z" />
    </svg>
);
const IconChegar = () => (
    <svg width="26" height="26" viewBox="0 0 27 27" fill="white" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M18 27L9 23.85L2.025 26.55C1.525 26.75 1.0625 26.6938 0.6375 26.3813C0.2125 26.0688 0 25.65 0 25.125V4.125C0 3.8 0.09375 3.5125 0.28125 3.2625C0.46875 3.0125 0.725 2.825 1.05 2.7L9 0L18 3.15L24.975 0.45C25.475 0.25 25.9375 0.30625 26.3625 0.61875C26.7875 0.93125 27 1.35 27 1.875V22.875C27 23.2 26.9062 23.4875 26.7188 23.7375C26.5312 23.9875 26.275 24.175 25.95 24.3L18 27ZM16.5 23.325V5.775L10.5 3.675V21.225L16.5 23.325ZM19.5 23.325L24 21.825V4.05L19.5 5.775V23.325ZM3 22.95L7.5 21.225V3.675L3 5.175V22.95ZM19.5 5.775V23.325V5.775ZM7.5 3.675V21.225V3.675Z" />
    </svg>
);

// ── Static fallback gastronomy slides (used when API returns nothing) ──
const GASTRO_SLIDES_FALLBACK: GastronomySlide[] = [
    { tag: "Cachaça Artesanal", src: food, alt: "Cachaça artesanal e produtos da roça", desc: "Produção artesanal dos alambiques locais, envelhecida em madeira." },
    { tag: "Café de Sombra", src: farm, alt: "Cultivo de café em altitude", desc: "Cafés especiais cultivados na altitude da serra, com sabor suave e aroma marcante." },
    { tag: "Comida Caipira", src: mercado, alt: "Mercado e sabores da cozinha regional", desc: "Pratos fartos com temperos da serra, feitos como nas casas da Ibiapaba." },
    { tag: "Doces Caseiros", src: museum, alt: "Doces e iguarias típicas da região", desc: "Rapadura, doces de leite e de frutas feitos nos engenhos e cozinhas locais." },
];

// Descrição do prato para itens vindos da API, que só trazem nome e foto.
const DISH_DESCRIPTIONS: [RegExp, string][] = [
    [/panelada/i, "Cozido farto de miúdos com temperos da serra, servido com arroz e farinha."],
    [/rapadura/i, "Doce de cana feito nos engenhos da Ibiapaba, puro ou com amendoim."],
    [/peta/i, "Biscoito de polvilho leve e crocante, companheiro do café da tarde."],
    [/cacha[cç]a/i, "Produção artesanal dos alambiques locais, envelhecida em madeira."],
    [/tapioca/i, "Massa de goma fresca com queijo coalho, carne de sol ou doce."],
    [/beiju/i, "Tradição das casas de farinha, com coco ralado e açúcar."],
    [/caf[eé]/i, "Cafés especiais cultivados na altitude da serra, com sabor suave e aroma marcante."],
    [/doce/i, "Doces caseiros feitos nos engenhos e cozinhas locais."],
];
const dishDescription = (name: string) => DISH_DESCRIPTIONS.find(([re]) => re.test(name))?.[1];

const AIRPORTS = [
    { code: "JJD", name: "Aeroporto de Jericoacoara", dist: "165 km" },
    { code: "PHB", name: "Aeroporto de Parnaíba", dist: "190 km" },
    { code: "THE", name: "Aeroporto de Teresina", dist: "280 km" },
    { code: "FOR", name: "Aeroporto de Fortaleza", dist: "320 km" },
];

const ARRIVAL_STEPS = [
    { icon: "flight", title: "De avião", badge: "a partir de 165 km", desc: "Voe para os aeroportos mais próximos e complete a viagem por terra em menos de 3 horas de carro." },
    { icon: "directions_bus", title: "De ônibus", badge: "~6h de Fortaleza", desc: "Linhas regulares com saída de Fortaleza, Teresina e outras cidades da região." },
    { icon: "directions_car", title: "De carro", badge: "~5h de Fortaleza", desc: "Pela BR-222 e CE-187. Estrada asfaltada, sinalizada e com belas paisagens da serra." },
];

// Mapa da região (Ubajara e aeroportos) sem chave de API; o botão abre o mapa completo.
const REGION_MAP_EMBED = "https://www.openstreetmap.org/export/embed.html?bbox=-43.3%2C-5.6%2C-38.0%2C-2.4&layer=mapnik&marker=-3.8567%2C-40.9217";
const UBAJARA_MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Parque+Nacional+de+Ubajara";

interface FaqItem {
    id: string;
    question: string;
    answer: ReactNode;
}

const FAQ_ITEMS: FaqItem[] = [
    {
        id: "onde-fica",
        question: "Onde fica o Parque Nacional de Ubajara?",
        answer: <p>O Parque está localizado na Serra da Ibiapaba, a cerca de 320&nbsp;km de Fortaleza. A entrada principal fica no município de Ubajara, no estado do Ceará.</p>,
    },
    {
        id: "teleferico",
        question: "Qual o horário de funcionamento do teleférico?",
        answer: <p>O teleférico opera de terça a domingo, das 8h às 17h. Às segundas-feiras o Parque permanece fechado para manutenção. Recomendamos chegar cedo para garantir sua entrada.</p>,
    },
    {
        id: "guia",
        question: "É necessário guia para visitar a gruta?",
        answer: <p>Sim, a visita à Gruta de Ubajara é obrigatoriamente acompanhada por condutores locais credenciados pelo ICMBio, garantindo sua segurança e a preservação do ambiente.</p>,
    },
    {
        id: "camping",
        question: "É possível acampar dentro do Parque?",
        answer: <p>O camping é permitido em áreas específicas e requer agendamento prévio junto ao ICMBio. Consulte o site oficial do parque ou entre em contato com nossa secretaria de turismo.</p>,
    },
    {
        id: "como-chegar",
        question: "Como chego a Ubajara?",
        answer: (
            <>
                <p>De avião, você pode voar até os aeroportos de Jericoacoara, Teresina, Fortaleza ou Parnaíba e completar a viagem por terra. De ônibus, há linhas regulares saindo de Fortaleza, Teresina e outras cidades da região. De carro, o acesso é pela BR-222 e pela CE-187, em estrada totalmente asfaltada e sinalizada.</p>
                <p><Link to="/como-chegar" className="faq__link">Ver todas as rotas</Link></p>
            </>
        ),
    },
    {
        id: "comer-hospedar",
        question: "Onde posso comer e me hospedar?",
        answer: (
            <>
                <p>Ubajara tem restaurantes com a gastronomia regional da Ibiapaba, além de pousadas e hotéis integrados à natureza. Veja a lista completa, com fotos e detalhes de cada lugar.</p>
                <p><Link to="/estabelecimentos" className="faq__link">Ver estabelecimentos</Link></p>
            </>
        ),
    },
    {
        id: "divulgar",
        question: "Tenho um restaurante ou pousada. Como divulgo meu negócio?",
        answer: (
            <>
                <p>Faça o cadastro da sua empresa no <span translate="no">Viva Ubajara</span>. Depois de enviado, o cadastro passa pela análise da nossa equipe antes de ser publicado no site.</p>
                <p><Link to="/cadastro-empresa" className="faq__link">Cadastrar minha empresa</Link></p>
            </>
        ),
    },
    {
        id: "contato",
        question: "Como falo com a equipe do parque?",
        answer: (
            <>
                <p>Ligue para <a href="tel:+558836341234" className="faq__link">(88)&nbsp;3634-1234</a> ou escreva para <a href="mailto:contato@vivaubajara.com.br" className="faq__link">contato@vivaubajara.com.br</a>. Você também pode enviar uma mensagem pela página de contato.</p>
                <p><Link to="/contato" className="faq__link">Ir para a página de contato</Link></p>
            </>
        ),
    },
];

// ── Skeleton cards ─────────────────────────────────────────────

const GuideSkeleton = () => (
    <article className="guide-card guide-card--skeleton" aria-hidden="true">
        <div className="guide-card__photo">
            <Skeleton className="pub-skel-fill" radius={0} />
        </div>
        <div className="guide-card__body">
            <div className="guide-card__name">
                <Skeleton width="60%" height={16} />
            </div>
            <div className="guide-card__specialty">
                <Skeleton width="35%" height={11} />
            </div>
            <div className="guide-card__desc">
                <Skeleton width="100%" height={12} />
                <Skeleton width="100%" height={12} />
                <Skeleton width="75%" height={12} />
            </div>
        </div>
    </article>
);

const ReviewSkeleton = () => (
    <article className="review-card" aria-hidden="true" style={{ pointerEvents: "none" }}>
        <div className="skel" style={{ height: 18, width: 100 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
            <div className="skel" style={{ height: 14, width: "100%" }} />
            <div className="skel" style={{ height: 14, width: "85%" }} />
            <div className="skel" style={{ height: 14, width: "70%" }} />
        </div>
        <div className="review-card__author">
            <div className="skel" style={{ width: 42, height: 42, borderRadius: "50%", flexShrink: 0 }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                <div className="skel" style={{ height: 14, width: "60%" }} />
                <div className="skel" style={{ height: 12, width: "40%" }} />
            </div>
        </div>
    </article>
);

// ── Type helpers ───────────────────────────────────────────────
const DAY_FORMAT = new Intl.DateTimeFormat("pt-BR", { day: "2-digit" });
const MONTH_FORMAT = new Intl.DateTimeFormat("pt-BR", { month: "short" });
const DAY_MONTH_LONG_FORMAT = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long" });

// O backend manda dd/MM/yyyy HH:mm:ss; montar a data por partes evita o parse em UTC de "YYYY-MM-DD".
function parseDate(raw: string): Date {
    if (!raw) return new Date(NaN);
    const br = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
    if (br) {
        const [, day, mon, yr, hh = "0", mm = "0", ss = "0"] = br;
        const date = new Date(+yr, +mon - 1, +day, +hh, +mm, +ss);
        return date.getMonth() === +mon - 1 ? date : new Date(NaN);
    }
    const isoDate = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoDate) return new Date(+isoDate[1], +isoDate[2] - 1, +isoDate[3]);
    return new Date(raw);
}

function SectionState({ failed, emptyTitle, emptyIcon, emptyVariant = "empty", onRetry }: {
    failed: boolean;
    emptyTitle: string;
    emptyIcon: string;
    emptyVariant?: "empty" | "notice";
    onRetry: () => void;
}) {
    if (failed) {
        return (
            <StateBlock
                variant="error"
                icon="cloud_off"
                title="Não foi possível carregar esta seção."
                actions={<Button variant="outline" icon="refresh" onClick={onRetry}>Tentar de novo</Button>}
            >
                Verifique sua conexão e tente novamente.
            </StateBlock>
        );
    }
    return <StateBlock variant={emptyVariant} icon={emptyIcon} title={emptyTitle} />;
}

const PUB_LIMIT = 8;
const GASTRO_AUTOPLAY_MS = 5000;
const PUB_FILTER_LABELS: Record<string, string> = {
    Todos: "Todos",
    Restaurante: "Restaurantes",
    Hotel: "Hotéis",
    Pousada: "Pousadas",
    Hostel: "Hostels",
};
const GRID_REVEAL_MS = 900;

function pickPubItems(items: Establishment[], filter: string): Establishment[] {
    if (filter !== "Todos") return items.filter((i) => i.type === filter).slice(0, PUB_LIMIT);
    const restaurants = items.filter((i) => i.type === "Restaurante");
    const lodging = items.filter((i) => i.type !== "Restaurante");
    const mixed: Establishment[] = [];
    for (let i = 0; mixed.length < PUB_LIMIT && (i < restaurants.length || i < lodging.length); i++) {
        if (restaurants[i]) mixed.push(restaurants[i]);
        if (lodging[i] && mixed.length < PUB_LIMIT) mixed.push(lodging[i]);
    }
    return mixed;
}

interface SectionHeaderProps {
    id: string;
    kicker: string;
    title: string;
    subtitle?: string;
    cta?: { to: string; label: string; text?: string };
    onDark?: boolean;
    /** Esconde o botão do cabeçalho no celular (a seção mostra o seu próprio no fim). */
    ctaDesktopOnly?: boolean;
}

function SectionHeader({ id, kicker, title, subtitle, cta, onDark, ctaDesktopOnly }: SectionHeaderProps) {
    return (
        <header className={`sec-head reveal${onDark ? " sec-head--on-dark" : ""}${ctaDesktopOnly ? " sec-head--cta-desktop" : ""}`}>
            <div className="sec-head__text">
                <span className="sec-head__kicker">{kicker}</span>
                <h2 id={id} className="sec-head__title">{title}</h2>
                {subtitle && <p className="sec-head__sub">{subtitle}</p>}
            </div>
            {cta && (
                <Link to={cta.to} className="sec-head__cta" aria-label={cta.label}>
                    {cta.text ?? "Ver todos"}
                    <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                </Link>
            )}
        </header>
    );
}

// ── Fallback review avatars ───────────────────────────────────
const FALLBACK_AVATARS = [cachoeiraAvatar, fazendaAvatar, mercadoAvatar];

export default function Content() {
    const [gastroIndex, setGastroIndex] = useState(0);
    const [gastroSlides, setGastroSlides] = useState<GastronomySlide[]>(GASTRO_SLIDES_FALLBACK);
    const [faqOpen, setFaqOpen] = useState<string | null>(null);
    const faqListRef = useRef<HTMLDivElement>(null);

    // API state
    const [loading, setLoading] = useState(true);
    const [attractions, setAttractions] = useState<AttractionResponse[]>([]);
    const [homeEvents, setHomeEvents] = useState<EventResponse[]>([]);
    const [pubItems, setPubItems] = useState<Establishment[]>([]);
    const [homeGuides, setHomeGuides] = useState<TourGuideResponse[]>([]);
    const [homeReviews, setHomeReviews] = useState<TestimonialResponse[]>([]);
    const [failed, setFailed] = useState({ attractions: false, events: false, establishments: false, guides: false, reviews: false });
    const [reloadKey, setReloadKey] = useState(0);
    const [gastroHover, setGastroHover] = useState(false);
    const [gastroFocus, setGastroFocus] = useState(false);
    const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
    const [pubGuideFilter, setPubGuideFilter] = useState("Todos");
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set(loadFavorites().map((f) => f.id)));

    useEffect(() => {
        gastronomyItemsService.getActive().then((items) => {
            const slides: GastronomySlide[] = items
                .filter(item => item.imageUrl)
                .map(item => ({ tag: item.name, src: item.imageUrl!, alt: item.name, desc: dishDescription(item.name) }));
            if (slides.length > 0) setGastroSlides(slides);
        }).catch(() => {});
    }, []);

    useEffect(() => {
        Promise.allSettled([
            attractionsService.getAll(0, 4, true),
            eventsService.getAll(0, 4, true),
            restaurantsService.getAll(0, PUB_LIMIT),
            hostPointsService.getAll(0, PUB_LIMIT),
            tourGuidesService.getAll(0, 4, true),
            testimonialsService.listApproved(),
        ]).then(([attR, evR, restR, hostR, guideR, testR]) => {
            if (attR.status === "fulfilled") setAttractions(attR.value.content);
            if (evR.status === "fulfilled") setHomeEvents(evR.value.content);
            if (guideR.status === "fulfilled") setHomeGuides(guideR.value.content);
            if (testR.status === "fulfilled") setHomeReviews(testR.value.slice(0, 3));

            const rests = restR.status === "fulfilled"
                ? restR.value.content.filter(r => r.active).map(mapRestaurant) : [];
            const hosts = hostR.status === "fulfilled"
                ? hostR.value.content.filter(h => h.active).map(mapHostPoint) : [];
            setPubItems([...rests, ...hosts]);
            setFailed({
                attractions: attR.status === "rejected",
                events: evR.status === "rejected",
                establishments: restR.status === "rejected" && hostR.status === "rejected",
                guides: guideR.status === "rejected",
                reviews: testR.status === "rejected",
            });
        }).finally(() => setLoading(false));
    }, [reloadKey]);

    const retryLoad = () => {
        setLoading(true);
        setReloadKey((k) => k + 1);
    };

    const gastroPaused = reduceMotion || gastroHover || gastroFocus;

    useEffect(() => {
        if (gastroSlides.length <= 1 || gastroPaused) return;
        const id = window.setInterval(() => {
            setGastroIndex((i) => (i + 1) % gastroSlides.length);
        }, GASTRO_AUTOPLAY_MS);
        return () => window.clearInterval(id);
    }, [gastroSlides, gastroPaused, gastroIndex]);

    useEffect(() => {
        const timers: number[] = [];
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(({ target, isIntersecting }) => {
                    if (!isIntersecting) return;
                    target.classList.add("is-visible");
                    observer.unobserve(target);
                    // Depois da primeira revelação a grade troca de itens só com fade curto, sem escalonar de novo.
                    if (target.classList.contains("grid-reveal")) {
                        timers.push(window.setTimeout(() => target.classList.add("has-revealed"), GRID_REVEAL_MS));
                    }
                });
            },
            { threshold: 0.1, rootMargin: "0px 0px -48px 0px" }
        );
        document.querySelectorAll(".reveal, .grid-reveal").forEach((el) => observer.observe(el));
        return () => {
            observer.disconnect();
            timers.forEach((id) => window.clearTimeout(id));
        };
    }, [loading]);

    const pubCategories = useMemo(() => {
        const present = new Set(pubItems.map(i => i.type));
        return ["Todos", ...ESTABLISHMENT_TYPES.filter(t => present.has(t))];
    }, [pubItems]);

    const filteredPub = useMemo(() => pickPubItems(pubItems, pubGuideFilter), [pubItems, pubGuideFilter]);

    const handleTogglePointFavorite = (item: AttractionResponse) => {
        const nowFavorite = toggleFavorite({
            id: item.id,
            name: item.name,
            type: "attraction",
            photo: item.photos?.[0]?.url,
            shortDescription: item.shortDescription || item.description?.slice(0, 100),
            path: `/pontos/${item.id}`,
        });
        setFavoriteIds((prev) => {
            const next = new Set(prev);
            if (nowFavorite) next.add(item.id);
            else next.delete(item.id);
            return next;
        });
    };

    const handleToggleFavorite = (item: Establishment) => {
        const nowFavorite = toggleFavorite(toFavoriteItem(item));
        setFavoriteIds((prev) => {
            const next = new Set(prev);
            if (nowFavorite) next.add(item.id);
            else next.delete(item.id);
            return next;
        });
    };

    const handleFaqKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
        if (!keys.includes(e.key) || !(e.target instanceof HTMLButtonElement)) return;
        const buttons = Array.from(faqListRef.current?.querySelectorAll<HTMLButtonElement>(".faq__question") ?? []);
        const current = buttons.indexOf(e.target);
        if (current === -1) return;
        e.preventDefault();
        const next =
            e.key === "Home" ? 0
            : e.key === "End" ? buttons.length - 1
            : e.key === "ArrowDown" ? (current + 1) % buttons.length
            : (current - 1 + buttons.length) % buttons.length;
        buttons[next].focus();
    };

    return (
        <section className="section">
            <div className="paper"><img src={paper} alt="" width={3660} height={856} decoding="async" /></div>
            <div className="fundo">

                {/* ── Quick nav cards ── */}
                <div className="cards">
                    <ul className="list-cards">
                        <li id="fazer">
                            <Link to="/pontos-turisticos" className="info-card__link" aria-label="Ver o que fazer em Ubajara">
                                <div className="info-card__icon"><IconFazer /></div>
                                <div className="info-card__content">
                                    <h3 className="info-card__title">O que fazer</h3>
                                    <p className="info-card__text">Trilhas ecológicas, mirantes de tirar o fôlego e o famoso teleférico</p>
                                </div>
                                <span className="info-card__arrow" aria-hidden="true"><ArrowRight size={15} strokeWidth={2.2} /></span>
                            </Link>
                        </li>
                        <li id="comer">
                            <Link to="/estabelecimentos?tipo=Restaurante" className="info-card__link" aria-label="Ver onde comer em Ubajara">
                                <div className="info-card__icon"><IconComer /></div>
                                <div className="info-card__content">
                                    <h3 className="info-card__title">Onde Comer</h3>
                                    <p className="info-card__text">A melhor gastronomia da Ibiapaba, com temperos regionais e requinte.</p>
                                </div>
                                <span className="info-card__arrow" aria-hidden="true"><ArrowRight size={15} strokeWidth={2.2} /></span>
                            </Link>
                        </li>
                        <li id="dormir">
                            <Link to="/estabelecimentos?tipo=Pousada" className="info-card__link" aria-label="Ver onde dormir em Ubajara">
                                <div className="info-card__icon"><IconDormir /></div>
                                <div className="info-card__content">
                                    <h3 className="info-card__title">Onde Dormir</h3>
                                    <p className="info-card__text">Pousadas charmosas e hotéis integrados à natureza para seu descanso.</p>
                                </div>
                                <span className="info-card__arrow" aria-hidden="true"><ArrowRight size={15} strokeWidth={2.2} /></span>
                            </Link>
                        </li>
                        <li id="chegar">
                            <Link to="/como-chegar" className="info-card__link" aria-label="Ver como chegar em Ubajara">
                                <div className="info-card__icon"><IconChegar /></div>
                                <div className="info-card__content">
                                    <h3 className="info-card__title">Como Chegar</h3>
                                    <p className="info-card__text">Rotas aéreas e terrestres para chegar ao paraíso serrano com segurança.</p>
                                </div>
                                <span className="info-card__arrow" aria-hidden="true"><ArrowRight size={15} strokeWidth={2.2} /></span>
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* ── Pontos Turísticos ── */}
                <section className="point" aria-labelledby="pontos-title">
                    <div className="point-container">
                        <SectionHeader
                            id="pontos-title"
                            kicker="Experiências Únicas"
                            title="Pontos Turísticos"
                            subtitle="Cachoeiras, trilhas, fazendas e mercados para viver a serra de perto."
                            cta={{ to: "/pontos-turisticos", label: "Ver todos os pontos turísticos", text: "Ver todos os pontos" }}
                            ctaDesktopOnly
                        />
                        <PointsShowcase
                            items={failed.attractions ? [] : attractions}
                            loading={loading}
                            favoriteIds={favoriteIds}
                            onToggleFavorite={handleTogglePointFavorite}
                            moreTo="/pontos-turisticos"
                            moreLabel="Ver todos os pontos"
                            fallback={<SectionState failed={failed.attractions} emptyTitle="Nenhum ponto turístico cadastrado por enquanto." emptyIcon="landscape" onRetry={retryLoad} />}
                        />
                    </div>
                </section>

                {/* ── Gastronomia ── */}
                <div className="top-n torn-host">
                    <TornDivider edge="top" fill="#a87219" />
                    <div className="news">
                        <div
                            onPointerEnter={(e) => { if (e.pointerType === "mouse") setGastroHover(true); }}
                            onPointerLeave={(e) => { if (e.pointerType === "mouse") setGastroHover(false); }}
                            onFocus={() => setGastroFocus(true)}
                            onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setGastroFocus(false); }}
                        >
                            <GastronomyShowcase
                                slides={gastroSlides}
                                activeIndex={gastroIndex}
                                onActiveChange={setGastroIndex}
                                paused={gastroPaused}
                                autoplayMs={GASTRO_AUTOPLAY_MS}
                                header={
                                    <SectionHeader
                                        id="gastro-title"
                                        kicker="Sabores da Ibiapaba"
                                        title="Gastronomia Regional"
                                        subtitle="A altitude de Ubajara favorece cafés especiais e iguarias que você só encontra aqui."
                                        onDark
                                    />
                                }
                            />
                        </div>
                    </div>
                    <TornDivider edge="bottom" fill="#a87219" />
                </div>

                {/* ── Guia + Eventos ── */}
                <div className="pub-landing-blocks">

                    {/* Estabelecimentos */}
                    <section className="pub-guide" aria-labelledby="pub-guide-title">
                        <SectionHeader
                            id="pub-guide-title"
                            kicker="Onde comer e dormir"
                            title="Guia de Estabelecimentos"
                            subtitle="Os melhores lugares para comer, dormir e viver momentos inesquecíveis em nossa cidade."
                            cta={{ to: "/estabelecimentos", label: "Ver todos os estabelecimentos" }}
                            ctaDesktopOnly
                        />
                        {loading ? (
                            <>
                                <div className="pub-guide__filters" aria-hidden="true">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <Skeleton key={i} width={88} height={36} radius={50} />
                                    ))}
                                </div>
                                <div className="pub-guide__grid">
                                    {Array.from({ length: PUB_LIMIT }).map((_, i) => <EstablishmentCardSkeleton key={i} />)}
                                </div>
                            </>
                        ) : failed.establishments || pubItems.length === 0 ? (
                            <SectionState failed={failed.establishments} emptyTitle="Nenhum estabelecimento cadastrado por enquanto." emptyIcon="storefront" onRetry={retryLoad} />
                        ) : (
                            <>
                                <div className="pub-guide__filters" role="group" aria-label="Filtrar por tipo">
                                    {pubCategories.map((label) => (
                                        <FilterChip
                                            key={label}
                                            label={PUB_FILTER_LABELS[label] ?? label}
                                            icon={label === "Todos" ? "grid_view" : TYPE_ICONS[label as EstablishmentType]}
                                            count={label === "Todos" ? pubItems.length : pubItems.filter((i) => i.type === label).length}
                                            selected={pubGuideFilter === label}
                                            onClick={() => setPubGuideFilter(label)}
                                        />
                                    ))}
                                </div>
                                <div className="pub-guide__grid grid-reveal">
                                    {filteredPub.map((item) => (
                                        <EstablishmentCard
                                            key={`${item.apiType}-${item.id}`}
                                            item={item}
                                            variant="showcase"
                                            favorite={favoriteIds.has(item.id)}
                                            onToggleFavorite={handleToggleFavorite}
                                        />
                                    ))}
                                </div>
                                <Link to="/estabelecimentos" className="sec-head__cta sec-more">
                                    Ver todos
                                    <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                                </Link>
                            </>
                        )}
                    </section>

                    {/* Eventos */}
                    <section className="agenda" aria-labelledby="pub-events-title">
                        <div className="agenda__inner">
                            <header className="agenda__head reveal">
                                <span className="sec-head__kicker">Experiências Inesquecíveis</span>
                                <h2 id="pub-events-title" className="sec-head__title">Próximos Eventos</h2>
                                <p className="sec-head__sub">A programação cultural e os festivais que movimentam a serra.</p>
                                <Link to="/eventos" className="sec-head__cta">
                                    Ver agenda completa
                                    <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                                </Link>
                            </header>
                            {loading ? (
                                <ul className="agenda__list" aria-hidden="true">
                                    {Array.from({ length: 4 }).map((_, i) => <AgendaSkeleton key={i} />)}
                                </ul>
                            ) : failed.events || homeEvents.length === 0 ? (
                                <SectionState failed={failed.events} emptyTitle="Nenhum evento agendado por enquanto." emptyIcon="event" onRetry={retryLoad} />
                            ) : (
                                <ul className="agenda__list grid-reveal">
                                    {homeEvents.map((ev) => {
                                        const d = parseDate(ev.startDateTime);
                                        const valid = !isNaN(d.getTime());
                                        const day = valid ? DAY_FORMAT.format(d) : "—";
                                        const month = valid ? MONTH_FORMAT.format(d).replace(".", "") : "—";
                                        return (
                                            <li key={ev.id}>
                                                <AgendaItem
                                                    id={ev.id}
                                                    name={ev.name}
                                                    description={ev.description}
                                                    location={ev.location}
                                                    photo={ev.photos?.[0]?.url}
                                                    day={day}
                                                    month={month}
                                                    longDate={valid ? DAY_MONTH_LONG_FORMAT.format(d) : undefined}
                                                />
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </section>
                </div>

                {/* ── Guias Turísticos ── */}
                <div className="tour-guides-wrap">
                    <section id="guias-de-turismo" className="tour-guides" aria-labelledby="tour-guides-title">
                        <SectionHeader
                            id="tour-guides-title"
                            kicker="Seu passeio em boas mãos"
                            title="Nossos Guias Turísticos"
                            subtitle="Conheça os profissionais credenciados que vão transformar sua visita em uma experiência inesquecível."
                        />
                        {loading ? (
                            <div className="tour-guides__grid">
                                {Array.from({ length: 4 }).map((_, i) => <GuideSkeleton key={i} />)}
                            </div>
                        ) : failed.guides || homeGuides.length === 0 ? (
                            <SectionState failed={failed.guides} emptyTitle="Nenhum guia cadastrado por enquanto." emptyIcon="hiking" onRetry={retryLoad} />
                        ) : (
                            <div className="tour-guides__grid grid-reveal">
                                {homeGuides.map((guide) => (
                                    <article key={guide.id} className="guide-card">
                                        <div className="guide-card__photo">
                                            <img src={guide.photos?.[0]?.url || park} alt={guide.name} width={640} height={480} loading="lazy" decoding="async" />
                                            {guide.languages && guide.languages.length > 0 && (
                                                <span className="guide-card__lang">{guide.languages.join(" / ")}</span>
                                            )}
                                        </div>
                                        <div className="guide-card__body">
                                            <h3 className="guide-card__name" title={guide.name}>{guide.name}</h3>
                                            <span className="guide-card__specialty">Guia Turístico</span>
                                            <p className="guide-card__desc">{guide.description}</p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* ── Como Chegar ── */}
                <section className="arrival" aria-labelledby="como-chegar-title">
                    <div className="arrival__inner">
                        <div className="arrival__main">
                            <SectionHeader
                                id="como-chegar-title"
                                kicker="Planejando sua visita"
                                title="Como Chegar"
                                subtitle="Ubajara fica na Serra da Ibiapaba, acessível por rotas aéreas e terrestres. Escolha seu ponto de partida."
                                onDark
                            />
                            <ol className="arrival__steps grid-reveal">
                                {ARRIVAL_STEPS.map((step) => (
                                    <li key={step.title} className="arrival__step">
                                        <span className="arrival__step-icon" aria-hidden="true">
                                            <span className="material-symbols-outlined">{step.icon}</span>
                                        </span>
                                        <div className="arrival__card">
                                            <div className="arrival__card-head">
                                                <h3 className="arrival__card-title">{step.title}</h3>
                                                <span className="arrival__card-badge">{step.badge}</span>
                                            </div>
                                            <p className="arrival__card-desc">{step.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <div className="arrival__map">
                            <div className="arrival__map-frame">
                                <iframe
                                    className="arrival__map-embed"
                                    title="Mapa da região: Ubajara e os aeroportos mais próximos"
                                    src={REGION_MAP_EMBED}
                                    loading="lazy"
                                    referrerPolicy="no-referrer"
                                    tabIndex={-1}
                                />
                                <a className="arrival__map-credit" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap</a>
                                <span className="arrival__map-pill">
                                    <span className="material-symbols-outlined" aria-hidden="true">location_on</span>
                                    Ubajara, CE
                                </span>
                            </div>
                            <div className="arrival__airports">
                                <div className="arrival__airports-head">
                                    <h3 className="arrival__airports-title">
                                        <span className="material-symbols-outlined" aria-hidden="true">flight</span>
                                        Aeroportos mais próximos
                                    </h3>
                                    <a href={UBAJARA_MAPS_URL} className="arrival__map-link arrival__map-link--text" target="_blank" rel="noopener noreferrer">
                                        Abrir no mapa
                                        <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                                    </a>
                                </div>
                                <ul className="arrival__airport-list grid-reveal">
                                    {AIRPORTS.map((ap) => (
                                        <li key={ap.code} className="arrival__airport">
                                            <span className="arrival__airport-code">{ap.code}</span>
                                            <p className="arrival__airport-name">{ap.name}</p>
                                            <p className="arrival__airport-dist">{ap.dist}</p>
                                        </li>
                                    ))}
                                </ul>
                                <a href={UBAJARA_MAPS_URL} className="arrival__map-link arrival__map-link--button" target="_blank" rel="noopener noreferrer">
                                    Abrir no mapa
                                    <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Depoimentos ── */}
                <div className="reviews-block torn-host">
                    <TornDivider edge="top" fill="#002a27" />
                    <section className="reviews" aria-labelledby="reviews-title">
                        <div className="reviews__inner">
                            <SectionHeader
                                id="reviews-title"
                                kicker="Quem já visitou recomenda"
                                title="O que dizem os visitantes"
                                subtitle="Experiências reais de quem já se encantou com as belezas de Ubajara."
                                cta={{ to: "/depoimentos", label: "Ver todos os depoimentos" }}
                                onDark
                            />
                            {loading ? (
                                <div className="reviews__grid">
                                    {Array.from({ length: 3 }).map((_, i) => <ReviewSkeleton key={i} />)}
                                </div>
                            ) : failed.reviews || homeReviews.length === 0 ? (
                                <SectionState failed={failed.reviews} emptyTitle="Ainda não há depoimentos publicados." emptyIcon="rate_review" emptyVariant="notice" onRetry={retryLoad} />
                            ) : (
                                <div className="reviews__grid grid-reveal">
                                    {homeReviews.map((r, i) => (
                                        <article key={r.id} className="review-card">
                                            <div className="review-card__stars" role="img" aria-label={`${r.rating} de 5 estrelas`}>
                                                <span aria-hidden="true">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                                            </div>
                                            <p className="review-card__text">“{r.comment}”</p>
                                            <div className="review-card__author">
                                                <img
                                                    src={r.userPhoto || FALLBACK_AVATARS[i % FALLBACK_AVATARS.length]}
                                                    alt={r.userName}
                                                    className="review-card__avatar"
                                                    width={42}
                                                    height={42}
                                                    loading="lazy"
                                                    decoding="async"
                                                />
                                                <div className="review-card__info">
                                                    <strong className="review-card__name">{r.userName}</strong>
                                                    <span className="review-card__location">Visitante</span>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                    <TornDivider edge="bottom" fill="#002a27" />
                </div>

                {/* ── FAQ ── */}
                <section className="faq" aria-labelledby="faq-title">
                    <div className="faq__inner">
                        <header className="faq__intro reveal">
                            <span className="faq__kicker">Tire suas dúvidas</span>
                            <h2 id="faq-title" className="faq__title">Dúvidas Frequentes</h2>
                            <p className="faq__lede">As respostas para as perguntas mais comuns de quem planeja visitar o Parque e a cidade de Ubajara.</p>
                        </header>
                        <div className="faq__list reveal" ref={faqListRef} onKeyDown={handleFaqKeyDown}>
                            {FAQ_ITEMS.map((item) => {
                                const open = faqOpen === item.id;
                                return (
                                    <div key={item.id} className={`faq__item${open ? " faq__item--open" : ""}`}>
                                        <h3 className="faq__heading">
                                            <button
                                                type="button"
                                                id={`faq-question-${item.id}`}
                                                className="faq__question"
                                                onClick={() => setFaqOpen(open ? null : item.id)}
                                                aria-expanded={open}
                                                aria-controls={`faq-answer-${item.id}`}
                                            >
                                                <span className="faq__question-text">{item.question}</span>
                                                <span className="faq__icon" aria-hidden="true">
                                                    <span className="material-symbols-outlined">add</span>
                                                </span>
                                            </button>
                                        </h3>
                                        <div
                                            id={`faq-answer-${item.id}`}
                                            className="faq__answer"
                                            role="region"
                                            aria-labelledby={`faq-question-${item.id}`}
                                            inert={!open}
                                        >
                                            <div className="faq__answer-inner">
                                                <div className="faq__answer-body">{item.answer}</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="faq__more reveal">
                            <div className="faq__more-text">
                                <strong>Não encontrou o que procurava?</strong>
                                <span>Fale com a nossa equipe e tire sua dúvida.</span>
                            </div>
                            <Link to="/contato" className="faq__more-btn">Falar com a equipe</Link>
                        </div>
                    </div>
                </section>

            </div>
        </section>
    );
}
