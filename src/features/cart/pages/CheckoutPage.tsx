import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { CheckoutStepper } from "@/features/cart/components/CheckoutStepper";
import { toast } from "sonner";
import { routes } from "@/shared/lib/routes";
import styles from "./CheckoutPage.module.css";

export function CheckoutPage() {
  const navigate = useNavigate();

  const handlePlaceOrder = () => {
    toast.success("Pedido realizado com sucesso!");
    setTimeout(() => {
      navigate(routes.profile);
    }, 2000);
  };

  const itemsTotal = 2924;
  const shipping = 1304;
  const salesTax = 0;
  const total = itemsTotal + shipping + salesTax;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <CheckoutStepper currentStep={1} className={styles.stepper} />
        <section className={styles.checkoutCard}>
          <header className={styles.checkoutHeader}>
            <h1 className={styles.checkoutTitle}>Checkout</h1>
          </header>

          <div className={styles.checkoutBody}>
            <div className={styles.block}>
              <button type="button" className={styles.blockHeader}>
                <span>Deliver to Brazil</span>
                <ChevronRight className={styles.blockChevron} />
              </button>

              <div className={styles.shippingLine}>
                <span className={styles.radioOuter}>
                  <span className={styles.radioInner} />
                </span>
                <div className={styles.shippingText}>
                  <p className={styles.shippingTitle}>Standard - JP¥ 1,304</p>
                  <p className={styles.shippingSub}>
                    15 to 30 business days, with tracking code
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.block}>
              <button type="button" className={styles.blockHeader}>
                <span>Coupon or Influencer / Rewards Code</span>
                <ChevronRight className={styles.blockChevron} />
              </button>
              <Input placeholder="Enter Code" className={styles.couponInput} />
            </div>

            <div className={styles.block}>
              <h2 className={styles.sectionTitle}>Summary</h2>
              <div className={styles.summaryList}>
                <div className={styles.summaryRow}>
                  <span>Items Total (2 pcs)</span>
                  <span>JP¥ {itemsTotal.toLocaleString("en-US")}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Shipping & Handling</span>
                  <span>JP¥ {shipping.toLocaleString("en-US")}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Sales Tax</span>
                  <span>FREE</span>
                </div>
              </div>

              <div className={styles.grandTotalRow}>
                <span>Grand Total</span>
                <strong>JP¥ {total.toLocaleString("en-US")}</strong>
              </div>

              <p className={styles.eta}>Estimated shipping date: Feb. 24, 2026</p>
            </div>
          </div>

          <div className={styles.footer}>
            <Button
              size="lg"
              className={styles.continueButton}
              onClick={handlePlaceOrder}
            >
              CONTINUE
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
