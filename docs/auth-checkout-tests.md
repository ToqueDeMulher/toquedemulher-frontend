# Testes de autenticação e checkout

Base: `main` em `5cdb15e`, após o merge da PR #40. Ambiente local:
Node.js `22.23.2`, npm `10.9.8`, Vitest `4.1.12` e Playwright `1.56.1`.

## Escopo e testes existentes

Foram mantidos os 42 unitários e os 21 cenários Playwright anteriores, estes
executados em desktop e celular. Eles já cobriam erros HTTP genéricos,
normalização de papéis, proteção de rotas, formulários obrigatórios, carrinho,
pagamento pendente/aprovado, cancelamento com confirmação do servidor e
redefinição de senha bem-sucedida. Esses cenários não foram reescritos.

A alteração acrescenta **32 unitários** em três arquivos e **3 cenários E2E**
(6 execuções com os dois projetos). O código da aplicação, as dependências,
o workflow e a configuração de cobertura não foram alterados.

## Comportamentos acrescentados

### Serviços de autenticação

Em [`auth-service.test.ts`](../tests/unit/auth-service.test.ts), dez casos
exercitam o cliente HTTP real, substituindo somente `fetch`:

- Login retorna o token, envia e-mail/senha em JSON e não persiste uma sessão
  incompleta antes da consulta ao perfil.
- Login Google, cadastro, recuperação/redefinição de senha e confirmação de
  e-mail usam os endpoints e campos esperados, preservando a resposta da API.
- A consulta ao usuário atual usa o token explícito de um login recente, mesmo
  que exista um token antigo salvo, ou usa o token salvo quando não há explícito.
- A rejeição HTTP 422 do cadastro apresenta uma mensagem genérica de validação,
  sem expor o campo `input` retornado pelo backend.

### Ciclo da sessão e redefinição de senha

Os onze casos em [`auth-session.test.tsx`](../tests/unit/auth-session.test.tsx)
utilizam `AuthProvider`, `useAuth`, `ResetPasswordPage` e o serviço HTTP reais:

- Restauração do estado local da conta e descarte do refresh token legado.
- JSON malformado ou `null` não restaura uma conta nem provoca erro de renderização.
- Login e atualização do perfil persistem o estado; logout limpa a autenticação
  e preserva carrinho e snapshot de checkout.
- Um HTTP 401 encerra a sessão no provider pelo evento real do cliente HTTP.
  HTTP 403 e falha de rede preservam a sessão existente e o carrinho.
- Link de redefinição sem token não abre formulário nem chama a API.
- Senha curta ou confirmação divergente não envia uma redefinição.
- Token de redefinição recusado pelo backend preserva os campos, a sessão e
  o carrinho, liberando o formulário para nova tentativa.

Esses casos verificam restauração local e respostas da API. Não afirmam que
JSON arbitrário tenha validação completa de esquema nem que um token salvo
seja válido no servidor antes de uma requisição autenticada.

### Contratos e duração das requisições de checkout

Os onze casos em [`checkout-service.test.ts`](../tests/unit/checkout-service.test.ts)
usam o cliente HTTP real e incluem:

- Criação de sessões PIX e CARD com endereço, frete escolhido, IDs e quantidades.
  Preços locais e outros campos do catálogo não são enviados como valores de cobrança.
- Repetição após HTTP 503 preserva a chave de idempotência fornecida pelo chamador.
  O serviço não repete um POST de pagamento automaticamente.
- HTTP 409/422 propaga o erro sem criar outra tentativa.
- Um POST que não responde é abortado no limite de 15 segundos, sem retry
  implícito, com limpeza do timer.
- Cancelamento do chamador interrompe a consulta de status em andamento.
- Consulta de métodos de pagamento com sinal de cancelamento; consulta do checkout
  ativo sem cache; cancelamento e retomada com ID do pedido codificado na URL.

### Navegador: fluxos reais e respostas externas simuladas

Acrescentados ao [`storefront.spec.ts`](../tests/browser/storefront.spec.ts):

1. Login enfrenta 401, falha de rede e 403 na consulta ao perfil antes de
   autenticar. Os campos são mantidos, o formulário libera novas tentativas e
   token/usuário só são persistidos após a aceitação do perfil pelo backend.
2. Checkout bloqueia uma segunda submissão enquanto a primeira está em andamento.
   Após falha 503, a repetição usa a mesma chave; mudar de PIX para CARD gera
   outra chave. O carrinho é preservado durante todas essas falhas.
3. Mesmo numa URL de retorno de sucesso, uma resposta `rejected` do backend
   mostra pagamento recusado, preserva carrinho e snapshot e permite voltar ao carrinho.

Pendente/aprovado e cancelamento continuam cobertos pelos cenários anteriores.
A idempotência verificada aqui é a emissão e reutilização de chaves no frontend;
a garantia de que o servidor não cria pedidos/cobranças duplicados exige testes
do backend e não é inferida a partir de mocks HTTP.

## Confiabilidade e isolamento

Os novos testes não substituem serviços, hooks ou providers internos por mocks.
Os unitários usam apenas `fetch` simulado, com `Response`, `Headers`, timers e
`AbortController` reais. O helper [`http-fixtures.ts`](../tests/unit/http-fixtures.ts)
centraliza respostas JSON e requisições aguardando abort, sem simular regras de negócio.

O timeout usa o relógio controlado do Vitest, incluindo a verificação antes do
limite e após o abort. O cenário E2E de concorrência segura a primeira resposta
por uma Promise explícita e a libera em `finally`. Não há sleeps arbitrários.
Playwright simula somente os endpoints externos; o formulário e seus guards
de submissão são os da aplicação real.

O setup existente desmonta componentes, limpa os storages, restaura o relógio
e remove os globals simulados após cada caso. Os mocks internos já existentes
em outros arquivos foram preservados.

## Cobertura antes e depois

As duas medições usam Vitest `4.1.12`, os mesmos dez arquivos selecionados,
os mesmos denominadores e os limites globais existentes de 70% statements,
70% branches, 45% functions e 70% lines.

| Métrica global | Antes | Depois | Diferença |
| --- | ---: | ---: | ---: |
| Statements | 78,85% | 85,90% | +7,05 p.p. |
| Branches | 77,41% | 79,35% | +1,94 p.p. |
| Functions | 60,00% | 77,64% | +17,64 p.p. |
| Lines | 80,72% | 88,54% | +7,82 p.p. |

| Módulo exercitado | Statements antes → depois | Branches antes → depois | Functions antes → depois | Lines antes → depois |
| --- | ---: | ---: | ---: | ---: |
| `auth-service.ts` | 20% → 100% | 50% → 100% | 20% → 100% | 20% → 100% |
| `checkout-service.ts` | 14,28% → 100% | Sem branches instrumentadas (0/0) | 14,28% → 100% | 14,28% → 100% |
| `api-client.ts` | 85,93% → 87,50% | 60,86% → 60,86% | 80% → 90% | 89,65% → 89,65% |

As linhas cobertas globais passaram de `155/192` para `170/192`, as funções
de `51/85` para `66/85` e as branches de `120/155` para `123/155`.
Nenhum arquivo perdeu cobertura. `AuthProvider` e `ResetPasswordPage` têm
validações comportamentais novas, mas continuam fora da seleção de cobertura
existente; a seleção não foi ampliada para alterar os percentuais.

## Reprodução e resultados

```bash
npm ci
npm run typecheck
npm run typecheck:tests
npm run test:coverage
npm run build
npm run test:e2e
npm audit
git diff --check
```

| Verificação | Resultado local |
| --- | --- |
| `npm ci` | Passou; Node 22 e npm 10 |
| Tipagem da aplicação e dos testes | Passou |
| Unitários | 74 testes em 7 arquivos passaram |
| E2E novos, desktop e celular | 6 execuções passaram no ensaio direcionado |
| E2E completos | 48 execuções passaram, em desktop e celular |
| Build | Passou |
| `npm audit` | Zero vulnerabilidades |
| `git diff --check` | Passou |

Os E2E utilizam Chromium instalado (`npx playwright install chromium`) e
iniciam o Vite automaticamente, sem backend ativo ou pagamentos reais.
O workflow existente publica `vitest-coverage` com HTML e JSON por sete dias.
