import { expect, test, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const id = "a1000000-0000-4000-8000-000000000001";
const product = { id, name: "Batom", slug: "batom", price: 49.9, active: false, status: "draft", image: "",
  images: [], categories: [{ id: 1, name: "Maquiagem" }], category_ids: [1],
  description: { text: "Cor intensa", usage_tips: null, ingredients: null }, stock_quantity: 2 };
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
  const unavailableFields = ["Contato do fornecedor", "E-mail do fornecedor", "Marca", "Validade (opcional)"];
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
  await expect(page.getByRole("checkbox", { name: "Publicar após cadastrar", exact: true })).not.toBeChecked();
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

test("admin previews, saves and explicitly publishes announcement content", async ({ page }, testInfo) => {
  await mockAdmin(page);
  let messages = [{ id: "d1000000-0000-4000-8000-000000000001", text: "Aviso original", destination: "/carrinho", active: true, sort_order: 1 }];
  let publications = 0;
  const revision = () => ({ id: "e1000000-0000-4000-8000-000000000001", status: "draft", updated_at: new Date().toISOString(), published_at: null, messages });
  await page.route("**/api/v1/announcements/admin/draft", async route => {
    if (route.request().method() === "PUT") {
      messages = route.request().postDataJSON().messages.map((message: typeof messages[number], index: number) => ({ ...message, id: `saved-${index}` }));
    }
    await route.fulfill({ json: revision() });
  });
  await page.route("**/api/v1/announcements/admin/publish", async route => {
    publications += 1;
    await route.fulfill({ json: { ...revision(), status: "published", published_at: new Date().toISOString() } });
  });

  await page.goto("/admin/conteudo/avisos");
  await expect(page.getByRole("heading", { name: "Faixa de avisos", exact: true })).toBeVisible();
  await page.getByRole("textbox", { name: "Mensagem 1", exact: true }).fill("Frete grátis neste fim de semana");
  await expect(page.getByRole("region", { name: "Pré-visualização da faixa de avisos" }).getByText("Frete grátis neste fim de semana").first()).toBeVisible();
  await expect(page.getByRole("button", { name: /Publicar na loja/ })).toBeDisabled();
  await page.getByRole("button", { name: /Salvar rascunho/ }).click();
  await expect(page.getByText("Rascunho salvo. A loja ainda não foi alterada.")).toBeVisible();
  expect(publications).toBe(0);
  await page.getByRole("button", { name: /Publicar na loja/ }).click();
  await expect(page.getByText("Faixa de avisos publicada na loja.")).toBeVisible();
  expect(publications).toBe(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await mkdir("artifacts/screenshots", { recursive: true });
  await page.screenshot({ path: `artifacts/screenshots/${testInfo.project.name}-announcement-content.png`, fullPage: true });
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

test("admin edits stock and description, filters drafts and publishes through the validated endpoint", async ({ page }) => {
  await mockAdmin(page);
  let current = product;
  let patches = 0;
  await page.route("**/api/v1/products/admin/categories", route => route.fulfill({ json: [{ id: 1, name: "Maquiagem" }] }));
  await page.route("**/api/v1/products/admin/all**", route => {
    return route.fulfill({ json: [current] });
  });
  await page.route(`**/api/v1/products/${id}`, async route => {
    expect(route.request().method()).toBe("PATCH");
    patches++;
    expect(route.request().postDataJSON()).toMatchObject({ name: "Batom rosa", price: 55.5,
      stock_quantity: 4, category_ids: [1], description: { text: "Nova descrição" } });
    current = { ...current, name: "Batom rosa", price: 55.5, stock_quantity: 4,
      description: { ...current.description, text: "Nova descrição" } };
    await route.fulfill({ json: current });
  });
  await page.route(`**/api/v1/products/${id}/publish`, route => {
    current = { ...current, active: true, status: "published" };
    return route.fulfill({ json: current });
  });
  await page.goto("/admin/produtos");
  await page.getByLabel("Filtrar por status").selectOption("draft");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();
  await page.getByRole("button", { name: "Editar", exact: true }).click();
  await page.getByLabel("Preço do produto", { exact: true }).fill("");
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveText("O preço é obrigatório.");
  expect(patches).toBe(0);
  await expect(page.getByLabel("Preço do produto", { exact: true })).toHaveValue("");
  await page.getByLabel("Nome do produto", { exact: true }).fill("Batom rosa");
  await page.getByLabel("Preço do produto", { exact: true }).fill("55.5");
  await page.getByLabel("Estoque do produto", { exact: true }).fill("4");
  await page.getByLabel("Descrição do produto", { exact: true }).fill("Nova descrição");
  await page.getByRole("button", { name: "Salvar", exact: true }).evaluate(button => { (button as HTMLButtonElement).click(); (button as HTMLButtonElement).click(); });
  expect(patches).toBe(1);
  await expect(page.getByText(/4 em estoque/)).toBeVisible();
  await page.getByRole("button", { name: "Publicar", exact: true }).click();
  await expect(page.getByText(/4 em estoque · Publicado/)).toBeVisible();
});
