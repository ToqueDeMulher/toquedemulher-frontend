import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const backend = "http://127.0.0.1:8008";
test("real API persists signup, checkout, signed webhook and purchase history", async ({ page, request }, testInfo) => {
  const email = `fixture-${testInfo.project.name}-${Date.now()}@example.com`;
  const password = "Fixture@12345";
  const registered = await request.post(`${backend}/api/v1/user/register`, {
    data: { name: "Cliente Fixture", email, password },
  });
  expect(registered.status()).toBe(201);
  await page.goto("/login");
  await page.getByLabel("E-mail", { exact: true }).fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("tdm_access_token"))).not.toBeNull();
  const token = await page.evaluate(() => localStorage.getItem("tdm_access_token"));
  const address = await request.post(`${backend}/api/v1/addresses/`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { label: "Casa", cep: "70000000", street: "Rua Fixture", number: "1",
      neighborhood: "Centro", city: "Brasília", state: "DF",
      is_default_shipping: true, is_default_billing: true },
  });
  expect(address.ok()).toBe(true);
  await page.goto("/produto/a1000000-0000-4000-8000-000000000001");
  await page.getByRole("button", { name: "Adicionar ao carrinho", exact: true }).click();
  await page.keyboard.press("Escape");
  await page.goto("/checkout/address");
  await page.getByRole("button", { name: "Continuar para pagamento" }).click();
  await page.getByLabel("Telefone com DDD").fill("11999999999");
  await page.getByLabel("CPF do destinatário").fill("52998224725");
  await page.getByRole("button", { name: "Calcular entrega", exact: true }).click();
  await expect(page.getByRole("radio").first()).toBeVisible();
  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: "Gerar Pix" }).click();
  await expect(page).toHaveURL(/checkout\/pending\?session_id=/);
  await expect(page.getByRole("heading", { name: "Aguardando pagamento" })).toBeVisible();
  await expect(page.getByLabel("Pix copia e cola")).toHaveValue("000201-local-integration-fixture");
  const orderId = new URL(page.url()).searchParams.get("session_id")!;
  const pending = await request.get(`${backend}/__fixtures/orders/${orderId}`);
  expect((await pending.json()).status).toBe("pending");
  const stockReserved = (await pending.json()).stock;
  const settled = await request.post(`${backend}/__fixtures/pay/${orderId}`);
  const event = await settled.json();
  const webhook = await request.post(`${backend}/api/v1/payments/webhooks/abacatepay`, {
    data: event.payload,
    headers: { "X-Webhook-Secret": "dummy-local-webhook-secret-32-characters", "X-Webhook-Signature": event.signature,
      "Content-Type": "application/json" },
  });
  expect(webhook.status()).toBe(200);
  expect((await webhook.json()).status).toBe("approved");
  const persisted = await request.get(`${backend}/__fixtures/orders/${orderId}`);
  expect(await persisted.json()).toMatchObject({ status: "approved", stock: stockReserved });
  await page.getByRole("button", { name: "Verificar novamente" }).click();
  await expect(page.getByRole("heading", { name: "Pagamento confirmado", exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("tdm_cart_items") ?? "[]").length)).toBe(0);
  const history = await request.get(`${backend}/api/v1/user/me/orders`, { headers: { Authorization: `Bearer ${token}` } });
  expect((await history.json()).some((order: { id: string; status: string }) => order.id === orderId && order.status === "approved")).toBe(true);
  await mkdir("artifacts/screenshots", { recursive: true });
  await page.screenshot({ path: `artifacts/screenshots/${testInfo.project.name}-integrated-purchase.png`, fullPage: true });
});
