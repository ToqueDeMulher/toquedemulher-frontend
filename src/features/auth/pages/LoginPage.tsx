import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  useAuth,
  type AuthRole,
} from "@/shared/contexts/auth-context";
import { routes } from "@/shared/lib/routes";
import {
  forgotPasswordRequest,
  getMeRequest,
  loginRequest,
  registerRequest,
} from "@/shared/services/authService";
import styles from "./LoginPage.module.css";

function getDefaultRouteForRole(role: AuthRole) {
  return role === "admin" ? routes.adminDashboard : routes.profile;
}

export function LoginPage() {
  const { login, isLoggedIn, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo =
    (location.state as { from?: { pathname?: string } })?.from?.pathname ??
    routes.home;
  const redirectReason = (location.state as { reason?: string } | null)?.reason;

  const [isLoading, setIsLoading] = useState(false);
  const [loginRole, setLoginRole] = useState<AuthRole>("customer");
  const [animateLogin, setAnimateLogin] = useState(false);
  const [animateRegister, setAnimateRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const loginAnimateTimeoutRef = useRef<number | null>(null);
  const registerAnimateTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (redirectReason === "admin-only") {
      setLoginRole("admin");
      toast.error("Acesso restrito. Entre com uma conta admin.");
    }
  }, [redirectReason]);

  useEffect(() => {
    return () => {
      if (loginAnimateTimeoutRef.current) {
        window.clearTimeout(loginAnimateTimeoutRef.current);
      }

      if (registerAnimateTimeoutRef.current) {
        window.clearTimeout(registerAnimateTimeoutRef.current);
      }
    };
  }, []);

  if (isLoggedIn && role && redirectReason !== "admin-only") {
    return <Navigate to={getDefaultRouteForRole(role)} replace />;
  }

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthLabel = (strength: number) => {
    if (strength <= 1)
      return {
        label: "Muito fraca",
        colorClass: styles.strengthTextRed,
        barClass: styles.strengthBarRed,
      };
    if (strength === 2)
      return {
        label: "Fraca",
        colorClass: styles.strengthTextOrange,
        barClass: styles.strengthBarOrange,
      };
    if (strength === 3)
      return {
        label: "Média",
        colorClass: styles.strengthTextYellow,
        barClass: styles.strengthBarYellow,
      };
    if (strength === 4)
      return {
        label: "Forte",
        colorClass: styles.strengthTextGreen,
        barClass: styles.strengthBarGreen,
      };
    return {
      label: "Muito forte",
      colorClass: styles.strengthTextEmerald,
      barClass: styles.strengthBarEmerald,
    };
  };

  const resolveRedirect = (nextRole: AuthRole) => {
    const defaultRoute = getDefaultRouteForRole(nextRole);

    if (
      redirectTo === routes.home ||
      redirectTo === routes.login ||
      redirectTo.trim().length === 0
    ) {
      return defaultRoute;
    }

    if (nextRole === "admin" && redirectTo === routes.profile) {
      return routes.adminDashboard;
    }

    if (nextRole === "customer" && redirectTo.startsWith("/admin")) {
      return routes.profile;
    }

    return redirectTo;
  };

  const completeSignIn = (params: {
    authUser: { id: number; name: string; email: string; role: AuthRole };
    accessToken: string;
    refreshToken: string;
    successMessage: string;
    delay?: number;
  }) => {
    const { authUser, accessToken, refreshToken, successMessage, delay = 1200 } = params;
    setIsLoading(true);

    window.setTimeout(() => {
      setIsLoading(false);
      toast.success(successMessage);
      login({
        user: authUser,
        accessToken,
        refreshToken,
      });
      navigate(resolveRedirect(authUser.role), { replace: true });
    }, delay);
  };

  const passwordStrength = getPasswordStrength(registerPassword);
  const passwordStrengthData = getPasswordStrengthLabel(passwordStrength);

  const triggerBubblyAnimation = (
    setAnimate: React.Dispatch<React.SetStateAction<boolean>>,
    timeoutRef: React.MutableRefObject<number | null>
  ) => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    setAnimate(false);
    window.requestAnimationFrame(() => {
      setAnimate(true);
      timeoutRef.current = window.setTimeout(() => {
        setAnimate(false);
      }, 1200);
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(loginEmail)) {
      toast.error("Digite um e-mail válido.");
      return;
    }

    if (loginPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsLoading(true);

    try {
      const token = await loginRequest({
        email: loginEmail.trim(),
        password: loginPassword,
      });
      const me = await getMeRequest(token.access_token);

      if (loginRole === "admin" && me.role !== "admin") {
        toast.error("Essa conta não tem permissão de admin.");
        setIsLoading(false);
        return;
      }

      completeSignIn({
        authUser: {
          id: me.id,
          name: me.full_name,
          email: me.email,
          role: me.role,
        },
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        successMessage:
          me.role === "admin"
            ? "Login admin realizado com sucesso!"
            : "Login realizado com sucesso!",
      });
    } catch (error) {
      setIsLoading(false);
      toast.error(error instanceof Error ? error.message : "Falha no login.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerName.trim().length < 3) {
      toast.error("Nome deve ter pelo menos 3 caracteres");
      return;
    }

    if (!validateEmail(registerEmail)) {
      toast.error("Por favor, insira um e-mail válido.");
      return;
    }

    if (registerPassword.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres");
      return;
    }

    if (passwordStrength < 2) {
      toast.error("Escolha uma senha mais forte");
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    if (!acceptTerms) {
      toast.error("Você precisa aceitar os termos de uso.");
      return;
    }

    setIsLoading(true);

    try {
      await registerRequest({
        full_name: registerName.trim(),
        email: registerEmail.trim(),
        password: registerPassword,
      });

      const token = await loginRequest({
        email: registerEmail.trim(),
        password: registerPassword,
      });
      const me = await getMeRequest(token.access_token);

      completeSignIn({
        authUser: {
          id: me.id,
          name: me.full_name,
          email: me.email,
          role: me.role,
        },
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        successMessage: "Cadastro realizado com sucesso! Bem-vinda!",
        delay: 1500,
      });
    } catch (error) {
      setIsLoading(false);
      toast.error(error instanceof Error ? error.message : "Falha no cadastro.");
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast.error(`Login com ${provider} ainda não foi integrado ao backend.`);
  };

  const handleForgotPassword = async () => {
    if (!loginEmail) {
      toast.error("Digite seu e-mail primeiro");
      return;
    }

    if (!validateEmail(loginEmail) && loginRole !== "admin") {
      toast.error("Digite um e-mail válido.");
      return;
    }

    try {
      const response = await forgotPasswordRequest(loginEmail.trim());
      toast.success(response.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao enviar e-mail.");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.decorLayer}>
        <div className={`${styles.decorOrb} ${styles.decorOrbTopLeft}`} />
        <div className={`${styles.decorOrb} ${styles.decorOrbBottomRight}`} />
        <div className={`${styles.decorOrb} ${styles.decorOrbCenter}`} />
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Boas-vindas!</h1>
          <p className={styles.subtitle}>
            Entre como cliente ou admin para acessar a área certa da conta.
          </p>
        </div>

        <div className={styles.card}>
          <Tabs defaultValue="login" className={styles.tabsRoot}>
            <TabsList className={styles.tabsList}>
              <TabsTrigger value="login" className={styles.tabTriggerLogin}>
                Login
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className={styles.tabTriggerRegister}
              >
                Cadastro
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className={styles.formLogin}>
                <div className={styles.roleSection}>
                  <span className={styles.roleLabel}>Entrando como</span>
                  <div className={styles.roleToggle}>
                    <button
                      type="button"
                      className={`${styles.roleButton} ${
                        loginRole === "customer" ? styles.roleButtonActive : ""
                      }`}
                      onClick={() => setLoginRole("customer")}
                    >
                      Cliente
                    </button>
                    <button
                      type="button"
                      className={`${styles.roleButton} ${
                        loginRole === "admin" ? styles.roleButtonActive : ""
                      }`}
                      onClick={() => setLoginRole("admin")}
                    >
                      Admin
                    </button>
                  </div>
                  <p className={styles.roleHint}>
                    {loginRole === "admin"
                      ? "Acesso admin: use uma conta com role admin cadastrada no backend."
                      : "Acesso cliente: entre com seu e-mail para ver pedidos, wishlist e configurações."}
                  </p>
                </div>

                <div>
                  <Label htmlFor="email" className={styles.fieldLabel}>
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={
                      loginRole === "admin"
                        ? "admin@toquedemulher.com"
                        : "seu@email.com"
                    }
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className={styles.input}
                  />
                </div>

                <div>
                  <Label htmlFor="password" className={styles.fieldLabel}>
                    Senha
                  </Label>
                  <div className={styles.inputWrapper}>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className={styles.inputWithIcon}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={styles.toggleButton}
                    >
                      {showPassword ? (
                        <EyeOff className={styles.iconMedium} />
                      ) : (
                        <Eye className={styles.iconMedium} />
                      )}
                    </button>
                  </div>
                </div>

                <div className={styles.metaRow}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className={styles.checkboxInput}
                    />
                    <span className={styles.checkboxText}>Lembrar-me</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className={styles.forgotButton}
                  >
                    Esqueceu a senha?
                  </button>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  variant="default"
                  className={`${styles.submitButton} ${styles.bubblyButton} ${
                    animateLogin ? styles.bubblyButtonAnimate : ""
                  }`}
                  onClick={() =>
                    triggerBubblyAnimation(
                      setAnimateLogin,
                      loginAnimateTimeoutRef
                    )
                  }
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className={styles.iconSpin} />
                      Entrando...
                    </>
                  ) : loginRole === "admin" ? (
                    "Entrar como admin"
                  ) : (
                    "Entrar como cliente"
                  )}
                </Button>
              </form>

              <div className={styles.divider}>
                <div className={styles.dividerLineWrap}>
                  <div className={styles.dividerLine}>
                    <div className={styles.dividerLineInner} />
                  </div>
                  <div className={styles.dividerTextWrap}>
                    <span className={styles.dividerText}>Ou continue com</span>
                  </div>
                </div>

                <div className={styles.socialStack}>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className={styles.socialButton}
                    onClick={() => handleSocialLogin("Google")}
                    disabled={isLoading}
                  >
                    <svg className={styles.iconSocial} viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Login com Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className={styles.socialButton}
                    onClick={() => handleSocialLogin("Facebook")}
                    disabled={isLoading}
                  >
                    <svg
                      className={styles.iconSocial}
                      fill="#1877F2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Login com Facebook
                  </Button>
                </div>

                <p className={styles.footerMeta}>
                  {loginRole === "admin"
                    ? "Painel administrativo separado da área do cliente."
                    : "Sua área de cliente mostra pedidos, wishlist e configurações pessoais."}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className={styles.formRegister}>
                <div>
                  <Label htmlFor="reg-name" className={styles.fieldLabel}>
                    Nome Completo
                  </Label>
                  <Input
                    id="reg-name"
                    type="text"
                    placeholder="Seu nome"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    required
                    className={styles.input}
                  />
                  {registerName && registerName.length < 3 && (
                    <p className={styles.passwordHint}>
                      <X className={styles.iconTiny} /> Mínimo de 3 caracteres
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="reg-email" className={styles.fieldLabel}>
                    E-mail
                  </Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                    className={styles.input}
                  />
                  {registerEmail && !validateEmail(registerEmail) && (
                    <p className={styles.passwordHint}>
                      <X className={styles.iconTiny} /> E-mail inválido
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="reg-password" className={styles.fieldLabel}>
                    Senha
                  </Label>
                  <div className={styles.inputWrapper}>
                    <Input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                      className={styles.inputWithIcon}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={styles.toggleButton}
                    >
                      {showPassword ? (
                        <EyeOff className={styles.iconMedium} />
                      ) : (
                        <Eye className={styles.iconMedium} />
                      )}
                    </button>
                  </div>

                  {registerPassword && (
                    <div className={styles.passwordStrengthWrap}>
                      <div className={styles.strengthBars}>
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`${styles.strengthBar} ${
                              level <= passwordStrength
                                ? passwordStrengthData.barClass
                                : styles.strengthBarInactive
                            }`}
                          />
                        ))}
                      </div>
                      <p
                        className={`${styles.strengthLabel} ${passwordStrengthData.colorClass}`}
                      >
                        Força da senha: {passwordStrengthData.label}
                      </p>
                      <div className={styles.strengthRules}>
                        <div
                          className={`${styles.ruleRow} ${
                            registerPassword.length >= 8 ? styles.ruleOk : ""
                          }`}
                        >
                          {registerPassword.length >= 8 ? (
                            <Check className={styles.iconTiny} />
                          ) : (
                            <X className={styles.iconTinyMuted} />
                          )}
                          Mínimo de 8 caracteres
                        </div>
                        <div
                          className={`${styles.ruleRow} ${
                            /[a-z]/.test(registerPassword) &&
                            /[A-Z]/.test(registerPassword)
                              ? styles.ruleOk
                              : ""
                          }`}
                        >
                          {/[a-z]/.test(registerPassword) &&
                          /[A-Z]/.test(registerPassword) ? (
                            <Check className={styles.iconTiny} />
                          ) : (
                            <X className={styles.iconTinyMuted} />
                          )}
                          Maiúsculas e minúsculas
                        </div>
                        <div
                          className={`${styles.ruleRow} ${
                            /[0-9]/.test(registerPassword)
                              ? styles.ruleOk
                              : ""
                          }`}
                        >
                          {/[0-9]/.test(registerPassword) ? (
                            <Check className={styles.iconTiny} />
                          ) : (
                            <X className={styles.iconTinyMuted} />
                          )}
                          Pelo menos um número
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="reg-confirm-password"
                    className={styles.fieldLabel}
                  >
                    Confirmar Senha
                  </Label>
                  <div className={styles.inputWrapper}>
                    <Input
                      id="reg-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      required
                      className={styles.inputWithIcon}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={styles.toggleButton}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className={styles.iconMedium} />
                      ) : (
                        <Eye className={styles.iconMedium} />
                      )}
                    </button>
                  </div>
                  {registerConfirmPassword && (
                    <p
                      className={
                        registerPassword === registerConfirmPassword
                          ? styles.confirmHintGood
                          : styles.confirmHintBad
                      }
                    >
                      {registerPassword === registerConfirmPassword ? (
                        <Check className={styles.iconTiny} />
                      ) : (
                        <X className={styles.iconTiny} />
                      )}
                      {registerPassword === registerConfirmPassword
                        ? "As senhas coincidem"
                        : "As senhas não coincidem"}
                    </p>
                  )}
                </div>

                <div className={styles.termsRow}>
                  <label className={styles.termsLabel}>
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className={styles.termsCheckbox}
                    />
                    <span className={styles.termsText}>
                      Eu concordo com os{" "}
                      <button type="button" className={styles.termsButton}>
                        termos de uso
                      </button>{" "}
                      e a política de privacidade.
                    </span>
                  </label>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  variant="default"
                  className={`${styles.registerButton} ${styles.bubblyButton} ${
                    animateRegister ? styles.bubblyButtonAnimate : ""
                  }`}
                  onClick={() =>
                    triggerBubblyAnimation(
                      setAnimateRegister,
                      registerAnimateTimeoutRef
                    )
                  }
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className={styles.iconSpin} />
                      Criando conta...
                    </>
                  ) : (
                    "Criar conta de cliente"
                  )}
                </Button>

                <p className={styles.registerMeta}>
                  Cadastro cria uma conta de cliente. Contas admin continuam
                  restritas a acessos autorizados.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
