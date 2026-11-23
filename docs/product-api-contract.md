# Contrato administrativo de produtos — issue #17

Revisão de 22/11/2026, relacionada à [issue #17](https://github.com/ToqueDeMulher/toquedemulher-frontend/issues/17).
Base frontend: `5cdb15ec840e9937d376cccd76e04ea1c0cf8e5c` (`main`, após a PR #40).
Backend consultado: `4adbb8d1dfacb6876d2654b3ccb595194af358b7`.

**Escopo definido na revisão:** preservar as seções administrativas anteriores
com campos indisponíveis e explicação clara, mantendo as correções de contrato e
testes nesta PR. Não implementar agora cadastros auxiliares ou contratos novos no
backend. A compatibilidade do JSON não comprova que o fluxo administrativo esteja
completo: as integrações pendentes estão indicadas na interface e abaixo.

As fontes de verdade são os [schemas de produto](https://github.com/ToqueDeMulher/toquedemulher-backend/blob/4adbb8d1dfacb6876d2654b3ccb595194af358b7/app/schemas/products.py),
o [schema do vínculo de fornecedor](https://github.com/ToqueDeMulher/toquedemulher-backend/blob/4adbb8d1dfacb6876d2654b3ccb595194af358b7/app/schemas/supplier_product.py)
e os [endpoints implementados](https://github.com/ToqueDeMulher/toquedemulher-backend/blob/4adbb8d1dfacb6876d2654b3ccb595194af358b7/app/api/v1/endpoints/product.py).
Exemplos antigos da issue não substituem esses contratos.

## Criação e edição

Os caminhos abaixo recebem o prefixo configurado na aplicação, normalmente `/api/v1`.

| Operação | Contrato utilizado |
| --- | --- |
| `POST /products` | JSON `ProductRequest`; resposta com `message`, UUID `id`, `slug` e `name` |
| `GET /products/admin/all` | Lista administrativa com `id`, `slug`, `name`, `price`, `active`, `image` |
| `PATCH /products/{id}` | `ProductUpdateRequest`: somente `name`, `price`, `active`, `slug`; a tela edita os três primeiros |
| Resposta do PATCH | `id`, `name`, `price`, `active`; não contém `slug` |
| `DELETE /products/{id}` | Sucesso com `message`; pode recusar exclusão de produto com movimentações |

O formulário monta explicitamente as propriedades do JSON, sem espalhar o estado
inteiro da tela. Arquivos, URLs de imagem e metadados de upload ficam separados.

| Campos de criação | Tipo enviado e validação |
| --- | --- |
| `name` | Texto obrigatório; rejeita vazio/espaços e remove espaços nas extremidades |
| `price` | Número finito obrigatório, maior ou igual a zero; vazio não vira zero |
| `active`, `vegan`, `cruelty_free`, `hypoallergenic` | Booleanos reais; preservados os valores iniciais da tela |
| `volume`, `target_audience`, `product_type`, `skin_type`, `hair_type`, `color`, `fragrance` | Texto opcional; vazio vira `null` |
| `spf` | Inteiro opcional; sem inventar um intervalo que o schema não exige |
| `brand_id`, `description_id` | Suportados pelo DTO como inteiros opcionais; a interface não solicita IDs manuais e mantém os valores vazios (`null`) |
| `shipping_width`, `shipping_height`, `shipping_length` | Números opcionais em cm, maiores que zero e até 300 |
| `shipping_weight` | Número opcional em kg, maior que zero e até 1000 |
| `supplier_products` | Omitido sem fornecedor; com fornecedor, lista de `{ supplier_name, supplier_price, lead_time_days }` |
| Campos do vínculo | Nome de fornecedor existente, custo numérico obrigatório ≥ 0, prazo inteiro opcional ≥ 0 |

`slug` é opcional no DTO do serviço; a tela o omite para usar a geração do backend.
O UUID vem da resposta. Identificadores usados em URLs passam por `encodeURIComponent`.
Ao editar o nome, o backend pode regenerar o slug: a tela recarrega a lista após o
PATCH. Se essa leitura falhar, informa que o produto já foi salvo e permite
atualizar a lista sem repetir a mutação nem exibir um slug antigo.

## Campos administrativos preservados e integrações pendentes

Os campos abaixo apareciam na tela, mas o montador do payload não os incluía no
POST. Eles também não pertencem ao `ProductRequest`, que usa `extra="ignore"`.
Retirar esses campos ou substituí-los por códigos manuais alterava o fluxo
administrativo. A decisão de revisão foi preservar suas seções, indisponíveis até
a integração correspondente. A ausência no POST de produto não significa que
essas informações devam deixar de fazer parte da administração da loja.

| Campos anteriores | Tratamento e justificativa |
| --- | --- |
| `supplier_name`, `supplier_contact`, `supplier_email` | Nome integra `supplier_products`, com custo e prazo. Contato e email permanecem visíveis e desabilitados, com aviso de que a manutenção de fornecedores não está integrada ao painel. |
| `brand_name` | Seção Marca e campo original preservados, desabilitados. Não é solicitado `brand_id` manualmente, pois não há seleção/cadastro integrado. |
| `description_text`, `description_usage_tips`, `description_ingredients` | Seção Descrição e três campos originais preservados, desabilitados. Não é solicitado `description_id` manualmente, nem sugerido que os textos serão salvos. |
| `categories_names` | Seção Categorias e tags preservada, com campo desabilitado e explicação da integração pendente. |
| `stock_quantity`, `stock_expiry_date` | Seção Estoque inicial e campos de quantidade/validade preservados, desabilitados. Aviso explícito de estoque zero e da entrada ainda não integrada ao painel. |
| URL de imagem digitável | Fica somente leitura e mostra a URL retornada pelo upload. O JSON de produto não vincula uma URL digitada. |

Criar cadastros auxiliares ou unificar essas operações exige definir uma integração
adicional; enviar novamente os campos ignorados não resolveria sua persistência.

### Achados que motivaram o ajuste

| Prioridade | Campo ou fluxo | Evidência e impacto | Decisão necessária |
| --- | --- | --- | --- |
| Alta | Marca e descrição | `brand_id`/`description_id` existem no schema, mas não há rotas administrativas registradas para consultar/criar esses registros. Pedir códigos manualmente não substitui o preenchimento de marca, texto, dicas e ingredientes. | Definir o fluxo de seleção/cadastro e os contratos necessários; não considerar a substituição por IDs uma solução administrativa completa. |
| Alta | Estoque inicial e validade | Existe `POST /stock/` com fornecedor, produto, quantidade, custo e validade. O menu e as rotas atuais do painel não oferecem esse fluxo. O produto é criado com estoque zero, e o catálogo exige estoque positivo para permitir compra. | Preservar a necessidade de entrada de estoque e decidir entre integração explícita após criação ou tela própria; retirar os campos e recomendar um fluxo inexistente no painel não resolve a operação. |
| Média | Contato e email do fornecedor | Existem `GET/POST/PUT /supplier/`, com nome, contato e email. `supplier_products` só vincula um fornecedor existente. A #42 não oferece seleção/listagem nem cadastro do fornecedor. | Diferenciar vínculo de produto e manutenção do fornecedor; integrar o contrato já existente ou sinalizar a indisponibilidade sem presumir uma tela alternativa. |
| Média | Categorias | Existem modelos e vínculo relacional, e o catálogo usa categorias para navegação e produtos relacionados; não há endpoint administrativo registrado para listar/atribuir categorias. | Definir contrato e fluxo de categorização. A ausência no `ProductRequest` não torna a informação dispensável. |

Foram inspecionados também os [endpoints de fornecedor](https://github.com/ToqueDeMulher/toquedemulher-backend/blob/4adbb8d1dfacb6876d2654b3ccb595194af358b7/app/api/v1/endpoints/supplier.py),
os [endpoints de estoque](https://github.com/ToqueDeMulher/toquedemulher-backend/blob/4adbb8d1dfacb6876d2654b3ccb595194af358b7/app/api/v1/endpoints/stock.py),
o [schema de estoque](https://github.com/ToqueDeMulher/toquedemulher-backend/blob/4adbb8d1dfacb6876d2654b3ccb595194af358b7/app/schemas/stock.py),
o [roteador efetivamente registrado](https://github.com/ToqueDeMulher/toquedemulher-backend/blob/4adbb8d1dfacb6876d2654b3ccb595194af358b7/app/api/v1/router.py)
e a serialização pública em `app/services/catalog_service.py`, além de
`src/features/admin/layout/AdminLayout.tsx` e `src/app/routes.tsx` no frontend.
Nenhum endpoint ou banco real foi chamado nesta revisão.

**Encaminhamento escolhido e implementado nesta PR:** preservar as seções
administrativas com indicação explícita de indisponibilidade até haver integração,
sem aceitar dados que serão descartados e sem exigir IDs sem mecanismo de seleção.
Os nove controles restaurados usam `disabled` e `aria-describedby` com a explicação
visível de cada seção, e não são registrados no React Hook Form. Permanecem
desabilitados após limpar/concluir o cadastro. O DTO de serviço continua aceitando
os IDs opcionais do backend, sem expô-los como alternativa administrativa na tela.
Foram mantidas as correções de validação, payload, edição e recuperação de upload.

A integração futura de estoque deve respeitar `quantity > 0` e `unit_cost > 0`,
enquanto o vínculo de fornecedor aceita `supplier_price >= 0`: os dois custos
pertencem a contratos diferentes e não devem ser equiparados implicitamente.
São requisições separadas, sem transação única com a criação do produto. Falhas
parciais precisam de tratamento próprio, sem repetir automaticamente uma entrada
de estoque que pode já ter sido efetivada.

Expandir os contratos de marca, descrição ou categorias exige orientação conforme
a restrição original de não alterar o backend sem necessidade comprovada. Nada
foi alterado no backend nesta revisão. As integrações são pendências explícitas
para entregas posteriores, e a PR #42 permanece aberta para revisão, sem merge.

## Imagens e falhas parciais

`POST /products/{id}/images/upload` é um alias já implementado no backend, assim
como `/products/{id}/images`. O frontend usa a rota explícita de upload com
`FormData`: `file`, `order` e `alt_text` opcional. O navegador define o cabeçalho
multipart e seu boundary. `is_primary` não é um parâmetro aceito no envio:
a imagem principal é a de ordem 1.

- Somente MIME `image/jpeg`, `image/png`, `image/webp` e arquivos não vazios.
  A validação do servidor continua obrigatória. O limite de tamanho é configurado
  no backend; não foi inventado um limite diferente no navegador.
- O valor de ordenação escolhido é enviado, em vez de usar a posição da linha.
  É inteiro ≥ 1 quando informado. Vazio omite `order`, permitindo atribuição pelo
  servidor; uploads sequenciais evitam disputar essa atribuição na mesma tela.
- Nenhum upload começa antes da criação bem-sucedida e da obtenção do UUID.
  Arquivo inválido bloqueia a criação até ser removido ou substituído.
- Após falha de upload, o UUID, os arquivos pendentes e os metadados são mantidos.
  O botão de reenvio tenta somente os arquivos que falharam; não repete o POST
  do produto nem os uploads já concluídos. Novas seleções também permanecem
  disponíveis quando seu envio imediato falha.
- Depois de criado, os campos do produto ficam bloqueados para não sugerir que
  alterações locais ainda serão salvas pelo reenvio das imagens. A lista permite
  editar nome, preço e disponibilidade pelo contrato próprio de PATCH.
- Erros e arquivos usam a chave estável de cada linha: remover outra linha não
  desloca a mensagem para a imagem errada. Linhas já enviadas não exibem remoção
  ou edição que não seriam persistidas pelo endpoint de upload.
- Estados de carregamento e travas síncronas impedem submissões e uploads
  concorrentes na mesma tela. “Novo produto”/“Limpar campos” reinicia também UUID,
  arquivos e erros, sem reaproveitar o produto anterior.

## Erros reais dos endpoints

| Status | Exemplo e comportamento |
| --- | --- |
| 400 | Nome/slug duplicado na criação ou edição; formato inválido no upload. Exibe o `detail` do backend. Duplicidade não foi tratada como 409. |
| 404 | Fornecedor ausente na criação, produto ausente na edição ou upload. Preserva a mensagem recebida. |
| 409 | Exclusão de produto com movimentações; mantém o item e mostra a orientação de desativar. |
| 422 | Schema/tipos/UUID inválidos; mantém a política do cliente HTTP de mostrar “Verifique os campos informados.” sem expor o `input` bruto. |
| 413 | Arquivo acima do limite do backend; preserva o `detail` e permite corrigir a imagem. |
| 500/502/503 | Falha ao salvar imagem ou indisponibilidade de armazenamento; preserva os dados para nova tentativa. |
| Rede | Mensagem de conexão do cliente HTTP; nenhuma mutação é repetida automaticamente. |

Se a conexão cair depois de o servidor efetivar um POST, mas antes de responder,
o cliente não consegue confirmar o resultado. O backend não oferece chave de
idempotência para produtos/uploads; consultar a lista antes de repetir é necessário
nessa situação. A recuperação implementada cobre as falhas em que o UUID da
criação já foi confirmado. Não foi inventada garantia de idempotência no servidor.

## Testes e critérios de aceite

Foram adicionados 77 testes unitários e três cenários Playwright, executados em
desktop e celular. Os testes existentes foram preservados; o mock do PATCH no
teste de edição foi corrigido para refletir a resposta real, sem slug.

| Critério da issue | Evidência |
| --- | --- |
| Nomes e tipos alinhados ao `ProductRequest` | `product-payload.test.ts`: payload completo, campos descartados, números, booleanos, opcionais e vínculo de fornecedor |
| Sem campos indevidos no POST | Asserções de chaves nos testes de payload e navegador; imagens, estoque e categorias fora do JSON |
| Obrigatórios e números válidos | Vazio, espaços, preço negativo/não finito, inteiros e limites de medidas/custo/prazo |
| Criação válida e mensagem de slug duplicado | Testes de página com POST bem-sucedido e 400 preservando o rascunho |
| Upload separado, após criação, multipart | Testes do serviço e navegador verificam sequência, URL, arquivo, ordem, texto alternativo e boundary |
| JPG/PNG/WEBP | Serviço aceita os três MIME; serviço/página rejeitam outros formatos e arquivo vazio |
| Erros claros e recuperação | 400/404/409/422, rede, 413/500 e falha parcial de upload; reenvio somente do pendente |
| Edição e painel preservados | Preço vazio não vira zero, slug recarregado, refresh após PATCH sem repetir escrita, exclusão 409 sem remover o item |
| Sem envios duplicados | Dois submits antes de concluir a validação, seleção durante upload e dois cliques em salvar |
| Seções administrativas preservadas sem falso salvamento | Nove controles visíveis e desabilitados, com descrição acessível da indisponibilidade; ausência de IDs manuais, campos fora do POST e estado preservado após concluir o cadastro |

Os testes simulam somente dependências externas HTTP e `ResizeObserver`, ausente
no jsdom. O formulário real, React Hook Form, conversão do payload e serviços são
exercitados. No Playwright, todas as chamadas `/api/v1/**` são interceptadas;
nenhuma mutação chega a serviços reais. Os payloads POST/PATCH também foram
validados diretamente nos schemas Pydantic do checkout local do backend, sem
inicializar a aplicação, acessar banco ou storage.

## Validação

Ambiente: Node 22.23.2, npm 10.9.8, Vitest e coverage-v8 4.1.12, Vite 7.3.8,
Playwright 1.56.1 com Chromium instalado.

```sh
npm ci
npm run typecheck
npm run typecheck:tests
npm run test:coverage
npm run build
npm run test:e2e
npm audit
git diff --check
```

Resultados: instalação, ambas as verificações TypeScript, 119 testes unitários,
48 testes Playwright (24 cenários em dois dispositivos), build, auditoria e
`git diff --check` aprovados; `npm audit` sem vulnerabilidades. Screenshots de
falha recuperável de upload foram inspecionados para conferir o padrão visual.

| Métrica global | Base `main` | Após a correção |
| --- | --- | --- |
| Statements | 78,85% | 78,85% |
| Branches | 77,41% | 78,06% |
| Functions | 60% | 60% |
| Lines | 80,72% | 80,72% |

Cobertura global configurada: statements **78,85%**, branches **78,06%**, functions
**60%**, lines **80,72%**. Os limites **70/70/45/70** e a seleção de arquivos não
foram alterados. Os módulos administrativos ainda não pertencem à seleção do
relatório global; esses percentuais não representam a cobertura dos novos
arquivos. O HTML fica em `artifacts/unit-coverage/index.html`; o CI publica o
artefato `vitest-coverage`.

O backend não foi modificado. Não houve operação no Supabase de produção nem
deploy manual. A issue permanece aberta para revisão; esta entrega não inclui merge.
