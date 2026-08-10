import { apiRequest } from "@/shared/api/api-client";

export type PaymentMethodType = "card" | "pix" | "boleto";

export type SavedPaymentMethod = {
  id: string;
  method_type: PaymentMethodType;
  label?: string | null;
  holder_name?: string | null;
  billing_document?: string | null;
  card_brand?: string | null;
  card_last4?: string | null;
  card_exp_month?: number | null;
  card_exp_year?: number | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export type PaymentMethodPayload = {
  method_type: PaymentMethodType;
  label?: string;
  holder_name?: string;
  billing_document?: string;
  card_brand?: string;
  card_last4?: string;
  card_exp_month?: number;
  card_exp_year?: number;
  is_default?: boolean;
};

export function getPaymentMethods() {
  return apiRequest<SavedPaymentMethod[]>("/payment-methods/");
}

export function createPaymentMethod(payload: PaymentMethodPayload) {
  return apiRequest<SavedPaymentMethod>("/payment-methods/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updatePaymentMethod(
  paymentMethodId: string,
  payload: Partial<PaymentMethodPayload>
) {
  return apiRequest<SavedPaymentMethod>(`/payment-methods/${paymentMethodId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deletePaymentMethod(paymentMethodId: string) {
  return apiRequest<{ mensagem: string }>(`/payment-methods/${paymentMethodId}`, {
    method: "DELETE",
  });
}
