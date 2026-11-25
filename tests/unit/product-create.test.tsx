import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ProductCreatePage } from "@/features/admin/pages/ProductCreatePage";

const productId = "a1000000-0000-4000-8000-000000000001";
beforeEach(() => vi.stubGlobal("ResizeObserver", class {
  observe() {}
  unobserve() {}
  disconnect() {}
}));

function mockProductApi(statuses: number[] = []) {
  const uploads: FormData[] = [];
  const creates: unknown[] = [];
  const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(async (url, options) => {
    if (String(url) === "/api/v1/products") {
      creates.push(JSON.parse(String(options?.body)));
      return new Response(JSON.stringify({ id: productId, name: "Batom", slug: "batom", message: "Criado" }));
    }
    if (String(url) === `/api/v1/products/${productId}/images/upload`) {
      const body = options?.body as FormData;
      uploads.push(body);
      const status = statuses.shift() ?? 200;
      return new Response(JSON.stringify(status === 200
        ? { id: uploads.length, url: `/images/${(body.get("file") as File).name}`, order: Number(body.get("order")),
          sort_order: Number(body.get("order")), is_primary: body.get("order") === "1", alt_text: body.get("alt_text") }
        : { detail: "Armazenamento indisponível." }), { status });
    }
    throw new Error(`Unexpected request: ${url}`);
  });
  vi.stubGlobal("fetch", fetch);
  return { fetch, uploads, creates };
}

function renderForm() {
  return render(<MemoryRouter><ProductCreatePage /></MemoryRouter>);
}
function fillMinimum(name = "Batom") {
  fireEvent.change(screen.getByLabelText("Nome *"), { target: { value: name } });
  fireEvent.change(screen.getByLabelText("Preço (R$) *"), { target: { value: "49.9" } });
}
function selectImage(index: number, file = new File(["fixture-image"], "image.png", { type: "image/png" })) {
  fireEvent.change(screen.getByLabelText(`Arquivo da imagem ${index}`), { target: { files: [file] } });
}

describe("product creation regressions", () => {
  it.each([
    "Contato do fornecedor", "E-mail do fornecedor", "Marca", "Descrição principal",
    "Dicas de uso", "Ingredientes", "Tags ou código da categoria", "Quantidade em estoque", "Validade (opcional)",
  ])("preserves the unavailable administrative field %s with an explanation", label => {
    const api = mockProductApi();
    renderForm();
    const field = screen.getByLabelText(label, { exact: true });
    expect(field).toBeVisible();
    expect(field).toBeDisabled();
    expect(field).toHaveAccessibleDescription(/indisponível|indisponíveis/i);
    expect(api.fetch).not.toHaveBeenCalled();
  });

  it("does not ask administrators for brand or description IDs without a selection flow", () => {
    mockProductApi();
    renderForm();
    expect(screen.queryByLabelText("Código da marca")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Código da descrição")).not.toBeInTheDocument();
  });

  it("uploads the order chosen in the form instead of the row index", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(async (_url, options) => {
      const response = options?.body instanceof FormData
        ? { id: 1, url: "/image.png", order: Number(options.body.get("order")), sort_order: Number(options.body.get("order")), alt_text: null, is_primary: false }
        : { id: productId, name: "Batom", slug: "batom" };
      return new Response(JSON.stringify(response));
    });
    vi.stubGlobal("fetch", fetch);
    const { container } = render(<MemoryRouter><ProductCreatePage /></MemoryRouter>);
    fireEvent.change(screen.getByPlaceholderText("Batom Matte Vermelho Power"), { target: { value: "Batom" } });
    fireEvent.change(container.querySelector('input[name="price"]')!, { target: { value: "49.9" } });
    fireEvent.change(screen.getByDisplayValue("1"), { target: { value: "4" } });
    fireEvent.change(container.querySelector('input[type="file"]')!, {
      target: { files: [new File(["fixture-image"], "image.png", { type: "image/png" })] },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar produto" }));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect((fetch.mock.calls[1][1]?.body as FormData).get("order")).toBe("4");
  });

  it.each(["", "   "])("rejects missing/whitespace name %j before creating a product", async name => {
    const api = mockProductApi();
    renderForm();
    fillMinimum(name);
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar produto" }));
    expect(await screen.findByText("Informe o nome comercial.")).toBeVisible();
    expect(screen.getByLabelText("Nome *")).toBeInvalid();
    await waitFor(() => expect(screen.getByLabelText("Nome *")).toHaveFocus());
    expect(api.fetch).not.toHaveBeenCalled();
  });
  it("rejects an empty price instead of silently creating a free product", async () => {
    const api = mockProductApi();
    renderForm();
    fireEvent.change(screen.getByLabelText("Nome *"), { target: { value: "Batom" } });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar produto" }));
    expect(await screen.findByText("O preço é obrigatório.")).toBeVisible();
    expect(api.fetch).not.toHaveBeenCalled();
  });
  it("displays the backend duplicate-slug message and preserves the draft", async () => {
    const api = mockProductApi();
    api.fetch.mockResolvedValueOnce(new Response(JSON.stringify({ detail: "Slug ja existe" }), { status: 400 }));
    renderForm();
    fillMinimum();
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar produto" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Slug ja existe");
    expect(screen.getByLabelText("Nome *")).toHaveValue("Batom");
    expect(screen.getByRole("button", { name: "Cadastrar produto" })).toBeEnabled();
  });
  it.each(["network", "invalid-response", "server-error", "missing-id"])("explains an unconfirmed creation after %s without hiding the error or repeating the POST", async failure => {
    const api = mockProductApi();
    if (failure === "network") api.fetch.mockRejectedValueOnce(new TypeError("offline"));
    else if (failure === "invalid-response") api.fetch.mockResolvedValueOnce(new Response("{invalid"));
    else if (failure === "missing-id") api.fetch.mockResolvedValueOnce(new Response(JSON.stringify({ name: "Batom" })));
    else api.fetch.mockResolvedValueOnce(new Response(JSON.stringify({ detail: "Serviço indisponível." }), { status: 503 }));
    renderForm();
    fillMinimum();
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar produto" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      failure === "network" ? "Não foi possível conectar" : failure === "invalid-response" ? "Não foi possível carregar os dados"
        : failure === "missing-id" ? "Não foi possível confirmar o produto criado" : "Serviço indisponível.",
    );
    expect(screen.getByText(/A criação pode ter sido concluída/)).toBeVisible();
    expect(screen.getByRole("link", { name: "Consultar produtos" })).toHaveAttribute("href", "/admin/produtos");
    expect(screen.getByLabelText("Nome *")).toHaveValue("Batom");
    expect(api.fetch).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Limpar campos" }));
    expect(screen.queryByText(/A criação pode ter sido concluída/)).not.toBeInTheDocument();
  });
  it.each([
    new File(["GIF89a"], "invalid.gif", { type: "image/gif" }),
    new File([], "empty.png", { type: "image/png" }),
  ])("does not create a product while an invalid image is selected (%#)", async file => {
    const api = mockProductApi();
    renderForm();
    fillMinimum();
    selectImage(1, file);
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar produto" }));
    expect(await screen.findByText("Confira as imagens selecionadas antes de continuar.")).toBeVisible();
    expect(api.fetch).not.toHaveBeenCalled();
  });
  it("retains a replacement file after an immediate upload failure and retries only images", async () => {
    const api = mockProductApi([503, 503, 200]);
    renderForm();
    fillMinimum();
    selectImage(1);
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar produto" }));
    await screen.findByText("Produto criado, mas há imagens pendentes. Reenvie as imagens para concluir.");
    expect(screen.getByLabelText("Nome *")).toBeDisabled();
    selectImage(1, new File(["replacement"], "replacement.webp", { type: "image/webp" }));
    await waitFor(() => expect(api.uploads).toHaveLength(2));
    await waitFor(() => expect(screen.getByRole("button", { name: "Reenviar imagens pendentes" })).toBeEnabled());
    expect(screen.getByText("replacement.webp")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Reenviar imagens pendentes" }));
    await waitFor(() => expect(screen.getByLabelText("Nome *")).toHaveValue(""));
    expect(api.creates).toHaveLength(1);
    expect(api.uploads).toHaveLength(3);
    expect((api.uploads[2].get("file") as File).name).toBe("replacement.webp");
  });
  it("does not upload successful images again when another image fails", async () => {
    const api = mockProductApi([200, 503, 200]);
    renderForm();
    fillMinimum();
    selectImage(1, new File(["one"], "one.png", { type: "image/png" }));
    fireEvent.click(screen.getByRole("button", { name: "Adicionar imagem" }));
    selectImage(2, new File(["two"], "two.png", { type: "image/png" }));
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar produto" }));
    await screen.findByText("Produto criado, mas há imagens pendentes. Reenvie as imagens para concluir.");
    expect(screen.getByLabelText("URL da imagem 1")).toHaveValue("/images/one.png");
    expect(screen.getByLabelText("Ordenação da imagem 1")).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Reenviar imagens pendentes" }));
    await waitFor(() => expect(screen.getByLabelText("Nome *")).toHaveValue(""));
    expect(api.creates).toHaveLength(1);
    expect(api.uploads.map(form => (form.get("file") as File).name)).toEqual(["one.png", "two.png", "two.png"]);
  });
  it("prevents another selection and submit from duplicating an immediate upload", async () => {
    const api = mockProductApi([503]);
    const { container } = renderForm();
    fillMinimum(); selectImage(1);
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar produto" }));
    await screen.findByText("Produto criado, mas há imagens pendentes. Reenvie as imagens para concluir.");
    let release!: (response: Response) => void;
    api.fetch.mockImplementationOnce(() => new Promise<Response>(resolve => { release = resolve; }));
    try {
      selectImage(1, new File(["one"], "one.webp", { type: "image/webp" }));
      selectImage(1, new File(["two"], "two.webp", { type: "image/webp" }));
      fireEvent.submit(container.querySelector("form")!);
      expect(api.fetch).toHaveBeenCalledTimes(3);
      expect(screen.getByText("one.webp")).toBeVisible();
      expect(screen.queryByText("two.webp")).not.toBeInTheDocument();
    } finally {
      release(new Response(JSON.stringify({ id: 1, url: "/one.webp", order: 1, sort_order: 1, is_primary: true, alt_text: null })));
    }
    await waitFor(() => expect(screen.getByLabelText("URL da imagem 1")).toHaveValue("/one.webp"));
    expect(api.fetch).toHaveBeenCalledTimes(3);
  });
  it("keeps image errors attached to the correct row after removing another image", () => {
    mockProductApi();
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: "Adicionar imagem" }));
    selectImage(2, new File(["GIF89a"], "invalid.gif", { type: "image/gif" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Remover" })[0]);
    expect(screen.getByRole("alert")).toHaveTextContent("Use JPG, PNG ou WEBP");
    expect(screen.getByText("invalid.gif")).toBeVisible();
    expect(screen.getByLabelText("Arquivo da imagem 1")).toBeInTheDocument();
  });
  it("prevents duplicate creation while validation and the POST are in flight", async () => {
    const api = mockProductApi();
    let release!: (response: Response) => void;
    api.fetch.mockImplementationOnce(() => new Promise<Response>(resolve => { release = resolve; }));
    const { container } = renderForm();
    fillMinimum();
    fireEvent.submit(container.querySelector("form")!);
    fireEvent.submit(container.querySelector("form")!);
    try {
      await waitFor(() => expect(api.fetch).toHaveBeenCalledOnce());
      expect(screen.getByRole("button", { name: "Cadastrar produto" })).toBeDisabled();
    } finally {
      release(new Response(JSON.stringify({ id: productId, name: "Batom", slug: "batom" })));
    }
    await waitFor(() => expect(screen.getByLabelText("Nome *")).toHaveValue(""));
    expect(api.fetch).toHaveBeenCalledOnce();
  });
  it("starts a fresh product after clearing a partially completed creation", async () => {
    const api = mockProductApi([503]);
    renderForm();
    fillMinimum(); selectImage(1);
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar produto" }));
    await screen.findByText("Produto criado, mas há imagens pendentes. Reenvie as imagens para concluir.");
    fireEvent.click(screen.getByRole("button", { name: "Novo produto" }));
    fillMinimum("Outro produto");
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar produto" }));
    await waitFor(() => expect(screen.getByLabelText("Nome *")).toHaveValue(""));
    expect(api.creates).toHaveLength(2);
    expect(api.uploads).toHaveLength(1);
  });
});
