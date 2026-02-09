# Toque de Mulher Website Design

This is a code bundle for Toque de Mulher Website Design. The original project is available at https://www.figma.com/design/Vd6o95CVqetyePwxnAweiA/Toque-de-Mulher-Website-Design.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Cadastro de produtos

- Clique em **Cadastrar Produto** no topo do site para abrir a nova página administrativa.
- Preencha os campos obrigatórios (slug, nome, preço e imagens) e os metadados opcionais.
- O painel gera automaticamente o JSON aceito pelo endpoint `POST /products` e envia uma requisição usando `fetch`.
- Utilize IDs de categorias, fornecedores e marcas já existentes; separe múltiplos valores por vírgula.
- Após o envio, um toast confirma o resultado e o formulário é resetado.
