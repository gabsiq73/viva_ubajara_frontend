# Reivindicação de estabelecimento

Este documento resume, em linguagem simples, o que mudou no frontend para a funcionalidade "Esse estabelecimento é seu?". Ela permite que uma conta empresarial peça para ser a responsável por um restaurante ou hospedagem que já está no site, mas ainda não tem dono.

## Página pública do estabelecimento

- No fim da página, depois de "Perto daqui", aparece a seção "Esse estabelecimento é seu?". Ela só existe quando a API informa `claimable: true` para o local.
- Visitante sem login: vê os botões "Entrar" e "Cadastrar minha empresa".
- Conta comum (visitante): vê o botão "Ativar acesso empresarial", que leva à página de cadastro empresarial já em modo de ativação.
- Administrador e guia: não veem a seção.
- Conta empresarial: o que aparece depende da situação da conta:
  - já tem estabelecimento: aviso de que cada conta cuida de um só, sem formulário;
  - solicitação em análise para este local: data do envio e botão "Cancelar solicitação" (com confirmação);
  - solicitação em análise para outro local: aviso com o nome desse local, sem formulário;
  - última solicitação para este local foi rejeitada: mostra o motivo e libera uma nova solicitação;
  - conta livre: formulário com mensagem (10 a 1000 caracteres) e telefone de contato.
- Depois de enviar ou cancelar, a tela muda sem recarregar a página. Erros do servidor (como o limite de 5 solicitações em 24 horas) aparecem logo acima do botão.
- Quando a solicitação é aprovada, o local deixa de ser reivindicável e a seção some da página pública.

## Voltar para a página depois de entrar ou cadastrar

- Ao clicar em "Entrar", "Cadastrar minha empresa" ou "Ativar acesso empresarial" na seção, o endereço da página (com `#reivindicar`) fica guardado no navegador por 30 minutos (`src/utils/returnTo.ts`).
- Depois do login, do cadastro empresarial, da ativação ou do login social, a pessoa volta para a seção em vez de ir ao painel. O login de administrador não usa esse retorno.
- Só endereços internos são aceitos; qualquer valor com `//` ou `://` é descartado.

## Painel da empresa

- Quando a conta ainda não tem estabelecimento, a tela de escolha do tipo ganhou o bloco "Já existe cadastro do seu negócio?", com um link para a busca de estabelecimentos e a orientação de usar a seção "Esse estabelecimento é seu?".
- Existe agora a lista "Suas solicitações de titularidade", com local, status, data, motivo da rejeição, link para a página pública e botão "Cancelar" nas que estão em análise.
- Enquanto houver solicitação em análise, as opções de cadastrar um novo estabelecimento ficam ocultas (o backend recusaria com 409).
- Depois da aprovação, o estabelecimento aparece no painel normalmente e a tela mostra o aviso "Solicitação aprovada".
- Pequenos ajustes no cadastro: campos opcionais vazios deixam de ser enviados na criação, as prévias das fotos não vazam memória, clicar no tipo já escolhido não apaga o que foi preenchido e mensagens de erro de foto não repetem o ponto final.

## Área do administrador

- Novo item "Reivindicações" no menu, depois de "Hospedagem", com a página `/admin/claims`.
- Filtros: Pendentes (padrão), Aprovadas, Rejeitadas, Canceladas e Todas.
- A tabela mostra estabelecimento, solicitante, empresa e CNPJ, data e status. O botão de olho abre os detalhes: dados do local, do solicitante, mensagem, telefone e histórico da análise.
- Nas solicitações pendentes, "Aprovar" pede confirmação (explica que o solicitante vira o responsável e que as outras pendentes do mesmo local são rejeitadas) e "Rejeitar" aceita um motivo opcional de até 500 caracteres.
- Se outra pessoa já analisou a solicitação, a mensagem do servidor é mostrada e a lista é recarregada.
- O conteúdo principal do painel administrativo agora pode encolher em telas pequenas; assim as tabelas rolam dentro do cartão em vez de alargar a página inteira.

## Integração necessária no backend

- Os endpoints de restaurantes e hospedagens precisam devolver `claimable`.
- Rotas da empresa: `POST /companies/me/claims`, `GET /companies/me/claims` e `POST /companies/me/claims/{id}/cancel`.
- Rotas do administrador: `GET /establishment-claims`, `GET /establishment-claims/{id}`, `PATCH /establishment-claims/{id}/approve` e `PATCH /establishment-claims/{id}/reject`.
- Ordem de publicação: banco, backend e depois frontend (detalhes em `backend/docs/alteracoes-reivindicacao-estabelecimento.md`).
- Não há aviso por e-mail: a empresa acompanha o andamento pela página do local e pelo painel, e o administrador pela lista de reivindicações.

## Arquivos principais

- `src/components/establishment-detail/ClaimSection.tsx` e o final de `establishment-detail.css`: seção pública.
- `src/pages/Estabelecimento.tsx` e `src/utils/establishmentDetail.ts`: posição da seção e campo `claimable`.
- `src/utils/returnTo.ts`, `src/admin/pages/LoginPage.tsx`, `src/pages/CadastroEmpresa.tsx` e `src/pages/LoginSuccessPage.tsx`: retorno à página.
- `src/utils/claims.ts`: textos de status, datas e mensagens de erro compartilhados.
- `src/admin/services/claimsService.ts` e `src/admin/types/index.ts`: chamadas e tipos.
- `src/company/components/ClaimsPanel.tsx` e `ClaimsPanel.css`, `src/company/pages/EstablishmentPage.tsx`: painel da empresa.
- `src/admin/pages/ClaimsListPage.tsx`, `AdminRouter.tsx`, `Sidebar.tsx`, `Modal.tsx` (botão de confirmação pode ser verde) e `admin.css`: área do administrador.
