import { vi } from "vitest";

export function mockJsonResponse(body: unknown, status = 200) {
  const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
    new Response(JSON.stringify(body), { status }),
  );
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

export function mockPendingRequest() {
  const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation((_url, options) =>
    new Promise<Response>((_resolve, reject) => {
      options?.signal?.addEventListener("abort", () =>
        reject(new DOMException("Request aborted", "AbortError")), { once: true });
    }),
  );
  vi.stubGlobal("fetch", fetch);
  return fetch;
}
