import { describe, expect, it } from "vitest";
import {
  confirmEmailRequest, forgotPasswordRequest, getMeRequest, googleLoginRequest,
  loginRequest, registerRequest, resendConfirmationRequest, resetPasswordRequest,
} from "@/features/auth/api/auth-service";
import { AUTH_TOKEN_KEY } from "@/shared/api/api-client";
import { mockJsonResponse } from "./http-fixtures";

const email = "cliente@example.test";

describe("authentication HTTP contracts", () => {
  it("returns a login token without persisting an incomplete session", async () => {
    const token = { access_token: "fixture-access-token", token_type: "bearer" };
    const fetch = mockJsonResponse(token);

    await expect(loginRequest({ email, password: "Fixture@123" })).resolves.toEqual(token);

    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe("/api/v1/user/login");
    expect(options?.method).toBe("POST");
    expect(new Headers(options?.headers).get("Content-Type")).toBe("application/json");
    expect(JSON.parse(String(options?.body))).toEqual({ email, password: "Fixture@123" });
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
  });

  it.each([
    { path: "google", request: () => googleLoginRequest("fixture-google-credential"), body: { credential: "fixture-google-credential" }, response: { access_token: "fixture", token_type: "bearer" } },
    { path: "register", request: () => registerRequest({ name: "Cliente", email, password: "Fixture@123" }), body: { name: "Cliente", email, password: "Fixture@123" }, response: { mensagem: "Confirme seu e-mail." } },
    { path: "forgot-password", request: () => forgotPasswordRequest(email), body: { email }, response: { message: "Se a conta existir, enviaremos o link." } },
    { path: "reset-password", request: () => resetPasswordRequest("fixture-reset-token", "NovaSenha@123"), body: { token: "fixture-reset-token", new_password: "NovaSenha@123" }, response: { mensagem: "Senha redefinida." } },
    { path: "resend-confirmation", request: () => resendConfirmationRequest(email), body: { email }, response: { mensagem: "Verifique sua caixa de entrada." } },
    { path: "confirm-email", request: () => confirmEmailRequest("fixture-confirmation-token"), body: { token: "fixture-confirmation-token" }, response: { mensagem: "E-mail confirmado." } },
  ])("posts the $path contract and preserves the backend response", async ({ path, request, body, response }) => {
    const fetch = mockJsonResponse(response);

    await expect(request()).resolves.toEqual(response);

    expect(fetch).toHaveBeenCalledOnce();
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe(`/api/v1/user/${path}`);
    expect(options?.method).toBe("POST");
    expect(JSON.parse(String(options?.body))).toEqual(body);
  });

  it.each([undefined, "new-access-token"])("loads the current user using the correct token (%s)", async accessToken => {
    localStorage.setItem(AUTH_TOKEN_KEY, "stored-access-token");
    const user = { id: "fixture-user", name: "Cliente", email, role: "cliente" };
    const fetch = mockJsonResponse(user);

    await expect(getMeRequest(accessToken)).resolves.toEqual(user);

    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe("/api/v1/user/me");
    expect(options?.method).toBe("GET");
    expect(new Headers(options?.headers).get("Authorization"))
      .toBe(`Bearer ${accessToken ?? "stored-access-token"}`);
  });

  it("rejects invalid registration data without disclosing backend validation input", async () => {
    mockJsonResponse({ detail: [{ loc: ["body", "password"], input: "private-input" }] }, 422);

    await expect(registerRequest({ name: "Cliente", email, password: "short" }))
      .rejects.toMatchObject({ status: 422, message: "Verifique os campos informados." });
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
  });
});
