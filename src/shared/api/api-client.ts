const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(
  /\/+$/,
  "",
);
const API_PREFIX = import.meta.env.VITE_API_PREFIX ?? "/api/v1";
const DEFAULT_API_TIMEOUT_MS = 15000;

export const AUTH_TOKEN_KEY = "tdm_access_token";
export const REFRESH_TOKEN_KEY = "tdm_refresh_token";
export const AUTH_USER_KEY = "tdm_auth_user";
export const AUTH_UNAUTHORIZED_EVENT = "tdm_auth_unauthorized";

export function getAuthToken() {
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function clearAuthStorage() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
}

function buildUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${API_PREFIX}${normalizedPath}`;
}

function getApiTimeoutMs() {
  const configuredTimeout = Number(import.meta.env.VITE_API_TIMEOUT_MS);

  return Number.isFinite(configuredTimeout) && configuredTimeout > 0
    ? configuredTimeout
    : DEFAULT_API_TIMEOUT_MS;
}

function getErrorMessage(text: string, fallback: string) {
  if (!text) return fallback;

  try {
    const payload = JSON.parse(text) as {
      detail?: unknown;
      message?: unknown;
      mensagem?: unknown;
    };
    const detail = payload.detail ?? payload.message ?? payload.mensagem;

    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return "Verifique os campos informados.";
  } catch {
    return text;
  }

  return fallback;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getAuthToken();
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort();
  }, getApiTimeoutMs());

  if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (init.signal?.aborted) {
    controller.abort();
  } else {
    init.signal?.addEventListener("abort", () => controller.abort(), { once: true });
  }

  let response: Response;

  try {
    response = await fetch(buildUrl(path), {
      ...init,
      headers,
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(
        "Não foi possível conectar ao backend. Verifique se a API está rodando e tente novamente.",
      );
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const text = await response.text();
    if (response.status === 401) {
      clearAuthStorage();
      window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
    }
    throw new Error(getErrorMessage(text, `Erro HTTP ${response.status}`));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
