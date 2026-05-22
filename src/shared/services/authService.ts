import { apiRequest } from "@/shared/services/apiClient";

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

// AJUSTADO: Mudou de full_name para name para bater com o UserInDB do seu backend Python
export type AuthUserResponse = {
  id: string; // Como você usa UUID no Python, o ideal aqui é string em vez de number
  name: string; 
  email: string;
  role: "cliente" | "admin"; // Ajustado para 'cliente' em minúsculo, que é o valor real do seu banco
};

export function loginRequest(payload: LoginPayload) {
  return apiRequest<AuthTokenResponse>("/user/login", {
    method: "POST",
    body: JSON.stringify(payload),
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

// CORRIGIDO: Forçando o método GET explicitamente e aplicando os headers de autenticação
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