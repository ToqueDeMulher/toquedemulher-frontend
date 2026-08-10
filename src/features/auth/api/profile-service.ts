import { apiRequest } from "@/shared/api/api-client";

export type UserProfile = {
  id: string;
  name: string;
  cpf?: string | null;
  email: string;
  phone?: string | null;
  gender?: string | null;
  birth_date?: string | null;
  accepts_marketing?: boolean | null;
  role?: string | null;
};

export type ProfileUpdatePayload = {
  name?: string;
  cpf?: string;
  phone?: string;
  gender?: string;
  birth_date?: string;
  accepts_marketing?: boolean;
};

export type PasswordUpdatePayload = {
  current_password: string;
  new_password: string;
};

type MessageResponse = {
  mensagem: string;
};

export function getProfile() {
  return apiRequest<UserProfile>("/user/me");
}

export function updateProfile(payload: ProfileUpdatePayload) {
  return apiRequest<MessageResponse>("/user/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function updateEmail(newEmail: string) {
  return apiRequest<MessageResponse>("/user/me/email", {
    method: "PUT",
    body: JSON.stringify({ new_email: newEmail }),
  });
}

export function updatePassword(payload: PasswordUpdatePayload) {
  return apiRequest<MessageResponse>("/user/me/password", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
