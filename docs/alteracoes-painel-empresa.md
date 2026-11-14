# Alterações recentes no painel da empresa

Este documento resume, em linguagem simples, o que mudou na área empresarial do Viva Ubajara.

## Cadastro e página do estabelecimento

- O cadastro agora está dividido em partes para facilitar o preenchimento: identificação, contato, informações próprias de restaurante ou hospedagem e fotos.
- Restaurante e hospedagem mostram campos diferentes, conforme o tipo selecionado.
- A tela informa se o cadastro está aguardando aprovação, aprovado ou precisa de ajustes. Também avisa quando uma alteração pode enviar novamente o estabelecimento para análise.
- O formulário permite selecionar até 10 imagens JPG, PNG, WEBP ou GIF, com até 5 MB cada. Mostra uma prévia e permite remover imagens antes de enviá-las.
- Ao editar um estabelecimento, as fotos que já foram enviadas aparecem junto das novas imagens selecionadas.
- O cardápio continua em sua própria aba.

## Menu lateral

- O menu ganhou uma apresentação própria para o parceiro e mostra o nome e o e-mail da conta.
- “Fotos e galeria”, “Avaliações” e “Configurações” estão visíveis, mas ainda não abrem páginas.
- “Meu estabelecimento” e “Cardápio” continuam disponíveis.

## Acesso e conta empresarial

- Depois do login social, contas empresariais são encaminhadas ao painel da empresa.
- A página de cadastro empresarial também permite que uma pessoa já conectada ative o acesso empresarial informando o nome da empresa e o CNPJ. Nesse caso, os dados de criação de uma nova conta não são solicitados.
- Uma conta empresarial conectada que visite o cadastro é encaminhada ao painel.

## Endereço da API

- O endereço da API pode ser definido com `VITE_API_BASE_URL`. Se a variável não estiver configurada, o frontend usa o endereço de produção já definido.

## Integração necessária no backend

O envio de imagens pelo painel chama `POST /companies/me/establishment/photos`. Essa rota precisa estar disponível no backend, aceitar a imagem da empresa autenticada e anexá-la ao estabelecimento que pertence a essa conta. O frontend envia uma imagem por chamada, em sequência.

O fluxo de ativação de uma conta existente chama `POST /auth/activate-company`.

## Arquivos principais

- `src/company/pages/EstablishmentPage.tsx` e `src/company/pages/EstablishmentPage.css`: cadastro, edição, status e seleção de fotos.
- `src/company/layouts/CompanyLayout.tsx` e `src/company/layouts/CompanyLayout.css`: menu e estrutura do painel empresarial.
- `src/admin/services/companyService.ts`: chamadas de cadastro, edição e envio de imagens.
- `src/pages/CadastroEmpresa.tsx`: cadastro novo e ativação de acesso empresarial.
- `src/pages/LoginSuccessPage.tsx`: encaminhamento após login social.
- `src/admin/contexts/AuthContext.tsx`, `src/admin/services/authService.ts` e `src/admin/types/index.ts`: suporte à ativação empresarial.
- `src/admin/services/api.ts`: configuração opcional do endereço da API.
