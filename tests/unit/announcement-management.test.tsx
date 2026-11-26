import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AnnouncementManagementPage } from "@/features/admin/pages/AnnouncementManagementPage";
import { AnnouncementBar } from "@/features/store-content/components/AnnouncementBar";

const api = vi.hoisted(() => ({
  getDraft: vi.fn(),
  saveDraft: vi.fn(),
  discardDraft: vi.fn(),
  publishDraft: vi.fn(),
}));

vi.mock("@/features/store-content/api/announcement-service", async (loadOriginal) => {
  const original = await loadOriginal<typeof import("@/features/store-content/api/announcement-service")>();
  return {
    ...original,
    getAnnouncementDraft: api.getDraft,
    saveAnnouncementDraft: api.saveDraft,
    discardAnnouncementDraft: api.discardDraft,
    publishAnnouncementDraft: api.publishDraft,
  };
});

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const messages = [
  { id: "one", text: "Primeiro aviso", destination: "/ajuda", active: true, sort_order: 1 },
  { id: "two", text: "Segundo aviso", destination: "/carrinho", active: true, sort_order: 2 },
];
const revision = { id: "revision", status: "draft" as const, updated_at: "2026-11-25T12:00:00Z", published_at: null, messages };

describe("announcement content management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getDraft.mockResolvedValue(revision);
    api.saveDraft.mockImplementation(async (value) => ({ ...revision, messages: value }));
    api.discardDraft.mockResolvedValue(revision);
    api.publishDraft.mockResolvedValue({ ...revision, status: "published" });
  });

  it("uses the same animated component for a non-navigating preview", () => {
    render(
      <MemoryRouter>
        <AnnouncementBar messages={messages.map(({ active: _, ...message }) => message)} preview />
      </MemoryRouter>,
    );
    expect(screen.getByRole("region", { name: "Pré-visualização da faixa de avisos" })).toBeVisible();
    fireEvent.click(screen.getByRole("link", { name: "Primeiro aviso" }));
    expect(window.location.pathname).toBe("/");
    fireEvent.click(screen.getByRole("button", { name: "Pausar animação" }));
    expect(screen.getByRole("button", { name: "Retomar animação" })).toHaveAttribute("aria-pressed", "true");
  });

  it("edits, deactivates, orders and saves a private draft before publishing", async () => {
    render(<MemoryRouter><AnnouncementManagementPage /></MemoryRouter>);
    const textFields = await screen.findAllByLabelText(/^Mensagem \d+$/);
    fireEvent.change(textFields[0], { target: { value: "Aviso editado" } });
    fireEvent.click(screen.getByRole("button", { name: "Mover mensagem 1 para baixo" }));
    fireEvent.click(screen.getAllByRole("checkbox")[0]);

    expect(screen.getByText("Alterações não salvas")).toBeVisible();
    expect(screen.getByRole("button", { name: /Publicar na loja/ })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: /Salvar rascunho/ }));

    await waitFor(() => expect(api.saveDraft).toHaveBeenCalledOnce());
    const saved = api.saveDraft.mock.calls[0][0];
    expect(saved.map((message: { text: string }) => message.text)).toEqual(["Segundo aviso", "Aviso editado"]);
    expect(saved[0].active).toBe(false);
    await waitFor(() => expect(screen.getByRole("button", { name: /Publicar na loja/ })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: /Publicar na loja/ }));
    await waitFor(() => expect(api.publishDraft).toHaveBeenCalledOnce());
  });

  it("adds and removes messages and explains an intentionally empty publication", async () => {
    api.getDraft.mockResolvedValue({ ...revision, messages: [] });
    render(<MemoryRouter><AnnouncementManagementPage /></MemoryRouter>);
    expect(await screen.findByText("Nenhuma mensagem no rascunho. Ao publicar assim, a faixa ficará oculta.")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /Adicionar mensagem/ }));
    expect(screen.getByLabelText("Mensagem 1")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Remover mensagem 1" }));
    expect(screen.getByText("A faixa ficará oculta porque não há mensagens ativas.")).toBeVisible();
  });
});
