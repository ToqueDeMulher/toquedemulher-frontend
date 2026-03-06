import { useNavigate } from "react-router-dom";
import { cn } from "@/shared/ui/utils";
import { checkoutSteps } from "@/features/cart/lib/checkout-flow";
import styles from "./CheckoutStepper.module.css";

interface CheckoutStepperProps {
  className?: string;
  currentStep?: number;
}

export function CheckoutStepper({
  className,
  currentStep = 0,
}: CheckoutStepperProps) {
  const navigate = useNavigate();
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
                <button
                  type="button"
                  aria-label={`Ir para ${step.label}`}
                  aria-current={isActive ? "step" : undefined}
                  className={styles.stepButton}
                  onClick={() => navigate(step.route)}
                >
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
                </button>
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
