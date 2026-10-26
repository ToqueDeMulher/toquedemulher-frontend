import { test, expect, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";

// Isolated API fixtures only. These are never imported by the application.
const id = "a1000000-0000-4000-8000-000000000001";
const otherId = "a1000000-0000-4000-8000-000000000002";
const user = { id: "b1000000-0000-4000-8000-000000000001", name: "Cliente de teste", email: "cliente@example.test", role: "customer" };
const product = {
  id, slug: "perfume-teste", name: "Perfume do catálogo de teste", price: 199.9,
  image: "/icone.png", images: [{ url: "/icone.png", alt: "Foto de teste" }],
  categories: ["perfumes"], category: "perfumes", subcategory: "floral",
  description: "Descrição cadastrada na API de teste.", composition: "", benefits: "", howToUse: "",
  color: "Rosa", volume: "50 ml", available: true, stockQuantity: 4, rating: 0, reviews: 0,
};
const address = { id: otherId, label: "Casa", cep: "70040010", street: "Endereço de teste", number: "1", neighborhood: "Centro", city: "Brasília", state: "DF", is_default_shipping: true, is_default_billing: false };
const quote = () => ({ id: "c1000000-0000-4000-8000-000000000001", postal_code: "70040010", subtotal: 199.9,
  expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), item_prices: [{ id, name: product.name, unit_price: 199.9 }],
  services: [
    { id: 1, name: "Econômica", company: "Transportadora de teste", price: 0, cost: 15, delivery_min: 7, delivery_max: 9 },
    { id: 2, name: "Expressa", company: "Transportadora de teste", price: 29, cost: 29, delivery_min: 2, delivery_max: 2 },
  ],
});

async function mockStore(page: Page, products = [product]) {
  await page.route("**/api/v1/**", async route => {
    const path = new URL(route.request().url()).pathname;
    const data = path === "/api/v1/products" ? products
      : path === "/api/v1/store" ? { free_shipping_threshold: 150, contact_email: null }
      : path === "/api/v1/addresses/" ? [address]
      : path === "/api/v1/user/login" ? { access_token: "local-test-token", token_type: "bearer" }
      : path === "/api/v1/user/me" ? user : {};
    await route.fulfill({ json: data });
  });
  await page.route("https://accounts.google.com/**", route => route.abort());
}

async function seedCart(page: Page, loggedIn = false) {
  await page.addInitScript(({ id, user, loggedIn }) => {
    localStorage.setItem("tdm_cart_items", JSON.stringify([{ productId: id, quantity: 1, product: { id, price: 0.01, name: "Preço adulterado" } }]));
    if (loggedIn) {
      localStorage.setItem("tdm_access_token", "local-test-token");
      localStorage.setItem("tdm_auth_user", JSON.stringify(user));
    }
  }, { id, user, loggedIn });
}

async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}
async function capture(page: Page, name: string, project: string) {
  await mkdir("artifacts/screenshots", { recursive: true });
  await page.evaluate(async () => {
    for (let offset = 0; offset < document.body.scrollHeight; offset += window.innerHeight) {
      window.scrollTo(0, offset);
      await new Promise(requestAnimationFrame);
    }
    window.scrollTo(0, 0);
    await new Promise(requestAnimationFrame);
  });
  await page.screenshot({ path: `artifacts/screenshots/${project}-${name}.png`, fullPage: true, animations: "disabled" });
}

test("API catalog, search, category, product details and real IDs", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await mockStore(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: product.name }).first()).toBeVisible();
  await expect(page.getByText("Lancome - La Vie Est Belle", { exact: false })).toHaveCount(0);
  await noOverflow(page);
  await capture(page, "home", testInfo.project.name);
  await page.getByRole("link", { name: "Explorar perfumes", exact: true }).first().click();
  await expect(page).toHaveURL(/categoria\/perfumes/);
  await expect(page.getByRole("heading", { name: product.name })).toBeVisible();
  await noOverflow(page);
  await capture(page, "category", testInfo.project.name);
  await page.getByRole("button", { name: `Ver detalhes do produto ${product.name}` }).click();
  await expect(page).toHaveURL(new RegExp(`/produto/${id}`));
  await expect(page.getByRole("heading", { level: 1, name: product.name })).toBeVisible();
  await expect(page.getByText("Este produto ainda não tem avaliações.")).toBeVisible();
  await expect(page.getByText("50 ml", { exact: true })).toBeVisible();
  await capture(page, "product", testInfo.project.name);
  await page.getByRole("button", { name: "Adicionar ao carrinho", exact: true }).click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("tdm_cart_items") ?? "[]"))).toEqual([{ productId: id, quantity: 1 }]);
  await page.keyboard.press("Escape");
  await page.goto("/busca?q=Perfume");
  await expect(page.getByRole("heading", { name: product.name })).toBeVisible();
  await noOverflow(page);
  expect(errors).toEqual([]);
});

test("API failure has retry, no demo products; empty and inactive catalog", async ({ page }) => {
  await mockStore(page);
  let fail = true;
  await page.route("**/api/v1/products", route => fail ? route.abort("failed") : route.fulfill({ json: [] }));
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText("Não foi possível conectar à loja");
  await expect(page.getByRole("button", { name: "Adicionar", exact: true })).toHaveCount(0);
  fail = false;
  await page.getByRole("button", { name: "Tentar novamente", exact: true }).click();
  await expect(page.getByText("Nenhum produto publicado no momento.")).toBeVisible();
  await page.goto(`/produto/${id}`);
  await expect(page.getByRole("heading", { name: "Produto não encontrado" })).toBeVisible();
});

test("cart revalidates price and quote, retries network failure, selected cost and deadline", async ({ page }, testInfo) => {
  await mockStore(page);
  await seedCart(page);
  let attempts = 0;
  await page.route("**/api/v1/shipping/quotes", async route => {
    expect(route.request().postDataJSON().items[0].id).toBe(id);
    expect(route.request().postDataJSON().postal_code).toBe("70040010");
    attempts += 1;
    if (attempts === 1) await route.abort("failed");
    else await route.fulfill({ json: quote() });
  });
  await page.goto("/carrinho");
  await expect(page.getByText("Preço adulterado")).toHaveCount(0);
  await expect(page.getByText("Valor mínimo atingido.", { exact: false })).toBeVisible();
  await expect(page.getByText("Entrega gratuita confirmada", { exact: false })).toHaveCount(0);
  await page.getByRole("textbox", { name: "CEP para calcular a entrega" }).fill("70040-010");
  await page.getByRole("button", { name: "Calcular", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Não foi possível conectar à loja");
  await page.getByRole("button", { name: "Tentar novamente", exact: true }).click();
  await expect(page.getByText("Entrega gratuita confirmada na opção selecionada.")).toBeVisible();
  await page.getByRole("radio").nth(1).check();
  await expect(page.getByText("Prazo estimado: 2 dias úteis após postagem.")).toBeVisible();
  await expect(page.getByText("R$ 228,90", { exact: true })).toBeVisible();
  await noOverflow(page);
  await capture(page, "cart", testInfo.project.name);
});

test("checkout offers login and preserves cart and return route", async ({ page }, testInfo) => {
  await mockStore(page);
  await seedCart(page);
  await page.goto("/checkout/address");
  await page.getByRole("button", { name: "Entrar ou criar conta" }).waitFor();
  await capture(page, "checkout-login", testInfo.project.name);
  await page.getByRole("button", { name: "Entrar ou criar conta" }).click();
  await page.locator("#email").fill(user.email);
  await page.locator("#password").fill("Senha@123");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/checkout\/address/);
  await expect(page.getByText("Endereço de teste", { exact: false }).first()).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("tdm_cart_items") ?? "[]")[0].productId)).toBe(id);
  await noOverflow(page);
});

test("contact confirms only accepted send, retains message on failure", async ({ page }, testInfo) => {
  await mockStore(page);
  let accepted = false;
  await page.route("**/api/v1/contact", route => route.fulfill({ status: accepted ? 202 : 503, json: accepted ? { message: "Mensagem enviada. Obrigada por entrar em contato." } : { detail: "Não foi possível enviar sua mensagem. Tente novamente." } }));
  await page.goto("/institucional/contato");
  await page.getByLabel("Nome completo", { exact: true }).fill(user.name);
  await page.getByLabel("E-mail", { exact: true }).fill(user.email);
  await page.getByLabel("Assunto").selectOption("Pedido");
  await page.getByLabel("Mensagem", { exact: true }).fill("Preciso de ajuda com meu pedido de teste.");
  await page.getByRole("button", { name: "Enviar mensagem" }).click();
  await expect(page.getByRole("alert")).toContainText("Sua mensagem foi mantida");
  await expect(page.getByLabel("Mensagem", { exact: true })).not.toBeEmpty();
  await expect(page.getByText("Mensagem enviada.", { exact: false })).toHaveCount(0);
  accepted = true;
  await page.getByRole("button", { name: "Tentar enviar novamente" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Mensagem enviada" })).toBeVisible();
  await expect(page.getByText("(11) 93333-3333")).toHaveCount(0);
  await noOverflow(page);
  await capture(page, "contact", testInfo.project.name);
});

test("redirect alone never approves payment or clears cart", async ({ page }, testInfo) => {
  await mockStore(page);
  await seedCart(page, true);
  let status = "pending";
  await page.route("**/api/v1/payments/checkout/cs_test", route => route.fulfill({ json: { session_id: "cs_test", order_id: otherId, status, amount: 199.9, currency: "BRL" } }));
  await page.goto("/checkout/success?session_id=cs_test");
  await expect(page.getByRole("heading", { name: "Pagamento em processamento" })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("tdm_cart_items") ?? "[]").length)).toBe(1);
  await expect(page.getByRole("heading", { name: "Pedido confirmado" })).toHaveCount(0);
  await capture(page, "payment-pending", testInfo.project.name);
  await page.evaluate(({ id }) => sessionStorage.setItem("tdm_checkout_snapshot", JSON.stringify({ sessionId: "cs_test", items: [{ id, quantity: 1 }] })), { id });
  status = "approved";
  await page.getByRole("button", { name: "Verificar novamente" }).click();
  await expect(page.getByRole("heading", { name: "Pagamento confirmado", exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("tdm_cart_items") ?? "[]").length)).toBe(0);
  await noOverflow(page);
});

test("unavailable products cannot be added; mobile menu works", async ({ page }, testInfo) => {
  await mockStore(page, [{ ...product, available: false, stockQuantity: 0 }]);
  await page.goto(`/produto/${id}`);
  await expect(page.getByRole("button", { name: "Produto indisponível", exact: true })).toBeDisabled();
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "Abrir menu" }).click();
    await expect(page.getByRole("navigation", { name: "Menu do celular" })).toBeVisible();
    await page.getByRole("navigation", { name: "Menu do celular" }).getByRole("link", { name: "Perfumes", exact: true }).click();
    await expect(page).toHaveURL(/categoria\/perfumes/);
  }
  await noOverflow(page);
});

test("checkout sends IDs and selected shipping and keeps cart after payment API failure", async ({ page }, testInfo) => {
  await mockStore(page);
  await seedCart(page, true);
  await page.route("**/api/v1/shipping/quotes", route => route.fulfill({ json: quote() }));
  let submitted: any = null;
  await page.route("**/api/v1/payments/checkout", async route => {
    submitted = route.request().postDataJSON();
    await route.fulfill({ status: 503, json: { detail: "Pagamento indisponível. Tente novamente." } });
  });
  await page.goto("/checkout/address");
  await page.getByRole("button", { name: "Continuar para pagamento" }).click();
  await expect(page).toHaveURL(/checkout\/payment/);
  await page.getByLabel("Telefone com DDD", { exact: true }).fill("11999999999");
  await page.getByLabel("CPF do destinatário", { exact: true }).fill("52998224725");
  await expect(page.getByRole("button", { name: "Ir para pagamento seguro" })).toBeDisabled();
  await page.getByRole("button", { name: "Calcular entrega", exact: true }).click();
  await page.getByRole("radio").nth(1).check();
  await expect(page.getByText("R$ 228,90", { exact: true }).last()).toBeVisible();
  await capture(page, "checkout-payment", testInfo.project.name);
  await page.getByRole("button", { name: "Ir para pagamento seguro" }).click();
  await expect.poll(() => submitted).not.toBeNull();
  expect(submitted.items).toEqual([{ id, product_url: `/produto/${id}`, quantity: 1 }]);
  expect(submitted.shipping.service_id).toBe(2);
  expect(submitted.shipping.quote_id).toBe(quote().id);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("tdm_cart_items") ?? "[]").length)).toBe(1);
  await expect(page.getByRole("button", { name: "Ir para pagamento seguro" })).toBeEnabled();
  await noOverflow(page);
});

test("catalog revalidation reflects admin price and stock changes", async ({ page }) => {
  await mockStore(page);
  await seedCart(page);
  let current = { ...product };
  await page.route("**/api/v1/products", route => route.fulfill({ json: [current] }));
  await page.goto("/carrinho");
  await expect(page.getByRole("button", { name: "Continuar para entrega" })).toBeEnabled();
  current = { ...product, price: 249.9, stockQuantity: 0, available: false };
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.getByText("Produto indisponível. Remova para continuar.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Continuar para entrega" })).toBeDisabled();
  await expect(page.getByText("R$ 249,90", { exact: true }).first()).toBeVisible();
});

test("cart changes invalidate a selected quote", async ({ page }) => {
  await mockStore(page);
  await seedCart(page);
  await page.route("**/api/v1/shipping/quotes", route => route.fulfill({ json: quote() }));
  await page.goto("/carrinho");
  await page.getByRole("textbox", { name: "CEP para calcular a entrega" }).fill("70040010");
  await page.getByRole("button", { name: "Calcular", exact: true }).click();
  await expect(page.getByRole("radio")).toHaveCount(2);
  await page.getByRole("button", { name: `Aumentar quantidade de ${product.name}` }).click();
  await expect(page.getByRole("radio")).toHaveCount(0);
  await expect(page.getByText("Subtotal sem frete", { exact: true })).toBeVisible();
});

test("cancellation requires server confirmation and preserves cart", async ({ page }) => {
  await mockStore(page);
  await seedCart(page, true);
  let confirmed = false;
  await page.route(`**/api/v1/payments/checkout/${otherId}/cancel`, route => route.fulfill({
    status: confirmed ? 200 : 503,
    json: confirmed ? { status: "cancelled", session_id: "cs_cancelled", order_id: otherId, amount: 199.9, currency: "BRL" }
      : { detail: "Não foi possível confirmar o cancelamento." },
  }));
  await page.goto(`/checkout/failure?order_id=${otherId}`);
  await expect(page.getByRole("heading", { name: "Não foi possível confirmar" })).toBeVisible();
  confirmed = true;
  await page.getByRole("button", { name: "Verificar novamente" }).click();
  await expect(page.getByRole("heading", { name: "Pagamento não concluído", exact: true }).last()).toBeVisible();
  await expect(page.getByText("O pagamento não foi concluído. Seus itens continuam no carrinho.")).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("tdm_cart_items") ?? "[]").length)).toBe(1);
});
