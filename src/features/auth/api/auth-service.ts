import type { AuthRole, AuthUser } from "@/features/auth/context/auth-context";
import { apiRequest } from "@/shared/api/api-client";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type AuthTokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export type RegisterResponse = {
  mensagem: string;
};

export type BackendAuthRole = "cliente" | "customer" | "admin";

export type AuthUserResponse = {
  id: string;
  name: string;
  email: string;
  role: BackendAuthRole;
};

function mapBackendRole(role: BackendAuthRole): AuthRole {
  return role === "admin" ? "admin" : "customer";
}

export function normalizeAuthUser(response: AuthUserResponse): AuthUser {
  return {
    id: response.id,
    name: response.name,
    email: response.email,
    role: mapBackendRole(response.role),
  };
}

export function loginRequest(payload: LoginPayload) {
  return apiRequest<AuthTokenResponse>("/user/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function googleLoginRequest(credential: string) {
  return apiRequest<AuthTokenResponse>("/user/google", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
}

export function registerRequest(payload: RegisterPayload) {
  return apiRequest<RegisterResponse>("/user/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function forgotPasswordRequest(email: string) {
  return apiRequest<{ message: string }>("/user/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function confirmEmailRequest(token: string) {
  return apiRequest<{ mensagem: string }>("/user/confirm-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export function getMeRequest(accessToken?: string) {
  return apiRequest<AuthUserResponse>("/user/me", {
    method: "GET",
    headers: accessToken
      ? {
          Authorization: `Bearer ${accessToken}`,
        }
      : undefined,
  });
}
