import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { routes } from "@/app/router/paths";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { resetPasswordRequest } from "@/features/auth/api/auth-service";
import styles from "./ResetPasswordPage.module.css";

type ResetStatus = "form" | "success" | "error";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<ResetStatus>(token ? "form" : "error");
  const [message, setMessage] = useState("Link de redefinicao invalido.");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (newPassword.length < 8) {
      toast.error("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("As senhas nao coincidem.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await resetPasswordRequest(token, newPassword);
      setStatus("success");
      setMessage(response.message || "Senha redefinida com sucesso.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Nao foi possivel redefinir sua senha.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.logoRow}>
          <span className={styles.logoMark}>tm</span>
          <span className={styles.logoText}>toque de mulher</span>
        </div>

        {status === "form" ? (
          <>
            <div className={styles.iconWrap}>
              <KeyRound className={styles.icon} />
            </div>
            <p className={styles.eyebrow}>
              <KeyRound className={styles.eyebrowIcon} />
              Redefinir senha
            </p>
            <h1 className={styles.title}>Escolha uma nova senha</h1>
            <p className={styles.message}>
              Digite e confirme sua nova senha para voltar a acessar sua conta.
            </p>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.fieldGroup}>
                <Label htmlFor="new-password">Nova senha</Label>
                <div className={styles.passwordField}>
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="Minimo de 8 caracteres"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <Label htmlFor="confirm-password">Confirme a nova senha</Label>
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repita a nova senha"
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className={styles.actions}>
                <Button type="submit" size="lg" className={styles.primaryAction} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className={styles.iconSpin} /> : "Redefinir senha"}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className={styles.iconWrap} data-status={status}>
              {status === "success" ? (
                <CheckCircle2 className={styles.icon} />
              ) : (
                <XCircle className={styles.icon} />
              )}
            </div>
            <h1 className={styles.title}>
              {status === "success" ? "Senha redefinida" : "Nao conseguimos redefinir"}
            </h1>
            <p className={styles.message}>{message}</p>

            <div className={styles.actions}>
              <Button asChild size="lg" className={styles.primaryAction}>
                <Link to={routes.login}>Entrar na conta</Link>
              </Button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
