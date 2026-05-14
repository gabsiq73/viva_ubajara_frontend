import food from "../assets/images/food.png";
import park from "../assets/images/parque.png";
import route from "../assets/images/route.png";
import mercado from "../assets/images/mercado.png";
import farm from "../assets/images/fazenda.png";
import museum from "../assets/images/museu.png";
import cac from "../assets/images/cachoeira.png";

export type EventCategory = "Festival" | "Cultura" | "Esporte" | "Gastronomia" | "Natureza";

export interface AppEvent {
    id: number;
    category: EventCategory;
    title: string;
    desc: string;
    fullDesc: string;
    day: string;
    month: string;
    monthNum: number;
    year: string;
    place: string;
    address: string;
    time: string;
    price: string;
    img: string;
    alt: string;
    tags: string[];
}

export const EVENTS: AppEvent[] = [
    {
        id: 1,
        category: "Festival",
        title: "Festival de Jazz na Serra",
        desc: "Noites de música ao ar livre com artistas regionais e gastronomia local.",
        fullDesc: "O Festival de Jazz na Serra reúne músicos de todo o Ceará para três noites de shows ao ar livre na Praça da Matriz. Com palco principal, food trucks com culinária regional e uma atmosfera incomparável na altitude da Ibiapaba, o evento é um dos mais esperados do ano. Artistas convidados, apresentações de grupos locais e oficinas de música completam a programação imperdível.",
        day: "12",
        month: "AGO",
        monthNum: 8,
        year: "2025",
        place: "Praça da Matriz",
        address: "Praça da Matriz, Centro – Ubajara, CE",
        time: "19h às 23h",
        price: "R$ 20,00",
        img: park,
        alt: "Festival de Jazz na Serra",
        tags: ["Música", "Ao Ar Livre", "Cultural"],
    },
    {
        id: 2,
        category: "Gastronomia",
        title: "Feira de Sabores da Ibiapaba",
        desc: "Degustação de doces, cafés e cachaças artesanais com oficinas culturais.",
        fullDesc: "A Feira de Sabores da Ibiapaba celebra a riqueza gastronômica da região com dezenas de expositores locais. Prove doces caseiros, cafés especiais, cachaças artesanais e os pães mais tradicionais da serra. Oficinas de cozinha regional, apresentações folclóricas e espaço para crianças tornam o evento perfeito para toda a família.",
        day: "25",
        month: "SET",
        monthNum: 9,
        year: "2025",
        place: "Mercado Público",
        address: "Mercado Público Municipal, Centro – Ubajara, CE",
        time: "09h às 18h",
        price: "Gratuito",
        img: mercado,
        alt: "Feira de Sabores da Ibiapaba",
        tags: ["Gastronomia", "Artesanato", "Família"],
    },
    {
        id: 3,
        category: "Natureza",
        title: "Trilha do Nascer da Lua",
        desc: "Caminhada guiada ao amanhecer com vistas do vale e contação de histórias.",
        fullDesc: "A Trilha do Nascer da Lua é uma experiência única: uma caminhada noturna guiada por condutores credenciados do ICMBio, partindo às 4h da madrugada para alcançar o mirante antes do amanhecer. O percurso de 4 km passa por trilhas sinalizadas, com paradas para observação da flora e fauna da Caatinga e da Mata Atlântica. Ao final, café da manhã regional aguarda os participantes.",
        day: "10",
        month: "OUT",
        monthNum: 10,
        year: "2025",
        place: "Parque Nacional",
        address: "Entrada do Parque Nacional de Ubajara – CE",
        time: "04h às 08h",
        price: "R$ 35,00",
        img: route,
        alt: "Trilha do Nascer da Lua",
        tags: ["Ecoturismo", "Trilha", "Fotografia"],
    },
    {
        id: 4,
        category: "Festival",
        title: "Noite de Forró na Serra",
        desc: "Ritmos e comidas típicas em uma noite animada de festa regional.",
        fullDesc: "A Noite de Forró na Serra é a maior festa de ritmos nordestinos da região, reunindo forrozeiros de todo o Ceará e estados vizinhos. Forró pé-de-serra, xote e baião tomam conta da Praça do Forró em uma noite de muita dança e alegria. Barracas com comidas típicas, artesanato local e concurso de casais dançarinos completam a programação.",
        day: "05",
        month: "NOV",
        monthNum: 11,
        year: "2025",
        place: "Praça do Forró",
        address: "Praça Coronel Tibúrcio, Centro – Ubajara, CE",
        time: "20h às 02h",
        price: "R$ 15,00",
        img: food,
        alt: "Noite de Forró na Serra",
        tags: ["Música", "Dança", "Tradição"],
    },
    {
        id: 5,
        category: "Cultura",
        title: "Exposição Memórias da Ibiapaba",
        desc: "Acervo fotográfico e histórico sobre a Serra da Ibiapaba e seu povo.",
        fullDesc: "A exposição Memórias da Ibiapaba apresenta um acervo inédito de fotografias, documentos e objetos que contam a história da Serra da Ibiapaba desde o século XIX. Com curadoria do Museu Municipal, a mostra inclui depoimentos em vídeo de moradores antigos, mapas históricos e uma linha do tempo interativa. Entrada gratuita com guia disponível aos fins de semana.",
        day: "01",
        month: "NOV",
        monthNum: 11,
        year: "2025",
        place: "Museu Municipal",
        address: "Rua da Cultura, 10, Centro – Ubajara, CE",
        time: "Ter–Dom: 09h–17h",
        price: "Gratuito",
        img: museum,
        alt: "Exposição Memórias da Ibiapaba",
        tags: ["Cultura", "História", "Arte"],
    },
    {
        id: 6,
        category: "Esporte",
        title: "Corrida das Serras",
        desc: "Prova de trail running com percursos de 5, 10 e 21 km nas trilhas do parque.",
        fullDesc: "A Corrida das Serras é o principal evento de trail running do interior cearense, com largada na entrada do Parque Nacional de Ubajara. Os percursos de 5, 10 e 21 km passam por trilhas deslumbrantes, cachoeiras e mirantes. O evento conta com chip de cronometragem, hidratação em pontos estratégicos, premiação nas categorias geral e por faixa etária, e kit de participante.",
        day: "15",
        month: "DEZ",
        monthNum: 12,
        year: "2025",
        place: "Parque Nacional",
        address: "Entrada do Parque Nacional de Ubajara – CE",
        time: "06h às 14h",
        price: "R$ 80,00",
        img: cac,
        alt: "Corrida das Serras",
        tags: ["Esporte", "Trail", "Aventura"],
    },
    {
        id: 7,
        category: "Gastronomia",
        title: "Festival do Café Especial",
        desc: "Celebração dos cafés de altitude com baristas, degustações e painéis.",
        fullDesc: "O Festival do Café Especial de Ubajara celebra os grãos cultivados nas altitudes da Ibiapaba, reconhecidos pela qualidade excepcional. Baristas renomados apresentam métodos de preparo, produtores locais expõem seus lotes especiais e o público participa de degustações guiadas. Painéis sobre sustentabilidade, agroecologia e mercado de cafés especiais completam a programação.",
        day: "20",
        month: "JAN",
        monthNum: 1,
        year: "2026",
        place: "Praça da Cultura",
        address: "Praça da Cultura, Centro – Ubajara, CE",
        time: "08h às 18h",
        price: "R$ 25,00",
        img: farm,
        alt: "Festival do Café Especial",
        tags: ["Café", "Gastronomia", "Sustentabilidade"],
    },
    {
        id: 8,
        category: "Natureza",
        title: "Birdwatching na Mata da Gruta",
        desc: "Avistamento de aves na mata ciliar com guia especializado e binóculos.",
        fullDesc: "A Mata da Gruta de Ubajara abriga mais de 180 espécies de aves catalogadas, incluindo espécies endêmicas da Caatinga e da Mata Atlântica. A atividade de Birdwatching conta com guia especializado, lista de espécies e material de apoio. Os grupos são limitados a 10 participantes para não perturbar o habitat. Ideal para fotógrafos e amantes da natureza.",
        day: "08",
        month: "FEV",
        monthNum: 2,
        year: "2026",
        place: "Gruta de Ubajara",
        address: "Acesso pela Estrada CE-187, km 3 – Ubajara, CE",
        time: "06h às 10h",
        price: "R$ 45,00",
        img: park,
        alt: "Birdwatching na Mata da Gruta",
        tags: ["Ecoturismo", "Aves", "Fotografia"],
    },
];
