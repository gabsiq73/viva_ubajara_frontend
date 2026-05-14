import cac from "../assets/images/cachoeira.png";
import farm from "../assets/images/fazenda.png";
import mercado from "../assets/images/mercado.png";
import museum from "../assets/images/museu.png";
import park from "../assets/images/parque.png";
import route from "../assets/images/route.png";

export interface TouristPoint {
    id: number;
    category: string;
    title: string;
    desc: string;
    heroTag: string;
    heroTitle: string;
    heroSubtitle: string;
    img: string;
    galleryImgs: [string, string];
    alt: string;
    difficulty: string;
    duration: string;
    infoBar: {
        temp: string;
        status: string;
        nextTour: string;
        guidesCount: number;
    };
    content: {
        kicker: string;
        title: string;
        paragraphs: string[];
        stats: Array<{ value: string; label: string; icon: string }>;
    };
    visit: {
        difficulty: string;
        difficultyDetail: string;
        hours: string;
        hoursDetail: string;
        bring: string;
        bringDetail: string;
    };
    howToGet: {
        description: string;
        routes: Array<{ icon: string; text: string }>;
        img: string;
    };
}

export const TOURIST_POINTS: TouristPoint[] = [
    {
        id: 1,
        category: "Cachoeira",
        title: "Cachoeira do Frade",
        desc: "A mais icônica queda d'água da região, entre paredões de rocha e mata nativa.",
        heroTag: "PATRIMÔNIO NATURAL",
        heroTitle: "Cachoeira do Frade",
        heroSubtitle: "Uma jornada pelas mais belas quedas d'água da Serra da Ibiapaba, onde a água esculpe a pedra calcária há milhões de anos.",
        img: cac,
        galleryImgs: [park, farm],
        alt: "Cachoeira do Frade",
        difficulty: "Moderada",
        duration: "2h",
        infoBar: {
            temp: "22°C Ubajara",
            status: "Aberto para Visitação",
            nextTour: "Próximo Guia: 09:00",
            guidesCount: 8,
        },
        content: {
            kicker: "HISTÓRIA & NATUREZA",
            title: "Uma Queda d'Água Esculpida pelo Tempo",
            paragraphs: [
                "A Cachoeira do Frade é formada pelo Rio Ubajara ao encontrar um paredão de rocha calcária com mais de 40 metros de altura, criando uma névoa permanente que mantém o microclima úmido e favorece a biodiversidade de bromélias, orquídeas e samambaias ao redor.",
                "O percurso até a cachoeira é uma trilha moderada de 2,5 km, com mirantes privilegiados da queda principal e do vale. A trilha atravessa trechos de mata fechada, repleta de sons de pássaros endêmicos da Serra da Ibiapaba.",
            ],
            stats: [
                { value: "40m", label: "Altura da Queda", icon: "water_drop" },
                { value: "2,5km", label: "Extensão da Trilha", icon: "route" },
            ],
        },
        visit: {
            difficulty: "Dificuldade Moderada",
            difficultyDetail: "Trilha de 2,5 km com trechos de inclinação. Recomendado para maiores de 10 anos.",
            hours: "Horário: 07:00 – 17:00",
            hoursDetail: "Último grupo entra às 15:30. Fechado às segundas-feiras.",
            bring: "O que levar",
            bringDetail: "Água, protetor solar, calçados fechados e lanternas para trechos sombreados.",
        },
        howToGet: {
            description: "A Cachoeira do Frade fica dentro do Parque Nacional de Ubajara. Acessível pela entrada principal da CE-187, onde fica o centro de visitantes com estacionamento.",
            routes: [
                { icon: "route", text: "CE-187, Ubajara – CE (entrada do Parque)" },
                { icon: "schedule", text: "9h30 de Fortaleza via BR-222" },
            ],
            img: route,
        },
    },
    {
        id: 2,
        category: "Natureza",
        title: "Fazenda Santo Expedito",
        desc: "Um dos maiores polos de rosas híbridas do Brasil e referência em turismo rural.",
        heroTag: "TURISMO RURAL",
        heroTitle: "Fazenda Santo Expedito",
        heroSubtitle: "Um dos maiores polos de rosas híbridas do Brasil e referência em turismo rural, entre jardins perfumados e café de altitude.",
        img: farm,
        galleryImgs: [cac, mercado],
        alt: "Fazenda Santo Expedito",
        difficulty: "Fácil",
        duration: "1h30",
        infoBar: {
            temp: "20°C Ubajara",
            status: "Aberto para Visitação",
            nextTour: "Próxima Visita: 10:00",
            guidesCount: 4,
        },
        content: {
            kicker: "TURISMO RURAL & FLORES",
            title: "O Vale das Rosas da Ibiapaba",
            paragraphs: [
                "A Fazenda Santo Expedito é um oásis de cor e aroma no coração da Serra da Ibiapaba. Com mais de 50 variedades de rosas híbridas cultivadas a 900 metros de altitude, o microclima único da região permite floradas durante todo o ano.",
                "Além das rosas, a fazenda produz café especial de sombra, própolis verde e mel de abelhas nativas. A visita inclui degustação de produtos artesanais e um tour guiado pelos jardins e estufas de produção.",
            ],
            stats: [
                { value: "50+", label: "Variedades de Rosas", icon: "local_florist" },
                { value: "900m", label: "Altitude de Cultivo", icon: "landscape" },
            ],
        },
        visit: {
            difficulty: "Dificuldade Fácil",
            difficultyDetail: "Caminhada leve pelos jardins, acessível para todas as idades.",
            hours: "Horário: 08:00 – 17:00",
            hoursDetail: "Visitas guiadas a cada hora. Aberto todos os dias.",
            bring: "O que levar",
            bringDetail: "Protetor solar, chapéu e câmera fotográfica para registrar as flores.",
        },
        howToGet: {
            description: "A Fazenda Santo Expedito fica a 7 km do centro de Ubajara, acessível por estrada asfaltada em boas condições. Há sinalização a partir da CE-187.",
            routes: [
                { icon: "route", text: "Estrada CE-187, 7 km do centro de Ubajara" },
                { icon: "schedule", text: "10h de Fortaleza via BR-222 e CE-187" },
            ],
            img: farm,
        },
    },
    {
        id: 3,
        category: "Cultura",
        title: "Mercado Público",
        desc: "O coração pulsante da cidade: artesanato, sabores e cultura regional em um só lugar.",
        heroTag: "CULTURA LOCAL",
        heroTitle: "Mercado Público de Ubajara",
        heroSubtitle: "O coração pulsante da cidade: artesanato, sabores e cultura regional concentrados em um casarão histórico no centro de Ubajara.",
        img: mercado,
        galleryImgs: [museum, cac],
        alt: "Mercado Público de Ubajara",
        difficulty: "Acessível",
        duration: "1h",
        infoBar: {
            temp: "24°C Ubajara",
            status: "Aberto para Visitação",
            nextTour: "Próxima Visita Cultural: 10:30",
            guidesCount: 3,
        },
        content: {
            kicker: "HISTÓRIA & CULTURA",
            title: "O Coração Vivo da Cidade",
            paragraphs: [
                "Construído no início do século XX, o Mercado Público de Ubajara é um dos poucos exemplares de arquitetura comercial colonial preservados no interior cearense. Seu casarão de fachada histórica abriga feirantes, artesãos e pequenos produtores locais.",
                "No mercado você encontra cerâmicas, rendas de bilro, bordados, cachaças artesanais, rapadura, mel e as famosas rosas da Ibiapaba. As tardes de sexta-feira ganham vida com apresentações de violeiros e repentistas locais.",
            ],
            stats: [
                { value: "Séc. XX", label: "Patrimônio Histórico", icon: "museum" },
                { value: "40+", label: "Expositores", icon: "storefront" },
            ],
        },
        visit: {
            difficulty: "Acessível a Todos",
            difficultyDetail: "Espaço plano e coberto, acessível para cadeirantes e idosos.",
            hours: "Horário: 07:00 – 18:00",
            hoursDetail: "Maior movimento às sextas e sábados. Aberto todos os dias.",
            bring: "O que levar",
            bringDetail: "Dinheiro em espécie para compras com artesãos e uma sacola extra.",
        },
        howToGet: {
            description: "O Mercado Público fica no centro histórico de Ubajara, a poucos metros da Praça da Matriz. Há estacionamento público gratuito nas ruas adjacentes.",
            routes: [
                { icon: "location_on", text: "Praça Coronel Ananias, Centro – Ubajara, CE" },
                { icon: "schedule", text: "A 320 km de Fortaleza via BR-222" },
            ],
            img: mercado,
        },
    },
    {
        id: 4,
        category: "História",
        title: "Museu JK",
        desc: "Memórias e história de Ubajara preservadas em um casarão de época restaurado.",
        heroTag: "PATRIMÔNIO HISTÓRICO",
        heroTitle: "Museu JK de Ubajara",
        heroSubtitle: "Memórias e história de Ubajara preservadas em um casarão de época restaurado, contando a saga dos pioneiros da Serra da Ibiapaba.",
        img: museum,
        galleryImgs: [mercado, park],
        alt: "Museu JK de Ubajara",
        difficulty: "Acessível",
        duration: "45min",
        infoBar: {
            temp: "22°C Ubajara",
            status: "Aberto para Visitação",
            nextTour: "Próxima Visita Guiada: 09:30",
            guidesCount: 2,
        },
        content: {
            kicker: "HISTÓRIA & MEMÓRIA",
            title: "As Raízes de Ubajara em um Só Lugar",
            paragraphs: [
                "O Museu JK foi criado para preservar e difundir a história do município de Ubajara e da Serra da Ibiapaba. Instalado em um casarão colonial restaurado do século XIX, o museu reúne acervo fotográfico, documentos, utensílios domésticos e peças arqueológicas da região.",
                "O nome homenageia Juscelino Kubitschek, que visitou Ubajara durante seu governo e contribuiu para o desenvolvimento da infraestrutura da região serrana. O museu conta com visitas guiadas realizadas por historiadores locais.",
            ],
            stats: [
                { value: "Séc. XIX", label: "Casarão Histórico", icon: "account_balance" },
                { value: "500+", label: "Peças no Acervo", icon: "photo_library" },
            ],
        },
        visit: {
            difficulty: "Acessível a Todos",
            difficultyDetail: "Espaço interno climatizado, acessível para cadeirantes e crianças.",
            hours: "Horário: 08:00 – 17:00",
            hoursDetail: "Fechado às segundas-feiras. Visita guiada inclusa na entrada.",
            bring: "O que levar",
            bringDetail: "Câmera fotográfica. Entrada gratuita para estudantes com carteirinha.",
        },
        howToGet: {
            description: "O Museu JK fica no centro histórico de Ubajara, a 200 metros da Praça da Matriz. Fácil acesso a pé do Mercado Público e das principais pousadas do centro.",
            routes: [
                { icon: "location_on", text: "Rua Coronel Ananias, 45, Centro – Ubajara, CE" },
                { icon: "schedule", text: "A 320 km de Fortaleza via BR-222" },
            ],
            img: museum,
        },
    },
];
