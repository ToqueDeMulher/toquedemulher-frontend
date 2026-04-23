import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Package, ChevronRight } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { CheckoutStepper } from "@/features/cart/components/CheckoutStepper";
import { ImageWithFallback } from "@/shared/ui/ImageWithFallback";
import { toast } from "sonner";
import { routes } from "@/shared/lib/routes";
import { useCart } from "@/shared/contexts/cart-context";
import styles from "./CartPage.module.css";

const CEP_STATE_RANGES = [
  { min: 1000000, max: 19999999, name: "São Paulo" },
  { min: 20000000, max: 28999999, name: "Rio de Janeiro" },
  { min: 29000000, max: 29999999, name: "Espírito Santo" },
  { min: 30000000, max: 39999999, name: "Minas Gerais" },
  { min: 40000000, max: 48999999, name: "Bahia" },
  { min: 49000000, max: 49999999, name: "Sergipe" },
  { min: 50000000, max: 56999999, name: "Pernambuco" },
  { min: 57000000, max: 57999999, name: "Alagoas" },
  { min: 58000000, max: 58999999, name: "Paraíba" },
  { min: 59000000, max: 59999999, name: "Rio Grande do Norte" },
  { min: 60000000, max: 63999999, name: "Ceará" },
  { min: 64000000, max: 64999999, name: "Piauí" },
  { min: 65000000, max: 65999999, name: "Maranhão" },
  { min: 66000000, max: 68899999, name: "Pará" },
  { min: 68900000, max: 68999999, name: "Amapá" },
  { min: 69000000, max: 69299999, name: "Amazonas" },
  { min: 69300000, max: 69399999, name: "Roraima" },
  { min: 69400000, max: 69899999, name: "Amazonas" },
  { min: 69900000, max: 69999999, name: "Acre" },
  { min: 70000000, max: 72799999, name: "Distrito Federal" },
  { min: 72800000, max: 72999999, name: "Goiás" },
  { min: 73000000, max: 73699999, name: "Distrito Federal" },
  { min: 73700000, max: 76799999, name: "Goiás" },
  { min: 76800000, max: 76999999, name: "Rondônia" },
  { min: 77000000, max: 77999999, name: "Tocantins" },
  { min: 78000000, max: 78899999, name: "Mato Grosso" },
  { min: 79000000, max: 79999999, name: "Mato Grosso do Sul" },
  { min: 80000000, max: 87999999, name: "Paraná" },
  { min: 88000000, max: 89999999, name: "Santa Catarina" },
  { min: 90000000, max: 99999999, name: "Rio Grande do Sul" },
] as const;

const BUSINESS_DAYS_FOR_ESTIMATE = 15;
const FREE_SHIPPING_THRESHOLD = 150;
const VALID_COUPON = "BEMVINDA10";

function getStateFromZipCode(zipCode: string) {
  if (zipCode.length !== 8) return "Brasil";

  const numericZipCode = Number.parseInt(zipCode, 10);

  if (Number.isNaN(numericZipCode)) return "Brasil";

  const range = CEP_STATE_RANGES.find(
    ({ min, max }) => numericZipCode >= min && numericZipCode <= max,
  );

  return range?.name ?? "Brasil";
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

export function CartPage() {
  const navigate = useNavigate();
  const { items, itemCount, subtotal, updateItemQuantity, removeItem } = useCart();
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [isShippingCalculated, setIsShippingCalculated] = useState(false);

  useEffect(() => {
    if (zipCode.length !== 8 && isShippingCalculated) {
      setIsShippingCalculated(false);
    }
  }, [isShippingCalculated, zipCode]);

  const discount = appliedCoupon === VALID_COUPON ? subtotal * 0.1 : 0;
  const shipping = isShippingCalculated
    ? subtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : 15.9
    : 0;
  const total = subtotal - discount + shipping;
  const remainingForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - subtotal,
  );
  const shippingDestination = getStateFromZipCode(zipCode);
  const shippingSummary = isShippingCalculated
    ? shipping === 0
      ? "GRÁTIS"
      : `R$ ${shipping.toFixed(2).replace(".", ",")}`
    : "Calcular";
  const shippingLineTitle = isShippingCalculated
    ? shipping === 0
      ? "Padrão - GRÁTIS"
      : `Padrão - ${shippingSummary}`
    : "Padrão - Calcular frete";
  const shippingLineSub = isShippingCalculated
    ? "15 a 30 dias úteis, com código de rastreio"
    : "Informe o CEP para calcular frete e prazo.";
  const estimatedShippingDate = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(addBusinessDays(new Date(), BUSINESS_DAYS_FOR_ESTIMATE));

  const handleRemoveItem = (productId: string) => {
    removeItem(productId);
    toast.success("Produto removido do carrinho");
  };

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === VALID_COUPON) {
      setAppliedCoupon(VALID_COUPON);
      toast.success("Cupom aplicado! 10% de desconto");
      return;
    }

    setAppliedCoupon("");
    toast.error("Cupom inválido.");
  };

  const calculateShipping = () => {
    if (zipCode.length === 8) {
      setIsShippingCalculated(true);
      if (subtotal >= FREE_SHIPPING_THRESHOLD) {
        toast.success("Frete grátis aplicado!");
      } else {
        toast.success(`Frete: R$ ${shipping.toFixed(2)}`);
      }
    } else {
      toast.error("CEP inválido.");
    }
  };

  if (items.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.emptyWrap}>
            <ShoppingBag className={styles.emptyIcon} />
            <h2 className={styles.emptyTitle}>Seu carrinho está vazio</h2>
            <p className={styles.emptyText}>
              Adicione produtos incríveis ao seu carrinho!
            </p>
            <Button
              size="lg"
              variant="default"
              className={styles.emptyButton}
              onClick={() => navigate(routes.home)}
            >
              Continuar Comprando
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <CheckoutStepper currentStep={0} className={styles.stepper} />
        <div className={styles.layout}>
          <section className={styles.cartCard}>
            <div className={styles.cartHeader}>
              <h1 className={styles.cartTitle}>Carrinho</h1>
            </div>

            <div className={styles.cartBody}>
              <div className={styles.section}>
                {remainingForFreeShipping > 0 && (
                  <div
                    className={`${styles.freeShippingNotice} ${styles.freeShippingPending}`}
                  >
                    <p
                      className={`${styles.freeShippingText} ${styles.freeShippingPendingText}`}
                    >
                      Faltam R$ {remainingForFreeShipping.toFixed(2)} para ganhar{" "}
                      <strong>FRETE GRÁTIS</strong>!
                    </p>
                  </div>
                )}
                {remainingForFreeShipping === 0 && (
                  <div
                    className={`${styles.freeShippingNotice} ${styles.freeShippingSuccess}`}
                  >
                    <p
                      className={`${styles.freeShippingText} ${styles.freeShippingSuccessText}`}
                    >
                      <Package className={styles.freeShippingIcon} aria-hidden="true" />
                      Parabéns! Você ganhou <strong>FRETE GRÁTIS</strong>!
                    </p>
                  </div>
                )}
              </div>

              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionIconWrap}>
                    <ShoppingBag className={styles.sectionIcon} />
                  </span>
                  <div>
                    <h2 className={styles.sectionTitle}>Itens do pedido</h2>
                    <p className={styles.sectionText}>
                      Ajuste quantidades, salve para depois ou remova itens
                      antes de continuar.
                    </p>
                  </div>
                </div>

                <div className={styles.itemsPanel}>
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className={`${styles.itemCard} ${
                        index < items.length - 1 ? styles.itemCardDivider : ""
                      }`}
                    >
                      <div className={styles.itemMainRow}>
                        <div className={styles.itemImageWrap}>
                          <ImageWithFallback
                            src={item.image}
                            alt={item.name}
                            className={styles.itemImage}
                          />
                        </div>
                        <div className={styles.itemContent}>
                          <div className={styles.itemPriceRow}>
                            <span className={styles.price}>
                              R$ {item.price.toFixed(2).replace(".", ",")}
                            </span>
                            {item.originalPrice && (
                              <span className={styles.originalPrice}>
                                R$ {item.originalPrice.toFixed(2).replace(".", ",")}
                              </span>
                            )}
                          </div>
                          {item.originalPrice && (
                            <p className={styles.itemOfferLine}>
                              {Math.round((1 - item.price / item.originalPrice) * 100)}%
                              OFF
                              <span className={styles.itemOfferTime}>
                                Oferta por tempo limitado
                              </span>
                            </p>
                          )}
                          <div className={styles.itemHeader}>
                            <h3 className={styles.itemTitle}>{item.name}</h3>
                          </div>
                          <p className={styles.itemStockText}>
                            Em estoque - envio rápido
                          </p>
                        </div>
                        <div className={styles.itemSide}>
                          <div className={styles.quantityControls}>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                updateItemQuantity(item.id, item.quantity - 1)
                              }
                              className={styles.quantityButton}
                              aria-label={`Diminuir quantidade de ${item.name}`}
                            >
                              <Minus className={styles.quantityIcon} aria-hidden="true" />
                            </Button>
                            <span className={styles.quantityValue} aria-live="polite">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                updateItemQuantity(item.id, item.quantity + 1)
                              }
                              className={styles.quantityButton}
                              aria-label={`Aumentar quantidade de ${item.name}`}
                            >
                              <Plus className={styles.quantityIcon} aria-hidden="true" />
                            </Button>
                          </div>
                          <p className={styles.lineTotal}>
                            R${" "}
                            {(item.price * item.quantity)
                              .toFixed(2)
                              .replace(".", ",")}
                          </p>
                          <div className={styles.itemActions}>
                            <button
                              type="button"
                              className={styles.itemActionLink}
                              onClick={() => toast.success("Item salvo para depois")}
                            >
                              Salvar
                            </button>
                            <button
                              type="button"
                              className={styles.itemActionLink}
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className={styles.itemGiftRow}
                    onClick={() =>
                      toast.success("Opção de presente registrada para revisão na próxima etapa.")
                    }
                  >
                    <span>Embrulho para presente por apenas R$ 12,90!</span>
                    <ChevronRight className={styles.itemGiftIcon} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          <aside className={styles.summaryColumn}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <h2 className={styles.summaryTitle}>Checkout</h2>
              </div>
              <div className={styles.summaryBody}>
                <div className={styles.summarySection}>
                  <div className={styles.summaryActionHeader}>
                    <span>Envio para {shippingDestination}</span>
                    <ChevronRight className={styles.summaryChevron} aria-hidden="true" />
                  </div>

                  <div className={styles.summaryShippingLine}>
                    <span className={styles.summaryRadioOuter}>
                      <span className={styles.summaryRadioInner} />
                    </span>
                    <div className={styles.summaryShippingText}>
                      <p className={styles.summaryShippingTitle}>
                        {shippingLineTitle}
                      </p>
                      <p className={styles.summaryShippingSub}>{shippingLineSub}</p>
                    </div>
                  </div>
                </div>

                <div className={styles.summarySection}>
                  <div className={styles.summaryActionHeader}>
                    <span>Cupom ou Código de Influenciadora / Recompensas</span>
                    <ChevronRight className={styles.summaryChevron} aria-hidden="true" />
                  </div>

                  <form
                    className={styles.summaryRow}
                    onSubmit={(event) => {
                      event.preventDefault();
                      applyCoupon();
                    }}
                  >
                    <label htmlFor="cart-coupon" className="sr-only">
                      Digite um cupom de desconto
                    </label>
                    <Input
                      id="cart-coupon"
                      placeholder="Digite o cupom"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      className={styles.summaryInput}
                      aria-describedby="cart-coupon-status"
                    />
                    <Button type="submit" variant="outline" className={styles.summaryButton}>
                      Aplicar
                    </Button>
                  </form>
                  <p id="cart-coupon-status" className="sr-only" aria-live="polite">
                    {couponStatus}
                  </p>
                </div>

                <div className={styles.summarySection}>
                  <h3 className={styles.summarySectionTitle}>Sumário</h3>
                  <div className={styles.summaryZipRow}>
                    <Input
                      id="cart-zip-code"
                      placeholder="CEP"
                      value={zipCode}
                      onChange={(e) =>
                        setZipCode(e.target.value.replace(/\D/g, "").slice(0, 8))
                      }
                      maxLength={8}
                      inputMode="numeric"
                      className={styles.summaryInput}
                      aria-describedby="cart-shipping-status"
                    />
                    <Button type="submit" variant="outline" className={styles.summaryButton}>
                      OK
                    </Button>
                  </form>
                  <p id="cart-shipping-status" className="sr-only" aria-live="polite">
                    {shippingStatus}
                  </p>

                  <div className={styles.breakdown} aria-live="polite">
                    <div className={styles.breakdownRow}>
                      <span>Subtotal ({itemCount} itens)</span>
                      <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
                    </div>
                    {discount > 0 && (
                      <div className={styles.breakdownHighlight}>
                        <span>Desconto</span>
                        <span>- R$ {discount.toFixed(2).replace(".", ",")}</span>
                      </div>
                    )}
                    <div
                      className={
                        shipping === 0 && isShippingCalculated
                          ? styles.breakdownHighlight
                          : styles.breakdownRow
                      }
                    >
                      <span>Frete e manuseio</span>
                      <span>{shippingSummary}</span>
                    </div>
                    <div className={styles.breakdownRow}>
                      <span>Taxas</span>
                      <span>GRÁTIS</span>
                    </div>
                  </div>

                  <div className={styles.totalRow}>
                    <span className={styles.totalLabel}>Total</span>
                    <span className={styles.totalValue}>
                      R$ {total.toFixed(2).replace(".", ",")}
                    </span>
                  </div>

                  <p className={styles.summaryEta}>
                    Data estimada de entrega: {estimatedShippingDate}
                  </p>
                </div>
              </div>

              <div className={styles.summaryFooter}>
                <Button
                  size="lg"
                  variant="default"
                  className={styles.checkoutButton}
                  onClick={() => navigate(routes.checkoutStep("address"))}
                >
                  Finalizar Compra
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
