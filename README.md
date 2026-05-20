# Viva Ubajara — Frontend

Site público e painel administrativo do **Parque Nacional de Ubajara** (CE, Brasil).

Desenvolvido com React 18 + TypeScript + Vite, consome uma API REST Spring Boot em separado.

---

## Funcionalidades

### Site público

| Página | Descrição |
|---|---|
| Home | Hero com foto, seções de atrações em destaque, itens recomendados, depoimentos e cards de eventos |
| Atrações | Listagem e detalhe de atrações do parque (cachoeiras, trilhas, museu, etc.) |
| Pontos Turísticos | Listagem e detalhe de pontos turísticos da região |
| Eventos | Agenda de eventos com datas, localização e link de inscrição |
| Estabelecimentos | Restaurantes e hospedagens próximos ao parque |
| Como Chegar | Informações de acesso, aeroportos e rotas |
| Depoimentos | Avaliações de visitantes com sistema de estrelas |
| Contato | Formulário de mensagem e números de emergência |
| Perfil / Dashboard | Área do usuário: favoritos, depoimentos, histórico de mensagens e edição de perfil com foto |

### Painel administrativo (`/admin`)

Acesso restrito a usuários com role **ADMIN** ou **GUIDE**.

| Módulo | ADMIN | GUIDE |
|---|---|---|
| Dashboard | ✓ | ✓ |
| Atrações (+ sub-atrações) | ✓ | ✓ |
| Pontos Turísticos | ✓ | ✓ |
| Eventos | ✓ | ✓ |
| Restaurantes | ✓ | — |
| Hospedagem | ✓ | — |
| Guias Turísticos | ✓ | — |
| Itens Recomendados | ✓ | — |
| Contatos | ✓ | — |
| Mensagens de Contato | ✓ | — |
| Depoimentos (aprovação) | ✓ | — |
| Galeria de Fotos | ✓ | — |
| Usuários | ✓ | — |

---

## Stack

- **React 18** + **TypeScript** + **Vite**
- **React Router v6** — roteamento com proteção por role
- **Axios** — comunicação com a API REST
- **Lucide React** — ícones
- **CSS puro por arquivo** — sem framework de UI, sistema de design próprio com variáveis CSS
- **JWT** — autenticação stateless com expiração automática
- **Login social** — Google OAuth2 e GitHub

---

## Estrutura do projeto

```
src/
├── admin/
│   ├── components/     # DataTable, FormField, Modal, Sidebar, Toast, RolePhotoSlot…
│   ├── contexts/       # AuthContext (JWT + roles)
│   ├── hooks/          # useAuth, useCrudList
│   ├── layouts/        # AdminLayout
│   ├── pages/          # Uma página por recurso (List + Form)
│   ├── services/       # Chamadas à API (attractions, events, users…)
│   └── types/          # Interfaces TypeScript completas
├── components/
│   ├── Sections/       # Seções da home (Hero, Content, Testimonials…)
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Navbar.tsx
├── pages/              # Páginas públicas
└── assets/images/
```

---

## Configuração e execução

### Pré-requisitos

- Node.js 18+
- API backend rodando (repositório separado)

### Instalação

```bash
git clone https://github.com/gabsiq73/viva_ubajara_frontend.git
cd viva_ubajara_frontend
npm install
```

### Variáveis de ambiente

Crie um arquivo `.env` na raiz:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_GOOGLE_CLIENT_ID=seu_google_client_id
```

### Rodando em desenvolvimento

```bash
npm run dev
```

### Build de produção

```bash
npm run build
```

---

## Autenticação

O sistema suporta três formas de login:

- **Email + senha** (cadastro próprio)
- **Google OAuth2**
- **GitHub OAuth**

O token JWT é armazenado no `localStorage` e expirado automaticamente no frontend. Rotas do painel verificam o role do usuário antes de renderizar.

---

## CI

Pull requests para `main` rodam automaticamente verificação de tipos TypeScript e build de produção via GitHub Actions.

---

## API Backend

Este repositório é apenas o frontend. O backend (Spring Boot + PostgreSQL) está em repositório separado e expõe os endpoints consumidos aqui.
