import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { RequireAuth } from "@/app/components/RequireAuth";
import { RequireAdmin } from "@/app/components/RequireAdmin";
import { Button } from "@/shared/ui/button";
import { CatalogFeedback } from "@/features/catalog/components/CatalogFeedback";

const state = vi.hoisted(() => ({ loggedIn: false, admin: false, loading: false, error: null as string | null, products: [] as object[], reload: vi.fn() }));
vi.mock("@/features/auth/context/auth-context", () => ({ useAuth: () => ({ isLoggedIn: state.loggedIn, isAdmin: state.admin }) }));
vi.mock("@/features/catalog/context/catalog-context", () => ({ useCatalog: () => state }));

describe("accessible feedback and route permissions", () => {
  it("prevents repeated submissions while a button is loading", () => {
    const click = vi.fn();
    const { rerender } = render(<Button isLoading onClick={click}>Salvar</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(click).not.toHaveBeenCalled();
    rerender(<Button onClick={click}>Salvar</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(click).toHaveBeenCalledTimes(1);
  });
  it.each([
    [false, false, false], [true, false, false], [true, true, true],
  ])("admin access with login=%s admin=%s", (loggedIn, admin, allowed) => {
    Object.assign(state, { loggedIn, admin });
    render(<MemoryRouter initialEntries={["/admin"]}><Routes>
      <Route path="/admin" element={<RequireAdmin><p>Admin protegido</p></RequireAdmin>} />
      <Route path="/login" element={<p>Entrar</p>} />
    </Routes></MemoryRouter>);
    expect(screen.getByText(allowed ? "Admin protegido" : "Entrar")).toBeVisible();
  });
  it("requires a session before opening the profile", () => {
    state.loggedIn = false;
    render(<MemoryRouter initialEntries={["/perfil"]}><Routes>
      <Route path="/perfil" element={<RequireAuth><p>Perfil</p></RequireAuth>} />
      <Route path="/login" element={<p>Entrar</p>} />
    </Routes></MemoryRouter>);
    expect(screen.getByText("Entrar")).toBeVisible();
  });
  it("shows loading, failure with retry, empty and populated catalog states", () => {
    state.loading = true;
    state.error = null;
    state.products = [];
    const { rerender } = render(<CatalogFeedback />);
    expect(screen.getByRole("status")).toHaveTextContent("Carregando");
    state.loading = false;
    state.error = "Serviço indisponível";
    rerender(<CatalogFeedback />);
    expect(screen.getByRole("alert")).toHaveTextContent(state.error);
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(state.reload).toHaveBeenCalledOnce();
    state.error = null;
    rerender(<CatalogFeedback />);
    expect(screen.getByRole("status")).toHaveTextContent("Nenhum produto");
    state.products = [{}];
    rerender(<CatalogFeedback />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
