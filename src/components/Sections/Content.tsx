import "./style/Content.components.css"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import paper from "./../../assets/images/paper.png"
import cac from "./../../assets/images/cachoeira.png";
import farm from "./../../assets/images/fazenda.png";
import mercado from "./../../assets/images/mercado.png";
import museum from "./../../assets/images/museu.png";
import park from "./../../assets/images/parque.png";
import route from "./../../assets/images/route.png";
import food from "./../../assets/images/food.png";
import { GastronomyCarousel, type GastronomySlide } from "./GastronomyCarousel";

const GASTRO_SLIDES: GastronomySlide[] = [
    { tag: "Cachaça Artesanal", src: food, alt: "Cachaça artesanal e produtos da roça" },
    { tag: "Café de Sombra", src: farm, alt: "Cultivo de café em altitude" },
    { tag: "Comida Caipira", src: mercado, alt: "Mercado e sabores da cozinha regional" },
    { tag: "Doces Caseiros", src: museum, alt: "Doces e iguarias típicas da região" },
];

const PUB_GUIDE_FILTERS = [
    "Todos",
    "Restaurantes",
    "Pousadas",
    "Lanchonetes",
    "Açaiterias",
    "Mercantis",
    "Artesanato",
] as const;

const PUB_GUIDE_TAG_COLORS: Record<string, string> = {
    Restaurantes: "#006B32",
    Pousadas: "#304FCD",
    Lanchonetes: "#8B4513",
    Açaiterias: "#0d7a6f",
    Mercantis: "#5c4d7a",
    Artesanato: "#C58B24",
};

const PUB_GUIDE_ITEMS = [
    {
        id: 1,
        category: "Restaurantes",
        title: "Varanda da Serra",
        rating: 4.9,
        desc: "Culinária regional com vista panorâmica da Chapada e temperos da horta local.",
        img: food,
    },
    {
        id: 2,
        category: "Pousadas",
        title: "Pousada Verde Vale",
        rating: 4.8,
        desc: "Aconchego rústico entre jardins e café da manhã com produtos da região.",
        img: farm,
    },
    {
        id: 3,
        category: "Artesanato",
        title: "Casa do Artesanato",
        rating: 4.7,
        desc: "Peças únicas de cerâmica e tecelagem feitas por artesãos de Ubajara.",
        img: museum,
    },
    {
        id: 4,
        category: "Açaiterias",
        title: "Açaí da Ibiapaba",
        rating: 4.9,
        desc: "Polpas cremosas e combinações frescas para refrescar após um passeio.",
        img: mercado,
    },
];

const PUB_EVENTS = [
    {
        id: 1,
        day: "12",
        month: "AGO",
        title: "Festival de Jazz na Serra",
        desc: "Noites de música ao ar livre com artistas regionais e gastronomia local.",
        place: "Praça da Matriz",
        img: park,
    },
    {
        id: 2,
        day: "25",
        month: "SET",
        title: "Feira de Sabores da Ibiapaba",
        desc: "Degustação de doces, cafés e cachaças artesanais com oficinas culturais.",
        place: "Mercado Público",
        img: mercado,
    },
    {
        id: 3,
        day: "10",
        month: "OUT",
        title: "Trilha do Nascer da Lua",
        desc: "Caminhada guiada ao amanhecer com vistas do vale e contação de histórias.",
        place: "Parque Nacional",
        img: route,
    },
    {
        id: 4,
        day: "05",
        month: "NOV",
        title: "Noite de Forró na Serra",
        desc: "Ritmos e comidas típicas em uma noite animada de festa regional.",
        place: "Praça do Forró",
        img: food,
    },
];

const AIRPORTS = [
    { code: "JJD", name: "Aeroporto de Jericoacoara", dist: "165 km de distância" },
    { code: "THE", name: "Aeroporto de Teresina", dist: "280 km de distância" },
    { code: "FOR", name: "Aeroporto de Fortaleza", dist: "320 km de distância" },
    { code: "PHB", name: "Aeroporto de Parnaíba", dist: "190 km de distância" },
];

const REVIEWS = [
    {
        id: 1,
        stars: 5,
        text: "O teleférico é uma experiência única! Ver a mata lá de cima e depois entrar na gruta foi um dos momentos mais incríveis da minha vida.",
        name: "Mariana Silva",
        location: "Fortaleza, CE",
        avatar: cac,
    },
    {
        id: 2,
        stars: 5,
        text: "Cidade acolhedora, povo simpático e a comida de tirar o fôlego. As trilhas são muito bem cuidadas. Recomendo demais!",
        name: "Ricardo Goulart",
        location: "São Paulo, SP",
        avatar: farm,
    },
    {
        id: 3,
        stars: 4,
        text: "O Parque Nacional é um tesouro. A estrutura para os turistas é ótima e os condutores são muito bem preparados. Ubajara é mágica.",
        name: "Juliana Mendes",
        location: "Teresina, PI",
        avatar: mercado,
    },
];

export default function Content(){
    const [gastroIndex, setGastroIndex] = useState(0);
    const [pubGuideFilter, setPubGuideFilter] = useState<string>("Todos");

    useEffect(() => {
        if (GASTRO_SLIDES.length <= 1) return;
        const id = window.setInterval(() => {
            setGastroIndex((i) => (i + 1) % GASTRO_SLIDES.length);
        }, 4500);
        return () => window.clearInterval(id);
    }, []);

    return(
        <section className="section">
            <div className="paper">
                <img src={paper}/>
            </div>
            <div className="fundo">
                <div className="cards">
                    <ul className="list-cards">
                        <li id="fazer">
                            <div id="icon">
                                <svg width="22" height="33" viewBox="0 0 22 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3.74062 32.25L8.35312 8.925C8.50312 8.2 8.84063 7.65625 9.36563 7.29375C9.89062 6.93125 10.4406 6.75 11.0156 6.75C11.5906 6.75 12.1219 6.875 12.6094 7.125C13.0969 7.375 13.4906 7.75 13.7906 8.25L15.2906 10.65C15.7406 11.375 16.3219 12.0312 17.0344 12.6187C17.7469 13.2062 18.5656 13.6375 19.4906 13.9125V11.25H21.7406V32.25H19.4906V17.025C18.2906 16.75 17.1781 16.3125 16.1531 15.7125C15.1281 15.1125 14.2406 14.375 13.4906 13.5L12.5906 18L15.7406 21V32.25H12.7406V23.25L9.59062 20.25L6.89062 32.25H3.74062ZM4.37813 17.4375L1.19062 16.8375C0.790625 16.7625 0.478125 16.5562 0.253125 16.2188C0.028125 15.8813 -0.046875 15.5 0.028125 15.075L1.15313 9.1875C1.30313 8.3875 1.72812 7.75625 2.42812 7.29375C3.12812 6.83125 3.87812 6.675 4.67812 6.825L6.40312 7.1625L4.37813 17.4375ZM13.4906 6C12.6656 6 11.9594 5.70625 11.3719 5.11875C10.7844 4.53125 10.4906 3.825 10.4906 3C10.4906 2.175 10.7844 1.46875 11.3719 0.88125C11.9594 0.29375 12.6656 0 13.4906 0C14.3156 0 15.0219 0.29375 15.6094 0.88125C16.1969 1.46875 16.4906 2.175 16.4906 3C16.4906 3.825 16.1969 4.53125 15.6094 5.11875C15.0219 5.70625 14.3156 6 13.4906 6Z" fill="white"/>
                                </svg>
                            </div>
                            <div className="title">
                                <h3>
                                    O que fazer
                                </h3>
                            </div>
                            <div className="text">
                                <p>
                                    Trilhas ecológicas, mirantes de tirar o fôlego e o famoso teleférico
                                </p>
                            </div>
                        </li>
                        <li id="comer">
                            <div id="icon">
                                <svg width="23" height="30" viewBox="0 0 23 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4.5 30V16.275C3.225 15.925 2.15625 15.225 1.29375 14.175C0.43125 13.125 0 11.9 0 10.5V0H3V10.5H4.5V0H7.5V10.5H9V0H12V10.5C12 11.9 11.5688 13.125 10.7063 14.175C9.84375 15.225 8.775 15.925 7.5 16.275V30H4.5ZM19.5 30V18H15V7.5C15 5.425 15.7313 3.65625 17.1938 2.19375C18.6562 0.73125 20.425 0 22.5 0V30H19.5Z" fill="white"/>
                                </svg>
                            </div>
                            <div className="title">
                                <h3>
                                    Onde Comer
                                </h3>
                            </div>
                            <div className="text">
                                <p>
                                    A melhor gastronomia da Ibiapaba, com temperos regionais e requinte.
                                </p>
                            </div>
                        </li>
                        <li id="dormir">
                            <div id="icon">
                                <svg width="41" height="28" viewBox="0 0 41 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0 28V0H3.72727V18.6667H18.6364V3.73333H33.5455C35.5955 3.73333 37.3504 4.46444 38.8102 5.92667C40.2701 7.38889 41 9.14667 41 11.2V28H37.2727V22.4H3.72727V28H0ZM11.1818 16.8C9.62879 16.8 8.30871 16.2556 7.22159 15.1667C6.13447 14.0778 5.59091 12.7556 5.59091 11.2C5.59091 9.64444 6.13447 8.32222 7.22159 7.23333C8.30871 6.14444 9.62879 5.6 11.1818 5.6C12.7348 5.6 14.0549 6.14444 15.142 7.23333C16.2292 8.32222 16.7727 9.64444 16.7727 11.2C16.7727 12.7556 16.2292 14.0778 15.142 15.1667C14.0549 16.2556 12.7348 16.8 11.1818 16.8ZM22.3636 18.6667H37.2727V11.2C37.2727 10.1733 36.9078 9.29445 36.1778 8.56333C35.4479 7.83222 34.5705 7.46667 33.5455 7.46667H22.3636V18.6667ZM11.1818 13.0667C11.7098 13.0667 12.1525 12.8878 12.5097 12.53C12.8669 12.1722 13.0455 11.7289 13.0455 11.2C13.0455 10.6711 12.8669 10.2278 12.5097 9.87C12.1525 9.51222 11.7098 9.33333 11.1818 9.33333C10.6538 9.33333 10.2112 9.51222 9.85398 9.87C9.49678 10.2278 9.31818 10.6711 9.31818 11.2C9.31818 11.7289 9.49678 12.1722 9.85398 12.53C10.2112 12.8878 10.6538 13.0667 11.1818 13.0667Z" fill="white"/>
                                </svg>
                            </div>
                            <div className="title">
                                <h3>
                                    Onde Dormir
                                </h3>
                            </div>
                            <div className="text">
                                <p>
                                    Pousadas charmosas e hotéis integrados à natureza para seu descanso.
                                </p>
                            </div>
                        </li>
                        <li id="chegar">
                            <div id="icon">
                                <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 27L9 23.85L2.025 26.55C1.525 26.75 1.0625 26.6938 0.6375 26.3813C0.2125 26.0688 0 25.65 0 25.125V4.125C0 3.8 0.09375 3.5125 0.28125 3.2625C0.46875 3.0125 0.725 2.825 1.05 2.7L9 0L18 3.15L24.975 0.45C25.475 0.25 25.9375 0.30625 26.3625 0.61875C26.7875 0.93125 27 1.35 27 1.875V22.875C27 23.2 26.9062 23.4875 26.7188 23.7375C26.5312 23.9875 26.275 24.175 25.95 24.3L18 27ZM16.5 23.325V5.775L10.5 3.675V21.225L16.5 23.325ZM19.5 23.325L24 21.825V4.05L19.5 5.775V23.325ZM3 22.95L7.5 21.225V3.675L3 5.175V22.95ZM19.5 5.775V23.325V5.775ZM7.5 3.675V21.225V3.675Z" fill="white"/>
                                </svg>
                            </div>
                            <div className="title">
                                <h3>
                                    Como Chegar
                                </h3>
                            </div>
                            <div className="text">
                                <p>
                                    Rotas aéreas e terrestres para chegar ao paraíso serrano com segurança.
                                </p>
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="point">
                    <div className="point-container">
                        <div className="section-header">
                            <div className="title-group">
                                <span className="subtitle">Experiências Únicas</span>
                                <h1>Pontos Turísticos</h1>
                            </div>

                            <div id="more">
                                <Link to="/">
                                    Ver Todos
                                
                                </Link>
                            </div>
                        </div>
                        <div className="cards-points">
                            <ul className="list-points">
                                <li>
                                    <div className="hover-overlay">
                                        <Link to="/" className="saiba-mais-btn">Ver mais</Link>
                                    </div>
                                    <div className="type" style={{background: "#006B32"}}>
                                        <span>Natureza</span>
                                    </div>
                                    <div className="imagem-tour">
                                        <img src={cac} alt="Cachoeira do Frade" />
                                    </div>
                                    <div className="info-tour">
                                        <h2>Cachoeira do Frade</h2>
                                        <p>Uma queda d'água refrescante escondida entre paredões de rocha e mata atlântica.</p>
                                    </div>
                                </li>
                                <li>
                                    <div className="hover-overlay">
                                        <Link to="/" className="saiba-mais-btn">Ver mais</Link>
                                    </div>
                                    <div className="type" style={{background: "#006B32"}}>
                                        <span>Natureza</span>
                                    </div>
                                    <div className="imagem-tour">
                                        <img src={farm} alt="Fazenda Santo Expedito" />
                                    </div>
                                    <div className="info-tour">
                                        <h2>Fazenda Santo Expedito</h2>
                                        <p>Um dos maiores polos de produção de rosas híbridas do Brasil e referência em turismo rural sustentável.</p>
                                    </div>
                                </li>
                                <li>
                                    <div className="hover-overlay">
                                        <Link to="/" className="saiba-mais-btn">Ver mais</Link>
                                    </div>
                                    <div className="type" style={{background: "#C58B24"}}>
                                        <span>Cultura</span>
                                    </div>
                                    <div className="imagem-tour">
                                        <img src={mercado} alt="Mercado Público" />
                                    </div>
                                    <div className="info-tour">
                                        <h2>Mercado Público</h2>
                                        <p>O coração pulsante da cidade, onde você encontra o melhor artesanato e produtos locais.</p>
                                    </div>
                                </li>
                                <li>
                                    <div className="hover-overlay">
                                        <Link to="/" className="saiba-mais-btn">Ver mais</Link>
                                    </div>
                                    <div className="type" style={{background: "#304FCD"}}>
                                        <span>História</span>
                                    </div>
                                    <div className="imagem-tour">
                                        <img src={museum} alt="Museu JK" />
                                    </div>
                                    <div className="info-tour">
                                        <h2>Museu JK</h2>
                                        <p>Um mergulho na história e memórias preservadas em um casarão de época restaurado.</p>
                                    </div>
                                </li>
                            </ul>
                        
                        </div>
                    </div>
                </div>
                <div className="top-n">
                    <div className="papel">
                        <div className="paper1">
                            <img src={paper} alt="papel" />
                        </div>
                        <div className="paper2">
                            <img src={paper} alt="papel" />
                        </div>
                    </div>
                    <div className="news">
                        <div className="news-inner">
                        <div className="caixa">
                            <GastronomyCarousel
                                slides={GASTRO_SLIDES}
                                activeIndex={gastroIndex}
                                onActiveChange={setGastroIndex}
                            />
                        </div>
                        <div className="text-n">
                            <h2>Sabores da Ibiapaba</h2>
                            <h1>Gastronomia Regional</h1>

                            <div className="protect">
                                <ul>
                                    {GASTRO_SLIDES.map((slide, i) => (
                                        <li key={slide.tag}>
                                            <button
                                                type="button"
                                                className={`protect-chip${i === gastroIndex ? " is-active" : ""}`}
                                                onClick={() => setGastroIndex(i)}
                                                aria-pressed={i === gastroIndex}
                                            >
                                                {slide.tag}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="desc">
                                <p>
                                    A altitude de Ubajara proporciona um clima perfeito para o cultivo de cafés especiais e a produção de iguarias únicas que você só encontra aqui. Delicie-se com o melhor tempero da serra.
                                </p>
                            </div>

                            <div className="restaurant">
                                <Link to="/">Ver Restaurantes</Link>
                            </div>
                        </div>
                        </div>
                    </div>
                    <div className="papel ptop">
                        <div className="paper1">
                            <img src={paper} alt="papel" />
                        </div>
                        <div className="paper2">
                            <img src={paper} alt="papel" />
                        </div>
                    </div>
                </div>

                <div className="pub-landing-blocks">
                    <section className="pub-guide" aria-labelledby="pub-guide-title">
                        <header className="pub-guide__header">
                            <h2 id="pub-guide-title" className="pub-guide__title">
                                Guia de Estabelecimentos
                            </h2>
                            <p className="pub-guide__subtitle">
                                Os melhores lugares para comer, dormir e viver momentos inesquecíveis em nossa cidade.
                            </p>
                        </header>
                        <div className="pub-guide__filters" role="toolbar" aria-label="Filtrar por tipo">
                            {PUB_GUIDE_FILTERS.map((label) => (
                                <button
                                    key={label}
                                    type="button"
                                    className={
                                        pubGuideFilter === label
                                            ? "pub-guide__filter pub-guide__filter--active"
                                            : "pub-guide__filter"
                                    }
                                    onClick={() => setPubGuideFilter(label)}
                                    aria-pressed={pubGuideFilter === label}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        <div className="pub-guide__grid">
                            {PUB_GUIDE_ITEMS.filter(
                                (it) => pubGuideFilter === "Todos" || it.category === pubGuideFilter
                            ).map((item) => (
                                <article key={item.id} className="pub-guide-card">
                                    <div className="pub-guide-card__media">
                                        <img src={item.img} alt={item.title} />
                                        <span
                                            className="pub-guide-card__tag"
                                            style={{
                                                background:
                                                    PUB_GUIDE_TAG_COLORS[item.category] ?? "#006B32",
                                            }}
                                        >
                                            {item.category.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="pub-guide-card__body">
                                        <div className="pub-guide-card__row">
                                            <h3 className="pub-guide-card__name">{item.title}</h3>
                                            <span className="pub-guide-card__rating" aria-label={`Nota ${item.rating}`}>
                                                <span className="pub-guide-card__star" aria-hidden>
                                                    ★
                                                </span>
                                                {item.rating.toFixed(1)}
                                            </span>
                                        </div>
                                        <p className="pub-guide-card__desc">{item.desc}</p>
                                        <Link to="/" className="pub-guide-card__cta">
                                            <span className="material-symbols-outlined" aria-hidden>
                                                visibility
                                            </span>
                                            Ver mais
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                        <div className="pub-guide__footer">
                            <Link to="/" className="pub-guide__all">
                                Ver todos os Estabelecimentos
                            </Link>
                        </div>
                        {PUB_GUIDE_ITEMS.filter(
                            (it) => pubGuideFilter === "Todos" || it.category === pubGuideFilter
                        ).length === 0 && (
                            <p className="pub-guide__empty">Nenhum estabelecimento nesta categoria por enquanto.</p>
                        )}
                    </section>

                    <section className="pub-events" aria-labelledby="pub-events-title">
                        <header className="pub-events__header">
                            <div className="pub-events__head-left">
                                <span className="pub-events__kicker">Experiências Inesquecíveis</span>
                                <h2 id="pub-events-title" className="pub-events__title">
                                    Próximos Eventos
                                </h2>
                            </div>
                            <p className="pub-events__lede">
                                Fique por dentro da programação cultural e festivais que movimentam a nossa serra.
                            </p>
                        </header>
                        <div className="pub-events__grid">
                            {PUB_EVENTS.map((ev) => (
                                <article key={ev.id} className="pub-event-card">
                                    <div className="pub-event-card__media">
                                        <img src={ev.img} alt={ev.title} />
                                        <div className="pub-event-card__date" aria-label={`${ev.day} de ${ev.month}`}>
                                            <strong>{ev.day}</strong>
                                            <span>{ev.month}</span>
                                        </div>
                                    </div>
                                    <div className="pub-event-card__body">
                                        <h3 className="pub-event-card__title">{ev.title}</h3>
                                        <p className="pub-event-card__desc">{ev.desc}</p>
                                        <div className="pub-event-card__loc">
                                            <span className="material-symbols-outlined" aria-hidden>
                                                location_on
                                            </span>
                                            {ev.place}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                        <div className="pub-events__footer">
                            <Link to="/" className="pub-events__all">
                                Ver todos os Eventos
                            </Link>
                        </div>
                    </section>
                </div>

                {/* Como Chegar */}
                <section className="como-chegar" aria-labelledby="como-chegar-title">
                    <div className="como-chegar__inner">
                        <div className="como-chegar__left">
                            <span className="como-chegar__kicker">Planejando sua visita</span>
                            <h2 id="como-chegar-title" className="como-chegar__title">Como Chegar</h2>
                            <p className="como-chegar__desc">
                                Ubajara está estrategicamente localizada na Serra da Ibiapaba, acessível por diversas rotas aéreas e terrestres. Escolha o seu ponto de partida e venha viver essa experiência.
                            </p>
                            <ul className="como-chegar__list">
                                <li className="como-chegar__item">
                                    <div className="como-chegar__item-icon">
                                        <span className="material-symbols-outlined" aria-hidden="true">directions_bus</span>
                                    </div>
                                    <div className="como-chegar__item-text">
                                        <strong>Via Rodoviária</strong>
                                        <span>Acesso principal pela BR-222, com estradas asfaltadas e sinalizadas.</span>
                                    </div>
                                </li>
                                <li className="como-chegar__item">
                                    <div className="como-chegar__item-icon">
                                        <span className="material-symbols-outlined" aria-hidden="true">map</span>
                                    </div>
                                    <div className="como-chegar__item-text">
                                        <strong>Localização Digital</strong>
                                        <span>Encontre-nos facilmente em todos os aplicativos de navegação.</span>
                                    </div>
                                </li>
                            </ul>
                            <Link to="/" className="como-chegar__cta">Encontrar Rotas</Link>
                        </div>
                        <div className="como-chegar__airports">
                            {AIRPORTS.map((ap) => (
                                <div key={ap.code} className="airport-card">
                                    <span className="airport-card__code">{ap.code}</span>
                                    <p className="airport-card__name">{ap.name}</p>
                                    <p className="airport-card__dist">{ap.dist}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* O que dizem os visitantes */}
                <div className="reviews-block">
                    <div className="papel">
                        <div className="paper1"><img src={paper} alt="" /></div>
                        <div className="paper2"><img src={paper} alt="" /></div>
                    </div>
                    <section className="reviews" aria-labelledby="reviews-title">
                        <div className="reviews__inner">
                            <span className="reviews__kicker">Quem já visitou recomenda</span>
                            <h2 id="reviews-title" className="reviews__title">O que dizem os visitantes</h2>
                            <p className="reviews__subtitle">Experiências reais de quem já se encantou com as belezas de Ubajara.</p>
                            <div className="reviews__grid">
                                {REVIEWS.map((r) => (
                                    <article key={r.id} className="review-card">
                                        <div className="review-card__stars" aria-label={`${r.stars} de 5 estrelas`}>
                                            {'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}
                                        </div>
                                        <p className="review-card__text">"{r.text}"</p>
                                        <div className="review-card__author">
                                            <img src={r.avatar} alt={r.name} className="review-card__avatar" />
                                            <div className="review-card__info">
                                                <strong className="review-card__name">{r.name}</strong>
                                                <span className="review-card__location">{r.location}</span>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                            <div className="reviews__footer">
                                <Link to="/" className="reviews__all">Ver todos os depoimentos</Link>
                            </div>
                        </div>
                    </section>
                    <div className="papel ptop">
                        <div className="paper1"><img src={paper} alt="" /></div>
                        <div className="paper2"><img src={paper} alt="" /></div>
                    </div>
                </div>

            </div>
        </section>
    )
}