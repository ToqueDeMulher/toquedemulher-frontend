import {
  CreditCard,
  MapPin,
  Package,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/shared/ui/utils";
import styles from "./CheckoutStepper.module.css";

const checkoutSteps: { id: string; icon: LucideIcon }[] = [
  { id: "cart", icon: ShoppingCart },
  { id: "address", icon: MapPin },
  { id: "payment", icon: CreditCard },
  { id: "confirmation", icon: Package },
];

interface CheckoutStepperProps {
  className?: string;
  currentStep?: number;
}

export function CheckoutStepper({
  className,
  currentStep = 0,
}: CheckoutStepperProps) {
  const activeStep = Math.min(
    Math.max(currentStep, 0),
    checkoutSteps.length - 1,
  );

  return (
    <nav
      aria-label="Etapas do checkout"
      className={cn(styles.wrapper, className)}
    >
      <ol className={styles.list}>
        {checkoutSteps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === activeStep;
          const isCompleted = index < activeStep;
          const isLast = index === checkoutSteps.length - 1;

          return (
            <li key={step.id} className={styles.stepItem}>
              <div className={styles.iconRow}>
                <span
                  aria-hidden="true"
                  className={cn(
                    styles.iconCircle,
                    isActive && styles.iconCircleActive,
                    isCompleted && styles.iconCircleCompleted,
                  )}
                >
                  <Icon className={styles.icon} />
                </span>
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      styles.connector,
                      isCompleted && styles.connectorCompleted,
                    )}
                  />
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
