# Revisão de segurança das dependências do frontend

Data: 22/11/2026. Base: `main` em `940fd33`, após a integração da PR #39.
Ambiente local: Node.js `22.23.2` e npm `10.9.8`.

## Resultado e escopo

A auditoria inicial encontrou **7 pacotes sinalizados: 5 moderados e 2 críticos**.
Todos pertenciam às ferramentas de teste/cobertura em `devDependencies`.
Após atualizar somente as duas dependências diretas do Vitest, a auditoria
completa retornou **zero vulnerabilidades conhecidas**. A auditoria com
`--omit=dev` retornou zero antes e depois.

Os sete registros incluem severidades propagadas pela árvore; não representam
sete falhas independentes. Foram identificados seis avisos GHSA distintos.
A classificação do npm foi mantida abaixo, separada da avaliação de exposição.
Não foi demonstrada uma cadeia de exploração desses avisos na loja publicada.
Isso não elimina o risco para máquinas de desenvolvimento e runners de CI.

## Pacotes encontrados e dependências transitivas

| Pacote instalado antes | Tipo | Severidade do npm | Origem do alerta | Resultado |
| --- | --- | --- | --- | --- |
| `tinypool@1.1.1` | Dev, transitiva de `vitest` | Crítica | Dois gadgets de prototype pollution com possibilidade de execução de código | Removido da árvore pela arquitetura do Vitest 4 |
| `vitest@3.2.7` | Dev, direta | Crítica | Dependências vulneráveis `tinypool` e `@vitest/mocker` | Atualizado para `4.1.12` |
| `@vitest/mocker@3.2.7` | Dev, transitiva de `vitest` | Moderada | Leitura arbitrária de arquivos e injeção de JavaScript em plugins de mock | Atualizado para `4.1.12` |
| `glob@10.5.0` | Dev, via `coverage-v8 → test-exclude` | Moderada | Travessia após cancelamento e dependência de `minimatch` | Ausente na nova árvore |
| `minimatch@9.0.9` e `10.2.6` | Dev, via `glob` e `test-exclude` | Moderada | Amplificação de padrões com consumo excessivo de CPU/memória | Ausentes na nova árvore |
| `test-exclude@7.0.2` | Dev, via `@vitest/coverage-v8` | Moderada | Severidade propagada de `glob`/`minimatch`; sem aviso próprio no relatório | Ausente na nova árvore |
| `@vitest/coverage-v8@3.2.7` | Dev, direta | Moderada | Cadeia de cobertura vulnerável; sem aviso próprio no relatório | Atualizado para `4.1.12` |

### Avisos, versões afetadas e impacto real

| Aviso | Versões afetadas relevantes | Correção publicada | Pré-condição e exposição neste projeto |
| --- | --- | --- | --- |
| [GHSA-5gmw-xhrv-c9v3](https://github.com/advisories/GHSA-5gmw-xhrv-c9v3) | `tinypool <=2.1.0` | `2.1.1` | Exige uma primitiva prévia de prototype pollution no processo. Pode alterar opções de workers e executar código com os privilégios do runner. Não foi identificada essa primitiva no fluxo auditado; a dependência foi eliminada. |
| [GHSA-85c8-ppgw-ccpr](https://github.com/advisories/GHSA-85c8-ppgw-ccpr) | `tinypool <2.1.2` | `2.1.2` | Outro gadget nas opções de `run()`, também dependente de poluição prévia. Risco condicionado à execução Node de testes, sem caminho identificado a partir da loja estática. |
| [GHSA-82fw-gwwq-j7x9](https://github.com/advisories/GHSA-82fw-gwwq-j7x9) | `vitest`/`@vitest/mocker >=2.1.0 <4.1.11` | `4.1.11` | Um cliente que alcance o WebSocket de um dev server com `mockerPlugin`/`interceptorPlugin` público pode registrar um mock que leia arquivos. Esses plugins não são usados em `vite.config.ts`; a suíte usa jsdom, sem browser mode do Vitest. |
| [GHSA-qxg6-89mg-rqv8](https://github.com/advisories/GHSA-qxg6-89mg-rqv8) | `@vitest/mocker >=2.1.0-beta.7 <4.1.12` | `4.1.12` | Registro de mock manual sem autenticação pode injetar JavaScript servido ao navegador do desenvolvedor. Exige o plugin público e acesso ao socket, configuração não encontrada no projeto. |
| [GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4) | `glob >=9.0.0 <=14.0.1` | `14.0.2` | Cancelamento não encerra toda a travessia de arquivos. O impacto é de disponibilidade quando padrões/árvores são influenciados por um atacante. Aqui a origem era a coleta de cobertura local, sem entrada de clientes da loja. |
| [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) | `minimatch >=7.0.0 <11.0.1` | `11.0.1` | Padrões maliciosos podem ampliar processamento e memória. Os padrões de cobertura são constantes versionadas; não foi identificado fornecimento desses padrões por usuários da aplicação. |

As faixas acima descrevem as linhas instaladas ou alcançáveis na auditoria
inicial, não todas as linhas históricas dos pacotes. As condições de exploração
foram avaliadas a partir dos avisos, scripts, configurações e árvore instalada;
não foram executadas provas de exploração contra serviços ou credenciais reais.

## Correções e compatibilidade

O npm sugeria `5.1.1` como correção automática. Foi escolhida a linha corrigida
`4.1.12`, compatível com o Vite `7.3.8` e Node 22, evitando uma migração adicional
para Vitest 5. A linha 3 disponível permanecia em `3.2.7`.

| Dependência | Antes | Depois |
| --- | --- | --- |
| `vitest` | `^3.2.7` | `4.1.12` |
| `@vitest/coverage-v8` | `^3.2.7` | `4.1.12` |
| `@vitest/expect`, `mocker`, `pretty-format`, `runner`, `snapshot`, `spy`, `utils` | `3.2.7` | `4.1.12` |
| `ast-v8-to-istanbul` | `0.3.12` | `1.0.8` |
| `chai` | `5.3.3` | `6.3.0` |
| `es-module-lexer` | `1.7.0` | `2.3.2` |
| `magicast` | `0.3.5` | `0.5.5` |
| `std-env` | `3.10.0` | `4.3.0` |
| `tinyexec` | `0.3.2` | `1.3.1` |
| `tinyrainbow` | `2.0.0` | `3.2.0` |

As duas dependências diretas foram fixadas na mesma versão exata para manter
o peer `vitest` do provider sincronizado. O lockfile foi atualizado pelo npm,
sem `overrides`, `--force` ou `--legacy-peer-deps`. Os auxiliares novos são
`@standard-schema/spec@1.1.0`, `convert-source-map@2.0.0` e `obug@2.2.1`.
A atualização removeu 54 entradas de pacotes e adicionou 3; a retirada
de `tinypool`, `test-exclude`, `glob` e `minimatch` decorre da implementação
oficial atualizada, preservando a execução dos testes e a cobertura.

Foram revisadas as mudanças do [guia de migração do Vitest 4](https://v4.vitest.dev/guide/migration.html):
pool refeito sem tinypool, mudanças de mocks, APIs/opções removidas e novo
remapeamento V8. A configuração já declara `coverage.include` e não usa as
opções de pool removidas. Os testes existentes não exigiram adaptação.

A atualização inicial encontrou o erro interno `edgesOut` do npm `10.9.8`,
no resolvedor de peers opcionais. A geração do lockfile usou temporariamente
npm `11.21.2`, com a [correção do Arborist](https://github.com/npm/cli/pull/8448):

```bash
npm exec --yes --package=npm@11.21.2 -- npm install --save-dev --save-exact vitest@4.1.12 @vitest/coverage-v8@4.1.12
```

Não houve instalação global nem alteração de `.npmrc`. Depois disso, a
instalação limpa com o **npm 10.9.8 original** passou. O uso temporário de
npm 11 não é requisito para `npm ci` nem foi adicionado ao CI.

As dependências de produção e todas as suas entradas no lockfile permaneceram
idênticas. Vite `7.3.8`, React `18.3.1`, Playwright `1.56.1` e jsdom `26.1.0`
foram preservados. Os dez arquivos do build anterior e posterior apresentaram
os mesmos hashes SHA-256, incluindo JavaScript, CSS, HTML e imagens.

## Comparação do npm audit

| Escopo | Moderadas antes | Críticas antes | Total antes | Total depois |
| --- | ---: | ---: | ---: | ---: |
| Todas as dependências | 5 | 2 | 7 | 0 |
| Produção (`--omit=dev`) | 0 | 0 | 0 | 0 |

Não havia alertas altos, baixos ou informativos. A auditoria final completa e
a de produção retornaram código 0. Nenhum aviso conhecido foi ignorado ou
mantido como exceção. A consulta reflete os avisos conhecidos pelo registro
na data da revisão; não certifica a ausência de falhas ainda não publicadas.

## Política de auditoria no CI

O job existente **Typecheck e build** agora executa, após o build:

```bash
npm audit --audit-level=high
```

O comando inclui dependências diretas e transitivas, de produção e de
desenvolvimento. Ferramentas que executam código no build/teste fazem parte
da superfície do CI, mesmo sem entrar no bundle da loja. O relatório fica
nos logs do passo **Auditar dependências (altas e críticas)**.

- Alertas altos/críticos reprovam o job como bloqueio preventivo para triagem;
  a severidade não é tratada como prova automática de exploração.
- Alertas moderados/baixos continuam visíveis no relatório, sem reprovar esse
  passo apenas pela severidade.
- Se um alerta alto/crítico não se aplicar ao uso real, qualquer exceção
  precisa ser proposta em PR com GHSA, pacote/versão/caminho afetado, evidência
  de não exposição, responsável e data de reavaliação. A política/regra só deve
  ser alterada nessa revisão; não há allowlist ou exceção nesta entrega.
- Falhas de consulta ao registro também reprovam o passo; um erro de rede não
  é apresentado como auditoria sem vulnerabilidades. Não há `continue-on-error`.

Essa regra e a diferença entre severidade e contexto são explícitas para
evitar descartes automáticos de `devDependencies` e bloqueios sem triagem.
O comportamento de `--audit-level` está descrito na
[documentação oficial do npm](https://docs.npmjs.com/cli/v10/commands/npm-audit/).

## Validações

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
| Instalação limpa com Node 22/npm 10 | Passou; zero vulnerabilidades |
| Tipagem da aplicação | Passou |
| Tipagem dos testes/configuração | Passou |
| Unitários | 42 testes em 4 arquivos passaram |
| Build Vite | Passou; saída idêntica por SHA-256 |
| E2E Playwright | 42 testes passaram, em desktop e celular, com Chromium |
| Auditoria completa, de produção e com limite `high` | Zero vulnerabilidades; código 0 |
| `git diff --check` | Passou |

Dois controles negativos também foram executados em diretórios temporários:
a auditoria do lockfile original com limite `high` retornou código 1 pelos
críticos, sem instalar esses pacotes; a cobertura com exigência temporária de
100% de linhas retornou código 1, mantendo os relatórios HTML/JSON. O lockfile
corrigido e os limites versionados não foram alterados por esses controles.

### Cobertura e limites preservados

| Métrica | Vitest 3.2.7 | Vitest 4.1.12 | Limite mantido |
| --- | ---: | ---: | ---: |
| Statements | 76,34% | 78,85% | 70% |
| Branches | 80,13% | 77,41% | 70% |
| Functions | 49,01% | 60,00% | 45% |
| Lines | 76,34% | 80,72% | 70% |

O novo remapeamento baseado na AST muda os denominadores e a atribuição das
linhas/branches. Por exemplo, a contagem de linhas passa de `455/596` para
`155/192`, e branches de `121/151` para `120/155`. Os percentuais não são uma
comparação direta de aumento/redução de testes. Os **mesmos 42 testes** e os
**mesmos dez arquivos medidos** foram mantidos; `src/`, `tests/` e
`vitest.config.ts` não foram alterados. Todos os limites globais continuam
aprovados, com relatórios HTML/JSON no artefato `vitest-coverage`.

## Riscos e pendências

Não restaram vulnerabilidades conhecidas no npm audit desta revisão.
A mudança principal de risco é a migração do runner e da medição de cobertura,
verificada por tipagem e execução da suíte existente. Atualizações futuras
devem manter Vitest e coverage-v8 na mesma versão e repetir as validações.
O backend não foi alterado. Não foram executados comandos de deploy manual.
