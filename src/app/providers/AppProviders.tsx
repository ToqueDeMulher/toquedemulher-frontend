import { AuthProvider } from "@/shared/contexts/auth-context";
import { CartProvider } from "@/shared/contexts/cart-context";
import { GamificationProvider } from "@/shared/contexts/gamification-context";
import { ThemeProvider } from "@/shared/contexts/theme-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GamificationProvider>
          <CartProvider>{children}</CartProvider>
        </GamificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
