import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  CreditCard,
  Heart,
  Loader2,
  LogOut,
  MapPin,
  Package,
  Save,
  Settings,
  ShieldCheck,
  Star,
  Trash2,
  ShoppingBag,
} from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { routes } from "@/app/router/paths";
import {
  deleteAddress,
  getAddresses,
  updateAddress,
  type Address,
} from "@/features/auth/api/address-service";
import {
  createPaymentMethod,
  deletePaymentMethod,
  getPaymentMethods,
  updatePaymentMethod,
  type PaymentMethodPayload,
  type PaymentMethodType,
  type SavedPaymentMethod,
} from "@/features/auth/api/payment-method-service";
import {
  getProfile,
  updateEmail,
  updatePassword,
  updateProfile,
  type UserProfile,
} from "@/features/auth/api/profile-service";
import { useAuth } from "@/features/auth/context/auth-context";
import { useGamification } from "@/features/gamification/context/gamification-context";
import { Button } from "@/shared/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { ImageWithFallback } from "@/shared/ui/ImageWithFallback";
import { ThemeSwitcher } from "@/app/layout/components/ThemeSwitcher";
import styles from "./ProfilePage.module.css";

const orders = [
  {
    id: "1234",
    date: "20/10/2025",
    status: "Entregue",
    total: 156.8,
    items: 3,
    image: "https://images.unsplash.com/photo-1664165786318-9af861f2a9c3?w=100",
  },
  {
    id: "1233",
    date: "15/10/2025",
    status: "Em trânsito",
    total: 89.9,
    items: 1,
    image: "https://images.unsplash.com/photo-1758738880475-dac2ab1c92d4?w=100",
  },
  {
    id: "1232",
    date: "05/10/2025",
    status: "Entregue",
    total: 234.5,
    items: 5,
    image: "https://images.unsplash.com/photo-1613803745799-ba6c10aace85?w=100",
  },
];

const wishlist = [
  {
    id: "w1",
    name: "Sérum Anti-Idade Vitamina C",
    price: 89.9,
    image: "https://images.unsplash.com/photo-1613803745799-ba6c10aace85?w=200",
    inStock: true,
  },
  {
    id: "w2",
    name: "Paleta de Sombras Rose Gold",
    price: 79.9,
    image: "https://images.unsplash.com/photo-1758738880475-dac2ab1c92d4?w=200",
    inStock: true,
  },
  {
    id: "w3",
    name: "Base Líquida HD",
    price: 69.9,
    image: "https://images.unsplash.com/photo-1664165786318-9af861f2a9c3?w=200",
    inStock: false,
  },
];

type ProfileFormState = {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  gender: string;
  birth_date: string;
  accepts_marketing: boolean;
};

type PasswordFormState = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

type PaymentFormState = {
  method_type: PaymentMethodType;
  label: string;
  holder_name: string;
  billing_document: string;
  card_brand: string;
  card_last4: string;
  card_exp_month: string;
  card_exp_year: string;
  is_default: boolean;
};

const EMPTY_PROFILE_FORM: ProfileFormState = {
  name: "",
  email: "",
  cpf: "",
  phone: "",
  gender: "",
  birth_date: "",
  accepts_marketing: false,
};

const EMPTY_PASSWORD_FORM: PasswordFormState = {
  current_password: "",
  new_password: "",
  confirm_password: "",
};

const EMPTY_PAYMENT_FORM: PaymentFormState = {
  method_type: "card",
  label: "",
  holder_name: "",
  billing_document: "",
  card_brand: "",
  card_last4: "",
  card_exp_month: "",
  card_exp_year: "",
  is_default: false,
};

const paymentTypeLabel: Record<PaymentMethodType, string> = {
  card: "Cartão",
  pix: "Pix",
  boleto: "Boleto",
};

function mapProfileToForm(profile: UserProfile): ProfileFormState {
  return {
    name: profile.name ?? "",
    email: profile.email ?? "",
    cpf: profile.cpf ?? "",
    phone: profile.phone ?? "",
    gender: profile.gender ?? "",
    birth_date: profile.birth_date ?? "",
    accepts_marketing: profile.accepts_marketing ?? false,
  };
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatCep(value: string) {
  const digits = onlyDigits(value).slice(0, 8);
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return digits;
}

function formatAddress(address: Address) {
  const number = address.number ? `, ${address.number}` : "";
  const complement = address.complement ? ` - ${address.complement}` : "";
  const neighborhood = address.neighborhood ? `${address.neighborhood} - ` : "";

  return `${address.street}${number}${complement}, ${neighborhood}${address.city}/${address.state} - ${formatCep(address.cep)}`;
}

function getPaymentTitle(method: SavedPaymentMethod) {
  if (method.label) return method.label;
  if (method.method_type === "card") return "Cartão salvo";
  return paymentTypeLabel[method.method_type];
}

function getPaymentDetail(method: SavedPaymentMethod) {
  if (method.method_type === "card") {
    const brand = method.card_brand ? `${method.card_brand.toUpperCase()} ` : "";
    const validity =
      method.card_exp_month && method.card_exp_year
        ? ` · ${String(method.card_exp_month).padStart(2, "0")}/${method.card_exp_year}`
        : "";
    return `${brand}final ${method.card_last4 ?? "----"}${validity}`;
  }

  if (method.billing_document) {
    return `Documento ${method.billing_document}`;
  }

  return "Disponível para checkout";
}

export function ProfilePage() {
  const { logout, updateUser, user, isAdmin } = useAuth();
  const {
    completedMissionsCount,
    levelName,
    nextLevelName,
    pointsToNextLevel,
    progressToNextLevel,
    totalPoints,
  } = useGamification();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    ...EMPTY_PROFILE_FORM,
    name: user?.name ?? "",
    email: user?.email ?? "",
  });
  const [passwordForm, setPasswordForm] =
    useState<PasswordFormState>(EMPTY_PASSWORD_FORM);
  const [paymentForm, setPaymentForm] =
    useState<PaymentFormState>(EMPTY_PAYMENT_FORM);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<SavedPaymentMethod[]>([]);
  const [isAccountLoading, setIsAccountLoading] = useState(true);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [isPaymentSaving, setIsPaymentSaving] = useState(false);
  const [busyAddressId, setBusyAddressId] = useState<string | null>(null);
  const [busyPaymentId, setBusyPaymentId] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) return;

    let isMounted = true;

    async function loadAccountData() {
      setIsAccountLoading(true);
      try {
        const [nextProfile, nextAddresses, nextPaymentMethods] = await Promise.all([
          getProfile(),
          getAddresses(),
          getPaymentMethods(),
        ]);

        if (!isMounted) return;

        setProfile(nextProfile);
        setProfileForm(mapProfileToForm(nextProfile));
        setAddresses(nextAddresses);
        setPaymentMethods(nextPaymentMethods);
      } catch (error) {
        if (isMounted) {
          toast.error(error instanceof Error ? error.message : "Não foi possível carregar o perfil.");
        }
      } finally {
        if (isMounted) setIsAccountLoading(false);
      }
    }

    loadAccountData();

    return () => {
      isMounted = false;
    };
  }, [isAdmin]);

  if (isAdmin) {
    return <Navigate to={routes.adminDashboard} replace />;
  }

  const displayName = profile?.name ?? user?.name ?? "Cliente";
  const email = profile?.email ?? user?.email ?? "cliente@email.com";
  const initials = useMemo(
    () =>
      displayName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join(""),
    [displayName]
  );

  const refreshProfile = async () => {
    const nextProfile = await getProfile();
    setProfile(nextProfile);
    setProfileForm(mapProfileToForm(nextProfile));
    updateUser({
      id: nextProfile.id,
      name: nextProfile.name,
      email: nextProfile.email,
      role: nextProfile.role === "admin" ? "admin" : "customer",
    });
  };

  const refreshAddresses = async () => {
    setAddresses(await getAddresses());
  };

  const refreshPaymentMethods = async () => {
    setPaymentMethods(await getPaymentMethods());
  };

  const handleLogout = () => {
    logout();
    navigate(routes.home);
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!profileForm.name.trim()) {
      toast.error("Informe seu nome.");
      return;
    }

    if (!profileForm.email.trim()) {
      toast.error("Informe seu e-mail.");
      return;
    }

    const emailChanged = profile?.email && profile.email !== profileForm.email.trim();

    setIsProfileSaving(true);
    try {
      await updateProfile({
        name: profileForm.name.trim(),
        cpf: onlyDigits(profileForm.cpf),
        phone: onlyDigits(profileForm.phone),
        gender: profileForm.gender || undefined,
        birth_date: profileForm.birth_date || undefined,
        accepts_marketing: profileForm.accepts_marketing,
      });

      if (emailChanged) {
        await updateEmail(profileForm.email.trim());
        toast.success("E-mail atualizado. Entre novamente para continuar.");
        logout();
        navigate(routes.login, { replace: true });
        return;
      }

      await refreshProfile();
      toast.success("Perfil atualizado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar perfil.");
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (passwordForm.new_password.length < 8) {
      toast.error("A nova senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setIsPasswordSaving(true);
    try {
      await updatePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setPasswordForm(EMPTY_PASSWORD_FORM);
      toast.success("Senha alterada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao alterar senha.");
    } finally {
      setIsPasswordSaving(false);
    }
  };

  const handleSetAddressDefault = async (
    addressId: string,
    field: "is_default_shipping" | "is_default_billing"
  ) => {
    setBusyAddressId(addressId);
    try {
      await updateAddress(addressId, { [field]: true });
      await refreshAddresses();
      toast.success("Endereço atualizado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar endereço.");
    } finally {
      setBusyAddressId(null);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    setBusyAddressId(addressId);
    try {
      await deleteAddress(addressId);
      await refreshAddresses();
      toast.success("Endereço removido.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao remover endereço.");
    } finally {
      setBusyAddressId(null);
    }
  };

  const handlePaymentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: PaymentMethodPayload = {
      method_type: paymentForm.method_type,
      label: paymentForm.label.trim() || undefined,
      billing_document: onlyDigits(paymentForm.billing_document) || undefined,
      is_default: paymentForm.is_default,
    };

    if (paymentForm.method_type === "card") {
      const last4 = onlyDigits(paymentForm.card_last4);

      if (last4.length !== 4) {
        toast.error("Informe os 4 últimos dígitos do cartão.");
        return;
      }

      if (!paymentForm.holder_name.trim()) {
        toast.error("Informe o nome impresso no cartão.");
        return;
      }

      if (!paymentForm.card_exp_month || !paymentForm.card_exp_year) {
        toast.error("Informe a validade do cartão.");
        return;
      }

      payload.holder_name = paymentForm.holder_name.trim();
      payload.card_brand = paymentForm.card_brand || undefined;
      payload.card_last4 = last4;
      payload.card_exp_month = Number(paymentForm.card_exp_month);
      payload.card_exp_year = Number(paymentForm.card_exp_year);
    }

    setIsPaymentSaving(true);
    try {
      await createPaymentMethod(payload);
      await refreshPaymentMethods();
      setPaymentForm(EMPTY_PAYMENT_FORM);
      toast.success("Método de pagamento salvo.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar método de pagamento.");
    } finally {
      setIsPaymentSaving(false);
    }
  };

  const handleSetPaymentDefault = async (paymentMethodId: string) => {
    setBusyPaymentId(paymentMethodId);
    try {
      await updatePaymentMethod(paymentMethodId, { is_default: true });
      await refreshPaymentMethods();
      toast.success("Método principal atualizado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar método de pagamento.");
    } finally {
      setBusyPaymentId(null);
    }
  };

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    setBusyPaymentId(paymentMethodId);
    try {
      await deletePaymentMethod(paymentMethodId);
      await refreshPaymentMethods();
      toast.success("Método de pagamento removido.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao remover método de pagamento.");
    } finally {
      setBusyPaymentId(null);
    }
  };

  const renderSettings = () => (
    <div className={styles.settingsSection}>
      {isAccountLoading ? (
        <div className={styles.loadingState}>
          <Loader2 className={styles.spinnerIcon} />
          Carregando dados da conta...
        </div>
      ) : (
        <div className={styles.settingsGrid}>
          <form className={styles.settingsPanel} onSubmit={handleProfileSubmit}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitleRow}>
                <Settings className={styles.panelIcon} />
                <h3 className={styles.panelTitle}>Dados pessoais</h3>
              </div>
            </div>

            <div className={styles.formGrid}>
              <label className={styles.fieldGroup}>
                Nome
                <input
                  className={styles.input}
                  value={profileForm.name}
                  onChange={(event) =>
                    setProfileForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
              </label>

              <label className={styles.fieldGroup}>
                E-mail
                <input
                  className={styles.input}
                  type="email"
                  value={profileForm.email}
                  onChange={(event) =>
                    setProfileForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                />
              </label>

              <label className={styles.fieldGroup}>
                CPF
                <input
                  className={styles.input}
                  inputMode="numeric"
                  value={profileForm.cpf}
                  onChange={(event) =>
                    setProfileForm((prev) => ({ ...prev, cpf: event.target.value }))
                  }
                />
              </label>

              <label className={styles.fieldGroup}>
                Telefone
                <input
                  className={styles.input}
                  inputMode="tel"
                  value={profileForm.phone}
                  onChange={(event) =>
                    setProfileForm((prev) => ({ ...prev, phone: event.target.value }))
                  }
                />
              </label>

              <label className={styles.fieldGroup}>
                Gênero
                <select
                  className={styles.select}
                  value={profileForm.gender}
                  onChange={(event) =>
                    setProfileForm((prev) => ({ ...prev, gender: event.target.value }))
                  }
                >
                  <option value="">Não informado</option>
                  <option value="feminino">Feminino</option>
                  <option value="masculino">Masculino</option>
                  <option value="nao-binario">Não binário</option>
                  <option value="prefiro-nao-informar">Prefiro não informar</option>
                </select>
              </label>

              <label className={styles.fieldGroup}>
                Data de nascimento
                <input
                  className={styles.input}
                  type="date"
                  value={profileForm.birth_date}
                  onChange={(event) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      birth_date: event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <label className={styles.checkboxLine}>
              <input
                type="checkbox"
                checked={profileForm.accepts_marketing}
                onChange={(event) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    accepts_marketing: event.target.checked,
                  }))
                }
              />
              Receber novidades e ofertas
            </label>

            <div className={styles.formActions}>
              <Button type="submit" disabled={isProfileSaving}>
                {isProfileSaving ? (
                  <Loader2 className={styles.iconInlineSpin} />
                ) : (
                  <Save className={styles.iconInline} />
                )}
                Salvar dados
              </Button>
            </div>
          </form>

          <form className={styles.settingsPanel} onSubmit={handlePasswordSubmit}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitleRow}>
                <ShieldCheck className={styles.panelIcon} />
                <h3 className={styles.panelTitle}>Segurança</h3>
              </div>
            </div>

            <div className={styles.formGrid}>
              <label className={styles.fieldGroup}>
                Senha atual
                <input
                  className={styles.input}
                  type="password"
                  value={passwordForm.current_password}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      current_password: event.target.value,
                    }))
                  }
                />
              </label>

              <label className={styles.fieldGroup}>
                Nova senha
                <input
                  className={styles.input}
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      new_password: event.target.value,
                    }))
                  }
                />
              </label>

              <label className={styles.fieldGroup}>
                Confirmar senha
                <input
                  className={styles.input}
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirm_password: event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <div className={styles.formActions}>
              <Button type="submit" disabled={isPasswordSaving}>
                {isPasswordSaving ? (
                  <Loader2 className={styles.iconInlineSpin} />
                ) : (
                  <Save className={styles.iconInline} />
                )}
                Alterar senha
              </Button>
            </div>
          </form>

          <section className={`${styles.settingsPanel} ${styles.settingsPanelWide}`}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitleRow}>
                <MapPin className={styles.panelIcon} />
                <h3 className={styles.panelTitle}>Endereços</h3>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate(routes.addressCreate)}
              >
                <MapPin className={styles.iconInline} />
                Novo endereço
              </Button>
            </div>

            {addresses.length === 0 ? (
              <div className={styles.emptyState}>Nenhum endereço cadastrado.</div>
            ) : (
              <div className={styles.itemList}>
                {addresses.map((address) => (
                  <div key={address.id} className={styles.savedItem}>
                    <div className={styles.savedItemContent}>
                      <div className={styles.savedItemHeader}>
                        <p className={styles.savedItemTitle}>
                          {address.label || "Endereço"}
                        </p>
                        <div className={styles.badgeGroup}>
                          {address.is_default_shipping && (
                            <Badge className={styles.statusTransit}>Entrega</Badge>
                          )}
                          {address.is_default_billing && (
                            <Badge className={styles.statusOther}>Cobrança</Badge>
                          )}
                        </div>
                      </div>
                      <p className={styles.savedItemText}>{formatAddress(address)}</p>
                    </div>
                    <div className={styles.itemActions}>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={busyAddressId === address.id || address.is_default_shipping}
                        onClick={() =>
                          handleSetAddressDefault(address.id, "is_default_shipping")
                        }
                      >
                        Entrega
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={busyAddressId === address.id || address.is_default_billing}
                        onClick={() =>
                          handleSetAddressDefault(address.id, "is_default_billing")
                        }
                      >
                        Cobrança
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className={styles.iconButtonDanger}
                        disabled={busyAddressId === address.id}
                        onClick={() => handleDeleteAddress(address.id)}
                        aria-label="Remover endereço"
                      >
                        <Trash2 className={styles.iconSmall} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className={`${styles.settingsPanel} ${styles.settingsPanelWide}`}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitleRow}>
                <CreditCard className={styles.panelIcon} />
                <h3 className={styles.panelTitle}>Pagamentos</h3>
              </div>
            </div>

            <div className={styles.paymentGrid}>
              <form className={styles.paymentForm} onSubmit={handlePaymentSubmit}>
                <div className={styles.formGrid}>
                  <label className={styles.fieldGroup}>
                    Tipo
                    <select
                      className={styles.select}
                      value={paymentForm.method_type}
                      onChange={(event) =>
                        setPaymentForm((prev) => ({
                          ...prev,
                          method_type: event.target.value as PaymentMethodType,
                        }))
                      }
                    >
                      <option value="card">Cartão</option>
                      <option value="pix">Pix</option>
                      <option value="boleto">Boleto</option>
                    </select>
                  </label>

                  <label className={styles.fieldGroup}>
                    Apelido
                    <input
                      className={styles.input}
                      value={paymentForm.label}
                      onChange={(event) =>
                        setPaymentForm((prev) => ({
                          ...prev,
                          label: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className={styles.fieldGroup}>
                    CPF/CNPJ
                    <input
                      className={styles.input}
                      inputMode="numeric"
                      value={paymentForm.billing_document}
                      onChange={(event) =>
                        setPaymentForm((prev) => ({
                          ...prev,
                          billing_document: event.target.value,
                        }))
                      }
                    />
                  </label>

                  {paymentForm.method_type === "card" && (
                    <>
                      <label className={styles.fieldGroup}>
                        Nome no cartão
                        <input
                          className={styles.input}
                          value={paymentForm.holder_name}
                          onChange={(event) =>
                            setPaymentForm((prev) => ({
                              ...prev,
                              holder_name: event.target.value,
                            }))
                          }
                        />
                      </label>

                      <label className={styles.fieldGroup}>
                        Bandeira
                        <select
                          className={styles.select}
                          value={paymentForm.card_brand}
                          onChange={(event) =>
                            setPaymentForm((prev) => ({
                              ...prev,
                              card_brand: event.target.value,
                            }))
                          }
                        >
                          <option value="">Selecionar</option>
                          <option value="visa">Visa</option>
                          <option value="mastercard">Mastercard</option>
                          <option value="elo">Elo</option>
                          <option value="amex">Amex</option>
                        </select>
                      </label>

                      <label className={styles.fieldGroup}>
                        Final
                        <input
                          className={styles.input}
                          inputMode="numeric"
                          maxLength={4}
                          value={paymentForm.card_last4}
                          onChange={(event) =>
                            setPaymentForm((prev) => ({
                              ...prev,
                              card_last4: onlyDigits(event.target.value).slice(0, 4),
                            }))
                          }
                        />
                      </label>

                      <label className={styles.fieldGroup}>
                        Mês
                        <select
                          className={styles.select}
                          value={paymentForm.card_exp_month}
                          onChange={(event) =>
                            setPaymentForm((prev) => ({
                              ...prev,
                              card_exp_month: event.target.value,
                            }))
                          }
                        >
                          <option value="">MM</option>
                          {Array.from({ length: 12 }, (_, index) => index + 1).map(
                            (month) => (
                              <option key={month} value={month}>
                                {String(month).padStart(2, "0")}
                              </option>
                            )
                          )}
                        </select>
                      </label>

                      <label className={styles.fieldGroup}>
                        Ano
                        <select
                          className={styles.select}
                          value={paymentForm.card_exp_year}
                          onChange={(event) =>
                            setPaymentForm((prev) => ({
                              ...prev,
                              card_exp_year: event.target.value,
                            }))
                          }
                        >
                          <option value="">AAAA</option>
                          {Array.from({ length: 12 }, (_, index) => 2026 + index).map(
                            (year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            )
                          )}
                        </select>
                      </label>
                    </>
                  )}
                </div>

                <label className={styles.checkboxLine}>
                  <input
                    type="checkbox"
                    checked={paymentForm.is_default}
                    onChange={(event) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        is_default: event.target.checked,
                      }))
                    }
                  />
                  Definir como principal
                </label>

                <div className={styles.formActions}>
                  <Button type="submit" disabled={isPaymentSaving}>
                    {isPaymentSaving ? (
                      <Loader2 className={styles.iconInlineSpin} />
                    ) : (
                      <Save className={styles.iconInline} />
                    )}
                    Salvar método
                  </Button>
                </div>
              </form>

              <div className={styles.itemList}>
                {paymentMethods.length === 0 ? (
                  <div className={styles.emptyState}>Nenhum método salvo.</div>
                ) : (
                  paymentMethods.map((method) => (
                    <div key={method.id} className={styles.savedItem}>
                      <div className={styles.savedItemContent}>
                        <div className={styles.savedItemHeader}>
                          <p className={styles.savedItemTitle}>{getPaymentTitle(method)}</p>
                          <div className={styles.badgeGroup}>
                            <Badge className={styles.statusTransit}>
                              {paymentTypeLabel[method.method_type]}
                            </Badge>
                            {method.is_default && (
                              <Badge className={styles.statusDelivered}>Principal</Badge>
                            )}
                          </div>
                        </div>
                        <p className={styles.savedItemText}>{getPaymentDetail(method)}</p>
                      </div>
                      <div className={styles.itemActions}>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={busyPaymentId === method.id || method.is_default}
                          onClick={() => handleSetPaymentDefault(method.id)}
                        >
                          Principal
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className={styles.iconButtonDanger}
                          disabled={busyPaymentId === method.id}
                          onClick={() => handleDeletePaymentMethod(method.id)}
                          aria-label="Remover método de pagamento"
                        >
                          <Trash2 className={styles.iconSmall} />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <section className={styles.settingsPanel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitleRow}>
                <Settings className={styles.panelIcon} />
                <h3 className={styles.panelTitle}>Aparência</h3>
              </div>
              <ThemeSwitcher />
            </div>
          </section>
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.profileCard}>
          <div className={styles.profileRow}>
            <div className={styles.profileInfo}>
              <div className={styles.avatar}>
                <span>{initials || "CL"}</span>
              </div>
              <div>
                <h1 className={styles.name}>{displayName}</h1>
                <p className={styles.email}>{email}</p>
                <div className={styles.badgeRow}>
                  <Badge className={styles.statusOther}>Cliente VIP</Badge>
                  <span className={styles.memberSince}>
                    Membro desde Out 2024
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="lg"
              className={styles.logoutButton}
              onClick={handleLogout}
            >
              <LogOut className={styles.iconInline} />
              Sair
            </Button>
          </div>

          <div className={styles.loyaltyCard}>
            <div className={styles.loyaltyHeader}>
              <div>
                <h3 className={styles.loyaltyTitle}>Programa de Fidelidade</h3>
                <div className={styles.loyaltyBadgeRow}>
                  <Badge className={styles.loyaltyBadge}>{levelName}</Badge>
                  <span className={styles.loyaltyText}>
                    {completedMissionsCount} missões concluídas
                  </span>
                </div>
                <p className={styles.loyaltyPoints}>
                  Você tem {totalPoints.toLocaleString("pt-BR")} pontos
                </p>
              </div>
              <div className={styles.textRight}>
                <p className={styles.loyaltyHighlight}>
                  {nextLevelName
                    ? `Faltam ${pointsToNextLevel} pontos`
                    : "Nível máximo desbloqueado"}
                </p>
                <p className={styles.loyaltyText}>
                  {nextLevelName
                    ? `para o nível ${nextLevelName}`
                    : "Continue acumulando para se manter no topo"}
                </p>
              </div>
            </div>
            <Progress value={progressToNextLevel} className={styles.progressBar} />
            <div className={styles.loyaltyActions}>
              <Button variant="default" size="sm" onClick={() => navigate(routes.missions)}>
                Ver missões
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate(routes.ranking)}>
                Ver ranking
              </Button>
            </div>
          </div>
        </div>

        <div className={styles.tabsCard}>
          <Tabs defaultValue="orders" className={styles.tabsRoot}>
            <TabsList className={styles.tabsList}>
              <TabsTrigger value="orders" className={styles.tabTrigger}>
                <Package className={styles.iconInline} />
                Pedidos
              </TabsTrigger>
              <TabsTrigger value="wishlist" className={styles.tabTrigger}>
                <Heart className={styles.iconInline} />
                Wishlist
              </TabsTrigger>
              <TabsTrigger value="reviews" className={styles.tabTrigger}>
                <Star className={styles.iconInline} />
                Avaliações
              </TabsTrigger>
              <TabsTrigger value="settings" className={styles.tabTrigger}>
                <Settings className={styles.iconInline} />
                Configurações
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className={styles.tabContent}>
              <h2 className={styles.sectionTitle}>Histórico de Pedidos</h2>
              <div className={styles.ordersList}>
                {orders.map((order) => (
                  <div key={order.id} className={styles.orderCard}>
                    <div className={styles.orderInfo}>
                      <ImageWithFallback
                        src={order.image}
                        alt="Product"
                        className={styles.orderImage}
                      />
                      <div>
                        <p className={styles.orderId}>Pedido #{order.id}</p>
                        <p className={styles.orderMeta}>
                          {order.date} • {order.items}{" "}
                          {order.items === 1 ? "item" : "itens"}
                        </p>
                        <Badge
                          className={
                            order.status === "Entregue"
                              ? `${styles.statusBadge} ${styles.statusDelivered}`
                              : order.status === "Em trânsito"
                                ? `${styles.statusBadge} ${styles.statusTransit}`
                                : `${styles.statusBadge} ${styles.statusOther}`
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                    <div className={styles.textRight}>
                      <p className={styles.orderTotal}>
                        R$ {order.total.toFixed(2).replace(".", ",")}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className={styles.orderButton}
                      >
                        Ver detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="wishlist" className={styles.tabContent}>
              <h2 className={styles.sectionTitle}>Minha Wishlist</h2>
              <div className={styles.wishlistGrid}>
                {wishlist.map((item) => (
                  <div key={item.id} className={styles.wishlistCard}>
                    <div className={styles.wishlistImageWrap}>
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className={styles.wishlistImage}
                      />
                    </div>
                    <div className={styles.wishlistBody}>
                      <h3 className={styles.wishlistTitle}>{item.name}</h3>
                      <p className={styles.wishlistPrice}>
                        R$ {item.price.toFixed(2).replace(".", ",")}
                      </p>
                      <div className={styles.wishlistActions}>
                        <Button
                          variant="default"
                          size="sm"
                          className={styles.wishlistAddButton}
                          disabled={!item.inStock}
                        >
                          {item.inStock ? (
                            <>
                              <ShoppingBag className={styles.iconInline} />
                              Adicionar
                            </>
                          ) : (
                            "Indisponível"
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className={styles.wishlistIconButton}
                        >
                          <Heart className={styles.iconFavorite} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className={styles.tabContent}>
              <h2 className={styles.sectionTitle}>Minhas Avaliações</h2>
              <div className={styles.reviewList}>
                <div className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <div>
                      <p className={styles.reviewTitle}>
                        Batom Matte Nude Luxo
                      </p>
                      <div className={styles.reviewStars}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={styles.reviewStar} />
                        ))}
                      </div>
                    </div>
                    <span className={styles.reviewDate}>15/10/2025</span>
                  </div>
                  <p className={styles.reviewText}>
                    Produto maravilhoso! Amei a textura, e a cor é perfeita.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className={styles.tabContent}>
              <h2 className={styles.sectionTitle}>Configurações da Conta</h2>
              {renderSettings()}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
