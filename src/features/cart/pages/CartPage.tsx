import { ShippingOptions } from "@/features/cart/components/ShippingOptions";
import { useShippingQuote } from "@/features/cart/hooks/use-shipping-quote";
import { shippingDeadline } from "@/features/cart/api/shipping-service";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Minus,
  Plus,
  ShoppingBag,
  Package,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { CheckoutStepper } from "@/features/cart/components/CheckoutStepper";
import { ImageWithFallback } from "@/shared/ui/ImageWithFallback";
import { EmptyState } from "@/shared/ui/empty-state";
import { toast } from "sonner";
import { routes } from "@/app/router/paths";
import { useCart } from "@/features/cart/context/cart-context";
import { useFavorites } from "@/features/catalog/hooks/use-favorites";
import { Progress } from "@/shared/ui/progress";
import styles from "./CartPage.module.css";

const FREE_SHIPPING_THRESHOLD = 150;

export function CartPage() {
  const navigate = useNavigate();
  const { addFavorite } = useFavorites();
  const {
    items,
    itemCount,
    subtotal: localSubtotal,
    updateItemQuantity,
    removeItem,
    shippingQuote,
    shippingService,
    clearShippingQuote,
  } = useCart();
  const [zipCode, setZipCode] = useState(shippingQuote?.postal_code ?? "");
  const {
    calculate,
    cancel,
    loading: shippingLoading,
    error: shippingError,
  } = useShippingQuote();
  const isShippingCalculated = Boolean(
    shippingQuote && shippingQuote.postal_code === zipCode && shippingService,
  );
  const subtotal = isShippingCalculated
    ? shippingQuote!.subtotal
    : localSubtotal;
  const discount = 0;
  const shipping = isShippingCalculated ? shippingService!.price : 0;
  const total = subtotal + shipping;
  function getQuotedItemPrice(item: { name: string; price: number }) {
    return isShippingCalculated
      ? (shippingQuote?.item_prices?.find((price) => price.name === item.name)
          ?.unit_price ?? item.price)
      : item.price;
  }

  const remainingForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - subtotal,
  );
  const shippingSummary = isShippingCalculated
    ? shipping === 0
      ? "GRÁTIS"
      : `R$ ${shipping.toFixed(2).replace(".", ",")}`
    : "Calcular";
  const estimatedShippingDate = isShippingCalculated
    ? shippingDeadline(shippingService!) + " após postagem"
    : "Calcule o prazo pelo CEP";
  const handleRemoveItem = (productId: string) => {
    removeItem(productId);
    toast.success("Produto removido do carrinho");
  };

  const calculateShipping = () => {
    void calculate(zipCode);
  };

  if (items.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <EmptyState
            icon={ShoppingBag}
            title="Seu carrinho está vazio"
            description="Um novo ritual começa com uma escolha. Encontre os produtos que combinam com você."
            action={
              <Button
                size="lg"
                variant="default"
                onClick={() => navigate(routes.category("maquiagem"))}
              >
                Continuar Comprando
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.pageHeading}>
          <div>
            <span>ESCOLHIDOS POR VOCÊ</span>
            <h1>Seu carrinho.</h1>
            <p>
              {itemCount}{" "}
              {itemCount === 1
                ? "item para o seu ritual"
                : "itens para o seu ritual"}
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate(routes.category("maquiagem"))}
          >
            <ArrowLeft size={15} /> Continuar comprando
          </Button>
        </div>
        <CheckoutStepper currentStep={0} className={styles.stepper} />
        <div className={styles.layout}>
          <section className={styles.cartCard}>
            <div className={styles.cartHeader}>
              <h2 className={styles.cartTitle}>Sua seleção</h2>
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
                      Faltam R${" "}
                      {remainingForFreeShipping.toFixed(2).replace(".", ",")}{" "}
                      para ganhar <strong>FRETE GRÁTIS</strong>!
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
                      <Package
                        className={styles.freeShippingIcon}
                        aria-hidden="true"
                      />
                      Parabéns! Você ganhou <strong>FRETE GRÁTIS</strong>!
                    </p>
                  </div>
                )}
              </div>

              <div className={styles.section}>
                <Progress
                  value={Math.min(
                    100,
                    (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
                  )}
                  className={styles.shippingProgress}
                  aria-label="Progresso para frete grátis"
                />
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
                              R${" "}
                              {getQuotedItemPrice(item)
                                .toFixed(2)
                                .replace(".", ",")}
                            </span>
                            {item.originalPrice && (
                              <span className={styles.originalPrice}>
                                R${" "}
                                {item.originalPrice
                                  .toFixed(2)
                                  .replace(".", ",")}
                              </span>
                            )}
                          </div>
                          {item.originalPrice && (
                            <p className={styles.itemOfferLine}>
                              {Math.round(
                                (1 - item.price / item.originalPrice) * 100,
                              )}
                              % OFF
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
                              <Minus
                                className={styles.quantityIcon}
                                aria-hidden="true"
                              />
                            </Button>
                            <span
                              className={styles.quantityValue}
                              aria-live="polite"
                            >
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
                              <Plus
                                className={styles.quantityIcon}
                                aria-hidden="true"
                              />
                            </Button>
                          </div>
                          <p className={styles.lineTotal}>
                            R${" "}
                            {(getQuotedItemPrice(item) * item.quantity)
                              .toFixed(2)
                              .replace(".", ",")}
                          </p>
                          <div className={styles.itemActions}>
                            <button
                              type="button"
                              className={styles.itemActionLink}
                              onClick={() => {
                                if (addFavorite(item.id)) {
                                  removeItem(item.id);
                                  toast.success(
                                    "Produto movido para seus favoritos",
                                  );
                                }
                              }}
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
                </div>
              </div>
            </div>
          </section>

          <aside className={styles.summaryColumn}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <h2 className={styles.summaryTitle}>Resumo do pedido</h2>
              </div>
              <div className={styles.summaryBody}>
                <div className={styles.summarySection}>
                  <h3 className={styles.summarySectionTitle}>
                    Entrega e valores
                  </h3>
                  <div className={styles.summaryZipRow}>
                    <Input
                      id="cart-zip-code"
                      placeholder="00000-000"
                      aria-label="CEP para calcular a entrega"
                      value={zipCode}
                      onChange={(e) => {
                        cancel();
                        clearShippingQuote();
                        setZipCode(
                          e.target.value.replace(/\D/g, "").slice(0, 8),
                        );
                      }}
                      maxLength={8}
                      inputMode="numeric"
                      className={styles.summaryInput}
                    />
                    <Button
                      type="button"
                      onClick={calculateShipping}
                      isLoading={shippingLoading}
                      variant="outline"
                      className={styles.summaryButton}
                    >
                      {shippingLoading ? "Consultando..." : "Calcular"}
                    </Button>
                  </div>

                  {shippingError && (
                    <p role="alert" className={styles.summaryShippingSub}>
                      {shippingError}
                    </p>
                  )}
                  <ShippingOptions />
                  <div className={styles.breakdown} aria-live="polite">
                    <div className={styles.breakdownRow}>
                      <span>Subtotal ({itemCount} itens)</span>
                      <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
                    </div>
                    {discount > 0 && (
                      <div className={styles.breakdownHighlight}>
                        <span>Desconto</span>
                        <span>
                          - R$ {discount.toFixed(2).replace(".", ",")}
                        </span>
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
                    <span className={styles.totalLabel}>
                      {isShippingCalculated ? "Total" : "Subtotal sem frete"}
                    </span>
                    <span className={styles.totalValue}>
                      R$ {total.toFixed(2).replace(".", ",")}
                    </span>
                  </div>

                  <p className={styles.summaryEta}>
                    {isShippingCalculated
                      ? `Prazo estimado: ${estimatedShippingDate}.`
                      : "Informe seu CEP para estimar a entrega. O valor final será confirmado no checkout."}
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
                  Continuar para entrega <ArrowRight size={17} />
                </Button>
                <p className={styles.checkoutNote}>
                  <ShieldCheck size={14} /> Seus dados tratados com cuidado
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
