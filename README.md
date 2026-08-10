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

- `http://localhost:5173`
- ou `http://127.0.0.1:5173`

Se precisar fixar host e porta:

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

Build de produção:

```bash
npm run build
```

Verificacao TypeScript:

```bash
./node_modules/.bin/tsc --noEmit
```

## Configuração da API

O frontend centraliza as requisições em `src/shared/api/api-client.ts`.

Variáveis suportadas:

- `VITE_API_URL`: host base da API
- `VITE_API_PREFIX`: prefixo das rotas da API
- `VITE_GOOGLE_CLIENT_ID`: OAuth Client ID web usado pelo Google Identity Services

Valores padrão atuais:

- `VITE_API_URL=http://localhost:8000`
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

Visitantes continuam usando o formulario manual de endereco.

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
- `tdm_refresh_token`
- `tdm_auth_user`

### Cadastro administrativo de produtos

A tela `src/features/admin/pages/ProductCreatePage.tsx` já possui:

- formulário administrativo com preview de payload
- criação de produto via `src/features/admin/api/product-service.ts`
- upload de imagens com `FormData`
- feedback visual com toast

No estado atual do frontend, o serviço de produtos consome:

- `POST /products/`
- `POST /products/{id}/images`

## Observações importantes

- O frontend usa variáveis de ambiente do Vite, mas não existe um `.env.example` versionado neste diretório no momento.
- O contrato consumido pelo frontend deve permanecer alinhado com o backend ativo, especialmente nas rotas de produtos e upload de imagens.
- Não há scripts de teste ou lint configurados em `package.json` neste snapshot; os scripts disponíveis são `dev` e `build`.

## Situação atual da documentação

Este README foi atualizado para refletir o estado atual do código versionado em **10 de agosto de 2026**.
