import { describe, expect, it } from "vitest";
import { act, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider, useAuth, type AuthUser } from "@/features/auth/context/auth-context";
import { getMeRequest } from "@/features/auth/api/auth-service";
import { ResetPasswordPage } from "@/features/auth/pages/ResetPasswordPage";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY, REFRESH_TOKEN_KEY } from "@/shared/api/api-client";
import { mockJsonResponse } from "./http-fixtures";

const user: AuthUser = { id: "fixture-user", name: "Cliente", email: "cliente@example.test", role: "customer" };
const storedCart = JSON.stringify([{ productId: "a1000000-0000-4000-8000-000000000001", quantity: 1 }]);

function seedSession() {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  localStorage.setItem(AUTH_TOKEN_KEY, "fixture-access-token");
  localStorage.setItem("tdm_cart_items", storedCart);
}

function renderReset(path = "/redefinir-senha?token=fixture-reset-token") {
  return render(<AuthProvider><MemoryRouter initialEntries={[path]}><ResetPasswordPage /></MemoryRouter></AuthProvider>);
}

describe("real authentication provider and HTTP client", () => {
  it("restores the persisted account and removes the unsupported legacy refresh token", () => {
    seedSession();
    localStorage.setItem(REFRESH_TOKEN_KEY, "legacy-fixture-token");
    const { result } = renderHook(useAuth, { wrapper: AuthProvider });
    expect(result.current.user).toEqual(user);
    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.isAdmin).toBe(false);
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem("tdm_cart_items")).toBe(storedCart);
  });

  it.each(["{invalid-json", "null"])("does not restore an account from unusable stored JSON (%s)", stored => {
    localStorage.setItem(AUTH_USER_KEY, stored);
    const { result } = renderHook(useAuth, { wrapper: AuthProvider });
    expect(result.current.user).toBeNull();
    expect(result.current.isLoggedIn).toBe(false);
  });

  it("persists login and profile changes, then signs out without discarding the cart or checkout snapshot", () => {
    localStorage.setItem("tdm_cart_items", storedCart);
    sessionStorage.setItem("tdm_checkout_snapshot", "fixture-checkout-snapshot");
    const { result } = renderHook(useAuth, { wrapper: AuthProvider });
    act(() => result.current.login({ user, accessToken: "fixture-access-token" }));
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe("fixture-access-token");
    expect(JSON.parse(localStorage.getItem(AUTH_USER_KEY)!)).toEqual(user);
    const updated = { ...user, name: "Cliente atualizado", role: "admin" as const };
    act(() => result.current.updateUser(updated));
    expect(result.current.user).toEqual(updated);
    expect(result.current.isAdmin).toBe(true);
    expect(JSON.parse(localStorage.getItem(AUTH_USER_KEY)!)).toEqual(updated);
    act(() => result.current.logout());
    expect(result.current.user).toBeNull();
    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.role).toBeNull();
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(AUTH_USER_KEY)).toBeNull();
    expect(localStorage.getItem("tdm_cart_items")).toBe(storedCart);
    expect(sessionStorage.getItem("tdm_checkout_snapshot")).toBe("fixture-checkout-snapshot");
  });

  it("reacts to a real HTTP 401 by ending the session while preserving the cart", async () => {
    seedSession();
    mockJsonResponse({ detail: "Sessão expirada." }, 401);
    const { result } = renderHook(useAuth, { wrapper: AuthProvider });
    await act(async () => {
      await expect(getMeRequest()).rejects.toMatchObject({ status: 401 });
    });
    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(AUTH_USER_KEY)).toBeNull();
    expect(localStorage.getItem("tdm_cart_items")).toBe(storedCart);
  });

  it.each(["HTTP 403", "network failure"])("preserves the restored session on %s", async failure => {
    seedSession();
    const fetch = mockJsonResponse({ detail: "Acesso não permitido." }, 403);
    if (failure === "network failure") fetch.mockRejectedValueOnce(new TypeError("offline"));
    const { result } = renderHook(useAuth, { wrapper: AuthProvider });
    await expect(getMeRequest()).rejects.toThrow(failure === "HTTP 403" ? "Acesso não permitido." : "Não foi possível conectar");
    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.user).toEqual(user);
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe("fixture-access-token");
    expect(localStorage.getItem("tdm_cart_items")).toBe(storedCart);
  });
});

describe("password reset using the real service and session provider", () => {
  it("rejects a reset link without a token before displaying a form or contacting the API", () => {
    const fetch = mockJsonResponse({ mensagem: "Senha redefinida." });
    renderReset("/redefinir-senha");
    expect(screen.getByRole("heading", { name: "Nao conseguimos redefinir" })).toBeVisible();
    expect(screen.queryByLabelText("Nova senha", { exact: true })).not.toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each([
    ["short", "short"], ["NovaSenha@123", "OutraSenha@123"],
  ])("does not submit a short or mismatched password (%s / %s)", (password, confirmation) => {
    seedSession();
    const fetch = mockJsonResponse({ mensagem: "Senha redefinida." });
    renderReset();
    fireEvent.change(screen.getByLabelText("Nova senha", { exact: true }), { target: { value: password } });
    fireEvent.change(screen.getByLabelText("Confirme a nova senha", { exact: true }), { target: { value: confirmation } });
    fireEvent.click(screen.getByRole("button", { name: "Redefinir senha" }));
    expect(fetch).not.toHaveBeenCalled();
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe("fixture-access-token");
    expect(screen.getByRole("heading", { name: "Escolha uma nova senha" })).toBeVisible();
  });

  it("preserves credentials, session and cart when the backend refuses an expired reset token", async () => {
    seedSession();
    const fetch = mockJsonResponse({ detail: "Link expirado." }, 400);
    renderReset();
    fireEvent.change(screen.getByLabelText("Nova senha", { exact: true }), { target: { value: "NovaSenha@123" } });
    fireEvent.change(screen.getByLabelText("Confirme a nova senha", { exact: true }), { target: { value: "NovaSenha@123" } });
    fireEvent.click(screen.getByRole("button", { name: "Redefinir senha" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Redefinir senha" })).toBeEnabled());
    expect(fetch).toHaveBeenCalledOnce();
    expect(screen.getByLabelText("Nova senha", { exact: true })).toHaveValue("NovaSenha@123");
    expect(screen.queryByRole("heading", { name: "Senha redefinida" })).not.toBeInTheDocument();
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe("fixture-access-token");
    expect(localStorage.getItem("tdm_cart_items")).toBe(storedCart);
  });
});
