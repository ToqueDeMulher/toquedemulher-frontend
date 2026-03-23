import { AuthProvider } from "@/shared/contexts/auth-context";
import { CartProvider } from "@/shared/contexts/cart-context";
import { ThemeProvider } from "@/shared/contexts/theme-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
