import { useState } from "react";
import { Link } from "react-router-dom";
import { HelpCircle, Mail, MessageCircle } from "lucide-react";
import { apiRequest } from "@/shared/api/api-client";
import { routes } from "@/app/router/paths";
import { useCatalog } from "@/features/catalog/context/catalog-context";
import styles from "./InstitutionalPage.module.css";

export function ContactPage() {
  const { contactEmail } = useCatalog();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setError(null);
    setSuccess(null);
    setSending(true);
    try {
      const result = await apiRequest<{ message: string }>("/contact", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(["name", "email", "subject", "message"].map(key => [key, String(data.get(key) ?? "").trim()]))),
      });
      setSuccess(result.message);
      form.reset();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível enviar. Tente novamente.");
    } finally { setSending(false); }
  }

  return <div className={styles.page}>
    <header className={styles.hero}><div className={styles.container}><div className={styles.heroInner}>
      <span className={styles.heroIconWrap}><MessageCircle className={styles.heroIcon} /></span>
      <div className={styles.heroMeta}><p className={styles.heroEyebrow}>Atendimento</p><h1 className={styles.heroTitle}>Fale Conosco</h1>
        <p className={styles.heroSubtitle}>Conte como podemos ajudar com sua escolha ou seu pedido.</p></div>
    </div></div></header>
    <main className={styles.section}><div className={styles.container}><div className={styles.contactGrid}>
      <form className={styles.contactForm} onSubmit={submit} aria-busy={sending}>
        <h2 className={styles.contactFormTitle}>Envie uma mensagem</h2>
        <div className={styles.formGroup}><label htmlFor="contact-name" className={styles.formLabel}>Nome completo</label>
          <input id="contact-name" name="name" required minLength={2} maxLength={120} autoComplete="name" className={styles.formInput} /></div>
        <div className={styles.formGroup}><label htmlFor="contact-email" className={styles.formLabel}>E-mail</label>
          <input id="contact-email" name="email" type="email" required maxLength={254} autoComplete="email" className={styles.formInput} /></div>
        <div className={styles.formGroup}><label htmlFor="contact-subject" className={styles.formLabel}>Assunto</label>
          <select id="contact-subject" name="subject" required className={styles.formSelect}>
            <option value="">Selecione o assunto</option>{["Pedido", "Troca ou devolução", "Pagamento", "Produto", "Sugestão", "Outro"].map(subject => <option key={subject}>{subject}</option>)}
          </select></div>
        <div className={styles.formGroup}><label htmlFor="contact-message" className={styles.formLabel}>Mensagem</label>
          <textarea id="contact-message" name="message" required minLength={10} maxLength={5000} className={styles.formTextarea} /></div>
        {error && <p role="alert">{error} Sua mensagem foi mantida para tentar novamente.</p>}
        {success && <p role="status">{success}</p>}
        <button type="submit" disabled={sending} className={styles.formSubmit}>{sending ? "Enviando…" : error ? "Tentar enviar novamente" : "Enviar mensagem"}</button>
      </form>
      <aside className={styles.contactInfo}>
        {contactEmail && <div className={styles.contactInfoCard}><Mail className={styles.contactInfoIcon} /><h2 className={styles.contactInfoTitle}>E-mail</h2>
          <a href={`mailto:${contactEmail}`} className={styles.contactInfoLink}>{contactEmail}</a></div>}
        <div className={styles.contactInfoCard}><HelpCircle className={styles.contactInfoIcon} /><h2 className={styles.contactInfoTitle}>Dúvidas frequentes</h2>
          <p className={styles.contactInfoText}>Consulte também nossa <Link to={routes.help} className={styles.contactInfoLink}>Central de Ajuda</Link>.</p></div>
      </aside>
    </div></div></main>
  </div>;
}
