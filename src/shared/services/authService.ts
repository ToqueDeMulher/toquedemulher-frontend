import { apiRequest } from "@/shared/services/apiClient";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  full_name: string;
  email: string;
  password: string;
  phone?: string | null;
  cpf?: string | null;
  birth_date?: string | null;
};

export type AuthTokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export type AuthUserResponse = {
  id: number;
  full_name: string;
  email: string;
  role: "customer" | "admin";
};

export function loginRequest(payload: LoginPayload) {
  return apiRequest<AuthTokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function registerRequest(payload: RegisterPayload) {
  return apiRequest<AuthUserResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function forgotPasswordRequest(email: string) {
  return apiRequest<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function getMeRequest(accessToken?: string) {
  return apiRequest<AuthUserResponse>("/users/me", {
    headers: accessToken
      ? {
          Authorization: `Bearer ${accessToken}`,
        }
      : undefined,
  });
}
