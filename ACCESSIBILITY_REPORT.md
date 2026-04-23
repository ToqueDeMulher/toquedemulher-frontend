# Relatorio de Acessibilidade

Data da auditoria: 23/03/2026
Branch de trabalho: `feat/accessibility-audit`

## Objetivo

Melhorar a acessibilidade do front-end da aplicacao com foco em WCAG, navegacao por teclado, leitores de tela, contraste, semantica e validacao de formularios.

## Auditoria Inicial

### Problemas encontrados

- Navegacao global sem skip link e sem foco automatico no conteudo principal apos mudanca de rota.
- Header com busca sem `form`/`role="search"` funcional e sem fluxo acessivel claro para teclado.
- Cards de produto e cards de favoritos usando interacoes simuladas (`div` clicavel/`role="button"`) em vez de elementos nativos.
- Formularios de login, cadastro e checkout sem associacao completa entre erros, descricoes e campos (`aria-invalid`, `aria-describedby`, resumo de erros).
- Controles iconicos e botoes com funcao visual, mas sem acao ou sem rotulo acessivel consistente.
- Problemas de contraste e nome acessivel detectados pelo Lighthouse, principalmente no footer e nos cards de favoritos.
- Imagens com `alt` redundante em contextos onde o texto visivel ja nomeava o link.
- Script de build quebrando em Windows por uso de `cp`.

## Correcoes Aplicadas

### Estrutura e navegacao

- Adicionado skip link para o conteudo principal.
- `main` recebeu `id`, `tabIndex={-1}` e foco programatico apos troca de rota.
- `ScrollToTop` foi ajustado para usar `behavior: "auto"` e reposicionar foco no conteudo principal.
- Navegacao principal do header passou a usar `nav` com nome acessivel.

### Componentes interativos

- Product cards foram refatorados para usar botao nativo de abertura com foco visivel, sem nesting incorreto de elementos interativos.
- Cards de favoritos da home passaram de `div` clicavel para `Link`.
- Icones relevantes receberam tratamento apropriado com `aria-hidden` quando decorativos.
- Links sociais do footer passaram a ser navegacao real em vez de botoes sem acao.
- Botoes de quantidade, wishlist, miniaturas, carrinho e atalhos ganharam nomes acessiveis.

### Formularios e feedback

- Header e pagina de ajuda receberam busca acessivel.
- Newsletter da categoria passou a ter `label`, submissao funcional e feedback.
- Login/cadastro receberam:
  - estados `aria-invalid`
  - mensagens associadas por `aria-describedby`
  - botoes de mostrar/ocultar senha com nome acessivel e `aria-pressed`
  - anuncio de status para leitor de tela
  - links reais para termos e privacidade
- Checkout recebeu:
  - resumo de erros por etapa
  - mensagens por campo
  - `autocomplete`, `inputMode` e `required` nos campos adequados
  - selecao de metodo de pagamento com radios reais
- Carrinho recebeu labels ocultas para cupom e CEP, mensagens ao vivo e semantica melhor na area de resumo.

### Contraste e nomes acessiveis

- Contraste do footer foi ajustado.
- Faixa promocional e alguns estados de foco receberam contraste/foco mais forte.
- `alt` redundante foi removido dos cards de favoritos.
- Nome acessivel dos links com texto visivel foi alinhado para nao conflitar com o conteudo renderizado.

### Build e validacao

- Script `npm run build` foi corrigido para funcionar em Windows e ambientes Unix-like sem depender de `cp`.

## Itens Validados

- Build de producao executado com sucesso via `npm run build`.
- Lighthouse de acessibilidade executado sobre preview local da build.
- Pontuacao Lighthouse (acessibilidade): `100/100`.

## Checklist Obrigatorio

- [x] Auditoria de contraste de cores
- [x] Implementar navegacao por teclado para botoes e links
- [x] Adicionar labels e atributos ARIA para leitores de tela
- [x] Testar acessibilidade com Lighthouse
- [x] Corrigir problemas encontrados
- [x] Gerar relatorio final resumindo melhorias

## Pendencias e Observacoes

- O build ainda emite um aviso sobre a fonte `Satoshi-Variable.ttf` nao ser resolvida em tempo de build; isso nao bloqueou a compilacao nem a auditoria de acessibilidade, mas vale revisar o caminho do asset.
- Os links sociais do footer foram convertidos para destinos genericos das plataformas, porque o repositorio nao trazia URLs oficiais da marca. Recomenda-se substituir pelos links reais da Toque de Mulher.
- Imagens grandes de banner continuam impactando peso da pagina; isso afeta mais performance do que acessibilidade, mas pode influenciar experiencia geral em dispositivos modestos.
- O Lighthouse automatizado foi executado sobre a home publicada localmente em `http://127.0.0.1:4173/`. Como proximo passo, vale repetir a auditoria automatizada nas rotas de login, produto, carrinho e checkout para ampliar a cobertura por pagina.

## Arquivos Alterados

- `package.json`
- `src/app/components/ScrollToTop.tsx`
- `src/app/layout/AppLayout.tsx`
- `src/shared/layout/Header.tsx`
- `src/shared/layout/Header.module.css`
- `src/shared/layout/Footer.tsx`
- `src/shared/layout/Footer.module.css`
- `src/features/catalog/components/ProductCard.tsx`
- `src/features/catalog/components/ProductCard.module.css`
- `src/features/catalog/pages/HomePage.tsx`
- `src/features/catalog/pages/HomePage.module.css`
- `src/features/catalog/pages/CategoryPage.tsx`
- `src/features/catalog/pages/CategoryPage.module.css`
- `src/features/catalog/pages/ProductPage.tsx`
- `src/features/catalog/pages/ProductPage.module.css`
- `src/features/institutional/pages/HelpPage.tsx`
- `src/features/institutional/pages/HelpPage.module.css`
- `src/features/auth/pages/LoginPage.tsx`
- `src/features/auth/pages/LoginPage.module.css`
- `src/features/cart/pages/CartPage.tsx`
- `src/features/cart/pages/CartPage.module.css`
- `src/features/cart/pages/CheckoutPage.tsx`
- `src/features/cart/pages/CheckoutPage.module.css`
