import { expect, test, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const id = "a1000000-0000-4000-8000-000000000001";
const product = { id, name: "Batom", slug: "batom", price: 49.9, active: true, image: "" };
const file = { name: "produto.png", mimeType: "image/png", buffer: Buffer.from("fixture-image") };

async function mockAdmin(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("tdm_access_token", "fixture-admin-token");
    localStorage.setItem("tdm_auth_user", JSON.stringify({ id: "b1000000-0000-4000-8000-000000000001",
      name: "Admin de teste", email: "admin@example.test", role: "admin" }));
  });
  await page.route("**/api/v1/**", route => {
    if (route.request().method() !== "GET") return route.fulfill({ status: 500, json: { detail: "Unexpected mutation" } });
    const path = new URL(route.request().url()).pathname;
    return route.fulfill({ json: path === "/api/v1/store" ? { free_shipping_threshold: 150 } : [] });
  });
}

test("admin creates the exact product contract and retries a failed multipart upload without another product", async ({ page }, testInfo) => {
  await mockAdmin(page);
  const events: string[] = [];
  await page.route("**/api/v1/products", async route => {
    if (route.request().method() !== "POST") return route.fallback();
    events.push("create");
    const body = route.request().postDataJSON();
    expect(body).toMatchObject({ name: "Produto de contrato", price: 49.9, spf: 50, active: false, vegan: true,
      supplier_products: [{ supplier_name: "Fornecedor existente", supplier_price: 25, lead_time_days: 2 }] });
    for (const key of ["id", "slug", "images", "supplier_contact", "supplier_email", "brand_name", "description_text",
      "description_usage_tips", "description_ingredients", "categories_names", "stock_quantity", "stock_expiry_date"]) {
      expect(body).not.toHaveProperty(key);
    }
    await route.fulfill({ json: { id, name: body.name, slug: "produto-de-contrato", message: "Criado" } });
  });
  let uploads = 0;
  await page.route(`**/api/v1/products/${id}/images/upload`, async route => {
    events.push("upload");
    uploads++;
    expect(route.request().headers()["content-type"]).toMatch(/^multipart\/form-data; boundary=/);
    const body = route.request().postData() ?? "";
    expect(body).toContain('name="file"; filename="produto.png"');
    expect(body).toContain('name="order"\r\n\r\n4');
    expect(body).toContain('name="alt_text"\r\n\r\nFoto do produto');
    expect(body).not.toContain('name="is_primary"');
    await route.fulfill({ status: uploads === 1 ? 503 : 200, json: uploads === 1
      ? { detail: "Armazenamento de imagens indisponivel. Tente novamente." }
      : { id: 1, url: "/icone.png", order: 4, sort_order: 4, is_primary: false, alt_text: "Foto do produto" } });
  });
  await page.goto("/admin/produtos/novo");
  const unavailableFields = ["Contato do fornecedor", "E-mail do fornecedor", "Marca", "Descrição principal",
    "Dicas de uso", "Ingredientes", "Tags ou código da categoria", "Quantidade em estoque", "Validade (opcional)"];
  for (const label of unavailableFields) {
    const field = page.getByLabel(label, { exact: true });
    await expect(field).toBeVisible();
    await expect(field).toBeDisabled();
    await expect(field).toHaveAccessibleDescription(/indisponível|indisponíveis/i);
  }
  await expect(page.getByLabel("Código da marca", { exact: true })).toHaveCount(0);
  await expect(page.getByLabel("Código da descrição", { exact: true })).toHaveCount(0);
  await page.getByLabel("Nome *", { exact: true }).fill("Produto de contrato");
  await page.getByLabel("Preço (R$) *", { exact: true }).fill("49.9");
  await page.getByLabel("Proteção solar (SPF)", { exact: true }).fill("50");
  await page.getByRole("checkbox", { name: "Produto ativo", exact: true }).uncheck();
  await page.getByRole("checkbox", { name: "Vegano", exact: true }).check();
  await page.getByLabel("Nome do fornecedor", { exact: true }).fill("Fornecedor existente");
  await page.getByLabel("Custo do fornecedor (R$)", { exact: true }).fill("25");
  await page.getByLabel("Prazo do fornecedor (dias)", { exact: true }).fill("2");
  await page.getByLabel("Ordenação da imagem 1", { exact: true }).fill("4");
  await page.getByLabel("Texto alternativo da imagem 1", { exact: true }).fill(" Foto do produto ");
  await page.getByLabel("Arquivo da imagem 1", { exact: true }).setInputFiles(file);
  expect(events).toEqual([]);
  await page.getByRole("button", { name: "Cadastrar produto", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Produto criado, mas há imagens pendentes" })).toBeVisible();
  await expect(page.getByLabel("Nome *", { exact: true })).toBeDisabled();
  expect(events).toEqual(["create", "upload"]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await mkdir("artifacts/screenshots", { recursive: true });
  await page.screenshot({ path: `artifacts/screenshots/${testInfo.project.name}-product-upload-retry.png`, fullPage: true });
  await page.getByRole("button", { name: "Reenviar imagens pendentes", exact: true }).click();
  await expect(page.getByLabel("Nome *", { exact: true })).toHaveValue("");
  await expect(page.getByLabel("Nome *", { exact: true })).toBeEnabled();
  for (const label of unavailableFields) await expect(page.getByLabel(label, { exact: true })).toBeDisabled();
  expect(events).toEqual(["create", "upload", "upload"]);
});

test("admin keeps long image filenames readable without horizontal overflow", async ({ page }, testInfo) => {
  await mockAdmin(page);
  await page.goto("/admin/produtos/novo");
  const filename = `${"produto".repeat(28)}.png`;
  await page.getByLabel("Arquivo da imagem 1", { exact: true }).setInputFiles({ ...file, name: filename });
  const selection = page.getByText(filename, { exact: true });
  await expect(selection).toBeVisible();
  const dimensions = await selection.evaluate(element => ({
    left: element.getBoundingClientRect().left,
    right: element.getBoundingClientRect().right,
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.left).toBeGreaterThanOrEqual(0);
  expect(dimensions.right).toBeLessThanOrEqual(dimensions.viewport);
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewport);
  await mkdir("artifacts/screenshots", { recursive: true });
  await page.screenshot({ path: `artifacts/screenshots/${testInfo.project.name}-product-long-filename.png`, fullPage: true });
});

test("admin rejects invalid required values and invalid images before creating a product", async ({ page }) => {
  await mockAdmin(page);
  const mutations: string[] = [];
  page.on("request", request => {
    if (request.method() === "POST" && request.url().includes("/products")) mutations.push(request.url());
  });
  await page.goto("/admin/produtos/novo");
  await page.getByLabel("Nome *", { exact: true }).fill("   ");
  await page.getByLabel("Preço (R$) *", { exact: true }).fill("-1");
  await page.getByRole("button", { name: "Cadastrar produto", exact: true }).click();
  await expect(page.getByText("Informe o nome comercial.", { exact: true })).toBeVisible();
  await expect(page.getByText("O preço deve ser maior ou igual a 0.", { exact: true })).toBeVisible();
  await page.getByLabel("Nome *", { exact: true }).fill("Produto válido");
  await page.getByLabel("Preço (R$) *", { exact: true }).fill("0");
  await page.getByLabel("Arquivo da imagem 1", { exact: true }).setInputFiles({ name: "invalid.gif", mimeType: "image/gif", buffer: Buffer.from("GIF89a") });
  await page.getByRole("button", { name: "Cadastrar produto", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Use JPG, PNG ou WEBP" })).toBeVisible();
  await expect(page.getByRole("alert").filter({ hasText: "Confira as imagens selecionadas" })).toBeVisible();
  expect(mutations).toEqual([]);
});

test("admin preserves an empty price draft, reloads regenerated slugs and displays delete conflicts", async ({ page }) => {
  await mockAdmin(page);
  let current = product;
  let failRefresh = false;
  let patches = 0;
  await page.route("**/api/v1/products/admin/all", route => {
    if (failRefresh) {
      failRefresh = false;
      return route.fulfill({ status: 503, json: { detail: "Lista temporariamente indisponível." } });
    }
    return route.fulfill({ json: [current] });
  });
  await page.route(`**/api/v1/products/${id}`, async route => {
    if (route.request().method() === "DELETE") return route.fulfill({ status: 409,
      json: { detail: "Este produto possui movimentacoes e nao pode ser excluido. Desative-o em vez disso." } });
    expect(route.request().method()).toBe("PATCH");
    patches++;
    expect(route.request().postDataJSON()).toEqual({ name: "Batom rosa", price: 55.5, active: false });
    current = { ...product, name: "Batom rosa", slug: "batom-rosa", price: 55.5, active: false };
    failRefresh = true;
    await route.fulfill({ json: { id, name: current.name, price: current.price, active: current.active } });
  });
  await page.goto("/admin/produtos");
  await page.getByRole("button", { name: "Editar", exact: true }).click();
  await page.getByLabel("Preço do produto", { exact: true }).fill("");
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveText("O preço é obrigatório.");
  expect(patches).toBe(0);
  await expect(page.getByLabel("Preço do produto", { exact: true })).toHaveValue("");
  await page.getByLabel("Nome do produto", { exact: true }).fill("Batom rosa");
  await page.getByLabel("Preço do produto", { exact: true }).fill("55.5");
  await page.getByLabel("Ativo na vitrine", { exact: true }).uncheck();
  await page.getByRole("button", { name: "Salvar", exact: true }).evaluate(button => { (button as HTMLButtonElement).click(); (button as HTMLButtonElement).click(); });
  await expect(page.getByRole("alert")).toContainText("O produto foi salvo, mas a lista não pôde ser recarregada");
  expect(patches).toBe(1);
  await expect(page.getByText("batom", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Atualizar", exact: true }).click();
  await expect(page.getByText("batom-rosa", { exact: true })).toBeVisible();
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Excluir", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Desative-o em vez disso");
  await expect(page.getByText("Batom rosa", { exact: true })).toBeVisible();
});
