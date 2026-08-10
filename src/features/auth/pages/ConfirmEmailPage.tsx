import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, MailCheck, XCircle } from "lucide-react";
import { routes } from "@/app/router/paths";
import { Button } from "@/shared/ui/button";
import { confirmEmailRequest } from "@/features/auth/api/auth-service";
import styles from "./ConfirmEmailPage.module.css";

type ConfirmStatus = "loading" | "success" | "error";

export function ConfirmEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<ConfirmStatus>("loading");
  const [message, setMessage] = useState("Confirmando seu email...");

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
    <main className={styles.page}>
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

        <div className={styles.actions}>
          <Button asChild size="lg" className={styles.primaryAction}>
            <Link to={routes.login}>
              {status === "success" ? "Entrar na conta" : "Voltar ao login"}
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
