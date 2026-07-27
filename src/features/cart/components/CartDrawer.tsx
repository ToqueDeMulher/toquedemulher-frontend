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
import { calculateCartRewardPoints } from "@/features/gamification/lib/gamification-config";
import styles from "./CartDrawer.module.css";

const FREE_SHIPPING_THRESHOLD = 150;
const DEFAULT_SHIPPING_FEE = 15.9;

export function CartDrawer() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    items,
    itemCount,
    subtotal,
    isCartOpen,
    closeCart,
    updateItemQuantity,
    removeItem,
  } = useCart();

  useEffect(() => {
    closeCart();
  }, [location.pathname]);

  const rewardPoints = calculateCartRewardPoints(
    items.map((item) => ({
      price: item.price,
      quantity: item.quantity,
    })),
  );
  const shipping = items.length === 0 || subtotal >= FREE_SHIPPING_THRESHOLD
    ? 0
    : DEFAULT_SHIPPING_FEE;
  const total = subtotal + shipping;
  const freeShippingProgress = Math.min(
    100,
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
  );

  const handleContinueShopping = () => {
    closeCart();
    if (location.pathname !== routes.home) {
      navigate(routes.home);
    }
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
                    : "Escolha seus favoritos e acompanhe as recompensas"}
                </SheetDescription>
              </div>
            </div>
            {itemCount > 0 && <Badge className={styles.countBadge}>{itemCount}</Badge>}
          </div>

          {items.length > 0 && (
            <div className={styles.shippingCard}>
              <div className={styles.shippingHeader}>
                <div>
                  <p className={styles.shippingTitle}>
                    {shipping === 0
                      ? "Frete grátis liberado"
                      : "Quase lá para o frete grátis"}
                  </p>
                  <p className={styles.shippingText}>
                    {shipping === 0
                      ? "Seu pedido já atingiu a faixa de entrega gratuita."
                      : `Faltam R$ ${(FREE_SHIPPING_THRESHOLD - subtotal)
                          .toFixed(2)
                          .replace(".", ",")} para zerar o frete.`}
                  </p>
                </div>
                <span className={styles.shippingValue}>
                  {shipping === 0 ? "GRÁTIS" : "R$ 150"}
                </span>
              </div>
              <Progress value={freeShippingProgress} className={styles.shippingProgress} />
            </div>
          )}
        </SheetHeader>

        <div className={styles.body}>
          {items.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIconWrap}>
                <ShoppingBag className={styles.emptyIcon} />
              </span>
              <div>
                <p className={styles.emptyTitle}>Seu carrinho está vazio</p>
                <p className={styles.emptyText}>
                  Adicione produtos e acompanhe seus pontos no Beauty Club.
                </p>
              </div>
              <Button className={styles.primaryButton} onClick={handleContinueShopping}>
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
                        <p className={styles.itemReward}>
                          <Sparkles className={styles.rewardIcon} />
                          +{calculateCartRewardPoints([
                            { price: item.price, quantity: item.quantity },
                          ])} pts nesta compra
                        </p>
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
                          onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                          aria-label={`Diminuir quantidade de ${item.name}`}
                        >
                          <Minus className={styles.quantityIcon} />
                        </button>
                        <span className={styles.quantityValue}>{item.quantity}</span>
                        <button
                          type="button"
                          className={styles.quantityButton}
                          onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          aria-label={`Aumentar quantidade de ${item.name}`}
                        >
                          <Plus className={styles.quantityIcon} />
                        </button>
                      </div>

                      <div className={styles.priceBlock}>
                        <span className={styles.itemPrice}>
                          R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                        </span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className={styles.itemOriginalPrice}>
                            R$ {(item.originalPrice * item.quantity)
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
                  {shipping === 0
                    ? "Grátis"
                    : `R$ ${shipping.toFixed(2).replace(".", ",")}`}
                </span>
              </div>
              <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                <span>Total</span>
                <strong>R$ {total.toFixed(2).replace(".", ",")}</strong>
              </div>
              <div className={styles.rewardRow}>
                <span>
                  <Sparkles className={styles.rewardSummaryIcon} />
                  Beauty Points
                </span>
                <strong>+{rewardPoints} pts</strong>
              </div>
            </div>

            <div className={styles.actions}>
              <Button className={styles.primaryButton} onClick={handleCheckout}>
                Finalizar compra
                <ArrowRight className={styles.ctaIcon} />
              </Button>
              <Button variant="outline" className={styles.secondaryButton} onClick={handleOpenCartPage}>
                Abrir carrinho completo
              </Button>
              <Button variant="ghost" className={styles.ghostButton} onClick={handleContinueShopping}>
                Continuar comprando
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
