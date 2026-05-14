import food from "../assets/images/food.png";
import farm from "../assets/images/fazenda.png";
import mercado from "../assets/images/mercado.png";
import park from "../assets/images/parque.png";
import museum from "../assets/images/museu.png";

export type EstabType = "Restaurante" | "Pousada" | "Hotel" | "Cafeteria" | "Artesanato";

export interface Establishment {
    id: number;
    type: EstabType;
    name: string;
    city: string;
    stars: number;
    priceLevel: "$" | "$$" | "$$$";
    img: string;
    alt: string;
    desc: string;
    address: string;
    hours: string;
    phone: string;
    features: string[];
}

export const ESTABLISHMENTS: Establishment[] = [
    {
        id: 1,
        type: "Restaurante",
        name: "Restaurante Sabores da Serra",
        city: "Ubajara",
        stars: 5,
        priceLevel: "$$",
        img: food,
        alt: "Restaurante Sabores da Serra",
        desc: "Culinária regional cearense com pratos típicos da serra, destaque para o cordeiro assado e a canjica de milho verde.",
        address: "Rua da Praça, 12, Centro – Ubajara, CE",
        hours: "Ter–Dom: 11h–22h",
        phone: "(88) 9 9999-0001",
        features: ["Estacionamento", "Reservas", "Acessível"],
    },
    {
        id: 2,
        type: "Pousada",
        name: "Pousada Serra Verde",
        city: "Ubajara",
        stars: 5,
        priceLevel: "$$$",
        img: farm,
        alt: "Pousada Serra Verde",
        desc: "Chalés rústicos entre jardins de rosas e vista privilegiada para o vale da Ibiapaba. Café da manhã com produtos da fazenda.",
        address: "Estrada CE-187, km 4 – Ubajara, CE",
        hours: "Check-in 14h | Check-out 12h",
        phone: "(88) 9 9999-0002",
        features: ["Wi-Fi", "Café da Manhã", "Piscina", "Estacionamento"],
    },
    {
        id: 3,
        type: "Cafeteria",
        name: "Café da Montanha",
        city: "Tianguá",
        stars: 4,
        priceLevel: "$",
        img: museum,
        alt: "Café da Montanha",
        desc: "Ambiente aconchegante com cafés especiais da Serra da Ibiapaba, bolos caseiros e quitutes regionais.",
        address: "Av. Principal, 45, Centro – Tianguá, CE",
        hours: "Seg–Dom: 07h–20h",
        phone: "(88) 9 9999-0003",
        features: ["Wi-Fi", "Acessível"],
    },
    {
        id: 4,
        type: "Hotel",
        name: "Hotel das Brumas",
        city: "Ubajara",
        stars: 3,
        priceLevel: "$$",
        img: park,
        alt: "Hotel das Brumas",
        desc: "Hotel de referência na cidade com quartos bem equipados, restaurante próprio e fácil acesso ao Parque Nacional.",
        address: "Rua José Moreira, 200, Centro – Ubajara, CE",
        hours: "Check-in 15h | Check-out 11h",
        phone: "(88) 9 9999-0004",
        features: ["Wi-Fi", "Restaurante", "Estacionamento", "Acessível"],
    },
    {
        id: 5,
        type: "Artesanato",
        name: "Casa das Rosas Ibiapaba",
        city: "Ubajara",
        stars: 4,
        priceLevel: "$",
        img: mercado,
        alt: "Casa das Rosas Ibiapaba",
        desc: "Loja especializada em rosas secas, artesanato em cerâmica, bordados e produtos naturais da Serra da Ibiapaba.",
        address: "Rua das Flores, 8, Centro – Ubajara, CE",
        hours: "Seg–Sáb: 08h–18h",
        phone: "(88) 9 9999-0005",
        features: ["Entregas", "Acessível"],
    },
    {
        id: 6,
        type: "Restaurante",
        name: "Bodega do Sertão",
        city: "São Benedito",
        stars: 4,
        priceLevel: "$",
        img: food,
        alt: "Bodega do Sertão",
        desc: "Comida caseira do sertão cearense: baião de dois, carne de sol, buchada e os melhores sucos de frutas da região.",
        address: "Praça Central, s/n – São Benedito, CE",
        hours: "Seg–Sáb: 10h–21h",
        phone: "(88) 9 9999-0006",
        features: ["Estacionamento"],
    },
    {
        id: 7,
        type: "Pousada",
        name: "Pousada Cachoeira do Frade",
        city: "Ubajara",
        stars: 4,
        priceLevel: "$$",
        img: farm,
        alt: "Pousada Cachoeira do Frade",
        desc: "Pousada familiar na entrada do parque, com trilhas saindo direto do quintal e café da manhã regional incluso.",
        address: "Estrada do Parque, km 2 – Ubajara, CE",
        hours: "Check-in 14h | Check-out 12h",
        phone: "(88) 9 9999-0007",
        features: ["Wi-Fi", "Café da Manhã", "Trilhas"],
    },
    {
        id: 8,
        type: "Cafeteria",
        name: "Mercearia & Café Ibiapaba",
        city: "Ibiapina",
        stars: 3,
        priceLevel: "$",
        img: mercado,
        alt: "Mercearia & Café Ibiapaba",
        desc: "Espaço multiuso com mercearia de produtos regionais, café coado na hora e variedade de doces artesanais.",
        address: "Rua São José, 33, Centro – Ibiapina, CE",
        hours: "Seg–Dom: 06h–21h",
        phone: "(88) 9 9999-0008",
        features: ["Wi-Fi", "Acessível"],
    },
];
