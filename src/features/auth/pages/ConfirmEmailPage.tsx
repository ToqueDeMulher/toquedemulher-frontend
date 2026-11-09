import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, MailCheck, XCircle } from "lucide-react";
import { routes } from "@/app/router/paths";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { confirmEmailRequest, resendConfirmationRequest } from "@/features/auth/api/auth-service";
import styles from "./ConfirmEmailPage.module.css";

type ConfirmStatus = "loading" | "success" | "error";

export function ConfirmEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<ConfirmStatus>("loading");
  const [message, setMessage] = useState("Confirmando seu email...");
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");

  async function handleResend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSending) return;
    setIsSending(true);
    setResendMessage("");
    setResendError("");
    try {
      const response = await resendConfirmationRequest(email.trim());
      setResendMessage(response.mensagem);
    } catch (error) {
      setResendError(error instanceof Error ? error.message : "Não foi possível solicitar o link. Tente novamente.");
    } finally {
      setIsSending(false);
    }
  }

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Link de confirmacao invalido.");
      return;
    }

    let isMounted = true;

    confirmEmailRequest(token)
      .then((response) => {
        if (!isMounted) return;
        setStatus("success");
        setMessage(response.mensagem || "Email confirmado com sucesso.");
      })
      .catch((error) => {
        if (!isMounted) return;
        setStatus("error");
        setMessage(
          error instanceof Error
            ? "Nao foi possivel confirmar este email."
            : "Link de confirmacao invalido.",
        );
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const Icon =
    status === "loading" ? Loader2 : status === "success" ? CheckCircle2 : XCircle;

  return (
    <div className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.logoRow}>
          <span className={styles.logoMark}>tm</span>
          <span className={styles.logoText}>toque de mulher</span>
        </div>

        <div className={styles.iconWrap} data-status={status}>
          <Icon className={status === "loading" ? styles.iconSpin : styles.icon} />
        </div>

        <p className={styles.eyebrow}>
          <MailCheck className={styles.eyebrowIcon} />
          Confirmacao de email
        </p>
        <h1 className={styles.title}>
          {status === "success"
            ? "Email confirmado"
            : status === "error"
              ? "Nao conseguimos confirmar"
              : "Confirmando sua conta"}
        </h1>
        <p className={styles.message}>{message}</p>

        {status === "error" && (
          <form className={styles.resendForm} onSubmit={handleResend}>
            <p className={styles.message}>Informe o e-mail da sua conta para solicitar um novo link.</p>
            <Label htmlFor="confirmation-email">E-mail da conta</Label>
            <Input
              id="confirmation-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Button type="submit" disabled={isSending}>
              {isSending ? "Solicitando link..." : "Reenviar confirmação"}
            </Button>
            {resendMessage && <p className={styles.message} role="status">{resendMessage}</p>}
            {resendError && <p className={styles.message} role="alert">{resendError}</p>}
          </form>
        )}

        <div className={styles.actions}>
          <Button asChild size="lg" className={styles.primaryAction}>
            <Link to={routes.login}>
              {status === "success" ? "Entrar na conta" : "Voltar ao login"}
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
