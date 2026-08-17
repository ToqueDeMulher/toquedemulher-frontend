import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Home,
  Loader2,
  LogIn,
  MapPin,
  Plus,
  ShieldCheck,
  Truck,
  WalletCards,
  XCircle,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { cn } from "@/shared/ui/utils";
import { CheckoutStepper } from "@/features/cart/components/CheckoutStepper";
import {
  getCheckoutStepIndex,
  normalizeCheckoutFlowStep,
} from "@/features/cart/lib/checkout-flow";
import { routes } from "@/app/router/paths";
import {
  createAddress,
  getAddresses,
  getRegiaoByUF,
  type Address,
  type AddressRequest,
} from "@/features/auth/api/address-service";
import { useAuth } from "@/features/auth/context/auth-context";
import { createCheckoutSession } from "@/features/cart/api/checkout-service";
import { useCart } from "@/features/cart/context/cart-context";
import { useGamification } from "@/features/gamification/context/gamification-context";
import { calculateCartRewardPoints } from "@/features/gamification/lib/gamification-config";
import { toast } from "sonner";
import styles from "./CheckoutPage.module.css";

type AddressFormState = {
  fullName: string;
  email: string;
  zipCode: string;
  phone: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  reference: string;
};

type AddressMode = "saved" | "new";

const REQUIRED_ADDRESS_FIELDS: Array<keyof AddressFormState> = [
  "fullName",
  "email",
  "zipCode",
  "phone",
  "street",
  "number",
  "neighborhood",
  "city",
  "state",
];

const stepContent = {
  address: {
    title: "Endereço de entrega",
  },
  payment: {
    title: "Pagamento",
  },
  confirmation: {
    title: "Confirmação do pedido",
  },
} as const;

function createEmptyAddressForm(contact?: { name?: string; email?: string } | null): AddressFormState {
  return {
    fullName: contact?.name ?? "",
    email: contact?.email ?? "",
    zipCode: "",
    phone: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    reference: "",
  };
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatZipCode(zipCode: string) {
  if (zipCode.length <= 5) return zipCode;
  return `${zipCode.slice(0, 5)}-${zipCode.slice(5, 8)}`;
}

function formatPhone(phone: string) {
  if (phone.length <= 2) return phone ? `(${phone}` : "";
  if (phone.length <= 7) return `(${phone.slice(0, 2)}) ${phone.slice(2)}`;
  return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7, 11)}`;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatSavedAddress(address: Address) {
  const street = address.street ?? "";
  const city = address.city ?? "";
  const state = address.state ?? "";
  const number = address.number ? `, ${address.number}` : "";
  const complement = address.complement ? ` - ${address.complement}` : "";
  const neighborhood = address.neighborhood ? `${address.neighborhood} - ` : "";
  const cep = formatZipCode(onlyDigits(address.cep).slice(0, 8));

  return `${street}${number}${complement}, ${neighborhood}${city}/${state} - ${cep}`;
}

function mapSavedAddressToForm(
  address: Address,
  contact?: { name?: string; email?: string } | null,
): AddressFormState {
  return {
    fullName: contact?.name ?? "",
    email: contact?.email ?? "",
    zipCode: onlyDigits(address.cep).slice(0, 8),
    phone: onlyDigits(address.ddd ?? "").slice(0, 11),
    street: address.street ?? "",
    number: address.number ?? "",
    complement: address.complement ?? "",
    neighborhood: address.neighborhood ?? "",
    city: address.city ?? "",
    state: address.state ?? "",
    reference: "",
  };
}

function createAddressPayload(
  addressForm: AddressFormState,
  isDefaultShipping: boolean,
): AddressRequest {
  const state = addressForm.state.trim().toUpperCase();

  return {
    label: "Entrega",
    cep: onlyDigits(addressForm.zipCode).slice(0, 8),
    street: addressForm.street.trim(),
    number: addressForm.number.trim(),
    complement: addressForm.complement.trim() || undefined,
    neighborhood: addressForm.neighborhood.trim(),
    city: addressForm.city.trim(),
    state,
    region: getRegiaoByUF(state),
    ddd: onlyDigits(addressForm.phone).slice(0, 2),
    is_default_shipping: isDefaultShipping,
    is_default_billing: false,
  };
}

function findMatchingAddress(addresses: Address[], addressForm: AddressFormState) {
  const cep = onlyDigits(addressForm.zipCode);
  const street = addressForm.street.trim().toLowerCase();
  const number = addressForm.number.trim().toLowerCase();

  return (
    addresses.find(
      (address) =>
        onlyDigits(address.cep) === cep &&
        (address.street ?? "").trim().toLowerCase() === street &&
        (address.number ?? "").trim().toLowerCase() === number,
    ) ??
    addresses.find((address) => address.is_default_shipping) ??
    addresses[0] ??
    null
  );
}

function getAddressErrors(addressForm: AddressFormState) {
  const errors: Partial<Record<keyof AddressFormState, string>> = {};

  if (addressForm.fullName.trim().length < 3) {
    errors.fullName = "Informe o nome completo da destinatária.";
  }

  if (!isValidEmail(addressForm.email.trim())) {
    errors.email = "Digite um e-mail válido para contato.";
  }

  if (addressForm.zipCode.length !== 8) {
    errors.zipCode = "Digite um CEP com 8 dígitos.";
  }

  if (addressForm.phone.length < 10) {
    errors.phone = "Digite um telefone com DDD.";
  }

  if (addressForm.street.trim().length === 0) {
    errors.street = "Informe a rua ou avenida de entrega.";
  }

  if (addressForm.number.trim().length === 0) {
    errors.number = "Informe o número do endereço.";
  }

  if (addressForm.neighborhood.trim().length === 0) {
    errors.neighborhood = "Informe o bairro.";
  }

  if (addressForm.city.trim().length === 0) {
    errors.city = "Informe a cidade.";
  }

  if (addressForm.state.trim().length === 0) {
    errors.state = "Informe o estado.";
  }

  return errors;
}

function hasMissingAddressField(addressForm: AddressFormState) {
  return REQUIRED_ADDRESS_FIELDS.some((field) => {
    const value = addressForm[field].trim();

    if (field === "email") return !isValidEmail(value);
    if (field === "zipCode") return value.length !== 8;
    if (field === "phone") return value.length < 10;

    return value.length === 0;
  });
}

function createOrderNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `TDM-${year}${month}${day}-${hours}${minutes}`;
}

function addBusinessDays(baseDate: Date, businessDays: number) {
  const result = new Date(baseDate);
  let addedDays = 0;

  while (addedDays < businessDays) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();

    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      addedDays += 1;
    }
  }

  return result;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { step } = useParams<{ step?: string }>();
  const [searchParams] = useSearchParams();
  const { isLoggedIn, user } = useAuth();
  const { items, itemCount, subtotal, reset } = useCart();
  const { trackOrder } = useGamification();
  const currentStep = normalizeCheckoutFlowStep(step);
  const checkoutResult =
    step === "success" || step === "failure" ? step : null;
  const checkoutSessionId = searchParams.get("session_id");
  const handledCheckoutResultRef = useRef(false);

  const [addressForm, setAddressForm] = useState<AddressFormState>(() =>
    createEmptyAddressForm(user),
  );
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [addressMode, setAddressMode] = useState<AddressMode>("new");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [shouldSaveAddress, setShouldSaveAddress] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [addressAttempted, setAddressAttempted] = useState(false);
  const [orderNumber] = useState(createOrderNumber);
  const addressErrors = getAddressErrors(addressForm);
  const selectedAddress =
    savedAddresses.find((address) => address.id === selectedAddressId) ?? null;
  const isUsingSavedAddress = addressMode === "saved" && selectedAddress !== null;
  const isAddressComplete =
    isUsingSavedAddress || Object.keys(addressErrors).length === 0;

  useEffect(() => {
    let isMounted = true;

    if (!isLoggedIn) {
      setSavedAddresses([]);
      setSelectedAddressId(null);
      setAddressMode("new");
      setShouldSaveAddress(false);
      return;
    }

    setAddressForm((prev) => ({
      ...prev,
      fullName: prev.fullName || user?.name || "",
      email: prev.email || user?.email || "",
    }));
    setIsLoadingAddresses(true);

    getAddresses()
      .then((addresses) => {
        if (!isMounted) return;

        setSavedAddresses(addresses);
        const preferredAddress =
          addresses.find((address) => address.is_default_shipping) ??
          addresses[0] ??
          null;

        if (preferredAddress) {
          setSelectedAddressId(preferredAddress.id);
          setAddressMode("saved");
          setAddressForm(mapSavedAddressToForm(preferredAddress, user));
          setShouldSaveAddress(false);
          return;
        }

        setSelectedAddressId(null);
        setAddressMode("new");
        setShouldSaveAddress(true);
      })
      .catch(() => {
        if (!isMounted) return;
        toast.error("Não foi possível carregar seus endereços salvos.");
      })
      .finally(() => {
        if (isMounted) setIsLoadingAddresses(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn, user?.email, user?.name]);

  useEffect(() => {
    if (
      checkoutResult !== "success" ||
      handledCheckoutResultRef.current ||
      items.length === 0
    ) {
      return;
    }

    handledCheckoutResultRef.current = true;
    const earnedPoints = trackOrder(
      items.map((item) => ({
        price: item.price,
        quantity: item.quantity,
      })),
    );

    reset();
    toast.success(`Pagamento aprovado. Você ganhou +${earnedPoints} pontos.`);
  }, [checkoutResult, items, reset, trackOrder]);

  if (!checkoutResult && step !== undefined && step !== currentStep) {
    return <Navigate to={routes.checkoutStep(currentStep)} replace />;
  }

  if (!checkoutResult && currentStep === "payment" && !isLoadingAddresses && !isAddressComplete) {
    return <Navigate to={routes.checkoutStep("address")} replace />;
  }

  if (!checkoutResult && currentStep === "confirmation") {
    return <Navigate to={routes.checkoutStep("payment")} replace />;
  }

  if (!checkoutResult && items.length === 0) {
    return <Navigate to={routes.cart} replace />;
  }

  const shipping = 0;
  const total = subtotal + shipping;
  const rewardPoints = calculateCartRewardPoints(
    items.map((item) => ({
      price: item.price,
      quantity: item.quantity,
    })),
  );
  const estimatedDate = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(addBusinessDays(new Date(), 7));
  const currentStepIndex = checkoutResult
    ? getCheckoutStepIndex("confirmation")
    : getCheckoutStepIndex(currentStep);
  const addressSummary = [
    addressForm.street,
    addressForm.number,
    addressForm.complement,
  ]
    .filter(Boolean)
    .join(", ");
  const hasSavedAddresses = isLoggedIn && savedAddresses.length > 0;
  const shouldShowAddressForm =
    !isLoggedIn ||
    (!isLoadingAddresses && (addressMode === "new" || !isUsingSavedAddress));

  const updateAddressField = (field: keyof AddressFormState, value: string) => {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectSavedAddress = (address: Address) => {
    setAddressMode("saved");
    setSelectedAddressId(address.id);
    setAddressAttempted(false);
    setAddressForm(mapSavedAddressToForm(address, user));
  };

  const handleUseNewAddress = () => {
    setAddressMode("new");
    setSelectedAddressId(null);
    setAddressAttempted(false);
    setShouldSaveAddress(savedAddresses.length === 0);
    setAddressForm((prev) => ({
      ...createEmptyAddressForm(user),
      fullName: prev.fullName || user?.name || "",
      email: prev.email || user?.email || "",
    }));
  };

  const handleAddressSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAddressAttempted(true);

    if (isUsingSavedAddress) {
      toast.success("Endereço selecionado. Agora escolha a forma de pagamento.");
      navigate(routes.checkoutStep("payment"));
      return;
    }

    if (hasMissingAddressField(addressForm)) {
      toast.error("Preencha os campos obrigatórios com dados válidos.");
      return;
    }

    if (!isLoggedIn) {
      toast.error("Entre na sua conta para continuar para o pagamento seguro.");
      navigate(routes.login, {
        state: { from: { pathname: routes.checkoutStep("address") } },
      });
      return;
    }

    setIsSavingAddress(true);

    try {
      await createAddress(
        createAddressPayload(
          addressForm,
          shouldSaveAddress || savedAddresses.length === 0,
        ),
      );

      const nextAddresses = await getAddresses();
      const nextSelectedAddress = findMatchingAddress(nextAddresses, addressForm);

      if (!nextSelectedAddress) {
        throw new Error("Endereço criado não foi encontrado.");
      }

      setSavedAddresses(nextAddresses);
      setSelectedAddressId(nextSelectedAddress.id);
      setAddressMode("saved");
      setAddressForm(mapSavedAddressToForm(nextSelectedAddress, user));
      toast.success("Endereço selecionado. Agora siga para o pagamento seguro.");
    } catch {
      toast.error("Não foi possível preparar o endereço. Tente novamente.");
      setIsSavingAddress(false);
      return;
    }

    setIsSavingAddress(false);
    navigate(routes.checkoutStep("payment"));
  };

  const handlePaymentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isLoggedIn) {
      toast.error("Entre na sua conta para iniciar o pagamento.");
      navigate(routes.login, {
        state: { from: { pathname: routes.checkoutStep("payment") } },
      });
      return;
    }

    if (!selectedAddressId) {
      toast.error("Escolha ou cadastre um endereço antes de pagar.");
      navigate(routes.checkoutStep("address"));
      return;
    }

    setIsCreatingCheckout(true);

    try {
      const checkoutSession = await createCheckoutSession(selectedAddressId, items);
      window.location.assign(checkoutSession.checkout_url);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível iniciar o pagamento.",
      );
      setIsCreatingCheckout(false);
    }
  };

  const renderAddressStep = () => (
    <form className={styles.checkoutBody} onSubmit={handleAddressSubmit} noValidate>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIconWrap}>
            <MapPin className={styles.sectionIcon} />
          </span>
          <div>
            <h2 className={styles.sectionTitle}>Dados do endereço</h2>
            <p className={styles.sectionText}>
              Use um endereço em que alguém possa receber a entrega em horário
              comercial.
            </p>
          </div>
        </div>

        {isLoggedIn && (
          <div className={styles.savedAddressPanel}>
            {isLoadingAddresses ? (
              <div className={styles.addressLoading}>
                <Loader2 className={styles.addressLoadingIcon} />
                <span>Carregando endereços salvos</span>
              </div>
            ) : hasSavedAddresses ? (
              <>
                <div className={styles.savedAddressToolbar}>
                  <p className={styles.savedAddressHeading}>Endereços salvos</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className={styles.savedAddressAction}
                    onClick={handleUseNewAddress}
                  >
                    <Plus className={styles.savedAddressButtonIcon} />
                    Adicionar novo
                  </Button>
                </div>

                <div className={styles.savedAddressList}>
                  {savedAddresses.map((address) => {
                    const isSelected =
                      addressMode === "saved" && selectedAddressId === address.id;

                    return (
                      <button
                        key={address.id}
                        type="button"
                        className={cn(
                          styles.savedAddressCard,
                          isSelected && styles.savedAddressCardActive,
                        )}
                        onClick={() => handleSelectSavedAddress(address)}
                        aria-pressed={isSelected}
                      >
                        <span className={styles.savedAddressCardTop}>
                          <span className={styles.savedAddressTitleRow}>
                            <Home className={styles.savedAddressIcon} />
                            <span className={styles.savedAddressTitle}>
                              {address.label || "Endereço de entrega"}
                            </span>
                          </span>
                          {address.is_default_shipping && (
                            <span className={styles.savedAddressBadge}>Padrão</span>
                          )}
                        </span>
                        <span className={styles.savedAddressText}>
                          {formatSavedAddress(address)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className={styles.addressEmptyNotice}>
                <Home className={styles.savedAddressIcon} />
                <span>Nenhum endereço salvo ainda.</span>
              </div>
            )}
          </div>
        )}

        {isUsingSavedAddress && selectedAddress && (
          <div className={styles.selectedAddressNotice}>
            <Home className={styles.savedAddressIcon} />
            <div>
              <p className={styles.saveAddressTitle}>
                Entregar em {selectedAddress.label || "endereço salvo"}
              </p>
              <p className={styles.saveAddressText}>
                {formatSavedAddress(selectedAddress)}
              </p>
            </div>
          </div>
        )}

        {shouldShowAddressForm && (
          <>
            {addressAttempted && Object.keys(addressErrors).length > 0 && (
              <div className={styles.errorSummary} role="alert">
                <p className={styles.errorSummaryTitle}>
                  Revise os campos obrigatórios do endereço antes de continuar.
                </p>
                <ul className={styles.errorList}>
                  {Object.values(addressErrors).map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className={styles.formGrid}>
          <div className={styles.fullField}>
            <Label htmlFor="fullName" className={styles.fieldLabel}>
              Nome completo
            </Label>
            <Input
              id="fullName"
              value={addressForm.fullName}
              onChange={(event) =>
                updateAddressField("fullName", event.target.value)
              }
              className={styles.fieldInput}
              placeholder="Como deve aparecer na entrega"
              autoComplete="name"
              required
              aria-invalid={addressAttempted && !!addressErrors.fullName}
              aria-describedby={
                addressAttempted && addressErrors.fullName ? "fullName-error" : undefined
              }
            />
            {addressAttempted && addressErrors.fullName && (
              <p id="fullName-error" className={styles.fieldError}>
                {addressErrors.fullName}
              </p>
            )}
          </div>

          <div className={styles.fullField}>
            <Label htmlFor="email" className={styles.fieldLabel}>
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              value={addressForm.email}
              onChange={(event) =>
                updateAddressField("email", event.target.value)
              }
              className={styles.fieldInput}
              placeholder="seu@exemplo.com"
            />
            {addressAttempted && addressErrors.email && (
              <p id="checkout-email-error" className={styles.fieldError}>
                {addressErrors.email}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="zipCode" className={styles.fieldLabel}>
              CEP
            </Label>
            <Input
              id="zipCode"
              value={formatZipCode(addressForm.zipCode)}
              onChange={(event) =>
                updateAddressField(
                  "zipCode",
                  event.target.value.replace(/\D/g, "").slice(0, 8),
                )
              }
              className={styles.fieldInput}
              placeholder="00000-000"
              autoComplete="postal-code"
              inputMode="numeric"
              required
              aria-invalid={addressAttempted && !!addressErrors.zipCode}
              aria-describedby={
                addressAttempted && addressErrors.zipCode ? "zipCode-error" : undefined
              }
            />
            {addressAttempted && addressErrors.zipCode && (
              <p id="zipCode-error" className={styles.fieldError}>
                {addressErrors.zipCode}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="phone" className={styles.fieldLabel}>
              Telefone
            </Label>
            <Input
              id="phone"
              value={formatPhone(addressForm.phone)}
              onChange={(event) =>
                updateAddressField(
                  "phone",
                  event.target.value.replace(/\D/g, "").slice(0, 11),
                )
              }
              className={styles.fieldInput}
              placeholder="(00) 00000-0000"
              autoComplete="tel"
              inputMode="tel"
              required
              aria-invalid={addressAttempted && !!addressErrors.phone}
              aria-describedby={
                addressAttempted && addressErrors.phone ? "phone-error" : undefined
              }
            />
            {addressAttempted && addressErrors.phone && (
              <p id="phone-error" className={styles.fieldError}>
                {addressErrors.phone}
              </p>
            )}
          </div>

          <div className={styles.fullField}>
            <Label htmlFor="street" className={styles.fieldLabel}>
              Endereço
            </Label>
            <Input
              id="street"
              value={addressForm.street}
              onChange={(event) =>
                updateAddressField("street", event.target.value)
              }
              className={styles.fieldInput}
              placeholder="Rua, avenida ou logradouro"
              autoComplete="address-line1"
              required
              aria-invalid={addressAttempted && !!addressErrors.street}
              aria-describedby={
                addressAttempted && addressErrors.street ? "street-error" : undefined
              }
            />
            {addressAttempted && addressErrors.street && (
              <p id="street-error" className={styles.fieldError}>
                {addressErrors.street}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="number" className={styles.fieldLabel}>
              Número
            </Label>
            <Input
              id="number"
              value={addressForm.number}
              onChange={(event) =>
                updateAddressField("number", event.target.value)
              }
              className={styles.fieldInput}
              placeholder="123"
              autoComplete="address-line2"
              inputMode="numeric"
              required
              aria-invalid={addressAttempted && !!addressErrors.number}
              aria-describedby={
                addressAttempted && addressErrors.number ? "number-error" : undefined
              }
            />
            {addressAttempted && addressErrors.number && (
              <p id="number-error" className={styles.fieldError}>
                {addressErrors.number}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="complement" className={styles.fieldLabel}>
              Apto / Complemento
            </Label>
            <Input
              id="complement"
              value={addressForm.complement}
              onChange={(event) =>
                updateAddressField("complement", event.target.value)
              }
              className={styles.fieldInput}
              placeholder="Apto 302, Bloco B"
              autoComplete="address-line2"
            />
          </div>

          <div>
            <Label htmlFor="neighborhood" className={styles.fieldLabel}>
              Bairro
            </Label>
            <Input
              id="neighborhood"
              value={addressForm.neighborhood}
              onChange={(event) =>
                updateAddressField("neighborhood", event.target.value)
              }
              className={styles.fieldInput}
              placeholder="Seu bairro"
              autoComplete="address-level3"
              required
              aria-invalid={addressAttempted && !!addressErrors.neighborhood}
              aria-describedby={
                addressAttempted && addressErrors.neighborhood
                  ? "neighborhood-error"
                  : undefined
              }
            />
            {addressAttempted && addressErrors.neighborhood && (
              <p id="neighborhood-error" className={styles.fieldError}>
                {addressErrors.neighborhood}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="city" className={styles.fieldLabel}>
              Cidade
            </Label>
            <Input
              id="city"
              value={addressForm.city}
              onChange={(event) => updateAddressField("city", event.target.value)}
              className={styles.fieldInput}
              placeholder="Sua cidade"
              autoComplete="address-level2"
              required
              aria-invalid={addressAttempted && !!addressErrors.city}
              aria-describedby={addressAttempted && addressErrors.city ? "city-error" : undefined}
            />
            {addressAttempted && addressErrors.city && (
              <p id="city-error" className={styles.fieldError}>
                {addressErrors.city}
              </p>
            )}
          </div>

          <div className={styles.fullField}>
            <Label htmlFor="state" className={styles.fieldLabel}>
              Estado
            </Label>
            <Input
              id="state"
              value={addressForm.state}
              onChange={(event) => updateAddressField("state", event.target.value)}
              className={styles.fieldInput}
              placeholder="Ex.: DF, SP, RJ"
              autoComplete="address-level1"
              required
              aria-invalid={addressAttempted && !!addressErrors.state}
              aria-describedby={addressAttempted && addressErrors.state ? "state-error" : undefined}
            />
            {addressAttempted && addressErrors.state && (
              <p id="state-error" className={styles.fieldError}>
                {addressErrors.state}
              </p>
            )}
          </div>

          <div className={styles.fullField}>
            <Label htmlFor="reference" className={styles.fieldLabel}>
              Ponto de referência
            </Label>
            <Textarea
              id="reference"
              value={addressForm.reference}
              onChange={(event) =>
                updateAddressField("reference", event.target.value)
              }
              className={styles.fieldTextarea}
              placeholder="Prédio, cor do portão, instruções para entrega etc."
            />
          </div>
            </div>

            {isLoggedIn && (
              <label className={styles.saveAddressToggle}>
                <input
                  type="checkbox"
                  className={styles.saveAddressCheckbox}
                  checked={shouldSaveAddress}
                  onChange={(event) => setShouldSaveAddress(event.target.checked)}
                />
                <span>
                  <span className={styles.saveAddressTitle}>
                    Definir como endereço padrão
                  </span>
                  <span className={styles.saveAddressText}>
                    O endereço será salvo para esta compra e poderá ficar como padrão no perfil.
                  </span>
                </span>
              </label>
            )}
          </>
        )}
      </div>

      <div className={styles.noticeCard}>
        <Truck className={styles.noticeIcon} />
        <div>
          <p className={styles.noticeTitle}>Entrega padrão</p>
          <p className={styles.noticeText}>
            Prazo médio de 5 a 10 dias úteis após a confirmação do pagamento.
          </p>
        </div>
      </div>

      <div className={styles.actionsRow}>
        <Button
          type="button"
          size="lg"
          variant="outline"
          className={styles.secondaryButton}
          onClick={() => navigate(routes.cart)}
        >
          Voltar ao carrinho
        </Button>
        <Button
          size="lg"
          type="submit"
          className={styles.primaryButton}
          disabled={isLoadingAddresses || isSavingAddress}
        >
          {isSavingAddress ? "Salvando endereço..." : "Continuar para pagamento"}
        </Button>
      </div>
    </form>
  );

  const renderPaymentStep = () => (
    <form className={styles.checkoutBody} onSubmit={handlePaymentSubmit} noValidate>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIconWrap}>
            <WalletCards className={styles.sectionIcon} />
          </span>
          <div>
            <h2 className={styles.sectionTitle}>Forma de pagamento</h2>
            <p className={styles.sectionText}>
              O pagamento será feito no Checkout seguro da Stripe.
            </p>
          </div>
        </div>

        <div className={styles.paymentGatewayCard}>
          <div className={styles.paymentGatewayTop}>
            <span className={styles.paymentGatewayIconWrap}>
              <CreditCard className={styles.paymentGatewayIcon} />
            </span>
            <div>
              <h3 className={styles.paymentGatewayTitle}>Stripe Checkout</h3>
              <p className={styles.paymentGatewayText}>
                A Toque de Mulher não armazena dados de cartão. A Stripe recebe
                o pagamento em uma página protegida e depois retorna você para o pedido.
              </p>
            </div>
          </div>

          <div className={styles.paymentGatewayMeta}>
            <ShieldCheck className={styles.noticeIcon} />
            <div>
              <p className={styles.noticeTitle}>Total enviado para pagamento</p>
              <p className={styles.noticeText}>
                R$ {total.toFixed(2).replace(".", ",")} com estoque reservado no backend.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.actionsRow}>
        <Button
          type="button"
          size="lg"
          variant="outline"
          className={styles.secondaryButton}
          onClick={() => navigate(routes.checkoutStep("address"))}
        >
          Voltar ao endereço
        </Button>
        <Button
          size="lg"
          type="submit"
          className={styles.primaryButton}
          disabled={isCreatingCheckout}
        >
          {isCreatingCheckout ? (
            <>
              <Loader2 className={styles.buttonIconSpin} />
              Criando pagamento...
            </>
          ) : (
            <>
              <ExternalLink className={styles.buttonIcon} />
              Ir para pagamento seguro
            </>
          )}
        </Button>
      </div>
    </form>
  );

  const renderCheckoutResult = () => {
    const isSuccess = checkoutResult === "success";
    const ResultIcon = isSuccess ? CheckCircle2 : XCircle;

    return (
      <div className={styles.checkoutBody}>
        <div className={styles.section}>
          <div className={styles.resultCard}>
            <span
              className={cn(
                styles.resultIconWrap,
                isSuccess ? styles.resultIconSuccess : styles.resultIconFailure,
              )}
            >
              <ResultIcon className={styles.resultIcon} />
            </span>
            <h2 className={styles.resultTitle}>
              {isSuccess ? "Pagamento recebido" : "Pagamento não concluído"}
            </h2>
            <p className={styles.resultText}>
              {isSuccess
                ? "Seu pedido foi criado e a confirmação será sincronizada pelo backend assim que a Stripe enviar o webhook."
                : "A sessão de pagamento foi cancelada ou não foi concluída. Você pode voltar ao pagamento e tentar novamente."}
            </p>
            {checkoutSessionId && (
              <p className={styles.resultSession}>
                Sessão Stripe: {checkoutSessionId}
              </p>
            )}
          </div>
        </div>

        <div className={styles.actionsRow}>
          {isSuccess ? (
            <Button
              size="lg"
              className={styles.primaryButton}
              onClick={() => navigate(routes.home, { replace: true })}
            >
              Voltar para a loja
            </Button>
          ) : (
            <>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className={styles.secondaryButton}
                onClick={() => navigate(routes.cart)}
              >
                Voltar ao carrinho
              </Button>
              <Button
                size="lg"
                className={styles.primaryButton}
                onClick={() => navigate(routes.checkoutStep("payment"))}
              >
                Tentar novamente
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <CheckoutStepper currentStep={currentStepIndex} className={styles.stepper} />

        <div className={cn(styles.layout, checkoutResult && styles.resultLayout)}>
          <section className={styles.checkoutCard}>
            <header className={styles.checkoutHeader}>
              <h1 className={styles.checkoutTitle}>
                {checkoutResult === "success"
                  ? "Pedido recebido"
                  : checkoutResult === "failure"
                    ? "Pagamento não concluído"
                    : stepContent[currentStep].title}
              </h1>
            </header>

            {!checkoutResult && !isLoggedIn && (
              <div className={styles.guestBanner}>
                <LogIn className={styles.guestBannerIcon} />
                <div>
                  <p className={styles.guestBannerTitle}>Login necessário para pagar</p>
                  <p className={styles.guestBannerText}>
                    O pagamento real usa seu perfil para vincular endereço,
                    pedido e confirmação da Stripe.
                  </p>
                </div>
              </div>
            )}

            {checkoutResult && renderCheckoutResult()}
            {!checkoutResult && currentStep === "address" && renderAddressStep()}
            {!checkoutResult && currentStep === "payment" && renderPaymentStep()}
          </section>

          {!checkoutResult && (
          <aside className={styles.summaryCard}>
            <div className={styles.summaryHeader}>
              <h2 className={styles.summaryTitle}>Resumo do pedido</h2>
              <p className={styles.summarySubtitle}>
                {itemCount} itens selecionados
              </p>
            </div>

            <div className={styles.summaryBody}>
              <div className={styles.summaryList}>
                {items.map((item) => (
                  <div key={item.id} className={styles.summaryItem}>
                    <div>
                      <p className={styles.summaryItemName}>{item.name}</p>
                      <p className={styles.summaryItemMeta}>
                        Quantidade: {item.quantity}
                      </p>
                    </div>
                    <span className={styles.summaryPrice}>
                      R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                ))}
              </div>

              <div className={styles.summaryTotals}>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Frete</span>
                  <span>Grátis</span>
                </div>
                <div className={styles.summaryTotalRow}>
                  <span>Total</span>
                  <strong>R$ {total.toFixed(2).replace(".", ",")}</strong>
                </div>
                <div className={styles.summaryRewardRow}>
                  <span>Beauty Points</span>
                  <strong>+{rewardPoints} pts</strong>
                </div>
              </div>

              <div className={styles.summaryPanel}>
                <h3 className={styles.summaryPanelTitle}>Endereço</h3>
                <p className={styles.summaryPanelText}>
                  {addressForm.fullName || "Nenhum destinatário informado"}
                </p>
                <p className={styles.summaryPanelText}>
                  {addressForm.email || "Nenhum e-mail de contato informado"}
                </p>
                <p className={styles.summaryPanelText}>
                  {addressSummary || "Preencha o endereço para visualizá-lo aqui."}
                </p>
                <p className={styles.summaryPanelText}>
                  {[addressForm.city, addressForm.state].filter(Boolean).join(" - ") ||
                    "Cidade / Estado"}
                </p>
              </div>

              <div className={styles.summaryPanel}>
                <h3 className={styles.summaryPanelTitle}>Pagamento</h3>
                <p className={styles.summaryPanelText}>Stripe Checkout</p>
                <p className={styles.summaryPanelText}>
                  O método final será escolhido na página segura da Stripe.
                </p>
              </div>

              <div className={styles.summaryEta}>
                <ShieldCheck className={styles.summaryEtaIcon} />
                <div>
                  <p className={styles.summaryEtaTitle}>Entrega estimada</p>
                  <p className={styles.summaryEtaText}>{estimatedDate}</p>
                  <p className={styles.summaryEtaSmall}>Pedido: {orderNumber}</p>
                </div>
              </div>
            </div>
          </aside>
          )}
        </div>
      </div>
    </div>
  );
}
