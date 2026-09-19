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
                  aria-label={
                    isCompleted
                      ? `Voltar para ${step.label}`
                      : `${step.label}${isActive ? ", etapa atual" : ""}`
                  }
                  aria-current={isActive ? "step" : undefined}
                  className={cn(
                    styles.stepButton,
                    isActive && styles.stepButtonActive,
                  )}
                  onClick={() => isCompleted && navigate(step.route)}
                  disabled={!isCompleted}
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
                  <span className={styles.stepText}>
                    <span className={styles.stepNumber}>Etapa {index + 1}</span>
                    <span className={styles.stepLabel}>{step.label}</span>
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
