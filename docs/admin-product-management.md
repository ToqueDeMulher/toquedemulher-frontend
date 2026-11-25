# Gerenciamento administrativo de produtos

O painel permite criar rascunhos com nome, descrição, preço, categoria e
estoque; enviar fotos persistentes; escolher a foto principal; editar os dados;
e publicar ou retirar o produto da vitrine.

## Comportamento

- Novos produtos são gravados primeiro como rascunho.
- A opção **Publicar após cadastrar** só é processada depois dos uploads.
- A API exige descrição, categoria, imagem, preço positivo e estoque positivo
  antes de publicar.
- Retirar da vitrine preserva o produto e seu histórico. O painel não oferece
  exclusão definitiva.
- Busca por nome e filtros de status e categoria são executados pela API.
- Ajustes de estoque feitos na edição são registrados pelo backend.

Fornecedor, marca e validade por lote continuam visíveis com explicações nos
pontos em que ainda dependem dos fluxos administrativos específicos. Nenhuma
chave do Supabase é usada pelo navegador; o upload passa pela API autenticada.

## Dependências

Esta branch foi criada sobre a PR #42, que corrige o contrato básico de
cadastro e o fluxo seguro de upload. A PR de frontend deve ser revisada depois
da #42 ou permanecer como PR empilhada até sua integração. A API correspondente
precisa ser publicada junto com o frontend.
