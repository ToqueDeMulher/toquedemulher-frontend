import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import {
  MapPin,
  ShieldCheck,
  Truck,
  WalletCards,
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
import { useAuth } from "@/shared/contexts/auth-context";
import { useCart } from "@/shared/contexts/cart-context";
import { routes } from "@/shared/lib/routes";
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

type PaymentMethod = "card" | "pix" | "boleto";

type PaymentFormState = {
  method: PaymentMethod;
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  cpf: string;
  installments: string;
};

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

function formatZipCode(zipCode: string) {
  if (zipCode.length <= 5) return zipCode;
  return `${zipCode.slice(0, 5)}-${zipCode.slice(5, 8)}`;
}

function formatPhone(phone: string) {
  if (phone.length <= 2) return phone ? `(${phone}` : "";
  if (phone.length <= 7) return `(${phone.slice(0, 2)}) ${phone.slice(2)}`;
  return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7, 11)}`;
}

function formatCardNumber(cardNumber: string) {
  return cardNumber
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
}

function formatExpiry(expiry: string) {
  const digits = expiry.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hasMissingAddressField(addressForm: AddressFormState) {
  return REQUIRED_ADDRESS_FIELDS.some((field) => {
    if (field === "email") return !isValidEmail(addressForm.email.trim());
    if (field === "zipCode") return addressForm.zipCode.length !== 8;
    if (field === "phone") return addressForm.phone.length < 10;
    return addressForm[field].trim().length === 0;
  });
}

function isCardPaymentValid(paymentForm: PaymentFormState) {
  return !(
    paymentForm.cardName.trim().length === 0 ||
    paymentForm.cardNumber.replace(/\D/g, "").length !== 16 ||
    paymentForm.expiry.replace(/\D/g, "").length !== 4 ||
    paymentForm.cvv.replace(/\D/g, "").length < 3 ||
    paymentForm.cpf.replace(/\D/g, "").length !== 11
  );
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
  const { isLoggedIn } = useAuth();
  const { items, itemCount, subtotal, reset } = useCart();
  const currentStep = normalizeCheckoutFlowStep(step);

  const [addressForm, setAddressForm] = useState<AddressFormState>({
    fullName: "",
    email: "",
    zipCode: "",
    phone: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    reference: "",
  });
  const [paymentForm, setPaymentForm] = useState<PaymentFormState>({
    method: "card",
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    cpf: "",
    installments: "1x sem juros",
  });
  const [orderNumber] = useState(createOrderNumber);
  const isAddressComplete = !hasMissingAddressField(addressForm);
  const isPaymentComplete =
    paymentForm.method === "card" ? isCardPaymentValid(paymentForm) : true;

  if (step !== undefined && step !== currentStep) {
    return <Navigate to={routes.checkoutStep(currentStep)} replace />;
  }

  if (currentStep === "payment" && !isAddressComplete) {
    return <Navigate to={routes.checkoutStep("address")} replace />;
  }

  if (currentStep === "confirmation" && !isAddressComplete) {
    return <Navigate to={routes.checkoutStep("address")} replace />;
  }

  if (currentStep === "confirmation" && !isPaymentComplete) {
    return <Navigate to={routes.checkoutStep("payment")} replace />;
  }

  if (items.length === 0) {
    return <Navigate to={routes.cart} replace />;
  }

  const shipping = 0;
  const total = subtotal + shipping;
  const estimatedDate = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(addBusinessDays(new Date(), 7));
  const currentStepIndex = getCheckoutStepIndex(currentStep);
  const addressSummary = [
    addressForm.street,
    addressForm.number,
    addressForm.complement,
  ]
    .filter(Boolean)
    .join(", ");

  const updateAddressField = (field: keyof AddressFormState, value: string) => {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
  };

  const updatePaymentField = (field: keyof PaymentFormState, value: string) => {
    setPaymentForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (hasMissingAddressField(addressForm)) {
      toast.error("Preencha os campos obrigatórios com dados válidos.");
      return;
    }

    toast.success("Endereço salvo. Agora escolha a forma de pagamento.");
    navigate(routes.checkoutStep("payment"));
  };

  const handlePaymentSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (paymentForm.method === "card" && !isCardPaymentValid(paymentForm)) {
      toast.error("Preencha os dados do cartão corretamente.");
      return;
    }

    toast.success("Pagamento revisado. Confira os dados e finalize o pedido.");
    navigate(routes.checkoutStep("confirmation"));
  };

  const handleFinishOrder = () => {
    const contactEmail = addressForm.email.trim();

    reset();
    toast.success(
      !isLoggedIn && contactEmail
        ? `Pedido confirmado! Vamos enviar as atualizações para ${contactEmail}.`
        : "Pedido confirmado com sucesso!",
    );
    navigate(routes.home, { replace: true });
  };

  const renderAddressStep = () => (
    <form className={styles.checkoutBody} onSubmit={handleAddressSubmit}>
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
            />
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
            />
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
            />
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
            />
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
            />
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
            />
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
            />
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
            />
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
        <Button size="lg" type="submit" className={styles.primaryButton}>
          Continuar para pagamento
        </Button>
      </div>
    </form>
  );

  const renderPaymentStep = () => (
    <form className={styles.checkoutBody} onSubmit={handlePaymentSubmit}>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIconWrap}>
            <WalletCards className={styles.sectionIcon} />
          </span>
          <div>
            <h2 className={styles.sectionTitle}>Forma de pagamento</h2>
            <p className={styles.sectionText}>
              Escolha o método e preencha os dados apenas se necessário.
            </p>
          </div>
        </div>

        <div className={styles.methodGrid}>
          {[
            { id: "card", label: "Cartão de crédito" },
            { id: "pix", label: "Pix" },
            { id: "boleto", label: "Boleto" },
          ].map((method) => (
            <button
              key={method.id}
              type="button"
              className={cn(
                styles.methodButton,
                paymentForm.method === method.id && styles.methodButtonActive,
              )}
              onClick={() =>
                updatePaymentField("method", method.id as PaymentMethod)
              }
            >
              {method.label}
            </button>
          ))}
        </div>

        {paymentForm.method === "card" ? (
          <div className={styles.formGrid}>
            <div className={styles.fullField}>
              <Label htmlFor="cardName" className={styles.fieldLabel}>
                Nome impresso no cartão
              </Label>
              <Input
                id="cardName"
                value={paymentForm.cardName}
                onChange={(event) =>
                  updatePaymentField("cardName", event.target.value)
                }
                className={styles.fieldInput}
                placeholder="Como aparece no cartão"
              />
            </div>

            <div className={styles.fullField}>
              <Label htmlFor="cardNumber" className={styles.fieldLabel}>
                Número do cartão
              </Label>
              <Input
                id="cardNumber"
                value={formatCardNumber(paymentForm.cardNumber)}
                onChange={(event) =>
                  updatePaymentField(
                    "cardNumber",
                    event.target.value.replace(/\D/g, "").slice(0, 16),
                  )
                }
                className={styles.fieldInput}
                placeholder="0000 0000 0000 0000"
              />
            </div>

            <div>
              <Label htmlFor="expiry" className={styles.fieldLabel}>
                Validade
              </Label>
              <Input
                id="expiry"
                value={formatExpiry(paymentForm.expiry)}
                onChange={(event) =>
                  updatePaymentField("expiry", event.target.value)
                }
                className={styles.fieldInput}
                placeholder="MM/AA"
              />
            </div>

            <div>
              <Label htmlFor="cvv" className={styles.fieldLabel}>
                CVV
              </Label>
              <Input
                id="cvv"
                value={paymentForm.cvv}
                onChange={(event) =>
                  updatePaymentField(
                    "cvv",
                    event.target.value.replace(/\D/g, "").slice(0, 4),
                  )
                }
                className={styles.fieldInput}
                placeholder="123"
              />
            </div>

            <div>
              <Label htmlFor="cpf" className={styles.fieldLabel}>
                CPF do titular
              </Label>
              <Input
                id="cpf"
                value={paymentForm.cpf}
                onChange={(event) =>
                  updatePaymentField(
                    "cpf",
                    event.target.value.replace(/\D/g, "").slice(0, 11),
                  )
                }
                className={styles.fieldInput}
                placeholder="00000000000"
              />
            </div>

            <div>
              <Label htmlFor="installments" className={styles.fieldLabel}>
                Parcelamento
              </Label>
              <Input
                id="installments"
                value={paymentForm.installments}
                onChange={(event) =>
                  updatePaymentField("installments", event.target.value)
                }
                className={styles.fieldInput}
                placeholder="1x sem juros"
              />
            </div>
          </div>
        ) : (
          <div className={styles.noticeCard}>
            <ShieldCheck className={styles.noticeIcon} />
            <div>
              <p className={styles.noticeTitle}>
                {paymentForm.method === "pix" ? "Pix" : "Boleto"} selecionado
              </p>
              <p className={styles.noticeText}>
                {paymentForm.method === "pix"
                  ? "O QR Code será exibido na próxima etapa, junto da confirmação do pedido."
                  : "O boleto será gerado após a confirmação final e poderá ser pago pelo banco ou app."}
              </p>
            </div>
          </div>
        )}
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
        <Button size="lg" type="submit" className={styles.primaryButton}>
          Revisar pedido
        </Button>
      </div>
    </form>
  );

  const renderConfirmationStep = () => (
    <div className={styles.checkoutBody}>
      <div className={styles.section}>
        <div className={styles.confirmationCard}>
          <span className={styles.confirmationIconWrap}>
            <ShieldCheck className={styles.confirmationIcon} />
          </span>
          <h2 className={styles.confirmationTitle}>Tudo pronto para finalizar</h2>
          <p className={styles.confirmationText}>
            Revise o endereço, o pagamento e confirme seu pedido. Você pode
            voltar pelas etapas no stepper quando quiser.
          </p>
        </div>

        <div className={styles.confirmationGrid}>
          <div className={styles.confirmationPanel}>
            <h3 className={styles.confirmationPanelTitle}>Entrega</h3>
            <p className={styles.confirmationPanelText}>
              {addressForm.fullName || "Nome do destinatário"}
            </p>
            <p className={styles.confirmationPanelText}>
              {addressForm.email || "E-mail de contato ainda não informado"}
            </p>
            <p className={styles.confirmationPanelText}>
              {addressSummary || "Endereço ainda não preenchido"}
            </p>
            <p className={styles.confirmationPanelText}>
              {[addressForm.neighborhood, addressForm.city, addressForm.state]
                .filter(Boolean)
                .join(" - ") || "Cidade / Estado"}
            </p>
          </div>

          <div className={styles.confirmationPanel}>
            <h3 className={styles.confirmationPanelTitle}>Pagamento</h3>
            <p className={styles.confirmationPanelText}>
              {paymentForm.method === "card"
                ? "Cartão de crédito"
                : paymentForm.method === "pix"
                  ? "Pix"
                  : "Boleto"}
            </p>
            <p className={styles.confirmationPanelText}>
              {paymentForm.method === "card"
                ? paymentForm.cardNumber
                  ? `Final ${paymentForm.cardNumber.slice(-4)}`
                  : "Cartão ainda não informado"
                : "Pagamento será gerado após a finalização"}
            </p>
            <p className={styles.confirmationPanelText}>
              Prazo estimado: {estimatedDate}
            </p>
          </div>
        </div>
      </div>

      <div className={styles.actionsRow}>
        <Button
          type="button"
          size="lg"
          variant="outline"
          className={styles.secondaryButton}
          onClick={() => navigate(routes.checkoutStep("payment"))}
        >
          Voltar ao pagamento
        </Button>
        <Button size="lg" className={styles.primaryButton} onClick={handleFinishOrder}>
          Finalizar pedido
        </Button>
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <CheckoutStepper currentStep={currentStepIndex} className={styles.stepper} />

        <div className={styles.layout}>
          <section className={styles.checkoutCard}>
            <header className={styles.checkoutHeader}>
              <h1 className={styles.checkoutTitle}>{stepContent[currentStep].title}</h1>
            </header>

            {!isLoggedIn && (
              <div className={styles.guestBanner}>
                <ShieldCheck className={styles.guestBannerIcon} />
                <div>
                  <p className={styles.guestBannerTitle}>Checkout sem login</p>
                  <p className={styles.guestBannerText}>
                    Você pode concluir a compra como visitante. Precisamos apenas
                    dos dados de entrega, contato e pagamento.
                  </p>
                </div>
              </div>
            )}

            {currentStep === "address" && renderAddressStep()}
            {currentStep === "payment" && renderPaymentStep()}
            {currentStep === "confirmation" && renderConfirmationStep()}
          </section>

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
                <p className={styles.summaryPanelText}>
                  {paymentForm.method === "card"
                    ? "Cartão de crédito"
                    : paymentForm.method === "pix"
                      ? "Pix"
                      : "Boleto"}
                </p>
                <p className={styles.summaryPanelText}>
                  {paymentForm.method === "card" && paymentForm.cardNumber
                    ? `Final ${paymentForm.cardNumber.slice(-4)}`
                    : "Ainda não configurado"}
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
        </div>
      </div>
    </div>
  );
}
