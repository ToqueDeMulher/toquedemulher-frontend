import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Eye, Megaphone, Plus, RotateCcw, Save, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { AnnouncementBar } from "@/features/store-content/components/AnnouncementBar";
import type { AnnouncementMessage } from "@/features/store-content/types/announcement";
import {
  discardAnnouncementDraft,
  getAnnouncementDraft,
  publishAnnouncementDraft,
  saveAnnouncementDraft,
} from "@/features/store-content/api/announcement-service";
import styles from "./AnnouncementManagementPage.module.css";

type PreviewSize = "desktop" | "mobile";

function normalize(messages: AnnouncementMessage[]) {
  return messages.map((message, index) => ({ ...message, sort_order: index + 1 }));
}

function validate(messages: AnnouncementMessage[]) {
  for (const message of messages) {
    if (!message.text.trim()) return "Preencha o texto de todas as mensagens.";
    if (message.text.trim().length > 160) return "Cada mensagem pode ter até 160 caracteres.";
    const destination = message.destination.trim();
    if (!destination.startsWith("/") || destination.startsWith("//") || destination.includes("\\")) {
      return "Use somente caminhos internos seguros, como /carrinho ou /ajuda.";
    }
  }
  return null;
}

export function AnnouncementManagementPage() {
  const [messages, setMessages] = useState<AnnouncementMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"save" | "publish" | "discard" | null>(null);
  const [dirty, setDirty] = useState(false);
  const [previewSize, setPreviewSize] = useState<PreviewSize>("desktop");

  const activePreview = useMemo(
    () => messages.filter((message) => message.active).map(({ active: _, ...message }) => message),
    [messages],
  );

  useEffect(() => {
    let active = true;
    void getAnnouncementDraft()
      .then((draft) => {
        if (active) setMessages(normalize(draft.messages));
      })
      .catch((error: Error) => toast.error(error.message))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const update = (id: string, values: Partial<AnnouncementMessage>) => {
    setMessages((current) => current.map((message) => message.id === id ? { ...message, ...values } : message));
    setDirty(true);
  };

  const add = () => {
    setMessages((current) => normalize([...current, {
      id: `draft-${Date.now()}`,
      text: "",
      destination: "/",
      active: true,
      sort_order: current.length + 1,
    }]));
    setDirty(true);
  };

  const remove = (id: string) => {
    setMessages((current) => normalize(current.filter((message) => message.id !== id)));
    setDirty(true);
  };

  const move = (index: number, offset: -1 | 1) => {
    const target = index + offset;
    if (target < 0 || target >= messages.length) return;
    setMessages((current) => {
      const reordered = [...current];
      [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
      return normalize(reordered);
    });
    setDirty(true);
  };

  const save = async () => {
    const error = validate(messages);
    if (error) return toast.error(error);
    setBusy("save");
    try {
      const draft = await saveAnnouncementDraft(messages);
      setMessages(normalize(draft.messages));
      setDirty(false);
      toast.success("Rascunho salvo. A loja ainda não foi alterada.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const publish = async () => {
    if (dirty) return toast.error("Salve o rascunho antes de publicar.");
    setBusy("publish");
    try {
      await publishAnnouncementDraft();
      const nextDraft = await getAnnouncementDraft();
      setMessages(normalize(nextDraft.messages));
      toast.success("Faixa de avisos publicada na loja.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const discard = async () => {
    setBusy("discard");
    try {
      const draft = await discardAnnouncementDraft();
      setMessages(normalize(draft.messages));
      setDirty(false);
      toast.success("Alterações pendentes descartadas.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <div className={styles.state} role="status">Carregando conteúdo da loja…</div>;

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}><Megaphone size={15} /> CONTEÚDO DA LOJA</span>
          <h1>Faixa de avisos</h1>
          <p>Edite e visualize em rascunho. Os clientes só verão as mudanças após a publicação explícita.</p>
        </div>
        <span className={dirty ? styles.pendingBadge : styles.savedBadge}>
          {dirty ? "Alterações não salvas" : "Rascunho salvo"}
        </span>
      </header>

      <section className={styles.panel} aria-labelledby="messages-title">
        <div className={styles.panelHeader}>
          <div><h2 id="messages-title">Mensagens</h2><p>Até 20 mensagens, com 160 caracteres cada.</p></div>
          <Button type="button" variant="outline" onClick={add}><Plus size={16} /> Adicionar mensagem</Button>
        </div>

        {messages.length === 0 ? (
          <div className={styles.emptyState}>Nenhuma mensagem no rascunho. Ao publicar assim, a faixa ficará oculta.</div>
        ) : (
          <ol className={styles.messageList}>
            {messages.map((message, index) => (
              <li key={message.id} className={styles.messageCard}>
                <div className={styles.orderControls} aria-label={`Ordenar mensagem ${index + 1}`}>
                  <strong>{index + 1}</strong>
                  <Button type="button" size="icon" variant="ghost" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Mover mensagem ${index + 1} para cima`}><ArrowUp size={16} /></Button>
                  <Button type="button" size="icon" variant="ghost" onClick={() => move(index, 1)} disabled={index === messages.length - 1} aria-label={`Mover mensagem ${index + 1} para baixo`}><ArrowDown size={16} /></Button>
                </div>
                <div className={styles.fields}>
                  <label>Mensagem
                    <Input aria-label={`Mensagem ${index + 1}`} value={message.text} maxLength={160} onChange={(event) => update(message.id, { text: event.target.value })} placeholder="Ex.: Frete grátis acima de R$ 199" />
                    <span>{message.text.length}/160</span>
                  </label>
                  <label>Destino interno
                    <Input aria-label={`Destino da mensagem ${index + 1}`} value={message.destination} onChange={(event) => update(message.id, { destination: event.target.value })} placeholder="/carrinho" />
                    <span>Use um caminho da loja iniciado por /.</span>
                  </label>
                </div>
                <div className={styles.cardActions}>
                  <label className={styles.switchLabel}>
                    <input type="checkbox" checked={message.active} onChange={(event) => update(message.id, { active: event.target.checked })} />
                    <span>{message.active ? "Ativa" : "Inativa"}</span>
                  </label>
                  <Button type="button" size="icon" variant="ghost" onClick={() => remove(message.id)} aria-label={`Remover mensagem ${index + 1}`}><Trash2 size={17} /></Button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className={styles.panel} aria-labelledby="preview-title">
        <div className={styles.panelHeader}>
          <div><h2 id="preview-title"><Eye size={18} /> Pré-visualização fiel</h2><p>Mostra os dados preenchidos agora, mesmo antes de salvar.</p></div>
          <div className={styles.previewToggle} role="group" aria-label="Tamanho da pré-visualização">
            <Button type="button" size="sm" variant={previewSize === "desktop" ? "default" : "outline"} onClick={() => setPreviewSize("desktop")}>Desktop</Button>
            <Button type="button" size="sm" variant={previewSize === "mobile" ? "default" : "outline"} onClick={() => setPreviewSize("mobile")}>Mobile</Button>
          </div>
        </div>
        <div className={`${styles.previewFrame} ${previewSize === "mobile" ? styles.previewMobile : ""}`}>
          {activePreview.length > 0 ? <AnnouncementBar messages={activePreview} preview /> : <div className={styles.hiddenPreview}>A faixa ficará oculta porque não há mensagens ativas.</div>}
        </div>
      </section>

      <footer className={styles.actions}>
        <Button type="button" variant="ghost" onClick={discard} disabled={busy !== null} isLoading={busy === "discard"}><RotateCcw size={16} /> Descartar pendências</Button>
        <Button type="button" variant="outline" onClick={save} disabled={busy !== null || !dirty} isLoading={busy === "save"}><Save size={16} /> Salvar rascunho</Button>
        <Button type="button" onClick={publish} disabled={busy !== null || dirty} isLoading={busy === "publish"}><Send size={16} /> Publicar na loja</Button>
      </footer>
    </div>
  );
}

