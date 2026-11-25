import { afterEach, describe, expect, it, vi } from "vitest";
import { createProduct, deleteProduct, updateProduct, uploadProductImage } from "@/features/admin/api/product-service";
import { AUTH_TOKEN_KEY } from "@/shared/api/api-client";

const productId = "a1000000-0000-4000-8000-000000000001";
afterEach(() => vi.unstubAllGlobals());
const payload = { name: "Batom", price: 49.9, active: true };
const image = () => new File(["fixture-image"], "image.png", { type: "image/png" });
function respond(body: unknown, status = 200) {
  const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(async () => new Response(JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

describe("product image contract", () => {
  it("rejects unsupported image types before sending a request", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response(JSON.stringify({ id: 1, url: "/image.gif" })));
    vi.stubGlobal("fetch", fetch);
    await expect(uploadProductImage(productId, new File(["GIF89a"], "image.gif", { type: "image/gif" })))
      .rejects.toThrow("Use JPG, PNG ou WEBP");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("creates JSON separately from a multipart upload, leaving its boundary to the browser", async () => {
    localStorage.setItem(AUTH_TOKEN_KEY, "fixture-admin-token");
    const fetch = respond({ id: productId, name: "Batom", slug: "batom", message: "Criado" });
    await expect(createProduct(payload)).resolves.toMatchObject({ id: productId });
    expect(fetch.mock.calls[0][0]).toBe("/api/v1/products");
    expect(fetch.mock.calls[0][1]?.method).toBe("POST");
    expect(JSON.parse(String(fetch.mock.calls[0][1]?.body))).toEqual(payload);
    fetch.mockResolvedValueOnce(new Response(JSON.stringify({ id: 1, url: "/image.png", order: 4,
      sort_order: 4, alt_text: "Batom", is_primary: false })));
    await uploadProductImage(productId, image(), { order: 4, alt_text: " Batom " });
    const [url, options] = fetch.mock.calls[1];
    expect(url).toBe(`/api/v1/products/${productId}/images/upload`);
    expect(options?.method).toBe("POST");
    const form = options?.body as FormData;
    expect(form.get("file")).toBeInstanceOf(File);
    expect(form.get("order")).toBe("4");
    expect(form.get("alt_text")).toBe("Batom");
    expect(form.has("is_primary")).toBe(false);
    expect(new Headers(options?.headers).get("Content-Type")).toBeNull();
    expect(new Headers(options?.headers).get("Authorization")).toBe("Bearer fixture-admin-token");
  });

  it("omits optional multipart fields when the backend should assign them", async () => {
    const fetch = respond({});
    await uploadProductImage(productId, image(), { alt_text: " " });
    const keys: string[] = [];
    (fetch.mock.calls[0][1]?.body as FormData).forEach((_value, key) => keys.push(key));
    expect(keys).toEqual(["file"]);
  });
  it.each([0, -1, 1.5, Infinity, NaN])("rejects invalid order %s without uploading", async order => {
    const fetch = respond({});
    await expect(uploadProductImage(productId, image(), { order })).rejects.toThrow("ordenação");
    expect(fetch).not.toHaveBeenCalled();
  });
  it("rejects an empty image before contacting storage through the API", async () => {
    const fetch = respond({});
    await expect(uploadProductImage(productId, new File([], "empty.png", { type: "image/png" })))
      .rejects.toThrow("conteúdo");
    expect(fetch).not.toHaveBeenCalled();
  });
  it.each(["image/jpeg", "image/png", "image/webp"])("accepts the backend-supported MIME type %s", async type => {
    const fetch = respond({ id: 1 });
    await uploadProductImage(productId, new File(["fixture"], "image", { type }));
    expect(fetch).toHaveBeenCalledOnce();
  });

  it.each([
    { request: () => createProduct(payload), status: 400, message: "Slug ja existe" },
    { request: () => createProduct(payload), status: 404, message: "Fornecedor não encontrado" },
    { request: () => updateProduct(productId, { name: "Novo nome" }), status: 404, message: "Produto nao encontrado" },
    { request: () => deleteProduct(productId), status: 409, message: "Este produto possui movimentacoes e nao pode ser excluido. Desative-o em vez disso." },
    { request: () => uploadProductImage(productId, image()), status: 400, message: "Formato de imagem invalido. Use JPG, PNG ou WEBP." },
    { request: () => uploadProductImage(productId, image()), status: 404, message: "Produto nao encontrado." },
    { request: () => uploadProductImage(productId, image()), status: 413, message: "Arquivo excede o limite de 10 bytes." },
    { request: () => uploadProductImage(productId, image()), status: 500, message: "Erro interno ao salvar imagem." },
  ])("preserves real endpoint error $status: $message", async ({ request, status, message }) => {
    respond({ detail: message }, status);
    await expect(request()).rejects.toMatchObject({ status, message });
  });
  it("handles FastAPI 422 validation errors without disclosing raw field inputs", async () => {
    respond({ detail: [{ loc: ["body", "price"], msg: "invalid", input: "private-input" }] }, 422);
    await expect(createProduct(payload)).rejects.toMatchObject({ status: 422, message: "Verifique os campos informados." });
  });
  it.each([
    () => createProduct(payload), () => updateProduct(productId, { price: 1 }), () => uploadProductImage(productId, image()),
  ])("reports network failure without automatically repeating a mutation (%#)", async request => {
    const fetch = respond({});
    fetch.mockRejectedValueOnce(new TypeError("offline"));
    await expect(request()).rejects.toThrow("Não foi possível conectar");
    expect(fetch).toHaveBeenCalledOnce();
  });
  it("encodes identifiers and sends only the PATCH contract", async () => {
    const fetch = respond({ id: productId, name: "Novo nome", price: 0, active: false });
    await updateProduct("id/with?reserved#chars", { name: "Novo nome", price: 0, active: false });
    expect(fetch.mock.calls[0][0]).toBe("/api/v1/products/id%2Fwith%3Freserved%23chars");
    expect(fetch.mock.calls[0][1]?.method).toBe("PATCH");
    expect(JSON.parse(String(fetch.mock.calls[0][1]?.body))).toEqual({ name: "Novo nome", price: 0, active: false });
  });
});
