import {
  CreditCard,
  MapPin,
  Package,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";
import { routes } from "@/shared/lib/routes";

export type CheckoutStepId = "cart" | "address" | "payment" | "confirmation";
export type CheckoutFlowStepId = Exclude<CheckoutStepId, "cart">;

export type CheckoutStep = {
  id: CheckoutStepId;
  icon: LucideIcon;
  label: string;
  route: string;
};

export const checkoutSteps: CheckoutStep[] = [
  {
    id: "cart",
    icon: ShoppingCart,
    label: "Carrinho",
    route: routes.cart,
  },
  {
    id: "address",
    icon: MapPin,
    label: "Endereco",
    route: routes.checkoutStep("address"),
  },
  {
    id: "payment",
    icon: CreditCard,
    label: "Pagamento",
    route: routes.checkoutStep("payment"),
  },
  {
    id: "confirmation",
    icon: Package,
    label: "Confirmacao",
    route: routes.checkoutStep("confirmation"),
  },
];

export function getCheckoutStepIndex(stepId: CheckoutStepId) {
  return checkoutSteps.findIndex((step) => step.id === stepId);
}

export function normalizeCheckoutFlowStep(
  stepId?: string,
): CheckoutFlowStepId {
  if (stepId === "payment" || stepId === "confirmation") return stepId;
  return "address";
}
