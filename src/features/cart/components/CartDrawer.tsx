import { useCatalog } from "@/features/catalog/context/catalog-context";
import { CatalogFeedback } from "@/features/catalog/components/CatalogFeedback";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { ImageWithFallback } from "@/shared/ui/ImageWithFallback";
import { routes } from "@/app/router/paths";
import { useCart } from "@/features/cart/context/cart-context";
import styles from "./CartDrawer.module.css";



export function CartDrawer() {
  const navigate = useNavigate();
  const { freeShippingThreshold, loading, error } = useCatalog();
  const location = useLocation();
  const {
    items,
    ready,
    itemCount,
    subtotal: localSubtotal,
    shippingQuote,
    shippingService,
    isCartOpen,
    closeCart,
    updateItemQuantity,
    removeItem,
  } = useCart();

  useEffect(() => {
    closeCart();
  }, [location.pathname]);

  const subtotal = shippingQuote?.subtotal ?? localSubtotal;
  const shipping = shippingService?.price ?? 0;
  const total = subtotal + shipping;
  function getQuotedItemPrice(item: { id: string; price: number }) {
    return Boolean(shippingQuote)
      ? (shippingQuote?.item_prices?.find((price) => price.id === item.id)
          ?.unit_price ?? item.price)
      : item.price;
  }

  const freeShippingEligible = freeShippingThreshold !== null && subtotal >= freeShippingThreshold;
  const freeShippingProgress = Math.min(
    100,
    (subtotal / (freeShippingThreshold ?? 1)) * 100,
  );

  const handleContinueShopping = () => {
    closeCart();
    if (!items.length) navigate(routes.category("maquiagem"));
  };

  const handleOpenCartPage = () => {
    closeCart();
    navigate(routes.cart);
  };

  const handleCheckout = () => {
    closeCart();
    navigate(routes.checkout);
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent side="right" className={styles.content}>
        <SheetHeader className={styles.header}>
          <div className={styles.headerTop}>
            <div className={styles.titleRow}>
              <span className={styles.iconWrap}>
                <ShoppingBag className={styles.headerIcon} />
              </span>
              <div>
                <SheetTitle className={styles.title}>Meu carrinho</SheetTitle>
                <SheetDescription className={styles.description}>
                  {itemCount > 0
                    ? `${itemCount} ${itemCount === 1 ? "item selecionado" : "itens selecionados"}`
                    : "Escolha seus próximos favoritos"}
                </SheetDescription>
              </div>
            </div>
            {itemCount > 0 && (
              <Badge className={styles.countBadge}>{itemCount}</Badge>
            )}
          </div>

          {items.length > 0 && freeShippingThreshold && (
            <div className={styles.shippingCard}>
              <div className={styles.shippingHeader}>
                <div>
                  <p className={styles.shippingTitle}>
                    {freeShippingEligible
                      ? shippingService?.price === 0 ? "Entrega gratuita confirmada" : "Valor mínimo atingido"
                      : "Quase lá para o frete grátis"}
                  </p>
                  <p className={styles.shippingText}>
                    {freeShippingEligible
                      ? "Confira a opção disponível na cotação do seu CEP."
                      : `Faltam R$ ${((freeShippingThreshold ?? 0) - subtotal)
                          .toFixed(2)
                          .replace(".", ",")} para atingir o valor mínimo. Consulte o CEP.`}
                  </p>
                </div>
                <span className={styles.shippingValue}>
                  {shippingService?.price === 0 ? "GRÁTIS" : `R$ ${freeShippingThreshold}`}
                </span>
              </div>
              <Progress
                value={freeShippingProgress}
                className={styles.shippingProgress}
              />
            </div>
          )}
        </SheetHeader>

        <div className={styles.body}>
          {loading || error ? <CatalogFeedback /> : items.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIconWrap}>
                <ShoppingBag className={styles.emptyIcon} />
              </span>
              <div>
                <p className={styles.emptyTitle}>Seu carrinho está vazio</p>
                <p className={styles.emptyText}>
                  Explore o catálogo e escolha seus próximos favoritos.
                </p>
              </div>
              <Button
                className={styles.primaryButton}
                onClick={handleContinueShopping}
              >
                Explorar produtos
              </Button>
            </div>
          ) : (
            <div className={styles.itemList}>
              {items.map((item) => (
                <div key={item.id} className={styles.itemCard}>
                  <div className={styles.itemMedia}>
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className={styles.itemImage}
                    />
                  </div>

                  <div className={styles.itemContent}>
                    <div className={styles.itemMeta}>
                      <div>
                        <p className={styles.itemName}>{item.name}</p>
                        <p className={styles.itemReward}>{!item.available ? "Produto indisponível" : item.quantity > item.stockQuantity ? "Ajuste a quantidade ao estoque disponível" : "Em estoque"}</p>
                      </div>
                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remover ${item.name} do carrinho`}
                      >
                        <Trash2 className={styles.removeIcon} />
                      </button>
                    </div>

                    <div className={styles.itemFooter}>
                      <div className={styles.quantityControls}>
                        <button
                          type="button"
                          className={styles.quantityButton}
                          onClick={() =>
                            updateItemQuantity(item.id, item.quantity - 1)
                          }
                          aria-label={`Diminuir quantidade de ${item.name}`}
                        >
                          <Minus className={styles.quantityIcon} />
                        </button>
                        <span
                          className={styles.quantityValue}
                          aria-live="polite"
                        >
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className={styles.quantityButton}
                          onClick={() =>
                            updateItemQuantity(item.id, item.quantity + 1)
                          }
                          disabled={!item.available || item.quantity >= Math.min(item.stockQuantity, 100)}
                          aria-label={`Aumentar quantidade de ${item.name}`}
                        >
                          <Plus className={styles.quantityIcon} />
                        </button>
                      </div>

                      <div className={styles.priceBlock}>
                        <span className={styles.itemPrice}>
                          R${" "}
                          {(getQuotedItemPrice(item) * item.quantity)
                            .toFixed(2)
                            .replace(".", ",")}
                        </span>
                        {item.originalPrice &&
                          item.originalPrice > item.price && (
                            <span className={styles.itemOriginalPrice}>
                              R${" "}
                              {(item.originalPrice * item.quantity)
                                .toFixed(2)
                                .replace(".", ",")}
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Frete</span>
                <span>
                  {shippingService
                    ? shipping === 0
                      ? "Grátis"
                      : `R$ ${shipping.toFixed(2).replace(".", ",")}`
                    : "Calcular no carrinho"}
                </span>
              </div>
              <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                <span>Total estimado</span>
                <strong>R$ {total.toFixed(2).replace(".", ",")}</strong>
              </div>

            </div>

            <div className={styles.actions}>
              <Button className={styles.primaryButton} disabled={!ready} onClick={handleCheckout}>
                Finalizar compra
                <ArrowRight className={styles.ctaIcon} />
              </Button>
              <Button
                variant="outline"
                className={styles.secondaryButton}
                onClick={handleOpenCartPage}
              >
                Abrir carrinho completo
              </Button>
              <Button
                variant="ghost"
                className={styles.ghostButton}
                onClick={handleContinueShopping}
              >
                Continuar comprando
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
