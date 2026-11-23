# toquedemulher-frontend

Frontend do projeto Toque de Mulher construído com `React`, `TypeScript` e `Vite`.

## Visão geral

O frontend atual cobre os principais fluxos de navegação da loja e da área administrativa:

- página inicial e catálogo
- página de produto
- páginas de categoria
- carrinho e checkout em etapas
- login e perfil
- páginas institucionais
- dashboard administrativo
- cadastro administrativo de produtos

## Stack principal

- `React 18`
- `TypeScript`
- `Vite`
- `React Router`
- `React Hook Form`
- componentes UI com Radix e utilitários próprios
- notificações com `sonner`

## Como rodar localmente

Inicie o backend primeiro em `http://127.0.0.1:8000`. Depois, em outro terminal:

```bash
cd toquedemulher-frontend
npm install
npm run dev
```

O Vite vai abrir a aplicacao em:

- `http://localhost:3000`
- ou `http://127.0.0.1:3000`

Se precisar fixar host e porta:

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

Build de produção:

```bash
npm run build
```

## Deploy na Netlify

O frontend esta pronto para deploy na Netlify com:

- build command: `npm run build`
- publish directory: `build`
- runtime do build: `Node 22`
- fallback de SPA: `public/_redirects`

Primeiro login/link do projeto:

```bash
netlify login
netlify link
```

Configure as variaveis publicas usadas pelo Vite na Netlify. Elas sao
injetadas no bundle no momento do build, entao qualquer alteracao exige novo
deploy.

```bash
netlify env:set VITE_API_URL "https://sua-api-em-producao.com" --context production
netlify env:set VITE_API_PREFIX "/api/v1" --context production
netlify env:set VITE_GOOGLE_CLIENT_ID "seu-client-id.apps.googleusercontent.com" --context production
```

Para validar antes de publicar:

```bash
netlify deploy --build
```

Para publicar em producao:

```bash
netlify deploy --build --prod
```

Observacao: `VITE_API_URL` nao pode apontar para `localhost` no deploy publico;
use a URL publica do backend.

Verificacao TypeScript:

```bash
npm run typecheck
```

## Testes e validação do CI

Use Node.js 22.12+ (a versão principal está em `.nvmrc`) e instale as
dependências a partir do lockfile. Para reproduzir as verificações localmente:

```bash
npm ci
npm run typecheck
npm run typecheck:tests
npm run test:coverage
npm run build
npx playwright install chromium
npm run test:e2e
git diff --check
```

`npm run typecheck` verifica a aplicação; `npm run typecheck:tests` verifica
também os testes unitários e a configuração do Vitest. Para executar os
unitários sem coletar cobertura, use `npm test`. Os testes unitários e os E2E
de `npm run test:e2e` simulam as APIs e não exigem um backend ativo. O Playwright
inicia o Vite automaticamente e executa os cenários em desktop e celular.

Se o Playwright informar que o executável do navegador não existe, instale o
Chromium com o comando acima e repita os E2E. Esse erro indica um pré-requisito
do ambiente; falhas de asserção devem ser investigadas nos logs e traces.

### Cobertura mínima

`npm run test:coverage` usa o provider V8 do Vitest. Os limites são globais:
aplicam-se ao conjunto de arquivos selecionado em `coverage.include` no
[`vitest.config.ts`](vitest.config.ts), e não a cada arquivo nem a todo o
frontend.

| Métrica | Mínimo |
| --- | ---: |
| Statements | 70% |
| Branches | 70% |
| Functions | 45% |
| Lines | 70% |

Qualquer teste com falha ou métrica abaixo do mínimo faz o comando terminar
com erro e reprova o job. Esses limites são o piso inicial; preserve a
cobertura existente ao revisar alterações. Não reduza o conjunto de arquivos
medidos nem remova testes para atingir as metas.

O resumo aparece no terminal. Os relatórios são gerados em
`artifacts/unit-coverage/`: abra `index.html` para consultar a cobertura por
arquivo ou use `coverage-summary.json` para ler os valores consolidados. Os
relatórios também são gerados quando há falhas nos testes, se a execução
conseguir coletar a cobertura. A pasta `artifacts/` não é versionada.

### Relatórios no GitHub Actions

O workflow [`CI`](.github/workflows/ci.yml) executa em PRs destinadas à `main`,
em pushes na `main` e por acionamento manual. O job **Typecheck e build**
executa instalação, tipagem da aplicação e dos testes, unitários com cobertura
e build. O nome do check foi mantido para preservar referências existentes.
O job **Testes E2E** mantém os cenários Playwright e a instalação do Chromium.

1. Abra a aba [Actions](https://github.com/ToqueDeMulher/toquedemulher-frontend/actions/workflows/ci.yml)
   e selecione a execução do workflow **CI**. Na PR, também é possível abrir
   os detalhes de cada check.
2. Consulte o passo `npm run test:coverage` no job **Typecheck e build** para
   ver os testes executados, a tabela de cobertura e eventuais falhas.
3. No resumo da execução, em **Artifacts**, baixe `vitest-coverage`, extraia
   o ZIP e abra `index.html`. O artefato inclui o resumo JSON e fica disponível
   por 7 dias. O envio também é tentado após falhas nos unitários ou no build;
   execuções canceladas ou que não chegaram à etapa de cobertura podem não
   produzir relatórios. A ausência de arquivos no envio reprova o passo.
4. Para falhas nos E2E, consulte os logs de **Testes E2E** e o artefato
   `playwright-falhas`, com traces e screenshots, também retido por 7 dias.

O CI também executa `npm audit --audit-level=high`. A avaliação de exposição,
as correções e a política de triagem estão na
[revisão de segurança das dependências](docs/dependency-security-review.md).

Referências: [cobertura no Vitest 4](https://v4.vitest.dev/config/#coverage)
e [artefatos do GitHub Actions](https://docs.github.com/en/actions/tutorials/store-and-share-data).

## Configuração da API

O frontend centraliza as requisições em `src/shared/api/api-client.ts`.

Variáveis suportadas:

- `VITE_API_URL`: host base da API
- `VITE_API_PREFIX`: prefixo das rotas da API
- `VITE_GOOGLE_CLIENT_ID`: OAuth Client ID web usado pelo Google Identity Services

Valores padrão atuais (quando a variável não está definida):

- Desenvolvimento: `VITE_API_URL=http://localhost:8000`.
- Build de produção: mesma origem (`VITE_API_URL` vazio); o rewrite da Vercel encaminha `/api` ao backend.
- `VITE_API_PREFIX=/api/v1`

Exemplo de `.env`:

```env
VITE_API_URL=http://localhost:8000
VITE_API_PREFIX=/api/v1
VITE_GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
```

Depois de alterar `.env`, reinicie o `npm run dev`. O Vite injeta variaveis
`VITE_*` na inicializacao do processo.

## Fluxo completo local

Terminal 1, backend:

```bash
cd toquedemulher-backend
source .venv/bin/activate
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Terminal 2, frontend:

```bash
cd toquedemulher-frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

Acesse `http://127.0.0.1:5173`.

## Login com Google

O frontend usa Google Identity Services para obter o `credential` do Google e
envia esse token para:

```text
POST /api/v1/user/google
```

Configuracao necessaria:

- Frontend: `VITE_GOOGLE_CLIENT_ID` no `.env`.
- Backend: `GOOGLE_CLIENT_ID` no `.env`. O backend tambem aceita `VITE_GOOGLE_CLIENT_ID` como fallback.
- Google Cloud Console: o OAuth Client precisa ser do tipo Web e deve permitir a origem JavaScript local, como `http://localhost:5173` e/ou `http://127.0.0.1:5173`.

Este projeto nao usa Supabase Auth para login Google. A Supabase esta sendo
usada como banco Postgres; a autenticacao e feita pela API FastAPI.

Se aparecer `{"detail":"Login com Google nao configurado"}`, o backend que
recebeu a requisicao iniciou sem `GOOGLE_CLIENT_ID`/`VITE_GOOGLE_CLIENT_ID`.
Confirme o `.env` do backend e reinicie a API.

## Login, admin e perfil

A tela de login e unica. Nao existe mais seletor "admin/cliente".

Depois do login, o frontend chama o backend para obter o usuario atual. Se a
`role` retornada for `admin`, a aplicacao redireciona para `/admin`; caso
contrario, redireciona para `/perfil`.

O perfil consome dados reais do backend para:

- informacoes pessoais
- enderecos
- metodos de pagamento
- pedidos
- avaliacoes

## Confirmacao de email

O link enviado pelo backend aponta para:

```text
/confirm-email?token=...
```

A pagina `src/features/auth/pages/ConfirmEmailPage.tsx` chama:

```text
POST /api/v1/user/confirm-email
```

Quando o token e valido, o backend marca `email_confirmed_at` no usuario e a
tela mostra o estado de sucesso. Se o token estiver ausente, expirado ou
invalido, a tela mostra erro e leva a pessoa de volta ao login.

## Carrinho e checkout

No checkout, usuarios logados usam enderecos salvos do perfil:

- se houver endereco padrao de entrega, ele ja vem selecionado
- se nao houver padrao, o primeiro endereco salvo e usado
- o usuario pode escolher outro endereco salvo
- o usuario pode adicionar um novo endereco e salva-lo no perfil

Visitantes recebem uma ação para entrar ou cadastrar-se antes de preencher o endereço. O carrinho permanece salvo por UUID/quantidade e o login preserva o retorno ao checkout.

## Estrutura principal

- `src/app/`: boot da aplicação, providers, layout e rotas
- `src/features/catalog/`: home, categorias, produto e componentes de catálogo
- `src/features/cart/`: carrinho, checkout e fluxo de compra
- `src/features/auth/`: login e perfil
- `src/features/admin/`: dashboard e cadastro de produtos
- `src/features/institutional/`: páginas institucionais
- `src/shared/api/`: cliente HTTP e servicos de API compartilhados
- `src/shared/ui/`: biblioteca de componentes reutilizáveis

## Rotas implementadas

Rotas públicas e autenticadas configuradas em `src/app/routes.tsx`:

- `/`
- `/produto/:productId`
- `/categoria/:category`
- `/carrinho`
- `/checkout/:step`
- `/login`
- `/perfil`
- `/ajuda`
- `/sobre`
- `/institucional/:slug`
- `/admin`
- `/admin/produtos/novo`

## Integração atual

### Cliente HTTP

O helper `src/shared/api/api-client.ts`:

- monta a URL final com base nas variáveis `VITE_API_URL` e `VITE_API_PREFIX`
- injeta `Content-Type: application/json` quando necessário
- envia token `Bearer` automaticamente se existir em `localStorage`
- normaliza respostas `204`

Chaves de autenticação usadas no navegador:

- `tdm_access_token`
- `tdm_auth_user`

A API emite apenas tokens de acesso. Tokens de refresh antigos são removidos do
navegador ao iniciar o app.

### Cadastro administrativo de produtos

A tela `src/features/admin/pages/ProductCreatePage.tsx` possui:

- validação dos campos aceitos pelo FastAPI e preview de payload
- criação de produto via `src/features/admin/api/product-service.ts`
- upload de imagens com `FormData`
- erros persistentes e feedback visual com toast
- reenvio das imagens pendentes sem repetir a criação do produto

No estado atual do frontend, o serviço de produtos consome:

- `POST /products` (JSON)
- `POST /products/{id}/images/upload` (`FormData`: `file`, `order`, `alt_text`)
- `GET /products/admin/all`, `PATCH /products/{id}` e `DELETE /products/{id}`

O fornecedor deve existir e o vínculo exige seu custo em `supplier_products`.
As seções de marca, descrição, categorias, estoque e contato/email do fornecedor
permanecem visíveis, com campos desabilitados e explicações das integrações
pendentes. Esses campos não aceitam dados que seriam descartados; não há entrada
manual de códigos de marca/descrição. O backend gera UUID, slug e estoque inicial
zero. A manutenção de fornecedores e entradas de estoque possuem APIs próprias,
mas ainda não têm telas integradas neste painel.
Consulte o [contrato e os cenários de teste](docs/product-api-contract.md) para os
campos aceitos, tratamento de falhas e justificativas dos ajustes.

## Observações importantes

- O frontend usa variáveis de ambiente do Vite; veja `.env.example` para desenvolvimento local.
- O contrato consumido pelo frontend deve permanecer alinhado com o backend ativo, especialmente nas rotas de produtos e upload de imagens.
- Validação: `npm run typecheck`, `npm run build` e `npm run test:e2e` (Playwright, APIs simuladas, desktop/celular). Use Node 22.12+ e instale o Chromium com `npx playwright install chromium`.

## Situação atual da documentação

Este README foi atualizado para refletir o estado atual do código versionado em **10 de agosto de 2026**.

## Revisão de funcionamento da loja (26/10/2026)

O catálogo público, busca, categorias, produto, favoritos e carrinho agora usam exclusivamente a API. O carrinho revalida preço e disponibilidade, e o backend valida os valores e reserva o estoque ao criar o pagamento. O contato envia para `POST /api/v1/contact`; mensagens de sucesso dependem da aceitação do backend.

Veja [o relatório do frontend](docs/storefront-review.md) para testes, capturas e configuração. O relatório detalhado do backend está no outro repositório em `docs/storefront-review.md`. Nenhum deploy faz parte desta revisão.
