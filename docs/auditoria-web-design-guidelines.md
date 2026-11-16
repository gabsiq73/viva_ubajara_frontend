# Auditoria de UI — Web Interface Guidelines (Vercel)

Auditoria somente leitura do `frontend/src`, feita em 14/11/2026 com o skill `web-design-guidelines`. Regras específicas do inglês (Title Case, voz ativa) foram ignoradas. Os relatórios completos por arquivo (`arquivo:linha`) estão em:

- Componentes e CSS global: `audit_components.md`
- Painéis empresa e admin: `audit_panels.md`
- Páginas públicas: resumo abaixo (o agente não conseguiu gravar o arquivo)

Pastas dos relatórios: `C:\Users\gabri\AppData\Local\Temp\claude\a16062d1b09d96d0\2a1aaed2-7b0f-4511-9cc8-278331ff9324\scratchpad\`.

## Onda 1 — Global e de baixo risco (alto retorno)
- **CSS global:** bloco `prefers-reduced-motion` em `globalStyle.css` (fade de toda `img`, shimmer `.skel`, spinners, carrossel) e em `admin.css`; `scroll-padding-top: var(--site-header-h)`; `touch-action: manipulation`; `-webkit-tap-highlight-color`; `color-scheme`; `overscroll-behavior: contain` em sheets, lightbox e modais; inputs com `font-size` mínimo de 16 px (evita zoom no iOS); `:focus-visible` com anel no lugar de `:focus{outline:none}` (Dashboard, Depoimentos, Eventos, PontosTuristicos, admin.css); trocar os 4 `transition: all` do admin e `100vh` por `100dvh`.
- **`index.html`:** `theme-color`, `meta description`, `viewport-fit=cover` (sem ele os `env(safe-area-inset-*)` não funcionam), `preconnect` e fontes fora do `@import` de `globalStyle.css` (hoje bloqueia a renderização).
- **Landmarks:** skip link no layout; `<main>` em ComoChegar, Contato, Depoimentos e LoginSuccessPage; um `<h1>` nas páginas admin; hierarquia de headings.
- **Ícones:** `aria-hidden="true"` nos spans `material-symbols-outlined` (ComoChegar, Contato, Depoimentos, PontosTuristicos) e nos ícones lucide do admin; `alt=""` em imagens decorativas (`Content.tsx` "papel", cards de evento e ponto).
- **Texto:** `…` no lugar de `...` (em loading e placeholders), aspas curvas, `&nbsp;` antes de unidades ("5 MB", "120 min"), singular ("1 avaliação"), `Intl.NumberFormat`/`Intl.DateTimeFormat` no lugar de formatos escritos à mão.

## Onda 2 — Bugs de lógica e UX nas páginas públicas
1. `Depoimentos.tsx`: se o envio falha, mostra sucesso e um depoimento falso aprovado; em erro ou lista vazia exibe depoimentos MOCK inventados como se fossem reais.
2. `Contato.tsx`: `JSON.parse` sem proteção depois do POST bem-sucedido; um valor corrompido mostra erro falso e o reenvio duplica a mensagem.
3. `PontoTuristico.tsx`: `JSON.parse` sem proteção derruba a página; usar `utils/favorites.ts`.
4. `App.tsx`: não existe rota `*` (404); URL desconhecida fica em branco.
5. `Eventos.tsx`: "Data mais próxima" ordena só por mês e ano, ignorando o dia; datas inválidas geram "Janeiro —".
6. Erro de carga mostrado como "nenhum resultado" ou redirecionamento silencioso (Eventos, PontosTuristicos, Evento, PontoTuristico, Local, home); usar `StateBlock` com "Tentar de novo". Na home, seções ficam em skeleton para sempre se a API falhar.
7. `Dashboard.tsx` (perfil): catches vazios (falha ao salvar, enviar ou remover foto sem aviso); remover foto e favorito sem confirmação ou desfazer; aba sem validação do `?tab=`.
8. `PontosTuristicos.tsx`: os dois CTAs ("Contratar um Guia", "Ver Regulamento do Parque") apontam para `/`.
9. `LoginSuccessPage.tsx`: se `/users/me` falha, admin e empresa caem no `/dashboard` por causa do papel provisório.
10. `Main.tsx` (hero): `aria-live="polite"` numa palavra que troca a cada 3,4 s dentro do h1 faz o leitor de tela repetir o título; o intervalo continua com reduced-motion.
11. Filtros, abas e ordenação só em `useState` (Eventos, PontosTuristicos, Depoimentos, Dashboard); levar para a URL com `useSearchParams`.
12. Formulários públicos: `name`, `autoComplete`, `spellCheck={false}` em e-mail e usuário, erro inline com foco no primeiro campo (Contato), `document.title` por página.
13. Tablist do Dashboard e do carrossel de gastronomia sem `aria-controls`, `tabpanel` e setas; estrelas e filtros sem `aria-pressed`; `<label>` sem controle.

## Onda 3 — Admin
1. `FormField` sem `htmlFor`/`id`: ~74 campos sem rótulo associado (um arquivo corrige tudo, com `useId`).
2. `Modal` sem `role="dialog"`, Esc, foco preso, retorno de foco, scroll lock e `aria-label` no "×"; reaproveitar `useModalBehavior`.
3. Overlay do menu mobile não fecha; sidebar fora da tela continua focável (falta `inert`); formulário inativo do login continua tabbable.
4. Botões só de ícone (editar/excluir) sem `aria-label` em ~22 pontos; buscas sem rótulo; `<button navigate>` no lugar de `<Link>` (~35).
5. `Toast` sem `aria-live`, botão fechar sem rótulo, estoura em telas estreitas.
6. Remoções imediatas sem confirmação (fotos em 6 lugares; "Trocar" foto apaga a antiga antes de enviar a nova).
7. Listas com página, filtro e busca fora da URL (`useCrudList` e 4 listas); busca filtra só as 10 linhas da página.
8. Formulários sem aviso de alterações não salvas e sem foco no primeiro erro; `AttractionFormPage` mostra sucesso mesmo se o upload de foto falhar; `EventFormPage` converte para UTC e mostra hora errada.
9. Classes `adm-select`, `adm-label`, `adm-required` e `adm-error` não existem no CSS (selects sem estilo).
10. `type`, `inputMode`, `autoComplete` e `spellCheck` nos campos de telefone, e-mail, URL e número.

## Onda 4 — Performance e imagens
- Imagens PNG enormes: hero de 4,2 MB (2,7 MB no mobile) como background CSS, `fazenda.png` 8,9 MB, `parque.png` 5,7 MB, `museu.png` 1,3 MB, e `cachoeira.png` servindo de avatar de 42 px. Converter para webp/avif e redimensionar; `preload` e `fetchpriority="high"` na imagem do hero (LCP); `loading="lazy"` e dimensões nas demais.
- `Sections/Slider.tsx` é código morto e arrasta `react-slick` e `slick-carousel`; remover.
- Páginas admin e empresa entram no bundle público; carregar com `React.lazy`.
- Transições de layout (`height`, `width`, `max-height`) no header e em acordeões.

## Fora do escopo desta auditoria (anotado)
- Rodapé: Acessibilidade, Privacidade e Termos de uso são `<span>` sem link (páginas ainda não existem).
- Telefone e e-mail em texto puro, sem `tel:` e `mailto:` (Contato, ComoChegar, Local).
- Duplicação do seletor `FOCUSABLE` em três arquivos.
