import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { ProductManagementPage } from "@/features/admin/pages/ProductManagementPage";

const api = vi.hoisted(() => ({
  login: vi.fn(), products: vi.fn(), categories: vi.fn(), update: vi.fn(), publish: vi.fn(), unpublish: vi.fn(),
}));
vi.mock("@/features/auth/context/auth-context", () => ({
  useAuth: () => ({ login: vi.fn(), isLoggedIn: false, role: "customer" }),
}));
vi.mock("@/features/auth/api/auth-service", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/features/auth/api/auth-service")>(),
  loginRequest: api.login,
}));
vi.mock("@/features/admin/api/product-service", () => ({
  getAdminProducts: api.products, getAdminCategories: api.categories, updateProduct: api.update,
  publishProduct: api.publish, unpublishProduct: api.unpublish,
}));

describe("account forms and product administration", () => {
  it("validates required login fields before contacting the API", async () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(screen.getByLabelText("E-mail", { exact: true })).toBeInvalid();
    expect(api.login).not.toHaveBeenCalled();
  });
  it("preserves credentials and releases loading state after login failure", async () => {
    api.login.mockRejectedValueOnce(new Error("Credenciais inválidas"));
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText("E-mail", { exact: true }), { target: { value: "fixture@example.com" } });
    fireEvent.change(screen.getByLabelText("Senha", { exact: true }), { target: { value: "Fixture@123" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    await waitFor(() => expect(api.login).toHaveBeenCalledWith({ email: "fixture@example.com", password: "Fixture@123" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Entrar" })).toBeEnabled());
    expect(screen.getByLabelText("E-mail", { exact: true })).toHaveValue("fixture@example.com");
  });
  it("updates product fields only after backend acceptance", async () => {
    const product = { id: "fixture", name: "Batom", slug: "batom", price: 49.9, active: false,
      status: "draft", image: "", images: [], categories: [{ id: 1, name: "Maquiagem" }],
      category_ids: [1], description: { text: "Cor intensa" }, stock_quantity: 2 };
    api.categories.mockResolvedValue([{ id: 1, name: "Maquiagem" }]);
    api.products.mockResolvedValueOnce([product]);
    api.update.mockRejectedValueOnce(new Error("Serviço indisponível"))
      .mockResolvedValueOnce({ ...product, name: "Batom rosa", price: 55.5, stock_quantity: 4 });
    render(<ProductManagementPage />);
    expect(screen.getByText("Carregando produtos...")).toBeVisible();
    fireEvent.click(await screen.findByRole("button", { name: "Editar" }));
    fireEvent.change(screen.getByLabelText("Nome do produto"), { target: { value: "Batom rosa" } });
    fireEvent.change(screen.getByLabelText("Preço do produto"), { target: { value: "55.5" } });
    fireEvent.change(screen.getByLabelText("Estoque do produto"), { target: { value: "4" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(api.update).toHaveBeenCalledWith("fixture", expect.objectContaining({ name: "Batom rosa", price: 55.5, stock_quantity: 4 })));
    await waitFor(() => expect(screen.getByRole("button", { name: "Salvar" })).toBeEnabled());
    expect(screen.getByLabelText("Nome do produto")).toHaveValue("Batom rosa");
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(screen.queryByLabelText("Nome do produto")).not.toBeInTheDocument());
    expect(screen.getByText(/4 em estoque/)).toBeVisible();
  });
});
