import { apiRequest } from "@/shared/api/api-client";

export interface AddressRequest {
  label: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  region: string;
  ddd: string;
  is_default_shipping: boolean;
  is_default_billing: boolean;
}

export interface AddressResponse {
  mensagem: string;
}

export interface Address {
  id: string;
  label?: string | null;
  cep: string;
  street: string;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city: string;
  state: string;
  region?: string | null;
  ddd?: string | null;
  is_default_shipping: boolean;
  is_default_billing: boolean;
}

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  ddd: string;
  erro?: boolean;
}

const REGIAO_MAP: Record<string, string> = {
  AC: "Norte",
  AM: "Norte",
  AP: "Norte",
  PA: "Norte",
  RO: "Norte",
  RR: "Norte",
  TO: "Norte",
  AL: "Nordeste",
  BA: "Nordeste",
  CE: "Nordeste",
  MA: "Nordeste",
  PB: "Nordeste",
  PE: "Nordeste",
  PI: "Nordeste",
  RN: "Nordeste",
  SE: "Nordeste",
  DF: "Centro-Oeste",
  GO: "Centro-Oeste",
  MS: "Centro-Oeste",
  MT: "Centro-Oeste",
  ES: "Sudeste",
  MG: "Sudeste",
  RJ: "Sudeste",
  SP: "Sudeste",
  PR: "Sul",
  RS: "Sul",
  SC: "Sul",
};

export function getRegiaoByUF(uf: string): string {
  return REGIAO_MAP[uf.toUpperCase()] ?? "";
}

export async function fetchAddressByCep(
  cep: string
): Promise<ViaCepResponse | null> {
  const cleanCep = cep.replace(/\D/g, "");
  if (cleanCep.length !== 8) return null;

  const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
  if (!response.ok) return null;

  const data: ViaCepResponse = await response.json();
  if (data.erro) return null;

  return data;
}

export async function createAddress(
  data: AddressRequest
): Promise<AddressResponse> {
  return apiRequest<AddressResponse>("/addresses/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getAddresses() {
  return apiRequest<Address[]>("/addresses/");
}

export function updateAddress(
  addressId: string,
  data: Partial<AddressRequest>
): Promise<AddressResponse> {
  return apiRequest<AddressResponse>(`/addresses/${addressId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteAddress(addressId: string): Promise<AddressResponse> {
  return apiRequest<AddressResponse>(`/addresses/${addressId}`, {
    method: "DELETE",
  });
}
