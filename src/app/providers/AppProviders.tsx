import { AuthProvider } from "@/shared/contexts/auth-context";
import { CartProvider } from "@/shared/contexts/cart-context";
import { GamificationProvider } from "@/shared/contexts/gamification-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <GamificationProvider>
        <CartProvider>{children}</CartProvider>
      </GamificationProvider>
    </AuthProvider>
  );
}
