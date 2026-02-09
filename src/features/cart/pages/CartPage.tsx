import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { ProductCard } from "@/features/catalog/components/ProductCard";
import { ImageWithFallback } from "@/shared/ui/ImageWithFallback";
import { toast } from "sonner";
import { routes } from "@/shared/lib/routes";
import { useCart } from "@/shared/contexts/cart-context";
import styles from "./CartPage.module.css";

const cartItems = [
  {
    id: "1",
    name: "Batom Matte Nude Luxo",
    price: 45.9,
    originalPrice: 65.9,
    quantity: 2,
    image: "https://images.unsplash.com/photo-1664165786318-9af861f2a9c3?w=200",
  },
  {
    id: "2",
    name: "Serum Anti-Idade Vitamina C",
    price: 89.9,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1613803745799-ba6c10aace85?w=200",
  },
];

const recommendedProducts = [
  {
    id: "12",
    name: "Removedor de Maquiagem",
    price: 29.9,
    image: "https://images.unsplash.com/photo-1758738880475-dac2ab1c92d4?w=200",
    rating: 5,
    reviews: 45,
  },
  {
    id: "13",
    name: "Esponja de Maquiagem",
    price: 19.9,
    image: "https://images.unsplash.com/photo-1664165786318-9af861f2a9c3?w=200",
    rating: 5,
    reviews: 78,
  },
];

export function CartPage() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [items, setItems] = useState(cartItems);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [zipCode, setZipCode] = useState("");
  const [shipping, setShipping] = useState(0);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const total = subtotal - discount + shipping;
  const freeShippingThreshold = 150;
  const remainingForFreeShipping = Math.max(
    0,
    freeShippingThreshold - subtotal,
  );

  const updateQuantity = (id: string, delta: number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      }),
    );
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
    toast.success("Produto removido do carrinho");
  };

  const applyCoupon = () => {
    if (coupon.toUpperCase() === "BEMVINDA10") {
      setDiscount(subtotal * 0.1);
      toast.success("Cupom aplicado! 10% de desconto");
    } else {
      toast.error("Cupom invalido");
    }
  };

  const calculateShipping = () => {
    if (zipCode.length === 8) {
      const calculatedShipping = subtotal >= freeShippingThreshold ? 0 : 15.9;
      setShipping(calculatedShipping);
      if (calculatedShipping === 0) {
        toast.success("Frete gratis aplicado!");
      } else {
        toast.success(`Frete: R$ ${calculatedShipping.toFixed(2)}`);
      }
    } else {
      toast.error("CEP invalido");
    }
  };

  if (items.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.emptyWrap}>
            <ShoppingBag className={styles.emptyIcon} />
            <h2 className={styles.emptyTitle}>Seu carrinho esta vazio</h2>
            <p className={styles.emptyText}>
              Adicione produtos incriveis ao seu carrinho!
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
        <h1 className={styles.pageTitle}>Carrinho de Compras</h1>

        {remainingForFreeShipping > 0 && (
          <div
            className={`${styles.freeShippingNotice} ${styles.freeShippingPending}`}
          >
            <p
              className={`${styles.freeShippingText} ${styles.freeShippingPendingText}`}
            >
              Faltam R$ {remainingForFreeShipping.toFixed(2)} para ganhar {""}
              <strong>FRETE GRATIS</strong>!
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
              Parabens! Voce ganhou <strong>FRETE GRATIS</strong>!
            </p>
          </div>
        )}

        <div className={styles.grid}>
          <div className={styles.itemsColumn}>
            {items.map((item) => (
              <div key={item.id} className={styles.itemCard}>
                <div className={styles.itemRow}>
                  <div className={styles.itemImageWrap}>
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className={styles.itemImage}
                    />
                  </div>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemHeader}>
                      <h3 className={styles.itemTitle}>{item.name}</h3>
                      <button
                        onClick={() => removeItem(item.id)}
                        className={styles.removeButton}
                      >
                        <Trash2 className={styles.removeIcon} />
                      </button>
                    </div>
                    <div className={styles.priceRow}>
                      <span className={styles.price}>
                        R$ {item.price.toFixed(2).replace(".", ",")}
                      </span>
                      {item.originalPrice && (
                        <span className={styles.originalPrice}>
                          R$ {item.originalPrice.toFixed(2).replace(".", ",")}
                        </span>
                      )}
                    </div>
                    <div className={styles.quantityRow}>
                      <div className={styles.quantityControls}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className={styles.quantityIcon} />
                        </Button>
                        <span className={styles.quantityValue}>
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className={styles.quantityIcon} />
                        </Button>
                      </div>
                      <p className={styles.lineTotal}>
                        R${" "}
                        {(item.price * item.quantity)
                          .toFixed(2)
                          .replace(".", ",")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.summaryColumn}>
            <div className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Resumo do Pedido</h2>

              <div className={styles.summarySection}>
                <label className={styles.summaryLabel}>Cupom de Desconto</label>
                <div className={styles.summaryRow}>
                  <Input
                    placeholder="Digite o cupom"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    className={styles.summaryInput}
                  />
                  <Button
                    onClick={applyCoupon}
                    variant="outline"
                    className={styles.summaryButton}
                  >
                    Aplicar
                  </Button>
                </div>
              </div>

              <div className={styles.summarySection}>
                <label className={styles.summaryLabel}>Calcular Frete</label>
                <div className={styles.summaryRow}>
                  <Input
                    placeholder="CEP"
                    value={zipCode}
                    onChange={(e) =>
                      setZipCode(e.target.value.replace(/\D/g, ""))
                    }
                    maxLength={8}
                    className={styles.summaryInput}
                  />
                  <Button
                    onClick={calculateShipping}
                    variant="outline"
                    className={styles.summaryButton}
                  >
                    OK
                  </Button>
                </div>
              </div>

              <div className={styles.breakdown}>
                <div className={styles.breakdownRow}>
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
                </div>
                {discount > 0 && (
                  <div className={styles.breakdownHighlight}>
                    <span>Desconto</span>
                    <span>- R$ {discount.toFixed(2).replace(".", ",")}</span>
                  </div>
                )}
                {shipping > 0 && (
                  <div className={styles.breakdownRow}>
                    <span>Frete</span>
                    <span>R$ {shipping.toFixed(2).replace(".", ",")}</span>
                  </div>
                )}
                {shipping === 0 && zipCode && (
                  <div className={styles.breakdownHighlight}>
                    <span>Frete</span>
                    <span>Gratis</span>
                  </div>
                )}
              </div>

              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Total</span>
                <span className={styles.totalValue}>
                  R$ {total.toFixed(2).replace(".", ",")}
                </span>
              </div>

              <Button
                size="lg"
                variant="default"
                className={styles.checkoutButton}
                onClick={() => navigate(routes.checkout)}
              >
                Finalizar Compra
              </Button>
              <Button
                variant="outline"
                size="lg"
                className={styles.continueButton}
                onClick={() => navigate(routes.home)}
              >
                Continuar Comprando
              </Button>
            </div>
          </div>
        </div>

        <div className={styles.recommendSection}>
          <h2 className={styles.recommendTitle}>Voce tambem pode gostar</h2>
          <div className={styles.recommendGrid}>
            {recommendedProducts.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onAddToCart={() => addItem(1)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
