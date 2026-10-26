# Revisão de funcionamento da loja — 26/10/2026

As alterações estão locais, prontas para revisão, sem deploy. As mudanças administrativas que já estavam no workspace foram preservadas.

## O que mudou

- Home, categorias, busca/sugestões, favoritos, produto e carrinho usam exclusivamente os UUIDs e dados de `GET /api/v1/products`. O antigo `catalog-products.ts` agora contém apenas tipos e metadados de navegação. Falha de API não disponibiliza produtos demonstrativos.
- O catálogo revalida ao navegar e ao retornar à janela. Exibe carregamento, erro com repetição, vazio, produto ausente e indisponível. Preços de snapshots antigos do carrinho são ignorados; a persistência guarda somente UUID/quantidade.
- Cor, volume, fragrância, fotos e descrição vêm do cadastro. Avaliações só aparecem quando existem no banco. Não há seletor de variante sem modelo de estoque correspondente.
- Cotação exige produto e estoque válidos, aceita o CEP com ou sem hífen, permite repetir a consulta, mostra preço e prazo da opção selecionada e perde validade ao mudar itens/preços/quantidades ou ao expirar. Valor mínimo atingido e entrega gratuita confirmada são mensagens distintas. A faixa vem da API, sem constante comercial independente no frontend.
- Checkout solicita login/cadastro com ação explícita e retorno preservado. A linguagem orienta a cliente sem explicar detalhes internos. O pedido só é aprovado pela resposta do backend; sucesso/pendência/cancelamento do navegador não autorizam aprovação nem limpeza imediata do carrinho. A retirada dos itens comprados depende do snapshot da sessão confirmada.
- Contato usa `POST /api/v1/contact`, mantém a mensagem após falha e confirma sucesso apenas após aceitação. A rota de atendimento é centralizada, e o único email público possível vem da configuração confirmada do backend. Telefones, endereço, falso chat, estatística e emails de exemplo foram retirados.
- Removidas promessas sem comprovação de PayPal, parcelamento, desconto Pix, fundação da empresa, vagas, artigos, condições de troca e vantagens comerciais por pontos. As páginas institucionais agora contêm apenas informações mínimas do fluxo implementado; os textos oficiais completos precisam vir da loja.
- Banner de perfumes leva a perfumes e não anuncia o desconto de até 50% da arte anterior. Menos chamadas para o Beauty Club; sem ranking fictício. Missões/pontos locais não prometem descontos nem recompensas por compra sem suporte no backend.
- Mantidos logo, tipografia, rosa, fundo claro e componentes existentes. Cabeçalhos de categoria estão menores; botões de adicionar têm fundo/contraste mais legíveis.

Arquivos principais: `src/shared/api/api-client.ts`, `src/app/providers/AppProviders.tsx`, `src/features/catalog/context/catalog-context.tsx`, `src/features/catalog/components/CatalogFeedback.tsx`, páginas e cards em `src/features/catalog/`, contexto/páginas/serviços em `src/features/cart/`, `LoginPage.tsx`, páginas em `src/features/institutional/`, `src/shared/config/store-contact.ts`, header/footer/breadcrumb, configuração de gamificação e CSS dos componentes citados.

## Testes

- Node **22.23.2**: `npm run typecheck` e `npm run build` passaram. O projeto declara Node 22.12+ por exigência da versão existente do Vite.
- `npm run test:e2e`: Playwright/Chromium, **22 testes** em desktop 1440×1000 e celular 390×664, incluindo menu, navegação, busca, formulários, disponibilidade, preço atualizado, frete, login com retorno, pagamento pendente/aprovado e cancelamento. As verificações de largura não detectaram rolagem horizontal nas telas testadas.
- API de navegador interceptada com fixtures exclusivas de `tests/browser/storefront.spec.ts`; não há mocks/fallback de produto na aplicação. Os testes de integração do backend, em SQLite isolado, cobrem o outro lado do contrato: **98 passaram após integrar a branch de melhorias do backend**. Locks concorrentes e migrations/RLS de PostgreSQL não foram executados contra um Postgres local/staging.
- Não houve pagamento Stripe de teste real nem chamada de cotação ao Melhor Envio real: os provedores foram simulados nos testes. Não houve compra live ou alteração do banco publicado.

Para repetir:

```sh
npm ci
npx playwright install chromium
npm run typecheck
npm run build
npm run test:e2e
```

O Playwright inicia Vite em `127.0.0.1:4173`, com a API apontada para a mesma origem para interceptação. Não usa as credenciais da loja.

## Configuração e impedimentos

O site publicado foi diagnosticado com falha do Postgres/Supabase (`EAUTHQUERY`) no startup da API; não era apenas um CEP inválido. O bundle usa o host correto, e o rewrite já estava configurado. O backend foi ajustado para iniciar sem DDL e responder 503 nas consultas com falha, mas a conexão externa ainda precisa ser restabelecida.

Em Vercel, `VITE_API_URL` vazio usa o rewrite `/api` existente; `VITE_API_PREFIX=/api/v1`. URL absoluta HTTPS exige CORS com a origem exata. Confira também os retornos de checkout e os requisitos de OAuth. Mudança em `VITE_*` exige novo build. Backend atualizado deve preceder o frontend por causa do contrato de catálogo novo. Nenhum deploy foi feito.

Continuam pendentes: acesso ao banco, migrations/dados do ambiente publicado, credenciais e autorização do Melhor Envio, remetente e dimensões reais, chave/webhook Stripe de teste, configuração de destinatário/SMTP, contatos e políticas oficiais da loja. Confira variáveis e passos exatos no [relatório do backend](../../toquedemulher-backend/docs/storefront-review.md) e na [integração de frete](../../toquedemulher-backend/docs/shipping-integration.md). Não foi criada migration nova porque os campos e tabelas necessários já existem nas migrations versionadas.

## Capturas

Capturas locais com **dados de teste**, sem representar disponibilidade real da loja. Os arquivos em `artifacts/` não são incluídos no bundle de produção e são recriados pelos testes.

| Tela | Desktop | Celular |
| --- | --- | --- |
| Home | [Captura](../artifacts/screenshots/desktop-home.png) | [Captura](../artifacts/screenshots/mobile-home.png) |
| Categoria compacta | [Captura](../artifacts/screenshots/desktop-category.png) | [Captura](../artifacts/screenshots/mobile-category.png) |
| Produto | [Captura](../artifacts/screenshots/desktop-product.png) | [Captura](../artifacts/screenshots/mobile-product.png) |
| Carrinho/frete | [Captura](../artifacts/screenshots/desktop-cart.png) | [Captura](../artifacts/screenshots/mobile-cart.png) |
| Checkout/login | [Captura](../artifacts/screenshots/desktop-checkout-login.png) | [Captura](../artifacts/screenshots/mobile-checkout-login.png) |
| Checkout/pagamento | [Captura](../artifacts/screenshots/desktop-checkout-payment.png) | [Captura](../artifacts/screenshots/mobile-checkout-payment.png) |
| Pagamento pendente | [Captura](../artifacts/screenshots/desktop-payment-pending.png) | [Captura](../artifacts/screenshots/mobile-payment-pending.png) |
| Contato | [Captura](../artifacts/screenshots/desktop-contact.png) | [Captura](../artifacts/screenshots/mobile-contact.png) |

## Integração das branches de melhorias

Após a autorização para commit e push, `feat/frontend-improvements` foi atualizada a partir da `main`, preservando todo o histórico e as alterações administrativas anteriores. A versão final passou novamente em TypeScript, build e 22 testes de navegador. A versão integrada do backend passou em 98 testes. As pendências externas continuam documentadas acima; push de código não confirma disponibilidade de banco, pagamentos ou frete.
