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

```bash
cd toquedemulher-frontend
npm install
npm run dev
```

Build de produção:

```bash
npm run build
```

## Configuração da API

O frontend centraliza as requisições em `src/shared/services/apiClient.ts`.

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

## Estrutura principal

- `src/app/`: boot da aplicação, providers, layout e rotas
- `src/features/catalog/`: home, categorias, produto e componentes de catálogo
- `src/features/cart/`: carrinho, checkout e fluxo de compra
- `src/features/auth/`: login e perfil
- `src/features/admin/`: dashboard e cadastro de produtos
- `src/features/institutional/`: páginas institucionais
- `src/shared/services/`: cliente HTTP e serviços de integração
- `src/shared/contexts/`: estado global de autenticação e carrinho
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

O helper `src/shared/services/apiClient.ts`:

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
- criação de produto via `src/shared/services/productService.ts`
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

Este README foi atualizado para refletir o estado atual do código versionado em **10 de março de 2026**.
